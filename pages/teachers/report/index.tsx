import React from "react";
import { useSelector } from "react-redux";
import TeacherLayout from "@/components/layouts/TeacherLayout";
import ClassReport from "@/components/Teachers/report/ClassReport";
import { RootState } from "store/store";

// The report for the class picked in the teacher sidebar. The report itself is
// shared with the admin page (pages/organizers/reports.tsx).
export default function DiagnosticReportPage() {
  const { id: classId } = useSelector((state: RootState) => state.currentClass);

  return (
    <TeacherLayout>
      <ClassReport classId={classId} />
    </TeacherLayout>
  );
}
