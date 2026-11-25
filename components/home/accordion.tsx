import React from "react";
import SpriteIcon from "@/components/UI/SpriteIcon";

// A native <details> so the answer is in the server-rendered HTML. The old
// version only mounted the answer after a click, which left crawlers (and
// anyone without JS) with a list of questions and no answers.
// The faq-* classes live in styles/globals.css.
export const SimpleAccordion = ({ guide }: { guide: { question: string; answer: string }; index?: number }) => {
   return (
      <details className="faq-item group">
         <summary className="faq-summary">
            <h3 className="faq-question">
               <span className="faq-bulb">
                  <SpriteIcon name="lightbulb" className="h-4 w-4 text-blue-600" />
               </span>
               {guide.question}
            </h3>
            <SpriteIcon name="chevron-right" className="faq-chevron" />
         </summary>
         <p className="faq-answer">{guide.answer}</p>
      </details>
   );
};
