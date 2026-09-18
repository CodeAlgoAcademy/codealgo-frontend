import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import mathStandardsService from "services/mathStandards";
import { MathStandard } from "types/interfaces/mathStandards";
import StandardFilters, { EMPTY_FILTERS, StandardFilterValue } from "./StandardFilters";

export default function StandardsExplorer() {
   const { t } = useTranslation("teacher");
   const [filters, setFilters] = useState<StandardFilterValue>(EMPTY_FILTERS);
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

   const visible = useMemo(() => {
      const needle = search.trim().toLowerCase();
      if (!needle) return standards;
      return standards.filter(
         (s) =>
            s.code.toLowerCase().includes(needle) ||
            s.description.toLowerCase().includes(needle)
      );
   }, [standards, search]);

   // Group by domain so the list reads the way a curriculum document does.
   const grouped = useMemo(() => {
      const map = new Map<string, MathStandard[]>();
      visible.forEach((s) => {
         const key = `${s.grade}|${s.domain_code || "?"}`;
         if (!map.has(key)) map.set(key, []);
         map.get(key)!.push(s);
      });
      return Array.from(map.entries());
   }, [visible]);

   return (
      <div className="space-y-5">
         <div>
            <h2 className="text-xl font-bold text-gray-800">{t("standardsExplorer")}</h2>
            <p className="text-sm text-slate-500">{t("standardsExplorerHint")}</p>
         </div>

         <StandardFilters value={filters} onChange={setFilters} />

         <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchStandardsPlaceholder")}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
         />

         {loading && <div className="p-10 text-center text-sm text-slate-400">{t("loading")}</div>}

         {!loading && visible.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm italic text-slate-400">
               {t("noStandardsMatch")}
            </div>
         )}

         {!loading && grouped.length > 0 && (
            <div className="space-y-4">
               {grouped.map(([key, rows]) => {
                  const [grade, domain] = key.split("|");
                  return (
                     <div key={key} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3">
                           <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                              {t("mathGradeLabel", { grade })} · {domain}
                           </p>
                        </div>
                        <div className="divide-y divide-slate-50">
                           {rows.map((s) => (
                              <div key={s.id} className="flex gap-4 px-5 py-3">
                                 <span className="w-28 shrink-0 text-xs font-black text-blue-700">{s.code}</span>
                                 <span className="text-xs leading-relaxed text-slate-600">{s.description}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  );
               })}
            </div>
         )}
      </div>
   );
}
