import type { Env } from "./env";
import type { AccessIdentity } from "./access";

/**
 * Read side for the dashboard. Every endpoint takes the same query string:
 *
 *   from, to   ms since epoch, [from, to)
 *   tzo        viewer's UTC offset in minutes (-420 for PDT), for day buckets
 *   internal   "1" to include traffic marked internal (?ca_internal=1)
 *   country device source medium campaign browser os role entry ref referrer
 *              exact match filters on the session
 *   page       sessions that viewed this path at least once
 *
 * Filters always apply to sessions, and event queries join sessions to pick
 * them up, so a filter means the same thing on every tab.
 */

type Row = Record<string, unknown>;
type Args = (string | number | null)[];

const HOUR = 3_600_000;
const DAY = 86_400_000;

const SESSION_FILTERS: Record<string, string> = {
   country: "s.country",
   region: "s.region",
   city: "s.city",
   device: "s.device",
   browser: "s.browser",
   os: "s.os",
   source: "s.source",
   medium: "s.medium",
   campaign: "s.campaign",
   referrer: "s.referrer",
   role: "s.role",
   entry: "s.entry_path",
   exit: "s.exit_path",
   ref: "s.ref_code",
   lang: "s.lang",
   screen: "s.screen",
};

const DIMENSIONS: Record<string, string> = {
   ...SESSION_FILTERS,
   content: "s.content",
   term: "s.term",
   newret: "CASE WHEN s.is_new = 1 THEN 'New' ELSE 'Returning' END",
   hour: "CAST(((s.start_ts + :tzo) % 86400000) / 3600000 AS INTEGER)",
   weekday: "CAST((((s.start_ts + :tzo) / 86400000) + 4) % 7 AS INTEGER)",
};

interface Q {
   from: number;
   to: number;
   tzo: number; // ms to ADD to a utc timestamp to get local wall time
   params: URLSearchParams;
}

function parseQ(url: URL): Q {
   const now = Date.now();
   const to = Number(url.searchParams.get("to")) || now;
   const from = Number(url.searchParams.get("from")) || to - 7 * DAY;
   // getTimezoneOffset() is minutes BEHIND utc (420 for PDT), so negate.
   const tzo = -Number(url.searchParams.get("tzo") || "0") * 60_000;
   return { from, to, tzo, params: url.searchParams };
}

/** WHERE clause over `sessions s`, without the time window. */
function sessionFilter(q: Q): { sql: string; args: Args } {
   const parts: string[] = [];
   const args: Args = [];
   if (q.params.get("internal") !== "1") parts.push("s.internal = 0");
   for (const [key, col] of Object.entries(SESSION_FILTERS)) {
      const value = q.params.get(key);
      if (value === null || value === "") continue;
      if (value === "(none)") parts.push(`(${col} IS NULL OR ${col} = '')`);
      else {
         parts.push(`${col} = ?`);
         args.push(value);
      }
   }
   const page = q.params.get("page");
   if (page) {
      parts.push("EXISTS (SELECT 1 FROM events pe WHERE pe.sid = s.sid AND pe.type = 'pageview' AND pe.path = ?)");
      args.push(page);
   }
   return { sql: parts.length ? parts.join(" AND ") : "1=1", args };
}

async function all(env: Env, sql: string, args: Args): Promise<Row[]> {
   const res = await env.DB.prepare(sql).bind(...args).all<Row>();
   return res.results || [];
}

async function first(env: Env, sql: string, args: Args): Promise<Row> {
   return (await env.DB.prepare(sql).bind(...args).first<Row>()) || {};
}

function bucketMs(q: Q): number {
   const span = q.to - q.from;
   if (span <= 2 * DAY) return HOUR;
   return DAY;
}

function bucketExpr(col: string, q: Q, size: number): string {
   // Floor to the bucket in local wall time, then back to utc, so a "day"
   // bucket starts at local midnight.
   return `(((${col} + ${q.tzo}) / ${size}) * ${size} - ${q.tzo})`;
}

function likePattern(value: string): { op: string; value: string } {
   if (value.includes("*")) return { op: "LIKE", value: value.replace(/%/g, "\\%").replace(/\*/g, "%") };
   return { op: "=", value };
}

// ---------------------------------------------------------------- overview

