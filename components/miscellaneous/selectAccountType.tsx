import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { BiHome } from "react-icons/bi";
import { useTranslation } from "react-i18next";

export default function SelectAccountType() {
   const slug = useRouter();
   const isLoginPage = slug.pathname.includes("/login");
   const isSignupPage = slug.pathname.includes("/signup");
   const { t } = useTranslation("auth");
   const { t: tCommon } = useTranslation("common");
   
   // Calculate the number of items to determine grid layout
   const itemCount = isLoginPage ? 4 : 3;

   return (
      <div className="">
         <div className="px-[1rem] pt-[1rem]  text-[1.8rem] text-mainRed md:absolute md:top-[2.4rem] md:left-[2rem] md:px-0 md:py-0">
            <Link href={"/"}>
               <BiHome className="cursor-pointer" />
            </Link>
         </div>

          <h1 className="mt-[2rem] text-center text-xl font-bold text-mainRed md:mt-[2rem] md:text-3xl">
   {t("whoAreYou")}
</h1>

<p className="mx-auto mt-3 max-w-2xl px-4 text-center text-sm text-gray-600 md:text-base">
   Choose the account type that best describes you to get started with CodeAlgo Academy.
</p>

<div
   className={`mx-6 mt-[2rem] grid items-center justify-center gap-y-6 md:mt-[7rem] md:gap-x-[5rem]
      ${
         itemCount === 4
            ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3"
      }`}
>
            {/* Admin - Only show on login page */}
            {isLoginPage && (
               <Link href="/login/organizer">
                  <div className="transition duration-300 ease-out hover:scale-110 hover:text-mainRed">
                     <div className="mx-auto max-h-[200px] max-w-[200px] md:max-h-fit md:max-w-fit">
                        <Image src="/assets/admin_illustration.png" alt="organizer" height="225" width="225" />
                     </div>
                     <h2
                        data-testid="accountType"
                        className="text-black-500 mt-[.4rem] cursor-pointer text-center text-[1.3rem] font-[500] md:mt-[2rem] md:text-3xl md:font-bold"
                     >
                         {t("admin")}
                     </h2>
                  </div>
               </Link>
            )}

            <Link href={isSignupPage ? "/signup/parent" : "/login/parent"}>
               <div className="transition duration-300 ease-out hover:scale-110 hover:text-mainRed">
                  <div className="mx-auto max-h-[200px] max-w-[200px] md:max-h-fit md:max-w-fit">
                     <Image src="/assets/parents.png" alt="parent" height="225" width="225" />
                  </div>
                  <h2
                     data-testid="accountType"
                     className="text-black-500 mt-[.4rem] cursor-pointer text-center text-[1.3rem] font-[500] md:mt-[2rem] md:text-3xl md:font-bold"
                  >
                      {t("guardian")}
                  </h2>
               </div>
            </Link>
            
            <Link href={isSignupPage ? "/signup/teacher" : "/login/teacher"}>
               <div className="transition duration-300 ease-out hover:scale-110 hover:text-mainRed">
                  <div className="mx-auto max-h-[200px] max-w-[200px] md:max-h-fit md:max-w-fit">
                     <Image src="/assets/teacher.png" alt="parent" height="225" width="225" />
                  </div>
                  <h2
                     data-testid="accountType"
                     className="text-black-500 mt-[.4rem] cursor-pointer text-center text-[1.3rem] font-[500] md:mt-[2rem] md:text-3xl md:font-bold"
                  >
                     {tCommon("teacher")}
                  </h2>
               </div>
            </Link> 

            <a rel="noopener noreferrer" href={isLoginPage ? "https://play.codealgoacademy.com" : "/signup/student"}>
               <div className="transition duration-300 ease-out hover:scale-110 hover:text-mainRed">
                  <div className="mx-auto max-h-[200px] max-w-[200px] md:max-h-fit md:max-w-fit">
                     <Image src="/assets/students.png" alt="parent" height="225" width="225" />
                  </div>
                  <h2
                     data-testid="accountType"
                     className="text-black-500 mt-[.4rem] cursor-pointer text-center text-[1.3rem] font-[500] md:mt-[2rem] md:text-3xl md:font-bold"
                  >
                     {tCommon("student")}
                  </h2>
               </div>
            </a>
         </div>
      </div>
   );
}