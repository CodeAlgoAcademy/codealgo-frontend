import Banner from "@/components/home/new-home/banner";
import Footer from "@/components/home/new-home/footer";
import Navbar from "@/components/navbar/home/Navbar";
import { CustomButton } from "@/components/UI/Button";
import Image from "next/image";
import React from "react";
import { BsBagFill, BsPinMapFill } from "react-icons/bs";
import Head from "next/head";
import Link from "next/link";

// The same three steps as the "From learning to real-world experience"
// section on the homepage.
const pathway = [
   {
      title: "Think",
      body: "Students learn to break problems into steps, ask the right questions, and make smart decisions. These are the same skills engineers, scientists, and doctors rely on every day.",
   },
   {
      title: "Code",
      body: "They use that thinking to write real programs and build projects in block coding and Python, getting hands-on practice that prepares them for in-demand careers.",
   },
   {
      title: "Experience",
      body: "Finally, they put those skills to work through internships with companies in the U.S. and around the world, getting a head start on becoming professionals.",
   },
];

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

            <p className="mx-auto mt-4 max-w-[800px] text-center font-thabit text-[1.1rem] font-light max-md:text-[.9rem]">
               CodeAlgo Academy internships give students the chance to put the coding skills they learn on our platform to work with real
               companies. It is the last step on a path that starts the first time a student opens CodeAlgo.
            </p>

            <section className="mt-14 rounded-2xl bg-[#f4f6f9] p-8 font-thabit max-md:p-4">
               <h2 className="text-center text-[2.1rem] font-bold max-md:text-[1.5rem]">From Learning to Real-World Experience</h2>

               <div className="mt-8 grid gap-6 md:grid-cols-3">
                  {pathway.map((step) => (
                     <article key={step.title} className="rounded-3xl bg-white px-4 py-6">
                        <h3 className="text-[1.3rem] font-bold">{step.title}</h3>
                        <p className="mt-3 text-[.9rem]">{step.body}</p>
                     </article>
                  ))}
               </div>
            </section>

            <h2 className="mt-14 text-center font-thabit text-[2.1rem] font-bold max-md:text-[1.5rem]">Internship Opportunities</h2>

            <div className="mt-8 space-y-6">
               <SingleJob />
               <SingleJob />
               <SingleJob />
               <SingleJob />
            </div>

            <section className="mt-14 grid gap-10 font-thabit md:grid-cols-2">
               <div>
                  <h2 className="text-[1.6rem] font-bold max-md:text-[1.3rem]">Who Can Apply</h2>
                  <p className="mt-3 text-[.95rem]">
                     Internships are open to CodeAlgo students who have completed 50 hours of CodeAlgo Python. New to Python? Students can start
                     with block coding to learn the logic of programming, then move on to Python when they are ready.
                  </p>
               </div>

               <div>
                  <h2 className="text-[1.6rem] font-bold max-md:text-[1.3rem]">How to Get Ready</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-[.95rem]">
                     <li>Create a student account, or ask a parent or teacher to set one up for you.</li>
                     <li>Start with block coding if you are new to programming, then move on to Python challenges.</li>
                     <li>Practice regularly. Lessons adapt to your level and your progress is saved, so you can pick up where you left off.</li>
                     <li>Ask a parent or teacher to follow your progress and achievements from their dashboard.</li>
                     <li>Note the projects you build and the problems you solve, so you can talk about them when you apply.</li>
                  </ul>
               </div>
            </section>

            <section className="mt-14 mb-6 text-center font-thabit">
               <h2 className="text-[2.1rem] font-bold max-md:text-[1.5rem]">Questions About Internships?</h2>
               <p className="mx-auto mt-4 max-w-[800px] text-[1.1rem] font-light max-md:text-[.9rem]">
                  Parents, teachers, and students can contact our team to ask about internship openings and eligibility. Companies interested in
                  working with CodeAlgo students are welcome to get in touch too.
               </p>
               <Link href="/contact">
                  <a className="mt-6 inline-block rounded-full bg-mainRed px-8 py-3 font-bold text-white">Contact Us</a>
               </Link>
            </section>
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
