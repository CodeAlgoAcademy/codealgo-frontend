import Footer from "@/components/home/new-home/footer";
import Navbar from "@/components/navbar/home/Navbar";
import BlogTitle from "@/components/press/BlogTitle";
import DropCapsParagraph from "@/components/press/DropCapsParagraph";
import ImagesContainer from "@/components/press/ImagesContainer";
import React from "react";
import { useTranslation } from "react-i18next";

export default function StartupWorldCup() {
   const { t } = useTranslation("press");
   const competitors: string[] = (t("startupWorldCup.competitors", { returnObjects: true }) as unknown) as string[];

   return (
      <section className="press-page min-h-screen w-full bg-[#f7f8ff] font-thabit">
         <Navbar />
         <div className="mx-auto mb-14 mt-8 max-w-[1100px] rounded-md bg-white p-3 px-6 shadow-md">
            <BlogTitle
               title={t("startupWorldCup.title")}
               by={t("startupWorldCup.by")}
               link={t("startupWorldCup.link")}
               date={t("startupWorldCup.date")}
            />
            <ImagesContainer
               imageHeight={450}
               image="/assets/blog/press/million.jpg"
               imageDetail={t("startupWorldCup.caption1")}
               className="lg:!object-cover"
            />
            <main className="mt-6">
               <section className="my-4">
                  <DropCapsParagraph text={t("startupWorldCup.dropCaps")} />
                  <p className="mt-5">{t("startupWorldCup.p1")}</p>
                  <p className="mt-5">{t("startupWorldCup.p2")}</p>
                  <p className="mt-5">{t("startupWorldCup.p3")}</p>
                  <p className="mt-5">{t("startupWorldCup.p4")}</p>
                  <p className="mt-5">{t("startupWorldCup.p5")}</p>

                  <div className="mt-8 rounded-md bg-[#f2f2f2] p-6">
                     <h2 className="text-[1.2rem] font-bold text-mainRed">{t("startupWorldCup.h1")}</h2>
                     <ul className="mt-4 list-disc pl-6">
                        {competitors.map((competitor, index) => (
                           <li key={index} className="mt-1 text-[#222]">
                              {competitor}
                           </li>
                        ))}
                     </ul>
                  </div>

                  <p className="mt-5">{t("startupWorldCup.p6")}</p>
                  <p className="mt-5">{t("startupWorldCup.p7")}</p>
                  <p className="mt-5">{t("startupWorldCup.p8")}</p>
                  <p className="mt-5">{t("startupWorldCup.p9")}</p>
               </section>
            </main>
         </div>
         <Footer />
      </section>
   );
}