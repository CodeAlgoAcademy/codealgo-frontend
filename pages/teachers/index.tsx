import TeacherLayout from "@/components/layouts/TeacherLayout";
import React, { useEffect, useState } from "react";
import RecentInteraction from "@/components/parents/multiplayer/RecentInteraction";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store/store";
import StudentsList from "@/components/Teachers/UI/StudentsList";
import { getStudents } from "store/studentSlice";
import StudentBarChart from "@/components/Teachers/students/screentime/BarChart";
import { useRouter } from "next/router";
import StudentLevelChart from "@/components/Teachers/students/level-threshold/BarChart";
import { fetchStudentBlockGameProgress, fetchStudentLineProgress, fetchStudentLineProgressNew } from "store/teacherStudentSlice";
import TeacherStudentSkills from "@/components/Teachers/students/studentsprogress/skills";
import TeacherStudentCompletedStandard from "@/components/Teachers/students/studentsprogress/standard";
import TeacherStudentProgress from "@/components/Teachers/students/studentsprogress/progress";
import { useAppDispatch } from "store/hooks";
import teachersClassBaseServices from "services/teachersClassServices";

interface TeachersTabs {
   students: boolean;
}

// The same standard can come back from two endpoints. Keep whichever row got
// further so a quest-driven line standard doesn't also show at 0%.
const dedupeByStandard = (rows: any[]) => {
   const seen = new Map<string, any>();
   const out: any[] = [];
   for (const row of rows) {
      const key = row?.source === "quest" ? `quest:${row.quest_line_id}` : row?.standard_code;
      if (!key) {
         out.push(row);
         continue;
      }
      const prev = seen.get(key);
      if (!prev) {
         seen.set(key, row);
         out.push(row);
      } else if ((row.progress || 0) > (prev.progress || 0)) {
         out[out.indexOf(prev)] = row;
         seen.set(key, row);
      }
   }
   return out;
};

const Dashboard = () => {
   const dispatch = useAppDispatch();
   const router = useRouter();
   const { currentStudent } = useSelector((state: RootState) => state.teacherStudentSlice);
   const { id: classId } = useSelector((state: RootState) => state.currentClass);
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [isBlockProgress, setIsBlockProgress] = useState<boolean>(false);
   const [progressData, setProgressData] = useState<any[]>([]);
   const [tabs, setTabs] = useState<TeachersTabs>({ students: false });

   const toggleTab = (key: keyof TeachersTabs, open: boolean) => {
      setTabs({ students: open });
   };
   // const calculateAge = (dob: string): number => {
   //    const birthDate = new Date(dob);
   //    const today = new Date();
   //    let age = today.getFullYear() - birthDate.getFullYear();
   //    const monthDiff = today.getMonth() - birthDate.getMonth();
   //    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
   //       age--;
   //    }
   //    return age;
   // };

   useEffect(() => {
      if (classId) {
         dispatch(getStudents(classId));
      }
   }, [classId, dispatch]);




   // Update the useEffect in teachers/index.tsx

// useEffect(() => {
//    const studentId = currentStudent?.student_id || currentStudent?.id;
//    const dob = currentStudent?.dob;

//    if (classId && studentId && dob) {
//       setIsLoading(true);

//       const age = calculateAge(dob);

//       const is14AndAbove = age >= 14;
//       setIsBlockProgress(!is14AndAbove);

//       const action = is14AndAbove
//          ? fetchStudentLineProgressNew({
//               classId: classId.toString(),
//               studentId: studentId.toString(),
//            })
//          : fetchStudentBlockGameProgress({
//               classId,
//               studentId,
//            });

//       dispatch(action)
//          .unwrap()
//          .then((res: any) => {
//             const normalizedData = Array.isArray(res)
//                ? res
//                : res?.topic || [];

//             setProgressData(normalizedData);
//          })
//          .catch((err) => {
//             console.error("Progress Fetch Error:", err);
//          })
//          .finally(() => {
//             setIsLoading(false);
//          });
//    }
// }, [
//    classId,
//    currentStudent?.student_id,
//    currentStudent?.id,
//    currentStudent?.dob,
//    dispatch,
// ]);



const calculateAge = (dob: string): number => {
   if (!dob) return 0;
   const birthDate = new Date(dob);
   const today = new Date();
   let age = today.getFullYear() - birthDate.getFullYear();
   if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) {
      age--;
   }
   return age;
};

