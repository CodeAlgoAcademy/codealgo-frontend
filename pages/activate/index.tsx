import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import { FC, FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Loader2, XCircle } from "lucide-react";
import ActivateShell from "@/components/activate/ActivateShell";
import ReturnToGame from "@/components/activate/ReturnToGame";
import {
   activateApi,
   ActivateSession,
   ActiveSub,
   authed,
   currentSubscription,
   errorText,
   isLive,
   openSiteAs,
   readSession,
   writeSession,
} from "@/components/activate/activateApi";
import { useInitStripe } from "hooks/useStripe";
import { track } from "utils/siteTracker";

/**
 * Where the game's "activate" button lands. The game opens
 * /activate?code=<handoff code>; the code signs this tab in as that player
 * (see users/api/web_handoff.py), then they pick a plan and pay with Stripe.
 * Stripe sends them to /activate/done, which confirms and hands them back.
 *
 * Students buy for themselves. Parents pick which of their kids the plan covers,
 * same as the billing stepper, without having to sign in to the site first.
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
interface Child {
   id: number;
   fullName?: string;
   username?: string;
}

// trial: plan is live, card is for after the trial. pay: card is charged now.
// fix: a renewal failed and the card needs replacing.
type PayMode = "trial" | "pay" | "fix";

type Step =
   | { kind: "loading" }
   | { kind: "error"; message: string }
   | { kind: "plans" }
   | { kind: "pay"; clientSecret: string; subscriptionId?: number; mode: PayMode }
   | { kind: "covered"; sub: ActiveSub }
   | { kind: "done"; message: string };

const money = (cents: number) =>
   new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const childName = (c: { fullName?: string; firstName?: string; username?: string }) =>
   (c.fullName || c.firstName || "").trim() || c.username || "";

const Activate = () => {
   const router = useRouter();
   const { t } = useTranslation("auth");
   const [session, setSession] = useState<ActivateSession | null>(null);
   const [step, setStep] = useState<Step>({ kind: "loading" });
   const [products, setProducts] = useState<Product[]>([]);
   const [children, setChildren] = useState<Child[]>([]);
   const [picked, setPicked] = useState<number[]>([]);
   const [busyPrice, setBusyPrice] = useState<number | null>(null);

   const isParent = !!session?.user?.is_parent;

   const startFix = useCallback(
      async (s: ActivateSession, subscriptionId: number) => {
         const setup = await activateApi.post("/payment/setup-intent", { subscription_id: subscriptionId }, authed(s));
         setStep({ kind: "pay", clientSecret: setup.data.client_secret, subscriptionId, mode: "fix" });
      },
      []
   );

   const loadPlans = useCallback(
      async (s: ActivateSession) => {
         setStep({ kind: "loading" });

         // Already covered (paid on another device, or a parent added them)? Say so
         // instead of selling them a second plan.
         if (s.user?.is_student) {
            try {
               const access = await activateApi.get("/auth/student/access-check/", authed(s));
               if (access.data?.has_access) {
                  setStep({ kind: "done", message: t("activateAlreadyActive") });
                  return;
               }
            } catch {
               // Not fatal, the plans below still work.
            }
         }

         let sub: ActiveSub | null = null;
         try {
            sub = await currentSubscription(s);
         } catch {
            // Same, the initiate call below sorts out whatever state they are in.
         }

         if (sub && isLive(sub)) {
            if (s.user?.is_parent) setStep({ kind: "covered", sub });
            else setStep({ kind: "done", message: t("activateAlreadyActive") });
            return;
         }

         if (sub && sub.status?.toUpperCase() === "PAST_DUE") {
            try {
               await startFix(s, sub.id);
               return;
            } catch (err) {
               setStep({ kind: "error", message: errorText(err, t("activateStartFailed")) });
               return;
            }
         }

         try {
            const [productsRes, kidsRes] = await Promise.all([
               activateApi.get<Product[]>("/payment/product/"),
               s.user?.is_parent ? activateApi.get<Child[]>("/parent/child/", authed(s)) : Promise.resolve({ data: [] as Child[] }),
            ]);
            setProducts(productsRes.data || []);
            const kids = (kidsRes.data || []).map((c) => ({ ...c, id: Number(c.id) }));
            setChildren(kids);
            // A pending checkout keeps the kids it was started for, otherwise everyone.
            const pendingKids = sub?.children?.map((c) => Number(c.id)) || [];
            setPicked(pendingKids.length ? pendingKids : kids.map((c) => c.id));
            setStep({ kind: "plans" });
         } catch (err) {
            setStep({ kind: "error", message: errorText(err, t("activateLoadFailed")) });
         }
      },
      [t, startFix]
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

         if (!s.user?.is_student && !s.user?.is_parent) {
            setStep({ kind: "error", message: t("activateStudentsOnly") });
            return;
         }

         setSession(s);
         track("activate_opened", { role: s.user?.is_parent ? "parent" : "student" });
         await loadPlans(s);
      };

      start();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.isReady]);

   const toggleChild = (id: number) =>
      setPicked((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

   const choose = async (price: Price) => {
      if (!session) return;
      setBusyPrice(price.id);
      try {
         const body: Record<string, unknown> = { price_id: price.id, is_trial: true };
         if (isParent) body.children = picked;
         const res = await activateApi.post("/payment/subscription/initiate", body, authed(session));
         const data = res.data || {};
         const subId: number | undefined = data.subscription ?? data.subscription_id;
         track("activate_plan_chosen", { price_id: price.id, status: data.status, role: isParent ? "parent" : "student" });

         if (data.status === "requires_payment_action") {
            let secret: string | undefined = data.client_secret;
            if (!secret) {
               // Older open invoice with no intent attached to the response. The
               // subscription row still has it.
               const sub = await currentSubscription(session).catch(() => null);
               secret = sub?.latest_client_secret || undefined;
            }
            if (!secret) {
               setStep({ kind: "error", message: t("activateStartFailed") });
               return;
            }
            setStep({ kind: "pay", clientSecret: secret, subscriptionId: subId, mode: "pay" });
         } else if (data.status === "trialing") {
            // Trial is already running, so the game is unlocked now. Take a card so it
            // carries on after the trial instead of locking again.
            const setup = await activateApi.post("/payment/setup-intent", { subscription_id: subId }, authed(session));
            setStep({ kind: "pay", clientSecret: setup.data.client_secret, subscriptionId: subId, mode: "trial" });
         } else if (data.status === "payment_failed" && subId) {
            await startFix(session, subId);
         } else if (data.status === "already_active") {
            await loadPlans(session);
         } else if (data.status === "success") {
            setStep({ kind: "done", message: isParent ? t("activateParentUnlocked") : t("activateUnlocked") });
         } else {
            setStep({ kind: "error", message: data.message || t("activateStartFailed") });
         }
      } catch (err) {
         setStep({ kind: "error", message: errorText(err, t("activateStartFailed")) });
      } finally {
         setBusyPrice(null);
      }
   };

   const dashboardButton = session && isParent && (
      <button
         type="button"
         onClick={() => openSiteAs(session, "/parents/billing")}
         className="mt-4 block w-full rounded-xl border-2 border-mainColor py-3 text-center font-semibold text-mainColor"
      >
         {t("activateOpenBilling")}
      </button>
   );

   const trialDoneMessage = isParent ? t("activateParentTrialStarted") : t("activateTrialStarted");

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
               {session && (
                  <button
                     type="button"
                     onClick={() => loadPlans(session)}
                     className="mt-6 w-full rounded-xl bg-mainColor py-3 font-semibold text-white"
                  >
                     {t("activateTryAgain")}
                  </button>
               )}
            </div>
         )}

         {step.kind === "done" && <ReturnToGame message={step.message} extra={dashboardButton} />}

         {step.kind === "covered" && (
            <ReturnToGame
               message={
                  step.sub.children?.length
                     ? t("activateParentCovered", {
                          plan: step.sub.plan_name || "",
                          names: step.sub.children.map(childName).join(", "),
                       })
                     : t("activateParentCoveredNoKids", { plan: step.sub.plan_name || "" })
               }
               extra={dashboardButton}
            />
         )}

         {step.kind === "plans" && (
            <>
               <h1 className="text-center text-2xl font-bold">{t("activateTitle")}</h1>
               <p className="mt-2 text-center text-gray-600">
                  {t("activateSignedInAs", { name: session?.user?.firstname || session?.user?.username || "" })}
               </p>

               {isParent && (
                  <div className="mt-6">
                     <h2 className="text-sm font-semibold text-gray-700">{t("activateWhoFor")}</h2>
                     {children.length === 0 ? (
                        <p className="mt-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">{t("activateNoKidsYet")}</p>
                     ) : (
                        <ul className="mt-2 space-y-2">
                           {children.map((c) => {
                              const on = picked.includes(c.id);
                              return (
                                 <li key={c.id}>
                                    <button
                                       type="button"
                                       disabled={busyPrice !== null}
                                       onClick={() => toggleChild(c.id)}
                                       className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition ${
                                          on ? "border-mainColor bg-mainColor/5" : "border-gray-200"
                                       }`}
                                    >
                                       <span className="font-medium text-gray-900">{childName(c)}</span>
                                       <span
                                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                             on ? "border-mainColor bg-mainColor text-white" : "border-gray-300"
                                          }`}
                                       >
                                          {on && <Check className="h-4 w-4" />}
                                       </span>
                                    </button>
                                 </li>
                              );
                           })}
                        </ul>
                     )}
                     {children.length > 0 && picked.length === 0 && (
                        <p className="mt-2 text-sm text-red-600">{t("activatePickAKid")}</p>
                     )}
                  </div>
               )}

               <div className="mt-6 space-y-3">
                  {products.flatMap((p) =>
                     [...p.prices]
                        .sort((a, b) => (a.interval === "YEAR" ? -1 : 1) - (b.interval === "YEAR" ? -1 : 1))
                        .map((price) => (
                           <button
                              key={price.id}
                              type="button"
                              disabled={busyPrice !== null || (isParent && children.length > 0 && picked.length === 0)}
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
               {isParent && children.length === 0 && dashboardButton}
            </>
         )}

         {step.kind === "pay" && (
            <PayStep
               key={step.clientSecret}
               clientSecret={step.clientSecret}
               subscriptionId={step.subscriptionId}
               mode={step.mode}
               onSkip={() => setStep({ kind: "done", message: trialDoneMessage })}
            />
         )}
      </ActivateShell>
   );
};

interface PayProps {
   clientSecret: string;
   subscriptionId?: number;
   mode: PayMode;
   onSkip: () => void;
}

const PayStep: FC<PayProps> = (props) => {
   const { stripePromise, options } = useInitStripe(props.clientSecret);
   if (!options) return null;
   return (
      <Elements stripe={stripePromise} options={options}>
         <PayForm {...props} />
      </Elements>
   );
};

const PayForm: FC<PayProps> = ({ clientSecret, subscriptionId, mode, onSkip }) => {
   const stripe = useStripe();
   const elements = useElements();
   const { t } = useTranslation("auth");
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState("");
   const [amount, setAmount] = useState<{ value: number; currency: string } | null>(null);
   const isPayment = clientSecret.startsWith("pi_");

   // Show what is about to be charged. Kids past the first change the total, so
   // the plan price alone would be wrong.
   useEffect(() => {
      if (!stripe || !isPayment) return;
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
         if (paymentIntent) setAmount({ value: paymentIntent.amount, currency: paymentIntent.currency });
      });
   }, [stripe, clientSecret, isPayment]);

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

   const title = isPayment ? t("activatePayTitle") : mode === "fix" ? t("activateFixCardTitle") : t("activateCardTitle");
   const total =
      amount &&
      new Intl.NumberFormat("en-US", { style: "currency", currency: amount.currency.toUpperCase() }).format(amount.value / 100);

   return (
      <form onSubmit={submit}>
         <h2 className="text-center text-xl font-bold">{title}</h2>
         {mode === "trial" && <p className="mt-2 text-center text-sm text-green-700">{t("activateTrialRunning")}</p>}
         {mode === "fix" && <p className="mt-2 text-center text-sm text-amber-700">{t("activateFixCardNote")}</p>}
         {total && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
               <span className="text-sm text-gray-600">{t("activateDueToday")}</span>
               <span className="text-lg font-bold text-mainColor">{total}</span>
            </div>
         )}
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
         {mode === "trial" && (
            <button type="button" onClick={onSkip} className="mt-3 w-full py-2 text-sm text-gray-500 underline">
               {t("activateSkipCard")}
            </button>
         )}
      </form>
   );
};

export default Activate;
