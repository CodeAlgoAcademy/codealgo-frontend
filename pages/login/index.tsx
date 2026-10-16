import SelectAccountType from "@/components/miscellaneous/selectAccountType";
import AccountTypeGuide from "@/components/miscellaneous/accountTypeGuide";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "store/authSlice";

export default function SelectUserType() {
   const jsonLd = {
   "@context": "https://schema.org",
   "@type": "WebPage",
   name: "Login | CodeAlgo Academy",
   description:
      "Log in to your CodeAlgo Academy account to access your learning dashboard and account features.",
   url: "https://codealgoacademy.com/login",
   isPartOf: {
      "@type": "WebSite",
      name: "CodeAlgo Academy",
      url: "https://codealgoacademy.com",
   },
};
   return (
   <>
 <Head>
   <title>Log In | CodeAlgo Academy</title>
   <meta
      name="description"
      content="Log in to CodeAlgo Academy as a parent, teacher, organization admin, or student. Get help with student login cards, password resets, and account access."
   />
   <link
      rel="canonical"
      href="https://codealgoacademy.com/login"
   />

   <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
         __html: JSON.stringify(jsonLd),
      }}
   />
</Head>
   <SelectAccountType />
   <AccountTypeGuide variant="login" />
   </>
);
}
