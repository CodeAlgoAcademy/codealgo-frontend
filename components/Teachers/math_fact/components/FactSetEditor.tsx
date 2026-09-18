import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import mathFactsService from "services/mathfact";
import { MathFactSet } from "types/interfaces/mathfact";
import { MathStandard } from "types/interfaces/mathStandards";
import StandardPicker from "./StandardPicker";
import { GRADES } from "./StandardFilters";

interface Props {
   isOpen: boolean;
   // null means create
   factSet: MathFactSet | null;
   defaultGrade?: string;
   onClose: () => void;
   onSaved: (set: MathFactSet) => void;
}

const OPERATIONS = [
   { value: "add", labelKey: "operationAdd" },
   { value: "subtract", labelKey: "operationSubtract" },
   { value: "multiply", labelKey: "operationMultiply" },
   { value: "divide", labelKey: "operationDivide" },
];

export default function FactSetEditor({ isOpen, factSet, defaultGrade, onClose, onSaved }: Props) {
   const { t } = useTranslation("teacher");

   const [name, setName] = useState("");
   const [operation, setOperation] = useState("add");
   const [aMin, setAMin] = useState(1);
   const [aMax, setAMax] = useState(10);
   const [bMin, setBMin] = useState(1);
   const [bMax, setBMax] = useState(10);
   const [grade, setGrade] = useState(defaultGrade ?? "3");
   const [standards, setStandards] = useState<MathStandard[]>([]);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (!isOpen) return;
      setError(null);
      if (factSet) {
         setName(factSet.name);
         setOperation(factSet.operation);
         setAMin(factSet.operand_a_min);
         setAMax(factSet.operand_a_max);
         setBMin(factSet.operand_b_min);
         setBMax(factSet.operand_b_max);
         setGrade(factSet.grade || defaultGrade || "3");
         setStandards(factSet.math_standards ?? []);
      } else {
         setName("");
         setOperation("add");
         setAMin(1);
         setAMax(10);
         setBMin(1);
         setBMax(10);
         setGrade(defaultGrade ?? "3");
         setStandards([]);
      }
   }, [isOpen, factSet, defaultGrade]);

   // Mirrors the server rules so the teacher is told before the round trip.
   const rangeError = (() => {
      if (aMin > aMax) return t("operandAMaxTooLow");
      if (bMin > bMax) return t("operandBMaxTooLow");
      if (operation === "divide" && bMin < 1) return t("divisorAtLeastOne");
      return null;
   })();

   const canSave = name.trim().length > 0 && !rangeError && !saving;

   const handleSave = async () => {
      setSaving(true);
      setError(null);
      try {
         const payload = {
            name: name.trim(),
            operation,
            operand_a_min: aMin,
            operand_a_max: aMax,
            operand_b_min: bMin,
            operand_b_max: bMax,
            grade,
            math_standard_ids: standards.map((s) => s.id),
         };
         const saved = factSet
            ? await mathFactsService.updateFactSet(factSet.id, payload)
            : await mathFactsService.createFactSet(payload);
         onSaved(saved);
      } catch (err: any) {
         // The API wraps field errors in a details list.
         const details = err?.response?.data?.details;
         const first =
            Array.isArray(details) && details.length > 0
               ? Object.values(details[0])[0]
               : null;
         setError(
            (Array.isArray(first) ? String(first[0]) : null) ??
               err?.response?.data?.detail ??
               t("failedToSaveSettings")
         );
      } finally {
         setSaving(false);
      }
   };

   if (!isOpen) return null;

   const numberInput =
      "w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold text-blue-600 outline-none focus:border-blue-400";

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
         <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-8 py-5">
               <h2 className="text-lg font-black text-slate-800">
                  {factSet ? t("editFactSet") : t("newFactSet")}
               </h2>
               <p className="mt-0.5 text-xs text-slate-500">{t("factSetEditorHint")}</p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/40 p-8">
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                     {t("factSetName")}
                  </label>
                  <input
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder={t("factSetNamePlaceholder")}
                     className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none focus:border-blue-400"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        {t("operation")}
                     </label>
                     <select
                        value={operation}
                        onChange={(e) => setOperation(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none"
                     >
                        {OPERATIONS.map((op) => (
                           <option key={op.value} value={op.value}>
                              {t(op.labelKey)}
                           </option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        {t("grade")}
                     </label>
                     <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none"
                     >
                        {GRADES.map((g) => (
                           <option key={g} value={g}>
                              {t("mathGradeLabel", { grade: g })}
                           </option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className="rounded-2xl border border-slate-100 bg-white p-5">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-wide text-slate-400">
                     {t("numberRanges")}
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">{t("firstMin")}</label>
                        <input type="number" value={aMin} onChange={(e) => setAMin(Number(e.target.value))} className={numberInput} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">{t("firstMax")}</label>
                        <input type="number" value={aMax} onChange={(e) => setAMax(Number(e.target.value))} className={numberInput} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">{t("secondMin")}</label>
                        <input type="number" value={bMin} onChange={(e) => setBMin(Number(e.target.value))} className={numberInput} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">{t("secondMax")}</label>
                        <input type="number" value={bMax} onChange={(e) => setBMax(Number(e.target.value))} className={numberInput} />
                     </div>
                  </div>
                  {rangeError && (
                     <p className="mt-3 text-xs font-semibold text-red-600">{rangeError}</p>
                  )}
               </div>

               <div className="space-y-2">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        {t("alignToStandards")}
                     </p>
                     <p className="text-xs text-slate-500">{t("alignToStandardsHint")}</p>
                  </div>
                  <StandardPicker selected={standards} onChange={setStandards} defaultGrade={grade} />
               </div>
            </div>

            {error && (
               <div className="border-t border-red-100 bg-red-50 px-8 py-3">
                  <p className="text-xs font-semibold text-red-600">{error}</p>
               </div>
            )}

            <div className="flex gap-4 border-t border-slate-100 bg-white p-6">
               <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-400 hover:bg-slate-50"
               >
                  {t("cancel")}
               </button>
               <button
                  type="button"
                  disabled={!canSave}
                  onClick={handleSave}
                  className="flex-[2] rounded-2xl bg-blue-600 py-3 text-sm font-black text-white shadow-xl shadow-blue-100 transition-all hover:scale-[1.01] disabled:opacity-50"
               >
                  {saving ? t("processing") : t("save")}
               </button>
            </div>
         </div>
      </div>
   );
}
