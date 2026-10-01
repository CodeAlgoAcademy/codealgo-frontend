import ContentBox from "@/components/parents/UI/ContentBox";
import React from "react";
import { useTranslation } from "react-i18next";
import { mathGradeLabel } from "constants/mathQuest";
import { IMathQuestReport } from "types/interfaces/teacherstudent.interface";

interface IMathQuestProps {
  report: IMathQuestReport;
  isLoading?: boolean;
}

const Stars = ({ count }: { count: number }) => (
  <span className="whitespace-nowrap text-sm tracking-tight" aria-label={`${count}/3`}>
    {[0, 1, 2].map((i) => (
      <span key={i} className={i < count ? "text-amber-400" : "text-gray-200"}>
        ★
      </span>
    ))}
  </span>
);

// Math Quest standards for one student: how far through each grade they are,
// then every standard they have played with stars and best score.
const TeacherStudentMathQuest = ({ report, isLoading }: IMathQuestProps) => {
  const { t } = useTranslation("teacher");
  const played = report.totals.filter((g) => g.mastered + g.practicing > 0);
  const rows = report.rows;

  return (
    <ContentBox
      size="base"
      title={t("mathQuestStandards")}
      padding="small"
      style={{ minWidth: "100%", maxWidth: "100%", height: "400px", overflowY: "auto" }}
    >
      {isLoading ? (
        <p className="animate-pulse text-sm text-gray-400">{t("loadingProgress")}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">{t("mathNoRoundsYet")}</p>
      ) : (
        <div className="flex flex-col gap-5 pr-2">
          <div className="flex flex-col gap-3">
            {played.map((g) => {
              const masteredPct = g.total ? (g.mastered / g.total) * 100 : 0;
              const practicingPct = g.total ? (g.practicing / g.total) * 100 : 0;
              return (
                <div key={g.grade}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-semibold">{mathGradeLabel(g.grade, t)}</span>
                    <span className="text-xs text-gray-500">
                      {t("mathMasteredOf", { mastered: g.mastered, total: g.total })}
                      {g.practicing > 0 ? ` · ${t("mathPracticingCount", { count: g.practicing })}` : ""}
                    </span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full bg-green-500" style={{ width: `${masteredPct}%` }} />
                    <div className="h-full bg-amber-300" style={{ width: `${practicingPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                <th className="py-2 pr-2 font-medium">{t("standard")}</th>
                <th className="py-2 pr-2 font-medium">{t("mathStarsHeader")}</th>
                <th className="py-2 pr-2 text-right font-medium">{t("mathBestHeader")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.standard_code} className="border-b border-gray-100 align-top">
                  <td className="py-2 pr-2">
                    <p className="text-[0.8rem] font-semibold">
                      {row.standard_code}
                      {row.mastered && (
                        <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          {t("mathMastered")}
                        </span>
                      )}
                      {row.redo && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          {t("mathRedo")}
                        </span>
                      )}
                    </p>
                    <p className="text-[0.7rem] text-gray-500">{row.standard_name}</p>
                  </td>
                  <td className="py-2 pr-2">
                    <Stars count={row.stars} />
                  </td>
                  <td className="py-2 text-right text-[0.75rem] text-gray-600">
                    {row.plays > 0 ? `${row.best_accuracy}%` : "-"}
                    <p className="text-[0.65rem] text-gray-400">{t("mathAnsweredCount", { count: row.answered })}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ContentBox>
  );
};

export default TeacherStudentMathQuest;
