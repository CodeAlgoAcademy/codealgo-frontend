import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { FormEvent, useState, useEffect } from "react";
import { toast } from "sonner";
import Loader from "@/components/UI/loader";
import { useTranslation } from "react-i18next";
import { useBilling } from "@/components/billing/BillingContext";

interface PaymentFormProps {
  subscriptionId: number;
  clientSecret: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ subscriptionId, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation("parent");
  const { basePath } = useBilling();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("usd");

  useEffect(() => {
    if (!stripe || !clientSecret) return;
    if (clientSecret.startsWith("pi_")) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        if (paymentIntent) {
          setAmount(paymentIntent.amount / 100);
          setCurrency(paymentIntent.currency);
        }
      });
    }
  }, [stripe, clientSecret]);

  const formatPrice = (val: number, curr: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr.toUpperCase(),
    }).format(val);
  };

  if (!clientSecret) return <div className="p-4 text-center">{t("finalizing")}</div>;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error(t("paymentFormNotReady"));
      return;
    }

    setIsLoading(true);
    try {
      const isPayment = clientSecret?.startsWith("pi_");
      
      const result = isPayment 
        ? await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}${basePath}/payment/confirm?subscription_id=${subscriptionId}&type=payment`,
            },
          })
        : await stripe.confirmSetup({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}${basePath}/payment/confirm?subscription_id=${subscriptionId}&type=setup`,
            },
          });

      if (result.error) {
        toast.error(result.error.message || t("paymentFailed"));
      } 
    } catch (error) {
      toast.error(t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      {amount !== null && (
        <div className="mb-6 rounded-xl bg-gray-50 p-4 border border-gray-100 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">{t("totalAmountToPay")}</span>
          <span className="text-xl font-bold text-mainColor">
            {formatPrice(amount, currency)}
          </span>
        </div>
      )}

      <div className="mb-6">
        <PaymentElement />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="rounded bg-mainColor px-6 py-2 text-white disabled:opacity-50 transition hover:bg-opacity-90 font-semibold"
        >
          {isLoading ? (
            <Loader color="white" />
          ) : clientSecret?.startsWith("pi_") ? (
            `${t("pay")} ${amount !== null ? formatPrice(amount, currency) : t("now")}`
          ) : (
            t("savePaymentMethod")
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;