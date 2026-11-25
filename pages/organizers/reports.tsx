import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import OrganizerLayout from "@/components/layouts/OrganizerLayout";
import ClassReport from "@/components/Teachers/report/ClassReport";
import NoItem from "@/components/UI/NoItem";
import { organizationReportSource } from "services/classReportSource";
import { getOrganizationClasses } from "services/organizersService";
import { RootState } from "store/store";

interface OrganizationClass {
   id: number;
   className: string;
   totalStudent?: number;
}

type ClassesState = "loading" | "ready" | "failed";

// Class reports for admins: the same report teachers see, for any class in the
// organization selected in the header.
const OrganizationReportsPage = () => {
   const { t } = useTranslation("organizer");
   const dispatch = useDispatch();
   const { selectedOrganization } = useSelector((state: RootState) => state.organizer);
   const organizationId = selectedOrganization?.id;

   // Admins read the report from the organization's own endpoints. Memoised so
   // the report only reloads when the organization changes.
   const source = useMemo(() => (organizationId ? organizationReportSource(organizationId) : undefined), [organizationId]);

   const [classes, setClasses] = useState<OrganizationClass[]>([]);
   const [classesState, setClassesState] = useState<ClassesState>("loading");
   const [classId, setClassId] = useState<number | null>(null);

   useEffect(() => {
      if (!organizationId) return;

      // Switching organization must not leave the old organization's class on screen.
      let cancelled = false;
      setClasses([]);
      setClassId(null);
      setClassesState("loading");

      dispatch(getOrganizationClasses())
         .unwrap()
         .then((result: OrganizationClass[]) => {
            if (cancelled) return;
            const list = Array.isArray(result) ? result : [];
            setClasses(list);
            setClassId(list[0]?.id ?? null);
            setClassesState("ready");
         })
         .catch(() => {
            if (!cancelled) setClassesState("failed");
         });

      return () => {
         cancelled = true;
      };
   }, [dispatch, organizationId]);

   const classPicker = (
      <div className="mb-6 flex flex-wrap items-center gap-3">
         <label htmlFor="report-class" className="text-sm font-bold text-slate-600">
            {t("reportClass")}
         </label>
         <select
            id="report-class"
            value={classId ?? ""}
            onChange={(e) => setClassId(Number(e.target.value))}
            className="min-w-[220px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-indigo-500"
         >
            {classes.map((item) => (
               <option key={item.id} value={item.id}>
                  {item.className}
                  {typeof item.totalStudent === "number" ? ` (${item.totalStudent})` : ""}
               </option>
            ))}
         </select>
      </div>
   );

   return (
      <OrganizerLayout>
         <div className="flex items-center justify-between border-b border-b-slate-400 py-3">
            <p className="text-[30px] font-medium text-mainColor">{t("reports")}</p>
         </div>

         {!organizationId ? (
            <NoItem text={t("reportsNoOrganization")} />
         ) : classesState === "loading" ? (
            <div className="flex min-h-[40vh] items-center justify-center">
               <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
            </div>
         ) : classesState === "failed" ? (
            <NoItem text={t("reportsClassesFailed")} />
         ) : classes.length === 0 ? (
            <NoItem text={t("reportsNoClasses")} />
         ) : (
            <div className="mt-6 overflow-hidden rounded-3xl">
               <ClassReport classId={classId} toolbar={classPicker} source={source} />
            </div>
         )}
      </OrganizerLayout>
   );
};

export default OrganizationReportsPage;
