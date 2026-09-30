import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAppDispatch } from "store/hooks";
import { attachPaymentMethod, getActiveSubscription } from "services/pricingService";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslation } from "react-i18next";
import { track } from "utils/siteTracker";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PaymentConfirmPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("parent");
  const { query, isReady } = router;
  const hasRunRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState(t("confirmingPayment"));

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/parents/billing");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  useEffect(() => {
    if (!isReady) return;
    if (hasRunRef.current) return;

    const finalize = async () => {
      hasRunRef.current = true;
      setStatus("loading");

      const stripe = await stripePromise;
      if (!stripe) return;

      const redirectStatus = query.redirect_status as string;
      const subscriptionId = Number(query.subscription_id);

      if (query.payment_intent_client_secret) {
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          query.payment_intent_client_secret as string
        );

        if (!paymentIntent || paymentIntent.status !== "succeeded") {
          track("payment_failed", { kind: "payment", status: paymentIntent?.status || "missing" });
          setStatus("error");
          setMessage(t("paymentNotConfirmed"));
          return;
        }

        await dispatch(getActiveSubscription());
        track("payment_succeeded", { kind: "payment", subscription_id: subscriptionId || null });
        setStatus("success");
        setMessage(t("paymentUpdated"));
      }

      else if (query.setup_intent_client_secret) {
        const { setupIntent } = await stripe.retrieveSetupIntent(
          query.setup_intent_client_secret as string
        );

        if (!setupIntent || setupIntent.status !== "succeeded" || !setupIntent.payment_method) {
          setStatus("error");
          setMessage(t("failedToSavePaymentMethod"));
          return;
        }

        const paymentMethodId = typeof setupIntent.payment_method === "string"
          ? setupIntent.payment_method
          : setupIntent.payment_method.id;

        const result = await dispatch(
          attachPaymentMethod({
            subscription_id: subscriptionId,
            payment_method_id: paymentMethodId,
            is_default: true,
          })
        );

        if (attachPaymentMethod.fulfilled.match(result)) {
          track("payment_method_saved", { subscription_id: subscriptionId || null });
          await dispatch(getActiveSubscription());
          setStatus("success");
          setMessage(t("paymentMethodSaved"));
        } else {
          setStatus("error");
          setMessage(t("couldNotAttachPaymentMethod"));
        }
      }

      else {
        setStatus("error");
        setMessage(t("invalidPaymentConfirmation"));
      }
    };

    finalize();
  }, [isReady, query, dispatch]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-mainColor" />
            <h2 className="mt-4 text-xl font-semibold">{t("processing")}</h2>
            <p className="mt-2 text-gray-600">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold text-green-700">{t("success")}</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="mt-4 text-sm text-gray-400">{t("redirectingToBilling")}</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-red-700">{t("failed")}</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="rounded border border-gray-300 bg-white px-6 py-2 text-gray-700"
              >
                {t("tryAgain")}
              </button>
              <button
                onClick={() => router.push("/parents/billing")}
                className="rounded bg-mainColor px-6 py-2 text-white"
              >
                {t("backToBilling")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentConfirmPage;