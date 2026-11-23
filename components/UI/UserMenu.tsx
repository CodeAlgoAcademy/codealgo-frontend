import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { BiLogOut, BiUserCircle } from "react-icons/bi";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { RootState } from "store/store";
import { logout, updateName } from "services/authService";
import { getUserFromLocalStorage } from "utils/getTokens";

type Variant = "icon" | "card";

const PANEL_WIDTH = 280;
const EDGE_GAP = 8;

interface Props {
   variant?: Variant;
}

/**
 * The user menu used by every layout.
 *
 * The panel is portalled to document.body and positioned with fixed
 * coordinates taken from the trigger. The old version was an absolutely
 * positioned child with z-[3] / z-[5], so on any page that had z-10 or higher
 * content - most of them - the panel rendered underneath it. Clicks meant for
 * the panel landed on whatever was on top, which counted as an outside click,
 * so the menu closed the moment you tried to use it.
 */
export default function UserMenu({ variant = "icon" }: Props) {
   const { t } = useTranslation("common");
   const dispatch = useDispatch();
   const userState = useSelector((state: RootState) => state.user);

   const [mounted, setMounted] = useState(false);
   const [open, setOpen] = useState(false);
   const [pos, setPos] = useState({ top: 0, left: 0 });
   const [firstname, setFirstname] = useState("");
   const [lastname, setLastname] = useState("");
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");
   const [saved, setSaved] = useState(false);

   const triggerRef = useRef<HTMLButtonElement>(null);
   const panelRef = useRef<HTMLDivElement>(null);

   // localStorage only exists in the browser. Reading it before mount made the
   // first client render differ from the server one (hydration error on every
   // dashboard page), so the stored name only kicks in after mount.
   const stored = mounted ? getUserFromLocalStorage() : null;
   const displayFirst = userState?.firstname || stored?.firstname || "";
   const displayLast = userState?.lastname || stored?.lastname || "";

   useEffect(() => {
      setMounted(true);
   }, []);

   const place = useCallback(() => {
      const el = triggerRef.current;
      if (!el || typeof window === "undefined") return;

      const rect = el.getBoundingClientRect();
      const maxLeft = window.innerWidth - PANEL_WIDTH - EDGE_GAP;
      const left = Math.max(EDGE_GAP, Math.min(rect.right - PANEL_WIDTH, maxLeft));

      setPos({ top: rect.bottom + EDGE_GAP, left });
   }, []);

   // Reset the fields from the current user every time the menu is opened, so
   // an abandoned edit never gets saved later.
   useEffect(() => {
      if (!open) return;

      setFirstname(displayFirst);
      setLastname(displayLast);
      setError("");
      setSaved(false);
      place();
   }, [open]);

   useEffect(() => {
      if (!open) return;

      const onPointerDown = (event: Event) => {
         const target = event.target as Node;
         if (panelRef.current?.contains(target)) return;
         if (triggerRef.current?.contains(target)) return;
         setOpen(false);
      };
      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key === "Escape") setOpen(false);
      };
      // capture, because the header sits inside scrolling containers
      const onReflow = () => place();

      document.addEventListener("pointerdown", onPointerDown, true);
      document.addEventListener("keydown", onKeyDown);
      window.addEventListener("resize", onReflow);
      window.addEventListener("scroll", onReflow, true);

      return () => {
         document.removeEventListener("pointerdown", onPointerDown, true);
         document.removeEventListener("keydown", onKeyDown);
         window.removeEventListener("resize", onReflow);
         window.removeEventListener("scroll", onReflow, true);
      };
   }, [open, place]);

   const save = async (event: FormEvent) => {
      event.preventDefault();
      if (saving) return;

      setSaving(true);
      setError("");
      setSaved(false);

      const result: any = await dispatch(
         updateName({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
         })
      );

      setSaving(false);

      if (result?.error) {
         setError(typeof result.payload === "string" ? result.payload : t("somethingWentWrong"));
         return;
      }

      setSaved(true);
   };

   const dirty = firstname.trim() !== displayFirst || lastname.trim() !== displayLast;
   const canSave = !saving && dirty && !!firstname.trim() && !!lastname.trim();

   const panel = (
      <div
         ref={panelRef}
         style={{ top: pos.top, left: pos.left, width: PANEL_WIDTH }}
         className="fixed z-[3000] rounded-[16px] border border-[#e0e0e0] bg-white px-4 py-4 shadow-lg"
      >
         <div className="flex items-center gap-2 text-[16px] font-bold text-mainColor">
            <BiUserCircle size={24} />
            <span className="truncate capitalize">
               {displayFirst} {displayLast}
            </span>
         </div>

         <form className="mt-4 flex flex-col gap-2" onSubmit={save}>
            <label className="text-[12px] font-medium text-gray-500" htmlFor="user-menu-firstname">
               {t("firstName")}
            </label>
            <input
               id="user-menu-firstname"
               type="text"
               value={firstname}
               onChange={(e) => setFirstname(e.target.value)}
               className="h-[36px] w-full rounded-[4px] border px-2 text-[14px] text-black outline-none focus:border-mainColor"
            />

            <label className="mt-1 text-[12px] font-medium text-gray-500" htmlFor="user-menu-lastname">
               {t("lastName")}
            </label>
            <input
               id="user-menu-lastname"
               type="text"
               value={lastname}
               onChange={(e) => setLastname(e.target.value)}
               className="h-[36px] w-full rounded-[4px] border px-2 text-[14px] text-black outline-none focus:border-mainColor"
            />

            {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
            {saved && !error && <p className="mt-1 text-[12px] text-green-600">{t("saved")}</p>}

            <button
               type="submit"
               disabled={!canSave}
               className="mt-2 h-[36px] w-full rounded-[6px] bg-mainColor text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
               {t("save")}
            </button>
         </form>

         <button
            type="button"
            className="mt-4 flex w-full cursor-pointer items-center gap-2 border-t pt-3 text-mainColor"
            onClick={() => {
               setOpen(false);
               dispatch(logout());
            }}
         >
            <BiLogOut size={20} />
            <span className="text-[14px] font-bold">{t("logoutButton")}</span>
         </button>
      </div>
   );

   return (
      <>
         <button
            ref={triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className={
               variant === "card"
                  ? "flex items-center gap-2 rounded-[30px] border border-[#bdbdbd] p-2 text-mainColor"
                  : "flex items-center gap-1 text-mainColor"
            }
         >
            <BiUserCircle size={24} />
            <p className="hidden max-w-[140px] truncate text-[1rem] capitalize md:block">
               {displayFirst} {displayLast}
            </p>
            {open ? <IoChevronUp /> : <IoChevronDown />}
         </button>

         {mounted && open && createPortal(panel, document.body)}
      </>
   );
}
