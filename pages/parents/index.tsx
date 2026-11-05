import ParentLayout from "@/components/layouts/ParentLayout";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchChildBlockGameProgress, getChildProgress } from "store/parentChildSlice";
import { RootState } from "store/store";
import { IChildProgress } from "types/interfaces";
import Skills from "@/components/parents/student/Skills";
import Level from "@/components/parents/student/Level";
import Screentime from "@/components/parents/screentime/Screentime";
import RecentInteraction from "@/components/parents/multiplayer/RecentInteraction";
import CompletedStandard from "./standard";
import LevelsThresholdChart from "@/components/parents/threshold/LevelThreshold";
import MathTests from "@/components/Teachers/students/studentsprogress/mathTests";

const Dashboard = () => {
   const dispatch = useDispatch();
   const { t } = useTranslation("parent");
   const parent = useSelector((state: RootState) => state.parentChild);
   const [progressData, setProgressData] = useState<IChildProgress[]>([]);
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [isBlockProgress, setIsBlockProgress] = useState<boolean>(false);

   const calculateAge = (dob: string): number => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
         age--;
      }
      return age;
   };

   useEffect(() => {
      const studentId = parent?.currentChild?.id;
      const dob = parent?.currentChild?.dob;

      if (studentId && dob) {
         setIsLoading(true);
         const age = calculateAge(dob);
         const isUnder14 = age < 14;
         setIsBlockProgress(isUnder14);
         const progressAction = isUnder14 ? fetchChildBlockGameProgress(studentId) : getChildProgress(studentId);

         dispatch(progressAction)
            .unwrap()
            .then((res: any) => {
               console.log("Fetched Progress Data:", res);
               setProgressData(isUnder14 ? res : res?.topic || []);
            })
            .catch((err: any) => {
               console.error("Error fetching progress:", err);
            })
            .finally(() => {
               setIsLoading(false);
            });
      }
   }, [parent?.currentChild?.id, parent?.currentChild?.dob, dispatch]);

   const allProgressItems = Array.isArray(progressData) ? progressData : [];
   const inProgressItems = allProgressItems.filter((item) => item.progress < 1.0);
   const completedItems = allProgressItems.filter((item) => item.progress === 1.0);
   const filteredCompletedItems = completedItems.filter((item) => {
      const hasNoCurriculum =
         item.iready_math_desc?.includes("(No direct curriculum unit)") && item.common_core_math_desc?.includes("(No direct curriculum unit)");
      return !hasNoCurriculum;
   });

   return (
      <ParentLayout title={t("mainDashboard")} showChildrenList>
         <div className="relative bottom-14 mb-[-120px] scale-90 overflow-x-auto sm:bottom-0 sm:mb-0 sm:scale-100">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
               <Level
                  size="base"
                  level={(parent?.currentChild?.level as number) + 1}
                  progressItems={inProgressItems}
                  isLoading={isLoading}
                  isBlockProgress={isBlockProgress}
                  completedItems={completedItems}
                     currentProgress={
                     !isBlockProgress && (parent?.currentChild?.progress?.current ?? false)
                     }
                     />
               <CompletedStandard completedItems={filteredCompletedItems} isLoading={isLoading} />
               <Skills size="base" />
               <MathTests studentId={parent?.currentChild?.id} />
               <Screentime size="base" />
               <LevelsThresholdChart size="base" />
               <RecentInteraction />
            </div>
         </div>
      </ParentLayout>
   );
};

export default Dashboard;
