import React, { ReactNode, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { getUserFromLocalStorage, refreshToken } from "utils/getTokens";
import ErrorModal from "../UI/errorModal";
import Preloader from "../UI/preloader";
import { useDispatch, useSelector } from "react-redux";
import { closePreloader } from "../../store/fetchSlice";
import { addUserFromLocalStorage } from "store/authSlice";
import SuccessModal from "../modals/SuccessModal";
import { ILocalStorageItems } from "types/interfaces/localstorage.interface";
import { RootState } from "store/store";
import { getAccessibilityClassName } from "utils";
import { Toaster } from "sonner";
import DictionaryModal from "../modals/DictionaryModal";
import useDictionary from "hooks/useDictionary";

interface Props {
   children?: ReactNode;
}
const Layout = ({ children }: Props) => {
   const dispatch = useDispatch();
   const features = useSelector((state: RootState) => state.accessibility.features);
   const router = useRouter();
   useDictionary();

   useEffect(() => {
      const token = typeof window !== "undefined" && JSON.parse(localStorage.getItem(ILocalStorageItems.token) as string);

      const unrestricted = [
         "/",
         "/404",
         "/login/teacher",
         "/login/parent",
         "/login/organizer",
         "/login",
         "/signup",
         "/coming-soon",
         "/signup/teacher",
         "/signup/student",
         "/signup/parent",
         "/signup/organizer",
         "/about-us",
         "/contact",
         "/privacy-policy",
      ];

      if (
         !token &&
         !unrestricted.includes(router.pathname) &&
         !router.pathname.includes("/verify-email") &&
         !router.pathname.includes("/change-password") &&
         !router.pathname.includes("/press")
      ) {
         // router.push("/login");
      }
   }, []);

   useEffect(() => {
      if (typeof window !== "undefined") {
         const user = getUserFromLocalStorage();
         dispatch(addUserFromLocalStorage(user));
      }
   }, []);

   return (
      <GoogleOAuthProvider clientId={"354436342116-6kjbapf9ar5ad4rkho0hen2jndlcagff.apps.googleusercontent.com"}>
         <Script
            src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
            strategy="lazyOnload"
         />
         <div className={getAccessibilityClassName(features)}>
            <Head>
               <title>CodeAlgo Academy</title>
            </Head>
            <main>{children}</main>
            <Toaster />
            <SuccessModal />
            <ErrorModal />
            <Preloader />
            <DictionaryModal />
         </div>
      </GoogleOAuthProvider>
   );
};

export default Layout;
