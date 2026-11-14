import ContentBox from "@/components/parents/UI/ContentBox";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import teachersClassBaseServices, { emptyEncounterReport } from "services/teachersClassServices";
import { IEncounterReport } from "types/interfaces/teacherstudent.interface";

interface IEncountersProps {
  studentId?: string | number;
  classId?: string | number;
}

const accuracyColor = (value: number) => (value >= 80 ? "text-green-600" : value >= 50 ? "text-amber-600" : "text-red-500");

const Stat = ({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) => (
  <div className="rounded-lg bg-gray-50 px-3 py-2">
    <p className="text-lg font-bold leading-tight text-gray-900">{value}</p>
    <p className="text-[0.7rem] text-gray-500">{label}</p>
    {hint && <p className="text-[0.65rem] text-gray-400">{hint}</p>}
  </div>
);

// Overworld encounters for one student: ambush battles, coins and the pets
// they earned. The review table is the part to act on. Every battle replays a
// line coding level the student already finished, so a low score there means
// the idea did not stick. Loads its own data, like MathTests.
const TeacherStudentEncounters = ({ studentId, classId }: IEncountersProps) => {
  const { t } = useTranslation("teacher");
  const [report, setReport] = useState<IEncounterReport>(emptyEncounterReport);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setReport(emptyEncounterReport);
    if (!studentId || !classId) return;

    let cancelled = false;
    setIsLoading(true);
    teachersClassBaseServices
      .getStudentEncounterProgressByTeacher(String(studentId), String(classId))
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [studentId, classId]);

  return (
    <ContentBox
      size="base"
      title={t("encountersTitle")}
      padding="small"
      style={{ minWidth: "100%", maxWidth: "100%", height: "400px", overflowY: "auto" }}
    >
      {isLoading ? (
        <p className="animate-pulse text-sm text-gray-400">{t("loadingProgress")}</p>
      ) : !report.played ? (
        <p className="text-sm text-gray-500">{t("encountersNone")}</p>
      ) : (
        <div className="flex flex-col gap-5 pr-2">
          <div className="grid grid-cols-2 gap-2">
            <Stat
              label={t("encBattlesWon")}
              value={report.battles_won}
              hint={report.battles_fled > 0 ? t("encFled", { count: report.battles_fled }) : undefined}
            />
            <Stat
              label={t("encReviewAccuracy")}
              value={
                report.accuracy === null ? (
                  "-"
                ) : (
                  <span className={accuracyColor(report.accuracy)}>{report.accuracy}%</span>
                )
              }
              hint={t("mathAnsweredCount", { count: report.answers_right + report.answers_wrong })}
            />
            <Stat
              label={t("encRescues")}
              value={report.rescues}
              hint={report.boss_wins > 0 ? t("encBossWins", { count: report.boss_wins }) : undefined}
            />
            <Stat
              label={t("encCoins")}
              value={report.coins_collected}
              hint={t("encCodeCoins", { count: report.code_coins_solved })}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">
              {t("encPets", { owned: report.pets.length, total: report.total_pets })}
            </p>
            {report.pets.length === 0 ? (
              <p className="text-xs text-gray-500">{t("encNoPets")}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {report.pets.map((pet) => (
                  <span
                    key={pet.id}
                    title={pet.fact}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      pet.name === report.active_pet ? "bg-orange-100 text-orange-700" : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {pet.name}
                    {pet.name === report.active_pet && <span className="ml-1 font-normal">· {t("encActivePet")}</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          {report.review.length > 0 && (
            <div>
              <p className="text-sm font-semibold">{t("encReviewHeader")}</p>
              <p className="mb-1 text-[0.7rem] text-gray-500">{t("encReviewHelp")}</p>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                    <th className="py-2 pr-2 font-medium">{t("encLevel")}</th>
                    <th className="py-2 pr-2 text-right font-medium">{t("encRight")}</th>
                    <th className="py-2 pr-2 text-right font-medium">{t("encWrong")}</th>
                    <th className="py-2 text-right font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {report.review.map((row) => (
                    <tr key={row.level_id} className="border-b border-gray-100 align-top">
                      <td className="py-2 pr-2">
                        <p className="text-[0.8rem] font-semibold">{row.title}</p>
                        {(row.quest_line || row.topic) && (
                          <p className="text-[0.7rem] text-gray-500">
                            {[row.quest_line, row.topic].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </td>
                      <td className="py-2 pr-2 text-right text-[0.75rem] text-gray-600">{row.right}</td>
                      <td className="py-2 pr-2 text-right text-[0.75rem] text-gray-600">{row.wrong}</td>
                      <td className={`py-2 text-right text-[0.75rem] font-semibold ${accuracyColor(row.accuracy)}`}>
                        {row.accuracy}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {report.foes.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold">{t("encEnemies")}</p>
              <div className="flex flex-wrap gap-1.5">
                {report.foes.map((foe) => (
                  <span key={foe.id} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                    {foe.name} <span className="font-semibold">x{foe.wins}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ContentBox>
  );
};

export default TeacherStudentEncounters;
