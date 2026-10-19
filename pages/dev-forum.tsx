import Banner from "@/components/home/new-home/banner";
import Footer from "@/components/home/new-home/footer";
import Navbar from "@/components/navbar/home/Navbar";
import Head from "next/head";
// next/future/image renders a single <img>. The legacy component adds a hidden
// sizer <img alt=""> that audits count as an image missing alt text.
import Image from "next/future/image";
import Link from "next/link";
import { FC } from "react";

const DevForum = () => {
   const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "CodeAlgo Professional Development Program",
      description:
         "Professional development workshops that help educators effectively use CodeAlgo Academy and its coding education tools.",
      url: "https://codealgoacademy.com/dev-forum",
      isPartOf: {
         "@type": "WebSite",
         name: "CodeAlgo Academy",
         url: "https://codealgoacademy.com",
      },
   };

   return (
      <>
         <Head>
            <title>
               Professional Development Program | CodeAlgo Academy
            </title>

            <meta
               name="description"
               content="Explore CodeAlgo Academy's professional development program for educators, including workshops, best practices, quick-start training, and feature updates."
            />

            <link
               rel="canonical"
               href="https://codealgoacademy.com/dev-forum"
            />

            <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{
                  __html: JSON.stringify(jsonLd),
               }}
            />
         </Head>

         <div className="relative overflow-x-hidden bg-white font-thabit">
            <Navbar />
            <Banner />

            <main className="mx-auto mt-5 mb-16 max-w-[1200px] p-6">
               <h1 className="text-center font-thabit text-[2.1rem] font-bold max-md:text-[1.5rem]">
                  CodeAlgo Professional Development Program
               </h1>

               <p className="mx-auto mt-4 mb-12 max-w-[800px] text-center text-[1.4rem] font-light max-md:text-[.87rem]">
                  Our CodeAlgo Professional Development Program empowers
                  educators with the skills and resources they need to elevate
                  their teaching and inspire the next generation of innovators.
               </p>

               <div className="overflow-hidden rounded-3xl">
                  <Image
                     src="/assets/landing/dev-forum.jpg"
                     alt="CodeAlgo professional development program for educators"
                     width={1200}
                     height={600}
                     className="h-auto w-full object-cover object-center"
                  />
               </div>

               <section className="mt-16 rounded-2xl bg-[#f4f6f9] p-8 max-md:p-4">
                  <h2 className="text-center font-thabit text-[2.1rem] font-bold max-md:text-[1.5rem]">
                     About Our Program
                  </h2>

                  <p className="mx-auto mt-2 mb-12 max-w-[800px] text-center text-[1.4rem] font-light max-md:text-[.87rem]">
                     We offer in-person and virtual workshops to optimize the
                     use of CodeAlgo.
                  </p>

                  <div className="grid gap-8 md:grid-cols-2">
                     <SingleForumInfo
                        title="Introduction to CodeAlgo"
                        subtitle="A comprehensive guide to our coding-focused platform: setting up learners, creating courses, managing tasks, analyzing learner progress, and more."
                     />

                     <SingleForumInfo
                        title="Best Practices for Utilizing CodeAlgo"
                        subtitle="Designed for educators experienced with CodeAlgo. Explores instructional strategies for effectively leveraging our coding tools."
                     />

                     <SingleForumInfo
                        title="Quick Start"
                        subtitle="Short on time? Discover the fastest way to begin with CodeAlgo Academy. This course focuses on the essentials and does not cover all of CodeAlgo's advanced features."
                     />

                     <SingleForumInfo
                        title="CodeAlgo Refresher and Feature Updates"
                        subtitle="This session offers a quick overview of our latest features and gives educators the chance to revisit tools and functions where they need extra guidance."
                     />
                  </div>
               </section>

               <section className="mt-16">
                  <h2 className="text-center font-thabit text-[2.1rem] font-bold max-md:text-[1.5rem]">
                     Who the Program Is For
                  </h2>

                  <div className="mt-8 grid gap-8 md:grid-cols-3">
                     <SingleForumInfo
                        title="Classroom Teachers"
                        subtitle="Teachers bringing coding into their classroom for the first time, as well as experienced CodeAlgo users who want to get more out of the platform."
                     />

                     <SingleForumInfo
                        title="School and Program Leaders"
                        subtitle="Administrators and coordinators rolling CodeAlgo out across a school, district, charter network, or after-school program."
                     />

                     <SingleForumInfo
                        title="Technology and Curriculum Staff"
                        subtitle="Staff who look after rostering, devices, and standards alignment, and need to know how CodeAlgo fits into the tools the school already uses."
                     />
                  </div>
               </section>

               <section className="mt-16 rounded-2xl bg-[#f4f6f9] p-8 max-md:p-4">
                  <h2 className="text-center font-thabit text-[2.1rem] font-bold max-md:text-[1.5rem]">
                     What Educators Will Learn
                  </h2>

                  <ul className="mx-auto mt-8 max-w-[800px] list-disc space-y-3 pl-6 text-[1rem] max-md:text-[.9rem]">
                     <li>Set up classes and add students with Clever, Google Classroom, or manual entry.</li>
                     <li>Print student login cards with QR codes so younger students can sign in on their own.</li>
                     <li>Assign lessons and use adaptive learning paths so each student works at their own level and pace.</li>
                     <li>Read progress reports to spot who needs support and who is ready for a new challenge.</li>
                     <li>Connect CodeAlgo lessons to state standards, including TEKS, CCSS, and B.E.S.T.</li>
                     <li>Run CodeAlgo in the browser on the Chromebooks and computers your school already has.</li>
                  </ul>
               </section>

               <section className="mt-16 text-center">
                  <h2 className="font-thabit text-[2.1rem] font-bold max-md:text-[1.5rem]">
                     Bring a Workshop to Your School
                  </h2>

                  <p className="mx-auto mt-4 max-w-[800px] text-[1.1rem] font-light max-md:text-[.9rem]">
                     Workshops run in person or virtually. Pick the session that
                     matches your team&apos;s experience with CodeAlgo, from a first
                     introduction to a refresher on our newest features. To schedule
                     a session or ask about options for your school, get in touch
                     with our team.
                  </p>

                  <Link href="/contact">
                     <a className="mt-6 inline-block rounded-full bg-mainRed px-8 py-3 font-bold text-white">
                        Contact Us
                     </a>
                  </Link>
               </section>
            </main>

            <Footer />
         </div>
      </>
   );
};

interface ForumInfoProps {
   title: string;
   subtitle: string;
}

const SingleForumInfo: FC<ForumInfoProps> = ({ title, subtitle }) => {
   return (
      <article className="rounded-3xl bg-white px-4 py-6">
         <h3 className="font-thabit text-[1.5rem] font-bold max-md:text-[1.2rem]">
            {title}
         </h3>

         <p className="mt-5 text-[.9rem]">
            {subtitle}
         </p>
      </article>
   );
};

export default DevForum;