useEffect(() => {
   const studentId = currentStudent?.student_id || currentStudent?.id;
   const dob = currentStudent?.dob;
   if (!classId || !studentId) return;

   let cancelled = false;
   setIsLoading(true);
   setProgressData([]);

   // No dob used to mean nothing loaded at all. Line coding is the default
   // now, so a student without one gets the line view.
   const isPythonStudent = !dob || calculateAge(dob) >= 14;
   setIsBlockProgress(!isPythonStudent);

   const action = isPythonStudent
      ? fetchStudentLineProgressNew({ classId: classId.toString(), studentId: studentId.toString() })
      : fetchStudentBlockGameProgress({ classId, studentId });

   const legacy = dispatch(action)
      .unwrap()
      .then((res: any) => (Array.isArray(res) ? res : res?.topic || []))
      .catch(() => []);

   // Quests are fetched for every student. Whether line coding is open is
   // decided by coding-access on the server, not by age, so a younger student
   // can be working through quest lines too.
   const quests = teachersClassBaseServices
      .getStudentQuestProgressByTeacher(studentId.toString(), classId.toString())
      .catch(() => []);

   // Quests count towards line standards, so a block student who plays them
   // gets those standards too. Only the ones with progress, or the list would
   // fill up with every grade 6+ standard at 0%.
   const lineForBlockStudent = isPythonStudent
      ? Promise.resolve([])
      : teachersClassBaseServices
           .getStudentLineProgressNewByTeacher(studentId.toString(), classId.toString())
           .then((rows: any) => (Array.isArray(rows) ? rows.filter((r: any) => (r.progress || 0) > 0) : []))
           .catch(() => []);

   Promise.all([quests, legacy, lineForBlockStudent])
      .then(([questRows, legacyRows, lineRows]) => {
         if (!cancelled) setProgressData(dedupeByStandard([...questRows, ...legacyRows, ...lineRows]));
      })
      .finally(() => {
         if (!cancelled) setIsLoading(false);
      });

   return () => {
      cancelled = true;
   };
}, [classId, currentStudent?.id, currentStudent?.student_id, currentStudent?.dob]);

const allProgressItems = Array.isArray(progressData) ? progressData : [];
const inProgressItems = allProgressItems.filter((item) => (item.progress || 0) < 1.0);
const completedItems = allProgressItems.filter((item) => (item.progress || 0) >= 1.0);


   

   const filteredCompletedItems = completedItems.filter((item) => {
      if (item.source === "quest") return false;
      const hasNoCurriculum =
         item.iready_math_desc?.includes("(No direct curriculum unit)") && item.common_core_math_desc?.includes("(No direct curriculum unit)");
      return !hasNoCurriculum;
   });

   return (
      <TeacherLayout>
         <StudentsList isOpen={tabs.students} open={() => toggleTab("students", true)} close={() => toggleTab("students", false)} />

         <div className="relative bottom-14 mb-[-120px] h-auto scale-90 overflow-scroll 
         overflow-x-auto sm:bottom-0 sm:mb-0 sm:scale-100">
            <div className="grid h-auto grid-flow-row grid-cols-1 gap-6 overflow-scroll 
            sm:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
               <TeacherStudentProgress
                  size="base"
                  level={(currentStudent?.level as number) + 1}
                  progressItems={inProgressItems}
                  isLoading={isLoading}
                  completedItems={completedItems}
               />
               <TeacherStudentCompletedStandard completedItems={filteredCompletedItems} isLoading={isLoading} />
               <TeacherStudentSkills size="base" allProgressItems={allProgressItems} />
               <div className="dashboard-widget">
                  <StudentBarChart showEditLink={false} />
               </div>
               <div className="dashboard-widget">
                  <StudentLevelChart showEditLink={false} />
               </div>
               <RecentInteraction />
            </div>
         </div>
      </TeacherLayout>
   );
};

export default Dashboard;
