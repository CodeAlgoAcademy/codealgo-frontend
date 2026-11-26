import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import http from "../../axios.config";
import { IPlan, PlanPrice } from "types/interfaces/pricing.interface";
import { checkCoupon } from "utils/coupon";
import {
   QuickSignupState,
   getQuickSignup,
   readSignupError,
   saveQuickSignup,
   startQuickSignup,
} from "utils/quickSignup";

/**
 * Ad landing page: codealgoacademy.com/join/mo, /join/ks.
 *
 * Account, first kid and the first payment in one form, with the ad's coupon
 * already on. The regular parent path (signup, verify email, add kid, billing)
 * loses too many people coming in off an ad.
 *
 * ?code= overrides the state's coupon, ?plan= picks a product by id.
 */

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const DEFAULT_CODE = "MOKS30";

const STATES: Record<string, { name: string; code: string }> = {
   mo: { name: "Missouri", code: DEFAULT_CODE },
   ks: { name: "Kansas", code: DEFAULT_CODE },
};

const C = {
   blue: "#2073fa",
   ink: "#13203a",
   soft: "#5b6b85",
   sky: "#eaf1ff",
   line: "#dbe3f0",
   save: "#0e9f6e",
};

type Interval = "MONTH" | "YEAR";

interface Discount {
   code: string;
   percent: number;
}

const money = (cents: number) =>
   new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const per = (interval: Interval) => (interval === "YEAR" ? "year" : "month");

function discounted(cents: number, discount: Discount | null) {
   if (!discount) return cents;
   return Math.round(cents * (1 - discount.percent / 100));
}

