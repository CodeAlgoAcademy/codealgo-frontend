import React from "react";
import { ChevronRight, CheckCircle } from "lucide-react";
import Footer from "@/components/about-us/aoc";
import { SimpleAccordion } from "@/components/home/accordion";
import { parentResources, howToGuidesParent } from "@/components/home/const";
import Navbar from "@/components/navbar/home/Navbar";
import { useTranslation } from "react-i18next";
import Head from "next/head";


const ParentsResources = () => {
    const { t } = useTranslation("pages");
  const jsonLd = {
   "@context": "https://schema.org",
   "@type": "WebPage",
   name: "Parent Resources | CodeAlgo Academy",
   description:
      "Resources and guidance to help parents support their child's coding education and track their learning journey with CodeAlgo Academy.",
   url: "https://codealgoacademy.com/parents-resources",
   isPartOf: {
      "@type": "WebSite",
      name: "CodeAlgo Academy",
      url: "https://codealgoacademy.com",
   },
   audience: {
      "@type": "PeopleAudience",
      audienceType: "Parents and guardians",
   },
};
  return (
    <>
     <Head>
   <link
      rel="canonical"
      href="https://codealgoacademy.com/parents-resources"
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

      <section className="bg-gray-50 py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <div className="lg:w-1/2">
              <h1 className="mb-4 text-3xl font-black text-gray-900 md:text-5xl">
                Supporting your child's coding journey
              </h1>
              <p className="text-lg text-gray-600">
                Empowering parents with the tools and knowledge to help their children succeed in tech.
              </p>
            </div>
            <div className="lg:w-1/2">
              <div className="relative overflow-hidden rounded-xl">
                <video controls className="h-auto w-full rounded-3xl object-cover">
                  <source src="https://res.cloudinary.com/dg2vox5g0/video/upload/v1766998728/adparentsdashboard_qvnnju.mp4" type="video/mp4" />
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
            <span className="mb-4 inline-block rounded-full bg-mainColor/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-mainColor">
              Quick Start
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Get your child started in minutes
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Simple steps to begin your child's coding adventure with confidence and ease.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Parent Account",
                description: "Sign up to access parental controls, progress tracking, and support resources for your child's learning.",
              },
              {
                step: "02",
                title: "Set Up Child Profile",
                description: "Add your child's profile with age-appropriate settings and choose a learning path that matches their interests.",
              },
              {
                step: "03",
                title: "Start Learning Together",
                description: "Watch your child explore coding through fun, interactive lessons while you monitor their progress from your dashboard.",
              },
            ].map((item, index) => (
              <div key={index} className="group relative text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-mainColor text-3xl font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                  {item.step}
                </div>
                <h3 className="mb-4 text-2xl font-bold leading-tight text-gray-900">{item.title}</h3>
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

      {/* Why It Matters Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Why CodeAlgo Matters for Your Child
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              CodeAlgo Academy provides a safe, engaging environment where children develop critical thinking skills, creativity, and confidence through hands-on coding experiences.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="rounded-2xl border p-6 text-center">
              <CheckCircle className="mx-auto mb-4 text-mainColor" size={48} />
              <h3 className="mb-2 text-xl font-bold">Age-Appropriate Learning</h3>
              <p className="text-gray-600">
                Carefully designed curriculum that grows with your child's abilities and interests.
              </p>
            </div>
            <div className="rounded-2xl border p-6 text-center">
              <CheckCircle className="mx-auto mb-4 text-mainColor" size={48} />
              <h3 className="mb-2 text-xl font-bold">Safe Learning Environment</h3>
              <p className="text-gray-600">
                Robust parental controls and monitored content ensure a secure online experience.
              </p>
            </div>
            <div className="rounded-2xl border p-6 text-center">
              <CheckCircle className="mx-auto mb-4 text-mainColor" size={48} />
              <h3 className="mb-2 text-xl font-bold">Future-Ready Skills</h3>
              <p className="text-gray-600">
                Build problem-solving abilities and computational thinking that prepare kids for tomorrow's world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="bg-gray-50 py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Resources to support your child at home
            </h2>
            <p className="mx-auto max-w-xl text-lg text-gray-600">
              Everything you need to guide, encourage, and celebrate your child's coding journey.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {parentResources.map((resource) => (
  <div key={resource.id} className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-xl">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-mainColor transition group-hover:scale-110">
      <resource.icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="mb-2 text-xl font-bold text-gray-900">{t(resource.id)}</h3>
    <p className="mb-4 text-gray-600">{t(`${resource.id}Desc`)}</p>
    <a href="/login" className="inline-flex items-center">
      <span className="inline-flex h-auto cursor-pointer items-center gap-1 p-0 text-mainColor transition-all group-hover:gap-2">
        {t("explore")}
        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </a>
  </div>
))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-5xl">
              Your Frequently Asked Questions… Answered!
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Quick answers to help you support your child's coding education with confidence.
            </p>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            {howToGuidesParent.map((guide, index) => (
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

export default ParentsResources;