import Link from "next/link";
import React from "react";
import { useTranslation } from "react-i18next";

interface GuideItem {
   title: string;
   body: string;
   link?: string;
   href?: string;
}

// Help text shown under the account picker on /login and /signup. Both pages
// render the same picker, so this is also what keeps them from being thin,
// near-duplicate pages to search engines.
const variants = {
   login: { ns: "loginGuide", email: "support@codealgoacademy.com", ctaHref: "/signup" },
   signup: { ns: "signupGuide", email: "info@codealgoacademy.com", ctaHref: "/login" },
};

export default function AccountTypeGuide({ variant }: { variant: keyof typeof variants }) {
   const { t } = useTranslation("auth");
   const { ns, email, ctaHref } = variants[variant];
   const items = t(`${ns}.items`, { returnObjects: true }) as unknown as GuideItem[];
   const tips = t(`${ns}.tips`, { returnObjects: true }) as unknown as GuideItem[];
   const steps = variant === "signup" ? ((t(`${ns}.steps`, { returnObjects: true }) as unknown) as string[]) : [];

   return (
      <section className="mx-auto mt-20 max-w-5xl break-words px-6 pb-16 text-mainBlack">
         <h2 className="text-center text-2xl font-bold md:text-3xl">{t(`${ns}.heading`)}</h2>
         <p className="mx-auto mt-3 max-w-3xl text-center text-gray-600">{t(`${ns}.intro`)}</p>

         <div className={`mt-10 grid gap-6 sm:grid-cols-2 ${items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
            {items.map((item) => (
               <article key={item.title} className="rounded-2xl bg-[#f4f6f9] p-5">
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-700">{item.body}</p>
               </article>
            ))}
         </div>

         {steps.length > 0 && (
            <>
               <h2 className="mt-14 text-xl font-bold md:text-2xl">{t(`${ns}.stepsHeading`)}</h2>
               <ol className="mt-4 list-decimal space-y-2 pl-6 text-gray-700">
                  {steps.map((step) => (
                     <li key={step}>{step}</li>
                  ))}
               </ol>
            </>
         )}

         <h2 className="mt-14 text-xl font-bold md:text-2xl">{t(`${ns}.tipsHeading`)}</h2>
         <div className="mt-4 grid gap-6 md:grid-cols-2">
            {tips.map((tip) => (
               <div key={tip.title}>
                  <h3 className="font-bold">{tip.title}</h3>
                  <p className="mt-1 text-sm text-gray-700">
                     {tip.body}
                     {tip.href && (
                        <>
                           {" "}
                           <Link href={tip.href}>
                              <a className="font-bold text-mainRed underline">{tip.link}</a>
                           </Link>
                        </>
                     )}
                  </p>
               </div>
            ))}
         </div>

         <div className="mt-12 space-y-2 border-t pt-8 text-center text-gray-700">
            <p>
               {t(`${ns}.helpText`)}{" "}
               <a className="font-bold text-mainRed underline" href={`mailto:${email}`}>
                  {email}
               </a>
            </p>
            <p>
               {t(`${ns}.ctaText`)}{" "}
               <Link href={ctaHref}>
                  <a className="font-bold text-mainRed underline">{t(`${ns}.ctaLink`)}</a>
               </Link>
            </p>
         </div>
      </section>
   );
}
