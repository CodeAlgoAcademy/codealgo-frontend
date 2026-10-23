import Head from "next/head";
import Image from "next/image";
import { FC, ReactNode } from "react";
import logo from "../../public/assets/CodeAlgo_Logo.png";

const ActivateShell: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
   <>
      <Head>
         <title>{title} | CodeAlgo</title>
         <meta name="robots" content="noindex" />
      </Head>
      <main className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-10 sm:items-center">
         <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg sm:p-8">
            <div className="mb-6 flex justify-center">
               <Image src={logo} alt="CodeAlgo" width={140} height={48} style={{ objectFit: "contain" }} />
            </div>
            {children}
         </div>
      </main>
   </>
);

export default ActivateShell;
