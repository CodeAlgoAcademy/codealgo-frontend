import { SlOrganization } from "react-icons/sl";
import NavButton from "@/components/parents/UI/NavButton";
import { GiHelp } from "react-icons/gi";
import { MdClose } from "react-icons/md";
import Image from "next/image";
import { FcOrganization } from "react-icons/fc";
import { BiUserPin } from "react-icons/bi";
import { HiOutlineDocumentReport, HiUsers } from "react-icons/hi";
import { GoOrganization } from "react-icons/go";
import { DEFAULT_SUPPORT } from "constants/support.const";
import { useTranslation } from "react-i18next";

interface Props {
   onClose(): void;
   isOpen: boolean;
}

export default function OrganizerSidebar({ onClose, isOpen }: Props) {
   const { t } = useTranslation("organizer");
   const { t: tCommon } = useTranslation("common");

   return (
      <aside
         className={`${
            isOpen ? "translate-x-0" : "translate-x-[100%]"
         } fixed top-0 right-0 z-[5] h-full max-h-full w-full overflow-y-scroll bg-white p-2 transition-all duration-500 md:left-0 md:!w-[300px] md:!translate-x-0 md:py-9`}
      >
         <header className="mb-10 flex items-center justify-between gap-2 px-4 md:justify-center">
            <Image src={"/assets/CodeAlgo_Logo.png"} className="h-9 md:cursor-pointer" alt="logo" loading="lazy" width={90} height={45} />
            <MdClose size={26} cursor={"pointer"} onClick={onClose} className="md:hidden" />
         </header>
         <div className="mx-auto flex flex-col gap-[.8rem] md:max-w-[250px]">
            <NavButton title={t("mainDashboard")} image="Dashboard.svg" url="/organizers" />
            <NavButton title={t("addOrganization")} image={<GoOrganization size={22} />} url="/organizers/create-organization" />
            <NavButton title={t("roles")} image={<BiUserPin size={22} />} url="/organizers/roles" />
            <NavButton title={t("student")} image={<BiUserPin size={22} />} url="/organizers/student" />
            <NavButton title={t("reports")} image={<HiOutlineDocumentReport size={22} />} url="/organizers/reports" />
            {/* <NavButton title="Licenses" image={<BiUserPin size={22} />} url="/organizers/licenses" /> */}
            <NavButton title={t("users")} image={<HiUsers size={22} />} url="/organizers/users" />
            <NavButton
               image={<GiHelp size={22} />}
               url="/contact"
               title={t("getHelp")}
            />{" "}
         </div>
      </aside>
   );
}
