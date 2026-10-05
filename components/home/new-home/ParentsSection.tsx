import React from "react";
import { useTranslation } from "react-i18next";

const ParentsSection = () => {
   const { t } = useTranslation("home");

   return (
      <section className="relative overflow-hidden bg-black py-24">
         <div className="container relative mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-10">
               {/* Left Content */}
               <div>
                  <h2 className="mb-4 font-tiltWarp text-3xl leading-tight text-white md:text-4xl">
                     {t("parentsTitle")}
                  </h2>

                  <p className="mb-8 max-w-sm font-workSans text-lg leading-relaxed text-white">
                     {t("parentsSubtitle")}
                  </p>

                  {/* Primary CTA */}
                  <button className="rounded-xl bg-white px-10 py-4 font-workSans text-lg font-semibold text-black shadow-sm transition-colors hover:bg-mainRed hover:text-white">
                     {t("signUpYourChild")}
                  </button>

                  <p className="mt-4 font-workSans text-sm text-white">
                     {t("parentsCtaNote")}
                  </p>

                  {/* Newsletter */}
                  <div className="mt-8 max-w-lg border-t border-white/20 pt-6">
                     <p className="mb-2 font-workSans text-base font-semibold text-white">
                        Not ready to sign up yet?
                     </p>

                     <p className="mb-4 font-workSans text-sm leading-relaxed text-white/70">
                        Get free coding activities, AI tips, and practical
                        resources to help your child learn technology.
                     </p>

                     <form
                        action="https://app.kit.com/forms/10004687/subscriptions"
                        method="post"
                        className="flex flex-col gap-3 sm:flex-row"
                     >
                        <input
                           type="email"
                           name="email_address"
                           required
                           aria-label="Email Address"
                           placeholder="Email address"
                           className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-4 py-3 font-workSans text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-mainRed"
                        />

                        <button
                           type="submit"
                           className="whitespace-nowrap rounded-xl bg-mainRed px-5 py-3 font-workSans text-sm font-semibold text-white transition hover:opacity-90"
                        >
                           Get Parent Resources
                        </button>
                     </form>

                     <p className="mt-3 font-workSans text-xs text-white/50">
                        Free resources for parents. Unsubscribe anytime.
                     </p>
                  </div>
               </div>

               {/* Image */}
               <div className="relative">
                  <div className="relative overflow-hidden rounded-[2rem] border-4 border-mainRed shadow-sm">
                     <img
                        src="/assets/landing/revamp/subset6.png"
                        alt={t("parentsImageAlt")}
                        className="h-auto max-h-[460px] min-h-[300px] w-full object-cover"
                     />
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default ParentsSection;