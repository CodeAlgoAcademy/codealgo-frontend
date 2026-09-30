import { getReferral, getVisitorId } from "./referral";

/**
 * First party analytics for admin.codealgoacademy.com.
 *
 * Batches events in memory and posts them to the collector Worker
 * (NEXT_PUBLIC_ANALYTICS_URL, e.g. https://e.codealgoacademy.com) every few
 * seconds and whenever the tab is hidden. Nothing here can break a page: every
 * browser API is wrapped, and with the env var unset the whole module is a
 * no-op.
 *
 * What gets recorded:
 *   pageview   every route, with viewport width and page height
 *   click      buttons, links and anything with data-track, with position
 *              for the heatmap. Text of the element, never the value of an
 *              input. Clicks on plain text/images are sent as dead clicks.
 *   rage       3+ clicks in the same spot in under a second
 *   outbound   links to other sites
 *   scroll     deepest point reached on each page, sent when leaving it
 *   engage     focused, visible time on each page (pauses after a minute idle)
 *   form       start (first field focused) and submit, by form id only
 *   error      uncaught errors and rejected promises
 *   vital      LCP, CLS, INP, FCP, TTFB on the first page load
 *   custom     track("name", {props}) from app code
 *
 * Privacy: first party only, no cookies, no fingerprinting, no form values.
 * The visitor id is the same random id the referral code already keeps. The
 * logged in user id and account type are attached so retention can be
 * measured per account, nothing else from the account is sent. Browsers with
 * Global Privacy Control on are not tracked at all, and ?ca_optout=1 turns it
 * off for a browser. ?ca_internal=1 marks a browser as staff so the dashboard
 * can leave it out.
 *
 * Put data-no-track on any element whose text should never be sent, and
 * data-track="name" on one you want a stable name for in the Clicks report.
 */

const ENDPOINT = (process.env.NEXT_PUBLIC_ANALYTICS_URL || "").replace(/\/+$/, "");

const SESSION_KEY = "ca_session";
const INTERNAL_KEY = "ca_internal";
const OPTOUT_KEY = "ca_optout";
const SESSION_IDLE_MS = 30 * 60 * 1000;
const FLUSH_MS = 5000;
const MAX_QUEUE = 25;
const IDLE_MS = 60 * 1000;
const MAX_ERRORS_PER_PAGE = 10;

type EventType = "pageview" | "click" | "rage" | "outbound" | "scroll" | "engage" | "form" | "error" | "vital" | "custom";

interface QueuedEvent {
   t: EventType;
   ts: number;
   p: string;
   n?: string;
   l?: string;
   el?: string;
   h?: string;
   x?: number;
   y?: number;
   vw?: number;
   dh?: number;
   v?: number;
   props?: Record<string, unknown>;
}

interface SessionState {
   id: string;
   last: number;
   ctx: Record<string, string>;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

let started = false;
let enabled = false;
let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let pathResolver: () => string = () => window.location.pathname;

// Per page view.
let currentPath = "";
let maxScroll = 0;
let engagedMs = 0;
let visibleSince = 0;
let lastActivity = 0;
let errorsThisPage = 0;
let formsStarted = new Set<string>();
let recentClicks: { x: number; y: number; t: number }[] = [];
let lastRage = 0;

// ------------------------------------------------------------ small helpers

function safe<T>(fn: () => T, fallback: T): T {
   try {
      return fn();
   } catch {
      return fallback;
   }
}

function read(key: string): string | null {
   return safe(() => window.localStorage.getItem(key), null);
}

function write(key: string, value: string | null) {
   safe(() => {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
   }, undefined);
}

function uuid(): string {
   const c = (window as any).crypto;
   if (c && typeof c.randomUUID === "function") return c.randomUUID();
   return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
      const r = (Math.random() * 16) | 0;
      return (ch === "x" ? r : (r & 0x3) | 0x8).toString(16);
   });
}

function docHeight(): number {
   const d = document.documentElement;
   const b = document.body;
   return Math.max(d.scrollHeight, b ? b.scrollHeight : 0, d.clientHeight);
}

function clip(s: string | null | undefined, max: number): string {
   if (!s) return "";
   const t = s.replace(/\s+/g, " ").trim();
   return t.length > max ? t.slice(0, max) : t;
}

function path(): string {
   return safe(pathResolver, window.location.pathname);
}

