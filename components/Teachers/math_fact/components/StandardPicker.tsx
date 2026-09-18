import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import mathStandardsService from "services/mathStandards";
import { MathStandard } from "types/interfaces/mathStandards";
import StandardFilters, { EMPTY_FILTERS, StandardFilterValue } from "./StandardFilters";

interface Props {
   selected: MathStandard[];
   onChange: (next: MathStandard[]) => void;
   // Preselects the filters when the teacher is working inside one class.
   defaultGrade?: string;
}

export default function StandardPicker({ selected, onChange, defaultGrade }: Props) {
   const { t } = useTranslation("teacher");
   const [filters, setFilters] = useState<StandardFilterValue>({
      ...EMPTY_FILTERS,
      grade: defaultGrade ?? "",
   });
   const [standards, setStandards] = useState<MathStandard[]>([]);
   const [search, setSearch] = useState("");
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (!filters.framework) return;
      setLoading(true);
      mathStandardsService
         .getStandards({
            framework: filters.framework,
            grade: filters.grade || undefined,
            domain: filters.domain || undefined,
         })
         .then(setStandards)
         .catch(() => setStandards([]))
         .finally(() => setLoading(false));
   }, [filters.framework, filters.grade, filters.domain]);

   const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

   const visible = useMemo(() => {
      const needle = search.trim().toLowerCase();
      if (!needle) return standards;
      return standards.filter(
         (s) =>
            s.code.toLowerCase().includes(needle) ||
            s.description.toLowerCase().includes(needle)
      );
   }, [standards, search]);

   const toggle = (standard: MathStandard) => {
      if (selectedIds.has(standard.id)) {
         onChange(selected.filter((s) => s.id !== standard.id));
      } else {
         onChange([...selected, standard]);
      }
   };

   return (
      <div className="space-y-3">
         <StandardFilters value={filters} onChange={setFilters} compact />

         <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchStandardsPlaceholder")}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400"
         />

         {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
               {selected.map((s) => (
                  <button
                     key={s.id}
                     type="button"
                     onClick={() => toggle(s)}
                     className="group flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200"
                     title={s.description}
                  >
                     {s.code}
                     <span className="text-blue-400 group-hover:text-blue-700">&times;</span>
                  </button>
               ))}
            </div>
         )}

         <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
            {loading && (
               <div className="p-6 text-center text-sm text-slate-400">{t("loading")}</div>
            )}
            {!loading && visible.length === 0 && (
               <div className="p-6 text-center text-sm text-slate-400">{t("noStandardsMatch")}</div>
            )}
            {!loading &&
               visible.map((s) => {
                  const on = selectedIds.has(s.id);
                  return (
                     <label
                        key={s.id}
                        className={`flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-blue-50/60 ${on ? "bg-blue-50" : ""}`}
                     >
                        <input
                           type="checkbox"
                           checked={on}
                           onChange={() => toggle(s)}
                           className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                        />
                        <span className="min-w-0">
                           <span className="block text-xs font-black tracking-tight text-slate-800">
                              {s.code}
                           </span>
                           <span className="block text-xs leading-snug text-slate-500">
                              {s.description}
                           </span>
                        </span>
                     </label>
                  );
               })}
         </div>
      </div>
   );
}
