import React from "react";
import {
   Code2,
   Blocks,
   Globe,
   Brain,
   Gamepad2,
   GraduationCap,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const HomepageContent = () => {
   const { t } = useTranslation("home");

   const learningPaths = [
      {
         icon: <Brain className="h-5 w-5 text-white" />,
         title: t("algorithmsAndProblemSolving"),
         description: t("algorithmsDescription"),
         accent: "bg-mainColor",
         keywordColor: "text-mainColor",
         keyword: t("codingForKids"),
      },
      {
         icon: <Code2 className="h-5 w-5 text-white" />,
         title: t("pythonForKidsTitle"),
         description: t("pythonDescription"),
         accent: "bg-mainPurple",
         keywordColor: "text-mainPurple",
         keyword: t("pythonForKidsKeyword"),
      },
      {
         icon: <Blocks className="h-5 w-5 text-white" />,
         title: t("blockBasedCoding"),
         description: t("blockBasedDescription"),
         accent: "bg-mainPink",
         keywordColor: "text-mainPink",
         keyword: t("kidsCodingCourses"),
      },
      {
         icon: <Globe className="h-5 w-5 text-white" />,
         title: t("onlineCodingClasses"),
         description: t("onlineClassesDescription"),
         accent: "bg-mainGreen",
         keywordColor: "text-mainGreen",
         keyword: t("onlineCodingClassesKeyword"),
      },
      {
         icon: <GraduationCap className="h-5 w-5 text-white" />,
         title: t("forKidsAges6to14"),
         description: t("kidsAgesDescription"),
         accent: "bg-mainColor",
         keywordColor: "text-mainColor",
         keyword: t("kidsAges6to14Keyword"),
      },
      {
         icon: <Gamepad2 className="h-5 w-5 text-white" />,
         title: t("learnThroughGames"),
         description: t("learnThroughGamesDescription"),
         accent: "bg-mainPink",
         keywordColor: "text-mainPink",
         keyword: t("learnProgrammingThroughGames"),
      },
   ];

   return (
      <section className="bg-white px-4 py-20 sm:px-6">
         <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
               <h1 className="mb-6 font-tiltWarp text-4xl leading-tight text-mainBlack md:text-5xl lg:text-6xl">
                  {t("codingPlatformForKids")}
               </h1>
               <p className="mx-auto max-w-3xl font-workSans text-base text-mainBlack/60 md:text-xl">
                  {t("heroDescription")}
               </p>
            </div>

            <div className="grid grid-cols-1 divide-y divide-mainBlack/10 border-y border-mainBlack/10 md:grid-cols-2 md:divide-y-0 md:gap-x-12">
               {learningPaths.map((item, idx) => (
                  <div
                     key={idx}
                     className={`flex gap-4 py-6 md:border-mainBlack/10 ${
                        idx % 2 === 0 ? "md:border-r md:pr-8" : "md:pl-8"
                     } ${idx < 4 ? "md:border-b" : ""}`}
                  >
                     <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.accent}`}
                     >
                        {item.icon}
                     </div>
                     <div>
                        <h3 className="mb-1 font-thabitBold text-lg text-mainBlack">
                           {item.title}
                        </h3>
                        <p className="font-workSans text-sm leading-relaxed text-mainBlack/60">
                           {item.description}
                        </p>
                        <span
                           className={`mt-2 inline-block font-workSans text-xs font-medium ${item.keywordColor}`}
                        >
                           {item.keyword}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default HomepageContent;