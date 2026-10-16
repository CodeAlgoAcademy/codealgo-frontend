import React from "react";
import Head from "next/head"; 
import { ChevronRight, CheckCircle } from "lucide-react";
import Navbar from "@/components/navbar/home/Navbar";
import Footer from "@/components/about-us/aoc";
import { howToGuides, teacherResources } from "@/components/home/const";
import Link from "next/link";
import { SimpleAccordion } from "@/components/home/accordion";
import { useTranslation } from "react-i18next";

const TeachersResources = () => {
   const { t } = useTranslation("pages");
   const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: t("forEducatorsTitle"),
      description: t("forEducatorsDescription"),
      url: "https://codealgoacademy.com/for-educators",
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
      <div className="min-h-screen font-thabit">
  <Head>
        <title>{t("forEducatorsTitle")}</title>
        <meta name="description" content={t("forEducatorsDescription")} />
        <link rel="canonical" href="https://codealgoacademy.com/for-educators" />
        <script
           type="application/ld+json"
           dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd),
           }}
        />
      </Head>

         <Navbar />

         <section className="bg-background py-16 lg:py-24">
            <div className="container mx-auto px-4 ">
               <div className="flex flex-col items-center gap-12 lg:flex-row">
                  <div className="lg:w-1/2">
                     <h2 className="mb-4 text-3xl font-black text-mainBlack md:text-5xl">{t("stemResourcesForClassroom")}</h2>
                     <p className="tex-lg text-lg text-gray-600">{t("teachingTechnologyEasier")}</p>
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
                     {t("quickStart")}
                  </span>
                  <h2 className="mb-4 text-3xl font-bold text-mainBlack md:text-4xl">{t("setupClassroomInMinutes")}</h2>
                  <p className="mx-auto max-w-2xl text-lg text-gray-600">
                     {t("goFromSignupToLesson")}
                  </p>
               </div>
               <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
                  {[
                     {
                        step: "01",
                        title: t("createTeacherAccount"),
                        description: t("createTeacherAccountDesc"),
                     },
                     {
                        step: "02",
                        title: t("setUpYourClassroom"),
                        description: t("setUpYourClassroomDesc"),
                     },
                     {
                        step: "03",
                        title: t("startTeaching"),
                        description: t("startTeachingDesc"),
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
                  <h2 className="mb-4 text-3xl font-bold text-mainBlack md:text-4xl">{t("whyCodealgoMattersForStudents")}</h2>
                  <p className="text-gray/600 mx-auto max-w-3xl text-lg">
                     {t("whyCodealgoStudentsDesc")}
                  </p>
               </div>

               <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                  <div className="rounded-2xl border p-6 text-center">
                     <CheckCircle className="mx-auto mb-4 text-mainColor "/>
                     <h3 className="mb-2 text-xl font-bold">{t("realProgrammingSkills")}</h3>
                     <p className="text-gray-600">{t("realProgrammingSkillsDesc")}</p>
                  </div>
                  <div className="rounded-2xl border p-6 text-center">
                     <CheckCircle className="mx-auto mb-4 text-mainColor" />
                     <h3 className="mb-2 text-xl font-bold">{t("confidenceAndRepresentation")}</h3>
                     <p className="text-gray-600">{t("confidenceAndRepresentationDesc")}</p>
                  </div>
                  <div className="rounded-2xl border p-6 text-center">
                     <CheckCircle className="mx-auto mb-4 text-mainColor" />
                     <h3 className="mb-2 text-xl font-bold">{t("careerReadiness")}</h3>
                     <p className="text-gray-600">{t("careerReadinessDesc")}</p>
                  </div>
               </div>
            </div>
         </section>

         <section className="bg-background py-16 lg:py-24">
            <div className="container mx-auto px-4">
               <div className="mb-12 text-center">
                  <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">{t("teachingResourcesForClassrooms")}</h2>
                  <p className="text-muted-foreground mx-auto max-w-xl text-lg">
                     {t("everythingYouNeedToTeach")}
                  </p>
               </div>
               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {teacherResources.map((resource, index) => (
                     <div key={index} className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-xl">
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
                  <h2 className="text-foreground mb-4 text-3xl font-bold md:text-5xl">{t("faqTitle")}</h2>
                  <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                     {t("faqEducatorsDesc")}
                  </p>
               </div>
               </div>
         </section>
         <Footer />
      </div>
   );
};
export default TeachersResources;
