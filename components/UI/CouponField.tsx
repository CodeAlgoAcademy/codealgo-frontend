import React, { KeyboardEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { checkCoupon, clearPendingCoupon, CouponCheckFailure, getPendingCoupon, savePendingCoupon } from "utils/coupon";
import { CouponValidationResponse } from "types/interfaces";

const FAILURE_KEY: Record<CouponCheckFailure, string> = {
   invalid: "couponInvalid",
   network: "couponNetwork",
   throttled: "couponThrottled",
};

/**
 * Optional coupon box on the signup form. Nothing is charged at signup, so this
 * only checks the code and parks it for the billing stepper. Lives inside the
 * signup <form>, which is why Enter is caught here and the button is type=button.
 */
export default function CouponField() {
   const { t } = useTranslation("auth");
   const router = useRouter();
   const [open, setOpen] = useState(false);
   const [code, setCode] = useState("");
   const [checking, setChecking] = useState(false);
   const [applied, setApplied] = useState<CouponValidationResponse | null>(null);
   const [error, setError] = useState("");

   const apply = async (raw: string) => {
      const clean = raw.trim().toUpperCase();
      if (!clean || checking) return;
      setChecking(true);
      setError("");
      const res = await checkCoupon(clean);
      setChecking(false);
      if (res.ok) {
         setApplied(res.data);
         savePendingCoupon(res.data.code || clean);
      } else {
         setApplied(null);
         setError(t(FAILURE_KEY[res.reason]));
         // Can't reach the server: keep it anyway, billing will check it again.
         if (res.reason === "network") savePendingCoupon(clean);
         else clearPendingCoupon();
      }
   };

   // ?coupon=HOLIDAY30 on the signup link, or a code saved earlier in this browser.
   useEffect(() => {
      if (!router.isReady) return;
      const fromUrl = typeof router.query.coupon === "string" ? router.query.coupon : "";
      const initial = fromUrl || getPendingCoupon();
      if (!initial) return;
      setOpen(true);
      setCode(initial.toUpperCase());
      apply(initial);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.isReady]);

   const remove = () => {
      clearPendingCoupon();
      setApplied(null);
      setCode("");
      setError("");
   };

   const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
         e.preventDefault();
         apply(code);
      }
   };

   if (!open) {
      return (
         <button type="button" className="mt-4 block text-sm font-semibold underline" onClick={() => setOpen(true)}>
            {t("haveCouponCode")}
         </button>
      );
   }

   const discountText = applied?.discount?.type === "fixed"
      ? t("couponFixed", { value: (applied.discount.value / 100).toFixed(2) })
      : applied?.discount
      ? t("couponPercent", { value: applied.discount.value })
      : "";

   return (
      <div className="mt-4">
         <label htmlFor="coupon-code" className="block text-sm font-semibold">
            {t("couponCode")}
         </label>
         <div className="mt-2 flex gap-2">
            <input
               id="coupon-code"
               type="text"
               autoComplete="off"
               value={code}
               onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError("");
                  if (applied) {
                     setApplied(null);
                     clearPendingCoupon();
                  }
               }}
               onKeyDown={onKeyDown}
               placeholder={t("couponPlaceholder")}
               disabled={checking}
               className="block h-[2.5rem] flex-1 rounded-xl px-4 py-2 uppercase focus:outline-0"
            />
            {applied ? (
               <button type="button" onClick={remove} className="h-[2.5rem] rounded-xl border border-gray-300 px-4 text-sm font-semibold">
                  {t("couponRemove")}
               </button>
            ) : (
               <button
                  type="button"
                  onClick={() => apply(code)}
                  disabled={!code.trim() || checking}
                  className="h-[2.5rem] rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
               >
                  {checking ? t("couponChecking") : t("couponApply")}
               </button>
            )}
         </div>
         {applied && (
            <p className="mt-2 text-sm text-green-700" data-testid="coupon-applied">
               {t("couponSaved", { code: applied.code, discount: discountText })}
            </p>
         )}
         {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
   );
}
