import React, { useState, useRef, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { AssignmentListItem } from "types/interfaces/assignments";
import { IoSettingsOutline } from "react-icons/io5";
import useClickOutside from "hooks/useClickOutside";

interface AssignmentCardProps {
   assignment: AssignmentListItem;
   onArchive: (id: number) => void;
   onEdit?: (id: number) => void;
   onDelete?: (id: number) => void;
   onClick?: (id: number) => void;
}

const BANNER_GRADIENTS = [
   "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)",
   "linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)",
   "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
   "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)",
];

const getGameTypeBadge = (gameType?: "block" | "line", t?: (key: string) => string) => {
   if (gameType === "block") {
      return { label: t?.("blockGame") || "Block Game", bg: "bg-emerald-100", text: "text-emerald-700" };
   }
   return { label: t?.("lineCoding") || "Line Coding", bg: "bg-purple-100", text: "text-purple-700" };
};

export default function AssignmentCard({ assignment, onArchive, onEdit, onDelete, onClick }: AssignmentCardProps) {
   const { t } = useTranslation("teacher");
   const [showMenu, setShowMenu] = useState(false);
   const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
   const menuRef = useClickOutside<HTMLDivElement>(() => setShowMenu(false));
   const gearBtnRef = useRef<HTMLButtonElement>(null);

   const bannerBg = BANNER_GRADIENTS[assignment.id % BANNER_GRADIENTS.length];
   const gameTypeBadge = getGameTypeBadge(assignment.game_type, t);

   const menuItems = useMemo(() => {
      const isArchived = assignment.status === "archived";

      if (isArchived) {
         return [
            {
               label: t("unarchiveAssignment"),
               action: () => onArchive(assignment.id),
            },
            {
               label: t("deletePermanently"),
               action: () => onDelete?.(assignment.id),
               danger: true,
            },
         ];
      }

      return [
         { label: t("editAssignment"), action: () => onEdit?.(assignment.id) },
         { label: t("archiveAssignment"), action: () => onArchive(assignment.id) },
         {
            label: t("deletePermanently"),
            action: () => onDelete?.(assignment.id),
            danger: true,
         },
      ];
   }, [assignment.status, assignment.id, onArchive, onEdit, onDelete, t]);

   const handleMouseEnter = () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      setShowMenu(true);
   };

   const handleMouseLeave = () => {
      const timeout = setTimeout(() => {
         setShowMenu(false);
      }, 150);
      setHoverTimeout(timeout);
   };

   useEffect(() => {
      return () => {
         if (hoverTimeout) clearTimeout(hoverTimeout);
      };
   }, [hoverTimeout]);

   const handleMenuAction = (action: () => void, e: React.MouseEvent) => {
      e.stopPropagation();
      action();
      setShowMenu(false);
   };

   const pct =
      assignment.progress_percentage !== undefined
         ? assignment.progress_percentage
         : assignment.student_count > 0
         ? Math.round((assignment.completed_count / assignment.student_count) * 100)
         : 0;

   const visibleTopics = assignment.topics?.slice(0, 3) ?? [];
   const extraTopics = (assignment.topics?.length ?? 0) - visibleTopics.length;
   const startDate = assignment.created_at ? format(new Date(assignment.created_at), "MM/dd/yyyy") : "N/A";

   return (
      <div
         className="relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
         onClick={() => onClick?.(assignment.id)}
      >
         <div className="relative h-[140px]" style={{ background: bannerBg }}>
            <div className="absolute bottom-3 left-3 right-10 flex flex-wrap gap-1.5">
               {visibleTopics.map((t) => (
                  <span key={t.id} className="max-w-[130px] truncate rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-blue-800">
                     {t.name}
                  </span>
               ))}
               {extraTopics > 0 && <span className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-blue-800">+{extraTopics}</span>}
            </div>

            <div className="absolute top-2.5 right-2.5 z-30" ref={menuRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
               <button
                  ref={gearBtnRef}
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/95 text-base shadow-sm transition-all duration-300 hover:bg-white 
              ${showMenu ? "rotate-45 shadow-md" : "hover:rotate-45 hover:shadow-md"}`}
                  onClick={(e) => {
                     e.stopPropagation();
                     setShowMenu(!showMenu);
                  }}
               >
                  <IoSettingsOutline />
               </button>

               {showMenu && (
                  <div
                     className="absolute top-full right-0 z-20 mt-2 min-w-[220px] origin-top-right animate-slideDown rounded-lg bg-white shadow-lg"
                  >
                     <div className="py-1">
                        {menuItems.map((item, index) => (
                           <button
                              key={index}
                              className={`
                      flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm
                      transition-colors duration-200
                      ${index !== menuItems.length - 1 ? "border-b border-gray-100" : ""}
                      ${item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}
                    `}
                              onClick={(e) => handleMenuAction(item.action, e)}
                           >
                              <span>{item.label}</span>
                           </button>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            <div className="absolute -top-5 right-[60px] h-[120px] w-[120px] rounded-full bg-white/5" />
            <div className="absolute top-5 right-2.5 h-[80px] w-[80px] rounded-full bg-white/5" />
         </div>

         <div className="p-3.5 pb-4">
            <div className="mb-0.5 text-xl font-bold text-slate-900">{assignment.title}</div>
            
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
               <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${gameTypeBadge.bg} ${gameTypeBadge.text}`}
               >
                  <span>{gameTypeBadge.label}</span>
               </span>
               <span className="text-slate-500">·</span>
               <span className="text-slate-500">{assignment.standards?.length ? t("skillsCountCapital", { count: assignment.standards.length }) : t("anySkill")}</span>
               <span className="text-slate-500">·</span>
               <span className="text-slate-500">
                  <strong>{assignment.question_count || t("all")}</strong> {t("questions")}
               </span>
            </div>

            <div className="mb-2.5 grid grid-cols-2 gap-1">
               <div>
                  <div className="mb-0.5 text-[11px] text-slate-400">{t("startDate")}</div>
                  <div className="text-[13px] font-bold text-blue-600">{startDate}</div>
               </div>

               <div>
                  <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">{t("progress")}</div>
                  <div className="flex items-center gap-2">
                     <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${pct}%` }} />
                     </div>
                     <span className="text-xs font-bold text-blue-600">{pct}%</span>
                  </div>
               </div>
            </div>

            <div className="mt-2 grid grid-cols-2 items-end gap-4">
               <div>
                  <div className="mb-0.5 text-[11px] text-slate-400">{t("status")}</div>
                  <div className={`text-[13px] font-bold capitalize ${assignment.status === "archived" ? "text-amber-600" : "text-green-600"}`}>
                     {t(`status${assignment.status.charAt(0).toUpperCase()}${assignment.status.slice(1)}`)}
                  </div>
               </div>

               <div className="pl-2">
                  <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">{t("students")}</div>
                  <div className="text-[13px] font-bold text-blue-600">
                     {assignment.student_count} {assignment.student_count === 1 ? t("studentSingular") : t("studentPlural")}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}