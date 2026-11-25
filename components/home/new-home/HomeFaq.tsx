import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { faqSections } from "constants/faq";
import { howToGuides, howToGuidesParent } from "@/components/home/const";

// The site's FAQ, on the homepage: the questions from /faq, then the parent
// and teacher questions from the resources pages. Each answer is a native
// <details>, so it is in the server-rendered HTML but collapsed until a visitor
// opens it. All the styling comes from the one .home-faq class in
// styles/globals.css.
const HomeFaq = () => {
   const { t } = useTranslation("home");
   const { t: tPages } = useTranslation("pages");

   const groups = [
      ...faqSections,
      {
         title: t("homeFaqParents"),
         items: howToGuidesParent.map((n) => ({ question: tPages(`parentFaqQ${n}`), answer: tPages(`parentFaqA${n}`) })),
      },
      {
         title: t("homeFaqTeachers"),
         items: howToGuides.map((n) => ({ question: tPages(`teacherFaqQ${n}`), answer: tPages(`teacherFaqA${n}`) })),
      },
   ];

   return (
      <section className="home-faq">
         <h2>{t("homeFaqHeading")}</h2>
         <p>{t("homeFaqIntro")}</p>
         <div>
            {groups.map((group) => (
               <React.Fragment key={group.title}>
                  <h3>{group.title}</h3>
                  {group.items.map((item) => (
                     <details key={item.question}>
                        <summary>{item.question}</summary>
                        <p>{item.answer}</p>
                     </details>
                  ))}
               </React.Fragment>
            ))}
         </div>
         <Link href="/faq">
            <a>{t("homeFaqMore")}</a>
         </Link>
      </section>
   );
};

export default HomeFaq;
