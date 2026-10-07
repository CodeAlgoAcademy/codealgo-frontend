import React from "react";
import { ChevronRight, CheckCircle } from "lucide-react";
import Navbar from "@/components/navbar/home/Navbar";
import Footer from "@/components/about-us/aoc";
import { howToGuides, teacherResources } from "@/components/home/const";
import Link from "next/link";
import { SimpleAccordion } from "@/components/home/accordion";
import { useTranslation } from "react-i18next";
import Head from "next/head";

const TeachersResources = () => {
       const { t } = useTranslation("pages");


       const jsonLd = {
   "@context": "https://schema.org",
   "@type": "WebPage",
   name: "Teacher Resources | CodeAlgo Academy",
   description:
      "Resources, guides, and tools to help educators teach coding and use CodeAlgo Academy effectively in the classroom.",
   url: "https://codealgoacademy.com/teachers-resources",
   isPartOf: {
      "@type": "WebSite",
      name: "CodeAlgo Academy",
      url: "https://codealgoacademy.com",
   },
   audience: {
      "@type": "EducationalAudience",
      educationalRole: "teacher",
   },
};
   
   return (
      <>
       <Head>
   <link
      rel="canonical"
      href="https://codealgoacademy.com/teachers-resources"
   />

   <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
         __html: JSON.stringify(jsonLd),
      }}
   />
</Head>
      <div className="min-h-screen font-thabit">
         <Navbar />

         <section className="bg-background py-16 lg:py-24">
            <div className="container mx-auto px-4 ">
               <div className="flex flex-col items-center gap-12 lg:flex-row">
                  <div className="lg:w-1/2">
                     <h1 className="mb-4 text-3xl font-black text-mainBlack md:text-5xl">STEM resources for your classroom</h1>
                     <p className="tex-lg text-lg text-gray-600">Teaching technology is easier with the right tools.</p>
                  </div>
                  <div className="lg:w-1/2">
                     <div className="relative overflow-hidden rounded-xl">
                        <video controls className="h-auto w-full rounded-3xl object-cover">
                        <source src="https://res.cloudinary.com/dg2vox5g0/video/upload/v1766998742/ad4teacher_keusqf.mp4" type="video/mp4" />
                        Your browser does not support the video.
                        </video>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Getting Started Steps */}
         <section className="bg-white py-10 md:py-20">
            <div>
               <div className="mb-12 text-center">
                  <span className="mb-4 inline-block rounded-full bg-mainColor/10 px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-wide text-mainColor">
                     Quick Start
                  </span>
                  <h2 className="mb-4 text-3xl font-bold text-mainBlack md:text-4xl">Set up your classroom in minutes</h2>
                  <p className="mx-auto max-w-2xl text-lg text-gray-600">
                     Go from sign-up to your first lesson without complicated setup or technical overhead.
                  </p>
               </div>
               <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
                  {[
                     {
                        step: "01",
                        title: "Create Teacher Account",
                        description: "Sign up once to unlock educator tools, lesson plans, and classroom management features.",
                     },
                     {
                        step: "02",
                        title: "Set Up Your Classroom",
                        description:
                           "Set up your classes in minutes, invite students by filling their details, and monitor learning progress from the dashboard.",
                     },
                     {
                        step: "03",
                        title: "Start Teaching",
                        description: "Deliver engaging, hands-on coding lessons that build problem-solving skills and confidence for all learners.",
                     },
                  ].map((item, index) => (
                     <div key={index} className="group relative text-center">
                        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-mainColor text-3xl font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                           {item.step}
                        </div>
                        <h3 className="mb-4 text-2xl font-bold leading-tight text-mainBlack">{item.title}</h3>
                        <p className="leading-relaxed text-gray-600">{item.description}</p>
                        {index < 2 && (
                           <div className="absolute top-10 left-[70%] hidden w-[60%] md:block">
                              <div className="border-t-2 border-dashed border-gray-300"></div>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </section>

         <section className="bg-white py-16 lg:py-24">
            <div className="container mx-auto px-4">
               <div className="mb-12 text-center">
                  <h2 className="mb-4 text-3xl font-bold text-mainBlack md:text-4xl">Why CodeAlgo Matters for Your Students</h2>
                  <p className="text-gray/600 mx-auto max-w-3xl text-lg">
                     CodeAlgo Academy is built to expand access to high-quality coding education and prepare students—especially those
                     underrepresented in tech—for real opportunities beyond the classroom.
                  </p>
               </div>

               <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                  <div className="rounded-2xl border p-6 text-center">
                     <CheckCircle className="mx-auto mb-4 text-mainColor "/>
                     <h3 className="mb-2 text-xl font-bold">Real Programming Skills</h3>
                     <p className="text-gray-600">Hands-on projects that teach real-world coding concepts students can build on.</p>
                  </div>
                  <div className="rounded-2xl border p-6 text-center">
                     <CheckCircle className="mx-auto mb-4 text-mainColor" />
                     <h3 className="mb-2 text-xl font-bold">Confidence & Representation</h3>
                     <p className="text-gray-600">Inclusive learning experiences that help Black and Brown students see themselves in tech.</p>
                  </div>
                  <div className="rounded-2xl border p-6 text-center">
                     <CheckCircle className="mx-auto mb-4 text-mainColor" />
                     <h3 className="mb-2 text-xl font-bold">Career Readiness</h3>
                     <p className="text-gray-600">Pathways to internships, mentorship, and in-demand tech careers for older students.</p>
                  </div>
               </div>
            </div>
         </section>

         <section className="bg-background py-16 lg:py-24">
            <div className="container mx-auto px-4">
               <div className="mb-12 text-center">
                  <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">Teaching resources built for real classrooms</h2>
                  <p className="text-muted-foreground mx-auto max-w-xl text-lg">
                     Everything you need to successfully teach coding in your classroom.
                  </p>
               </div>
               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {teacherResources.map((resource, index) => (
                     <div className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-xl">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mainColor transition group-hover:scale-110">
                           <resource.icon className="h-6 w-6 text-white" />
                        </div>

                        <h3 className="mb-2 text-xl font-bold text-mainBlack">{t(resource.id)}</h3>

                        <p className="mb-4 text-gray-600">{t(`${resource.id}Desc`)}</p>

                        <Link href="/login" className="inline-flex items-center">
                           <span className="inline-flex h-auto cursor-pointer items-center gap-1 p-0 text-mainColor transition-all group-hover:gap-2">
                               {t("explore")}
                              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                           </span>
                        </Link>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         <section className="bg-muted/30 bg-background py-16 lg:py-24">
            <div className="container mx-auto px-4">
               <div className="mb-12 text-center">
                  <h2 className="text-foreground mb-4 text-3xl font-bold md:text-5xl">Your Frequently Asked Questions… Answered!</h2>
                  <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                     Step-by-step instructions for getting the most out of CodeAlgo Academy in your classroom.
                  </p>
               </div>
               <div className="mx-auto max-w-3xl space-y-4">
                  {howToGuides.map((guide, index) => (
                     <SimpleAccordion key={index} guide={guide} index={index} />
                  ))}
               </div>
            </div>
         </section>

         <Footer />
      </div>
      </>
   );
};
export default TeachersResources;
