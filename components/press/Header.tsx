import Link from "next/link";
import { useRouter } from "next/router";
import { IArticle } from "public/data";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";

const Header: FC<IArticle> = (props) => {
   const router = useRouter();
   const { t } = useTranslation("common");
   return (
      <header className={"mx-auto max-w-[1100px] px-6"}>
         <div className="flex flex-col flex-wrap items-start gap-x-[2rem] gap-y-[1rem] pt-14 md:flex-row">
            <div className="h-[400px] flex-1 overflow-hidden rounded-[10px]">
               <img src={props.image} alt="" className="h-full w-full object-cover object-center" />
            </div>
            <div className="flex-1">
               <h1 className=" text-2xl font-bold leading-[1.2] text-black md:text-4xl">{props.title}</h1>
               <p className="mt-3 text-[1.1rem] text-[#222]">{props.body}</p>
               <div className="mt-8 flex max-w-[400px] flex-wrap items-center justify-between gap-4">
                  <p>{props.date}</p>
                  {(router.pathname === "/press" || router.pathname === "/blog") && props.detailPage && (
                     <Link href={props.detailPage as string}>
                        <button className="min-w-[200px] rounded-[30px] bg-mainRed px-3 py-2 text-white">{t("readMore")}</button>
                     </Link>
                  )}
               </div>
            </div>
         </div>
      </header>
   );
};

export default Header;