async function kpis(env: Env, q: Q, from: number, to: number, goal: string) {
   const f = sessionFilter(q);
   const row = await first(
      env,
      `SELECT COUNT(*) AS sessions,
              COUNT(DISTINCT s.vid) AS visitors,
              COUNT(DISTINCT s.uid) AS users,
              COALESCE(SUM(s.pageviews), 0) AS pageviews,
              COALESCE(SUM(s.clicks), 0) AS clicks,
              AVG(CASE WHEN s.pageviews <= 1 AND s.engaged_ms < 10000 THEN 1.0 ELSE 0 END) AS bounce,
              AVG(s.end_ts - s.start_ts) AS duration,
              AVG(s.engaged_ms) AS engaged,
              AVG(s.pageviews) AS pps,
              COALESCE(SUM(s.is_new), 0) AS new_visitors
         FROM sessions s
        WHERE s.start_ts >= ? AND s.start_ts < ? AND ${f.sql}`,
      [from, to, ...f.args],
   );
   const conv = await first(
      env,
      `SELECT COUNT(*) AS conversions, COUNT(DISTINCT e.vid) AS converters
         FROM events e JOIN sessions s ON s.sid = e.sid
        WHERE e.ts >= ? AND e.ts < ? AND e.type = 'custom' AND e.name = ? AND ${f.sql}`,
      [from, to, goal, ...f.args],
   );
   return { ...row, ...conv };
}

async function overview(env: Env, q: Q) {
   const goal = q.params.get("goal") || "signup_completed";
   const span = q.to - q.from;
   const size = bucketMs(q);
   const f = sessionFilter(q);

   const [current, previous, series, prevSeries, live] = await Promise.all([
      kpis(env, q, q.from, q.to, goal),
      kpis(env, q, q.from - span, q.from, goal),
      all(
         env,
         `SELECT ${bucketExpr("s.start_ts", q, size)} AS b,
                 COUNT(DISTINCT s.vid) AS visitors, COUNT(*) AS sessions, SUM(s.pageviews) AS pageviews
            FROM sessions s
           WHERE s.start_ts >= ? AND s.start_ts < ? AND ${f.sql}
           GROUP BY b ORDER BY b`,
         [q.from, q.to, ...f.args],
      ),
      all(
         env,
         `SELECT ${bucketExpr("s.start_ts", q, size)} AS b, COUNT(DISTINCT s.vid) AS visitors
            FROM sessions s
           WHERE s.start_ts >= ? AND s.start_ts < ? AND ${f.sql}
           GROUP BY b ORDER BY b`,
         [q.from - span, q.from, ...f.args],
      ),
      first(env, `SELECT COUNT(DISTINCT vid) AS live FROM sessions WHERE end_ts > ? AND internal = 0`, [Date.now() - 5 * 60_000]),
   ]);
   const annotations = await all(env, `SELECT id, ts, text, created_by FROM annotations WHERE ts >= ? AND ts < ? ORDER BY ts`, [q.from, q.to]);
   return { current, previous, series, prevSeries, bucket: size, live: live.live || 0, goal, annotations };
}

// --------------------------------------------------------------- breakdown

async function breakdown(env: Env, q: Q) {
   const dim = q.params.get("dim") || "source";
   const expr = (DIMENSIONS[dim] || DIMENSIONS.source).replace(/:tzo/g, String(q.tzo));
   const goal = q.params.get("goal") || "signup_completed";
   const limit = Math.min(Number(q.params.get("limit") || "50"), 500);
   const f = sessionFilter(q);
   const rows = await all(
      env,
      `SELECT COALESCE(NULLIF(${expr}, ''), '(none)') AS k,
              COUNT(DISTINCT s.vid) AS visitors,
              COUNT(*) AS sessions,
              SUM(s.pageviews) AS pageviews,
              AVG(CASE WHEN s.pageviews <= 1 AND s.engaged_ms < 10000 THEN 1.0 ELSE 0 END) AS bounce,
              AVG(s.engaged_ms) AS engaged,
              SUM(EXISTS (SELECT 1 FROM events g WHERE g.sid = s.sid AND g.type = 'custom' AND g.name = ?)) AS conversions
         FROM sessions s
        WHERE s.start_ts >= ? AND s.start_ts < ? AND ${f.sql}
        GROUP BY k ORDER BY visitors DESC, sessions DESC LIMIT ?`,
      [goal, q.from, q.to, ...f.args, limit],
   );
   return { dim, rows };
}

// ------------------------------------------------------------------- pages

