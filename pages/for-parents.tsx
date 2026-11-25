import React from "react";
import GuideSection from "@/components/home/GuideSection";
import Head from "next/head"; 
import SpriteIcon from "@/components/UI/SpriteIcon";
import Footer from "@/components/about-us/aoc";
import { SimpleAccordion } from "@/components/home/accordion";
import { parentResources, howToGuidesParent } from "@/components/home/const";
import Navbar from "@/components/navbar/home/Navbar";
import { useTranslation } from "react-i18next";
import ParentResourcesForm from "utils/kit";


const ParentsResources = () => {
  const { t } = useTranslation("pages");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("forParentsTitle"),
    description: t("forParentsDescription"),
    url: "https://codealgoacademy.com/for-parents",
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
    <div className="min-h-screen font-thabit">
        <Head>
        <title>{t("forParentsTitle")}</title>
        <meta name="description" content={t("forParentsDescription")} />
        <link rel="canonical" href="https://codealgoacademy.com/for-parents" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </Head>
      <Navbar />

      <section className="bg-gray-50 py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <div className="lg:w-1/2">
              <h1 className="mb-4 text-3xl font-black text-gray-900 md:text-5xl">
                {t("supportingYourChild")}
              </h1>
              <p className="text-lg text-gray-600">
                {t("empoweringParents")}
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
              {t("quickStart")}
            </span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              {t("getStartedInMinutes")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              {t("simpleStepsToBegin")}
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
            {[
              {
                step: "01",
                title: t("createParentAccount"),
                description: t("createParentAccountDesc"),
              },
              {
                step: "02",
                title: t("setUpChildProfile"),
                description: t("setUpChildProfileDesc"),
              },
              {
                step: "03",
                title: t("startLearningTogether"),
                description: t("startLearningTogetherDesc"),
              },
            ].map((item, index) => (
              <div key={index} className="group relative text-center">
                <div className="step-circle">
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
              {t("whyCodealgoMattersForChild")}
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              {t("whyCodealgoChildDesc")}
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="info-card">
              <SpriteIcon name="check-circle" size={48} className="mx-auto mb-4 text-mainColor" />
              <h3 className="mb-2 text-xl font-bold">{t("ageAppropriateLearning")}</h3>
              <p className="text-gray-600">
                {t("ageAppropriateLearningDesc")}
              </p>
            </div>
            <div className="info-card">
              <SpriteIcon name="check-circle" size={48} className="mx-auto mb-4 text-mainColor" />
              <h3 className="mb-2 text-xl font-bold">{t("safeLearningEnvironment")}</h3>
              <p className="text-gray-600">
                {t("safeLearningEnvironmentDesc")}
              </p>
            </div>
            <div className="info-card">
              <SpriteIcon name="check-circle" size={48} className="mx-auto mb-4 text-mainColor" />
              <h3 className="mb-2 text-xl font-bold">{t("futureReadySkills")}</h3>
              <p className="text-gray-600">
                {t("futureReadySkillsDesc")}
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
              {t("resourcesToSupportChild")}
            </h2>
            <p className="mx-auto max-w-xl text-lg text-gray-600">
              {t("everythingYouNeed")}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {parentResources.map((resource, index) => (
              <div key={index} className="resource-card group">
                <div className="resource-icon">
                  <SpriteIcon name={resource.icon} className="h-6 w-6 text-white" />
                </div>

                <h3 className="mb-2 text-xl font-bold text-gray-900">{t(resource.id)}</h3>

                <p className="mb-4 text-gray-600">{t(`${resource.id}Desc`)}</p>

                <a href="/login" className="inline-flex items-center">
                  <span className="resource-link">
                    {t("explore")}
                    <SpriteIcon name="chevron-right" className="resource-arrow" />
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ParentResourcesForm />

      {/* FAQ Section */}
      <section className="bg-gray-50 py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-5xl">
              {t("faqTitle")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              {t("faqDesc")}
            </p>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            {howToGuidesParent.map((n, index) => (
              <SimpleAccordion key={index} guide={{ question: t(`parentFaqQ${n}`), answer: t(`parentFaqA${n}`) }} index={index} />
            ))}
          </div>
        </div>
      </section>

      <GuideSection id="parents" />

      <Footer />
    </div>
  );
};

export default ParentsResources;
