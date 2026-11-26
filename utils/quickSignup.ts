import http from "../axios.config";
import { referralHeaders } from "utils/referral";

/**
 * Ad landing flow: account, kid and paid plan in one go. See
 * payment/quick_signup on the backend.
 *
 * What comes back from signup is kept in sessionStorage so a failed card can
 * be retried without making a second account, and so the welcome page can
 * show the kid's login after a 3DS redirect.
 */

const KEY = "ca_quick_signup";

export interface QuickSignupChild {
   name: string;
   username: string;
   password: string;
}

export interface QuickSignupState {
   email: string;
   subscription: number;
   client_secret: string | null;
   access: string;
   child: QuickSignupChild;
   completed?: boolean;
}

export interface QuickSignupPayload {
   first_name: string;
   last_name: string;
   email: string;
   password: string;
   child_name: string;
   price_id: number;
   promotion_code?: string;
   payment_method_id: string;
   state?: string;
}

export function getQuickSignup(): QuickSignupState | null {
   try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as QuickSignupState) : null;
   } catch {
      return null;
   }
}

export function saveQuickSignup(state: QuickSignupState) {
   try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
   } catch {
      // private mode, the page still has it in memory
   }
}

export async function startQuickSignup(payload: QuickSignupPayload) {
   const { data } = await http.post<Omit<QuickSignupState, "email">>("/payment/quick-signup/", payload, {
      headers: referralHeaders(),
   });
   return data;
}

export async function completeQuickSignup(state: QuickSignupState) {
   const { data } = await http.post(
      "/payment/quick-signup/complete/",
      { subscription_id: state.subscription },
      { headers: { Authorization: `Bearer ${state.access}` } }
   );
   return data as { status: string; subscription: number };
}

// The API wraps DRF errors as { details: [{ field: ["message"] }] }.
export function readSignupError(error: any): { field?: string; message: string } {
   const data = error?.response?.data;
   const status = error?.response?.status;
   if (status === 429) return { message: "Too many tries from this network. Wait a bit and try again." };
   if (data && typeof data === "object") {
      const first = Array.isArray(data.details) ? data.details[0] : data;
      const errors = first && typeof first === "object" ? first : {};
      for (const [field, value] of Object.entries(errors)) {
         const message = Array.isArray(value) ? String(value[0]) : String(value);
         if (field === "email" && message.includes("already_exists")) {
            return { field, message: "already_exists" };
         }
         return { field, message };
      }
   }
   if (!status) return { message: "Couldn't reach CodeAlgo. Check your connection and try again." };
   return { message: "Something went wrong on our side. Your card wasn't charged. Try again in a minute." };
}
