import Link from "next/link";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "store/store";

// These used to be two bar charts. Both plot settings, not usage, and the
// default for both is "no limit", so a fresh student showed seven full bars
// and six full bars that read like 8 hours of play a day. A short list says
// the same thing without looking like data.

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const GRADES = ["0", "1", "2", "3", "4"];
const NO_LIMIT = "23:00:00";
const DEFAULT_LEVEL = 10;

const StudentLimitsCard = () => {
   const { t } = useTranslation("teacher");
   const { currentStudent } = useSelector((state: RootState) => state.teacherStudentSlice);
   const classId = useSelector((state: RootState) => state.currentClass?.id);

   const screen = useMemo(() => {
      const rows = currentStudent?.timeLimits || [];
      return DAYS.map((day) => {
         const row = rows.find((r: any) => r.dayOfTheWeek === day);
         const raw = row?.timeLimit;
         if (!raw || raw === NO_LIMIT || raw === "No Limit") return { day, hours: null as number | null };
         const hours = typeof raw === "number" ? raw : parseInt(String(raw).split(":")[0], 10);
         return { day, hours: Number.isNaN(hours) ? null : hours };
      });
   }, [currentStudent?.timeLimits]);

   const levels = useMemo(() => {
      const rows = currentStudent?.levelThresholds || [];
      return GRADES.map((grade) => {
         const row = rows.find((r) => r.grade === grade);
         return { grade, level: row?.level ?? DEFAULT_LEVEL };
      });
   }, [currentStudent?.levelThresholds]);

   if (!currentStudent) return null;

   const allUnlimited = screen.every((s) => s.hours === null);
   const allDefault = levels.every((l) => l.level === DEFAULT_LEVEL);
   const base = classId && currentStudent?.id ? `/teachers/students/${classId}/${currentStudent.id}` : null;

   return (
      <div className="rounded-2xl bg-white p-6" style={{ minHeight: 340 }}>
         <h1 className="text-2xl font-semibold text-mainColor">{t("studentLimits")}</h1>

         <div className="mt-4">
            <div className="flex items-baseline justify-between">
               <h3 className="font-semibold">{t("screenTime")}</h3>
               {base && (
                  <Link href={`${base}/screen-time`}>
                     <a className="cursor-pointer text-sm text-mainColor hover:underline">{t("edit")}</a>
                  </Link>
               )}
            </div>
            {allUnlimited ? (
               <p className="mt-1 text-sm text-gray-500">{t("screenTimeNoLimitAllWeek")}</p>
            ) : (
               <ul className="mt-2 grid grid-cols-7 gap-1 text-center">
                  {screen.map((s) => (
                     <li key={s.day} className="rounded-lg bg-gray-50 py-2">
                        <span className="block text-[11px] text-gray-500">{t(`days.${s.day.toLowerCase()}`, { ns: "parent" }).slice(0, 3)}</span>
                        <span className="block text-sm font-semibold text-gray-900">
                           {s.hours === null ? "-" : `${s.hours}${t("hr")}`}
                        </span>
                     </li>
                  ))}
               </ul>
            )}
         </div>

         <div className="mt-6">
            <div className="flex items-baseline justify-between">
               <h3 className="font-semibold">{t("levelThreshold")}</h3>
               {base && (
                  <Link href={`${base}/level-threshold`}>
                     <a className="cursor-pointer text-sm text-mainColor hover:underline">{t("edit")}</a>
                  </Link>
               )}
            </div>
            {allDefault ? (
               <p className="mt-1 text-sm text-gray-500">{t("levelThresholdDefault", { level: DEFAULT_LEVEL })}</p>
            ) : (
               <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                  {levels.map((l) => (
                     <li key={l.grade} className="flex justify-between">
                        <span className="text-gray-600">{l.grade === "0" ? t("gradeK") : t("gradeN", { n: l.grade })}</span>
                        <span className="font-medium text-gray-900">{t("maxLevel", { level: l.level })}</span>
                     </li>
                  ))}
               </ul>
            )}
         </div>
      </div>
   );
};

export default StudentLimitsCard;
