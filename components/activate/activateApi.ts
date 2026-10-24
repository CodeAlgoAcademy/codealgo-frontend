import axios from "axios";
import { addUserToLocalStorage } from "utils/getTokens";

/**
 * API client for the /activate pages only.
 *
 * Deliberately not the shared `http` instance: that one reads and refreshes the
 * site login in localStorage, and a student arriving from the game must not
 * overwrite (or be refreshed with) a parent who is already signed in on this
 * browser. The student's tokens live in sessionStorage for this tab instead.
 */
const STORAGE_KEY = "codealgo.activate.session";

export interface ActivateSession {
   access_token: string;
   refresh_token: string;
   user: {
      firstname?: string;
      username?: string;
      email?: string;
      is_student?: boolean;
      is_parent?: boolean;
   };
}

export interface ActiveSub {
   id: number;
   status: string;
   plan_name?: string;
   plan_interval?: string;
   latest_client_secret?: string | null;
   children?: { id: number; firstName?: string; username?: string }[];
}

export function readSession(): ActivateSession | null {
   if (typeof window === "undefined") return null;
   try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ActivateSession) : null;
   } catch {
      return null;
   }
}

export function writeSession(session: ActivateSession) {
   try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
   } catch {
      // Storage blocked. The page keeps working for this load from memory.
   }
}

export const activateApi = axios.create({
   baseURL: process.env.NEXT_PUBLIC_API_URL,
   headers: { Accept: "application/json", "Content-Type": "application/json" },
   timeout: 60000,
});

export function authed(session: ActivateSession | null) {
   return session ? { headers: { Authorization: `Bearer ${session.access_token}` } } : {};
}

export function errorText(err: any, fallback: string): string {
   const data = err?.response?.data;
   const detail = data?.detail || data?.details?.[0];
   if (typeof detail === "string") return detail;
   if (detail && typeof detail === "object") {
      const first = Object.values(detail)[0];
      if (typeof first === "string") return first;
      if (Array.isArray(first) && typeof first[0] === "string") return first[0];
   }
   return fallback;
}

/** Back into the app on a phone. On a desktop browser this link does nothing, which is fine. */
export const APP_RETURN_URL = "codealgo://activated";
export const WEB_GAME_URL = "https://play.codealgoacademy.com";

/** The plan this account holds right now, if any (pending, trialing, active or past due). */
export async function currentSubscription(session: ActivateSession): Promise<ActiveSub | null> {
   const res = await activateApi.get<ActiveSub[]>("/payment/subscription/active", authed(session));
   return res.data?.[0] ?? null;
}

const LIVE = ["ACTIVE", "TRIALING"];

/**
 * True once the plan is actually live. Students ask the access check the game
 * uses; a parent has no access of their own, so for them it is their plan's status.
 */
export async function hasPlanAccess(session: ActivateSession): Promise<boolean> {
   if (session.user?.is_student) {
      const res = await activateApi.get("/auth/student/access-check/", authed(session));
      return !!res.data?.has_access;
   }
   const sub = await currentSubscription(session);
   return !!sub && LIVE.includes((sub.status || "").toUpperCase());
}

export const isLive = (sub: ActiveSub | null) => !!sub && LIVE.includes((sub.status || "").toUpperCase());

/**
 * Signs the main site in as this parent and opens a dashboard page. Only ever
 * from a button they pressed, since it replaces whoever was signed in here.
 */
export function openSiteAs(session: ActivateSession, path: string) {
   addUserToLocalStorage({
      ...(session.user as any),
      access_token: session.access_token,
      refresh_token: session.refresh_token,
   });
   window.location.href = path;
}
