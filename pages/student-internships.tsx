import Banner from "@/components/home/new-home/banner";
import Footer from "@/components/home/new-home/footer";
import Navbar from "@/components/navbar/home/Navbar";
import { CustomButton } from "@/components/UI/Button";
import Image from "next/image";
import React from "react";
import { BsBagFill, BsPinMapFill } from "react-icons/bs";
import Head from "next/head";

const StudentInternships = () => {
   // Plain WebPage on purpose: the job cards below are placeholders, and
   // JobPosting markup must only describe real, open positions.
   const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Student Internships | CodeAlgo Academy",
      description:
         "Real-world coding internship opportunities for student developers. Build your portfolio and gain experience with CodeAlgo Academy.",
      url: "https://codealgoacademy.com/student-internships",
      isPartOf: {
         "@type": "WebSite",
         name: "CodeAlgo Academy",
         url: "https://codealgoacademy.com",
      },
   };
   return (
      <div className="relative overflow-x-hidden bg-white">
         <Head>
  <title>Student Internships | CodeAlgo Academy</title>
  <meta name="description" content="Real-world coding internship opportunities for student developers. Build your portfolio and gain experience with CodeAlgo Academy." />
  <link rel="canonical" href="https://codealgoacademy.com/student-internships" />
  <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
     }}
  />
</Head>
         <Navbar />
         <Banner />

         <div className="mx-auto max-w-[1100px] p-6">
            <h1 className="text-center  font-thabit text-[2.1rem] font-bold max-md:text-[1.5rem]">Show the world what you can do!</h1>

            <div className="mt-10 space-y-6">
               <SingleJob />
               <SingleJob />
               <SingleJob />
               <SingleJob />
            </div>
         </div>

         <Footer />
      </div>
   );
};

const SingleJob = () => {
   return (
      <article className="flex items-center gap-x-3 gap-y-8 rounded-xl border border-mainBlack py-3 px-8 font-thabit max-md:flex-col max-md:py-8">
         <div>
            <p className="w-full rounded-[10px] bg-slate-300 p-2 text-[.8rem] font-semibold md:max-w-fit">50 Hours of CodeAlgo</p>

            <p className="mt-6">Software Engineer Internship Google Kansas City, MO</p>
            <div className="flex items-center gap-4">
               <p className="flex items-center gap-2 text-[.8rem]">
                  <span>
                     <BsBagFill className="text-gray-500" />
                  </span>
                  Google
               </p>
               <p className="flex items-center gap-2 text-[.8rem]">
                  <span>
                     <BsPinMapFill className="text-gray-500" />
                  </span>
                  Kansas City, MO
               </p>
            </div>

            <p className="mt-10 text-[.8rem]">
               50 Hours of CodeAlgo Now accepting online applications for immediate internship openings! Applicants must have completed 50 hours of
               CodeAlgo Python.
            </p>
         </div>

         <div className="min-w-fit max-w-fit max-md:min-w-full max-md:max-w-full">
            <CustomButton variant="filled" className="max-w-fit py-3 text-[.75rem] text-mainBlack max-md:w-full max-md:max-w-full" fullWidth>
               {"View Salary & More Info"}
            </CustomButton>
         </div>
      </article>
   );
};

export default StudentInternships;
