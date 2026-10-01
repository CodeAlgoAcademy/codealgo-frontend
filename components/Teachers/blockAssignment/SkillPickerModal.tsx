import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { BlockStandardWithTopics, BlockTopic } from "types/interfaces/assignments";
import { RootState } from "store/store";
import assignmentServices from "services/block_assignments";
import { GRADES } from "../constant/constants";

interface SelectedTopic {
   id: number;
   name: string;
}

interface SkillPickerModalProps {
   classId: string | number;
   selectedTopics: SelectedTopic[];
   gameType: "block" | "line";
   onConfirm: (topics: SelectedTopic[]) => void;
   onClose: () => void;
}

const SUBJECT_MAP = {
   block: [
      { labelKey: "logic", value: "logic" },
   ],
   line: [
      { labelKey: "science", value: "science" },
   ],
};


export default function SkillPickerModal({ selectedTopics, onConfirm, onClose, gameType }: SkillPickerModalProps) {
   const { t } = useTranslation("teacher");
   const [grade, setGrade] = useState("");
   const [search, setSearch] = useState("");
   const [standards, setStandards] = useState<BlockStandardWithTopics[]>([]);
   const [loading, setLoading] = useState(false);
   const [expanded, setExpanded] = useState<Set<number>>(new Set());
   const [localMap, setLocalMap] = useState<Map<number, string>>(() => new Map(selectedTopics.map((t) => [t.id, t.name])));
   const classId = useSelector((state: RootState) => state.currentClass?.id);

 const currentSubjects = SUBJECT_MAP[gameType];
   const [subject, setSubject] = useState(currentSubjects[0].value);

   useEffect(() => {
      setSubject(currentSubjects[0].value);
   }, [gameType]);

   useEffect(() => {
      setLoading(true);
      assignmentServices
         .getSkillPicker(grade || undefined, gameType, subject)
         .then((data) => {
            setStandards(data);
            if (data.length) setExpanded(new Set([data[0].id]));
         })
         .catch(console.error)
         .finally(() => setLoading(false));
   }, [grade, gameType, subject]);

   // Only show what can actually serve questions. Older API responses have no
   // question_count, so fall back to "has topics".
   const hasQuestions = (n: number | undefined, fallback: boolean) => (n === undefined ? fallback : n > 0);

   const available = standards
      .map((s) => {
         // Line pools come from the standard, so its topics all ride on it.
         const topics =
            gameType === "line"
               ? s.topics
               : s.topics.filter((t) => hasQuestions(t.question_count, true));
         return { ...s, topics };
      })
      .filter((s) => s.topics.length > 0 && hasQuestions(s.question_count, true));

   const q = search.trim().toLowerCase();
   const filtered = available
      .filter((s) => {
         if (!q) return true;
         return (
            s.code.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.topics.some((t) => t.name.toLowerCase().includes(q))
         );
      })
      .sort((a, b) => a.code.localeCompare(b.code));

   const toggleExpand = (id: number) =>
      setExpanded((prev) => {
         const next = new Set(prev);
         next.has(id) ? next.delete(id) : next.add(id);
         return next;
      });

   const toggleTopic = (topic: BlockTopic) =>
      setLocalMap((prev) => {
         const next = new Map(prev);
         next.has(topic.id) ? next.delete(topic.id) : next.set(topic.id, topic.name);
         return next;
      });

   const toggleAll = (std: BlockStandardWithTopics) => {
      const allSel = std.topics.every((t) => localMap.has(t.id));
      setLocalMap((prev) => {
         const next = new Map(prev);
         if (allSel) {
            std.topics.forEach((t) => next.delete(t.id));
         } else {
            std.topics.forEach((t) => next.set(t.id, t.name));
         }
         return next;
      });
   };

   return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
         <div
            className="flex max-h-[90vh] w-[min(920px,96vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
         >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
               <div>
                  <h2 className="text-xl font-bold text-slate-900">{t("selectSkillsTitle")}</h2>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-blue-600">
                     {gameType === "block" ? t("blockCodingMode") : t("lineCodingMode")}
                  </p>
               </div>
               <button
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  onClick={onClose}
               >
                  ✕
               </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
               <div className="w-56 flex-shrink-0 overflow-y-auto border-r border-slate-100 bg-slate-50/40 p-5">
                  <div className="mb-5">
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("subject")}</label>
                     <select
                        className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                     >
                        {currentSubjects.map((s) => (
                           <option key={s.value} value={s.value}>
                              {t(s.labelKey)}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div className="mb-5">
                     <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("curriculum")}</div>
                     <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                        CSTA
                     </div>
                  </div>

                  <div>
                     <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("gradeLabel")}</div>
                     <div className="grid grid-cols-2 gap-1.5">
                        {GRADES.map((g) => (
                           <button
                              key={g.value}
                              className={`cursor-pointer rounded-md px-2 py-1.5 text-left text-xs font-medium transition-all ${
                                 grade === g.value ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300" : "bg-white text-slate-600 hover:bg-slate-100"
                              }`}
                              onClick={() => setGrade((p) => (p === g.value ? "" : g.value))}
                           >
                              {g.value === "K" ? t("kindergarten") : t("gradeN", { n: g.value })}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-slate-100 bg-white px-5 py-3">
                     <span className="text-slate-400">🔍</span>
                     <input
                        className="flex-1 border-none bg-transparent py-1.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        placeholder={t("searchForSkillsPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                     {search && (
                        <button className="text-xs text-slate-400 hover:text-slate-600" onClick={() => setSearch("")}>
                           {t("clear")}
                        </button>
                     )}
                  </div>

                  {loading ? (
                     <div className="flex flex-1 items-center justify-center text-slate-400">{t("loadingSkills")}</div>
                  ) : filtered.length === 0 ? (
                     <div className="flex flex-1 items-center justify-center text-slate-400">{t("noMatchingSkills")}</div>
                  ) : (
                     <div className="flex-1 overflow-y-auto p-4">
                        {filtered.map((std) => {
                           const selCount = std.topics.filter((t) => localMap.has(t.id)).length;
                           const isOpen = expanded.has(std.id);
                           const allPicked = std.topics.length > 0 && selCount === std.topics.length;
                           return (
                              <div key={std.id} className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                 <div
                                    className="flex cursor-pointer select-none items-center justify-between p-4 transition-colors hover:bg-slate-50"
                                    onClick={() => toggleExpand(std.id)}
                                 >
                                    <div className="flex items-center gap-3">
                                       <span className="text-xl">🎯</span>
                                       <div className="flex flex-col">
                                          <span className="text-sm font-bold text-slate-900">{std.name}</span>
                                          <span className="text-[11px] font-medium uppercase text-slate-400">{std.code}</span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selCount > 0 && (
                                           <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                              {t("selectedCount", { count: selCount })}
                                           </span>
                                        )}
                                        <span className="text-xs font-bold text-mainColor">
                                           {t("skillsCount", { count: std.topics.length })}
                                        </span>
                                       <button
                                          className={`rounded-md border px-2 py-0.5 text-xs font-medium transition-colors ${
                                             allPicked
                                                ? "border-blue-300 bg-blue-50 text-blue-700"
                                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                          }`}
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             toggleAll(std);
                                          }}
                                       >
                                          {allPicked ? t("deselectAll") : t("selectAll")}
                                       </button>
                                       <span className="text-xs text-slate-400">{isOpen ? "▲" : "▼"}</span>
                                    </div>
                                 </div>

                                 {isOpen && (
                                    <div className="border-t border-slate-100 bg-slate-50/30 px-4 py-2 pl-12">
                                       {std.topics.map((topic) => {
                                          const checked = localMap.has(topic.id);
                                          return (
                                             <label
                                                key={topic.id}
                                                className={`flex cursor-pointer items-center rounded-md py-2.5 pl-2 transition-colors hover:bg-slate-100 ${
                                                   checked ? "bg-blue-50/40" : ""
                                                }`}
                                             >
                                                <input
                                                   type="checkbox"
                                                   checked={checked}
                                                   onChange={() => toggleTopic(topic)}
                                                   className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600"
                                                />
                                                <span className={`ml-3 text-sm ${checked ? "font-medium text-blue-700" : "text-slate-700"}`}>
                                                   {topic.name}
                                                </span>
                                                {gameType === "block" && topic.question_count !== undefined && (
                                                   <span className="ml-auto pr-3 text-xs text-slate-400">
                                                      {t("questionsCount", { count: topic.question_count })}
                                                   </span>
                                                )}
                                             </label>
                                          );
                                       })}
                                    </div>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
               <span className="text-sm font-medium text-slate-600">
                  {localMap.size === 0 ? t("anySkillHint") : t("skillsSelectedCount", { count: localMap.size })}
               </span>
               <div className="flex items-center gap-2">
                  <button
                     className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                     onClick={() => onConfirm([])}
                  >
                     {t("noSpecificSkill")}
                  </button>
                  <button
                     className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95"
                     onClick={() => onConfirm(Array.from(localMap.entries()).map(([id, name]) => ({ id, name })))}
                  >
                     {t("done")}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
