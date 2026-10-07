import React from "react";
import Head from "next/head";
import Navbar from "@/components/navbar/home/Navbar";
import Footer from "@/components/home/new-home/footer";
import { useTranslation } from "react-i18next";

const CaseStudies = () => {
  const { t } = useTranslation("pages");
  const { t: tp } = useTranslation("press");

  const PILLAR_TAGS = {
    college: { label: tp("caseStudyData.pillarCollege"), color: "bg-blue-200 text-blue-900" },
    workforce: { label: tp("caseStudyData.pillarWorkforce"), color: "bg-emerald-200 text-emerald-900" },
    economic: { label: tp("caseStudyData.pillarEconomic"), color: "bg-amber-200 text-amber-900" },
  };

  type PillarKey = keyof typeof PILLAR_TAGS;

  interface CaseStudyCardProps {
    eyebrow: string;
    title: string;
    pillars: PillarKey[];
    before: string;
    intervention: string;
    after: string;
  }

  const CaseStudyCard = ({
    eyebrow, title, pillars, before, intervention, after,
  }: CaseStudyCardProps) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <p className="text-sm text-gray-500 font-semibold mb-1">{eyebrow}</p>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {pillars.map((p) => (
          <span key={p} className={`text-xs font-bold px-3 py-1 rounded-full ${PILLAR_TAGS[p].color}`}>
            {PILLAR_TAGS[p].label}
          </span>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { heading: t("theChallenge"), body: before, border: "border-red-500" },
          { heading: t("whatCodeAlgoDid"), body: intervention, border: "border-blue-600" },
          { heading: t("whatChanged"), body: after, border: "border-emerald-600" },
        ].map(({ heading, body, border }) => (
          <div key={heading} className={`border-l-4 ${border} bg-gray-50 pl-4 py-3 pr-3 rounded-r-lg`}>
            <p className="text-xs font-extrabold uppercase tracking-wide text-gray-400 mb-1">{heading}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const iReadyRows = [
    {
      bg: "bg-white",
      third: { n: 6, pct: "40.0%" },
      fourth: { n: 10, pct: "62.5%" },
      fifth: { n: 1, pct: "6.25%" },
      sixth: { n: 7, pct: "41.2%" },
      totals: { n: 24, pct: "36.9%" },
    },
    {
      bg: "bg-green-100",
      third: { n: 10, pct: "66.7%" },
      fourth: { n: 12, pct: "75.0%" },
      fifth: { n: 3, pct: "18.75%" },
      sixth: { n: 11, pct: "64.7%" },
      totals: { n: 36, pct: "55.4%" },
    },
    {
      bg: "bg-orange-100",
      third: { n: 15, pct: "100.0%" },
      fourth: { n: 16, pct: "94.1%" },
      fifth: { n: 13, pct: "81.25%" },
      sixth: { n: 16, pct: "94.1%" },
      totals: { n: 60, pct: "92.3%" },
    },
  ];

  const caseStudies: CaseStudyCardProps[] = [
    {
      eyebrow: tp("caseStudyData.cs1Eyebrow"),
      title: tp("caseStudyData.cs1Title"),
      pillars: ["college"],
      before: tp("caseStudyData.cs1Before"),
      intervention: tp("caseStudyData.cs1Intervention"),
      after: tp("caseStudyData.cs1After"),
    },
    {
      eyebrow: tp("caseStudyData.cs2Eyebrow"),
      title: tp("caseStudyData.cs2Title"),
      pillars: ["college", "workforce"],
      before: tp("caseStudyData.cs2Before"),
      intervention: tp("caseStudyData.cs2Intervention"),
      after: tp("caseStudyData.cs2After"),
    },
  ];

  interface StatCardProps {
    value: string;
    label: string;
    source: string;
    isLast?: boolean;
  }

  const StatCard = ({ value, label, source, isLast }: StatCardProps) => (
    <div
      className={`flex flex-col justify-between px-8 py-8 ${
        !isLast ? "border-b sm:border-b-0 sm:border-r border-gray-200" : ""
      }`}
    >
      <div>
        <p className="text-5xl sm:text-6xl font-black text-mainColor leading-none mb-4">
          {value}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed font-medium">{label}</p>
      </div>
      <p className="mt-6 text-xs text-gray-400 font-medium border-t border-gray-100 pt-4">
        {tp("caseStudyData.sourceLabel")}: {source}
      </p>
    </div>
  );

  const jsonLd = {
   "@context": "https://schema.org",
   "@type": "CollectionPage",
   name: "Case Studies | CodeAlgo Academy",
   description:
      "Explore CodeAlgo Academy case studies and measurable outcomes in coding education, mathematics, college readiness, and workforce development.",
   url: "https://codealgoacademy.com/case-studies",
   isPartOf: {
      "@type": "WebSite",
      name: "CodeAlgo Academy",
      url: "https://codealgoacademy.com",
   },
   about: {
      "@type": "EducationalOrganization",
      name: "CodeAlgo Academy",
      url: "https://codealgoacademy.com",
   },
};

  return (
    <>
  <Head>
   <title>{t("caseStudiesTitle")}</title>

   <meta
      name="description"
      content={t("caseStudiesDescription")}
   />

   <link
      rel="canonical"
      href="https://codealgoacademy.com/case-studies"
   />

   <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
         __html: JSON.stringify(jsonLd),
      }}
   />
</Head>

      <main className="bg-white min-h-screen font-thabit">
        <Navbar />

        {/* Hero */}
        <section className="bg-mainBlack py-14 px-4 sm:px-6 text-center">
          <p className="text-base font-bold uppercase tracking-widest text-amber-400 mb-3">
            {t("equitableEconomicMobility")}
          </p>
          <h1 className="text-2xl md:text-5xl font-extrabold text-white mb-4">
            {t("realImpactMeasurableChange")}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
            {t("caseStudiesHeroDesc")}
          </p>
          <div className="mt-10 mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
            {[
              { value: "3%", label: t("keyPillars") },
              { value: "Math & College", label: t("mathAndCollege") },
              { value: "Internships", label: t("internshipsPathway") },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-amber-400">{value}</p>
                <p className="text-xs text-gray-300 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-white border-y border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3">
            <StatCard
              value="41,928+"
              label={t("codingProblemsSolved")}
              source={t("platformData")}
            />
            <StatCard
              value="70%+"
              label={t("mathGrowthDesc")}
              source={t("partnerSchoolOutcomes")}
            />
            <StatCard
              value="800+"
              label={t("collegeTrackStudents")}
              source={t("programRecords")}
              isLast
            />
          </div>
        </section>

        {/* Case Studies */}
        <section className="max-w-4xl mx-auto px-6 py-16 space-y-10">
          {caseStudies.map((cs) => (
            <CaseStudyCard key={cs.title} {...cs} />
          ))}

          {/* iReady Growth Data */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-200 text-blue-900">
                {t("partnerSchoolData")}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("iReadyGrowthData")}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-2xl">
              {t("iReadyDescription")}
            </p>

            {/* Table — matches exact iReady layout */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300 border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-800">
                    <th colSpan={2} className="text-center px-4 py-2 font-bold border border-gray-300">{tp("caseStudyData.tableThird")}</th>
                    <th colSpan={2} className="text-center px-4 py-2 font-bold border border-gray-300">{tp("caseStudyData.tableFourth")}</th>
                    <th colSpan={2} className="text-center px-4 py-2 font-bold border border-gray-300">{tp("caseStudyData.tableFifth")}</th>
                    <th colSpan={2} className="text-center px-4 py-2 font-bold border border-gray-300">{tp("caseStudyData.tableSixth")}</th>
                    <th colSpan={2} className="text-center px-4 py-2 font-bold border border-gray-300 bg-gray-300">{tp("caseStudyData.tableTotals")}</th>
                  </tr>
                </thead>
                <tbody>
                  {iReadyRows.map((row, i) => (
                    <tr key={i} className={row.bg}>
                      <td className="px-3 py-2 text-center border border-gray-300 font-medium">{row.third.n}</td>
                      <td className="px-3 py-2 text-center border border-gray-300 font-semibold">{row.third.pct}</td>
                      <td className="px-3 py-2 text-center border border-gray-300 font-medium">{row.fourth.n}</td>
                      <td className="px-3 py-2 text-center border border-gray-300 font-semibold">{row.fourth.pct}</td>
                      <td className="px-3 py-2 text-center border border-gray-300 font-medium">{row.fifth.n}</td>
                      <td className="px-3 py-2 text-center border border-gray-300 font-semibold">{row.fifth.pct}</td>
                      <td className="px-3 py-2 text-center border border-gray-300 font-medium">{row.sixth.n}</td>
                      <td className="px-3 py-2 text-center border border-gray-300 font-semibold">{row.sixth.pct}</td>
                      <td className="px-3 py-2 text-center border border-gray-300 font-medium bg-gray-50">{row.totals.n}</td>
                      <td className="px-3 py-2 text-center border border-gray-300 font-bold bg-gray-50">{row.totals.pct}</td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-white">
                    <td className="px-3 py-2 text-center border border-gray-300 font-bold">15</td>
                    <td className="px-3 py-2 border border-gray-300" />
                    <td className="px-3 py-2 text-center border border-gray-300 font-bold">17</td>
                    <td className="px-3 py-2 border border-gray-300" />
                    <td className="px-3 py-2 text-center border border-gray-300 font-bold">16</td>
                    <td className="px-3 py-2 border border-gray-300" />
                    <td className="px-3 py-2 text-center border border-gray-300 font-bold">17</td>
                    <td className="px-3 py-2 border border-gray-300" />
                    <td className="px-3 py-2 text-center border border-gray-300 font-bold bg-gray-50">65</td>
                    <td className="px-3 py-2 border border-gray-300 bg-gray-50" />
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-4">{t("iReadySource")}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-200 text-amber-900">
                {t("moreThanCoding")}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {t("mathTransformation")}
            </h2>
            <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/urRhcvGxbFU"
                title="More Than Coding: The Math Transformation We Didn't Expect"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* YouTube embed */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-200 text-emerald-900">
                {t("realWorldLearning")}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("clientProjectSimulation")}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {t("clientProjectDesc")}
            </p>
            <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/sETsh94bcfk"
                title="Real-World Learning: Inside a Client Project Simulation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* Economic case */}
        <section className="bg-mainBlack py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm font-extrabold uppercase tracking-widest text-amber-400 mb-2">
              {t("economicCase")}
            </p>
            <h2 className="text-3xl font-extrabold text-white mb-8">
              {t("codealgoGrowthMeaning")}
            </h2>

            <div className="bg-white rounded-2xl border border-gray-200 p-7 mb-8">
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                {t("generationalMobility")}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {t("generationalMobilityDesc")}
              </p>
            </div>

            <div className="bg-mainColor rounded-2xl p-8">
              <p className="text-xl font-extrabold text-white mb-2">{t("returnOnInvestment")}</p>
              <p className="text-gray-100 leading-relaxed">
                {t("returnOnInvestmentDesc")}
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default CaseStudies;
