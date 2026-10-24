import ParentLayout from "@/components/layouts/ParentLayout";
import BillingHistory from "./BillingHistory";
import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActiveSubscription, getBillingHistory } from "services/pricingService";
import { RootState } from "store/store";
import { useRouter } from "next/router";
import TrialExpiryCard from "./TrialExpiryCard";
import BillingStepper, { BillingStepperHandle } from "./Stepper/BillingStepper.tsx";
import ActiveSubscriptionCard from "./Activesubscriptioncard";
import ManageExistingChildren from "./ManageExistingChildren";
import { useTranslation } from "react-i18next";

const BillingPage = () => {
  const { current_subscription, billing_history } = useSelector(
    (state: RootState) => state.pricing
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation("parent");
  const stepperRef = useRef<BillingStepperHandle>(null);
  
  const [showStepper, setShowStepper] = useState(false);
  const [stepperMode, setStepperMode] = useState<"plan" | "children">("plan");
  const [showChildrenManager, setShowChildrenManager] = useState(false);

  const hasActiveSubscription = !!current_subscription?.id;

  useEffect(() => {
    dispatch(getActiveSubscription());
    dispatch(getBillingHistory());
  }, [dispatch]);

  const handleManageChildren = () => {
    setShowStepper(false);
    setShowChildrenManager(true);
  };

  const handleStepperDone = () => {
    setShowStepper(false);
    dispatch(getActiveSubscription());
    dispatch(getBillingHistory());
  };

  const handleChangePlan = () => {
    setShowChildrenManager(false);
    setStepperMode("plan");
    setShowStepper(true);
    setTimeout(() => {
      document.getElementById("stepper-section")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // --- FIXED LOGIC START ---
  const expiringTrial = useMemo(() => {
    if (current_subscription?.status?.toUpperCase() === "TRIALING") {
      return current_subscription;
    }

    return (billing_history || [])
      .filter(
        (sub) =>
          sub.status?.toUpperCase() === "TRIALING" &&
          sub.is_active &&
          !sub.cancel_at_period_end
      )
      .sort(
        (a, b) =>
          new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
      )[0];
  }, [current_subscription, billing_history]);

  const calculateDaysLeft = (date: string) => {
    if (!date) return 0;
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const pendingSubscription = current_subscription?.status === "PENDING" ? current_subscription : null;

  return (
    <ParentLayout title={t("billing")}>
      <div className="scrollbar-hide overflow-y-scroll px-4 py-6">
        
        {expiringTrial && !showStepper && !showChildrenManager && (
          <TrialExpiryCard
            daysLeft={calculateDaysLeft(expiringTrial.expiration_date)}
            expiryDate={new Date(expiringTrial.expiration_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            onUpdatePayment={() =>
              router.push(`/parents/billing/payment?subscription_id=${expiringTrial.id}`)
            }
            onChangePlan={handleChangePlan}
          />
        )}

        {hasActiveSubscription && !showStepper && !showChildrenManager && (
          <ActiveSubscriptionCard
            onChangePlan={handleChangePlan}
            onManageChildren={handleManageChildren}
          />
        )}

        {hasActiveSubscription && showChildrenManager && (
          <ManageExistingChildren
            onCancel={() => setShowChildrenManager(false)}
            onSuccess={() => {
              setShowChildrenManager(false);
            }}
          />
        )}

        {pendingSubscription && (
          <div className="mb-6 mt-5 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
            <div className="flex items-center justify-between bg-red-50 px-5 py-4 border-b border-red-100">
              <div className="flex items-center gap-2">
                <div className="bg-red-100 p-2 rounded-full text-red-600">⚠</div>
                <h3 className="font-semibold text-red-900">{t("paymentRequired")}</h3>
              </div>
            </div>
            <div className="px-5 py-5">
              <p className="text-gray-600 mb-4">
                {t("subscriptionPendingPayment", { plan: pendingSubscription.plan_name })}
              </p>
              <button
                onClick={() => router.push(`/parents/billing/payment?subscription_id=${pendingSubscription.id}`)}
                className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-red-700 transition"
              >
                {t("completePaymentNow")}
              </button>
            </div>
          </div>
        )}

        {(!hasActiveSubscription || showStepper) && (
          <div id="stepper-section" className="mt-6">
            {showStepper && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800">
                  {stepperMode === "children" ? t("manageChildren") : hasActiveSubscription ? t("changePlan") : t("chooseAPlan")}
                </h2>
                <button
                  onClick={() => setShowStepper(false)}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
                >
                  ✕ {t("cancel")}
                </button>
              </div>
            )}
            <BillingStepper
              ref={stepperRef}
              onDone={handleStepperDone}
              onLockStepper={() => setShowStepper(true)}
            />
          </div>
        )}

        <BillingHistory />
      </div>
    </ParentLayout>
  );
};

export default BillingPage;