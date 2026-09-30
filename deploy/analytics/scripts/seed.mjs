// Fake traffic for local dev only. Prints SQL to stdout.
//   node scripts/seed.mjs > .seed.sql && wrangler d1 execute codealgo-analytics --local --file .seed.sql
//
// Never run this against --remote.

const DAY = 86_400_000;
const now = Date.now();
let seed = 42;
const rnd = Math.random;
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const weighted = (pairs) => {
   const total = pairs.reduce((s, p) => s + p[1], 0);
   let r = rnd() * total;
   for (const [v, w] of pairs) if ((r -= w) <= 0) return v;
   return pairs[0][0];
};
const id = () => crypto.randomUUID();
const q = (v) => (v === null || v === undefined ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

const PAGES = ["/", "/pricing", "/for-parents", "/for-educators", "/about", "/faq", "/blog", "/blog/Python-vs-Scratch", "/signup", "/signup/parent", "/login", "/contact", "/press"];
const NEXT = {
   "/": [["/pricing", 5], ["/for-parents", 4], ["/for-educators", 2], ["/about", 1], ["/signup", 2], ["/login", 3], [null, 5]],
   "/pricing": [["/signup", 4], ["/faq", 2], ["/for-parents", 1], [null, 4]],
   "/for-parents": [["/pricing", 4], ["/signup", 2], [null, 3]],
   "/for-educators": [["/signup", 2], ["/contact", 2], [null, 3]],
   "/signup": [["/signup/parent", 6], [null, 2]],
   "/signup/parent": [[null, 1]],
   "/login": [[null, 1]],
};
const CLICKS = {
   "/": [["a.btn-primary", "Start free trial", "/signup"], ["nav a", "Pricing", "/pricing"], ["nav a", "For Parents", "/for-parents"], ["nav a", "Login", "/login"], ["section.hero button", "Watch video", null]],
   "/pricing": [["div.plan-card button", "Choose Family", "/signup"], ["div.plan-card button", "Choose Classroom", "/signup"], ["a.faq-link", "See FAQ", "/faq"]],
   "/for-parents": [["a.cta", "Get started", "/signup"], ["div.testimonial img", "", null]],
   "/signup": [["button#parent", "I'm a parent", "/signup/parent"], ["button#teacher", "I'm a teacher", null]],
   "/signup/parent": [["button[type=submit]", "Create account", null], ["button.google", "Sign up with Google", null]],
};
const SOURCES = [
   [["google", "organic", "www.google.com", null], 40],
   [["direct", "none", null, null], 30],
   [["instagram", "social", "l.instagram.com", null], 10],
   [["facebook", "cpc", "l.facebook.com", "fall_parents"], 8],
   [["newsletter", "email", null, "sept_update"], 5],
   [["partner-blog.com", "referral", "partner-blog.com", null], 4],
   [["bing", "organic", "www.bing.com", null], 3],
];
const GEO = [[["CA", "British Columbia", "Kelowna"], 20], [["CA", "Ontario", "Toronto"], 15], [["US", "Texas", "Austin"], 20], [["US", "California", "San Jose"], 18], [["US", "New York", "Brooklyn"], 12], [["GB", "England", "London"], 6], [["IN", "Karnataka", "Bengaluru"], 5]];
const DEV = [[["desktop", "Chrome", "Windows", 1440], 35], [["desktop", "Safari", "macOS", 1512], 15], [["mobile", "Safari", "iOS", 390], 25], [["mobile", "Chrome", "Android", 412], 15], [["tablet", "Safari", "iOS", 820], 6], [["desktop", "Chrome", "ChromeOS", 1366], 4]];

const out = ["DELETE FROM events;", "DELETE FROM sessions;", "DELETE FROM visitors;"];
const ev = [];
const visitors = [];

for (let v = 0; v < 2500; v++) {
   const vid = id();
   const firstDay = Math.floor(rnd() * 90);
   const [country, region, city] = weighted(GEO);
   const [device, browser, os, vw] = weighted(DEV);
   const returns = rnd() < 0.35 ? 1 + Math.floor(rnd() * 6) : 0;
   let uid = null;
   let role = null;
   const vis = { vid, first: Infinity, last: 0, sessions: 0, pageviews: 0, firstPath: null, firstSource: null, firstRef: null, country, device, uid: null, role: null };
   for (let s = 0; s <= returns; s++) {
      const dayAgo = Math.max(0, firstDay - Math.floor(s * (2 + rnd() * 10)));
      const hour = weighted([[8, 1], [10, 2], [13, 2], [15, 3], [19, 4], [21, 3], [23, 1]]);
      const start = now - dayAgo * DAY - ((now % DAY) - hour * 3_600_000) + Math.floor(rnd() * 3_600_000);
      if (start > now) continue;
      const sid = id();
      const [source, medium, referrer, campaign] = s === 0 ? weighted(SOURCES) : weighted([[["direct", "none", null, null], 3], ...SOURCES.slice(0, 2)]);
      let path = s > 0 && uid ? "/login" : weighted([["/", 6], ["/pricing", 1], ["/for-parents", 2], ["/blog/Python-vs-Scratch", 1], ["/for-educators", 1]]);
      let t = start;
      let pv = 0;
      let clicks = 0;
      let engaged = 0;
      let exit = path;
      const entry = path;
      while (path) {
         pv++;
         exit = path;
         const dh = path === "/" ? 5200 : path.startsWith("/signup") ? 1400 : 3200;
         ev.push([t, sid, vid, uid, "pageview", null, path, null, null, null, null, null, vw, dh, null, null]);
         if (rnd() < 0.3) ev.push([t + 900, sid, vid, uid, "vital", "LCP", path, null, null, null, null, null, vw, null, 900 + rnd() * (device === "mobile" ? 4200 : 2400), null]);
         if (rnd() < 0.3) ev.push([t + 1200, sid, vid, uid, "vital", "CLS", path, null, null, null, null, null, vw, null, rnd() * 0.3, null]);
         if (rnd() < 0.2) ev.push([t + 5000, sid, vid, uid, "vital", "INP", path, null, null, null, null, null, vw, null, 60 + rnd() * 500, null]);
         if (rnd() < 0.3) ev.push([t, sid, vid, uid, "vital", "TTFB", path, null, null, null, null, null, vw, null, 150 + rnd() * 1200, null]);
         const stay = 4000 + Math.floor(rnd() * 90_000);
         const opts = CLICKS[path] || [["nav a", "Home", "/"]];
         const nClicks = Math.floor(rnd() * 4);
         for (let c = 0; c < nClicks; c++) {
            const [el, label, href] = pick(opts);
            const x = el.startsWith("nav") ? 0.55 + rnd() * 0.35 : 0.3 + rnd() * 0.4;
            const y = el.startsWith("nav") ? 30 + rnd() * 20 : 300 + rnd() * (dh - 600);
            ev.push([t + 1000 + c * 1500, sid, vid, uid, "click", null, path, label, el, href, x, Math.round(y), vw, dh, null, null]);
            clicks++;
         }
         if (path === "/pricing" && rnd() < 0.08) ev.push([t + 3000, sid, vid, uid, "rage", null, path, "Compare plans", "div.plan-table span", null, 0.5, 1800, vw, dh, 4, null]);
         if (path === "/for-parents" && rnd() < 0.15) ev.push([t + 2500, sid, vid, uid, "click", "dead", path, "Ages 6-18", "div.hero h2", null, 0.4, 420, vw, dh, null, null]);
         if (rnd() < 0.02) ev.push([t + 2000, sid, vid, uid, "error", null, path, "TypeError: Cannot read properties of undefined (reading 'plan')", "/_next/static/chunks/pages/pricing.js:1:2231", null, null, null, vw, null, null, null]);
         if (rnd() < 0.03) ev.push([t + 2200, sid, vid, uid, "outbound", null, path, "YouTube", "footer a", "https://youtube.com/@codealgo", null, null, vw, dh, null, null]);
         const depth = Math.min(100, Math.round(20 + rnd() * 90));
         ev.push([t + stay, sid, vid, uid, "scroll", null, path, null, null, null, null, null, vw, dh, depth, null]);
         ev.push([t + stay, sid, vid, uid, "engage", null, path, null, null, null, null, null, vw, dh, Math.round(stay * 0.7), null]);
         engaged += Math.round(stay * 0.7);
         if (path === "/signup/parent" && rnd() < 0.55 && !uid) {
            uid = String(1000 + v);
            role = "parent";
            ev.push([t + stay - 500, sid, vid, uid, "form", "submit", path, "signup-form", "form#signup", null, null, null, vw, dh, null, null]);
            ev.push([t + stay, sid, vid, uid, "custom", "signup_completed", path, null, null, null, null, null, vw, dh, null, JSON.stringify({ method: rnd() < 0.3 ? "google" : "email", role: "parent" })]);
         }
         if (path === "/login" && uid) ev.push([t + stay, sid, vid, uid, "custom", "login", path, null, null, null, null, null, vw, dh, null, JSON.stringify({ method: "password", role })]);
         t += stay;
         const nexts = NEXT[path] || [[null, 1]];
         path = weighted(nexts);
      }
      out.push(
         `INSERT INTO sessions VALUES (${[sid, vid, uid, role, start, t, entry, exit, pv, pv * 3 + clicks, clicks, engaged, referrer, source, medium, campaign, null, null, rnd() < 0.05 ? "sarahblogs" : null, country, region, city, device, browser, os, `${vw}x900`, "en-US", "America/Vancouver", 0, s === 0 ? 1 : 0].map(q).join(",")});`,
      );
      vis.first = Math.min(vis.first, start);
      vis.last = Math.max(vis.last, t);
      vis.sessions++;
      vis.pageviews += pv;
      if (s === 0) {
         vis.firstPath = entry;
         vis.firstSource = source;
         vis.firstRef = referrer;
      }
      vis.uid = uid;
      vis.role = role;
   }
   if (vis.sessions) visitors.push(vis);
}

for (const v of visitors) {
   out.push(
      `INSERT INTO visitors VALUES (${[v.vid, v.uid, v.role, v.first, v.last, v.sessions, v.pageviews, v.firstPath, v.firstSource, v.firstRef, v.country, v.device, 0].map(q).join(",")});`,
   );
}
for (const e of ev) {
   out.push(`INSERT INTO events (ts,sid,vid,uid,type,name,path,label,el,href,x,y,vw,dh,value,props) VALUES (${e.map(q).join(",")});`);
}
console.log(out.join("\n"));
