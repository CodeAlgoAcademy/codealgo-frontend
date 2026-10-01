import React, { StyleHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";

interface Props {
   title?: string;
   titleSize: "large" | "base";
   percentage: number;
   color: "red" | "green";
   containerSize: "large" | "base";
   level: string | number;
   caption?: string;
}

const ProgressBar = ({ title, titleSize, percentage, color, containerSize, level, caption }: Props) => {
   const { t } = useTranslation("parent");
   percentage = parseFloat((percentage * 100).toFixed(1));
   const progressBarStyle = {
      width: `${percentage <= 100 ? percentage : ""}%`,
   };
   
   const largeTitle = `min-w-[150px] max-w-[150px] text-base font-semibold`;
   const baseTitle = `${containerSize == "base" ? "min-w-[84px] max-w-[84px]" : "min-w-[190px] max-w-[190px]"} text-sm font-medium text-[#A8ABB0]`;
   
   return (
      <div className="flex flex-col">
         {/* Rows with no level used to print a bare "Level:" */}
         {(caption || (level !== undefined && level !== null && level !== "")) && (
            <div className="flex items-center mb-1">
               <span className="text-xs font-bold text-gray-600">
                  {caption ?? t("levelLabel", { level })}
               </span>
            </div>
         )}
         <div className="flex h-5 items-center">
            <p title={title} className={`w-full overflow-hidden truncate whitespace-nowrap ${titleSize === "large" ? largeTitle : baseTitle}`}>
               {title}
            </p>
            <span className="progress-indicator-bar relative h-full w-full rounded-r-xl bg-[#ECEDF3]">
               <span
                  className={`top-0 left-0 block h-full rounded-r-xl pr-[10px] text-right text-sm text-black ${
                     color === "green" ? "green-progress-bar" : "red-progress-bar"
                  }`}
                  style={progressBarStyle}
               >
                  {percentage}%
               </span>
            </span>
         </div>
      </div>
   );
};
export default ProgressBar;