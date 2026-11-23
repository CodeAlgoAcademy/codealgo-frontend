import React, { useCallback, useEffect, useState } from "react";
import TeacherLayout from "@/components/layouts/TeacherLayout";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { useAppDispatch } from "store/hooks";
import { useTranslation } from "react-i18next";
import { fetchDiagnosticSummary, fetchLineDiagnosticSummary } from "store/teacherStudentSlice";
import DiagnosticDetailModal from "@/components/Teachers/report/modal";
import LineDiagnosticModal from "@/components/Teachers/report/LineDiagnosticModal";
import MathReportTable from "@/components/Teachers/report/MathReportTable";
import MathDetailModal from "@/components/Teachers/report/MathDetailModal";
import teachersClassServices from "services/teachersClassServices";
import { IMathClassSummaryRow } from "types/interfaces/teacherstudent.interface";

const MASTERY_CONFIG: Record<
  string,
  {
    labelKey: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    pct: number;
  }
> = {
  advanced: {
    labelKey: "masteryAdvanced",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#6ee7b7",
    dot: "#10b981",
    pct: 100,
  },
  proficient: {
    labelKey: "masteryProficient",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#93c5fd",
    dot: "#3b82f6",
    pct: 80,
  },
  secure: {
    labelKey: "masterySecure",
    color: "#5b21b6",
    bg: "#f5f3ff",
    border: "#c4b5fd",
    dot: "#8b5cf6",
    pct: 65,
  },
  developing: {
    labelKey: "masteryDeveloping",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fcd34d",
    dot: "#f59e0b",
    pct: 45,
  },
  emerging: {
    labelKey: "masteryEmerging",
    color: "#9a3412",
    bg: "#fff7ed",
    border: "#fdba74",
    dot: "#f97316",
    pct: 25,
  },
  remediation: {
    labelKey: "masteryRemediation",
    color: "#991b1b",
    bg: "#fef2f2",
    border: "#fca5a5",
    dot: "#ef4444",
    pct: 10,
  },
};

const MASTERY_ORDER = [
  "advanced",
  "proficient",
  "secure",
  "developing",
  "emerging",
  "remediation",
];

const PERSISTENCE_CONFIG: Record<
  string,
  {
    labelKey: string;
    color: string;
    bg: string;
    border: string;
  }
> = {
  high: {
    labelKey: "persistenceHigh",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#6ee7b7",
  },
  medium: {
    labelKey: "persistenceMedium",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fcd34d",
  },
  emerging: {
    labelKey: "persistenceEmerging",
    color: "#9a3412",
    bg: "#fff7ed",
    border: "#fdba74",
  },
  low: {
    labelKey: "persistenceLow",
    color: "#991b1b",
    bg: "#fef2f2",
    border: "#fca5a5",
  },
};

function MasteryCell({ band }: { band?: string | null }) {
  const { t } = useTranslation("teacher");

  const key = band?.toLowerCase();
  const cfg = key ? MASTERY_CONFIG[key] : undefined;

  if (!cfg) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-200" />
          {t("notAssessed")}
        </span>

        <div className="h-1.5 w-28 rounded-full bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span
        style={{
          color: cfg.color,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
        }}
        className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      >
        <span
          style={{ background: cfg.dot }}
          className="h-2 w-2 flex-shrink-0 rounded-full"
        />

        {t(cfg.labelKey)}
      </span>

      <div className="flex w-28 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            style={{
              width: `${cfg.pct}%`,
              background: cfg.dot,
            }}
            className="h-full rounded-full transition-all duration-700"
          />
        </div>

        <span className="w-7 text-right font-mono text-[10px] text-slate-400">
          {cfg.pct}%
        </span>
      </div>
    </div>
  );
}

function PersistencePill({ band }: { band?: string | null }) {
  const { t } = useTranslation("teacher");

  if (!band) {
    return <span className="font-medium text-slate-300">—</span>;
  }

  const cfg = PERSISTENCE_CONFIG[band.toLowerCase()];

  if (!cfg) {
    return (
      <span className="font-medium capitalize text-slate-400">
        {band}
      </span>
    );
  }

  return (
    <span
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
      className="inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
    >
      {t(cfg.labelKey)}
    </span>
  );
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: number | string;
  label: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-center shadow-sm">
      <p className={`text-2xl font-black ${accent ?? "text-slate-800"}`}>
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
    </div>
  );
}

type TabType = "block" | "python" | "math";

