import React from "react";
import { useTranslation } from "react-i18next";

interface Guide {
   heading: string;
   intro: string;
   topics: { title: string; body: string }[];
}

// A long-form guide: heading, intro and a grid of numbered cards. The copy
// lives under "guides" in locales/*/pages.json. All styling, including the
// card numbers, comes from the single .guide class in styles/globals.css, so
// the markup stays close to plain text.
const GuideSection = ({ id }: { id: string }) => {
   const { t } = useTranslation("pages");
   const guide = t(`guides.${id}`, { returnObjects: true }) as unknown as Guide;
   if (!guide || !Array.isArray(guide.topics)) return null;

   return (
      <section className="guide">
         <h2>{guide.heading}</h2>
         <p>{guide.intro}</p>
         <ol>
            {guide.topics.map((topic) => (
               <li key={topic.title}>
                  <h3>{topic.title}</h3>
                  <p>{topic.body}</p>
               </li>
            ))}
         </ol>
      </section>
   );
};

export default GuideSection;
