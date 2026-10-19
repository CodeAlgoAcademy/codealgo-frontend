import Link from "next/link";
import React, { useState } from "react";
import { links } from "./Links";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const NavLinks = () => {
   const [heading, setHeading] = useState("");

   const active = (name: string) => {
      if (heading !== name) {
         setHeading(name);
      } else {
         setHeading("");
      }
   };

   return (
      <>
         {links.map((link, index) => (
            <div key={index}>
               <div className="group px-3 text-left md:cursor-pointer">
                  <p
                     className="group flex items-center justify-between py-7 pr-5 text-base font-semibold opacity-80 hover:opacity-70 md:pr-0"
                     onClick={() => active(link.name)}
                     data-testid="nav-header"
                  >
                     {link.name}
                     <span className="inline text-xl md:hidden">{heading === link.name ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                  </p>
                  {link.subMenu && (
                     <div>
                        <div className="absolute top-20 z-50 hidden hover:md:block group-hover:md:block">
                           <div className="py-3">
                              <div className="absolute left-3 mt-1 h-4 w-4 rotate-45 bg-[#f8f8f8]"></div>
                           </div>
                           <div className="grid grid-cols-1 gap-1 bg-[#f8f8f8] p-1">
                              {link?.sublinks?.map((slink, index) => (
                                 <li className="p-3 text-sm text-gray-600 hover:bg-slate-100" key={index}>
                                    <Link href={slink.link} className="hover:text-primary">
                                       {slink.name}
                                    </Link>
                                 </li>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               <div
                  className={`
                        ${heading === link.name ? "md:hidden" : "hidden"}
                    `}
               >
                  {/* sublinks */}
                  {link?.sublinks?.map((slinks, index) => (
                     <li key={index} className="py-3 pl-14 hover:bg-slate-100">
                        <Link href={slinks.link}>{slinks.name}</Link>
                     </li>
                  ))}
               </div>
            </div>
         ))}
      </>
   );
};

export default NavLinks;
