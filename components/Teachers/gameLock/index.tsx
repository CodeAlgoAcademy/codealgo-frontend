import React, { useState, useEffect } from "react"; // Added useEffect
import { useSelector, useDispatch } from "react-redux"; // Added useDispatch
import { useTranslation } from "react-i18next";
import { RootState } from "store/store";
import { getStudents } from "store/studentSlice"; // Import your fetch action
import LockModal from "./lockModal";
import SkipPinCard from "./SkipPinCard";
import { useAppDispatch } from "store/hooks";
import { BaseStudent } from "types/interfaces/teacherstudent.interface";
import { fetchAllClassAccess } from "store/teacherStudentSlice";

export default function GameLocksPage() {
   const { t } = useTranslation("teacher");
   const dispatch = useAppDispatch();
   const { students, isLoading } = useSelector((state: RootState) => state.teacherStudentSlice);
   const { id: classId } = useSelector((state: RootState) => state.currentClass);
   
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedStudent, setSelectedStudent] = useState<any>(null);

useEffect(() => {
   if (classId) {
      dispatch(getStudents(classId))
         .unwrap()
         .then((studentsList: BaseStudent[]) => {
            dispatch(fetchAllClassAccess(studentsList));
         });
   }
}, [classId, dispatch]);

   if (isLoading && students.length === 0) {
      return (
         <div className="flex h-screen items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#f8fafc] p-8">
         <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1e293b]">{t("classroomGameAccess")}</h1>
            <p className="text-slate-500">{t("gameAccessDescription")}</p>
         </header>
         <SkipPinCard />
         {students.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
               <p className="text-slate-400">{t("noStudentsInThisClass")}</p>
            </div>
         ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-2 shadow-sm">
               {students.map((student) => {
                  const access = student.codingAccess;
                  const relockedCount = access?.locked_levels?.length || 0;
                  const isLocked =
                     access?.line_coding_locked || (access?.block_coding_max_level && access?.block_coding_max_level !== "") || relockedCount > 0;

                  return (
                     <div
                        key={student.student_id}
                        className="flex items-center justify-between rounded-2xl border-b border-slate-50 p-6 transition-all hover:bg-slate-50/50"
                     >
                        <div className="flex items-center gap-5">
                           <div
                              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-sm ${
                                 isLocked ? "bg-amber-50 text-amber-500" : "bg-green-50 text-mainColor"
                              }`}
                           >
                              {isLocked ? "🔒" : "🔓"}
                           </div>
                           <div>
                              <p className="text-lg font-bold text-slate-800">
                                 {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm font-medium text-slate-400">@{student.username}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-12">
                           <div className="text-right">
                              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-300">{t("lineCoding")}</p>
                              <p className={`text-sm font-bold ${access?.line_coding_locked ? "text-red-400" : "text-green-500"}`}>
                                 {access?.line_coding_locked ? t("locked") : t("active")}
                              </p>
                           </div>
                           <div className="border-l border-slate-100 pl-12 text-right">
                              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-300">{t("blockGameAccess")}</p>
                              <p className="text-sm font-bold text-slate-600">
                                 {access?.block_coding_max_level ? access.block_coding_max_level.replace("_", " Level ") : t("noLimit")}
                              </p>
                           </div>
                           <div className="border-l border-slate-100 pl-12 text-right">
                              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-300">{t("levelsToRedo")}</p>
                              <p className={`text-sm font-bold ${relockedCount > 0 ? "text-amber-500" : "text-slate-600"}`}>
                                 {relockedCount > 0 ? relockedCount : t("none")}
                              </p>
                           </div>
                           <button
                              onClick={() => {
                                 setSelectedStudent(student);
                                 setIsModalOpen(true);
                              }}
                              className="rounded-xl border-2 border-slate-100 bg-white px-6 py-2 font-bold text-blue-600 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50"
                           >
                              {t("edit")}
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}

         {isModalOpen && <LockModal student={selectedStudent} onClose={() => setIsModalOpen(false)} />}
      </div>
   );
}