// ------------------------------------------------------------ identity

function identity(): { uid: string | null; role: string | null } {
   return safe(
      () => {
         const raw = window.localStorage.getItem("token");
         if (!raw) return { uid: null, role: null };
         const parsed = JSON.parse(raw);
         if (!parsed?.access_token) return { uid: null, role: null };
         const id = parsed?.user?.id;
         return { uid: id ? String(id) : null, role: parsed?.user_type || null };
      },
      { uid: null, role: null },
   );
}

function externalReferrer(): string {
   const ref = safe(() => document.referrer, "");
   if (!ref) return "";
   const host = safe(() => new URL(ref).hostname, "");
   if (!host || host === window.location.hostname || host.endsWith(".codealgoacademy.com") || host === "codealgoacademy.com") return "";
   return ref;
}

/**
 * The visit. Shared across tabs through localStorage, ends after 30 minutes
 * with nothing happening. Arriving from a new campaign starts a new one, same
 * as GA, so the campaign gets the credit for what happens next.
 */
function session(landing: boolean): SessionState {
   const now = Date.now();
   const params = safe(() => new URLSearchParams(window.location.search), new URLSearchParams());
   const utm: Record<string, string> = {};
   UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) utm[k] = v.slice(0, 120);
   });
   const hasCampaign = Object.keys(utm).length > 0;

   let s: SessionState | null = safe(() => JSON.parse(read(SESSION_KEY) || "null"), null);
   const expired = !s || !s.id || now - s.last > SESSION_IDLE_MS;
   const newCampaign = landing && hasCampaign && s && s.ctx.utm_campaign !== utm.utm_campaign;

   if (expired || newCampaign) {
      const referral = getReferral();
      const ctx: Record<string, string> = {
         ...utm,
         referrer: externalReferrer(),
         screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
         lang: safe(() => navigator.language, ""),
         tz: safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone, ""),
      };
      const ref = params.get("ref") || params.get("referral") || referral?.code;
      if (ref) ctx.ref = ref.toLowerCase().slice(0, 60);
      s = { id: uuid(), last: now, ctx };
   } else if (s) {
      s.last = now;
   }
   write(SESSION_KEY, JSON.stringify(s));
   return s as SessionState;
}

// ------------------------------------------------------------ transport

function push(e: Omit<QueuedEvent, "ts" | "p"> & { p?: string }) {
   if (!enabled) return;
   queue.push({ ts: Date.now(), p: path(), ...e });
   if (queue.length >= MAX_QUEUE) flush(false);
   else if (!flushTimer) flushTimer = setTimeout(() => flush(false), FLUSH_MS);
}

function flush(unloading: boolean) {
   if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
   }
   if (!enabled || queue.length === 0) return;
   const events = queue;
   queue = [];

   const s = session(false);
   const { uid, role } = identity();
   const body = JSON.stringify({
      now: Date.now(),
      vid: getVisitorId(),
      sid: s.id,
      uid,
      role,
      internal: read(INTERNAL_KEY) === "1",
      ctx: s.ctx,
      ev: events,
   });
   const url = `${ENDPOINT}/e`;

   // text/plain keeps this a simple CORS request, so there is no preflight to
   // lose when the tab is closing.
   const sent = unloading && safe(() => navigator.sendBeacon(url, new Blob([body], { type: "text/plain" })), false);
   if (sent) return;
   safe(
      () =>
         fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" }, credentials: "omit" }).catch(() => {
            // Lost batch. Analytics is never worth a retry loop on a visitor's machine.
         }),
      undefined,
   );
}

// ------------------------------------------------------------ page lifecycle

function tickEngagement() {
   if (visibleSince) {
      const now = Date.now();
      // Stop counting once nobody has moved for a minute: a tab left open
      // behind other windows is not a minute spent reading.
      const until = Math.min(now, lastActivity + IDLE_MS);
      if (until > visibleSince) engagedMs += until - visibleSince;
      visibleSince = now;
   }
}

function measureScroll() {
   const h = docHeight();
   if (!h) return;
   const depth = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / h) * 100));
   if (depth > maxScroll) maxScroll = depth;
}

