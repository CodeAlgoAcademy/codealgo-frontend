import React, { useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdClose } from "react-icons/md";
import mathFactsService from "services/mathfact";
import { ChildMathFactAssignment, ChildMathFactOverview, MathFactSet, MathOperation } from "types/interfaces/mathfact";

interface Props {
   childId: string | number;
   childName?: string;
   // The child's current home practice, used to prefill the form.
   current: ChildMathFactAssignment[];
   onClose: () => void;
   onSaved: (overview: ChildMathFactOverview) => void;
}

const OPERATIONS: { value: MathOperation; labelKey: string }[] = [
   { value: "add", labelKey: "mathFactsOpAdd" },
   { value: "subtract", labelKey: "mathFactsOpSubtract" },
   { value: "multiply", labelKey: "mathFactsOpMultiply" },
   { value: "divide", labelKey: "mathFactsOpDivide" },
];

const GRADE_ORDER = ["PK", "K", "1", "2", "3", "4", "5", "6", "7", "8+"];

const AssignPracticeModal = ({ childId, childName, current, onClose, onSaved }: Props) => {
   const { t } = useTranslation("parent");
   const titleId = useId();

   const [factSets, setFactSets] = useState<MathFactSet[]>([]);
   const [loadingSets, setLoadingSets] = useState(true);
   const [loadFailed, setLoadFailed] = useState(false);
   const [operation, setOperation] = useState<MathOperation | "all">("all");
   const [grade, setGrade] = useState("");
   const [selected, setSelected] = useState<number[]>(() => current.map((row) => row.fact_set_id));
   const [questionCount, setQuestionCount] = useState(current[0]?.question_count ?? 20);
   const [accuracy, setAccuracy] = useState(Math.round((current[0]?.target_accuracy ?? 0.9) * 100));
   const [avgTime, setAvgTime] = useState(current[0]?.target_avg_time ?? 5);
   const [saving, setSaving] = useState(false);
   const [saveFailed, setSaveFailed] = useState(false);

   useEffect(() => {
      let cancelled = false;
      mathFactsService
         .getChildFactSets(childId)
         .then((data) => {
            if (!cancelled) setFactSets(data);
         })
         .catch(() => {
            if (!cancelled) setLoadFailed(true);
         })
         .finally(() => {
            if (!cancelled) setLoadingSets(false);
         });
      return () => {
         cancelled = true;
      };
   }, [childId]);

   useEffect(() => {
      const onKey = (event: KeyboardEvent) => {
         if (event.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
   }, [onClose]);

   const grades = useMemo(() => {
      const present = new Set(factSets.map((fs) => fs.grade).filter(Boolean));
      return GRADE_ORDER.filter((g) => present.has(g));
   }, [factSets]);

   const visible = factSets.filter(
      (fs) => (operation === "all" || fs.operation === operation) && (!grade || fs.grade === grade)
   );

   const toggle = (id: number) => setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

   const settingsValid =
      questionCount >= 5 && questionCount <= 50 && accuracy >= 1 && accuracy <= 100 && avgTime >= 0.5 && avgTime <= 120;
   const turningOff = selected.length === 0;

   const save = async () => {
      setSaving(true);
      setSaveFailed(false);
      try {
         const overview = await mathFactsService.setChildMathFacts(childId, {
            fact_set_ids: selected,
            question_count: questionCount,
            target_accuracy: accuracy / 100,
            target_avg_time: avgTime,
         });
         onSaved(overview);
      } catch (err) {
         setSaveFailed(true);
         setSaving(false);
      }
   };

   const chip = (active: boolean) =>
      `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
         active ? "bg-mainColor text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`;

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
         <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
         >
            <header className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
               <h2 id={titleId} className="text-lg font-semibold text-gray-900">
                  {t("mathFactsModalTitle", { name: childName })}
               </h2>
               <button type="button" onClick={onClose} aria-label={t("cancel")} className="rounded p-1 text-gray-500 hover:bg-gray-100">
                  <MdClose size={22} />
               </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
               <div className="flex flex-wrap items-center justify-between gap-3">
                  <div role="group" aria-label={t("mathFactsFilterOperation")} className="flex flex-wrap gap-2">
                     <button type="button" aria-pressed={operation === "all"} onClick={() => setOperation("all")} className={chip(operation === "all")}>
                        {t("mathFactsAllOperations")}
                     </button>
                     {OPERATIONS.map((op) => (
                        <button
                           key={op.value}
                           type="button"
                           aria-pressed={operation === op.value}
                           onClick={() => setOperation(op.value)}
                           className={chip(operation === op.value)}
                        >
                           {t(op.labelKey)}
                        </button>
                     ))}
                  </div>
                  {grades.length > 1 && (
                     <select
                        aria-label={t("mathFactsFilterGrade")}
                        value={grade}
                        onChange={(event) => setGrade(event.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
                     >
                        <option value="">{t("mathFactsAllGrades")}</option>
                        {grades.map((g) => (
                           <option key={g} value={g}>
                              {t("mathFactsGradeLabel", { grade: g })}
                           </option>
                        ))}
                     </select>
                  )}
               </div>

               <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                     <span className="font-medium text-gray-700">{t("mathFactsSelectedCount", { count: selected.length })}</span>
                     {selected.length > 0 && (
                        <button type="button" onClick={() => setSelected([])} className="font-medium text-mainColor hover:underline">
                           {t("mathFactsClearSelection")}
                        </button>
                     )}
                  </div>
                  {loadingSets ? (
                     <p className="animate-pulse py-6 text-center text-sm text-gray-500">{t("loading")}</p>
                  ) : loadFailed ? (
                     <p className="py-6 text-center text-sm text-red-600">{t("mathFactsSetsLoadFailed")}</p>
                  ) : visible.length === 0 ? (
                     <p className="rounded-lg border border-dashed border-gray-300 py-6 text-center text-sm text-gray-500">{t("mathFactsNoSets")}</p>
                  ) : (
                     <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
                        {visible.map((fs) => (
                           <li key={fs.id}>
                              <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-blue-50">
                                 <input
                                    type="checkbox"
                                    checked={selected.includes(fs.id)}
                                    onChange={() => toggle(fs.id)}
                                    className="h-4 w-4 shrink-0 accent-mainColor"
                                 />
                                 <span className="min-w-0 flex-1 text-sm font-medium text-gray-900">{fs.name}</span>
                                 {fs.grade && <span className="shrink-0 text-xs text-gray-500">{t("mathFactsGradeLabel", { grade: fs.grade })}</span>}
                              </label>
                           </li>
                        ))}
                     </ul>
                  )}
               </div>

               {turningOff ? (
                  <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("mathFactsTurnOffHint")}</p>
               ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                     <label className="text-sm font-medium text-gray-700">
                        {t("mathFactsProblemsPerSession")}
                        <input
                           type="number"
                           min={5}
                           max={50}
                           step={5}
                           value={questionCount}
                           onChange={(event) => setQuestionCount(Number(event.target.value))}
                           className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                        />
                     </label>
                     <label className="text-sm font-medium text-gray-700">
                        {t("mathFactsMinAccuracy")}
                        <input
                           type="number"
                           min={1}
                           max={100}
                           value={accuracy}
                           onChange={(event) => setAccuracy(Number(event.target.value))}
                           className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                        />
                     </label>
                     <label className="text-sm font-medium text-gray-700">
                        {t("mathFactsMaxTime")}
                        <input
                           type="number"
                           min={0.5}
                           max={120}
                           step={0.5}
                           value={avgTime}
                           onChange={(event) => setAvgTime(Number(event.target.value))}
                           className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                        />
                     </label>
                  </div>
               )}
            </div>

            {saveFailed && (
               <p role="alert" className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
                  {t("mathFactsSaveFailed")}
               </p>
            )}

            <footer className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
               <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  {t("cancel")}
               </button>
               <button
                  type="button"
                  onClick={save}
                  disabled={saving || loadingSets || loadFailed || (!turningOff && !settingsValid)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                     turningOff ? "bg-red-600 hover:bg-red-700" : "bg-mainColor hover:bg-blue-700"
                  }`}
               >
                  {saving ? t("mathFactsSaving") : turningOff ? t("mathFactsTurnOff") : t("mathFactsSave")}
               </button>
            </footer>
         </div>
      </div>
   );
};

export default AssignPracticeModal;
