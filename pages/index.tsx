import type { NextPage } from "next";
import React from "react";
import Head from "next/head";
import Hero from "@/components/home/new-home/hero";
import WhatWeBuilt from "@/components/home/new-home/what-we-built";
import VoiceOfOurCommunity from "@/components/home/new-home/voice-of-our-community";
import GetStarted from "@/components/home/new-home/get-started";
import CodeToSuccess from "@/components/home/new-home/code-to-success";
import AsSeenIs from "@/components/home/new-home/as-seen-in";
import Footer from "@/components/home/new-home/footer";
import { WinterBanner } from "@/components/home/new-home/winter-banner";
import ValuePropositions from "@/components/home/new-home/ValuePropositions";
import Navbar from "@/components/navbar/home/Navbar";
import HomepageContent from "@/components/home/new-home/HomepageContent";
import HomepageExpandedContent from "@/components/home/new-home/HomepageExpandedContent";
import TeachersSection from "@/components/home/new-home/TeachersSection";
import ParentsSection from "@/components/home/new-home/ParentsSection";
import HowItWorks from "@/components/home/new-home/HowItWorks";
import CharterSchoolsSection from "@/components/home/new-home/CharterSchoolsSection";

const Home: NextPage = () => {
   return (
      <div className="relative bg-white" suppressHydrationWarning>
         <Head>
            <title>Kids Coding Classes Online | Learn Programming for Children | CodeAlgo Academy</title>
            <meta
               name="description"
               content="CodeAlgo Academy teaches kids ages 5-14 to code through fun, game-based lessons. Build real projects, track progress, and learn Python & more. Try free today!"
            />
            <meta name="google-site-verification" content="eGB3Olxnsy0kXPD_3EoaI1Fzl7xsQVK4R1WxbBSCrFI" />
         </Head>
         <Navbar />
         <WinterBanner />
         <Hero />
         <CharterSchoolsSection />
         <GetStarted />

         <ValuePropositions />
         <WhatWeBuilt />

         <CodeToSuccess />
         <TeachersSection />
         <ParentsSection />
         <VoiceOfOurCommunity />
         <HomepageContent />
         <HowItWorks />

         <HomepageExpandedContent />
         <AsSeenIs />
         <Footer />
      </div>
   );
};

export default Home;
