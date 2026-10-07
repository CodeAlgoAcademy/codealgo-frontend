import SelectAccountType from "@/components/miscellaneous/selectAccountType";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "store/authSlice";
import Head from "next/head";

export default function SelectUserType() {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Sign Up | CodeAlgo Academy",
      description:
         "Create a CodeAlgo Academy account as a parent, teacher, or student.",
      url: "https://codealgoacademy.com/signup",
      isPartOf: {
         "@type": "WebSite",
         name: "CodeAlgo Academy",
         url: "https://codealgoacademy.com",
      },
   };

   return (
      <>
         <Head>
            <link
               rel="canonical"
               href="https://codealgoacademy.com/signup"
            />
            <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{
                  __html: JSON.stringify(jsonLd),
               }}
            />
         </Head>

         <SelectAccountType />
      </>
   );
}