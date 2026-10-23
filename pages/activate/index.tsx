import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import { FC, FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, XCircle } from "lucide-react";
import ActivateShell from "@/components/activate/ActivateShell";
import ReturnToGame from "@/components/activate/ReturnToGame";
import {
   activateApi,
   ActivateSession,
   authed,
   errorText,
   readSession,
   writeSession,
} from "@/components/activate/activateApi";
import { useInitStripe } from "hooks/useStripe";
import { track } from "utils/siteTracker";

/**
 * Where the game's "activate" button lands. The game opens
 * /activate?code=<handoff code>; the code signs this tab in as that student
 * (see users/api/web_handoff.py), then they pick a plan and pay with Stripe.
 * Stripe sends them to /activate/done, which confirms and hands them back.
 */

interface Price {
   id: number;
   amount_in_cent: number;
   interval: "MONTH" | "YEAR" | string;
}
interface Product {
   id: number;
   name: string;
   prices: Price[];
}

type Step =
   | { kind: "loading" }
   | { kind: "error"; message: string }
   | { kind: "plans" }
   | { kind: "pay"; clientSecret: string; subscriptionId?: number; trial: boolean }
   | { kind: "done"; message: string };

const money = (cents: number) =>
   new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const Activate = () => {
   const router = useRouter();
   const { t } = useTranslation("auth");
   const [session, setSession] = useState<ActivateSession | null>(null);
   const [step, setStep] = useState<Step>({ kind: "loading" });
   const [products, setProducts] = useState<Product[]>([]);
   const [busyPrice, setBusyPrice] = useState<number | null>(null);

   const loadPlans = useCallback(
      async (s: ActivateSession) => {
         // Already covered (paid on another device, or a parent added them)? Say so
         // instead of selling them a second plan.
         try {
            const access = await activateApi.get("/auth/student/access-check/", authed(s));
            if (access.data?.has_access) {
               setStep({ kind: "done", message: t("activateAlreadyActive") });
               return;
            }
         } catch {
            // Not fatal, the plans below still work.
         }

         try {
            const res = await activateApi.get<Product[]>("/payment/product/");
            setProducts(res.data || []);
            setStep({ kind: "plans" });
         } catch (err) {
            setStep({ kind: "error", message: errorText(err, t("activateLoadFailed")) });
         }
      },
      [t]
   );

   useEffect(() => {
      if (!router.isReady) return;
      const code = router.query.code as string | undefined;

      const start = async () => {
         let s = readSession();
         if (code) {
            try {
               const res = await activateApi.post("/auth/web-handoff/redeem/", { code });
               s = res.data as ActivateSession;
               writeSession(s);
               // Drop the code from the address bar and history.
               router.replace("/activate", undefined, { shallow: true });
            } catch (err) {
               setStep({ kind: "error", message: errorText(err, t("activateLinkInvalid")) });
               return;
            }
         }

         if (!s) {
            setStep({ kind: "error", message: t("activateOpenFromGame") });
            return;
         }

         if (!s.user?.is_student) {
            setStep({ kind: "error", message: t("activateStudentsOnly") });
            return;
         }

         setSession(s);
         track("activate_opened", {});
         await loadPlans(s);
      };

      start();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.isReady]);

   const choose = async (price: Price) => {
      if (!session) return;
      setBusyPrice(price.id);
      try {
         const res = await activateApi.post(
            "/payment/subscription/initiate",
            { price_id: price.id, is_trial: true },
            authed(session)
         );
         const data = res.data || {};
         track("activate_plan_chosen", { price_id: price.id, status: data.status });

         if (data.status === "requires_payment_action" && data.client_secret) {
            setStep({ kind: "pay", clientSecret: data.client_secret, trial: false });
         } else if (data.status === "trialing" || data.status === "payment_failed") {
            // Trial is already running, so the game is unlocked now. Take a card so it
            // carries on after the trial instead of locking again.
            const subId = data.subscription ?? data.subscription_id;
            const setup = await activateApi.post("/payment/setup-intent", { subscription_id: subId }, authed(session));
            setStep({ kind: "pay", clientSecret: setup.data.client_secret, subscriptionId: subId, trial: data.status === "trialing" });
         } else if (data.status === "already_active" || data.status === "success") {
            setStep({ kind: "done", message: t("activateAlreadyActive") });
         } else {
            setStep({ kind: "error", message: data.message || t("activateStartFailed") });
         }
      } catch (err) {
         setStep({ kind: "error", message: errorText(err, t("activateStartFailed")) });
      } finally {
         setBusyPrice(null);
      }
   };

   return (
      <ActivateShell title={t("activateTitle")}>
         {step.kind === "loading" && (
            <div className="py-10 text-center">
               <Loader2 className="mx-auto h-12 w-12 animate-spin text-mainColor" />
            </div>
         )}

         {step.kind === "error" && (
            <div className="text-center">
               <XCircle className="mx-auto h-14 w-14 text-red-500" />
               <p className="mt-4 text-gray-700">{step.message}</p>
            </div>
         )}

         {step.kind === "done" && <ReturnToGame message={step.message} />}

         {step.kind === "plans" && (
            <>
               <h1 className="text-center text-2xl font-bold">{t("activateTitle")}</h1>
               <p className="mt-2 text-center text-gray-600">
                  {t("activateSignedInAs", { name: session?.user?.firstname || session?.user?.username || "" })}
               </p>
               <div className="mt-6 space-y-3">
                  {products.flatMap((p) =>
                     [...p.prices]
                        .sort((a, b) => (a.interval === "YEAR" ? -1 : 1) - (b.interval === "YEAR" ? -1 : 1))
                        .map((price) => (
                           <button
                              key={price.id}
                              type="button"
                              disabled={busyPrice !== null}
                              onClick={() => choose(price)}
                              className="flex w-full items-center justify-between rounded-xl border-2 border-gray-200 px-5 py-4 text-left transition hover:border-mainColor disabled:opacity-60"
                           >
                              <span>
                                 <span className="block font-semibold">
                                    {price.interval === "YEAR" ? t("activateYearly") : t("activateMonthly")}
                                 </span>
                                 <span className="text-sm text-gray-500">{p.name}</span>
                              </span>
                              <span className="text-right">
                                 <span className="block text-lg font-bold text-mainColor">{money(price.amount_in_cent)}</span>
                                 <span className="text-sm text-gray-500">
                                    {price.interval === "YEAR" ? t("activatePerYear") : t("activatePerMonth")}
                                 </span>
                              </span>
                              {busyPrice === price.id && <Loader2 className="ml-3 h-5 w-5 animate-spin" />}
                           </button>
                        ))
                  )}
               </div>
               <p className="mt-4 text-center text-sm text-gray-500">{t("activateTrialNote")}</p>
            </>
         )}

         {step.kind === "pay" && (
            <PayStep
               clientSecret={step.clientSecret}
               subscriptionId={step.subscriptionId}
               trial={step.trial}
               onSkip={() => setStep({ kind: "done", message: t("activateTrialStarted") })}
            />
         )}
      </ActivateShell>
   );
};

