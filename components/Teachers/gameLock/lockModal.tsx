import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "store/hooks";
import { updateCodingAccess, fetchCodingAccess } from "store/teacherStudentSlice";
import { BLOCK_CURRICULUM } from "constants/blockCurriculum";
import { updateChildCodingAccess } from "store/parentChildSlice";
import { ICodingAccess, IPlayedLevel, IPlayedMathStandard } from "types/interfaces/teacherstudent.interface";
import { MATH_QUEST_GRADES, mathGradeLabel } from "constants/mathQuest";

// Common Core codes sort by grade (K first), then as written.
const mathCodeSort = (code: string) => {
   const grade = code.split(".")[0];
   return (grade === "K" ? 0 : Number(grade) || 99) * 1000;
};

const formatUnitLevel = (unitLevel: string) => {
   const [unit, level] = unitLevel.split("_");
   if (!level) return unitLevel;
   return `Unit ${unit} - Level ${level}`;
};

// Mirrors compute_level_sort_index on the backend. Needed for the levels that
// are already locked: the server wiped their progress, so they come back with
// no sort index of their own.
const levelSortIndex = (unitLevel: string) => {
   const [unit, level] = unitLevel.split("_");
   if (!level) return 0;
   const unitNumber = unit.toLowerCase() === "k" ? 0 : Number(unit);
   const levelNumber = Number(level);
   if (Number.isNaN(unitNumber) || Number.isNaN(levelNumber)) return 0;
   return unitNumber * 10000 + levelNumber;
};

