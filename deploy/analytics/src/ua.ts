/**
 * Just enough user agent parsing for a device / browser / OS breakdown. Not
 * worth a dependency: the dashboard wants "Chrome on iOS, mobile", not a
 * version matrix.
 */

const BOT_RE =
   /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|quora link|whatsapp|pingdom|uptime|monitor|curl|wget|python-requests|axios\/|node-fetch|go-http/i;

export function isBot(ua: string): boolean {
   return !ua || BOT_RE.test(ua);
}

export function parseUa(ua: string): { device: string; browser: string; os: string } {
   let os = "Other";
   if (/Windows NT/.test(ua)) os = "Windows";
   else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
   else if (/CrOS/.test(ua)) os = "ChromeOS";
   else if (/Android/.test(ua)) os = "Android";
   else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
   else if (/Linux/.test(ua)) os = "Linux";

   let browser = "Other";
   if (/Edg\//.test(ua)) browser = "Edge";
   else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
   else if (/SamsungBrowser/.test(ua)) browser = "Samsung Internet";
   else if (/Firefox\/|FxiOS/.test(ua)) browser = "Firefox";
   else if (/CriOS|Chrome\//.test(ua)) browser = "Chrome";
   else if (/Safari\//.test(ua)) browser = "Safari";

   let device = "desktop";
   if (/iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) device = "tablet";
   else if (/Mobi|iPhone|iPod|Android/.test(ua)) device = "mobile";

   return { device, browser, os };
}

const SEARCH = ["google.", "bing.com", "duckduckgo.com", "yahoo.", "ecosia.org", "baidu.com", "yandex.", "search.brave.com"];
const SOCIAL: Record<string, string> = {
   "facebook.com": "facebook",
   "fb.com": "facebook",
   "l.facebook.com": "facebook",
   "instagram.com": "instagram",
   "l.instagram.com": "instagram",
   "t.co": "twitter",
   "twitter.com": "twitter",
   "x.com": "twitter",
   "linkedin.com": "linkedin",
   "lnkd.in": "linkedin",
   "youtube.com": "youtube",
   "tiktok.com": "tiktok",
   "reddit.com": "reddit",
   "pinterest.com": "pinterest",
};

/** Turns utm tags + referrer into a source / medium pair like GA does. */
export function classifySource(
   referrerHost: string,
   utmSource: string,
   utmMedium: string,
   ownHosts: string[],
): { source: string; medium: string } {
   if (utmSource) return { source: utmSource.toLowerCase(), medium: (utmMedium || "unknown").toLowerCase() };
   const host = referrerHost.replace(/^www\./, "").toLowerCase();
   if (!host || ownHosts.some((h) => host === h || host.endsWith("." + h))) return { source: "direct", medium: "none" };
   const engine = SEARCH.find((s) => host.includes(s));
   if (engine) return { source: engine.replace(/\.$/, "").split(".")[0], medium: "organic" };
   const social = Object.keys(SOCIAL).find((s) => host === s || host.endsWith("." + s));
   if (social) return { source: SOCIAL[social], medium: "social" };
   return { source: host, medium: "referral" };
}
