import React from "react";
import { ChevronRight, Lightbulb } from "lucide-react";

// A native <details> so the answer is in the server-rendered HTML. The old
// version only mounted the answer after a click, which left crawlers (and
// anyone without JS) with a list of questions and no answers.
export const SimpleAccordion = ({ guide }: { guide: { question: string; answer: string }; index?: number }) => {
   return (
      <details className="group rounded-xl border border-gray-200 bg-white px-6 py-4">
         <summary className="flex w-full cursor-pointer list-none items-center justify-between text-left [&::-webkit-details-marker]:hidden">
            <div className="flex items-center gap-3">
               <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
               </div>
               <h3 className="font-semibold text-gray-900">{guide.question}</h3>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-90" />
         </summary>
         <p className="mt-4 pl-11 text-gray-600">{guide.answer}</p>
      </details>
   );
};
