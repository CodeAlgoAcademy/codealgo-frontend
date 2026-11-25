import Banner from "@/components/home/new-home/banner";
import Footer from "@/components/home/new-home/footer";
import Navbar from "@/components/navbar/home/Navbar";
import Image from "next/image";
import React, { FC, useState } from "react";
import { BiMinus, BiPlus } from "react-icons/bi";
import { cn } from "utils";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import { faqSections } from "constants/faq";

const FAQ = () => {
   const { t } = useTranslation("pages");
   const jsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      name: "CodeAlgo Academy FAQ",
      url: "https://codealgoacademy.com/faq",
      mainEntity: faqSections.flatMap((section) =>
         section.items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
         }))
      ),
   };
   return (
      <>
   <Head>
   <title>FAQ | CodeAlgo Academy</title>
   <meta
      name="description"
      content="Answers to common questions about CodeAlgo Academy: creating accounts, supported devices, saving progress, subscriptions, the free trial, and child safety."
   />

   <link
      rel="canonical"
      href="https://codealgoacademy.com/faq"
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

         <div className="mx-auto mt-5 mb-12 max-w-[1200px] p-6">
            <h1 className="text-center  font-thabit text-[2.4rem] font-bold">{t("codealgoFaq")}</h1>

            {faqSections.map((section) => (
               <section key={section.title} className="mx-auto mt-10 max-w-[700px] space-y-3">
                  <h2 className="!mb-6 font-thabit text-[1.5rem] font-bold">{section.title}</h2>
                  {section.items.map((item) => (
                     <SingleAccordion key={item.question} question={item.question} answer={item.answer} />
                  ))}
               </section>
            ))}
         </div>

         <Footer />
      </div>
      </>
   );
};

interface AccordionProps {
   question: string;
   answer?: string;
}

const SingleAccordion: FC<AccordionProps> = ({ question, answer }) => {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <article>
         <header className="mb-5 flex items-center justify-between gap-3 px-4">
            <h3 className="flex-1 font-thabit font-bold">
               {question}
            </h3>

            <button
               type="button"
               onClick={() => setIsOpen(!isOpen)}
               aria-expanded={isOpen}
               aria-label={question}
               className="flex h-[30px] w-[30px] max-w-[30px] flex-1 cursor-pointer items-center justify-center rounded-full bg-mainRed text-black"
            >
               {isOpen ? <BiMinus size={25} /> : <BiPlus size={25} />}
            </button>
         </header>

         {/* Animates between 0fr and 1fr grid rows, so the open height comes
             from the content itself and no inline style or measuring is needed. */}
         <div
            className={cn(
               "grid transition-[grid-template-rows] duration-300",
               isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
         >
            <div className="overflow-hidden">
               <p className="px-3 py-1 text-[.9rem]">{answer}</p>
            </div>
         </div>
      </article>
   );
};
export default FAQ;
