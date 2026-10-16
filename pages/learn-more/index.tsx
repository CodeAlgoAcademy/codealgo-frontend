import Footer, { socials } from "@/components/home/new-home/footer";
import Navbar from "@/components/navbar/home/Navbar";
import Head from "next/head";
import { codingLanguages, fortune10Companies, salaryByRegion, thingsYouCanCreate, whatTheyDo } from "public/learnmore.data";
import React from 'react';
import { FaCode, FaLaptopCode } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function LearnMore() {
  const { t } = useTranslation("pages");
  return (
    <>
      <Head>
        <title>What Is Coding? A Beginner&apos;s Guide | CodeAlgo Academy</title>
        <meta
          name="description"
          content="New to coding? Learn what coding and software engineering are, what you can build, which big companies hire coders, and what beginners earn."
        />
        <link rel="canonical" href="https://codealgoacademy.com/learn-more" />
      </Head>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
  <h1 className="text-4xl font-bold text-gray-800 mb-4 font-thabit">{t("whatsCodingAbout")}</h1>
  <p className="text-xl text-gray-600 font-thabit">{t("heroSubtitle")}</p>
</div>

        {/* What is Coding Section */}
        <section className="mb-16 bg-blue-50 p-6 rounded-lg">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/3 flex justify-center">
              <FaCode className="text-blue-500 text-8xl" />
            </div>
            <div className="md:w-2/3">
              <h2 className="text-3xl text-gray-800 mb-4 font-thabit">{t("codingSimpleTerms")}</h2>
              <p className="text-lg text-gray-700 mb-4 font-thabit">
                {t("codingSimpleTermsDesc")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-bold text-blue-600 mb-2 font-thabit">{t("commonCodingLanguages")}</h3>
                  <ul className="list-disc pl-5">
                    {codingLanguages.map((lang, index) => (
                      <li key={index} className="font-thabit">{lang}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-bold text-blue-600 mb-2 font-thabit">{t("coolThingsYouCanBuild")}</h3>
                  <ul className="list-disc pl-5">
                    {thingsYouCanCreate.map((item, index) => (
                      <li key={index} className="font-thabit">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is Software Engineering Section */}
      <section className="mb-16 bg-green-50 p-6 rounded-lg">
  <div className="flex flex-col md:flex-row-reverse items-center gap-8">
    <div className="md:w-1/3 flex justify-center">
      <FaLaptopCode className="text-green-600 text-8xl" />
    </div>
    <div className="md:w-2/3">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4 font-thabit">
        {t("whatIsSoftwareEngineering")}
      </h2>
      <p className="text-lg text-gray-700 mb-4 font-thabit">
        {t("whatIsSoftwareEngineeringDesc")}
      </p>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="font-bold text-green-600 mb-2 font-thabit">
          {t("differentTypesOfEngineers")}
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li className="font-thabit">{t("frontendEngineers")}</li>
          <li className="font-thabit">{t("backendEngineers")}</li>
          <li className="font-thabit">{t("mobileEngineers")}</li>
          <li className="font-thabit">{t("devopsEngineers")}</li>
          <li className="font-thabit">{t("dataEngineers")}</li>
        </ul>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-bold text-green-600 mb-2 font-thabit">
          {t("whatDoTheyReallyDo")}
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          {whatTheyDo.map((task, index) => (
            <li key={index} className="font-thabit">{task}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
</section>


        {/* Salary Insights Section */}
        <section className="mb-16 bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center font-thabit">{t("bigCompaniesHireCoders")}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
  <tr>
    <th className="py-3 px-4 text-left font-thabit">#</th>
    <th className="py-3 px-4 text-left font-thabit">{t("tableCompany")}</th>
    <th className="py-3 px-4 text-left font-thabit">{t("tableIndustry")}</th>
    <th className="py-3 px-4 text-left font-thabit">{t("startingSalary")}</th>
  </tr>
</thead>
              <tbody className="divide-y divide-gray-200">
                {fortune10Companies.map((company, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{company.rank}</td>
                    <td className="py-3 px-4 font-medium font-thabit">{company.name}</td>
                    <td className="py-3 px-4 font-thabit">{company.industry}</td>
                    <td className="py-3 px-4 font-thabit">{company.salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4 font-thabit">{t("salaryDependsOnJob")}</p>
        </section>
<section className="bg-blue-50 p-6 rounded-lg">
  <div className="flex flex-col md:flex-row items-center gap-8">
    <div className="md:w-1/2">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4 font-thabit">{t("whatBeginnersEarn")}</h2>
      <p className="text-lg text-gray-700 mb-4 font-thabit">
        {t("beginnersEarnDesc")}
      </p>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-bold text-blue-500 mb-2 font-thabit">{t("whatAffectsPay")}</h3>
        <ul className="list-disc pl-5 space-y-2 font-thabit">
          <li>{t("payFactorLocation")}</li>
          <li>{t("payFactorSchooling")}</li>
          <li>{t("payFactorSkills")}</li>
          <li>{t("payFactorCompanyType")}</li>
        </ul>
      </div>
    </div>
    <div className="md:w-1/2">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-center font-thabit">Typical Starting Salaries</h3>
        <div className="space-y-4">
          {salaryByRegion.map((region, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1 font-thabit">
                <span>{region.area}</span>
                <span>{region.salary}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${region.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>

{/* <section className="bg-blue-50 p-6 rounded-lg">
  <div className="flex flex-col md:flex-row items-center gap-8">
    <div className="md:w-1/2">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4 font-thabit">{t("whatBeginnersEarn")}</h2>
      <p className="text-lg text-gray-700 mb-4 font-thabit">
        Even starting out, coding jobs pay very well. What you earn depends on:
      </p>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-bold text-blue-500 mb-2 font-thabit">What Affects Pay</h3>
        <ul className="list-disc pl-5 space-y-2 font-thabit">
          <li><strong>Where you work:</strong> Big tech cities pay the most</li>
          <li><strong>Schooling:</strong> More education can mean higher pay</li>
          <li><strong>Special skills:</strong> Some computer skills earn extra</li>
          <li><strong>Company type:</strong> Big companies often pay more</li>
        </ul>
      </div>
    </div>
    <div className="md:w-1/2">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-center font-thabit">Typical Starting Salaries</h3>
        <div className="space-y-4">
          {salaryByRegion.map((region, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1 font-thabit">
                <span>{region.area}</span>
                <span>{region.salary}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${region.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section> */}
      </div>
      <Footer />
    </>
  );
}
