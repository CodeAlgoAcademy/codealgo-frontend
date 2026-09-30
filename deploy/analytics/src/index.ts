import type { Env } from "./env";
import { isLocalDev, verifyAccess } from "./access";
import { handleApi } from "./api";
import { handleCollect } from "./collect";

const DAY = 86_400_000;

// Served on every admin response. The dashboard only loads its own files
// (Chart.js is vendored in public/vendor), and frames the live site for the click heatmap.
const ADMIN_HEADERS: Record<string, string> = {
   "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-src https://codealgoacademy.com https://www.codealgoacademy.com http://localhost:3000",
      "frame-ancestors 'none'",
   ].join("; "),
   "X-Content-Type-Options": "nosniff",
   "Referrer-Policy": "no-referrer",
   "X-Robots-Tag": "noindex, nofollow",
};

function withHeaders(res: Response, extra: Record<string, string>): Response {
   const out = new Response(res.body, res);
   for (const [k, v] of Object.entries(extra)) out.headers.set(k, v);
   return out;
}

export default {
   async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
      const url = new URL(request.url);
      const host = url.hostname;
      const local = isLocalDev(request, env);

      // The collector. Public, on both hostnames locally, only on e. in prod.
      if (url.pathname === "/e" && (host === env.COLLECT_HOST || local)) {
         return handleCollect(request, env, ctx);
      }
      if (host === env.COLLECT_HOST) return new Response("Not found", { status: 404 });
      if (host !== env.ADMIN_HOST && !local) return new Response("Not found", { status: 404 });

      if (url.pathname === "/robots.txt") return new Response("User-agent: *\nDisallow: /\n");

      const who = await verifyAccess(request, env);
      if (!who) {
         return withHeaders(
            new Response(
               "Forbidden. This dashboard is behind Cloudflare Access. If you are seeing this, the Access application for this hostname is missing or ACCESS_TEAM_DOMAIN / ACCESS_AUD are not set on the Worker.",
               { status: 403 },
            ),
            ADMIN_HEADERS,
         );
      }

      if (url.pathname.startsWith("/api/")) {
         // Writes must come from the dashboard itself. The Access cookie would
         // otherwise ride along on a form post from any other site.
         if (request.method !== "GET" && request.headers.get("Origin") !== url.origin) {
            return new Response("Bad origin", { status: 403 });
         }
         return withHeaders(await handleApi(request, env, who), ADMIN_HEADERS);
      }

      return withHeaders(await env.ASSETS.fetch(request), ADMIN_HEADERS);
   },

   async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
      const days = Math.max(30, Number(env.RETENTION_DAYS) || 395);
      const cutoff = Date.now() - days * DAY;
      // In slices so one run never holds the database for long. Anything left
      // over goes tomorrow.
      ctx.waitUntil(
         (async () => {
            for (let i = 0; i < 50; i++) {
               const res = await env.DB.prepare(`DELETE FROM events WHERE id IN (SELECT id FROM events WHERE ts < ? LIMIT 5000)`).bind(cutoff).run();
               if (!res.meta.changes) break;
            }
         })(),
      );
   },
} satisfies ExportedHandler<Env>;
