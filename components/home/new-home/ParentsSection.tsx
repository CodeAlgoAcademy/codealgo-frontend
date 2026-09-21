import React from "react";
import { useTranslation } from "react-i18next";

const ParentsSection = () => {
   const { t } = useTranslation("home");

   return (
      <section className="relative overflow-hidden bg-[#F7F5FF] py-24">
         <div className="container relative mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-10">
               <div>
                  <h2 className="mb-4 font-tiltWarp text-3xl leading-tight text-mainBlack md:text-4xl">
{t("parentsTitle")}
                   </h2>

                   <p className="mb-8 max-w-sm font-workSans text-lg leading-relaxed text-mainBlack/60">
                      {t("parentsSubtitle")}
                   </p>

                   <button className="rounded-xl bg-mainPurple px-10 py-4 font-workSans text-lg font-semibold text-white shadow-sm transition-colors hover:bg-mainColor">
                      {t("signUpYourChild")}
                   </button>

                   <p className="mt-4 font-workSans text-sm text-mainBlack/40">
                      {t("parentsCtaNote")}
                   </p>
               </div>

               <div className="relative">
                  <div
                     className="clip-path-wave absolute -inset-4 bg-mainPurple/10"
                     aria-hidden="true"
                  />
                  <div className="relative overflow-hidden rounded-[2rem] border-4 border-mainPurple shadow-sm">
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