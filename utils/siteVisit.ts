import http from "../axios.config";
import { ILocalStorageItems } from "types/interfaces/localstorage.interface";
import { getVisitorId } from "./referral";

/**
 * Site visit beacon for the marketing dashboard (/admin/marketing on the API).
 *
 * Sends at most one call per tab per day, plus one more whenever the url carries
 * utm tags or a partner code, so a click from an Instagram post is always
 * recorded even if the tab already reported earlier. Logged in users are
 * skipped: students and parents using the app are not website traffic.
 *
 * The visitor id is the same one the referral code uses, and it goes out as a
 * header on signup, which is how the backend knows which visit to credit.
 */

const SENT_KEY = "ca_site_visit";

const TRACKED_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"] as const;

function isLoggedIn(): boolean {
   try {
      const raw = window.localStorage.getItem(ILocalStorageItems.token);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed?.access_token);
   } catch {
      return false;
   }
}

function today(): string {
   const d = new Date();
   return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

let firstLoad = true;

export function trackSiteVisit() {
   if (typeof window === "undefined") return;

   const isFirst = firstLoad;
   firstLoad = false;

   if (isLoggedIn()) return;

   const params = new URLSearchParams(window.location.search);
   const tagged: Record<string, string> = {};
   TRACKED_PARAMS.forEach((key) => {
      const value = params.get(key);
      if (value) tagged[key] = value;
   });
   if (!tagged.ref && params.get("referral")) tagged.ref = params.get("referral") as string;

   // Same tab, same day, same tags: already counted.
   const marker = `${today()}|${TRACKED_PARAMS.map((k) => tagged[k] || "").join("|")}`;
   const hasTags = Object.keys(tagged).length > 0;
   try {
      const previous = window.sessionStorage.getItem(SENT_KEY);
      if (previous === marker) return;
      if (previous && previous.startsWith(`${today()}|`) && !hasTags) return;
      window.sessionStorage.setItem(SENT_KEY, marker);
   } catch {
      // No session storage. Only report the first page so route changes do
      // not each count.
      if (!isFirst && !hasTags) return;
   }

   http
      .post("/marketing/visit/", {
         visitor_id: getVisitorId(),
         path: window.location.pathname,
         // document.referrer does not change on client side route changes, so
         // it only means something on the first page of the tab.
         referrer: isFirst ? document.referrer || "" : "",
         ...tagged,
      })
      .catch(() => {
         // A lost beacon is one visitor missing from a chart. Not worth a retry.
      });
}