function endPage() {
   if (!currentPath) return;
   tickEngagement();
   measureScroll();
   push({ t: "scroll", p: currentPath, v: maxScroll, vw: window.innerWidth, dh: docHeight() });
   if (engagedMs > 0) push({ t: "engage", p: currentPath, v: engagedMs });
   engagedMs = 0;
}

export function trackPageview() {
   if (!enabled) return;
   const next = path();
   if (next === currentPath) return;
   endPage();
   currentPath = next;
   maxScroll = 0;
   engagedMs = 0;
   errorsThisPage = 0;
   formsStarted = new Set();
   visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
   lastActivity = Date.now();
   session(true);
   // Page height is only final after render. The pageview goes out now; the
   // height rides on it from a frame later.
   const ev: QueuedEvent = { t: "pageview", ts: Date.now(), p: next, vw: window.innerWidth, dh: docHeight() };
   queue.push(ev);
   setTimeout(() => {
      ev.dh = docHeight();
      measureScroll();
   }, 1500);
   if (!flushTimer) flushTimer = setTimeout(() => flush(false), FLUSH_MS);
}

// ------------------------------------------------------------ clicks

const INTERACTIVE = "a,button,[role=button],[role=link],[role=tab],[role=menuitem],input[type=submit],input[type=button],input[type=checkbox],input[type=radio],select,summary,label,[data-track]";
const DEAD_TARGETS = new Set(["IMG", "P", "SPAN", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "SVG", "PATH", "STRONG", "EM", "B", "SMALL"]);

function selectorFor(el: Element): string {
   const tag = el.tagName.toLowerCase();
   const track = el.getAttribute("data-track");
   if (track) return `[data-track=${track}]`.slice(0, 200);
   if (el.id) return `${tag}#${el.id}`.slice(0, 200);
   // Tailwind classes say nothing about what the element is, so anchor on the
   // nearest landmark instead.
   const landmark = el.parentElement?.closest("[id],nav,header,footer,form,section,aside,dialog");
   let prefix = "";
   if (landmark) {
      const ltag = landmark.tagName.toLowerCase();
      prefix = landmark.id ? `${ltag}#${landmark.id} ` : `${ltag} `;
   }
   const type = el.getAttribute("type");
   return `${prefix}${tag}${type && tag === "input" ? `[type=${type}]` : ""}`.slice(0, 200);
}

const CONTAINERS = new Set(["BODY", "HTML", "MAIN", "SECTION", "ARTICLE", "HEADER", "FOOTER", "NAV", "FORM"]);

function labelFor(el: Element): string {
   if (el.closest("[data-no-track]")) return "";
   // A click that landed on a layout container would otherwise report the
   // whole section's text.
   if (CONTAINERS.has(el.tagName.toUpperCase())) return "";
   const track = el.getAttribute("data-track");
   if (track) return clip(track, 120);
   const aria = el.getAttribute("aria-label") || el.getAttribute("title");
   if (aria) return clip(aria, 120);
   if (el instanceof HTMLInputElement) {
      if (el.type === "submit" || el.type === "button") return clip(el.value, 120);
      return clip(el.name || el.type, 60);
   }
   if (el instanceof HTMLSelectElement) return clip(el.name || "select", 60);
   const text = clip((el as HTMLElement).innerText || el.textContent, 120);
   if (text) return text;
   const img = el.querySelector("img[alt]");
   return clip(img?.getAttribute("alt"), 120);
}

