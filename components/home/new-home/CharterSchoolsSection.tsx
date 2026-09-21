import React from "react";
import { useTranslation } from "react-i18next";

const CharterSchoolsSection: React.FC = () => {
   const { t } = useTranslation("home");

   const highlights = [
      {
         label: t("charterHighlight1Title"),
         detail: t("charterHighlight1Desc"),
      },
      {
         label: t("charterHighlight2Title"),
         detail: t("charterHighlight2Desc"),
      },
      {
         label: t("charterHighlight3Title"),
         detail: t("charterHighlight3Desc"),
      },
   ];

   return (
      <section className="relative overflow-hidden bg-blueToBlackGradient py-20 md:py-28">
         {/* Brand parallelogram accent, tucked behind the copy column */}
         <div
            className="clip-path-right-parallelogram pointer-events-none absolute -left-24 top-0 h-full w-72 bg-mainColor/20 lg:w-96"
            aria-hidden="true"
         />

         <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
               <div className="lg:col-span-5">
                  <p className="font-workSans text-lg  font-semibold text-mainPink">
                     {t("charterEyebrow")}
                  </p>
                  <h2 className="mt-3 max-w-sm font-tiltWarp text-3xl leading-tight text-white md:text-4xl">
                     {t("charterHeading")}
                  </h2>
                  <p className="mt-5 max-w-sm font-workSans text-base leading-relaxed text-white/70">
                     {t("charterBody")}
                  </p>

               </div>

               <div className="lg:col-span-7">
                  <dl className="divide-y divide-white/10 border-t border-white/10">
                     {highlights.map((item) => (
                        <div
                           key={item.label}
                           className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-12 sm:gap-6"
                        >
                           <dt className="sm:col-span-4">
                              <span className="font-workSans text-base font-medium text-white">
                                 {item.label}
                              </span>
                           </dt>
                           <dd className="font-workSans text-sm leading-relaxed text-white/70 sm:col-span-8">
                              {item.detail}
                           </dd>
                        </div>
                     ))}
                  </dl>
               </div>
            </div>
         </div>
      </section>
   );
};

export default CharterSchoolsSection;