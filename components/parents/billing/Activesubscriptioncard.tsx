import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { RootState } from "store/store";
import { useTranslation } from "react-i18next";

interface ActiveSubscriptionCardProps {
  onChangePlan: () => void;
  onManageChildren: () => void;
}

const ActiveSubscriptionCard: React.FC<ActiveSubscriptionCardProps> = ({
  onChangePlan,
  onManageChildren,
}) => {
  const router = useRouter();
  const { t } = useTranslation("parent");
  const { current_subscription, handlers } = useSelector(
    (state: RootState) => state.pricing
  );
  const { children: allChildren } = useSelector((state: RootState) => state.parentChild);

  if (!current_subscription) return null;

  const isPastDue = current_subscription.status === "PAST_DUE" || current_subscription.status === "INCOMPLETE";
  const isTrialing = current_subscription.status === "TRIALING";
  const isCancelling = current_subscription.cancel_at_period_end;
  // Past due with no payment ever made after a trial means the trial ran out
  // without a card, not that a renewal failed.
  const trialEnded =
    isPastDue &&
    !!current_subscription.trial_ends_at &&
    new Date(current_subscription.trial_ends_at).getTime() <= Date.now() &&
    !current_subscription.payment_date;

  const subscribedChildren = current_subscription.children ?? [];
  const unsubscribedChildren = allChildren.filter(
    (c) => !subscribedChildren.some((sc) => sc.id === c.id)
  );

  let statusLabel = t("active");
  let statusColor = "text-green-600 bg-green-50 border-green-200";

  if (isPastDue) {
    statusLabel = t("paymentRequired");
    statusColor = "text-red-600 bg-red-50 border-red-200";
  } else if (isTrialing) {
    statusLabel = t("freeTrial");
    statusColor = "text-blue-600 bg-blue-50 border-blue-200";
  } else if (isCancelling) {
    statusLabel = t("cancelsSoon");
    statusColor = "text-orange-600 bg-orange-50 border-orange-200";
  }

  const handlePayNow = () => {
    router.push(`/parents/billing/payment?subscription_id=${current_subscription.id}`);
  };

  return (
    <div className={`overflow-hidden rounded-2xl border shadow-sm ${isPastDue ? "border-red-200" : "border-gray-100 bg-white"}`}>
      
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isPastDue ? "bg-red-50 border-red-100" : "bg-mainColor/5 border-gray-100"}`}>
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isPastDue ? "bg-red-100 text-red-600" : "bg-mainColor/10 text-mainColor"}`}>
            {isPastDue ? (
               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
            ) : (
               <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
               </svg>
            )}
          </div>
          <h3 className={`font-semibold ${isPastDue ? "text-red-900" : "text-gray-900"}`}>
            {isPastDue ? t("actionRequired") : t("yourSubscription")}
          </h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="px-5 py-4 space-y-4">
        
        {isPastDue && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <h4 className="text-sm font-bold text-red-900">{trialEnded ? t("trialEndedTitle") : t("outstandingBalance")}</h4>
            <p className="mt-1 text-xs text-red-700 leading-relaxed">
              {trialEnded ? t("trialEndedMessage") : t("pastDueMessage")}
            </p>
            <button
              onClick={handlePayNow}
              className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
            >
              {trialEnded ? t("addCardAndPay") : t("payNowActivate")}
            </button>
          </div>
        )}

        {/* Plan info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{t("plan")}</p>
            <p className="mt-0.5 font-semibold text-gray-900">
              {current_subscription.plan_name}{" "}
              <span className="text-sm font-normal text-gray-500">
                ({current_subscription.plan_interval?.toLowerCase()})
              </span>
            </p>
          </div>
          <button
            onClick={onChangePlan}
            disabled={isPastDue}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition 
              ${isPastDue 
                ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed" 
                : "border-mainColor/30 bg-mainColor/5 text-mainColor hover:bg-mainColor/10"}`}
          >
            {t("changePlan")}
          </button>
        </div>

        {/* Expiry */}
        {current_subscription.expiration_date && !isPastDue && (
          <div className="rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
            {isTrialing ? t("trialEnds") : isCancelling ? t("accessUntil") : t("renewsOn")}:{" "}
            <span className="font-semibold text-gray-900">
              {new Date(current_subscription.expiration_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        <div className="border-t border-gray-50 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              {t("children")}{" "}
              <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {t("activeCount", { count: subscribedChildren.length })}
              </span>
            </p>
            <button
              onClick={onManageChildren}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {isPastDue ? t("viewDetails") : t("manage")}
            </button>
          </div>

          {subscribedChildren.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subscribedChildren.map((child) => (
                <span
                  key={child.id}
                  className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-medium text-green-700"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-200 text-[10px] font-bold text-green-800">
                    {child.firstName?.charAt(0)?.toUpperCase()}
                  </span>
                  {child.firstName} {child.lastName}
                </span>
              ))}
            </div>
          ) : (
            <button
              onClick={onManageChildren}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-3 text-sm text-gray-500 transition hover:border-mainColor/30 hover:bg-mainColor/5 hover:text-mainColor"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t("addChildrenToPlan")}
            </button>
          )}

          {isPastDue && (
             <p className="mt-3 text-xs text-red-600 italic">
               {t("noteRecentChildren")}
             </p>
          )}

          {!isPastDue && unsubscribedChildren.length > 0 && (
            <p className="mt-2 text-xs text-amber-600">
              {t("childrenNotOnPlan", { count: unsubscribedChildren.length })}{" "}
              <button onClick={onManageChildren} className="underline hover:no-underline">
                {t("addThem")}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveSubscriptionCard;