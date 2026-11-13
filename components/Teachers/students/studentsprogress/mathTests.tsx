import ContentBox from "@/components/parents/UI/ContentBox";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MATH_QUEST_GRADES, mathGradeLabel } from "constants/mathQuest";
import mathTestServices, { emptyMathTestReport } from "services/mathTestServices";
import { IMathTest, IMathTestKind, IMathTestReport } from "types/interfaces/teacherstudent.interface";

interface IMathTestsProps {
  studentId?: string | number;
}

const KINDS: IMathTestKind[] = ["pre", "mid", "post", "knowledge"];

const scoreColor = (score: number) => (score >= 80 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-500");

const Growth = ({ value }: { value: number | null }) => {
  if (value === null || value === undefined) return <span className="text-gray-300">-</span>;
  const cls = value > 0 ? "text-green-600" : value < 0 ? "text-red-500" : "text-gray-500";
  return <span className={`font-semibold ${cls}`}>{value > 0 ? `+${value}` : value}</span>;
};

// Pre / mid / post tests per grade and the knowledge test, for one student.
// Used on the teacher dashboard and the parent dashboard, so it loads its own data.
const MathTests = ({ studentId }: IMathTestsProps) => {
  const { t } = useTranslation("teacher");
  const [report, setReport] = useState<IMathTestReport>(emptyMathTestReport);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<IMathTestKind>("mid");
  const [grade, setGrade] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(() => {
    if (!studentId) return Promise.resolve();
    return mathTestServices
      .getMathTests(studentId)
      .then((data) => {
        setReport(data);
        setGrade((g) => (g && data.grades.includes(g) ? g : data.summary[data.summary.length - 1]?.grade || data.grades[0] || "K"));
      })
      .catch(() => setReport(emptyMathTestReport));
  }, [studentId]);

  useEffect(() => {
    setReport(emptyMathTestReport);
    setMessage(null);
    setOpen(null);
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const kindLabel = (k: string) => t(`mathTestKind_${k}`);
  const grades = report.grades.length ? report.grades : [...MATH_QUEST_GRADES];

  const run = () => {
    if (!studentId || busy) return;
    setBusy(true);
    setMessage(null);
    mathTestServices
      .runMathTest(studentId, kind, grade)
      .then(() => {
        setMessage({ text: t("mathTestQueued"), error: false });
        return load();
      })
      .catch((e) => setMessage({ text: e?.response?.data?.detail || t("mathTestFailed"), error: true }))
      .finally(() => setBusy(false));
  };

  const cancel = (test: IMathTest) => {
    if (!studentId) return;
    mathTestServices
      .cancelMathTest(studentId, test.id)
      .then(load)
      .catch(() => setMessage({ text: t("mathTestFailed"), error: true }));
  };

  const title = (test: IMathTest) => (test.grade ? `${kindLabel(test.kind)} · ${mathGradeLabel(test.grade, t)}` : kindLabel(test.kind));

  return (
    <ContentBox
      size="base"
      title={t("mathTests")}
      padding="small"
      style={{ minWidth: "100%", maxWidth: "100%", height: "400px", overflowY: "auto" }}
    >
      {!studentId ? (
        <p className="text-sm text-gray-500">{t("mathTestPickStudent")}</p>
      ) : (
        <div className="flex flex-col gap-4 pr-2">
          <div className="flex flex-col gap-2 rounded-xl bg-gray-50 p-3">
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col text-xs text-gray-500">
                {t("mathTestType")}
                <select
                  className="mt-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-800"
                  value={kind}
                  onChange={(e) => setKind(e.target.value as IMathTestKind)}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {kindLabel(k)}
                    </option>
                  ))}
                </select>
              </label>
              {kind !== "knowledge" && (
                <label className="flex flex-col text-xs text-gray-500">
                  {t("mathTestGrade")}
                  <select
                    className="mt-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-800"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    {grades.map((g) => (
                      <option key={g} value={g}>
                        {mathGradeLabel(g, t)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                type="button"
                onClick={run}
                disabled={busy}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? t("mathTestRunning") : t("mathTestRun")}
              </button>
            </div>
            <p className="text-[0.7rem] text-gray-500">{t("mathTestsHelp")}</p>
            {message && <p className={`text-xs ${message.error ? "text-red-500" : "text-green-600"}`}>{message.text}</p>}
          </div>

          {loading ? (
            <p className="animate-pulse text-sm text-gray-400">{t("loadingProgress")}</p>
          ) : (
            <>
              {report.summary.length > 0 && (
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                      <th className="py-1 pr-2 font-medium">{t("mathTestGrade")}</th>
                      <th className="py-1 pr-2 text-right font-medium">{t("mathTestPre")}</th>
                      <th className="py-1 pr-2 text-right font-medium">{t("mathTestMid")}</th>
                      <th className="py-1 pr-2 text-right font-medium">{t("mathTestPost")}</th>
                      <th className="py-1 text-right font-medium">{t("mathTestGrowth")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.summary.map((row) => (
                      <tr key={row.grade} className="border-b border-gray-100">
                        <td className="py-1.5 pr-2 font-semibold">{mathGradeLabel(row.grade, t)}</td>
                        {[row.pre, row.mid, row.post].map((v, i) => (
                          <td key={i} className={`py-1.5 pr-2 text-right ${v === null ? "text-gray-300" : scoreColor(v)}`}>
                            {v === null ? "-" : `${v}%`}
                          </td>
                        ))}
                        <td className="py-1.5 text-right">
                          <Growth value={row.growth} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {report.tests.length === 0 ? (
                <p className="text-sm text-gray-500">{t("mathTestNone")}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {report.tests.map((test) => {
                    const pending = test.status === "pending";
                    const expanded = open === test.id;
                    return (
                      <div key={test.id} className="rounded-lg border border-gray-100">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                          onClick={() => !pending && setOpen(expanded ? null : test.id)}
                        >
                          <div>
                            <p className="text-[0.8rem] font-semibold">{title(test)}</p>
                            <p className="text-[0.68rem] text-gray-500">
                              {t(`mathTestSource_${test.source}`)}
                              {test.assigned_by ? ` (${test.assigned_by})` : ""} ·{" "}
                              {new Date(test.completed_at || test.created_at).toLocaleDateString()} ·{" "}
                              {t("mathTestQuestions", { count: test.question_count })}
                            </p>
                          </div>
                          {pending ? (
                            <span className="flex items-center gap-2">
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                {t("mathTestWaiting")}
                              </span>
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancel(test);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.stopPropagation();
                                    cancel(test);
                                  }
                                }}
                                className="text-[0.7rem] text-red-500 hover:underline"
                              >
                                {t("mathTestCancel")}
                              </span>
                            </span>
                          ) : (
                            <span className="text-right">
                              <span className={`text-base font-bold ${scoreColor(test.score)}`}>{test.score}%</span>
                              <span className="block text-[0.65rem] text-gray-400">
                                {t("mathTestRight", { correct: test.correct, answered: test.answered })}
                              </span>
                            </span>
                          )}
                        </button>
                        {expanded && (
                          <div className="flex flex-col gap-3 border-t border-gray-100 px-3 py-2">
                            {(test.domains || []).map((d) => (
                              <div key={d.domain}>
                                <div className="mb-1 flex justify-between text-[0.7rem]">
                                  <span className="font-semibold">{d.domain_name || d.domain}</span>
                                  <span className="text-gray-500">
                                    {d.correct}/{d.answered}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                  <div className="h-full bg-green-500" style={{ width: `${d.score}%` }} />
                                </div>
                              </div>
                            ))}
                            <ul className="flex flex-col gap-1">
                              {(test.results || []).map((r, i) => (
                                <li key={`${r.code}-${i}`} className="flex gap-2 text-[0.7rem]">
                                  <span className={r.correct ? "text-green-600" : "text-red-500"}>{r.correct ? "✓" : "✗"}</span>
                                  <span className="font-semibold">{r.code}</span>
                                  <span className="text-gray-500">{r.description}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </ContentBox>
  );
};

export default MathTests;
