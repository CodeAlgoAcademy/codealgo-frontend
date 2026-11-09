import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "utils";

interface LanguageSwitcherProps {
   className?: string;
   variant?: "navbar" | "sidebar" | "compact";
}

const LANGUAGES = [
   { code: "en", label: "EN" },
   { code: "fr", label: "FR" },
   { code: "es", label: "ES" },
];

const LanguageSwitcher = ({ className, variant = "navbar" }: LanguageSwitcherProps) => {
   const { i18n } = useTranslation();
   const currentLang = i18n.language?.substring(0, 2) || "en";

   const toggleLanguage = (lang: string) => {
      i18n.changeLanguage(lang);
      try {
         localStorage.setItem("i18nextLng", lang);
      } catch {}
   };

   const onLight = variant === "compact" || variant === "sidebar";

   return (
      <div
         className={cn(
            "flex items-center gap-1 rounded-lg border p-0.5",
            onLight ? "border-gray-200 bg-white" : "border-white/30 bg-white/10",
            className
         )}
      >
         {LANGUAGES.map(({ code, label }) => (
            <button
               key={code}
               onClick={() => toggleLanguage(code)}
               className={cn(
                  "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
                  onLight
                     ? currentLang === code
                        ? "bg-mainColor text-white"
                        : "text-gray-500 hover:text-gray-700"
                     : currentLang === code
                     ? "bg-white text-mainColor"
                     : "text-white/70 hover:text-white"
               )}
            >
               {label}
            </button>
         ))}
      </div>
   );
};

export default LanguageSwitcher;
