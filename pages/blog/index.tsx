import Head from "next/head";
import Footer from "@/components/home/new-home/footer";
import Navbar from "@/components/navbar/home/Navbar";
import Header from "@/components/press/Header";
import Link from "next/link";
import { posts } from "public/blog.data";
import React from "react";
import { useTranslation } from "react-i18next";

const Blog = () => {
   const { t } = useTranslation("pages");
   const { t: tp } = useTranslation("blog");
   return (
      <section className="min-h-screen w-full bg-[#ffffff]">
         <Head>
            <title>{t("blogTitle")}</title>
            <meta name="description" content={t("blogDescription")} />
         </Head>
         <Navbar />
         <Header
            body=""
            title={tp("howCodingHelpsKids.title")}
            image="/assets/blog/codinghelp2.png"
            date={tp("howCodingHelpsKids.date")}
            detailPage="/blog/How-coding-helps-kids"
         />

         <section className="mx-auto mt-12 mb-12 w-full max-w-[1100px] px-6">
            <div className="mt-8 grid grid-cols-1 items-stretch justify-center gap-[1rem] md:grid-cols-2 xl:grid-cols-3">
               {posts.map((post, index: number) => {
                  const title = tp(`postSummaries.${post.id}.title`);
                  const body = tp(`postSummaries.${post.id}.body`);
                  const date = tp(`postSummaries.${post.id}.date`);
                  return (
                     <article
                        key={index}
                        className="mx-auto flex h-full w-full max-w-[350px] flex-col overflow-hidden rounded-[10px] border-[1.5px] bg-white p-4 shadow-sm transition-all hover:shadow-md"
                     >
                        {/* image container */}
                        <div className="aspect-video w-full overflow-hidden rounded-[10px]">
                           <img src={post.image} alt={title} className="h-full w-full object-cover object-center" />
                        </div>
                        <div className="mt-3 flex flex-1 flex-col justify-between">
                           <div className="space-y-2">
                              <h2 className="line-clamp-2 min-h-[2.75rem] text-[1rem] font-bold leading-snug text-[#222]">{title}</h2>
                              <p className="line-clamp-3 min-h-[3.9rem] text-[0.9rem] leading-normal text-[#444]">{body}</p>
                           </div>
                           <div className="mt-4 flex items-center justify-between">
                              <p className="text-[14px] text-[#444]">{date}</p>
                              <Link href={`/blog${post.detailPage}`}>
                                 <button className="min-w-[100px] rounded-[20px] bg-mainRed py-1 px-4 text-white">{t("more")}</button>
                              </Link>
                           </div>
                        </div>
                     </article>
                  );
               })}
            </div>
         </section>
         <Footer />
      </section>
   );
};

export default Blog;