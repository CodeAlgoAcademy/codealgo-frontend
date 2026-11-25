import React, { FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, Variant } from "framer-motion";
import SpriteIcon from "@/components/UI/SpriteIcon";
import { MdClose, MdOutlineAnimation } from "react-icons/md";
import { AccessibilityFeatures } from "types/interfaces/accessibility.interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store/store";
import { cn } from "utils";
import { IoContrast, IoInvertMode, IoText } from "react-icons/io5";
import { RxLink1 } from "react-icons/rx";
import { accessibilityActions } from "store/accessibilitySlice";
import { GrPowerReset } from "react-icons/gr";
import { GiArrowCursor } from "react-icons/gi";
import { IoMdClose, IoMdCloseCircleOutline } from "react-icons/io";
import AccessibilitySettings from "./settings";

const variants: Record<string, Variant> = {
   hidden: {
      translateX: "100vw",
      opacity: 0,
   },
   visible: {
      translateX: 0,
      opacity: 1,
      transition: {
         type: "bounce",
      },
   },
};

const AccessibilityMenu = () => {
   const [isOpen, setIsOpen] = useState<boolean>(false);
   const dispatch = useDispatch();
   const { dictionary } = useSelector((state: RootState) => state.accessibility.features);

   useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
         if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === "u") {
               e.preventDefault();
               setIsOpen((prev) => !prev);
            }
            if (e.key.toLowerCase() === "m") {
               e.preventDefault();
               if (!isOpen) {
                  setIsOpen(true);
               } else {
                  dispatch(accessibilityActions.increaseFeatureCount("dictionary"));
               }
            }
         }
      };
      window.addEventListener("keydown", handleKeyPress);

      return () => window.removeEventListener("keydown", handleKeyPress);
   }, [isOpen]);

   return (
      <section className="omit-invert">
         <div
            onClick={() => setIsOpen(true)}
className="a11y-fab"
         >
            <div className="a11y-fab-ring">
               <SpriteIcon name="accessibility" className="text-white" size={20} />
            </div>
         </div>

         {isOpen && (
            <AnimatePresence>
               <div className="omit fixed top-0 right-0 z-[1002] flex h-screen w-screen cursor-pointer">
                  <div className="h-screen w-full flex-1 bg-black/20 max-md:hidden" onClick={() => setIsOpen(false)}></div>
                  <motion.div
                     variants={variants}
                     initial="hidden"
                     animate={isOpen ? "visible" : "hidden"}
                     exit="hidden"
                     className="flex max-h-screen w-screen flex-col bg-mainRed shadow-lg md:w-[450px]"
                  >
                     <AccessibilitySettings onClose={() => setIsOpen(false)} />
                  </motion.div>
               </div>
            </AnimatePresence>
         )}
      </section>
   );
};

export default AccessibilityMenu;

