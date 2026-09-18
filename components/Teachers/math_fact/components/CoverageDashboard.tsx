import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import mathStandardsService from "services/mathStandards";
import { CoverageReport } from "types/interfaces/mathStandards";
import StandardFilters, { EMPTY_FILTERS, StandardFilterValue } from "./StandardFilters";

function percent(covered: number, total: number) {
   if (!total) return 0;
   return Math.round((covered / total) * 100);
}

export default function CoverageDashboard() {
   const { t } = useTranslation("teacher");
   const [filters, setFilters] = useState<StandardFilterValue>(EMPTY_FILTERS);
   const [report, setReport] = useState<CoverageReport | null>(null);
   const [loading, setLoading] = useState(false);
   const [openGrade, setOpenGrade] = useState<string | null>(null);

   useEffect(() => {
      if (!filters.framework) return;
      setLoading(true);
      mathStandardsService
         .getCoverage(filters.framework, filters.grade || undefined)
         .then(setReport)
         .catch(() => setReport(null))
         .finally(() => setLoading(false));
   }, [filters.framework, filters.grade]);

   const totals = report?.totals ?? {};
   const fluencyOnly = useMemo(() => {
      if (!report) return 0;
      return report.grades.reduce(
         (sum, grade) =>
            sum +
            grade.domains.reduce(
               (d, domain) => d + domain.standards.filter((s) => s.fluency_only).length,
               0
            ),
         0
      );
   }, [report]);

   return (
      <div className="space-y-5">
         <div>
            <h2 className="text-xl font-bold text-gray-800">{t("standardsCoverage")}</h2>
            <p className="text-sm text-slate-500">{t("standardsCoverageHint")}</p>
         </div>

         <StandardFilters value={filters} onChange={setFilters} />

         {loading && <div className="p-10 text-center text-sm text-slate-400">{t("loading")}</div>}

         {!loading && report && (
            <>
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                     <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        {t("standardsCovered")}
                     </p>
                     <p className="mt-1 text-3xl font-black text-slate-800">
                        {totals.covered ?? 0}
                        <span className="text-lg font-bold text-slate-300"> / {totals.standards ?? 0}</span>
                     </p>
                     <p className="mt-1 text-xs font-bold text-blue-600">{totals.percent ?? 0}%</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                     <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        {t("fluencyOnly")}
                     </p>
                     <p className="mt-1 text-3xl font-black text-amber-600">{fluencyOnly}</p>
                     <p className="mt-1 text-xs text-slate-400">{t("fluencyOnlyHint")}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                     <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        {t("gaps")}
                     </p>
                     <p className="mt-1 text-3xl font-black text-red-500">
                        {(totals.standards ?? 0) - (totals.covered ?? 0)}
                     </p>
                     <p className="mt-1 text-xs text-slate-400">{t("gapsHint")}</p>
                  </div>
               </div>

               <div className="space-y-3">
                  {report.grades.map((grade) => {
                     const open = openGrade === grade.grade;
                     const pct = percent(grade.covered, grade.total);
                     return (
                        <div key={grade.grade} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                           <button
                              type="button"
                              onClick={() => setOpenGrade(open ? null : grade.grade)}
                              className="flex w-full items-center gap-4 p-4 text-left hover:bg-slate-50"
                           >
                              <span className="w-24 shrink-0 text-sm font-black text-slate-700">
                                 {t("mathGradeLabel", { grade: grade.grade })}
                              </span>
                              <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                 <span
                                    className={`block h-full rounded-full ${pct >= 60 ? "bg-emerald-500" : pct > 0 ? "bg-amber-400" : "bg-slate-200"}`}
                                    style={{ width: `${pct}%` }}
                                 />
                              </span>
                              <span className="w-24 shrink-0 text-right text-xs font-bold text-slate-500">
                                 {grade.covered}/{grade.total}
                              </span>
                           </button>

                           {open && (
                              <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                                 <div className="space-y-4">
                                    {grade.domains.map((domain) => (
                                       <div key={domain.domain}>
                                          <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                             {domain.domain} · {domain.covered}/{domain.total}
                                          </p>
                                          <div className="flex flex-wrap gap-1.5">
                                             {domain.standards.map((s) => (
                                                <span
                                                   key={s.code}
                                                   title={`${s.description} (${t("drills")}: ${s.fact_set_count}, ${t("items")}: ${s.item_count})`}
                                                   className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${
                                                      !s.covered
                                                         ? "bg-white text-slate-400 ring-slate-200"
                                                         : s.fluency_only
                                                         ? "bg-amber-50 text-amber-700 ring-amber-200"
                                                         : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                                   }`}
                                                >
                                                   {s.code}
                                                </span>
                                             ))}
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>

               <div className="flex flex-wrap gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-2">
                     <span className="h-3 w-3 rounded-full bg-emerald-50 ring-1 ring-emerald-200" />
                     {t("legendTaught")}
                  </span>
                  <span className="flex items-center gap-2">
                     <span className="h-3 w-3 rounded-full bg-amber-50 ring-1 ring-amber-200" />
                     {t("legendFluencyOnly")}
                  </span>
                  <span className="flex items-center gap-2">
                     <span className="h-3 w-3 rounded-full bg-white ring-1 ring-slate-200" />
                     {t("legendGap")}
                  </span>
               </div>
            </>
         )}
      </div>
   );
}
