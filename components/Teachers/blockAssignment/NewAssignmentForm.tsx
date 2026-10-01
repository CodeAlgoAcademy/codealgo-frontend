import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import assignmentServices from "services/block_assignments";
import SkillPickerModal from "./SkillPickerModal";
import StudentPickerModal from "./StudentPickerModal";

const today = () => format(new Date(), "MM/dd/yyyy");

interface SelectedTopic {
   id: number;
   name: string;
}

interface Student {
   id: number;
   name: string;
   username: string;
}

interface NewAssignmentFormProps {
   classId: string | number;
   students: Student[];
   onSuccess: () => void;
   onCancel: () => void;
   editData?: any;
}

export default function NewAssignmentForm({ classId, students, onSuccess, onCancel, editData }: NewAssignmentFormProps) {
   const { t } = useTranslation("teacher");
   const [questionOrder, setQuestionOrder] = useState<"random" | "in_sequence">(editData?.question_order || "in_sequence");
   const [questionCount, setQuestionCount] = useState(editData?.question_count || 0);
   const [startNow, setStartNow] = useState(true);
   const [scheduledAt, setScheduledAt] = useState("");
   const [showSkillPicker, setShowSkillPicker] = useState(false);
   const [showStudentPicker, setShowStudentPicker] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState("");
   const [title, setTitle] = useState(editData?.title || today());
   const [gameType, setGameType] = useState<"block" | "line">(editData?.game_type || "block");

const handleGameTypeChange = (type: "block" | "line") => {
   if (type !== gameType) {
      setGameType(type);
      setSelectedTopics([]);
   }
};

   const [selectedTopics, setSelectedTopics] = useState<SelectedTopic[]>(editData?.topics || []);
   const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

   const removeTopic = (id: number) => setSelectedTopics((p) => p.filter((t) => t.id !== id));

   // Which assignment this form has already been populated from. Without it the
   // effect below re-ran on every parent render (the `students` prop is a fresh
   // array each time) and threw away students the teacher had just picked, so
   // saving an edit quietly dropped them from the assignment.
   const initialisedFor = useRef<number | null>(null);

   useEffect(() => {
      if (!editData) {
         initialisedFor.current = null;
         return;
      }
      if (initialisedFor.current === editData.id) return;
      initialisedFor.current = editData.id;

      setTitle(editData.title || today());
      setQuestionOrder(editData.question_order || "in_sequence");
      setQuestionCount(editData.question_count || 0);
      setSelectedTopics(editData.topics || []);

      // Built from the records themselves, not by intersecting with the class
      // roster. The roster comes from redux and can still be empty when this
      // runs, which used to show an edit form with nobody assigned.
      const roster = new Map(students.map((s) => [s.id, s]));
      const initialStudents: Student[] = (editData.student_records || [])
         .map((r: any) => {
            const id = r.student_id ?? r.student?.id;
            if (id == null) return null;
            const known = roster.get(id);
            const username = r.student_username || known?.username || "";
            return { id, name: known?.name || username, username };
         })
         .filter(Boolean) as Student[];

      setSelectedStudents(initialStudents);

      setStartNow(editData.status !== "scheduled");
      setScheduledAt(editData.scheduled_at ? new Date(editData.scheduled_at).toISOString().slice(0, 16) : "");
   }, [editData, students]);

   const handleSubmit = async () => {
      if (!title.trim()) return setError(t("titleRequired"));
      if (!startNow && !scheduledAt) return setError(t("pickScheduledDate"));

      setError("");
      setSubmitting(true);

      const payload = {
         title: title.trim(),
         topic_ids: selectedTopics.map((t) => t.id),
         question_order: questionOrder,
         question_count: questionCount,
         game_type: gameType,
         start_now: startNow,
         scheduled_at: startNow ? null : scheduledAt || null,
         student_ids: selectedStudents.map((s) => s.id),
      };
 try {
      if (editData) {
         await assignmentServices.updateAssignment(classId, editData.id, payload);
      } else {
         await assignmentServices.createAssignment(classId, payload);
      }
      onSuccess();
   } catch (err: any) {
      const serverError = err?.response?.data;

      if (serverError?.details && Array.isArray(serverError.details) && serverError.details.length > 0) {
         const firstErrorObj = serverError.details[0];
         
         const firstKey = Object.keys(firstErrorObj)[0];
         const firstMessage = firstErrorObj[firstKey];

         if (Array.isArray(firstMessage)) {
            setError(firstMessage[0]);
         } else {
            setError(firstMessage || t("validationErrorOccurred"));
         }
      } else if (serverError?.detail) {
         setError(serverError.detail);
      } else {
         setError(t("failedToSaveAssignment"));
      }
   } finally {
      setSubmitting(false);
   }
   };

   return (
      <>
         {showSkillPicker && (
            <SkillPickerModal
               classId={classId}
               selectedTopics={selectedTopics}
               gameType={gameType}
               onClose={() => setShowSkillPicker(false)}
               onConfirm={(topics) => {
                  setSelectedTopics(topics);
                  setShowSkillPicker(false);
               }}
            />
         )}

         {showStudentPicker && (
            <StudentPickerModal
               classId={classId}
               selectedIds={new Set(selectedStudents.map((s) => s.id))}
               onClose={() => setShowStudentPicker(false)}
               onConfirm={(selectedList) => {
                  setSelectedStudents(selectedList);
                  setShowStudentPicker(false);
               }}
            />
         )}

         <div className="mx-auto max-w-[900px] px-5 py-6">
            <div className="mb-4 flex justify-between">
               <button
                  className="cursor-pointer border-none bg-none p-0 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                  onClick={onCancel}
               >
                  ← {t("goBack")}
               </button>
               <button className="cursor-pointer rounded-lg border border-slate-200 bg-none px-3.5 py-1.5 text-[13px] text-slate-600 transition-colors hover:bg-gray-50">
                  🕐 {t("assignmentHistory")}
               </button>
            </div>

            <h1 className="mb-7 text-[28px] font-bold text-slate-900">{editData ? t("editAssignment") : t("newAssignment")}</h1>

   <div className="mb-10">
               <label className="mb-2 block text-sm text-slate-600">{t("assignmentTitle")}</label>
               <div className="flex max-w-[460px] items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <input
                     className="flex-1 border-none bg-transparent px-3.5 py-3 text-sm text-slate-900 outline-none"
                     value={title}
                     maxLength={40}
                     onChange={(e) => setTitle(e.target.value)}
                  />
                  <span className="px-3.5 text-xs text-slate-400">{title.length}/40</span>
               </div>
            </div>

            <div className="mb-7 rounded-xl ">
               <div className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900">{t("selectGameType")}</div>
               <div className="max-w-xs">
                  <select
                     value={gameType}
                     onChange={(e) => handleGameTypeChange(e.target.value as "block" | "line")}
                     className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition-colors focus:border-blue-600"
                  >
                     <option value="block">{t("blockCoding")}</option>
                     <option value="line">{t("lineCoding")}</option>
                  </select>
               </div>
               <p className="mt-2 text-xs text-slate-400">
                  {gameType === "block" ? t("blockGameDescription") : t("lineGameDescription")}
               </p>
            </div>
         

            <div className="mb-10">
               <div className="mb-3.5 text-lg font-bold text-slate-900">{t("skill")}</div>
               <div className="mb-2.5 text-[13px] font-semibold text-blue-600">
                  {selectedTopics.length > 0 ? t("skillsSelectedCount", { count: selectedTopics.length }) : t("anySkillHint")}
               </div>
               <div className="flex flex-wrap items-center gap-2">
                  {selectedTopics.map((topic) => (
                     <div
                        key={topic.id}
                        className="inline-flex items-center rounded-lg border-[1.5px] border-blue-200 bg-white py-1.5 pl-2.5 pr-0 text-[13px] text-blue-800"
                     >
                        <span className="mr-1.5 text-sm">🎯</span>
                        <span className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-medium">{topic.name}</span>
                        <span className="mx-2 text-base text-blue-200">|</span>
                        <button
                           className="cursor-pointer border-none bg-none px-2.5 py-0 text-xs font-bold text-red-500 transition-colors hover:text-red-600"
                           onClick={() => removeTopic(topic.id)}
                        >
                           ✕
                        </button>
                     </div>
                  ))}
                  <button
                     className="inline-flex cursor-pointer items-center rounded-lg border-[1.5px] border-dashed border-slate-300 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-gray-50"
                     onClick={() => setShowSkillPicker(true)}
                  >
                     <span className="mr-1 text-base">⊕</span> {t("selectSkills")}
                  </button>
               </div>
            </div>

            <div className="mb-10">
               <div className="mb-3.5 text-lg font-bold text-slate-900">{t("studentHeading")}</div>
               {selectedStudents.length > 0 && (
                  <div className="mb-2.5 text-[13px] font-semibold text-blue-600">{t("studentsSelectedCount", { count: selectedStudents.length })}</div>
               )}
               <div className="flex flex-wrap items-center gap-2">
                  {selectedStudents.map((s) => (
                     <div
                        key={s.id}
                        className="inline-flex items-center rounded-lg border-[1.5px] border-blue-200 bg-white py-1.5 pl-2.5 pr-0 text-[13px] text-blue-800"
                     >
                        <span className="mr-1.5 text-sm">👤</span>
                        <span className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-medium">{s.username}</span>
                        <span className="mx-2 text-base text-blue-200">|</span>
                        <button
                           className="cursor-pointer border-none bg-none px-2.5 py-0 text-xs font-bold text-red-500 transition-colors hover:text-red-600"
                           onClick={() => setSelectedStudents((prev) => prev.filter((item) => item.id !== s.id))}
                        >
                           ✕
                        </button>
                     </div>
                  ))}
                  <button
                     className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-slate-300 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-gray-50"
                     onClick={() => setShowStudentPicker(true)}
                  >
                     <span className="mr-1 text-base">⊕</span> {t("selectStudentsBtn")}
                  </button>
               </div>
            </div>

            <div className="mb-10">
               <div className="mb-3.5 text-lg font-bold text-slate-900">{t("parameters")}</div>
               <div className="mb-5">
                  <div className="mb-2.5 text-sm font-medium text-slate-700">{t("orderOfQuestions")}</div>
                  <div className="flex gap-6">
                     <label className="flex cursor-pointer items-center text-sm text-slate-700">
                        <input
                           type="radio"
                           name="order"
                           checked={questionOrder === "random"}
                           onChange={() => setQuestionOrder("random")}
                           className="mr-1.5 accent-blue-600"
                        />
                        {t("random")}
                     </label>
                     <label className="flex cursor-pointer items-center text-sm text-slate-700">
                        <input
                           type="radio"
                           name="order"
                           checked={questionOrder === "in_sequence"}
                           onChange={() => setQuestionOrder("in_sequence")}
                           className="mr-1.5 accent-blue-600"
                        />
                        {t("inSequence")}
                     </label>
                  </div>
               </div>
               <div>
                   <div className="mb-2.5 text-sm font-medium text-slate-700">{t("numberOfQuestions")}</div>
                  <div className="mt-1 flex items-center gap-3">
                     <input
                        type="number"
                        className="w-[60px] rounded-md border border-slate-200 p-2 text-center text-sm outline-none transition-colors focus:border-blue-600"
                        value={questionCount}
                        min={0}
                        max={100}
                        onChange={(e) => setQuestionCount(Math.max(0, parseInt(e.target.value) || 0))}
                     />
                     <input
                        type="range"
                        min={0}
                        max={100}
                        value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        className="w-full max-w-[500px] flex-1 accent-blue-600"
                     />
                     <span className="min-w-[28px] text-xs text-slate-400">{questionCount === 0 ? t("all") : questionCount}</span>
                  </div>
               </div>
            </div>

            <div className="mb-7">
               <div className="mb-3.5 text-lg font-bold text-slate-900">{t("scheduling")}</div>
               <div className="flex gap-6">
                  <label className="flex cursor-pointer items-center text-sm text-slate-700">
                     <input type="radio" name="schedule" checked={startNow} onChange={() => setStartNow(true)} className="mr-1.5 accent-blue-600" />
                     {t("startAssignmentNow")}
                  </label>
                  <label className="flex cursor-pointer items-center text-sm text-slate-700">
                     <input type="radio" name="schedule" checked={!startNow} onChange={() => setStartNow(false)} className="mr-1.5 accent-blue-600" />
                     {t("scheduleForLater")}
                  </label>
               </div>
               {!startNow && (
                  <input
                     type="datetime-local"
                     className="mt-3 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-blue-600"
                     value={scheduledAt}
                     onChange={(e) => setScheduledAt(e.target.value)}
                  />
               )}
            </div>

            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>}

            <div className="flex gap-3 pt-2">
               <button
                  className="cursor-pointer rounded-lg border-[1.5px] border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-gray-50"
                  onClick={onCancel}
               >
                  {t("cancel")}
               </button>
               <button
                  className={`cursor-pointer rounded-lg border-none bg-blue-600 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95 ${
                     submitting ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  disabled={submitting}
                  onClick={handleSubmit}
               >
                  {submitting ? t("saving") : editData ? t("saveChanges") : t("create")}
               </button>
            </div>
         </div>
      </>
   );
}
