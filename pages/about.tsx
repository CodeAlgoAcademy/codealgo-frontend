import Head from "next/head"; 
import Header from "@/components/about-us/Header";
import Section from "@/components/about-us/Section";
import Testimonials from "@/components/about-us/Testimonials";
import AOC from "@/components/about-us/aoc";
import Footer from "@/components/home/new-home/footer";
import Navbar from "@/components/navbar/home/Navbar";
import Link from "next/link";
import React from "react";
import { FiTarget } from "react-icons/fi";
import { GiTargetArrows } from "react-icons/gi";
import { CodeBlock, CopyBlock, dracula, androidstudio } from "react-code-blocks";
import Leadership from "../components/about-us/leadership";
import Banner from "@/components/home/new-home/banner";

const AboutUs = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Us | CodeAlgo Academy",
    description:
      "CodeAlgo Academy teaches kids coding through game-based learning. Learn about our mission and team.",
    url: "https://codealgoacademy.com/about",
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
        <title>About Us | CodeAlgo Academy</title>
        <meta name="description" content="CodeAlgo Academy teaches kids coding through game-based learning. Learn about our mission and team." />
        <link rel="canonical" href="https://codealgoacademy.com/about" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </Head>
      <section className="min-h-screen w-full bg-[#FFFFFF] pb-6 font-thabit">
        <Navbar />
        <div>
          <Banner />
          <Header />
          <Leadership />
          <AOC />
        </div>
      </section>

      <Footer />
    </>
  );
};

export default AboutUs;




{/* <Section
                  extraImage={undefined}
                  extraImagePosition={undefined}
                  hasButton={true}
                  order={1}
                  title="At CodeAlgo Academy, we teach your kids how to code, and we mean real coding!"
                  detail=""
                  image="/assets/compiler.png"
                  codeEditor={true}
               />

               <Section
                  codeEditor={undefined}
                  hasButton={false}
                  order={2}
                  title="Technology built upon extensive research and development"
                  detail="An innovative coding platform that uses gamification artificial intelligence to teach children how to code."
                  image="/assets/tech.png"
                  extraImage="/assets/0013_1.png"
                  extraImagePosition="-top-[90px] z-[-1]"
               />
               <Section
                  codeEditor={undefined}
                  hasButton={false}
                  order={1}
                  title="Learning Problem-Solving Skills"
                  detail={[
                     "Learn from coding mistakes and use them as opportunities for growth.",
                     "Use logic and critical thinking to analyze and solve problems.",
                     "Learn to break down larger coding problems into smaller, more manageable pieces.",
                     "Learn to work in groups through numerous projects",
                  ]}
                  image="/assets/children.jpeg"
                  extraImage="/assets/0013_2.png"
                  extraImagePosition="top-[15%] right-[100%] translate-x-[30%] z-[-1]"
               /> */}

                {/* <Testimonials /> */}