async function pages(env: Env, q: Q) {
   const f = sessionFilter(q);
   const [rows, entries, exits] = await Promise.all([
      all(
         env,
         `SELECT e.path AS path,
                 SUM(e.type = 'pageview') AS views,
                 COUNT(DISTINCT CASE WHEN e.type = 'pageview' THEN e.vid END) AS visitors,
                 SUM(e.type = 'click') AS clicks,
                 SUM(e.type = 'rage') AS rage,
                 SUM(e.type = 'error') AS errors,
                 AVG(CASE WHEN e.type = 'scroll' THEN e.value END) AS scroll,
                 AVG(CASE WHEN e.type = 'engage' THEN e.value END) AS engaged
            FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND e.ts < ? AND ${f.sql}
           GROUP BY e.path HAVING views > 0
           ORDER BY views DESC LIMIT 300`,
         [q.from, q.to, ...f.args],
      ),
      all(
         env,
         `SELECT s.entry_path AS path, COUNT(*) AS n,
                 SUM(CASE WHEN s.pageviews <= 1 AND s.engaged_ms < 10000 THEN 1 ELSE 0 END) AS bounces
            FROM sessions s WHERE s.start_ts >= ? AND s.start_ts < ? AND ${f.sql} GROUP BY s.entry_path`,
         [q.from, q.to, ...f.args],
      ),
      all(
         env,
         `SELECT s.exit_path AS path, COUNT(*) AS n
            FROM sessions s WHERE s.start_ts >= ? AND s.start_ts < ? AND ${f.sql} GROUP BY s.exit_path`,
         [q.from, q.to, ...f.args],
      ),
   ]);
   const entryMap = new Map(entries.map((r) => [r.path, r]));
   const exitMap = new Map(exits.map((r) => [r.path, r.n as number]));
   return {
      rows: rows.map((r) => {
         const en = entryMap.get(r.path) as Row | undefined;
         const entriesN = (en?.n as number) || 0;
         return {
            ...r,
            entries: entriesN,
            bounce: entriesN ? ((en?.bounces as number) || 0) / entriesN : null,
            exits: exitMap.get(r.path) || 0,
            exit_rate: (r.views as number) ? (exitMap.get(r.path) || 0) / (r.views as number) : null,
         };
      }),
   };
}

// ------------------------------------------------------------------ clicks

async function clicks(env: Env, q: Q) {
   const f = sessionFilter(q);
   const path = q.params.get("path");
   const pathSql = path ? "AND e.path = ?" : "";
   const pathArgs: Args = path ? [path] : [];

   const [top, rage, dead, outbound, views] = await Promise.all([
      all(
         env,
         `SELECT e.path, e.el, e.label, MAX(e.href) AS href, COUNT(*) AS clicks, COUNT(DISTINCT e.vid) AS visitors
            FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND e.ts < ? AND e.type = 'click' AND (e.name IS NULL OR e.name <> 'dead') ${pathSql} AND ${f.sql}
           GROUP BY e.path, e.el, e.label ORDER BY clicks DESC LIMIT 200`,
         [q.from, q.to, ...pathArgs, ...f.args],
      ),
      all(
         env,
         `SELECT e.path, e.el, e.label, COUNT(*) AS n, COUNT(DISTINCT e.sid) AS sessions
            FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND e.ts < ? AND e.type = 'rage' ${pathSql} AND ${f.sql}
           GROUP BY e.path, e.el, e.label ORDER BY n DESC LIMIT 50`,
         [q.from, q.to, ...pathArgs, ...f.args],
      ),
      all(
         env,
         `SELECT e.path, e.el, e.label, COUNT(*) AS n, COUNT(DISTINCT e.sid) AS sessions
            FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND e.ts < ? AND e.type = 'click' AND e.name = 'dead' ${pathSql} AND ${f.sql}
           GROUP BY e.path, e.el, e.label ORDER BY n DESC LIMIT 50`,
         [q.from, q.to, ...pathArgs, ...f.args],
      ),
      all(
         env,
         `SELECT e.href, COUNT(*) AS n, COUNT(DISTINCT e.vid) AS visitors
            FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND e.ts < ? AND e.type = 'outbound' ${pathSql} AND ${f.sql}
           GROUP BY e.href ORDER BY n DESC LIMIT 50`,
         [q.from, q.to, ...pathArgs, ...f.args],
      ),
      all(
         env,
         `SELECT e.path, COUNT(DISTINCT e.vid) AS visitors
            FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND e.ts < ? AND e.type = 'pageview' AND ${f.sql}
           GROUP BY e.path`,
         [q.from, q.to, ...f.args],
      ),
   ]);
   const pv = new Map(views.map((r) => [r.path, r.visitors as number]));
   return {
      top: top.map((r) => ({ ...r, ctr: pv.get(r.path) ? (r.visitors as number) / (pv.get(r.path) as number) : null })),
      rage,
      dead,
      outbound,
   };
}

