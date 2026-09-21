import React from "react";

const PricingShimmer = () => {
   return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-[1150px] mx-auto">
         {[null, null, null].map((_, index) => (
            <div
               key={index}
               className="h-[360px] animate-pulse rounded-2xl bg-gray-200"
            ></div>
         ))}
      </div>
   );
};

export default PricingShimmer;