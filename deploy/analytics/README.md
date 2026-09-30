# CodeAlgo Analytics

First party web analytics for codealgoacademy.com. One Cloudflare Worker, one
D1 database, a dashboard at **admin.codealgoacademy.com** behind Cloudflare
Access (Zero Trust login), and a collector at **e.codealgoacademy.com** the site
posts events to.

```
browser (utils/siteTracker.ts)
   |  POST /e, text/plain batches every 5s and on tab hide
   v
e.codealgoacademy.com ----\
                           >  codealgo-analytics Worker  --->  D1 codealgo-analytics
admin.codealgoacademy.com -/     |                               events / sessions / visitors
   ^ Cloudflare Access           \-- public/ dashboard + /api/*
```

Nothing here touches Django or the API containers. Tracking load lands on a
Worker and D1, so a busy marketing day costs the classroom API nothing.

## What it tracks

Every pageview, click (with position, for heatmaps), rage click, dead click,
outbound link, scroll depth, engaged time, form start/submit, JS error, Core
Web Vitals (LCP, INP, CLS, FCP, TTFB) and custom events from `track()`.
Logged in users get their numeric user id and account type attached, so
retention works per account and not just per browser.

It does not record form values, keystrokes, or anything from an element marked
`data-no-track`. No cookies. Visitor id is the random `ca_visitor` id the
referral code already keeps. Browsers with Global Privacy Control are skipped.

## Dashboard tabs

| Tab | What it answers |
| --- | --- |
| Overview | Visitors, sessions, pageviews, bounce, engaged time, conversions, live count, all vs the previous period. Notes can be pinned to dates. |
| Realtime | Who is on the site right now, which page, from where. Auto refreshes. |
| Acquisition | Source / medium / campaign / referrer / partner `?ref=` code / landing page, each with conversion rate. |
| Audience | Country, region, city, device, browser, OS, screen, language, account type, new vs returning, hour of day, weekday. |
| Pages | Views, engaged time, scroll depth, entrances, bounce, exit rate, clicks, rage clicks, JS errors per page. |
| Clicks | Most clicked elements with CTR, rage clicks, dead clicks, outbound links. |
| Heatmaps | Click heatmap and scroll map over the live page, per device width. |
| Journeys | Where people came from and went next for any page, plus the most common paths. |
| Events | Custom events and a breakdown of their properties. |
| Funnels | Build, run and save funnels from page, event and click steps. Per session or per browser, with drop off and median time between steps. |
| Retention | Day / week / month cohorts for browsers or logged in accounts, retention curve, DAU / MAU. |
| Visitors | Look up any visitor or user id and see every session and event in order. |
| Performance | Web Vitals p75 with good / poor split, slowest pages, grouped JS errors. |

Clicking a row in almost any table filters the whole dashboard by it. Every
filter, tab and option lives in the URL, so a view can be bookmarked or pasted
to someone else with access.

Useful links on the site itself:

- `?ca_internal=1` marks your browser as staff, hidden from the dashboard by
  default (tick **internal** to include it). `?ca_internal=0` undoes it.
- `?ca_optout=1` stops tracking in that browser entirely.

## First deploy

All from this folder, logged in with `wrangler login`, prod account:

```sh
export CLOUDFLARE_ACCOUNT_ID=3601d4429b224c4cfa22e082235067da
npm install

# 1. Database. Paste the database_id it prints into wrangler.jsonc.
npx wrangler d1 create codealgo-analytics
npm run db:migrate

# 2. Access app for admin. (Needs an API token, wrangler login cannot do it.
#    Scopes: Access: Apps and Policies Edit, Access: Organizations Read.)
CLOUDFLARE_API_TOKEN=... ADMIN_EMAILS="tristedw@gmail.com" node scripts/setup-access.mjs
#    Paste ACCESS_TEAM_DOMAIN and ACCESS_AUD it prints into wrangler.jsonc vars.

# 3. Worker. Creates both DNS records itself (custom_domain: true).
npm run deploy
```

Then in the Frontend repo on GitHub add the Actions variable
`NEXT_PUBLIC_ANALYTICS_URL=https://e.codealgoacademy.com` and redeploy the
site. Until that variable exists the tracker is a no-op.

If there is no Zero Trust org on the account yet, open one.dash.cloudflare.com
once and pick a team name first (free plan, up to 50 users). The login page
defaults to a one time code by email; add Google under Settings >
Authentication if you want a Google button.

Doing it by hand instead of the script: Zero Trust > Access > Applications >
Add > Self-hosted, domain `admin.codealgoacademy.com`, policy Allow with your
emails. Copy the Application Audience (AUD) tag from its Overview tab. Do not
put `e.codealgoacademy.com` behind Access.

## Security

- Access at the edge, and the Worker verifies the `Cf-Access-Jwt-Assertion`
  signature, audience and expiry itself (`src/access.ts`). With
  `ACCESS_TEAM_DOMAIN` / `ACCESS_AUD` empty every admin request is a 403, so a
  deploy before step 2 exposes nothing.
- `workers_dev` and preview URLs are off so there is no second hostname
  without Access in front of it.
- Writes to `/api/*` need an Origin matching the dashboard.
- The collector only accepts the site's origins, caps body size and batch
  size, drops obvious bots, and returns 204 before touching D1.

## Local dev

```sh
cp .dev.vars.example .dev.vars
npm install
npm run db:migrate:local
npm run seed:local        # ~2,500 fake visitors over 90 days, local only
npm run dev               # http://localhost:8787
```

Point the site at it with `NEXT_PUBLIC_ANALYTICS_URL=http://localhost:8787` in
Frontend `.env.development`. The heatmap frames `http://localhost:3000`.

## Cost and limits

D1 on the Workers paid plan: 25B rows read and 50M rows written a month
included. Each batch is one session upsert, one visitor upsert and one insert
per event. Dashboard queries scan the selected range. At the site's current
traffic this is well inside the included amounts.

Raw events older than `RETENTION_DAYS` (395) are pruned nightly at 09:17 UTC.
Sessions and visitors are kept, so traffic history and retention cohorts
survive the prune; only the click level detail goes.

## Adding tracking in the app

```ts
import { track } from "utils/siteTracker";
track("trial_started", { plan: "family", source: "pricing" });
```

Already wired: `login`, `signup_completed` (email and Google), `payment_succeeded`,
`payment_failed`, `payment_method_saved`. Put `data-track="pricing-family-cta"`
on a button to give it a stable name in the Clicks report.

## Ideas not built yet

- Tie `uid` to the backend: revenue per acquisition source by joining
  `Referral.revenue_in_cent` / Stripe on user id.
- Unity game events (level start / complete / quit) through the same `/e`
  endpoint, for a game retention view.
- Weekly email digest from a cron: visitors, signups, top sources, anything
  that moved more than 30%.
- Alerts when JS errors or rage clicks on a page spike after a deploy.
- Session replay (rrweb). Big payloads and a real privacy decision on a kids
  product, so left out on purpose.