export default function LockModal({ student, onClose }: { student: any; onClose: () => void }) {
   const { t } = useTranslation("teacher");
   const dispatch = useAppDispatch();
   const [lineLocked, setLineLocked] = useState(student?.codingAccess?.line_coding_locked || false);
   const [blockLevel, setBlockLevel] = useState(student?.codingAccess?.block_coding_max_level || "");
   const [lockedLevels, setLockedLevels] = useState<string[]>(student?.codingAccess?.locked_levels || []);
   const [playedLevels, setPlayedLevels] = useState<IPlayedLevel[]>([]);
   const [mathLocked, setMathLocked] = useState<boolean>(student?.codingAccess?.math_locked || false);
   const [mathMaxGrade, setMathMaxGrade] = useState<string>(student?.codingAccess?.math_max_grade || "");
   const [mathLockedStandards, setMathLockedStandards] = useState<string[]>(student?.codingAccess?.math_locked_standards || []);
   const [playedMath, setPlayedMath] = useState<IPlayedMathStandard[]>([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (!student?.student_id) return;

      // The `student` prop is a snapshot taken when the row was clicked, so read
      // the response here rather than off the store - played_levels only comes
      // back on this fetch.
      dispatch(fetchCodingAccess(student.student_id))
         .unwrap()
         .then((access: ICodingAccess) => {
            setLineLocked(access.line_coding_locked);
            setBlockLevel(access.block_coding_max_level || "");
            setLockedLevels(access.locked_levels || []);
            setPlayedLevels(access.played_levels || []);
            setMathLocked(access.math_locked || false);
            setMathMaxGrade(access.math_max_grade || "");
            setMathLockedStandards(access.math_locked_standards || []);
            setPlayedMath(access.played_math_standards || []);
         })
         .catch(() => undefined);
   }, [student?.student_id, dispatch]);

   const toggleLockedLevel = (unitLevel: string) => {
      setLockedLevels((current) =>
         current.includes(unitLevel) ? current.filter((code) => code !== unitLevel) : [...current, unitLevel]
      );
   };

   // A level that is already locked has had its progress wiped, so it is no
   // longer in played_levels. Keep it on the list so it can be unlocked.
   const relockRows: IPlayedLevel[] = [
      ...playedLevels,
      ...lockedLevels
         .filter((code) => !playedLevels.some((level) => level.unit_level === code))
         .map((code) => ({ unit_level: code, sort_index: levelSortIndex(code), completed: false })),
   ].sort((a, b) => a.sort_index - b.sort_index || a.unit_level.localeCompare(b.unit_level));

   const toggleMathStandard = (code: string) => {
      setMathLockedStandards((current) => (current.includes(code) ? current.filter((c) => c !== code) : [...current, code]));
   };

   // Same as the block levels: a standard sent back has had its stars wiped, so
   // it is no longer in played_math_standards. Keep it listed so it can be undone.
   const mathRows: IPlayedMathStandard[] = [
      ...playedMath,
      ...mathLockedStandards
         .filter((code) => !playedMath.some((row) => row.code === code))
         .map((code) => ({ code, grade: code.split(".")[0], description: "", stars: 0, mastered: false })),
   ].sort((a, b) => mathCodeSort(a.code) - mathCodeSort(b.code) || a.code.localeCompare(b.code, undefined, { numeric: true }));

   const handleSave = async () => {
    setLoading(true);
    const id = student.student_id; 
    
    const isParent = window.location.pathname.includes('parent');
    const action = isParent ? updateChildCodingAccess : updateCodingAccess;

    await dispatch(action({ 
        studentId: id, 
        data: {
           line_coding_locked: lineLocked,
           block_coding_max_level: blockLevel,
           locked_levels: lockedLevels,
           math_locked: mathLocked,
           math_max_grade: mathMaxGrade,
           math_locked_standards: mathLockedStandards,
        }
    })).unwrap();
    
    setLoading(false);
    onClose();
};

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
         <div className="animate-in zoom-in max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl duration-200">
            <div className="flex items-center justify-between p-8 pb-4">
               <h2 className="text-xl font-bold text-slate-800">{t("editSettings", { name: student?.firstName })}</h2>
               <button onClick={onClose} className="text-3xl text-slate-300 hover:text-slate-500">
                  &times;
               </button>
            </div>

            <div className="space-y-10 p-10 pt-4">
                <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 p-6">
                  <div>
                     <h3 className="text-lg font-bold text-slate-800">{t("lineCodingMode")}</h3>
                     <p className="text-sm text-slate-400">{t("allowPythonEditor")}</p>
                  </div>
                  <button
                     onClick={() => setLineLocked(!lineLocked)}
                     className={`relative h-9 w-16 rounded-full transition-all ${!lineLocked ? "bg-green-500" : "bg-slate-300"}`}
                  >
                     <div
                        className={`absolute top-1.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${!lineLocked ? "left-8" : "left-1.5"}`}
                     />
                  </button>
               </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("blockGameProgressLimit")}</label>
                  <select value={blockLevel} onChange={(e) => setBlockLevel(e.target.value)} className="...">
                     <option value="">{t("noLimitUnrestricted")}</option>

                     {/* <optgroup label="Kindergarten">
                        {BLOCK_CURRICULUM.filter((l) => l.code.startsWith("K")).map((lvl) => (
                           <option key={lvl.code} value={lvl.code}>
                              {lvl.name}
                           </option>
                        ))}
                     </optgroup> */}

                     <optgroup label={t("gradeN", { n: 1 })}>
                        {BLOCK_CURRICULUM.filter((l) => l.code.startsWith("1")).map((lvl) => (
                           <option key={lvl.code} value={lvl.code}>
                              {lvl.name}
                           </option>
                        ))}
                     </optgroup>

                     <optgroup label={t("gradeN", { n: 2 })}>
                        {BLOCK_CURRICULUM.filter((l) => l.code.startsWith("2")).map((lvl) => (
                           <option key={lvl.code} value={lvl.code}>
                              {lvl.name}
                           </option>
                        ))}
                     </optgroup>
                  </select>
                  <p className="px-2 text-[11px] font-medium italic leading-relaxed text-slate-400">
                     {t("padlockedFromLevels")}
                  </p>
               </div>

               <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("levelsToRedo")}</label>
                  {relockRows.length === 0 ? (
                     <p className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-400">{t("noLevelsPlayedYet")}</p>
                  ) : (
                     <div className="max-h-56 divide-y divide-slate-50 overflow-y-auto rounded-3xl border border-slate-100">
                        {relockRows.map((level) => {
                           const isLocked = lockedLevels.includes(level.unit_level);

                           return (
                              <div key={level.unit_level} className="flex items-center justify-between px-6 py-4">
                                 <div>
                                    <p className="text-sm font-bold text-slate-700">{formatUnitLevel(level.unit_level)}</p>
                                    <p className="text-[11px] font-medium text-slate-400">
                                       {isLocked ? t("locked") : level.completed ? t("completed") : t("inProgress")}
                                    </p>
                                 </div>
                                 <button
                                    onClick={() => toggleLockedLevel(level.unit_level)}
                                    className={`rounded-xl border-2 px-5 py-1.5 text-sm font-bold transition-all ${
                                       isLocked
                                          ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                                          : "border-slate-100 bg-white text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                    }`}
                                 >
                                    {isLocked ? t("unlock") : t("lock")}
                                 </button>
                              </div>
                           );
                        })}
                     </div>
                  )}
                  <p className="px-2 text-[11px] font-medium italic leading-relaxed text-slate-400">{t("relockDescription")}</p>
               </div>

               <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 p-6">
                  <div>
                     <h3 className="text-lg font-bold text-slate-800">{t("mathQuest")}</h3>
                     <p className="text-sm text-slate-400">{t("allowMathQuest")}</p>
                  </div>
                  <button
                     onClick={() => setMathLocked(!mathLocked)}
                     className={`relative h-9 w-16 rounded-full transition-all ${!mathLocked ? "bg-green-500" : "bg-slate-300"}`}
                  >
                     <div
                        className={`absolute top-1.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${!mathLocked ? "left-8" : "left-1.5"}`}
                     />
                  </button>
               </div>

               <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("mathGradeLimit")}</label>
                  <select
                     value={mathMaxGrade}
                     onChange={(e) => setMathMaxGrade(e.target.value)}
                     className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
                  >
                     <option value="">{t("noLimitUnrestricted")}</option>
                     {MATH_QUEST_GRADES.map((grade) => (
                        <option key={grade} value={grade}>
                           {t("upToGrade", { grade: mathGradeLabel(grade, t) })}
                        </option>
                     ))}
                  </select>
                  <p className="px-2 text-[11px] font-medium italic leading-relaxed text-slate-400">{t("mathGradeLimitHelp")}</p>
               </div>

               <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("mathStandardsToRedo")}</label>
                  {mathRows.length === 0 ? (
                     <p className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-400">{t("noMathStandardsPlayedYet")}</p>
                  ) : (
                     <div className="max-h-56 divide-y divide-slate-50 overflow-y-auto rounded-3xl border border-slate-100">
                        {mathRows.map((row) => {
                           const isLocked = mathLockedStandards.includes(row.code);
                           return (
                              <div key={row.code} className="flex items-center justify-between gap-4 px-6 py-4">
                                 <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-700">{row.code}</p>
                                    <p className="truncate text-[11px] font-medium text-slate-400">
                                       {isLocked
                                          ? t("locked")
                                          : row.mastered
                                          ? t("mathMastered")
                                          : t("mathStars", { stars: row.stars })}
                                       {row.description ? ` - ${row.description}` : ""}
                                    </p>
                                 </div>
                                 <button
                                    onClick={() => toggleMathStandard(row.code)}
                                    className={`shrink-0 rounded-xl border-2 px-5 py-1.5 text-sm font-bold transition-all ${
                                       isLocked
                                          ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                                          : "border-slate-100 bg-white text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                    }`}
                                 >
                                    {isLocked ? t("unlock") : t("lock")}
                                 </button>
                              </div>
                           );
                        })}
                     </div>
                  )}
                  <p className="px-2 text-[11px] font-medium italic leading-relaxed text-slate-400">{t("mathRelockDescription")}</p>
               </div>
            </div>

            <div className="flex gap-4 bg-slate-50/50 p-8">
               <button onClick={onClose} className="flex-1 rounded-2xl py-4 font-bold text-slate-400 transition hover:bg-slate-200">
                  {t("cancel")}
               </button>
               <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
               >
                  {loading ? t("saving") : t("saveSettings")}
               </button>
            </div>
         </div>
      </div>
   );
}
