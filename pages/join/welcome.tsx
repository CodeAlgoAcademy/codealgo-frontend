import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { QuickSignupState, completeQuickSignup, getQuickSignup, saveQuickSignup } from "utils/quickSignup";

/**
 * After the ad signup. Finishes the account (activates the plan and opens up
 * login, payment/quick_signup complete) and sends them to the app stores.
 *
 * Also the Stripe return_url, so it has to work after a full page load: all it
 * needs is in sessionStorage. complete is idempotent, so a refresh is fine.
 */

const APP_STORE = "https://apps.apple.com/us/app/codealgo/id6753643848";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.DevAlgo.codealgoacademy";

const C = {
   blue: "#2073fa",
   ink: "#13203a",
   soft: "#5b6b85",
   sky: "#eaf1ff",
   line: "#dbe3f0",
};

type Phase = "working" | "done" | "pending" | "missing";

export default function Welcome() {
   const [state, setState] = useState<QuickSignupState | null>(null);
   const [phase, setPhase] = useState<Phase>("working");

   useEffect(() => {
      const saved = getQuickSignup();
      if (!saved) {
         setPhase("missing");
         return;
      }
      setState(saved);
      if (saved.completed) {
         setPhase("done");
         return;
      }

      let tries = 0;
      // Stripe can take a moment to mark the subscription active after the
      // card confirms, so give it a few goes before calling it stuck.
      const attempt = async () => {
         try {
            await completeQuickSignup(saved);
            const next = { ...saved, completed: true };
            saveQuickSignup(next);
            setState(next);
            setPhase("done");
         } catch {
            tries += 1;
            if (tries < 5) setTimeout(attempt, 1500);
            else setPhase("pending");
         }
      };
      attempt();
   }, []);

   return (
      <>
         <Head>
            <title>You&apos;re in | CodeAlgo</title>
            <meta name="robots" content="noindex" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
         </Head>

         <div className="welcome min-h-screen bg-white" style={{ color: C.ink }}>
            <main className="mx-auto max-w-[620px] px-5 pb-20 pt-14 md:pt-24">
               {phase === "working" && (
                  <p className="text-lg" style={{ color: C.soft }} role="status">
                     Finishing your account...
                  </p>
               )}

               {phase === "missing" && (
                  <>
                     <h1 className="text-3xl font-extrabold tracking-[-0.02em]">Nothing to finish here</h1>
                     <p className="mt-3" style={{ color: C.soft }}>
                        This page opens after you sign up. If you already paid, log in to see your account.
                     </p>
                     <Link href="/login/parent">
                        <a className="mt-6 inline-block rounded-xl px-6 py-3 font-bold text-white" style={{ background: C.blue }}>
                           Log in
                        </a>
                     </Link>
                  </>
               )}

               {phase === "pending" && state && (
                  <>
                     <h1 className="text-3xl font-extrabold tracking-[-0.02em]">Your payment is still processing</h1>
                     <p className="mt-3" style={{ color: C.soft }}>
                        This usually clears in a minute. Refresh this page in a moment. If it still shows this, email{" "}
                        <a className="underline" href="mailto:support@codealgoacademy.com">
                           support@codealgoacademy.com
                        </a>{" "}
                        from {state.email} and we&apos;ll sort it out.
                     </p>
                     <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-6 rounded-xl px-6 py-3 font-bold text-white"
                        style={{ background: C.blue }}
                     >
                        Refresh
                     </button>
                  </>
               )}

               {phase === "done" && state && (
                  <>
                     <h1 className="text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.03em] md:text-[3.4rem]">You&apos;re in!</h1>
                     <p className="mt-4 max-w-[44ch] text-lg leading-relaxed" style={{ color: C.soft }}>
                        Download the app and log in with the account you just created.
                     </p>

                     <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <StoreButton href={APP_STORE} top="Download on the" name="App Store" icon={<AppleIcon />} />
                        <StoreButton href={PLAY_STORE} top="Get it on" name="Google Play" icon={<PlayIcon />} />
                     </div>

                     <ol className="mt-12 space-y-6">
                        <Step n={1} title="You log in with your email">
                           <span className="font-semibold">{state.email}</span> and the password you picked. That opens the parent
                           dashboard.
                        </Step>
                        <Step n={2} title={`${state.child.name} logs in with their own login`}>
                           Write this down. The password won&apos;t be shown again.
                           <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 rounded-xl p-4 text-base" style={{ background: C.sky, color: C.ink }}>
                              <dt style={{ color: C.soft }}>Username</dt>
                              <dd className="font-semibold">{state.child.username}</dd>
                              <dt style={{ color: C.soft }}>Password</dt>
                              <dd className="font-semibold">{state.child.password}</dd>
                           </dl>
                        </Step>
                     </ol>

                     <p className="mt-12 text-sm" style={{ color: C.soft }}>
                        On a computer? You can also play in the browser after{" "}
                        <Link href="/login/parent">
                           <a className="underline">logging in here</a>
                        </Link>
                        .
                     </p>
                  </>
               )}
            </main>
         </div>

         <style jsx global>{`
            .welcome,
            .welcome button {
               font-family: "Poppins", system-ui, sans-serif;
            }
            .welcome a:focus-visible,
            .welcome button:focus-visible {
               outline: 3px solid ${C.blue};
               outline-offset: 2px;
            }
         `}</style>
      </>
   );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
   return (
      <li className="grid grid-cols-[2.25rem_1fr] gap-3">
         <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: C.ink }}
            aria-hidden
         >
            {n}
         </span>
         <div>
            <p className="font-semibold">{title}</p>
            <div className="mt-1 leading-relaxed" style={{ color: C.soft }}>
               {children}
            </div>
         </div>
      </li>
   );
}

function StoreButton({ href, top, name, icon }: { href: string; top: string; name: string; icon: React.ReactNode }) {
   return (
      <a
         href={href}
         target="_blank"
         rel="noopener noreferrer"
         className="flex items-center gap-3 rounded-xl bg-black px-5 py-3 text-white transition-opacity hover:opacity-85"
      >
         <span className="h-7 w-7 shrink-0">{icon}</span>
         <span className="leading-tight">
            <span className="block text-[0.7rem]">{top}</span>
            <span className="block text-lg font-semibold">{name}</span>
         </span>
      </a>
   );
}

function AppleIcon() {
   return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-full w-full">
         <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.45-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.97.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.37-3.7zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.09 1.75-.96 2.79 1.02.08 2.05-.52 2.68-1.27z" />
      </svg>
   );
}

function PlayIcon() {
   return (
      <svg viewBox="0 0 24 24" aria-hidden className="h-full w-full">
         <path d="M3.6 2.3 13.4 12l-9.8 9.7c-.35-.2-.6-.6-.6-1.1V3.4c0-.5.25-.9.6-1.1z" fill="#34a853" />
         <path d="m16.8 8.6-3.4 3.4-9.8-9.7c.3-.2.8-.2 1.2 0l12 6.3z" fill="#fbbc04" />
         <path d="m16.8 15.4-12 6.3c-.4.2-.9.2-1.2 0l9.8-9.7 3.4 3.4z" fill="#ea4335" />
         <path d="M20.4 12c0 .5-.3 1-.8 1.3l-2.8 1.5-3.4-3.4 3.4-3.4 2.8 1.5c.5.3.8.8.8 1.3z" fill="#4285f4" />
      </svg>
   );
}