async function heatmap(env: Env, q: Q) {
   const path = q.params.get("path") || "/";
   const device = q.params.get("hdevice") || "desktop";
   const range = device === "mobile" ? [0, 767] : device === "tablet" ? [768, 1099] : [1100, 100000];
   const f = sessionFilter(q);
   const [points, scroll, height] = await Promise.all([
      all(
         env,
         `SELECT e.x, e.y, e.type FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND e.ts < ? AND e.path = ? AND e.type IN ('click', 'rage')
             AND e.x IS NOT NULL AND e.vw BETWEEN ? AND ? AND ${f.sql}
           LIMIT 20000`,
         [q.from, q.to, path, range[0], range[1], ...f.args],
      ),
      all(
         env,
         `SELECT CAST(MIN(e.value, 100) / 10 AS INTEGER) * 10 AS band, COUNT(*) AS n
            FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND e.ts < ? AND e.path = ? AND e.type = 'scroll' AND e.vw BETWEEN ? AND ? AND ${f.sql}
           GROUP BY band ORDER BY band`,
         [q.from, q.to, path, range[0], range[1], ...f.args],
      ),
      first(
         env,
         `SELECT AVG(e.dh) AS dh, AVG(e.vw) AS vw FROM events e
           WHERE e.ts >= ? AND e.ts < ? AND e.path = ? AND e.type = 'pageview' AND e.dh IS NOT NULL AND e.vw BETWEEN ? AND ?`,
         [q.from, q.to, path, range[0], range[1]],
      ),
   ]);
   return { path, device, points, scroll, dh: height.dh || 3000, vw: height.vw || (device === "mobile" ? 390 : device === "tablet" ? 820 : 1440) };
}

// --------------------------------------------------------------- retention

async function retention(env: Env, q: Q) {
   const unit = q.params.get("unit") === "day" ? DAY : q.params.get("unit") === "month" ? 30 * DAY : 7 * DAY;
   const by = q.params.get("by") === "users" ? "users" : "visitors";
   const internal = q.params.get("internal") === "1" ? "" : "AND internal = 0";
   const periods = Math.min(Number(q.params.get("periods") || "12"), 26);
   const off = q.tzo;
   // Weeks start Monday. Epoch day 0 was a Thursday, so shift by 3 days.
   const shift = unit === 7 * DAY ? 3 * DAY : 0;

   const cohortSql =
      by === "users"
         ? `SELECT uid AS id, MIN(start_ts) AS f FROM sessions WHERE uid IS NOT NULL ${internal} GROUP BY uid`
         : `SELECT vid AS id, first_ts AS f FROM visitors WHERE 1=1 ${internal}`;
   const idCol = by === "users" ? "uid" : "vid";

   const extra: string[] = [];
   const args: Args = [];
   for (const key of ["country", "device", "source"]) {
      const v = q.params.get(key);
      if (!v) continue;
      // Cohort membership is decided by the first session.
      extra.push(`c.id IN (SELECT ${idCol} FROM sessions WHERE ${key} = ? AND is_new = 1)`);
      args.push(v);
   }

   const rows = await all(
      env,
      `WITH c AS (SELECT id, (f + ${off} + ${shift}) / ${unit} AS cb FROM (${cohortSql}) WHERE f >= ? AND f < ?),
            a AS (SELECT DISTINCT ${idCol} AS id, (start_ts + ${off} + ${shift}) / ${unit} AS ab FROM sessions WHERE start_ts >= ? AND ${idCol} IS NOT NULL ${internal})
       SELECT c.cb AS cb, a.ab - c.cb AS k, COUNT(DISTINCT c.id) AS n
         FROM c JOIN a ON a.id = c.id AND a.ab >= c.cb
        WHERE a.ab - c.cb <= ? ${extra.length ? "AND " + extra.join(" AND ") : ""}
        GROUP BY c.cb, k ORDER BY c.cb, k`,
      [q.from, q.to, q.from, periods, ...args],
   );

   const cohorts = new Map<number, number[]>();
   for (const r of rows) {
      const cb = r.cb as number;
      if (!cohorts.has(cb)) cohorts.set(cb, []);
      (cohorts.get(cb) as number[])[r.k as number] = r.n as number;
   }
   const table = [...cohorts.entries()].map(([cb, counts]) => ({
      start: cb * unit - off - shift,
      size: counts[0] || 0,
      counts: Array.from({ length: periods + 1 }, (_, i) => counts[i] ?? 0),
   }));

   // Stickiness over the selected window.
   const f = sessionFilter(q);
   const [dau, mau, returning] = await Promise.all([
      first(
         env,
         `SELECT AVG(n) AS dau FROM (SELECT COUNT(DISTINCT s.${idCol}) AS n FROM sessions s
           WHERE s.start_ts >= ? AND s.start_ts < ? AND s.${idCol} IS NOT NULL AND ${f.sql}
           GROUP BY (s.start_ts + ${off}) / ${DAY})`,
         [q.from, q.to, ...f.args],
      ),
      first(
         env,
         `SELECT COUNT(DISTINCT s.${idCol}) AS mau FROM sessions s WHERE s.start_ts >= ? AND s.start_ts < ? AND s.${idCol} IS NOT NULL AND ${f.sql}`,
         [Math.max(q.from, q.to - 30 * DAY), q.to, ...f.args],
      ),
      first(
         env,
         `SELECT AVG(CASE WHEN n > 1 THEN 1.0 ELSE 0 END) AS returning_share, AVG(n) AS sessions_per
            FROM (SELECT COUNT(*) AS n FROM sessions s WHERE s.start_ts >= ? AND s.start_ts < ? AND s.${idCol} IS NOT NULL AND ${f.sql} GROUP BY s.${idCol})`,
         [q.from, q.to, ...f.args],
      ),
   ]);

   return { unit, by, periods, table, dau: dau.dau || 0, mau: mau.mau || 0, ...returning };
}

