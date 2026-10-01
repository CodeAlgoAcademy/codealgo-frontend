import React from "react";
import { Users, Star, Award, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const HomepageExpandedContent = () => {
   const { t } = useTranslation("home");

   const teacherStories = t("teacherStories", { returnObjects: true }) as {
      name: string;
      role: string;
      achievement: string;
   }[];

   const teacherVideoIds = ["85iqLQCrgaU", "0MbxPAUDvww", "FeqPkL8WKU8"];

   const learnItems = [
      t("algorithmThinking"),
      t("pythonFundamentals"),
      t("gameDevelopmentBasics"),
      t("logicalReasoning"),
      t("creativeProjectBuilding"),
   ];

   return (
      <section className="bg-white px-4 py-20 sm:px-6">
         <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
               <h2 className="mb-3 font-tiltWarp text-3xl text-mainBlack md:text-5xl">
                  {t("whatParentsAndTeachersAreSaying")}
               </h2>
               <p className="mx-auto max-w-2xl font-workSans text-base text-mainBlack/60 md:text-xl">
                  {t("realFeedbackFromOurCommunity")}
               </p>
            </div>

            <div className="mb-16 grid gap-8 md:grid-cols-2">
               {teacherStories.map((story, idx) => (
                  <div
                     key={idx}
                     className="overflow-hidden rounded-2xl border border-mainBlack/10 bg-white"
                  >
                     <div className="aspect-video w-full">
                        <iframe
                           className="h-full w-full"
                           src={`https://www.youtube.com/embed/${teacherVideoIds[idx]}`}
                           title={t("successStoryTitle", { name: story.name })}
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowFullScreen
                        ></iframe>
                     </div>
                     <div className="p-6">
                        <div className="mb-3 flex items-center gap-2">
                           <Users className="h-5 w-5 text-mainColor" />
                           <span className="font-thabitBold text-mainBlack">{story.name}</span>
                        </div>
                        <div className="mb-3 flex items-center gap-2">
                           <Star className="h-5 w-5 text-mainPink" />
                           <span className="font-workSans text-mainBlack/70">{story.role}</span>
                        </div>
                        <div className="flex items-start gap-2">
                           <Award className="mt-1 h-4 w-4 flex-shrink-0 text-mainPurple" />
                           <p className="font-workSans text-mainBlack/70">{story.achievement}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            
            <div className="rounded-2xl bg-gradient-to-r from-mainColor to-mainPurple p-8 text-white md:p-12">
               <h2 className="mb-6 font-tiltWarp text-2xl md:text-3xl">
                  {t("whyParentsChooseCodeAlgo")}{" "}
                  <span className="text-mainPink">{t("kidsCodingCourses")}</span>
               </h2>
               <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-4 font-workSans text-white/80">
                     <p>
                        {t("codingForKids")} — {t("heroDescription")}
                     </p>
                     <p>{t("pythonDescription")}</p>
                     <p>{t("onlineClassesDescription")}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                     <h3 className="mb-4 flex items-center gap-2 font-thabitBold text-xl">
                        <TrendingUp className="h-5 w-5" />
                        {t("whatKidsLearn")}
                     </h3>
                     <ul className="space-y-3 font-workSans">
                        {learnItems.map((item, idx) => (
                           <li key={idx} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-mainPink" />
                              <span>{item}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default HomepageExpandedContent;