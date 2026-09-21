import React from "react";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
   const { t } = useTranslation("home");

   const steps = [
      {
         number: "01",
         title: t("step1Title"),
         description: t("step1Desc"),
         image: "/assets/landing/signup.png",
      },
      {
         number: "02",
         title: t("step2Title"),
         description: t("step2Desc"),
         image: "/assets/landing/getstudenton.png",
      },
      {
         number: "03",
         title: t("step3Title"),
         description: t("step3Desc"),
         image: "/assets/landing/enhancelearning.png",
      },
   ];

   return (
      <section className="bg-mainGreen/5 py-24">
         <div className="container mx-auto max-w-6xl px-4">
            <h2 className="mb-20 text-center font-tiltWarp text-3xl text-mainBlack md:text-4xl">
               {t("howItWorksTitle")}
            </h2>

            
            <div className="relative mb-16 grid grid-cols-1 gap-16 lg:grid-cols-3 lg:gap-8">
               <div
                  className="absolute left-0 right-0 top-6 hidden h-px bg-mainGreen/30 lg:block"
                  aria-hidden="true"
               />

               {steps.map((step) => (
                  <div key={step.number} className="relative flex flex-col items-center text-center">
                     <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-mainGreen font-tiltWarp text-lg text-white">
                        {step.number}
                     </div>

                     <div className="mb-6 flex h-36 w-full items-center justify-center">
                        <img
                           src={step.image}
                           alt={step.title}
                           className="max-h-full max-w-[70%] object-contain"
                        />
                     </div>

                     <h3 className="mb-3 font-thabitBold text-xl text-mainBlack">
                        {step.title}
                     </h3>

                     <p className="max-w-xs font-workSans text-sm leading-relaxed text-mainBlack/60 md:text-base">
                        {step.description}
                     </p>
                  </div>
               ))}
            </div>

            <div className="mx-auto flex w-full max-w-md flex-col gap-4">
               <button className="w-full rounded-xl bg-mainColor py-4 font-workSans text-lg font-semibold text-white shadow-md transition-colors hover:bg-mainPurple">
                  {t("signUpAsTeacher")}
               </button>

               <button className="w-full rounded-xl border border-mainColor bg-white py-4 font-workSans text-lg font-semibold text-mainColor shadow-sm transition-colors hover:bg-mainColor/5">
                  {t("signUpAsParent")}
               </button>
            </div>
         </div>
      </section>
   );
};

export default HowItWorks;