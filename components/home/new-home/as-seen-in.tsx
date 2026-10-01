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

   const additionalLogos = [
      {
         src: "/assets/landing/amnition.png",
         alt: "Black Ambition",
      },
      {
         src: "/assets/landing/build.png",
         alt: "Build in Tulsa",
      },
      {
         src: "/assets/landing/startup.png",
         alt: "Startup World Cup",
      },
   ];

   return (
      <div className="mx-auto mt-10 max-w-[1200px] px-6 pb-12">
         {/* Stripe */}
         <div className="mx-auto mb-20 mt-8 flex h-[8px] w-[500px] max-w-[90vw] md:mb-28 md:mt-12">
            {stripeColors.map((bg, index) => (
               <span
                  key={index}
                  className={cn("block h-full flex-1", bg)}
               />
            ))}
         </div>

         {/* Heading */}
         <h1 className="text-center font-tiltWarp text-[2.1rem] max-md:text-[1.5rem]">
            {t("asSeenIn")}
         </h1>

         {/* Existing combined logos */}
         <div className="mx-auto mt-12 max-w-[1200px]">
            <Image
               src="/assets/landing/as-seen-in.png"
               width={2000}
               height={600}
               alt={t("altAsSeenIn")}
               className="h-auto w-full object-contain"
            />
         </div>

         {/* New logos */}
         <div className="mx-auto mt-10 flex max-w-[900px] flex-wrap items-center justify-center gap-10 md:gap-16">
            {additionalLogos.map((logo) => (
               <div
                  key={logo.src}
                  className="relative h-[110px] w-[220px] max-md:h-[90px] max-md:w-[180px]"
               >
                  <Image
                     src={logo.src}
                     alt={logo.alt}
                     layout="fill"
                     sizes="(max-width: 768px) 180px, 220px"
                     className="object-contain"
                  />
               </div>
            ))}
         </div>
      </div>
   );
};

export default AsSeenIs;