import axios from "axios";

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
   };
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