function onClick(e: MouseEvent) {
   const target = e.target as Element | null;
   if (!target || !(target instanceof Element)) return;
   lastActivity = Date.now();

   const x = e.pageX / Math.max(1, document.documentElement.scrollWidth);
   const y = e.pageY;
   const base = { x: Math.round(x * 10000) / 10000, y, vw: window.innerWidth, dh: docHeight() };

   // Rage: 3 clicks within 800ms, all within 30px of each other.
   const now = Date.now();
   recentClicks = recentClicks.filter((c) => now - c.t < 800);
   recentClicks.push({ x: e.pageX, y: e.pageY, t: now });
   const near = recentClicks.filter((c) => Math.abs(c.x - e.pageX) < 30 && Math.abs(c.y - e.pageY) < 30).length;
   if (near >= 3 && now - lastRage > 2000) {
      lastRage = now;
      const el = target.closest(INTERACTIVE) || target;
      push({ t: "rage", l: labelFor(el), el: selectorFor(el), v: near, ...base });
   }

   const el = target.closest(INTERACTIVE);
   if (!el) {
      if (DEAD_TARGETS.has(target.tagName.toUpperCase())) {
         push({ t: "click", n: "dead", l: labelFor(target), el: selectorFor(target), ...base });
      }
      return;
   }
   // Clicking into a text field is not a click anyone wants in a report.
   if (el instanceof HTMLInputElement && !["submit", "button", "checkbox", "radio"].includes(el.type)) return;

   const href = el instanceof HTMLAnchorElement ? el.href : el.closest("a")?.href || "";
   let outbound = false;
   let cleanHref = "";
   if (href) {
      const u = safe(() => new URL(href, window.location.href), null);
      if (u) {
         outbound = /^https?:$/.test(u.protocol) && u.hostname !== window.location.hostname && !u.hostname.endsWith("codealgoacademy.com");
         cleanHref = outbound ? `${u.origin}${u.pathname}` : u.pathname;
         if (u.protocol === "mailto:" || u.protocol === "tel:") cleanHref = u.protocol;
      }
   }
   const common = { l: labelFor(el), el: selectorFor(el), h: cleanHref || undefined, ...base };
   push({ t: "click", ...common });
   if (outbound) push({ t: "outbound", ...common });
   // Leaving the site: make sure the batch goes before the page does.
   if (outbound) flush(true);
}

// ------------------------------------------------------------ forms

function formName(form: HTMLFormElement): string {
   return clip(form.getAttribute("data-track") || form.id || form.getAttribute("name") || form.getAttribute("aria-label") || selectorFor(form), 80);
}

function onFocusIn(e: FocusEvent) {
   lastActivity = Date.now();
   const t = e.target as Element | null;
   const form = t && t instanceof Element ? t.closest("form") : null;
   if (!form) return;
   const name = formName(form);
   if (formsStarted.has(name)) return;
   formsStarted.add(name);
   push({ t: "form", n: "start", l: name });
}

function onSubmit(e: Event) {
   const form = e.target as HTMLFormElement | null;
   if (!form || !(form instanceof HTMLFormElement)) return;
   push({ t: "form", n: "submit", l: formName(form) });
}

// ------------------------------------------------------------ errors

function onError(ev: ErrorEvent) {
   if (errorsThisPage >= MAX_ERRORS_PER_PAGE) return;
   errorsThisPage++;
   const file = clip((ev.filename || "").replace(window.location.origin, ""), 160);
   push({ t: "error", l: clip(ev.message || "Error", 160), el: file ? `${file}:${ev.lineno || 0}:${ev.colno || 0}` : undefined });
}

function onRejection(ev: PromiseRejectionEvent) {
   if (errorsThisPage >= MAX_ERRORS_PER_PAGE) return;
   const reason: any = ev.reason;
   const msg = reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
   // Axios rejections are handled network errors surfacing as unhandled,
   // mostly auth expiry. They drown the real errors, so skip them.
   if (reason && (reason.isAxiosError || /Request failed with status code/.test(msg))) return;
   errorsThisPage++;
   push({ t: "error", n: "promise", l: clip(msg, 160) });
}

// ------------------------------------------------------------ web vitals

