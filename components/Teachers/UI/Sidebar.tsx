import React, { ReactElement, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MdClose, MdKeyboardArrowRight, MdKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";

export interface ILink {
   key: string;
   name: string;
   icon: ReactElement | string;
   url?: string;
   subLinks?: { name: string; url: string }[];
}

interface Props {
   links: ILink[];
   isOpen: boolean;
   close(): void;
}

const TeacherSidebar = ({ links, isOpen, close }: Props) => {
   const router = useRouter();
   const [expandedMenus, setExpandedMenus] = useState<string[]>(["classroom", "reportsAndSettings"]);

   const toggleMenu = (name: string) => {
      setExpandedMenus((prev) =>
         prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
      );
   };

   return (
      <>
         {isOpen && (
            <div 
               className="fixed inset-0 z-[100] bg-black/40 min-[1392px]:hidden" 
               onClick={close}
            />
         )}

         <aside
            className={`
            fixed top-0 left-0 h-full bg-white p-4 transition-transform duration-300 ease-in-out
            z-[105] min-[1392px]:z-[40] w-[280px] max-w-[85vw] border-r border-gray-100 overflow-y-auto
            ${isOpen ? "translate-x-0" : "-translate-x-full min-[1392px]:translate-x-0"}
         `}
         >
            <div className="mb-8 flex w-full items-center justify-between">
               <div className="block max-w-[150px]">
                  <Link href="/teachers/addClass">
                     <Image src="/assets/CodeAlgo_Logo.png" alt="logo" width={90} height={45} className="cursor-pointer" />
                  </Link>
               </div>
               <button type="button" className="min-[1392px]:hidden cursor-pointer p-2 text-gray-500" onClick={close}>
                  <MdClose size={26} />
               </button>
            </div>

            <div className="flex flex-col gap-1">
               {links.map((link) => {
                  const isExpanded = expandedMenus.includes(link.key);
                  const hasSubLinks = !!link.subLinks;
                  const isActive = router.pathname === link.url || link.subLinks?.some(s => s.url === router.pathname);

                  return (
                     <div key={link.key} className="w-full">
                        {hasSubLinks ? (
                           <button
                              type="button"
                              onClick={() => toggleMenu(link.key)}
                              className="flex w-full cursor-pointer select-none items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                           >
                              <div className="flex items-center gap-4">
                                 <span className="text-xl">{link.icon}</span>
                                 <span className="text-[16px] font-medium">{link.name}</span>
                              </div>
                              {isExpanded ? <MdKeyboardArrowDown size={20} /> : <MdKeyboardArrowRight size={20} />}
                           </button>
                        ) : (
                           <Link href={link.url || "#"}>
                              <a
                                 onClick={close}
                                 className={`flex cursor-pointer select-none items-center gap-4 px-4 py-3 rounded-xl transition-all mb-1 ${
                                 isActive ? "bg-[#007bff] text-white shadow-md" : "text-gray-700 hover:bg-gray-50"
                              }`}>
                                 <span className="text-xl">{link.icon}</span>
                                 <span className="text-[16px] font-medium">{link.name}</span>
                              </a>
                           </Link>
                        )}

                        {hasSubLinks && isExpanded && (
                           <div className="ml-12 flex flex-col gap-3 py-1">
                              {link.subLinks?.map((sub) => (
                                 <Link key={sub.url} href={sub.url}>
                                    <a
                                       onClick={close}
                                       className={`block text-[15px] py-1 cursor-pointer select-none transition-colors ${
                                       router.pathname === sub.url ? "text-[#007bff] font-semibold" : "text-gray-600 hover:text-black"
                                    }`}>
                                       {sub.name}
                                    </a>
                                 </Link>
                              ))}
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         </aside>
      </>
   );
};

export default TeacherSidebar;