import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import TeacherLayout from "@/components/layouts/TeacherLayout";
import { RootState } from "store/store";
import MathFactsPage from "@/components/Teachers/math_fact/mathfact";
import MathReportsView from "@/components/Teachers/math_fact/components/mathReportsView";

export default function MathAssignmentsPage() {
   const { t } = useTranslation("teacher");
   const classId = useSelector((state: RootState) => state.currentClass?.id);
   const [showReports, setShowReports] = useState(false);

   if (showReports) {
      return (
         <TeacherLayout>
            <div className="mx-auto max-w-7xl px-6 py-8">
               <button
                  onClick={() => setShowReports(false)}
                  className="mb-4 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-800"
               >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  {t("mathAssignments")}
               </button>

               <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900">{t("mathMasteryReports")}</h1>
                  <p className="text-slate-500">{t("mathReportsDescription")}</p>
               </div>

               <MathReportsView classId={classId} />
            </div>
         </TeacherLayout>
      );
   }

   return (
      <TeacherLayout>
         <MathFactsPage onViewReport={() => setShowReports(true)} />
      </TeacherLayout>
   );
}
