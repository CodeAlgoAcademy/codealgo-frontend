import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import teachersClassBaseServices from "services/teachersClassServices";
import { RootState } from "store/store";
import { changeCurrentStudent } from "store/teacherStudentSlice";
import {
   DashboardRange,
   IActivityEvent,
   IAttentionReason,
   IClassDashboard,
   IDashboardStudentRef,
} from "types/interfaces/classDashboard.interface";

const RANGES: DashboardRange[] = [1, 7, 30];

const card = "rounded-2xl bg-white p-6";
const cardTitle = "text-2xl font-semibold text-mainColor";

const browserTz = () => {
   try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
   } catch {
      return undefined;
   }
};

const timeAgo = (iso: string, lang: string) => {
   const diff = (new Date(iso).getTime() - Date.now()) / 1000;
   const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
   const abs = Math.abs(diff);
   if (abs < 60) return rtf.format(Math.round(diff), "second");
   if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
   if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
   return rtf.format(Math.round(diff / 86400), "day");
};

const StatCard = ({ label, value, sub, warn }: { label: string; value: string | number; sub?: string; warn?: boolean }) => (
   <div className={`${card} flex min-w-0 flex-col gap-1 !p-5`}>
      <span className="truncate text-sm font-medium text-gray-500">{label}</span>
      <span className={`text-3xl font-bold ${warn ? "text-[#e5484d]" : "text-gray-900"}`}>{value}</span>
      {sub && <span className="truncate text-xs text-gray-500">{sub}</span>}
   </div>
);