function observeVitals() {
   const PO = (window as any).PerformanceObserver;
   if (!PO) return;
   const vitals: Record<string, number> = {};
   const observe = (type: string, cb: (entries: any[]) => void, extra?: Record<string, unknown>) =>
      safe(() => {
         const po = new PO((list: any) => cb(list.getEntries()));
         po.observe({ type, buffered: true, ...(extra || {}) });
      }, undefined);

   observe("largest-contentful-paint", (entries) => {
      const last = entries[entries.length - 1];
      if (last) vitals.LCP = last.startTime;
   });
   observe("paint", (entries) => {
      entries.forEach((en) => {
         if (en.name === "first-contentful-paint") vitals.FCP = en.startTime;
      });
   });
   // CLS, session windows: shifts less than 1s apart and within 5s group; the
   // worst window counts.
   let windowValue = 0;
   let windowStart = 0;
   let windowLast = 0;
   observe("layout-shift", (entries) => {
      entries.forEach((en) => {
         if (en.hadRecentInput) return;
         if (windowValue && en.startTime - windowLast < 1000 && en.startTime - windowStart < 5000) windowValue += en.value;
         else {
            windowValue = en.value;
            windowStart = en.startTime;
         }
         windowLast = en.startTime;
         vitals.CLS = Math.max(vitals.CLS || 0, windowValue);
      });
   });
   // INP, approximated as the slowest interaction.
   observe(
      "event",
      (entries) => {
         entries.forEach((en) => {
            if (en.interactionId) vitals.INP = Math.max(vitals.INP || 0, en.duration);
         });
      },
      { durationThreshold: 40 },
   );
   const nav: any = safe(() => performance.getEntriesByType("navigation")[0], null);
   if (nav && nav.responseStart > 0) vitals.TTFB = nav.responseStart;

   const firstPath = path();
   let sent = false;
   const send = () => {
      if (sent) return;
      sent = true;
      Object.entries(vitals).forEach(([name, value]) => {
         if (typeof value === "number" && isFinite(value)) push({ t: "vital", n: name, p: firstPath, v: Math.round(value * 1000) / 1000, vw: window.innerWidth });
      });
   };
   // Final values are only known once the page is hidden, or after the first
   // route change in a single page app.
   document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && send(), { once: false });
   setTimeout(send, 60_000);
   vitalsSender = send;
}

let vitalsSender: (() => void) | null = null;

// ------------------------------------------------------------ public API

/**
 * Called once from _app. Safe to call again, and safe on the server.
 * `resolver` returns the path to report, so dynamic routes can be grouped by
 * their pattern (/change-password/[uid]) instead of leaking the token.
 */
export function initAnalytics(resolver?: () => string) {
   if (started || typeof window === "undefined") return;
   started = true;
   if (resolver) pathResolver = resolver;
   if (!ENDPOINT) return;

   const params = safe(() => new URLSearchParams(window.location.search), new URLSearchParams());
   if (params.get("ca_optout") === "1") write(OPTOUT_KEY, "1");
   if (params.get("ca_optout") === "0") write(OPTOUT_KEY, null);
   if (params.get("ca_internal") === "1") write(INTERNAL_KEY, "1");
   if (params.get("ca_internal") === "0") write(INTERNAL_KEY, null);

   // Not in the admin heatmap iframe, not in automation, not when opted out.
   if (safe(() => window.top !== window.self, true)) return;
   if ((navigator as any).webdriver) return;
   if ((navigator as any).globalPrivacyControl === true) return;
   if (read(OPTOUT_KEY) === "1") return;

   enabled = true;

   const activity = () => {
      lastActivity = Date.now();
   };
   let scrollQueued = false;
   window.addEventListener(
      "scroll",
      () => {
         activity();
         if (scrollQueued) return;
         scrollQueued = true;
         setTimeout(() => {
            scrollQueued = false;
            measureScroll();
         }, 250);
      },
      { passive: true },
   );
   ["mousemove", "keydown", "touchstart", "pointerdown"].forEach((ev) => window.addEventListener(ev, activity, { passive: true }));
   document.addEventListener("click", onClick, true);
   document.addEventListener("focusin", onFocusIn, true);
   document.addEventListener("submit", onSubmit, true);
   window.addEventListener("error", onError);
   window.addEventListener("unhandledrejection", onRejection);

   document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
         tickEngagement();
         visibleSince = 0;
         // Send what this page has so far without ending it; it may come back.
         if (engagedMs > 0 && currentPath) {
            push({ t: "engage", p: currentPath, v: engagedMs });
            engagedMs = 0;
         }
         measureScroll();
         flush(true);
      } else {
         visibleSince = Date.now();
         lastActivity = Date.now();
      }
   });
   window.addEventListener("pagehide", () => {
      endPage();
      currentPath = "";
      flush(true);
   });

   observeVitals();
   trackPageview();
}

/** Route change hook for _app. */
export function onRouteChange() {
   if (vitalsSender) {
      // Vitals describe the first, server rendered load. Report them before
      // the SPA moves on, or LCP ends up attributed to the wrong page.
      vitalsSender();
      vitalsSender = null;
   }
   trackPageview();
}

/** Custom event. Keep props flat and small (strings, numbers, booleans). */
export function track(name: string, props?: Record<string, string | number | boolean | null | undefined>) {
   if (typeof window === "undefined" || !enabled) return;
   push({ t: "custom", n: clip(name, 80), props: props || undefined });
}
