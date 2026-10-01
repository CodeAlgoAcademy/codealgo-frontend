import React, { FC } from "react";
import { TFunction } from "i18next";

export type PricingCategory = "parents" | "school";

interface PricingTabsProps {
   activeCategory: PricingCategory;
   onChange: (category: PricingCategory) => void;
   t: TFunction;
}

const PricingTabs: FC<PricingTabsProps> = ({ activeCategory, onChange, t }) => {
   const tabs: { key: PricingCategory; label: string }[] = [
      { key: "parents", label: t("parentsAndFamilies") },
      { key: "school", label: t("schools") },
   ];

   return (
      <div className="mt-8 flex justify-center">
         <div className="inline-flex rounded-full bg-white p-1.5 shadow-sm border border-gray-200">
            {tabs.map(({ key, label }) => (
               <button
                  key={key}
                  type="button"
                  onClick={() => onChange(key)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                     activeCategory === key
                        ? "bg-mainRed text-white shadow"
                        : "text-gray-600 hover:text-mainColor"
                  }`}
               >
                  {label}
               </button>
            ))}
         </div>
      </div>
   );
};

export default PricingTabs;