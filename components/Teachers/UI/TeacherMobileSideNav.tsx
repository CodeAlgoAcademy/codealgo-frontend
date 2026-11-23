import React from "react";
import { TbLayoutDashboard, TbClipboardText } from "react-icons/tb";
import { FaUserGraduate } from "react-icons/fa";
import { HiOutlineCalendar } from "react-icons/hi";
import { BiLogOut, BiMessageRounded } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import NavButton from "components/parents/UI/NavButton";
import { GrOrganization } from "react-icons/gr";
import { SlOrganization } from "react-icons/sl";
import { MdOutlinePayment } from "react-icons/md";
import { resetAuthUser } from "store/authSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

const links = [
   {
      name: "dashboard",
      icon: <TbLayoutDashboard />,
      url: "/teachers",
   },
   {
      name: "curriculum",
      icon: <TbClipboardText />,
      url: "/teachers/curriculum",
   },
   {
      name: "students",
      icon: <FaUserGraduate />,
      url: "/teachers/students",
   },
   {
      name: "organization",
      icon: <SlOrganization />,
      url: "/teachers/organization",
   },
   {
      name: "billing",
      icon: <MdOutlinePayment />,
      url: "/teachers/billing",
   },
   // {
   //    name: "calendar",
   //    icon: <HiOutlineCalendar />,
   //    url: "/teachers/calendar",
   // },
   // {
   //    name: "messages",
   //    icon: <BiMessageRounded />,
   //    url: "/teachers/messages",
   // },
];

const TeacherMobileSideNav = ({ className }: { className?: string }) => {
   const { t } = useTranslation("teacher");
   const dispatch = useDispatch();
   const router = useRouter();

   const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("token_timestamp");
      dispatch(resetAuthUser());
      router.push("/login");
   };

   return (
      <div className={`sticky top-0 z-20 mr-[3%] flex h-full min-w-[50px] flex-col gap-4 divide-y py-2 first:pt-0 xl:hidden ${className}`}>
         <div className="flex flex-col justify-between gap-3 pt-4">
            {links.map(({ name, icon, url }) => {
               return <NavButton {...{ image: icon, url, title: t(name) }} key={name} />;
            })}

            <div>
               <NavButton onClick={logout} image={<BiLogOut />} url="" title={t("logOut")} />
            </div>
         </div>
      </div>
   );
};

export default TeacherMobileSideNav;