// ------------------------------------------------------------------ funnel

interface Step {
   kind: "path" | "event" | "click";
   value: string;
}

async function funnel(env: Env, q: Q, steps: Step[]) {
   const scope = q.params.get("scope") === "visitor" ? "vid" : "sid";
   const f = sessionFilter(q);
   const clean = steps.filter((s) => s && s.value).slice(0, 10);
   if (clean.length === 0) return { steps: [] };

   const perStep = await Promise.all(
      clean.map((step) => {
         let cond: string;
         const args: Args = [];
         if (step.kind === "event") {
            cond = "e.type = 'custom' AND e.name = ?";
            args.push(step.value);
         } else if (step.kind === "click") {
            const m = likePattern(step.value);
            cond = `e.type = 'click' AND (e.label ${m.op} ? OR e.el ${m.op} ?)`;
            args.push(m.value, m.value);
         } else {
            const m = likePattern(step.value);
            cond = `e.type = 'pageview' AND e.path ${m.op} ?`;
            args.push(m.value);
         }
         return all(
            env,
            `SELECT e.${scope} AS k, e.ts AS ts FROM events e JOIN sessions s ON s.sid = e.sid
              WHERE e.ts >= ? AND e.ts < ? AND ${cond} AND ${f.sql}
              ORDER BY e.ts LIMIT 200000`,
            [q.from, q.to, ...args, ...f.args],
         );
      }),
   );

   // Walk the steps in order: a key reaches step N at the first time it
   // matches step N after it reached step N-1.
   let reached = new Map<string, number>();
   const out: { kind: string; value: string; count: number; median_ms: number | null }[] = [];
   perStep.forEach((rows, i) => {
      const next = new Map<string, number>();
      const gaps: number[] = [];
      for (const r of rows) {
         const k = r.k as string;
         const ts = r.ts as number;
         if (next.has(k)) continue;
         if (i === 0) next.set(k, ts);
         else {
            const prev = reached.get(k);
            if (prev !== undefined && ts >= prev) {
               next.set(k, ts);
               gaps.push(ts - prev);
            }
         }
      }
      gaps.sort((a, b) => a - b);
      out.push({ ...clean[i], count: next.size, median_ms: gaps.length ? gaps[Math.floor(gaps.length / 2)] : null });
      reached = next;
   });
   return { scope, steps: out };
}

// ------------------------------------------------------------------- paths