export default function DiagnosticReportPage() {
  const { t } = useTranslation("teacher");
  const dispatch = useAppDispatch();

  const {
    diagnosticSummary,
    lineDiagnosticSummary,
    isLoading,
  } = useSelector((state: RootState) => state.teacherStudentSlice);

  const { id: classId } = useSelector(
    (state: RootState) => state.currentClass
  );

  const [activeTab, setActiveTab] = useState<TabType>("block");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );

  // Both tabs are rendered from state that is only ever filled by one of these
  // two calls. Only the block summary was being fetched, so the Python (Line)
  // tab read an array that nothing had written to and showed an empty class
  // however many diagnostics the students had actually completed.
  useEffect(() => {
    if (classId) {
      dispatch(fetchDiagnosticSummary(classId));
      dispatch(fetchLineDiagnosticSummary(classId));
    }
  }, [classId, dispatch]);

  // Math has its own endpoint and its own columns, so it is kept out of the
  // diagnostics slice the other two tabs share.
  const [mathRows, setMathRows] = useState<IMathClassSummaryRow[]>([]);
  const [mathLoading, setMathLoading] = useState(false);
  const [mathFailed, setMathFailed] = useState(false);
  const [mathStudent, setMathStudent] = useState<IMathClassSummaryRow | null>(null);

  const loadMath = useCallback(() => {
    if (!classId) return;
    setMathLoading(true);
    setMathFailed(false);
    teachersClassServices
      .getClassMathSummary(classId)
      .then(setMathRows)
      .catch(() => setMathFailed(true))
      .finally(() => setMathLoading(false));
  }, [classId]);

  useEffect(() => {
    loadMath();
  }, [loadMath]);

  const isMath = activeTab === "math";

  const activeData =
    activeTab === "block"
      ? diagnosticSummary
      : lineDiagnosticSummary;

  const total = isMath ? mathRows.length : activeData.length;

  const assessed = isMath
    ? mathRows.filter((student) => student.has_activity).length
    : activeData.filter(
        (student) =>
          student.mastery_band ||
          student.last_completed_unit_level
      ).length;

  const pct =
    total === 0
      ? 0
      : Math.round((assessed / total) * 100);

  const tabs = [
    {
      key: "block" as const,
      label: "Block Coding",
    },
    {
      key: "python" as const,
      label: "Python (Line)",
    },
    {
      key: "math" as const,
      label: t("reportTabMath"),
    },
  ];

  return (
    <TeacherLayout>
      <div className="min-h-screen bg-[#f0f4f8] p-4 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500">
              {t("classReport")}
            </p>

            <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">
              {t("diagnosticClassResults")}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {t("progressAnalysisSubtitle")}
            </p>
          </div>

          <div className="flex flex-shrink-0 gap-3">
            <StatCard
              value={total}
              label={t("students")}
            />

            <StatCard
              value={assessed}
              label={t("assessed")}
              accent="text-indigo-600"
            />

            <StatCard
              value={`${pct}%`}
              label={t("completion")}
              accent="text-emerald-600"
            />
          </div>
        </div>

        {/* Tabs + Mastery Scale */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedStudentId(null);
                  setMathStudent(null);
                }}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                  activeTab === tab.key
                    ? tab.key === "block"
                      ? "bg-indigo-600 text-white"
                      : tab.key === "python"
                      ? "bg-purple-600 text-white"
                      : "bg-emerald-600 text-white"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {!isMath && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {t("masteryScale")}
            </span>

            {MASTERY_ORDER.map((key) => {
              const cfg = MASTERY_CONFIG[key];

              return (
                <span
                  key={key}
                  className="flex items-center gap-1.5 text-[11px] font-semibold"
                  style={{ color: cfg.color }}
                >
                  <span
                    style={{ background: cfg.dot }}
                    className="h-2 w-2 rounded-full"
                  />

                  {t(cfg.labelKey)}
                </span>
              );
            })}
          </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {isMath && (
            <MathReportTable
              rows={mathRows}
              isLoading={mathLoading}
              failed={mathFailed}
              onRetry={loadMath}
              onSelect={setMathStudent}
            />
          )}

          <div className={isMath ? "hidden" : "overflow-x-auto"}>
            <table className="w-full min-w-[740px] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 bg-slate-50">
                  {[
                    t("student"),
                    t("masteryLevel"),
                    t("persistence"),
                    t("independence"),
                    t("lastLevel"),
                    "",
                  ].map((heading, index) => (
                    <th
                      key={index}
                      className={`px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 ${
                        index === 2 ||
                        index === 3 ||
                        index === 4
                          ? "text-center"
                          : ""
                      } ${
                        index === 3
                          ? "hidden lg:table-cell"
                          : ""
                      } ${
                        index === 5
                          ? "text-right"
                          : ""
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center"
                    >
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  activeData.map((student, index) => (
                    <tr
                      key={student.student_id}
                      className={`border-b border-slate-50 transition-colors ${
                        activeTab === "block"
                          ? "hover:bg-indigo-50/30"
                          : "hover:bg-purple-50/30"
                      } ${
                        index % 2 !== 0
                          ? "bg-slate-50/40"
                          : ""
                      }`}
                    >
                      {/* Student */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-bold leading-snug text-mainColor">
                              {student.student_name}
                            </p>

                            {student.flags.length > 0 ? (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {student.flags.map((flag) => (
                                  <span
                                    key={flag}
                                    className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                                      activeTab === "block"
                                        ? "border-indigo-100 bg-indigo-50 text-indigo-500"
                                        : "border-purple-100 bg-purple-50 text-purple-500"
                                    }`}
                                  >
                                    {flag.replace(/_/g, " ")}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-0.5 text-[10px] text-slate-500">
                                {t("diagnosticPending")}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Mastery */}
                      <td className="px-5 py-4">
                        <MasteryCell
                          band={student.mastery_band}
                        />
                      </td>

                      {/* Persistence */}
                      <td className="px-5 py-4 text-center">
                        <PersistencePill
                          band={student.persistence_band}
                        />
                      </td>

                      {/* Independence */}
                      <td className="hidden px-5 py-4 text-center lg:table-cell">
                        {student.independence_band ? (
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                            {student.independence_band}
                          </span>
                        ) : (
                          <span className="text-slate-300">
                            —
                          </span>
                        )}
                      </td>

                      {/* Last Level */}
                      <td className="px-5 py-4 text-center">
                        {student.last_completed_unit_level ? (
                          <span className="inline-block rounded-lg bg-slate-800 px-3 py-1.5 font-mono text-xs font-bold tracking-wider text-white shadow-sm">
                            {student.last_completed_unit_level}
                          </span>
                        ) : (
                          <span className="text-slate-300">
                            —
                          </span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedStudentId(
                              student.student_id
                            )
                          }
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-all duration-150 ${
                            activeTab === "block"
                              ? "border border-indigo-200 bg-white text-indigo-600 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white"
                              : "border border-purple-200 bg-white text-purple-600 hover:border-purple-600 hover:bg-purple-600 hover:text-white"
                          }`}
                        >
                          {t("viewDetails")}

                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}

                {!isLoading && activeData.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-20 text-center text-slate-400"
                    >
                      <p className="mb-2 text-3xl">
                        {activeTab === "block"
                          ? "📋"
                          : "🐍"}
                      </p>

                      <p className="font-semibold">
                        {activeTab === "block"
                          ? t(
                              "noBlockCodingDiagnosticsFound"
                            )
                          : t(
                              "noPythonDiagnosticsFound"
                            )}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {total > 0 && (
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-3">
              <p className="text-[11px] text-slate-400">
                <span className="font-bold text-slate-600">
                  {assessed}
                </span>{" "}
                {t("of")}{" "}
                <span className="font-bold text-slate-600">
                  {total}
                </span>{" "}
                {t("studentsAssessed")}
              </p>

              <div className="flex items-center gap-2">
                <div className="h-1.5 w-36 overflow-hidden rounded-full bg-slate-100">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all duration-700 ${
                      activeTab === "block"
                        ? "bg-indigo-500"
                        : activeTab === "python"
                        ? "bg-purple-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>

                <span
                  className={`text-[11px] font-bold ${
                    activeTab === "block"
                      ? "text-indigo-600"
                      : activeTab === "python"
                      ? "text-purple-600"
                      : "text-emerald-600"
                  }`}
                >
                  {pct}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Block diagnostic modal */}
        {selectedStudentId &&
          activeTab === "block" && (
            <DiagnosticDetailModal
              studentId={selectedStudentId}
              onClose={() =>
                setSelectedStudentId(null)
              }
            />
          )}

        {mathStudent && isMath && classId && (
          <MathDetailModal
            classId={classId}
            studentId={mathStudent.student_id}
            studentName={mathStudent.student_name}
            onClose={() => setMathStudent(null)}
          />
        )}

        {selectedStudentId &&
          activeTab === "python" && (
            <LineDiagnosticModal
              studentId={selectedStudentId}
              onClose={() => setSelectedStudentId(null)}
            />
          )}
      </div>
    </TeacherLayout>
  );
}