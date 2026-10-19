import Image from "next/image";
import React, { FC, forwardRef, MutableRefObject, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import { links, NavbarLink } from "./Links";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { cn } from "utils";
import Link from "next/link";
import { Variant, motion } from "framer-motion";
import AppDownloadModal from "@/components/modals/AppDownloadModal";
import { CustomButton } from "@/components/UI/Button";
import LanguageSwitcher from "@/components/UI/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface NavbarProps {
   close(): void;
}

const variants: Record<string, Variant> = {
   hidden: {
      scale: 0,
      opacity: 1,
   },
   visible: {
      scale: 1,
      opacity: 1,
   },
};

const MobileNavbar: FC<NavbarProps> = ({ close }) => {
   const [showAppModal, setShowAppModal] = useState(false);
   const { t } = useTranslation("common");
   const { t: tHome } = useTranslation("home");

   return (
      <motion.aside
         variants={variants}
         initial="hidden"
         animate="visible"
         exit="hidden"
         className="fixed top-0 left-0 z-[100] flex h-screen w-screen flex-col bg-mainBlack py-6 px-8 font-thabit md:hidden"
      >
         <header className="flex items-center justify-between gap-4">
            <Link href="/" onClick={close} className="cursor-pointer">
               <Image src={"/assets/landing/logo_white.png"} width={100} height={50} alt="CodeAlgo Academy" />
            </Link>
            <MdClose onClick={close} color="white" size={28} />
         </header>

         <div className="mt-[80px] w-full flex-1 space-y-2">
            {links.map((link, index) => {
               const ref = useRef<HTMLDivElement>(null);
               return <SingleMobileLink link={link} ref={ref} key={index} close={close} />;
            })}
         </div>

         {/* ✅ Buttons moved here, outside the links loop, no max-md:hidden */}
         <div className="flex flex-col gap-3 mt-6 pb-4">
            <LanguageSwitcher variant="compact" className="self-start" />
            <CustomButton
               onClick={() => { window.location.href = "/login"; close(); }}
               variant="filled"
               size="medium"
               className="w-full h-[44px] bg-mainRed font-bold !text-white flex items-center justify-center hover:bg-mainRed/80"
            >
               <span className="no-contrast-adjust">{t("login")}</span>
            </CustomButton>

            <CustomButton
               onClick={() => setShowAppModal(true)}
               variant="outline"
               size="medium"
               className="w-full h-[44px] font-bold !text-white flex items-center justify-center"
            >
               <span className="no-contrast-adjust">{t("getApp")}</span>
            </CustomButton>

            <CustomButton
               onClick={() => { window.location.href = "https://play.codealgoacademy.com"; close(); }}
               variant="filled"
               size="medium"
               className="w-full h-[44px] bg-mainRed font-bold !text-white flex items-center justify-center hover:bg-mainRed/80"
            >
               <span className="no-contrast-adjust">{t("playGame")}</span>
            </CustomButton>
         </div>

         <AppDownloadModal
            isOpen={showAppModal}
            onClose={() => setShowAppModal(false)}
         />
      </motion.aside>
   );
};

interface Props {
   link: NavbarLink;
   close: () => void;
}

const SingleMobileLink = forwardRef<HTMLDivElement, Props>(({ link, close }, ref) => {
   const [isOpen, setIsOpen] = useState(false);
   const [height, setHeight] = useState(0);
   const { t: tHome } = useTranslation("home");

   const innerRef = useRef<HTMLUListElement>(null);

   useEffect(() => {
      const element = (ref && "current" in ref ? ref.current : innerRef.current) as HTMLDivElement | null;

      if (element) {
         setHeight(element.clientHeight);
      }
   }, [ref, innerRef]);

   return (
      <div className="w-full text-white">
         {link.sublinks ? (
            <header
               onClick={() => setIsOpen(!isOpen)}
               className="flex items-center justify-between p-4 hover:bg-black/10 cursor-pointer"
            >
               <p className="text-[1.3rem]">{tHome(link.name)}</p>
               <span className="text-white">{isOpen ? <BiChevronUp size={25} /> : <BiChevronDown size={25} />}</span>
            </header>
         ) : (
            <Link
               href={link.route!}
               onClick={close}
               className="flex items-center justify-between p-4 hover:bg-black/10 cursor-pointer"
            >
               <p className="text-[1.3rem]">{tHome(link.name)}</p>
            </Link>
         )}

         <div className={cn("overflow-hidden font-sans transition-all  duration-300")} style={{ height: isOpen ? height : 0 }}>
            <div ref={(ref as MutableRefObject<HTMLDivElement>) || innerRef} className="py-3 px-4 text-[.9rem]">
               {link.sublinks?.map((link, index) => {
                  return (
                     <li key={index} onClick={close}>
                        <Link href={link.link}>
                           <p className="rounded-md p-2 text-[.9rem] transition-all duration-300 hover:bg-mainRed hover:text-white" key={index}>
                              {tHome(link.name)}
                           </p>
                        </Link>
                     </li>
                  );
               })}
            </div>
         </div>
      </div>
   );
});

SingleMobileLink.displayName = "SingleMobileLink";

export default MobileNavbar;