async function paths(env: Env, q: Q) {
   const target = q.params.get("path") || "/";
   const f = sessionFilter(q);
   const pv = `SELECT e.sid, e.path,
                      LEAD(e.path) OVER (PARTITION BY e.sid ORDER BY e.ts) AS nxt,
                      LAG(e.path) OVER (PARTITION BY e.sid ORDER BY e.ts) AS prv
                 FROM events e JOIN sessions s ON s.sid = e.sid
                WHERE e.ts >= ? AND e.ts < ? AND e.type = 'pageview' AND ${f.sql}`;
   const [next, prev, journeys] = await Promise.all([
      all(env, `SELECT COALESCE(nxt, '(exit)') AS path, COUNT(*) AS n FROM (${pv}) WHERE path = ? GROUP BY 1 ORDER BY n DESC LIMIT 15`, [
         q.from,
         q.to,
         ...f.args,
         target,
      ]),
      all(env, `SELECT COALESCE(prv, '(entrance)') AS path, COUNT(*) AS n FROM (${pv}) WHERE path = ? GROUP BY 1 ORDER BY n DESC LIMIT 15`, [
         q.from,
         q.to,
         ...f.args,
         target,
      ]),
      all(
         env,
         `SELECT j, COUNT(*) AS n FROM (
             SELECT sid, GROUP_CONCAT(path, ' > ') AS j FROM (
               SELECT e.sid, e.path FROM events e JOIN sessions s ON s.sid = e.sid
                WHERE e.ts >= ? AND e.ts < ? AND e.type = 'pageview' AND ${f.sql}
                ORDER BY e.sid, e.ts)
             GROUP BY sid)
          GROUP BY j ORDER BY n DESC LIMIT 400`,
         [q.from, q.to, ...f.args],
      ),
   ]);

   // Collapse repeats (a > a > b is a > b) and cut to the first five pages so
   // long sessions group with the short ones they started like.
   const merged = new Map<string, number>();
   for (const r of journeys) {
      const parts = String(r.j).split(" > ");
      const compact: string[] = [];
      for (const p of parts) if (compact[compact.length - 1] !== p) compact.push(p);
      const key = compact.slice(0, 5).join(" > ") + (compact.length > 5 ? " > ..." : "");
      merged.set(key, (merged.get(key) || 0) + (r.n as number));
   }
   const top = [...merged.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([j, n]) => ({ journey: j, n }));
   return { path: target, next, prev, journeys: top };
}

// ---------------------------------------------------------- vitals, errors

const VITAL_LIMITS: Record<string, [number, number]> = {
   LCP: [2500, 4000],
   INP: [200, 500],
   CLS: [0.1, 0.25],
   FCP: [1800, 3000],
   TTFB: [800, 1800],
};

function p75(values: number[]): number | null {
   if (!values.length) return null;
   const s = [...values].sort((a, b) => a - b);
   return s[Math.min(s.length - 1, Math.floor(s.length * 0.75))];
}

async function performance(env: Env, q: Q) {
   const f = sessionFilter(q);
   const [vitals, errors] = await Promise.all([
      all(
         env,
         `SELECT e.name, e.path, e.value, s.device FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND e.ts < ? AND e.type = 'vital' AND ${f.sql} LIMIT 100000`,
         [q.from, q.to, ...f.args],
      ),
      all(
         env,
         `SELECT e.label AS message, e.el AS source, COUNT(*) AS n, COUNT(DISTINCT e.sid) AS sessions,
                 MAX(e.ts) AS last_seen, GROUP_CONCAT(DISTINCT e.path) AS paths, MAX(s.browser) AS browser
            FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND e.ts < ? AND e.type = 'error' AND ${f.sql}
           GROUP BY e.label, e.el ORDER BY n DESC LIMIT 100`,
         [q.from, q.to, ...f.args],
      ),
   ]);

   const byName = new Map<string, number[]>();
   const byPage = new Map<string, Map<string, number[]>>();
   for (const r of vitals) {
      const name = r.name as string;
      const v = r.value as number;
      if (!(name in VITAL_LIMITS) || typeof v !== "number") continue;
      if (!byName.has(name)) byName.set(name, []);
      (byName.get(name) as number[]).push(v);
      const path = r.path as string;
      if (!byPage.has(path)) byPage.set(path, new Map());
      const m = byPage.get(path) as Map<string, number[]>;
      if (!m.has(name)) m.set(name, []);
      (m.get(name) as number[]).push(v);
   }
   const summary = Object.keys(VITAL_LIMITS).map((name) => {
      const vals = byName.get(name) || [];
      const [good, poor] = VITAL_LIMITS[name];
      return {
         name,
         p75: p75(vals),
         samples: vals.length,
         good: vals.length ? vals.filter((v) => v <= good).length / vals.length : null,
         poor: vals.length ? vals.filter((v) => v > poor).length / vals.length : null,
         limits: VITAL_LIMITS[name],
      };
   });
   const perPage = [...byPage.entries()]
      .map(([path, m]) => {
         const row: Record<string, unknown> = { path, samples: 0 };
         for (const name of Object.keys(VITAL_LIMITS)) {
            const vals = m.get(name) || [];
            row[name] = p75(vals);
            row.samples = Math.max(row.samples as number, vals.length);
         }
         return row;
      })
      .sort((a, b) => (b.samples as number) - (a.samples as number))
      .slice(0, 40);
   return { summary, perPage, errors };
}

