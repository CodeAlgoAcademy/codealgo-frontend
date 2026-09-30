import { useTranslation } from "react-i18next";

export const WinterBanner = () => {
   const { t } = useTranslation("home");

   return (
      <div className="relative z-40 flex items-center justify-center bg-mainRed px-4 py-3 text-center text-white">
         <div className="flex flex-wrap items-center justify-center gap-2 font-workSans text-sm font-semibold md:text-2xl">
            <span>{t("summerSale20Off")}</span>

            <span className="inline-flex items-center whitespace-nowrap rounded-full bg-mainGreen px-3 py-0.5 text-xs font-bold text-white md:text-sm">
               {t("sale")}
            </span>

            <a
               href="/login"
               className="ml-1 font-bold text-white underline hover:text-opacity-90"
            >
               {t("getStartedNow")}
            </a>
         </div>
      </div>
   );
};

export const PromoBanner = () => {
   const { t } = useTranslation("home");

   return (
      <div className="w-full bg-mainRed text-white">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-4 py-3">
               <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                     <span className="font-bold text-mainRed">🔥</span>
                  </span>
                  <span className="font-workSans text-lg font-bold text-white">
                     {t("discountApplied")}
                  </span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="font-workSans text-sm text-white opacity-90">
                     {t("limitedTime")}
                  </span>
               </div>
            </div>
         </div>
      </div>
   );
};