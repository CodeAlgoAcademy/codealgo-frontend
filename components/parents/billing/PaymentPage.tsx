import { Elements } from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAppDispatch } from "store/hooks";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { createSetupIntent, fetchAmountDue, getActiveSubscription } from "services/pricingService";
import { useInitStripe } from "hooks/useStripe";
import PaymentForm from "./PaymentForm";
import { useTranslation } from "react-i18next";

const PaymentPage = () => {
  const router = useRouter();
  const { query, isReady, push } = router;
  const dispatch = useAppDispatch();
  const { t } = useTranslation("parent");
  const { current_subscription } = useSelector((state: RootState) => state.pricing);
  
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [trialEnded, setTrialEnded] = useState(false);

  const subscriptionId = Number(query.subscription_id);
  const urlClientSecret = query.client_secret as string;
  
  useEffect(() => {
    if (!isReady) return;

    if (!subscriptionId || isNaN(subscriptionId)) {
      push("/parents/billing");
      return;
    }

const initPayment = async () => {
      setIsLoading(true);
      setError("");

      try {
        if (urlClientSecret) {
          setClientSecret(urlClientSecret);
          setIsLoading(false);
          return;
        }

        let activeSub = current_subscription;
        if (!activeSub || activeSub.id !== subscriptionId) {
           const action = await dispatch(getActiveSubscription());
           if (getActiveSubscription.fulfilled.match(action)) {
             const payload = action.payload as any; 
             activeSub = Array.isArray(payload) ? payload[0] : payload;
           }
        }

        if (activeSub && activeSub.id === subscriptionId) {
           // latest_client_secret is the intent from when the plan was bought. It is
           // only still payable while the plan is PENDING; once it went through
           // (trial, active, or a renewal that later failed) using it again just
           // shows a finished payment. Those take a new card through a setup intent.
           if (activeSub.status === "PENDING" && activeSub.latest_client_secret) {
             setClientSecret(activeSub.latest_client_secret);
           } else if (activeSub.status === "PENDING") {
             // Nothing to pay yet, the checkout never reached Stripe. Billing starts it again.
             push("/parents/billing");
             return;
           } else {
             // Trial ended or a renewal failed: pay the open invoice now. Only
             // when Stripe has nothing payable, save a card and let it retry.
             const due = activeSub.status === "PAST_DUE" ? await fetchAmountDue(subscriptionId).catch(() => null) : null;
             if (due?.client_secret) {
               setClientSecret(due.client_secret);
               setTrialEnded(!!due.trial_ended);
               return;
             }
             const result = await dispatch(createSetupIntent(subscriptionId));
             if (createSetupIntent.fulfilled.match(result)) {
               setClientSecret(result.payload.client_secret);
             } else {
               setError(t("errorLoadingPaymentForm"));
             }
           }
        }
      } catch (err) {
        setError(t("errorLoadingPaymentForm"));
      } finally {
        setIsLoading(false);
      }
    };

    initPayment();
  }, [isReady, subscriptionId, urlClientSecret, dispatch, push]);

  const { stripePromise, options } = useInitStripe(clientSecret);

  if (isLoading) {
    return (
      <div className="mt-12 bg-white px-8 pt-6 pb-10 flex justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainColor"></div>
      </div>
    );
  }

  if (error || !clientSecret || !options) {
    return (
      <div className="mt-12 bg-white px-8 pt-6 pb-10 text-center">
        <p className="text-red-600 mb-4">{error || t("failedToLoadPaymentForm")}</p>
        <button onClick={() => push("/parents/billing")} className="rounded bg-mainColor px-6 py-2 text-white">
          {t("backToBilling")}
        </button>
      </div>
    );
  }

  return (
    <>
     <button onClick={() => push("/parents/billing")} className="rounded border-2 border-mainColor px-6 py-2 text-black ml-8 mt-4">
          {t("backToBilling")}
     </button>
    <div className="mt-8 bg-white px-8 pt-6 pb-10">
      <h4 className="border-b pb-2 text-lg font-semibold">
        {trialEnded ? t("trialEndedTitle") : clientSecret.startsWith("pi_") ? t("completePayment") : t("addPaymentMethodTitle")}
      </h4>
      {trialEnded && <p className="mt-3 text-sm text-gray-600">{t("trialEndedMessage")}</p>}
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm subscriptionId={subscriptionId} clientSecret={clientSecret} />
      </Elements>
    </div>
    </>
  );
};

export default PaymentPage;