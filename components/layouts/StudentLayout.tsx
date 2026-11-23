import React, { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import UserMenu from "../UI/UserMenu";
import LanguageSwitcher from "../UI/LanguageSwitcher";
import { getUserFromLocalStorage } from "utils/getTokens";
import { STUDENT_APP_URL } from "utils/loginRouting";

/**
 * Students live in the game, so the site only has billing for them. This is
 * the bare frame around it: logo, back to the game, language and account.
 */
const StudentLayout = ({ children }: { children?: ReactNode }) => {
   const router = useRouter();
   const { t } = useTranslation("parent");
   const [ready, setReady] = useState(false);

   useEffect(() => {
      const user = getUserFromLocalStorage();
      if (!user?.is_student) {
         router.replace(`/login/student?redirect=${encodeURIComponent(router.asPath)}`);
         return;
      }
      setReady(true);
   }, [router]);

   return (
      <main className="min-h-screen w-full bg-white">
         <nav className="sticky top-0 z-[40] flex w-full items-center justify-between gap-2 border-b bg-white px-4 py-4 sm:px-6">
            <div className="flex items-center gap-4">
               <Link href="/">
                  <a>
                     <Image src="/assets/CodeAlgo_Logo.png" alt="logo" width={90} height={45} className="cursor-pointer" />
                  </a>
               </Link>
               <span className="hidden text-lg font-semibold text-gray-700 sm:inline">{t("billing")}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
               <a href={STUDENT_APP_URL} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {t("backToGame")}
               </a>
               <LanguageSwitcher variant="sidebar" />
               <UserMenu variant="card" />
            </div>
         </nav>
         <div className="mx-auto max-w-6xl overflow-x-auto bg-[#ecedf3] p-4 md:m-4 md:rounded-[30px] md:p-8 lg:mx-auto">{ready && children}</div>
      </main>
   );
};

export default StudentLayout;