export default function JoinPage() {
   const router = useRouter();
   const stateKey = String(router.query.state || "").toLowerCase();
   const region = STATES[stateKey];

   const [plans, setPlans] = useState<IPlan[]>([]);
   const [plansFailed, setPlansFailed] = useState(false);
   const [interval, setInterval] = useState<Interval>("MONTH");
   const [discount, setDiscount] = useState<Discount | null>(null);
   const [childName, setChildName] = useState("");

   useEffect(() => {
      http
         .get<IPlan[]>("/payment/product/")
         .then(({ data }) => setPlans(data || []))
         .catch(() => setPlansFailed(true));
   }, []);

   useEffect(() => {
      if (!router.isReady) return;
      const fromUrl = typeof router.query.code === "string" ? router.query.code : "";
      const code = (fromUrl || region?.code || DEFAULT_CODE).trim().toUpperCase();
      checkCoupon(code).then((res) => {
         if (res.ok && res.data.discount?.type === "percentage") {
            setDiscount({ code: res.data.code || code, percent: Number(res.data.discount.value) });
         }
      });
   }, [router.isReady, router.query.code, region?.code]);

   const plan = useMemo(() => {
      if (!plans.length) return null;
      const wanted = Number(router.query.plan);
      return plans.find((p) => p.id === wanted) || plans[0];
   }, [plans, router.query.plan]);

   const prices = useMemo(() => {
      const month = plan?.prices.find((p) => p.interval === "MONTH") || null;
      const year = plan?.prices.find((p) => p.interval === "YEAR") || null;
      return { MONTH: month, YEAR: year } as Record<Interval, PlanPrice | null>;
   }, [plan]);

   useEffect(() => {
      if (!prices.MONTH && prices.YEAR) setInterval("YEAR");
   }, [prices]);

   const price = prices[interval];
   const today = price ? discounted(price.amount_in_cent, discount) : 0;

   const options: StripeElementsOptions = {
      mode: "subscription",
      amount: Math.max(today, 50),
      currency: "usd",
      paymentMethodCreation: "manual",
      paymentMethodTypes: ["card"],
      fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap" }],
      appearance: {
         theme: "stripe",
         variables: {
            fontFamily: "Poppins, system-ui, sans-serif",
            colorPrimary: C.blue,
            colorText: C.ink,
            colorTextSecondary: C.soft,
            borderRadius: "10px",
            spacingUnit: "4px",
         },
         rules: {
            ".Input": { border: `1px solid ${C.line}`, boxShadow: "none", padding: "12px 14px" },
            ".Input:focus": { border: `1px solid ${C.blue}`, boxShadow: `0 0 0 3px ${C.sky}` },
            ".Label": { fontWeight: "500", color: C.ink },
         },
      },
   };

   const kid = childName.trim().split(" ")[0];

   return (
      <>
         <Head>
            <title>{region ? `CodeAlgo for ${region.name} families` : "Join CodeAlgo"}</title>
            <meta name="robots" content="noindex" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
         </Head>

         <div className="join min-h-screen bg-white" style={{ color: C.ink }}>
            <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 md:px-8">
               <Link href="/">
                  <a className="text-lg font-bold tracking-tight" style={{ color: C.ink }}>
                     CodeAlgo
                  </a>
               </Link>
               <Link href="/login/parent">
                  <a className="text-sm font-medium" style={{ color: C.soft }}>
                     Have an account? Log in
                  </a>
               </Link>
            </header>

            <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-8 md:grid-cols-[minmax(0,1fr)_380px] md:gap-16 md:px-8 md:pt-14">
               <section className="max-w-[540px]">
                  <h1 className="text-[2.1rem] font-extrabold leading-[1.08] tracking-[-0.02em] md:text-[3rem]">
                     {kid ? `Get ${kid} coding tonight.` : "Get your kid coding tonight."}
                  </h1>
                  <p className="mt-4 max-w-[46ch] text-[1.02rem] leading-relaxed" style={{ color: C.soft }}>
                     {discount && `${region ? `${region.name} families get` : "You get"} ${discount.percent}% off, already applied. `}
                     Make your account and pay here, then download the app and play.
                  </p>

                  <div className="mt-8 md:hidden">
                     <Summary kid={kid} price={price} interval={interval} discount={discount} today={today} compact />
                  </div>

                  {plansFailed ? (
                     <p className="mt-8 rounded-xl p-4 text-sm" style={{ background: C.sky }}>
                        Couldn&apos;t load plans. Refresh the page to try again.
                     </p>
                  ) : (
                     <Elements stripe={stripePromise} options={options}>
                        <SignupForm
                           stateKey={stateKey}
                           childName={childName}
                           setChildName={setChildName}
                           prices={prices}
                           interval={interval}
                           setInterval={setInterval}
                           price={price}
                           today={today}
                           discount={discount}
                        />
                     </Elements>
                  )}
               </section>

               <aside className="hidden md:block">
                  <div className="sticky top-10">
                     <Summary kid={kid} price={price} interval={interval} discount={discount} today={today} />
                  </div>
               </aside>
            </div>
         </div>

         <style jsx global>{`
            .join,
            .join input,
            .join button {
               font-family: "Poppins", system-ui, sans-serif;
            }
            .join input:focus-visible,
            .join button:focus-visible,
            .join a:focus-visible {
               outline: 3px solid ${C.blue};
               outline-offset: 2px;
            }
         `}</style>
      </>
   );
}

function Summary({
   kid,
   price,
   interval,
   discount,
   today,
   compact,
}: {
   kid: string;
   price: PlanPrice | null;
   interval: Interval;
   discount: Discount | null;
   today: number;
   compact?: boolean;
}) {
   return (
      <div className={`rounded-2xl ${compact ? "p-5" : "p-7"}`} style={{ background: C.sky }}>
         <p className="text-sm font-medium" style={{ color: C.soft }}>
            {kid ? `${kid}'s plan` : "Your kid's plan"}
         </p>
         {price ? (
            <>
               <div className="mt-2 flex items-baseline gap-3">
                  <span className={`${compact ? "text-4xl" : "text-5xl"} font-extrabold tracking-[-0.03em]`}>{money(today)}</span>
                  {discount && (
                     <span className="text-lg line-through" style={{ color: C.soft }}>
                        {money(price.amount_in_cent)}
                     </span>
                  )}
               </div>
               <p className="mt-1 text-sm" style={{ color: C.soft }}>
                  due today, first {per(interval)}
               </p>
               {discount && (
                  <p className="mt-4 inline-block rounded-full px-3 py-1 text-sm font-semibold text-white" style={{ background: C.save }}>
                     {discount.percent}% off with {discount.code}
                  </p>
               )}
               {!compact && (
                  <ul className="mt-6 space-y-2 border-t pt-5 text-sm leading-relaxed" style={{ borderColor: C.line }}>
                     <li>Then {money(price.amount_in_cent)} a {per(interval)}. Cancel anytime from your account.</li>
                     <li>Full game on iPhone, iPad and Android.</li>
                     <li>Parent dashboard to see what they&apos;re learning.</li>
                  </ul>
               )}
            </>
         ) : (
            <div className="mt-3 h-12 w-40 animate-pulse rounded-lg bg-white/70" />
         )}
      </div>
   );
}

