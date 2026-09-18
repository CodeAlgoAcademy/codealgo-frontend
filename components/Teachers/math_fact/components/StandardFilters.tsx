import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import mathStandardsService from "services/mathStandards";
import { MathDomain, MathFramework } from "types/interfaces/mathStandards";

export interface StandardFilterValue {
   framework: string;
   grade: string;
   domain: string;
}

interface Props {
   value: StandardFilterValue;
   onChange: (next: StandardFilterValue) => void;
   compact?: boolean;
}

export const GRADES = ["PK", "K", "1", "2", "3", "4", "5", "6", "7", "8+"];

export const EMPTY_FILTERS: StandardFilterValue = { framework: "", grade: "", domain: "" };

export default function StandardFilters({ value, onChange, compact }: Props) {
   const { t } = useTranslation("teacher");
   const [frameworks, setFrameworks] = useState<MathFramework[]>([]);
   const [domains, setDomains] = useState<MathDomain[]>([]);

   useEffect(() => {
      mathStandardsService
         .getFrameworks()
         .then((data) => {
            setFrameworks(data);
            // Default to the baseline so the first render is not empty.
            if (!value.framework) {
               const baseline = data.find((f) => f.is_baseline) ?? data[0];
               if (baseline) onChange({ ...value, framework: baseline.code });
            }
         })
         .catch(() => setFrameworks([]));
      // Runs once. The baseline default must not re-fire when the user clears it.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      if (!value.framework) {
         setDomains([]);
         return;
      }
      mathStandardsService
         .getDomains(value.framework, value.grade || undefined)
         .then(setDomains)
         .catch(() => setDomains([]));
   }, [value.framework, value.grade]);

   // Domain codes repeat across grades, so show each code once.
   const domainCodes = Array.from(new Set(domains.map((d) => d.code)));

   const select = "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400";

   return (
      <div className={`flex flex-wrap items-center gap-3 ${compact ? "" : "rounded-2xl border border-slate-100 bg-slate-50/60 p-4"}`}>
         <select
            className={select}
            value={value.framework}
            onChange={(e) => onChange({ framework: e.target.value, grade: value.grade, domain: "" })}
         >
            <option value="">{t("allFrameworks")}</option>
            {frameworks.map((f) => (
               <option key={f.code} value={f.code}>
                  {f.name}
                  {f.is_baseline ? ` (${t("baseline")})` : ""}
               </option>
            ))}
         </select>

         <select
            className={select}
            value={value.grade}
            onChange={(e) => onChange({ ...value, grade: e.target.value, domain: "" })}
         >
            <option value="">{t("allGrades")}</option>
            {GRADES.map((g) => (
               <option key={g} value={g}>
                  {t("mathGradeLabel", { grade: g })}
               </option>
            ))}
         </select>

         <select
            className={select}
            value={value.domain}
            onChange={(e) => onChange({ ...value, domain: e.target.value })}
            disabled={domainCodes.length === 0}
         >
            <option value="">{t("allDomains")}</option>
            {domainCodes.map((code) => (
               <option key={code} value={code}>
                  {code}
               </option>
            ))}
         </select>

         {(value.grade || value.domain) && (
            <button
               type="button"
               onClick={() => onChange({ framework: value.framework, grade: "", domain: "" })}
               className="text-xs font-bold text-blue-600 hover:underline"
            >
               {t("clearFilters")}
            </button>
         )}
      </div>
   );
}
