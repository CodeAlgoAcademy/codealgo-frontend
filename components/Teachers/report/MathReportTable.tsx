import React from "react";
import { useTranslation } from "react-i18next";
import { mathGradeLabel } from "constants/mathQuest";
import { IMathClassSummaryRow } from "types/interfaces/teacherstudent.interface";

interface Props {
  rows: IMathClassSummaryRow[];
  isLoading: boolean;
  failed: boolean;
  onRetry: () => void;
  onSelect: (row: IMathClassSummaryRow) => void;
}

const scoreColor = (score: number) =>
  score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-500";

const Muted = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-medium text-slate-400">{children}</span>
);

// The Math tab of the class report: Math Quest standards, math fact sets and
// the latest Math Quest test for every student in the class.
export default function MathReportTable({ rows, isLoading, failed, onRetry, onSelect }: Props) {
  const { t } = useTranslation("teacher");

  const headings = [
    t("student"),
    t("mathReportColQuest"),
    t("mathReportColFacts"),
    t("mathReportColTest"),
    t("mathReportColLastActive"),
    "",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-slate-100 bg-slate-50">
            {headings.map((heading, index) => (
              <th
                key={index}
                className={`px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 ${
                  index === 5 ? "text-right" : ""
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
              <td colSpan={6} className="py-10 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600" />
              </td>
            </tr>
          )}

          {!isLoading && failed && (
            <tr>
              <td colSpan={6} className="py-16 text-center text-sm text-red-600">
                <p className="font-semibold">{t("mathReportLoadFailed")}</p>
                <button type="button" onClick={onRetry} className="mt-2 font-bold underline">
                  {t("mathReportTryAgain")}
                </button>
              </td>
            </tr>
          )}

          {!isLoading && !failed && rows.length === 0 && (
            <tr>
              <td colSpan={6} className="py-20 text-center font-semibold text-slate-400">
                {t("mathReportEmpty")}
              </td>
            </tr>
          )}

          {!isLoading &&
            !failed &&
            rows.map((row, index) => (
              <tr
                key={row.student_id}
                className={`border-b border-slate-50 transition-colors hover:bg-emerald-50/30 ${
                  index % 2 !== 0 ? "bg-slate-50/40" : ""
                }`}
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-bold leading-snug text-mainColor">{row.student_name}</p>
                  {!row.has_activity && <p className="mt-0.5 text-[10px] text-slate-500">{t("mathReportNoActivity")}</p>}
                </td>

                <td className="px-5 py-4">
                  {row.quest.answered > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-slate-700">
                        {t("mathReportQuestValue", { mastered: row.quest.mastered, practicing: row.quest.practicing })}
                      </p>
                      <p className="text-xs text-slate-500">{t("mathReportAccuracy", { accuracy: row.quest.accuracy })}</p>
                    </>
                  ) : (
                    <Muted>{t("mathReportNoActivity")}</Muted>
                  )}
                </td>

                <td className="px-5 py-4">
                  {row.facts.assigned > 0 || row.facts.answered > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-slate-700">
                        {t("mathReportFactsValue", { mastered: row.facts.mastered, assigned: row.facts.assigned })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.facts.accuracy === null
                          ? t("mathReportNoActivity")
                          : t("mathReportAccuracy", { accuracy: row.facts.accuracy })}
                      </p>
                    </>
                  ) : (
                    <Muted>{t("mathReportNoneAssigned")}</Muted>
                  )}
                </td>

                <td className="px-5 py-4">
                  {row.latest_test ? (
                    <>
                      <p className={`text-sm font-black tabular-nums ${scoreColor(row.latest_test.score)}`}>
                        {row.latest_test.score}%
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.latest_test.grade
                          ? t("mathReportTestValue", {
                              kind: t(`mathTestKind_${row.latest_test.kind}`),
                              grade: mathGradeLabel(row.latest_test.grade, t),
                            })
                          : t(`mathTestKind_${row.latest_test.kind}`)}
                      </p>
                    </>
                  ) : (
                    <Muted>{t("mathReportNoTest")}</Muted>
                  )}
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {row.last_activity ? new Date(row.last_activity).toLocaleDateString() : <span className="text-slate-300">—</span>}
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelect(row)}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm transition-all duration-150 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                  >
                    {t("viewDetails")}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
