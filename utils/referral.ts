import { v4 as uuid } from "uuid";
import http from "../axios.config";

/**
 * Referral attribution, browser side.
 *
 * A marketing partner gets a link - /r/<code>, or ?ref=<code> on any page. We
 * remember the code for 90 days and hand it back on the signup request, so the
 * account that comes out the other end can be counted against that partner. The
 * parent never sees a code and never types one, which was the whole point of
 * the request.
 *
 * Kept in localStorage rather than a cookie because the API is on a different
 * origin, so a cookie set here would never be sent with the signup call anyway.
 * The tradeoff is that clearing site data loses the attribution, which is why
 * the dashboard treats referred signups as a floor.
 */

const STORAGE_KEY = "ca_referral";
const VISITOR_KEY = "ca_visitor";
const BEACON_KEY = "ca_referral_beacon";

const TTL_DAYS = 90;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

type UtmKey = typeof UTM_KEYS[number];

export interface StoredReferral {
   code: string;
   landingPath: string;
   capturedAt: number;
   utm: Partial<Record<UtmKey, string>>;
}

// Every read and write goes through these. Safari in private mode throws on
// localStorage access rather than returning null, and none of this is worth
// breaking a page over.
function readRaw(key: string): string | null {
   if (typeof window === "undefined") return null;
   try {
      return window.localStorage.getItem(key);
   } catch {
      return null;
   }
}

function writeRaw(key: string, value: string) {
   if (typeof window === "undefined") return;
   try {
      window.localStorage.setItem(key, value);
   } catch {
      // Storage full or blocked. Attribution is lost for this visitor, nothing
      // else changes.
   }
}

export function getVisitorId(): string {
   const existing = readRaw(VISITOR_KEY);
   if (existing) return existing;

   const fresh = uuid();
   writeRaw(VISITOR_KEY, fresh);
   return fresh;
}

export function getReferral(): StoredReferral | null {
   const raw = readRaw(STORAGE_KEY);
   if (!raw) return null;

   try {
      const stored: StoredReferral = JSON.parse(raw);
      if (!stored?.code) return null;
      if (Date.now() - stored.capturedAt > TTL_MS) return null;
      return stored;
   } catch {
      return null;
   }
}

/**
 * Headers for a request that creates an account.
 *
 * Headers and not the body: the backend attaches attribution from allauth's
 * user_signed_up signal, and by the time that fires the request body has been
 * read and is no longer available. See referrals/services.read_code.
 */
export function referralHeaders(): Record<string, string> {
   const stored = getReferral();
   if (!stored) return {};

   return {
      "X-Referral-Code": stored.code,
      "X-Referral-Visitor": getVisitorId(),
   };
}

function readCodeFromUrl(): string {
   if (typeof window === "undefined") return "";
   const params = new URLSearchParams(window.location.search);
   return (params.get("ref") || params.get("referral") || "").trim().toLowerCase();
}

function readUtmFromUrl(): Partial<Record<UtmKey, string>> {
   const utm: Partial<Record<UtmKey, string>> = {};
   if (typeof window === "undefined") return utm;

   const params = new URLSearchParams(window.location.search);
   UTM_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) utm[key] = value;
   });
   return utm;
}

/**
 * Save a code and tell the backend somebody landed.
 *
 * Last click wins, which is the usual affiliate convention - if a parent comes
 * back through a different partner's link, that partner gets the signup.
 */
export function storeReferral(code: string, landingPath?: string): StoredReferral | null {
   const clean = (code || "").trim().toLowerCase();
   if (!clean) return null;

   const stored: StoredReferral = {
      code: clean,
      landingPath: landingPath || (typeof window === "undefined" ? "" : window.location.pathname),
      capturedAt: Date.now(),
      utm: readUtmFromUrl(),
   };

   writeRaw(STORAGE_KEY, JSON.stringify(stored));
   return stored;
}

export function trackVisit(stored: StoredReferral) {
   if (typeof window === "undefined") return;

   // One beacon per code per tab. The backend dedupes on its side too, but
   // there is no reason to make the round trip on every route change.
   const marker = `${stored.code}:${stored.landingPath}`;
   try {
      if (window.sessionStorage.getItem(BEACON_KEY) === marker) return;
      window.sessionStorage.setItem(BEACON_KEY, marker);
   } catch {
      // No session storage, so the beacon goes out again. Harmless.
   }

   http
      .post("/referrals/visit/", {
         code: stored.code,
         visitor_id: getVisitorId(),
         landing_path: stored.landingPath,
         referrer: document.referrer || "",
         ...stored.utm,
      })
      .catch(() => {
         // A missed beacon costs one click in the dashboard. It is not worth a
         // retry and it is definitely not worth an error on the page.
      });
}

/**
 * Called on every route change. Does nothing unless the URL carries a code.
 */
export function captureReferral() {
   const code = readCodeFromUrl();
   if (!code) return;

   const stored = storeReferral(code);
   if (stored) trackVisit(stored);
}