// ----------------------------------------------------------- custom events

async function customEvents(env: Env, q: Q) {
   const f = sessionFilter(q);
   const name = q.params.get("name");
   const list = await all(
      env,
      `SELECT e.name, COUNT(*) AS n, COUNT(DISTINCT e.vid) AS visitors, MAX(e.ts) AS last_seen
         FROM events e JOIN sessions s ON s.sid = e.sid
        WHERE e.ts >= ? AND e.ts < ? AND e.type = 'custom' AND ${f.sql}
        GROUP BY e.name ORDER BY n DESC LIMIT 200`,
      [q.from, q.to, ...f.args],
   );
   let recent: Row[] = [];
   let props: { key: string; value: string; n: number }[] = [];
   if (name) {
      recent = await all(
         env,
         `SELECT e.ts, e.path, e.props, e.vid, e.uid, s.source, s.country, s.device
            FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND e.ts < ? AND e.type = 'custom' AND e.name = ? AND ${f.sql}
           ORDER BY e.ts DESC LIMIT 1000`,
         [q.from, q.to, name, ...f.args],
      );
      const counts = new Map<string, number>();
      for (const r of recent) {
         try {
            const obj = JSON.parse((r.props as string) || "{}");
            for (const [k, v] of Object.entries(obj)) {
               if (v === null || typeof v === "object") continue;
               const key = `${k}\u0000${String(v).slice(0, 80)}`;
               counts.set(key, (counts.get(key) || 0) + 1);
            }
         } catch {
            /* bad props json, skip */
         }
      }
      props = [...counts.entries()]
         .map(([k, n]) => {
            const [key, value] = k.split("\u0000");
            return { key, value, n };
         })
         .sort((a, b) => b.n - a.n)
         .slice(0, 60);
      recent = recent.slice(0, 100);
   }
   return { list, recent, props };
}

// -------------------------------------------------------- visitor explorer

async function visitors(env: Env, q: Q) {
   const search = (q.params.get("q") || "").trim();
   const internal = q.params.get("internal") === "1" ? "" : "AND internal = 0";
   const args: Args = [q.from, q.to];
   let where = "";
   if (search) {
      where = "AND (vid LIKE ? OR uid = ?)";
      args.push(search + "%", search);
   }
   const onlyUsers = q.params.get("users") === "1" ? "AND uid IS NOT NULL" : "";
   const rows = await all(
      env,
      `SELECT vid, uid, role, first_ts, last_ts, sessions, pageviews, first_path, first_source, country, device
         FROM visitors WHERE last_ts >= ? AND first_ts < ? ${internal} ${onlyUsers} ${where}
        ORDER BY last_ts DESC LIMIT 200`,
      args,
   );
   return { rows };
}

async function visitor(env: Env, q: Q) {
   const vid = q.params.get("vid") || "";
   const [row, sessions, events] = await Promise.all([
      first(env, `SELECT * FROM visitors WHERE vid = ?`, [vid]),
      all(env, `SELECT * FROM sessions WHERE vid = ? ORDER BY start_ts DESC LIMIT 100`, [vid]),
      all(
         env,
         `SELECT ts, sid, type, name, path, label, el, href, value, props FROM events
           WHERE vid = ? ORDER BY ts DESC LIMIT 1500`,
         [vid],
      ),
   ]);
   return { visitor: row, sessions, events };
}

// ---------------------------------------------------------------- realtime