const ClassOverview = () => {
   const { t, i18n } = useTranslation("teacher");
   const dispatch = useDispatch();
   const classId = useSelector((state: RootState) => state.currentClass?.id);
   const students = useSelector((state: RootState) => state.teacherStudentSlice.students);
   const [range, setRange] = useState<DashboardRange>(7);
   const [data, setData] = useState<IClassDashboard | null>(null);
   const [loading, setLoading] = useState(false);
   const [failed, setFailed] = useState(false);

   useEffect(() => {
      if (!classId) return;
      let cancelled = false;
      setLoading(true);
      setFailed(false);
      teachersClassBaseServices
         .getClassDashboard(classId, range, browserTz())
         .then((res) => {
            if (!cancelled) setData(res);
         })
         .catch(() => {
            if (!cancelled) setFailed(true);
         })
         .finally(() => {
            if (!cancelled) setLoading(false);
         });
      return () => {
         cancelled = true;
      };
   }, [classId, range]);

   const openStudent = (ref: IDashboardStudentRef) => {
      const match = students?.find((s: any) => Number(s.id) === ref.user_id);
      if (!match) return;
      dispatch(changeCurrentStudent(match));
      document.getElementById("student-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
   };

   const reasonText = (r: IAttentionReason) => {
      switch (r.code) {
         case "never_logged_in":
            return t("reasonNeverLoggedIn");
         case "inactive":
            return t("reasonInactive", { days: r.days });
         case "assignment_not_started":
            return t("reasonAssignmentNotStarted", { count: r.count });
         case "low_accuracy":
            return t("reasonLowAccuracy", { accuracy: r.accuracy, answered: r.answered });
         case "stuck_math":
            return t("reasonStuckMath", { standard: r.standard_code, plays: r.plays, best: r.best_accuracy });
         default:
            return "";
      }
   };

   const activityText = (e: IActivityEvent) => {
      switch (e.type) {
         case "login":
            return t("activityLogin", { name: e.name });
         case "math_round":
            return e.mode === "mix"
               ? t("activityMathMix", { name: e.name, correct: e.correct, answered: e.answered })
               : t("activityMathRound", { name: e.name, standard: e.standard_code, correct: e.correct, answered: e.answered });
         case "quest":
            return t("activityQuest", { name: e.name, quest: e.quest, line: e.quest_line });
         case "level":
            return t("activityLevel", { name: e.name, level: e.level_code });
         case "assignment":
            return e.accuracy == null
               ? t("activityAssignmentNoScore", { name: e.name, title: e.title })
               : t("activityAssignment", { name: e.name, title: e.title, accuracy: e.accuracy });
         case "math_facts_mastered":
            return t("activityMathFacts", { name: e.name, title: e.title });
         default:
            return e.name;
      }
   };

   const activityDot: Record<string, string> = {
      login: "bg-gray-400",
      math_round: "bg-[#f5a524]",
      quest: "bg-[#8e4ec6]",
      level: "bg-mainColor",
      assignment: "bg-[#30a46c]",
      math_facts_mastered: "bg-[#30a46c]",
   };

   const maxActive = useMemo(() => {
      if (!data) return 1;
      return Math.max(1, data.pulse.total_students, ...data.daily.map((d) => d.active_students));
   }, [data]);

   const dayLabel = (iso: string) => {
      const d = new Date(`${iso}T12:00:00`);
      return range === 7
         ? d.toLocaleDateString(i18n.language, { weekday: "short" })
         : d.toLocaleDateString(i18n.language, { month: "numeric", day: "numeric" });
   };

   if (!classId) return null;

   const p = data?.pulse;
   const noStudents = !!data && p?.total_students === 0;
   const quiet = !!data && !noStudents && p?.active_in_range === 0;

   return (
      <section className="mb-8 flex flex-col gap-6">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">{t("classOverview")}</h2>
            <div className="flex rounded-xl bg-white p-1 shadow-sm">
               {RANGES.map((r) => (
                  <button
                     key={r}
                     type="button"
                     onClick={() => setRange(r)}
                     className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        range === r ? "bg-mainColor text-white" : "text-gray-600 hover:bg-gray-100"
                     }`}
                  >
                     {r === 1 ? t("rangeToday") : t("rangeDays", { count: r })}
                  </button>
               ))}
            </div>
         </div>

         {loading && !data && <p className="animate-pulse text-sm text-gray-400">{t("loadingOverview")}</p>}
         {failed && !data && <p className="text-sm text-gray-500">{t("overviewFailed")}</p>}

         {data && p && (
            <div className={`flex flex-col gap-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
               {(noStudents || quiet) && (
                  <div className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                           {noStudents ? t("emptyNoStudentsTitle") : t("emptyQuietTitle")}
                        </h3>
                        <p className="text-sm text-gray-500">{noStudents ? t("emptyNoStudentsBody") : t("emptyQuietBody")}</p>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        <Link href="/teachers/students">
                           <a className="cursor-pointer rounded-xl bg-mainColor px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                              {noStudents ? t("addStudentsAction") : t("manageStudentsAction")}
                           </a>
                        </Link>
                        <Link href="/teachers/assignments">
                           <a className="cursor-pointer rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200">
                              {t("createAssignmentAction")}
                           </a>
                        </Link>
                        <Link href="/teachers/overview">
                           <a className="cursor-pointer rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200">
                              {t("startLiveClassAction")}
                           </a>
                        </Link>
                     </div>
                  </div>
               )}

               <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-6">
                  <StatCard
                     label={t("statActive")}
                     value={`${p.active_in_range} / ${p.total_students}`}
                     sub={t("statActiveToday", { count: p.active_today })}
                  />
                  <StatCard
                     label={t("statNeverLoggedIn")}
                     value={p.never_logged_in}
                     sub={p.never_logged_in ? t("statNeverLoggedInHint") : undefined}
                     warn={p.never_logged_in > 0}
                  />
                  <StatCard
                     label={t("statMathAccuracy")}
                     value={p.math_accuracy == null ? "-" : `${p.math_accuracy}%`}
                     sub={t("statAnswers", { count: p.math_answered })}
                  />
                  <StatCard label={t("statMathTime")} value={t("minutesShort", { count: p.math_minutes })} sub={t("statRounds", { count: p.math_rounds })} />
                  <StatCard
                     label={t("statCodingProgress")}
                     value={p.quests_completed + p.levels_completed}
                     sub={t("statCodingBreakdown", { quests: p.quests_completed, levels: p.levels_completed })}
                  />
                  <StatCard label={t("statOpenAssignments")} value={p.open_assignments} />
               </div>

               <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  {/* Needs attention */}
                  <div className={`${card} flex max-h-[420px] flex-col`}>
                     <h3 className={cardTitle}>{t("needsAttention")}</h3>
                     <div className="mt-4 flex-1 overflow-y-auto pr-1">
                        {data.needs_attention.length === 0 ? (
                           <p className="text-sm text-gray-500">{noStudents ? t("needsAttentionNoStudents") : t("needsAttentionNone")}</p>
                        ) : (
                           <ul className="flex flex-col divide-y divide-gray-100">
                              {data.needs_attention.map((s) => (
                                 <li key={s.user_id} className="flex items-start justify-between gap-3 py-3">
                                    <div className="min-w-0">
                                       <button
                                          type="button"
                                          onClick={() => openStudent(s)}
                                          className="cursor-pointer truncate text-left font-medium capitalize text-gray-900 hover:text-mainColor"
                                       >
                                          {s.name}
                                       </button>
                                       <div className="mt-1 flex flex-wrap gap-1.5">
                                          {s.reasons.map((r, i) => (
                                             <span
                                                key={`${r.code}-${i}`}
                                                className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                                                   i === 0 ? "bg-[#fdecec] text-[#c4292e]" : "bg-gray-100 text-gray-700"
                                                }`}
                                             >
                                                {reasonText(r)}
                                             </span>
                                          ))}
                                       </div>
                                    </div>
                                    <Link href={`/teachers/students/${classId}/${s.user_id}`}>
                                       <a className="shrink-0 cursor-pointer text-sm text-mainColor hover:underline">{t("view")}</a>
                                    </Link>
                                 </li>
                              ))}
                           </ul>
                        )}
                     </div>
                  </div>

                  {/* Activity feed */}
                  <div className={`${card} flex max-h-[420px] flex-col`}>
                     <h3 className={cardTitle}>{t("recentActivity")}</h3>
                     <div className="mt-4 flex-1 overflow-y-auto pr-1">
                        {data.activity.length === 0 ? (
                           <p className="text-sm text-gray-500">{t("recentActivityNone")}</p>
                        ) : (
                           <ul className="flex flex-col gap-3">
                              {data.activity.map((e, i) => (
                                 <li key={`${e.type}-${e.user_id}-${e.at}-${i}`} className="flex items-start gap-3">
                                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${activityDot[e.type] || "bg-gray-400"}`} />
                                    <button
                                       type="button"
                                       onClick={() => openStudent(e)}
                                       className="min-w-0 flex-1 cursor-pointer text-left text-sm text-gray-800 hover:text-mainColor"
                                    >
                                       {activityText(e)}
                                    </button>
                                    <span className="shrink-0 text-xs text-gray-400">{timeAgo(e.at, i18n.language)}</span>
                                 </li>
                              ))}
                           </ul>
                        )}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  {/* Assignments */}
                  <div className={`${card} flex max-h-[420px] flex-col`}>
                     <h3 className={cardTitle}>{t("assignmentTracker")}</h3>
                     <div className="mt-4 flex-1 overflow-y-auto pr-1">
                        {data.assignments.length === 0 ? (
                           <div className="flex flex-col items-start gap-3">
                              <p className="text-sm text-gray-500">{t("assignmentTrackerNone")}</p>
                              <Link href="/teachers/assignments">
                                 <a className="cursor-pointer rounded-xl bg-mainColor px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                                    {t("createAssignmentAction")}
                                 </a>
                              </Link>
                           </div>
                        ) : (
                           <ul className="flex flex-col gap-4">
                              {data.assignments.map((a) => {
                                 const pct = (n: number) => (a.total ? (n / a.total) * 100 : 0);
                                 return (
                                    <li key={`${a.kind}-${a.id}`}>
                                       <Link href={a.kind === "math_facts" ? "/teachers/math-assignments" : "/teachers/assignments"}>
                                          <a className="block cursor-pointer rounded-xl p-2 hover:bg-gray-50">
                                             <div className="flex items-baseline justify-between gap-2">
                                                <span className="truncate font-medium text-gray-900">{a.title}</span>
                                                <span className="shrink-0 text-xs text-gray-500">
                                                   {a.kind === "math_facts" ? t("kindMathFacts") : a.game_type === "line" ? t("kindLine") : t("kindBlock")}
                                                </span>
                                             </div>
                                             <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                                                <span className="h-full bg-[#30a46c]" style={{ width: `${pct(a.completed)}%` }} />
                                                <span className="h-full bg-[#f5a524]" style={{ width: `${pct(a.in_progress)}%` }} />
                                             </div>
                                             <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                                <span>{t("assignmentDone", { done: a.completed, total: a.total })}</span>
                                                <span>{t("assignmentInProgress", { count: a.in_progress })}</span>
                                                <span>{t("assignmentNotStarted", { count: a.not_started })}</span>
                                                {a.avg_accuracy != null && <span>{t("assignmentAvg", { accuracy: a.avg_accuracy })}</span>}
                                             </div>
                                          </a>
                                       </Link>
                                    </li>
                                 );
                              })}
                           </ul>
                        )}
                     </div>
                  </div>

                  {/* Daily activity + math trouble spots */}
                  <div className={`${card} flex max-h-[420px] flex-col`}>
                     <h3 className={cardTitle}>{range === 1 ? t("mathTroubleSpots") : t("dailyActivity")}</h3>
                     <div className="mt-4 flex-1 overflow-y-auto pr-1">
                        {range !== 1 && (
                           <div className="mb-6">
                              <div className="flex h-36 items-end gap-1">
                                 {data.daily.map((d) => (
                                    <div
                                       key={d.date}
                                       className="group relative flex h-full flex-1 flex-col justify-end"
                                       title={t("dailyTooltip", {
                                          count: d.active_students,
                                          rounds: d.math_rounds,
                                          quests: d.quests_completed,
                                          levels: d.levels_completed,
                                       })}
                                    >
                                       <span
                                          className={`w-full rounded-t-md ${d.active_students ? "bg-mainColor" : "bg-gray-100"}`}
                                          style={{ height: d.active_students ? `${(d.active_students / maxActive) * 100}%` : "4px" }}
                                       />
                                    </div>
                                 ))}
                              </div>
                              <div className="mt-1 flex gap-1">
                                 {data.daily.map((d, i) => (
                                    <span key={d.date} className="flex-1 truncate text-center text-[10px] text-gray-400">
                                       {range === 7 || i % 5 === 0 ? dayLabel(d.date) : ""}
                                    </span>
                                 ))}
                              </div>
                              <p className="mt-2 text-xs text-gray-500">{t("dailyActivityCaption")}</p>
                           </div>
                        )}

                        {range !== 1 && <h4 className="mb-2 font-semibold text-gray-900">{t("mathTroubleSpots")}</h4>}
                        {data.trouble_spots.length === 0 ? (
                           <p className="text-sm text-gray-500">{t("mathTroubleSpotsNone")}</p>
                        ) : (
                           <ul className="flex flex-col gap-3">
                              {data.trouble_spots.map((s) => (
                                 <li key={s.standard_code} className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                       <span className="font-medium text-gray-900">{s.standard_code}</span>
                                       {s.description && <p className="truncate text-xs text-gray-500">{s.description}</p>}
                                    </div>
                                    <div className="shrink-0 text-right">
                                       <span className={`font-semibold ${s.accuracy < 60 ? "text-[#e5484d]" : "text-gray-900"}`}>{s.accuracy}%</span>
                                       <p className="text-xs text-gray-500">{t("troubleStudents", { count: s.students })}</p>
                                    </div>
                                 </li>
                              ))}
                           </ul>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}
      </section>
   );
};

export default ClassOverview;