const PayStep: FC<{ clientSecret: string; subscriptionId?: number; trial: boolean; onSkip: () => void }> = (props) => {
   const { stripePromise, options } = useInitStripe(props.clientSecret);
   if (!options) return null;
   return (
      <Elements stripe={stripePromise} options={options}>
         <PayForm {...props} />
      </Elements>
   );
};

const PayForm: FC<{ clientSecret: string; subscriptionId?: number; trial: boolean; onSkip: () => void }> = ({
   clientSecret,
   subscriptionId,
   trial,
   onSkip,
}) => {
   const stripe = useStripe();
   const elements = useElements();
   const { t } = useTranslation("auth");
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState("");
   const isPayment = clientSecret.startsWith("pi_");

   const submit = async (e: FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;
      setBusy(true);
      setError("");
      const base = `${window.location.origin}/activate/done?${subscriptionId ? `subscription_id=${subscriptionId}&` : ""}`;
      const result = isPayment
         ? await stripe.confirmPayment({ elements, confirmParams: { return_url: `${base}type=payment` } })
         : await stripe.confirmSetup({ elements, confirmParams: { return_url: `${base}type=setup` } });
      // Only reached on an error; success leaves for return_url.
      if (result.error) setError(result.error.message || t("activatePaymentFailed"));
      setBusy(false);
   };

   return (
      <form onSubmit={submit}>
         <h2 className="text-center text-xl font-bold">{isPayment ? t("activatePayTitle") : t("activateCardTitle")}</h2>
         {trial && <p className="mt-2 text-center text-sm text-green-700">{t("activateTrialRunning")}</p>}
         <div className="mt-6">
            <PaymentElement />
         </div>
         {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
         <button
            type="submit"
            disabled={busy || !stripe || !elements}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-mainColor py-3 font-semibold text-white disabled:opacity-60"
         >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : isPayment ? t("activatePayButton") : t("activateSaveCard")}
         </button>
         {trial && (
            <button type="button" onClick={onSkip} className="mt-3 w-full py-2 text-sm text-gray-500 underline">
               {t("activateSkipCard")}
            </button>
         )}
      </form>
   );
};

export default Activate;