async function realtime(env: Env) {
   const now = Date.now();
   const since = now - 30 * 60_000;
   const [active, perMinute, feed, pagesNow, sourcesNow] = await Promise.all([
      first(env, `SELECT COUNT(DISTINCT vid) AS n FROM sessions WHERE end_ts > ? AND internal = 0`, [now - 5 * 60_000]),
      all(
         env,
         `SELECT (e.ts / 60000) * 60000 AS b, SUM(e.type = 'pageview') AS pageviews, COUNT(DISTINCT e.vid) AS visitors
            FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND s.internal = 0 GROUP BY b ORDER BY b`,
         [since],
      ),
      all(
         env,
         `SELECT e.ts, e.type, e.name, e.path, e.label, e.vid, s.country, s.city, s.device, s.source
            FROM events e JOIN sessions s ON s.sid = e.sid
           WHERE e.ts >= ? AND s.internal = 0 AND e.type IN ('pageview', 'click', 'custom', 'rage', 'error', 'outbound', 'form')
           ORDER BY e.ts DESC LIMIT 80`,
         [since],
      ),
      all(
         env,
         `SELECT path, COUNT(*) AS n FROM (
             SELECT e.vid, e.path, ROW_NUMBER() OVER (PARTITION BY e.vid ORDER BY e.ts DESC) AS rn
               FROM events e JOIN sessions s ON s.sid = e.sid
              WHERE e.ts >= ? AND e.type = 'pageview' AND s.internal = 0)
           WHERE rn = 1 GROUP BY path ORDER BY n DESC LIMIT 15`,
         [now - 5 * 60_000],
      ),
      all(
         env,
         `SELECT source, COUNT(DISTINCT vid) AS n FROM sessions WHERE end_ts > ? AND internal = 0 GROUP BY source ORDER BY n DESC LIMIT 10`,
         [now - 5 * 60_000],
      ),
   ]);
   return { active: active.n || 0, perMinute, feed, pagesNow, sourcesNow, now };
}

// ------------------------------------------------------------------ router

function json(data: unknown, status = 200): Response {
   return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
   });
}

export async function handleApi(request: Request, env: Env, who: AccessIdentity): Promise<Response> {
   const url = new URL(request.url);
   const q = parseQ(url);
   const route = url.pathname.replace(/^\/api\//, "");

   try {
      if (request.method === "GET") {
         switch (route) {
            case "me":
               return json({ email: who.email });
            case "overview":
               return json(await overview(env, q));
            case "breakdown":
               return json(await breakdown(env, q));
            case "pages":
               return json(await pages(env, q));
            case "clicks":
               return json(await clicks(env, q));
            case "heatmap":
               return json(await heatmap(env, q));
            case "retention":
               return json(await retention(env, q));
            case "paths":
               return json(await paths(env, q));
            case "performance":
               return json(await performance(env, q));
            case "events":
               return json(await customEvents(env, q));
            case "visitors":
               return json(await visitors(env, q));
            case "visitor":
               return json(await visitor(env, q));
            case "realtime":
               return json(await realtime(env));
            case "funnels":
               return json({ rows: await all(env, `SELECT id, name, steps, created_by FROM funnels ORDER BY name`, []) });
            case "annotations":
               return json({ rows: await all(env, `SELECT id, ts, text, created_by FROM annotations ORDER BY ts DESC LIMIT 500`, []) });
         }
      }

      if (request.method === "POST") {
         const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
         switch (route) {
            case "funnel":
               return json(await funnel(env, q, (body.steps as Step[]) || []));
            case "funnels": {
               const name = String(body.name || "").slice(0, 80);
               const steps = JSON.stringify(((body.steps as Step[]) || []).slice(0, 10));
               if (!name) return json({ error: "name required" }, 400);
               await env.DB.prepare(`INSERT INTO funnels (name, steps, created_by, created_at) VALUES (?, ?, ?, ?)`)
                  .bind(name, steps, who.email, Date.now())
                  .run();
               return json({ ok: true });
            }
            case "annotations": {
               const text = String(body.text || "").slice(0, 200);
               const ts = Number(body.ts) || Date.now();
               if (!text) return json({ error: "text required" }, 400);
               await env.DB.prepare(`INSERT INTO annotations (ts, text, created_by, created_at) VALUES (?, ?, ?, ?)`)
                  .bind(ts, text, who.email, Date.now())
                  .run();
               return json({ ok: true });
            }
         }
      }

      if (request.method === "DELETE") {
         const id = Number(url.searchParams.get("id"));
         if (route === "funnels" && id) {
            await env.DB.prepare(`DELETE FROM funnels WHERE id = ?`).bind(id).run();
            return json({ ok: true });
         }
         if (route === "annotations" && id) {
            await env.DB.prepare(`DELETE FROM annotations WHERE id = ?`).bind(id).run();
            return json({ ok: true });
         }
      }

      return json({ error: "not found" }, 404);
   } catch (err) {
      console.error("api", route, err instanceof Error ? err.message : err);
      return json({ error: err instanceof Error ? err.message : "failed" }, 500);
   }
}