interface FormProps {
   stateKey: string;
   childName: string;
   setChildName: (v: string) => void;
   prices: Record<Interval, PlanPrice | null>;
   interval: Interval;
   setInterval: (v: Interval) => void;
   price: PlanPrice | null;
   today: number;
   discount: Discount | null;
}

function SignupForm({ stateKey, childName, setChildName, prices, interval, setInterval, price, today, discount }: FormProps) {
   const stripe = useStripe();
   const elements = useElements();
   const router = useRouter();

   const [firstName, setFirstName] = useState("");
   const [lastName, setLastName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState<{ field?: string; message: string } | null>(null);
   // Set once the account exists. A declined card after that retries the
   // payment on the same account instead of making a new one.
   const [started, setStarted] = useState<QuickSignupState | null>(null);

   useEffect(() => {
      const existing = getQuickSignup();
      if (existing && !existing.completed) setStarted(existing);
   }, []);

   useEffect(() => {
      elements?.update({ amount: Math.max(today, 50) });
   }, [elements, today]);

   const submit = async (e: FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements || !price) return;
      setError(null);
      setBusy(true);

      try {
         const { error: submitError } = await elements.submit();
         if (submitError) {
            setError({ field: "card", message: submitError.message || "Check your card details." });
            return;
         }

         const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
            elements,
            params: { billing_details: { name: `${firstName} ${lastName}`.trim(), email: email || started?.email } },
         });
         if (pmError || !paymentMethod) {
            setError({ field: "card", message: pmError?.message || "Check your card details." });
            return;
         }

         let state = started;
         if (!state) {
            try {
               const data = await startQuickSignup({
                  first_name: firstName,
                  last_name: lastName,
                  email,
                  password,
                  child_name: childName,
                  price_id: price.id,
                  promotion_code: discount?.code,
                  payment_method_id: paymentMethod.id,
                  state: stateKey,
               });
               state = { ...data, email };
               saveQuickSignup(state);
               setStarted(state);
            } catch (err) {
               setError(readSignupError(err));
               return;
            }
         }

         if (state.client_secret) {
            const { error: payError } = await stripe.confirmPayment({
               clientSecret: state.client_secret,
               confirmParams: {
                  payment_method: paymentMethod.id,
                  return_url: `${window.location.origin}/join/welcome`,
               },
               redirect: "if_required",
            });
            if (payError) {
               setError({ field: "card", message: payError.message || "Your card was declined. Try another card." });
               return;
            }
         }

         router.push("/join/welcome");
      } finally {
         setBusy(false);
      }
   };

   const fieldError = (name: string) => (error?.field === name ? error.message : null);

   return (
      <form onSubmit={submit} className="mt-8 space-y-7" noValidate={false}>
         {!started && (
            <>
               <fieldset className="space-y-4">
                  <legend className="mb-3 text-lg font-bold">You</legend>
                  <div className="grid grid-cols-2 gap-3">
                     <Field label="First name" value={firstName} onChange={setFirstName} autoComplete="given-name" required />
                     <Field label="Last name" value={lastName} onChange={setLastName} autoComplete="family-name" required />
                  </div>
                  <Field
                     label="Email"
                     type="email"
                     value={email}
                     onChange={setEmail}
                     autoComplete="email"
                     required
                     error={
                        fieldError("email") === "already_exists" ? (
                           <>
                              This email already has an account.{" "}
                              <Link href="/login/parent">
                                 <a className="font-semibold underline">Log in instead</a>
                              </Link>
                           </>
                        ) : (
                           fieldError("email")
                        )
                     }
                  />
                  <Field
                     label="Password"
                     type="password"
                     value={password}
                     onChange={setPassword}
                     autoComplete="new-password"
                     minLength={8}
                     hint="At least 8 characters. You'll use this to log in to the app."
                     required
                     error={fieldError("password")}
                  />
               </fieldset>

               <fieldset>
                  <legend className="mb-3 text-lg font-bold">Your kid</legend>
                  <Field
                     id="kid-first-name"
                     label="First name"
                     value={childName}
                     onChange={setChildName}
                     autoComplete="off"
                     hint="We make their game login for you. You can add more kids later."
                     required
                     error={fieldError("child_name")}
                  />
               </fieldset>
            </>
         )}

         <fieldset>
            <legend className="mb-3 text-lg font-bold">Plan</legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup">
               {(["MONTH", "YEAR"] as Interval[]).map((key) => {
                  const p = prices[key];
                  if (!p) return null;
                  const active = interval === key;
                  return (
                     <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={!!started}
                        onClick={() => setInterval(key)}
                        className="rounded-xl border-2 px-4 py-3 text-left transition-colors disabled:opacity-60"
                        style={{ borderColor: active ? C.blue : C.line, background: active ? C.sky : "white" }}
                     >
                        <span className="block font-semibold">{key === "YEAR" ? "Yearly" : "Monthly"}</span>
                        <span className="block text-sm" style={{ color: C.soft }}>
                           {money(discounted(p.amount_in_cent, discount))} first {per(key)}
                        </span>
                     </button>
                  );
               })}
            </div>
         </fieldset>

         <fieldset>
            <legend className="mb-3 text-lg font-bold">Card</legend>
            {started && (
               <p className="mb-3 text-sm" style={{ color: C.soft }}>
                  Your account for {started.email} is set up. The payment didn&apos;t go through, so try the card again or use another one.
               </p>
            )}
            <PaymentElement
               options={{
                  layout: "tabs",
                  wallets: { applePay: "auto", googlePay: "auto" },
                  defaultValues: { billingDetails: { address: { country: "US" } } },
               }}
            />
            {fieldError("card") || fieldError("payment") ? (
               <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                  {fieldError("card") || fieldError("payment")}
               </p>
            ) : null}
         </fieldset>

         {error && !["email", "password", "child_name", "card", "payment"].includes(error.field || "") && (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">
               {error.message}
            </p>
         )}

         <div>
            <button
               type="submit"
               disabled={busy || !stripe || !price}
               className="w-full rounded-xl py-4 text-lg font-bold text-white transition-opacity disabled:opacity-60"
               style={{ background: C.blue }}
            >
               {busy ? "Processing payment..." : price ? `Pay ${money(today)} and create account` : "Loading plans..."}
            </button>
            <p className="mt-3 text-center text-xs leading-relaxed" style={{ color: C.soft }}>
               By paying you agree to our{" "}
               <Link href="/privacy-policy">
                  <a className="underline">terms and privacy policy</a>
               </Link>
               . Renews at {price ? money(price.amount_in_cent) : "full price"} a {per(interval)} until you cancel.
            </p>
         </div>
      </form>
   );
}

function Field({
   id: givenId,
   label,
   value,
   onChange,
   type = "text",
   hint,
   error,
   ...rest
}: {
   id?: string;
   label: string;
   value: string;
   onChange: (v: string) => void;
   type?: string;
   hint?: string;
   error?: React.ReactNode;
   autoComplete?: string;
   required?: boolean;
   minLength?: number;
}) {
   const id = givenId || `f-${label.toLowerCase().replace(/\W+/g, "-")}`;
   return (
      <div>
         <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
            {label}
         </label>
         <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-[10px] border px-3.5 py-3 text-base outline-none transition-shadow focus:shadow-[0_0_0_3px_#eaf1ff]"
            style={{ borderColor: error ? "#dc2626" : C.line }}
            aria-invalid={!!error}
            aria-describedby={hint || error ? `${id}-note` : undefined}
            {...rest}
         />
         {(error || hint) && (
            <p id={`${id}-note`} className={`mt-1.5 text-sm ${error ? "font-medium text-red-600" : ""}`} style={error ? undefined : { color: C.soft }}>
               {error || hint}
            </p>
         )}
      </div>
   );
}
