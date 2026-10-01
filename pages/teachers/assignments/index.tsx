import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import TeacherLayout from "@/components/layouts/TeacherLayout";
import assignmentServices from "services/block_assignments";
import { AssignmentListItem } from "types/interfaces/assignments";
import { RootState } from "store/store";
import NewAssignmentForm from "@/components/Teachers/blockAssignment/NewAssignmentForm";
import AssignmentDetailView from "./[classid]";
import DeleteConfirmationModal from "@/components/Teachers/blockAssignment/DeleteConfirmationModal";
import HeaderSection from "@/components/Teachers/blockAssignment/pagecomponents/HeaderSection";
import StudentDropdown from "@/components/Teachers/blockAssignment/pagecomponents/StudentDropdown";
import TabsSection from "@/components/Teachers/blockAssignment/pagecomponents/TabsSection";
import AssignmentsGrid from "@/components/Teachers/blockAssignment/pagecomponents/AssignmentsGrid";

type Tab = "active" | "completed" | "archived";
type View = "list" | "new" | "edit" | "detail";


export default function AssignmentsPage() {
   const { t } = useTranslation("teacher");
   const classId = useSelector((state: RootState) => state.currentClass?.id);
   const classStudents = useSelector((state: RootState) => (state as any).teacherStudentSlice?.students ?? []);
   // Memoised because NewAssignmentForm keys an effect on this array. Rebuilding
   // it on every render made that effect re-run and reset the form.
   const students = useMemo(
      () =>
         classStudents.map((s: any) => ({
            id: s.student_id ?? s.id,
            name: s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim(),
            username: s.username ?? "",
         })),
      [classStudents],
   );

   const [view, setView] = useState<View>("list");
   const [activeTab, setActiveTab] = useState<Tab>("active");
   const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
   const [loading, setLoading] = useState(false);
   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
   const [selectedId, setSelectedId] = useState<number | null>(null);
   const [editingAssignment, setEditingAssignment] = useState<any>(null);
   const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
   const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; title: string }>({
      isOpen: false,
      id: null,
      title: "",
   });
   const [deleting, setDeleting] = useState(false);

   const load = useCallback(() => {
      if (!classId) return;
      setLoading(true);
      assignmentServices
         .getClassAssignments(classId)
         .then((data) => {
            setAssignments(data);
            setLastUpdated(new Date());
         })
         .catch(console.error)
         .finally(() => setLoading(false));
   }, [classId]);

   useEffect(() => {
      if (view === "list") load();
   }, [view, load]);

   const filteredAssignments = assignments.filter((a) => {
      if (activeTab === "active") return a.status === "active" || a.status === "scheduled";
      if (activeTab === "completed") return a.status === "completed";
      return a.status === "archived";
   });

   const handleDelete = async () => {
      if (!deleteModal.id || !classId) return;
      setDeleting(true);
      try {
         await assignmentServices.deleteAssignment(classId, deleteModal.id);
         setAssignments((prev) => prev.filter((a) => a.id !== deleteModal.id));
         setDeleteModal({ isOpen: false, id: null, title: "" });
      } catch (err) {
         console.error("Delete failed:", err);
         alert(t("failedToDeleteAssignment"));
      } finally {
         setDeleting(false);
      }
   };

   const handleEdit = async (id: number) => {
      setLoading(true);
      try {
         const fullData = await assignmentServices.getSinglAssignment(classId, id);
         const assignedStudentIds = (fullData.student_records || [])
            .map((r: any) => r.student_id)
            .filter((sid: any) => sid != null);

         setEditingAssignment({
            ...fullData,
            topics: fullData.topics?.map((t: any) => ({ id: t.id, name: t.name })) ?? [],
            student_ids: assignedStudentIds,
            student_records: fullData.student_records,
         });
         setView("edit");
      } catch (err) {
         console.error("Failed to fetch details for edit:", err);
      } finally {
         setLoading(false);
      }
   };

   const handleArchive = async (id: number) => {
      try {
         await assignmentServices.archiveAssignment(classId, id);
         await load();
      } catch (err) {
         console.error("Failed to archive:", err);
         alert(t("failedToArchiveAssignment"));
      }
   };

   if (view === "detail" && selectedId) {
      return (
         <TeacherLayout>
            <AssignmentDetailView
               classId={classId}
               assignmentId={selectedId}
               onBack={() => {
                  setView("list");
                  setSelectedId(null);
               }}
               onEdit={() => handleEdit(selectedId)}
            />
         </TeacherLayout>
      );
   }

   if (view === "new" || view === "edit") {
      return (
         <TeacherLayout>
            <NewAssignmentForm
               classId={classId}
               students={students}
               editData={editingAssignment}
               onSuccess={() => {
                  setView("list");
                  setEditingAssignment(null);
                  load();
               }}
               onCancel={() => {
                  setView("list");
                  setEditingAssignment(null);
               }}
            />
         </TeacherLayout>
      );
   }

   return (
      <TeacherLayout>
         <div className="mx-auto max-w-7xl px-6 py-8">
            <HeaderSection onRefresh={load} onNewAssignment={() => setView("new")} lastUpdated={lastUpdated} />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
               <StudentDropdown classId={classId} selectedStudentId={selectedStudentId} onSelectStudent={setSelectedStudentId} />
               <TabsSection activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <AssignmentsGrid
               assignments={filteredAssignments}
               loading={loading}
               activeTab={activeTab}
               onArchive={handleArchive}
               onEdit={handleEdit}
               onDelete={(id, title) => setDeleteModal({ isOpen: true, id, title })}
               onCardClick={(id) => {
                  setSelectedId(id);
                  setView("detail");
               }}
            />

            <DeleteConfirmationModal
               isOpen={deleteModal.isOpen}
               title={deleteModal.title}
               loading={deleting}
               onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
               onConfirm={handleDelete}
            />
         </div>
      </TeacherLayout>
   );
}
