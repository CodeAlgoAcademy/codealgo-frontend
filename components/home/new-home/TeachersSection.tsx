import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const TeachersSection = () => {
   const { t } = useTranslation("home");
   const [activeTab, setActiveTab] = useState(0);

   const teacherFeatures = [
      {
         title: t("standardsAlignedSkills"),
         image: "/assets/landing/skills.png",
      },
      {
         title: t("performanceTracking"),
         image: "/assets/landing/liveclass.png",
      },
      {
         title: t("progressReport"),
         image: "/assets/landing/report.png",
      },
      {
         title: t("mathFactsFeatures"),
         image: "/assets/landing/mathfact.png",
      },
   ];

   return (      
      <section className="relative bg-mainColor/5 py-24">
         <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
               <h2 className="mb-4 font-tiltWarp text-4xl text-mainBlack md:text-5xl">
{t("teachersTitle")}
                </h2>
                <p className="mx-auto max-w-3xl font-workSans text-lg text-mainBlack/60">
                   {t("teachersSubtitle")}
                </p>
            </div>

            <div className="mb-12 flex flex-col items-center gap-12 rounded-[2.5rem] bg-white p-6 shadow-sm lg:flex-row lg:gap-16 lg:p-12">
               <div className="flex w-full flex-col gap-3 lg:w-1/3">
                  {teacherFeatures.map((feature, index) => (
                     <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`rounded-xl px-6 py-5 text-left font-thabitBold text-lg transition-all duration-300 ${
                           activeTab === index
                              ? "bg-mainColor/10 text-mainColor"
                              : "bg-transparent text-mainBlack/50 hover:bg-mainColor/5"
                        }`}
                     >
                        {feature.title}
                     </button>
                  ))}
               </div>

               <div className="flex w-full items-center justify-center lg:w-2/3">
                  <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-mainColor bg-mainColor/5 shadow-lg">
                     <img
                        src={teacherFeatures[activeTab].image}
                        alt={teacherFeatures[activeTab].title}
                        className="h-full w-full object-cover"
                     />
                  </div>
               </div>
            </div>

            <div className="flex justify-center">
               <button className="rounded-xl bg-mainColor px-12 py-4 font-workSans text-lg font-semibold text-white shadow-md transition-colors hover:bg-mainPurple">
                  {t("signUpAsTeacher")}
               </button>
            </div>
         </div>
      </section>
   );
};

export default TeachersSection;