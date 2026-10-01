import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BiHome, BiHomeAlt, BiMenu } from "react-icons/bi";
import Link from "next/link";
import { TbLayoutDashboard, TbClipboardText } from "react-icons/tb";
import { SlOrganization } from "react-icons/sl";
import Image from "next/image";
import BetaButton from "../UI/beta-button";
import TeacherSidebar from "../Teachers/UI/Sidebar";
import UserMenu from "../UI/UserMenu";
import { MdClass, MdMenu } from "react-icons/md";
import ClassSelector from "../Teachers/UI/ClassSelector";
import { FaUserGraduate } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { getAllClasses } from "services/classesService";
import { FiActivity } from "react-icons/fi";
import PrintLoginsButton from "../UI/printlogins";
import GeneratingModal from "../Teachers/students/generatingModal";
import SuccessModal from "../modals/SuccessModal";
import { PiStudentDuotone } from "react-icons/pi";
import { TbLivePhoto } from "react-icons/tb";
import { SlGameController } from "react-icons/sl";
import { SlSettings } from "react-icons/sl";
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { MdOutlineAssignment } from "react-icons/md";
import LanguageSwitcher from "../UI/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface Props {
   children?: ReactNode;
   className?: string;
}

const TeacherLayout = ({ children, className }: Props) => {
   const [sidebarOpened, setSidebarOpened] = useState<boolean>(false);
   const router = useRouter();
   const dispatch = useDispatch();
   const { t } = useTranslation("common");
   const { t: tTeacher } = useTranslation("teacher");

   const links = [
      {
         key: "dashboard",
         name: tTeacher("dashboard"),
         icon: <TbLayoutDashboard />,
         url: "/teachers",
      },
      {
         key: "classroom",
         name: tTeacher("classroom"),
         icon: "🎓",
         subLinks: [
            { name: tTeacher("lessonPlan"), url: "/teachers/curriculum" },
            { name: tTeacher("liveClass"), url: "/teachers/overview" },
            { name: tTeacher("codingAssignments"), url: "/teachers/assignments" },
            { name: tTeacher("mathAssignments"), url: "/teachers/math-assignments" },
         ],
      },
      {
         key: "reportsAndSettings",
         name: tTeacher("reportsAndSettings"),
         icon: "📊",
         subLinks: [
            { name: tTeacher("classReport"), url: "/teachers/report" },
            { name: tTeacher("classSettings"), url: "/teachers/classbulksettings" },
         ],
      },
      {
         key: "students",
         name: tTeacher("students"),
         icon: "👥",
         url: "/teachers/students",
      },
      {
         key: "organization",
         name: tTeacher("organization"),
         icon: "🏢",
         url: "/teachers/organization",
      },
      {
         key: "help",
         name: tTeacher("help"),
         icon: "❓",
         url: "/contact",
      },
   ];

   useEffect(() => {
      // const stringedToken = localStorage.getItem(ILocalStorageItems.token);
      // const token = JSON.parse(`${stringedToken}`);
      // if (token?.user_type !== "teacher") {
      //    router?.push("/login");
      // }
   }, [router]);

   useEffect(() => {
      dispatch(getAllClasses());
   }, [router.pathname]);

   return (
      <main className="relative min-h-screen w-full bg-white">
         {/* Sidebar */}
         <TeacherSidebar links={links} isOpen={sidebarOpened} close={() => setSidebarOpened(false)} />

         {/* Main Content Area.
             The sidebar is an off-canvas drawer up to 1392px and only docks
             permanently beyond that — so the content offset must match the
             same breakpoint, not `md` (768px). That mismatch was the cause
             of the 768–1392px overlap/clipping. */}
         <section className="flex flex-col min-h-screen transition-all duration-300 min-[1392px]:pl-[280px]">
            
            {/* Top Navigation */}
            <nav className="sticky top-0 z-[40] bg-white flex w-full items-center justify-between gap-2 py-4 px-4 sm:px-6 border-b min-[1392px]:border-none">
               <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div className="min-[1392px]:hidden shrink-0">
                     <MdMenu size={28} className="cursor-pointer" onClick={() => setSidebarOpened(true)} />
                  </div>
                  <Link href={`/teachers/addClass`} className="shrink-0">
                     <BiHomeAlt size={24} className="text-blue-600 cursor-pointer" />
                  </Link>
                  <div className="hidden min-[1392px]:block">
                     <ClassSelector />
                  </div>
               </div>

               <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <LanguageSwitcher variant="sidebar" />
                  <PrintLoginsButton />
                  <UserMenu variant="card" />
               </div>
            </nav>

            {/* Page Content */}
            <div className={`flex-1 overflow-x-hidden bg-[#ecedf3] p-4 md:p-8 min-[1392px]:m-4 min-[1392px]:rounded-[30px] ${className}`}>
               <div className="flex items-center justify-end min-[1392px]:hidden mb-4">
                  <ClassSelector />
               </div>
               {children}
            </div>
         </section>

         {/* Modals - stacked above the sidebar (z-[105]) and its overlay (z-[100]) */}
         <GeneratingModal />
         <SuccessModal />
      </main>
   );
};

export default TeacherLayout;