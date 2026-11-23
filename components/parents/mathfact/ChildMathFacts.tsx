import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import mathFactsService from "services/mathfact";
import { ChildMathFactAssignment, MathFactAnalyticsPair, MathOperation } from "types/interfaces/mathfact";
import MasteryHeatmap from "@/components/Teachers/math_fact/components/MasteryHeatmap";
import AssignPracticeModal from "./AssignPracticeModal";

interface Props {
   childId?: string | number;
   childName?: string;
}

const OPERATIONS: MathOperation[] = ["add", "subtract", "multiply", "divide"];

// MasteryHeatmap picks its operator symbol from the English name.
const HEATMAP_NAME: Record<MathOperation, string> = {
   add: "addition",
   subtract: "subtraction",
   multiply: "multiplication",
   divide: "division",
};

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : "-");

const StatusBadge = ({ row }: { row: ChildMathFactAssignment }) => {
   const { t } = useTranslation("parent");
   if (row.is_mastered) {
      return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{t("mathFactsMastered")}</span>;
   }
   if (row.sessions_completed > 0 || row.status === "in_progress") {
      return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{t("mathFactsPracticing")}</span>;
   }
   return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{t("mathFactsNotStarted")}</span>;
};

const ChildMathFacts = ({ childId, childName }: Props) => {
   const { t } = useTranslation("parent");
   const [rows, setRows] = useState<ChildMathFactAssignment[]>([]);
   const [analytics, setAnalytics] = useState<MathFactAnalyticsPair[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(false);
   const [modalOpen, setModalOpen] = useState(false);

   const load = useCallback(async () => {
      if (!childId) return;
      setLoading(true);
      setError(false);
      try {
         const [overview, report] = await Promise.all([
            mathFactsService.getChildMathFacts(childId),
            mathFactsService.getChildMathAnalytics(childId),
         ]);
         setRows(overview.active_assignments ?? []);
         setAnalytics(report[0]?.data ?? []);
      } catch (err) {
         setError(true);
      } finally {
         setLoading(false);
      }
   }, [childId]);

   useEffect(() => {
      load();
   }, [load]);

   const homeRows = rows.filter((row) => row.source === "home");
   const practicedOps = OPERATIONS.filter((op) => analytics.some((cell) => cell.operation === op));

   return (
      <div className="flex flex-col gap-6">
         <section className="rounded-2xl bg-white p-6 md:px-11">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
               <div className="max-w-2xl">
                  <h2 className="text-2xl font-semibold text-mainColor">{t("mathFactsPracticeSets")}</h2>
                  <p className="mt-1 text-sm text-gray-600">{t("mathFactsIntro")}</p>
               </div>
               <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  disabled={loading || error}
                  className="rounded-lg bg-mainColor px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
               >
                  {homeRows.length > 0 ? t("mathFactsChangePractice") : t("mathFactsSetUpPractice")}
               </button>
            </div>

            {loading ? (
               <p className="animate-pulse text-gray-500">{t("loading")}</p>
            ) : error ? (
               <div className="flex flex-wrap items-center gap-3 text-sm text-red-600">
                  <p>{t("mathFactsLoadFailed")}</p>
                  <button type="button" onClick={load} className="font-semibold underline">
                     {t("mathFactsTryAgain")}
                  </button>
               </div>
            ) : rows.length === 0 ? (
               <p className="text-gray-500">{t("mathFactsNoneAssigned", { name: childName })}</p>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-sm">
                     <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-500">
                           <th className="py-2 pr-4 font-medium">{t("mathFactsColSet")}</th>
                           <th className="px-4 py-2 font-medium">{t("mathFactsColAssignedBy")}</th>
                           <th className="px-4 py-2 font-medium">{t("mathFactsColSessions")}</th>
                           <th className="px-4 py-2 font-medium">{t("mathFactsColBest")}</th>
                           <th className="px-4 py-2 font-medium">{t("mathFactsColLastPlayed")}</th>
                           <th className="py-2 pl-4 font-medium">{t("mathFactsColStatus")}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {rows.map((row) => (
                           <tr key={row.record_id} className="border-b border-gray-100">
                              <td className="py-3 pr-4">
                                 <span className="block font-semibold text-gray-900">{row.fact_set_name}</span>
                                 <span className="text-xs text-gray-500">
                                    {t("mathFactsTargets", {
                                       count: row.question_count,
                                       accuracy: Math.round(row.target_accuracy * 100),
                                       time: row.target_avg_time,
                                    })}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                 {row.source === "home" ? t("mathFactsSourceHome") : row.class_name || t("mathFactsSourceClass")}
                              </td>
                              <td className="px-4 py-3 tabular-nums text-gray-700">{row.sessions_completed}</td>
                              <td className="px-4 py-3 tabular-nums text-gray-700">
                                 {row.sessions_completed > 0
                                    ? t("mathFactsBestValue", {
                                         accuracy: Math.round(row.best_accuracy * 100),
                                         time: row.best_avg_time.toFixed(1),
                                      })
                                    : "-"}
                              </td>
                              <td className="px-4 py-3 text-gray-700">{formatDate(row.last_played_at)}</td>
                              <td className="py-3 pl-4">
                                 <StatusBadge row={row} />
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </section>

         {!loading && !error && (
            <section className="rounded-2xl bg-white p-6 md:px-11">
               <h2 className="text-2xl font-semibold text-mainColor">{t("mathFactsMasteryTitle")}</h2>
               <p className="mt-1 mb-6 text-sm text-gray-600">{t("mathFactsMasteryIntro")}</p>
               {practicedOps.length === 0 ? (
                  <p className="text-gray-500">{t("mathFactsNoAttempts", { name: childName })}</p>
               ) : (
                  <div className={`grid grid-cols-1 gap-6 ${practicedOps.length > 1 ? "2xl:grid-cols-2" : ""}`}>
                     {practicedOps.map((op) => (
                        <MasteryHeatmap
                           key={op}
                           operation={HEATMAP_NAME[op]}
                           data={analytics.filter((cell) => cell.operation === op)}
                        />
                     ))}
                  </div>
               )}
            </section>
         )}

         {modalOpen && childId && (
            <AssignPracticeModal
               childId={childId}
               childName={childName}
               current={homeRows}
               onClose={() => setModalOpen(false)}
               onSaved={(overview) => {
                  setRows(overview.active_assignments ?? []);
                  setModalOpen(false);
               }}
            />
         )}
      </div>
   );
};

export default ChildMathFacts;
