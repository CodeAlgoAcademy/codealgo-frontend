import React from "react";
import { useTranslation } from "react-i18next";

const CodeToSuccess = () => {
   const { t } = useTranslation("home");

   const steps = [
      {
         title: t("thinking"),
         image: "/assets/landing/revamp/thinkingg.png",
         description: t("thinkingDescription"),
      },
      {
         title: t("coding"),
         image: "/assets/landing/revamp/coding.png",
         description: t("codingDescription"),
      },
      {
         title: t("experience"),
         image: "/assets/landing/revamp/experince.png",
         description: t("experienceDescription"),
      },
   ];

   return (
      <section className="bg-[#040404] mt-40  py-10 px-6 text-white md:pb-48">
         <div className="mx-auto max-w-[1200px]">
            <h1 className="mx-auto mt-6 max-w-fit rounded-md bg-mainRed py-3 px-5 text-center font-tiltWarp text-[1.9rem] font-bold shadow-md max-md:text-[1.3rem]">
               {t("codeYourWayToSuccess")}
            </h1>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
               {steps.map((step) => (
                  <div
                     key={step.title}
                     className="rounded-3xl bg-white  text-black shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
                  >
                     <img
                        src={step.image}
                        alt={step.title}
                     className="h-57 w-full rounded-2xl "
                     />
                     <div className="p-6">
                     <h3 className="mt-2 text-center text-xl font-bold font-tiltWarp">
                        {step.title}
                     </h3>

                     <p className="mt-4 text-center text-sm leading-relaxed">
                        {step.description}
                     </p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default CodeToSuccess;