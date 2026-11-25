import React, { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClassReportSource, teacherReportSource } from "services/classReportSource";
import { IMathQuestReport } from "types/interfaces/teacherstudent.interface";
import TeacherStudentMathQuest from "@/components/Teachers/students/studentsprogress/mathQuest";
import MathTests from "@/components/Teachers/students/studentsprogress/mathTests";

interface Props {
  classId: string | number;
  studentId: number;
  studentName: string;
  onClose: () => void;
  /** Where the data comes from and whether tests can be managed. Defaults to the teacher endpoints. */
  source?: ClassReportSource;
}

const emptyReport: IMathQuestReport = { rows: [], totals: [], recent_rounds: [] };

// One student's math in full: every Math Quest standard they have played and
// their tests. Reuses the cards from the student progress page.
export default function MathDetailModal({ classId, studentId, studentName, onClose, source = teacherReportSource }: Props) {
  const { t } = useTranslation("teacher");
  const titleId = useId();
  const [report, setReport] = useState<IMathQuestReport>(emptyReport);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    source
      .mathDetails(studentId, classId)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch(() => {
        if (!cancelled) setReport(emptyReport);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [classId, studentId, source]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#f0f4f8] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <h2 id={titleId} className="text-lg font-black text-slate-800">
            {t("mathReportDetailTitle", { name: studentName })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-2">
          <TeacherStudentMathQuest report={report} isLoading={loading} />
          <MathTests studentId={studentId} fetchTests={source.mathTests} readOnly={!source.canManageMathTests} />
        </div>
      </div>
    </div>
  );
}
