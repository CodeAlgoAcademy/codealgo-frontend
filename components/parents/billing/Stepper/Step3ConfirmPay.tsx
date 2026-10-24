import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useAppDispatch } from "store/hooks";
import { RootState } from "store/store";
import { initiatePayment, changePlan, getBillingHistory, getActiveSubscription } from "services/pricingService";
import { toast } from "sonner";
import SubscriptionSuccessModal from "../TrialPaymentRequiredModal";
import { useTranslation } from "react-i18next";
import { canStartTrial } from "@/components/utils/subscriptionUtils";

interface Step3ConfirmProps {
   priceId: number;
   selectedChildIds: number[];
   goBack: () => void;
   onSuccess: (subscriptionId: number) => void;
   existingSubscriptionId: number | null;
}

const Step3Confirm: React.FC<Step3ConfirmProps> = ({ priceId, goBack, onSuccess, existingSubscriptionId, selectedChildIds }) => {
   const dispatch = useAppDispatch();
   const router = useRouter();
   const { t } = useTranslation("parent");
   const { plans, coupon_validation, current_subscription, handlers, billing_history } = useSelector((state: RootState) => state.pricing);
   const { children: allChildren } = useSelector((state: RootState) => state.parentChild);

   const hasExistingSubscription = !!existingSubscriptionId;
   const trialEligible = canStartTrial(billing_history);
   const [isProcessing, setIsProcessing] = useState(false);
   const [showSuccessModal, setShowSuccessModal] = useState(false);
   const [newSubscriptionId, setNewSubscriptionId] = useState<number | null>(null);
   const [isTrialSubscription, setIsTrialSubscription] = useState(false);

   const selectedChildrenNames = useMemo(() => {
      if (!selectedChildIds || selectedChildIds.length === 0) return t("none");

      return allChildren
         .filter((child) => selectedChildIds.includes(Number(child.id)))
         .map((child) => child.fullName || child.username || t("child"))
         .join(", ");
   }, [allChildren, selectedChildIds, t]);

   const isPendingSubscription = useMemo(() => {
      return hasExistingSubscription && current_subscription?.status === "PENDING";
   }, [hasExistingSubscription, current_subscription]);

   const selectedPrice = useMemo(() => {
      for (const plan of plans) {
         const price = plan.prices.find((p) => p.id === priceId);
         if (price) return { plan, price };
      }
      return null;
   }, [plans, priceId]);

   const priceDetails = useMemo(() => {
      if (!selectedPrice) return null;
      const baseAmount = selectedPrice.price.amount_in_cent / 100;
      let discount = 0;
      if (coupon_validation?.code && coupon_validation.discount) {
         discount =
            coupon_validation.discount.type === "percentage"
               ? (baseAmount * coupon_validation.discount.value) / 100
               : coupon_validation.discount.value;
      }
      return { baseAmount, discount, finalAmount: baseAmount - discount };
   }, [selectedPrice, coupon_validation]);

   const handleCreateSubscription = async () => {
      setIsProcessing(true);
      try {
         const result = await dispatch(
            initiatePayment({
               price_id: priceId,
               is_trial: true,
               children: selectedChildIds,
               ...(coupon_validation?.code && { promotion_code: coupon_validation.code }),
            })
         );

         if (!initiatePayment.fulfilled.match(result)) {
            toast.error(t("failedToCreateSubscription"));
            return;
         }

         const payload = result.payload as {
            status: string;
            subscription?: number;
            subscription_id?: number;
            client_secret?: string;
            message?: string;
         };

         const newSubId = payload.subscription ?? payload.subscription_id;
         const status = payload.status;

         await dispatch(getActiveSubscription());
         await dispatch(getBillingHistory());

         if (status === "requires_payment_action" && newSubId) {
            // No trial left on this account, so the first payment is due now. Hand
            // the intent over directly instead of making the payment page look it up.
            const secret = payload.client_secret ? `&client_secret=${encodeURIComponent(payload.client_secret)}` : "";
            router.push(`/parents/billing/payment?subscription_id=${newSubId}${secret}`);
            return;
         }

         if (status === "payment_failed" && newSubId) {
            toast.error(payload.message || t("paymentRequired"));
            router.push(`/parents/billing/payment?subscription_id=${newSubId}`);
            return;
         }

         if (status === "already_active") {
            toast.success(t("planUpdatedSuccessfully"));
            if (newSubId) onSuccess(newSubId);
            return;
         }

         if (!newSubId) {
            toast.error(payload.message || t("failedToCreateSubscription"));
            return;
         }

         setNewSubscriptionId(newSubId);

         setIsTrialSubscription(status === "trialing");
         setShowSuccessModal(true);
      } catch (error) {
         console.error(error);
         toast.error(t("unexpectedErrorTryAgain"));
      } finally {
         setIsProcessing(false);
      }
   };

   const handleChangePlan = async () => {
      if (!existingSubscriptionId) return;
      setIsProcessing(true);
      try {
         const result = await dispatch(changePlan({ subscriptionId: existingSubscriptionId, priceId }));

         if (changePlan.fulfilled.match(result)) {
            const payload = result.payload as any;

            if (payload.client_secret) {
               toast.success(t("actionRequiredToComplete"));
               router.push(`/parents/billing/payment?subscription_id=${existingSubscriptionId}&client_secret=${payload.client_secret}`);
            } else {
               toast.success(t("planUpdatedSuccessfully"));
               await dispatch(getActiveSubscription());
               await dispatch(getBillingHistory());
               onSuccess(existingSubscriptionId);
            }
         } else {
            toast.error(t("failedToChangePlan"));
         }
      } catch {
         toast.error(t("errorOccurred"));
      } finally {
         setIsProcessing(false);
      }
   };

   const handleActivate = () => {
      if (isPendingSubscription) {
         // A checkout that never got paid. Run it again with what is picked now, the
         // backend reuses the open invoice when nothing changed.
         handleCreateSubscription();
      } else if (hasExistingSubscription) {
         handleChangePlan();
      } else {
         handleCreateSubscription();
      }
   };

   const handleSuccessClose = () => {
      setShowSuccessModal(false);
      if (newSubscriptionId) onSuccess(newSubscriptionId);
   };

   const handleAddPayment = () => {
      if (!newSubscriptionId) return;
      setShowSuccessModal(false);
      router.push(`/parents/billing/payment?subscription_id=${newSubscriptionId}`);
   };

   const isLoading = handlers.initiate_payment_loading || handlers.change_plan_loading || isProcessing;

   const isGift = useMemo(() => {
      const isZero = priceDetails?.finalAmount === 0;
      const isFullDiscount = coupon_validation?.discount?.value === 100;

      return isZero || isFullDiscount;
   }, [priceDetails, coupon_validation]);

   return (
      <>
         <div className="flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Header */}
            <div className={`flex items-center justify-center gap-2 px-4 py-5 text-white ${isPendingSubscription ? "bg-red-500" : "bg-mainColor"}`}>
               {isPendingSubscription ? (
                  <h2 className="text-lg font-bold">{t("paymentRequired")}</h2>
               ) : (
                  <h2 className="text-lg font-bold">{hasExistingSubscription ? t("confirmPlanChange") : t("confirmAndStart")}</h2>
               )}
            </div>

            <div className="px-6 py-6">
               {selectedPrice && priceDetails ? (
                  <div className="space-y-1">
                     <SummaryRow label={t("plan")} value={`${selectedPrice.plan.name} – ${selectedPrice.price.interval.toLowerCase()}`} />
                     <SummaryRow label={t("price")} value={`$${priceDetails.baseAmount.toFixed(2)} / ${selectedPrice.price.interval.toLowerCase()}`} />

                     <SummaryRow label={t("childrenIncluded")} value={selectedChildrenNames} className="max-w-[50%] text-right" />

                     {coupon_validation?.code && priceDetails.discount > 0 && (
                        <SummaryRow label={t("discount", { code: coupon_validation.code })} value={`-$${priceDetails.discount.toFixed(2)}`} accent="green" />
                     )}

                     {priceDetails.discount > 0 && (
                        <>
                           <div className="!my-4 border-t border-gray-100" />
                           <SummaryRow
                              label={t("total")}
                              value={`$${priceDetails.finalAmount.toFixed(2)} / ${selectedPrice.price.interval.toLowerCase()}`}
                              bold
                           />
                        </>
                     )}

                     {isPendingSubscription && (
                        <div className="!mt-5 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                           <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                           </svg>
                           {t("planPendingPayment")}
                        </div>
                     )}

                     {!hasExistingSubscription && !isPendingSubscription && (
                        <div
                           className={`!mt-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm 
          ${isGift ? "border-green-100 bg-green-50 text-green-800" : "border-amber-100 bg-amber-50 text-amber-800"}`}
                        >
                           <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           {isGift ? t("giftActivatedImmediately") : trialEligible ? t("trialStartsToday") : t("paymentDueToday")}
                        </div>
                     )}
                  </div>
               ) : (
                  <p className="py-6 text-center text-sm text-gray-400">{t("loadingPlanDetails")}</p>
               )}

               <div className="mt-8 flex gap-3">
                  <button
                     type="button"
                     onClick={goBack}
                     disabled={isLoading}
                     className="w-1/3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                  >
                     ← {t("back")}
                  </button>
                  {/* // ${isPendingSubscription ? "bg-red-600 hover:bg-red-700" : "bg-mainColor"} */}
                  <button
                     type="button"
                     onClick={handleActivate}
                     disabled={isLoading || !selectedPrice}
                     className={`flex-1 rounded-xl px-4 py-3 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50
    ${isGift ? "bg-green-600 hover:bg-green-700" : isPendingSubscription ? "bg-red-600 hover:bg-red-700" : "bg-mainColor"}
  `}
                  >
                     {isLoading
                        ? t("processing")
                        : isGift
                        ? t("redeemGiftCard")
                        : isPendingSubscription
                        ? t("continueToPayment")
                        : hasExistingSubscription
                        ? t("confirm")
                        : trialEligible
                        ? t("startTrial")
                        : t("continueToPayment")}
                  </button>
               </div>
            </div>
         </div>

         {newSubscriptionId && (
            <SubscriptionSuccessModal
               open={showSuccessModal}
               onClose={handleSuccessClose}
               onAddPayment={handleAddPayment}
               subscriptionId={newSubscriptionId}
               isTrialSubscription={isTrialSubscription}
            />
         )}
      </>
   );
};

export default Step3Confirm;

const SummaryRow: React.FC<{
   label: string;
   value: string;
   accent?: "green";
   bold?: boolean;
   className?: string;
}> = ({ label, value, accent, bold, className }) => (
   <div className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0">
      <span className="mr-4 shrink-0 text-sm text-gray-500">{label}</span>
      <span
         className={`text-sm ${bold ? "font-bold text-gray-900" : "font-medium"} ${accent === "green" ? "text-green-600" : "text-gray-800"} ${
            className || ""
         }`}
      >
         {value}
      </span>
   </div>
);
