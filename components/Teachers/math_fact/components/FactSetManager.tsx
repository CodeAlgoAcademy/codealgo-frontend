import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import mathFactsService from "services/mathfact";
import { MathFactSet } from "types/interfaces/mathfact";
import FactSetEditor from "./FactSetEditor";
import StandardFilters, { EMPTY_FILTERS, StandardFilterValue } from "./StandardFilters";

interface Props {
   classId: string | number;
   classGrade?: string;
}

export default function FactSetManager({ classId, classGrade }: Props) {
   const { t } = useTranslation("teacher");
   const [sets, setSets] = useState<MathFactSet[]>([]);
   const [filters, setFilters] = useState<StandardFilterValue>(EMPTY_FILTERS);
   const [onlyMine, setOnlyMine] = useState(false);
   const [onlyUntagged, setOnlyUntagged] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [editorOpen, setEditorOpen] = useState(false);
   const [editing, setEditing] = useState<MathFactSet | null>(null);

   const load = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         // class_id is deliberately left out: this view manages the teacher's
         // library, which is wider than one class's grade.
         const data = await mathFactsService.getFactSets("", {
            framework: filters.framework || undefined,
            domain: filters.domain || undefined,
            standard_grade: filters.grade || undefined,
            mine: onlyMine,
            untagged: onlyUntagged,
         });
         setSets(data);
      } catch {
         setError(t("failedToLoadSets"));
      } finally {
         setLoading(false);
      }
   }, [filters, onlyMine, onlyUntagged, t]);

   useEffect(() => {
      load();
   }, [load]);

   const handleDuplicate = async (set: MathFactSet) => {
      try {
         const copy = await mathFactsService.duplicateFactSet(set.id);
         setEditing(copy);
         setEditorOpen(true);
         load();
      } catch {
         setError(t("failedToSaveSettings"));
      }
   };

   const handleDelete = async (set: MathFactSet) => {
      try {
         await mathFactsService.deleteFactSet(set.id);
         load();
      } catch (err: any) {
         setError(err?.response?.data?.detail ?? t("failedToSaveSettings"));
      }
   };

   return (
      <div className="space-y-5">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
               <h2 className="text-xl font-bold text-gray-800">{t("factSetLibrary")}</h2>
               <p className="text-sm text-slate-500">{t("factSetLibraryHint")}</p>
            </div>
            <button
               onClick={() => {
                  setEditing(null);
                  setEditorOpen(true);
               }}
               className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
               + {t("newFactSet")}
            </button>
         </div>

         <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <StandardFilters value={filters} onChange={setFilters} compact />
            <div className="flex flex-wrap gap-5">
               <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600">
                  <input type="checkbox" checked={onlyMine} onChange={() => setOnlyMine((v) => !v)} className="h-4 w-4 accent-blue-600" />
                  {t("onlyMySets")}
               </label>
               <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600">
                  <input type="checkbox" checked={onlyUntagged} onChange={() => setOnlyUntagged((v) => !v)} className="h-4 w-4 accent-blue-600" />
                  {t("onlyUntagged")}
               </label>
            </div>
         </div>

         {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-600">
               {error}
            </div>
         )}

         <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading && <div className="p-10 text-center text-sm text-slate-400">{t("loading")}</div>}
            {!loading && sets.length === 0 && (
               <div className="p-10 text-center text-sm italic text-slate-400">{t("noFactSetsMatch")}</div>
            )}
            {!loading && sets.length > 0 && (
               <div className="divide-y divide-gray-100">
                  {sets.map((set) => (
                     <div key={set.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                        <div className="min-w-0 flex-1">
                           <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">{set.name}</span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                 {set.operation_display}
                              </span>
                              {!set.is_editable && (
                                 <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">
                                    {t("sharedSet")}
                                 </span>
                              )}
                           </div>
                           <p className="mt-0.5 text-xs text-slate-400">
                              {set.operand_a_min}-{set.operand_a_max} &times; {set.operand_b_min}-{set.operand_b_max}
                              {set.grade ? ` · ${t("mathGradeLabel", { grade: set.grade })}` : ""}
                           </p>
                           <div className="mt-2 flex flex-wrap gap-1.5">
                              {(set.math_standards ?? []).length === 0 ? (
                                 <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 ring-1 ring-red-100">
                                    {t("noStandardsTagged")}
                                 </span>
                              ) : (
                                 (set.math_standards ?? []).map((s) => (
                                    <span
                                       key={s.id}
                                       title={s.description}
                                       className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-blue-100"
                                    >
                                       {s.code}
                                    </span>
                                 ))
                              )}
                           </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                           {set.is_editable ? (
                              <>
                                 <button
                                    onClick={() => {
                                       setEditing(set);
                                       setEditorOpen(true);
                                    }}
                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                 >
                                    {t("edit")}
                                 </button>
                                 <button
                                    onClick={() => handleDelete(set)}
                                    className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50"
                                 >
                                    {t("delete")}
                                 </button>
                              </>
                           ) : (
                              <button
                                 onClick={() => handleDuplicate(set)}
                                 className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                              >
                                 {t("duplicateAndEdit")}
                              </button>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         <FactSetEditor
            isOpen={editorOpen}
            factSet={editing}
            defaultGrade={classGrade}
            onClose={() => setEditorOpen(false)}
            onSaved={() => {
               setEditorOpen(false);
               load();
            }}
         />
      </div>
   );
}
