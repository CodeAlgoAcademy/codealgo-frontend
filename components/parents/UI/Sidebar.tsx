import { SlOrganization } from "react-icons/sl";
import NavButton from "./NavButton";
import { GiHelp } from "react-icons/gi";
import { MdClose } from "react-icons/md";
import Image from "next/image";
import { DEFAULT_SUPPORT } from "constants/support.const";
import { GiLevelThreeAdvanced } from "react-icons/gi";
import { SlGameController } from "react-icons/sl";
import { TbMathSymbols } from "react-icons/tb";
import { useTranslation } from "react-i18next";

interface Props {
   onClose(): void;
   isOpen: boolean;
}

export default function ParentSidebar({ onClose, isOpen }: Props) {
   const iconSize = 20;
   const { t } = useTranslation("parent");
   const { t: tCommon } = useTranslation("common");
   return (
      <aside
         className={`
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    fixed top-0 left-0 z-[50]
    h-full w-full bg-white
    transition-transform duration-300
    md:w-[300px]
    md:translate-x-0
  `}
      >
         <header className="flex items-center justify-between gap-2 md:justify-center">
            <Image src={"/assets/CodeAlgo_Logo.png"} className="h-9 md:cursor-pointer" alt="logo" loading="lazy" width={90} height={45} />
            <MdClose size={26} cursor={"pointer"} onClick={onClose} className="md:hidden" />
         </header>
         <div className="mt-12">
            <NavButton title={t("mainDashboard")} image="Dashboard.svg" url="/parents" />
         </div>
         <div className="relative">
            {/* <NavButton title="Messages" image="message.svg" url="/parents/messages" notification={unread > 0 ? unread : ""} /> */}
         </div>
         <div>
            <NavButton title={t("mathFacts")} image={<TbMathSymbols size={iconSize} />} url="/parents/math-facts" />
         </div>
         <div className="my-2">
            <h2 className="ml-7 mb-3 text-xl font-medium text-[#A8ABB0]">{tCommon("account")}</h2>
            <NavButton title={t("studentAccounts")} image="people.svg" url="/parents/student" />
            <NavButton title={t("billing")} image="Billing.svg" url="/parents/billing" />
            <NavButton title={t("organization")} image={<SlOrganization />} url="/parents/organization" />
         </div>
         <div className="my-2">
            <h2 className="ml-7 mb-3 text-xl font-medium text-[#A8ABB0]">{tCommon("safety")}</h2>
            <NavButton title={t("screenTime")} image="screen-time.svg" url="/parents/screen-time" />
            <NavButton title={t("levelsThreshold")} image={<GiLevelThreeAdvanced size={iconSize} />} url="/parents/LevelThreshold" />
            <NavButton title={t("gameLock")} image={<SlGameController size={iconSize} />} url="/parents/game-lock" />
            {/* <NavButton title="Multiplayer" image="game.svg" url="/parents/multiplayer" /> */}
         </div>
         <NavButton
            image={<GiHelp size={22} />}
            url="/contact" // <-- changed here
            title={t("getHelp")}
         />
      </aside>
   );
}
