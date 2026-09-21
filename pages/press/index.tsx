import Head from "next/head";
import Footer from "@/components/home/new-home/footer";
import Navbar from "@/components/navbar/home/Navbar";
import Header from "@/components/press/Header";
import Link from "next/link";
import { articles } from "public/data";
import React from "react";
import { useTranslation } from "react-i18next";


const Press = () => {
   const { t } = useTranslation("pages");
   const { t: tp } = useTranslation("press");
   return (
      <section className="min-h-screen w-full bg-[#ffffff] font-thabit">
         <Head>
            <title>{t("pressTitle")}</title>
            <meta name="description" content={t("pressDescription")} />
         </Head>
         <Navbar />
         <Header
            body=""
            title={tp("startupWorldCup.title")}
            date={tp("startupWorldCup.date")}
            image="/assets/blog/press/million.jpg"
            detailPage="/press/startup-world-cup"
         />

         <section className="mx-auto mt-12 mb-12 w-full max-w-[1100px] px-4 sm:px-6">
            <div className="mt-8 grid grid-cols-1 items-start justify-center gap-4 md:grid-cols-2 md:gap-[1rem] xl:grid-cols-3">
               {articles.map((article, index: number) => (
                  <article
                     key={index}
                     className="mx-auto flex h-full w-full max-w-[350px] flex-col overflow-hidden rounded-[10px] border-[1.5px] bg-white p-4 shadow-sm transition-all hover:shadow-md"
                  >
                     <div className="aspect-video w-full overflow-hidden rounded-[10px]">
                        <img src={article.image} 
                        alt={tp(`articleSummaries.${article.id}.title`)}
                        className="h-full w-full object-cover object-center" />
                     </div>

                     <div className="mt-3 flex flex-1 flex-col justify-between">
                        <div className="space-y-2">
                           <h2 className="line-clamp-2 text-base font-bold text-[#222]">{tp(`articleSummaries.${article.id}.title`)}</h2>
                           <p className="line-clamp-3 text-sm text-[#444]">{tp(`articleSummaries.${article.id}.body`)}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                           <p className="text-xs text-[#444] sm:text-[14px]">{tp(`articleSummaries.${article.id}.date`)}</p>
                           <Link href={`/press${article.detailPage}`}>
                              <button className="min-w-[100px] rounded-[20px] bg-mainRed py-1 px-4 text-sm text-white">{t("pressButton")}</button>
                           </Link>
                        </div>
                     </div>
                  </article>
               ))}
            </div>
         </section>
         <Footer />
      </section>
   );
};

export default Press;
