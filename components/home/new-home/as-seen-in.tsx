import Image from "next/image";
import React from "react";
import { cn } from "utils";
import { useTranslation } from "react-i18next";

const AsSeenIs = () => {
   const { t } = useTranslation("home");

   const stripeColors = [
      "bg-mainColor",
      "bg-mainRed",
      "bg-mainPink",
      "bg-mainPink",
      "bg-mainRed",
      "bg-mainColor",
   ];

   return (
      <div className="mx-auto mt-10 max-w-[1200px] px-6 pb-12">
         <div className="mx-auto mb-20 mt-8 flex h-[8px] w-[500px] max-w-[90vw] md:mb-28 md:mt-12">
            {stripeColors.map((bg, index) => (
               <span key={index} className={cn("block h-full flex-1", bg)}></span>
            ))}
         </div>

         <h1 className="text-center font-tiltWarp text-[2.1rem] max-md:text-[1.5rem]">
            {t("asSeenIn")}
         </h1>

         <div className="mx-auto mt-12 max-w-[1200px]">
            <Image src={"/assets/landing/as-seen-in.png"} width={2000} height={600} alt={t("altAsSeenIn")} />
         </div>
      </div>
   );
};

export default AsSeenIs;