import http from "../axios.config";
import { CouponValidationResponse } from "types/interfaces";

/**
 * Coupon typed in at signup. The account has no plan yet at that point, so the
 * code is checked, kept here, and dropped into the billing stepper the first
 * time the parent picks a plan. Cleared once a subscription goes through with it.
 *
 * localStorage, so it survives the verify-email round trip on the same browser.
 * A parent who verifies on another device just types it again on billing.
 */

const STORAGE_KEY = "ca_pending_coupon";

export function getPendingCoupon(): string {
   try {
      return localStorage.getItem(STORAGE_KEY) || "";
   } catch {
      return "";
   }
}

export function savePendingCoupon(code: string) {
   try {
      localStorage.setItem(STORAGE_KEY, code.trim().toUpperCase());
   } catch {
      // private mode Safari, nothing to do
   }
}

export function clearPendingCoupon() {
   try {
      localStorage.removeItem(STORAGE_KEY);
   } catch {
      // ignore
   }
}

export type CouponCheckFailure = "invalid" | "network" | "throttled";

// Not errorResolver: that one opens the global error modal, and a typo in an
// optional field should just show under the field.
export async function checkCoupon(code: string): Promise<{ ok: true; data: CouponValidationResponse } | { ok: false; reason: CouponCheckFailure }> {
   try {
      const { data } = await http.post<CouponValidationResponse>("/payment/coupon/validate/", { code: code.trim() });
      return { ok: true, data };
   } catch (error: any) {
      const status = error?.response?.status;
      // 401/403 means an API older than the open validate endpoint. Treat it
      // like a network miss so the code is kept and billing checks it later.
      if (!status || status === 401 || status === 403) return { ok: false, reason: "network" };
      if (status === 429) return { ok: false, reason: "throttled" };
      return { ok: false, reason: "invalid" };
   }
}
