// Creates (or updates) the Cloudflare Access application that puts a login in
// front of admin.codealgoacademy.com, then prints the two values the Worker
// needs to check the Access token itself.
//
//   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=3601d4429b224c4cfa22e082235067da \
//   ADMIN_EMAILS="tristedw@gmail.com,someone@codealgoacademy.com" \
//   node scripts/setup-access.mjs
//
// The token needs: Account > Access: Apps and Policies > Edit, and
// Account > Access: Organizations, Identity Providers, and Groups > Read.
// `wrangler login` does not grant Access scopes, so it has to be an API token.
//
// Safe to re-run. It finds the existing app by hostname and updates it, so
// adding a person is: change ADMIN_EMAILS, run it again.

const token = process.env.CLOUDFLARE_API_TOKEN;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const host = process.env.ADMIN_HOST || "admin.codealgoacademy.com";
const emails = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
const domains = (process.env.ADMIN_EMAIL_DOMAINS || "").split(",").map((s) => s.trim()).filter(Boolean);

if (!token || !account) {
   console.error("Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.");
   process.exit(1);
}
if (!emails.length && !domains.length) {
   console.error("Set ADMIN_EMAILS (comma separated) and/or ADMIN_EMAIL_DOMAINS (e.g. codealgoacademy.com).");
   process.exit(1);
}

const base = `https://api.cloudflare.com/client/v4/accounts/${account}/access`;

async function cf(method, path, body) {
   const res = await fetch(base + path, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
   });
   const json = await res.json().catch(() => ({}));
   if (!res.ok || json.success === false) {
      console.error(`${method} ${path} failed (${res.status}):`, JSON.stringify(json.errors || json, null, 2));
      process.exit(1);
   }
   return json.result;
}

const org = await cf("GET", "/organizations");
if (!org || !org.auth_domain) {
   console.error("No Zero Trust organization on this account yet. Open one.dash.cloudflare.com once, pick a team name (free plan is fine), then re-run.");
   process.exit(1);
}

const include = [...emails.map((email) => ({ email: { email } })), ...domains.map((domain) => ({ email_domain: { domain } }))];

const app = {
   name: "CodeAlgo Analytics",
   domain: host,
   type: "self_hosted",
   session_duration: "24h",
   app_launcher_visible: true,
   auto_redirect_to_identity: false,
   // Only the dashboard hostname. e.codealgoacademy.com, the collector, must
   // stay public or every visitor's beacon gets a login page.
   destinations: [{ type: "public", uri: host }],
   policies: [
      {
         name: "CodeAlgo admins",
         decision: "allow",
         include,
         precedence: 1,
      },
   ],
};

const existing = (await cf("GET", "/apps")).find((a) => a.domain === host || (a.destinations || []).some((d) => d.uri === host));
const result = existing ? await cf("PUT", `/apps/${existing.id}`, app) : await cf("POST", "/apps", app);

console.log(`\nAccess app ${existing ? "updated" : "created"} for https://${host}`);
console.log(`Allowed: ${[...emails, ...domains.map((d) => "*@" + d)].join(", ")}\n`);
console.log("Put these in deploy/analytics/wrangler.jsonc under vars, then `npm run deploy`:\n");
console.log(`    "ACCESS_TEAM_DOMAIN": "${org.auth_domain}",`);
console.log(`    "ACCESS_AUD": "${result.aud}",\n`);
