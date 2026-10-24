import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, XCircle } from "lucide-react";
import ActivateShell from "@/components/activate/ActivateShell";
import ReturnToGame from "@/components/activate/ReturnToGame";
import {
   activateApi,
   ActivateSession,
   authed,
   errorText,
   hasPlanAccess,
   openSiteAs,
   readSession,
} from "@/components/activate/activateApi";
import { track } from "utils/siteTracker";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/**
 * Stripe's return_url for /activate. Confirms the payment (or saves the card for a
 * trial), then waits for the webhook to mark the plan live so that "you're all
 * set" is actually true when the student goes back to the game.
 */
const ActivateDone = () => {
   const router = useRouter();
   const { t } = useTranslation("auth");
   const ran = useRef(false);
   const [session, setSession] = useState<ActivateSession | null>(null);
   const [state, setState] = useState<{ kind: "loading" | "ok" | "error"; message: string }>({
      kind: "loading",
      message: "",
   });

   useEffect(() => {
      if (!router.isReady || ran.current) return;
      ran.current = true;

      const finish = async () => {
         const session = readSession();
         setSession(session);
         const stripe = await stripePromise;
         const q = router.query;
         if (!stripe || !session) {
            setState({ kind: "error", message: t("activateOpenFromGame") });
            return;
         }

         try {
            if (q.payment_intent_client_secret) {
               const { paymentIntent } = await stripe.retrievePaymentIntent(q.payment_intent_client_secret as string);
               if (!paymentIntent || paymentIntent.status !== "succeeded") {
                  track("activate_payment_failed", { status: paymentIntent?.status || "missing" });
                  setState({ kind: "error", message: t("activatePaymentFailed") });
                  return;
               }
            } else if (q.setup_intent_client_secret) {
               const { setupIntent } = await stripe.retrieveSetupIntent(q.setup_intent_client_secret as string);
               if (!setupIntent || setupIntent.status !== "succeeded" || !setupIntent.payment_method) {
                  setState({ kind: "error", message: t("activatePaymentFailed") });
                  return;
               }
               const pm = typeof setupIntent.payment_method === "string" ? setupIntent.payment_method : setupIntent.payment_method.id;
               await activateApi.post(
                  "/payment/subscription/attach-payment",
                  { subscription_id: Number(q.subscription_id), payment_method_id: pm, is_default: true },
                  authed(session)
               );
            } else {
               setState({ kind: "error", message: t("activateOpenFromGame") });
               return;
            }

            // The plan goes live from Stripe's webhook, a second or two after the
            // payment. Wait for it rather than telling them it worked too early.
            for (let i = 0; i < 15; i++) {
               if (await hasPlanAccess(session).catch(() => false)) {
                  track("activate_succeeded", { role: session.user?.is_parent ? "parent" : "student" });
                  setState({ kind: "ok", message: session.user?.is_parent ? t("activateParentUnlocked") : t("activateUnlocked") });
                  return;
               }
               await new Promise((r) => setTimeout(r, 2000));
            }
            setState({ kind: "ok", message: t("activateProcessing") });
         } catch (err) {
            setState({ kind: "error", message: errorText(err, t("activatePaymentFailed")) });
         }
      };

      finish();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.isReady]);

   return (
      <ActivateShell title={t("activateTitle")}>
         {state.kind === "loading" && (
            <div className="py-10 text-center">
               <Loader2 className="mx-auto h-12 w-12 animate-spin text-mainColor" />
               <p className="mt-4 text-gray-600">{t("activateConfirming")}</p>
            </div>
         )}
         {state.kind === "ok" && (
            <ReturnToGame
               message={state.message}
               extra={
                  session?.user?.is_parent && (
                     <button
                        type="button"
                        onClick={() => openSiteAs(session, "/parents/billing")}
                        className="mt-4 block w-full rounded-xl border-2 border-mainColor py-3 text-center font-semibold text-mainColor"
                     >
                        {t("activateOpenBilling")}
                     </button>
                  )
               }
            />
         )}
         {state.kind === "error" && (
            <div className="text-center">
               <XCircle className="mx-auto h-14 w-14 text-red-500" />
               <p className="mt-4 text-gray-700">{state.message}</p>
               <button onClick={() => router.push("/activate")} className="mt-6 w-full rounded-xl bg-mainColor py-3 font-semibold text-white">
                  {t("activateTryAgain")}
               </button>
            </div>
         )}
      </ActivateShell>
   );
};

export default ActivateDone;
