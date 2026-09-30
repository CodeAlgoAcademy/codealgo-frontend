import type { Env } from "./env";
import { classifySource, isBot, parseUa } from "./ua";

/**
 * POST /e - the beacon the website sends.
 *
 * Body is JSON sent as text/plain (navigator.sendBeacon or fetch keepalive),
 * which keeps it a CORS "simple request": no preflight, so an event fired on
 * pagehide actually makes it out before the tab is gone.
 *
 * The response is always 204 as soon as the body is parsed. Writing to D1 is
 * pushed into waitUntil so a slow write never holds a visitor's page up.
 */

const MAX_BODY = 64 * 1024;
const MAX_EVENTS = 100;
const TYPES = new Set(["pageview", "click", "rage", "outbound", "scroll", "engage", "form", "error", "vital", "custom"]);
const ID_RE = /^[A-Za-z0-9-]{8,64}$/;

interface RawEvent {
   t: string;
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

interface Batch {
   now: number;
   vid: string;
   sid: string;
   uid?: string | number | null;
   role?: string | null;
   internal?: boolean;
   ctx?: {
      referrer?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
      ref?: string;
      screen?: string;
      lang?: string;
      tz?: string;
   };
   ev: RawEvent[];
}

function str(value: unknown, max: number): string | null {
   if (value === undefined || value === null || value === "") return null;
   const s = String(value);
   return s.length > max ? s.slice(0, max) : s;
}

function num(value: unknown): number | null {
   return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function cleanPath(value: unknown): string {
   const s = String(value || "/").split("?")[0].split("#")[0];
   return (s.startsWith("/") ? s : "/" + s).slice(0, 300);
}

function hostOf(url: string | undefined): string {
   if (!url) return "";
   try {
      return new URL(url).hostname.toLowerCase();
   } catch {
      return "";
   }
}

export function corsHeaders(request: Request, env: Env): Record<string, string> {
   const origin = request.headers.get("Origin") || "";
   const allowed = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
   return allowed.includes(origin)
      ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Max-Age": "86400", Vary: "Origin" }
      : {};
}

export async function handleCollect(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
   const cors = corsHeaders(request, env);
   if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
   if (request.method !== "POST") return new Response("method", { status: 405 });

   // Only our own pages. A missing Origin is allowed through because some
   // browsers drop it on sendBeacon during unload; the payload checks below
   // still apply.
   const origin = request.headers.get("Origin");
   if (origin && !cors["Access-Control-Allow-Origin"]) return new Response("origin", { status: 403 });

   const len = Number(request.headers.get("Content-Length") || "0");
   if (len > MAX_BODY) return new Response("size", { status: 413, headers: cors });

   const ua = request.headers.get("User-Agent") || "";
   if (isBot(ua)) return new Response(null, { status: 204, headers: cors });

   let body: Batch;
   try {
      const text = await request.text();
      if (text.length > MAX_BODY) return new Response("size", { status: 413, headers: cors });
      body = JSON.parse(text);
   } catch {
      return new Response("json", { status: 400, headers: cors });
   }

   if (!body || !ID_RE.test(body.vid || "") || !ID_RE.test(body.sid || "") || !Array.isArray(body.ev)) {
      return new Response("shape", { status: 400, headers: cors });
   }

   ctx.waitUntil(
      ingest(body, request, env).catch((err) => {
         console.error("ingest failed", err instanceof Error ? err.message : err);
      }),
   );
   return new Response(null, { status: 204, headers: cors });
}

async function ingest(body: Batch, request: Request, env: Env) {
   const serverNow = Date.now();
   // Correct for a wrong clock on the visitor's machine. The batch carries the
   // browser's idea of "now", so the skew is whatever that differs from ours.
   const skew = num(body.now) !== null ? serverNow - (body.now as number) : 0;

   const events = body.ev
      .slice(0, MAX_EVENTS)
      .filter((e) => e && TYPES.has(e.t))
      .map((e) => {
         let ts = (num(e.ts) ?? serverNow) + skew;
         if (ts > serverNow + 60_000 || ts < serverNow - 86_400_000) ts = serverNow;
         return { ...e, ts: Math.round(ts), p: cleanPath(e.p) };
      })
      .sort((a, b) => a.ts - b.ts);
   if (events.length === 0) return;

   const cf = (request as unknown as { cf?: IncomingRequestCfProperties }).cf;
   const { device, browser, os } = parseUa(request.headers.get("User-Agent") || "");
   const c = body.ctx || {};
   const refHost = hostOf(c.referrer);
   const { source, medium } = classifySource(refHost, c.utm_source || "", c.utm_medium || "", ["codealgoacademy.com", "localhost"]);

   const uid = str(body.uid, 40);
   const role = str(body.role, 20);
   const internal = body.internal ? 1 : 0;

   const pageviews = events.filter((e) => e.t === "pageview");
   const clicks = events.filter((e) => e.t === "click").length;
   const engaged = events.filter((e) => e.t === "engage").reduce((sum, e) => sum + Math.max(0, Math.min(num(e.v) ?? 0, 1_800_000)), 0);
   const first = events[0];
   const last = events[events.length - 1];
   const entry = pageviews[0]?.p ?? first.p;
   const exit = pageviews.length ? pageviews[pageviews.length - 1].p : null;

   const stmts: D1PreparedStatement[] = [];

   stmts.push(
      env.DB.prepare(
         `INSERT INTO sessions (sid, vid, uid, role, start_ts, end_ts, entry_path, exit_path, pageviews, events, clicks, engaged_ms,
            referrer, source, medium, campaign, content, term, ref_code, country, region, city, device, browser, os, screen, lang, tz, internal, is_new)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29,
            CASE WHEN EXISTS (SELECT 1 FROM visitors WHERE vid = ?2) THEN 0 ELSE 1 END)
          ON CONFLICT(sid) DO UPDATE SET
            uid = COALESCE(excluded.uid, sessions.uid),
            role = COALESCE(excluded.role, sessions.role),
            start_ts = MIN(sessions.start_ts, excluded.start_ts),
            end_ts = MAX(sessions.end_ts, excluded.end_ts),
            exit_path = CASE WHEN excluded.exit_path IS NOT NULL AND excluded.end_ts >= sessions.end_ts THEN excluded.exit_path ELSE sessions.exit_path END,
            pageviews = sessions.pageviews + excluded.pageviews,
            events = sessions.events + excluded.events,
            clicks = sessions.clicks + excluded.clicks,
            engaged_ms = sessions.engaged_ms + excluded.engaged_ms,
            internal = MAX(sessions.internal, excluded.internal)`,
      ).bind(
         body.sid,
         body.vid,
         uid,
         role,
         first.ts,
         last.ts,
         entry,
         exit ?? entry,
         pageviews.length,
         events.length,
         clicks,
         Math.round(engaged),
         refHost || null,
         source,
         medium,
         str(c.utm_campaign, 120),
         str(c.utm_content, 120),
         str(c.utm_term, 120),
         str(c.ref, 60)?.toLowerCase() ?? null,
         str(cf?.country, 4),
         str(cf?.region, 80),
         str(cf?.city, 80),
         device,
         browser,
         os,
         str(c.screen, 20),
         str(c.lang, 20),
         str(c.tz || cf?.timezone, 60),
         internal,
      ),
   );

   const insert = env.DB.prepare(
      `INSERT INTO events (ts, sid, vid, uid, type, name, path, label, el, href, x, y, vw, dh, value, props)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
   );
   for (const e of events) {
      let props: string | null = null;
      if (e.props && typeof e.props === "object") {
         props = JSON.stringify(e.props);
         if (props.length > 2000) props = props.slice(0, 2000);
      }
      const x = num(e.x);
      stmts.push(
         insert.bind(
            e.ts,
            body.sid,
            body.vid,
            uid,
            e.t,
            str(e.n, 80),
            e.p,
            str(e.l, 160),
            str(e.el, 200),
            str(e.h, 400),
            x === null ? null : Math.max(0, Math.min(1, x)),
            num(e.y) === null ? null : Math.round(e.y as number),
            num(e.vw) === null ? null : Math.round(e.vw as number),
            num(e.dh) === null ? null : Math.round(e.dh as number),
            num(e.v),
            props,
         ),
      );
   }

   stmts.push(
      env.DB.prepare(
         `INSERT INTO visitors (vid, uid, role, first_ts, last_ts, sessions, pageviews, first_path, first_source, first_referrer, country, device, internal)
          VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
          ON CONFLICT(vid) DO UPDATE SET
            uid = COALESCE(excluded.uid, visitors.uid),
            role = COALESCE(excluded.role, visitors.role),
            first_ts = MIN(visitors.first_ts, excluded.first_ts),
            last_ts = MAX(visitors.last_ts, excluded.last_ts),
            sessions = (SELECT COUNT(*) FROM sessions WHERE vid = ?1),
            pageviews = visitors.pageviews + excluded.pageviews,
            internal = MAX(visitors.internal, excluded.internal)`,
      ).bind(body.vid, uid, role, first.ts, last.ts, pageviews.length, entry, source, refHost || null, str(cf?.country, 4), device, internal),
   );

   await env.DB.batch(stmts);
}
