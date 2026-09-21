import Banner from "@/components/home/new-home/banner";
import Footer from "@/components/home/new-home/footer";
import Navbar from "@/components/navbar/home/Navbar";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPricingPlans } from "services/pricingService";
import { toast } from "sonner";
import { RootState } from "store/store";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import DistrictBulkPurchase from "@/components/pricing/DistrictBulkPurchase";
import ParentPlans from "@/components/pricing/ParentPlans";
import PricingShimmer from "@/components/pricing/PricingShimmer";
import PricingTabs from "@/components/pricing/PricingTabs";
import SchoolCard from "@/components/pricing/SchoolCard";

const Pricing = () => {
   const { handlers: pricingHandlers, plans } = useSelector((state: RootState) => state.pricing);
   const dispatch = useDispatch();
   const { push } = useRouter();
   const { t } = useTranslation("pages");

   const [selectedPriceId, setSelectedPriceId] = useState<number | null>(null);
   const [activeCategory, setActiveCategory] = useState<"parents" | "school">("parents");

   useEffect(() => {
      dispatch(getPricingPlans());
   }, []);

   const handleGetStarted = () => {
      toast.success(t("loginToCompletePayment"));
      push(`/login/parent`);
   };


   return (
      <div className="relative font-thabit bg-[#F5FAFF]">
         <Head>
            <title>{t("pricingTitle")}</title>
            <meta name="description" content={t("pricingDescription")} />
         </Head>
         <Navbar />
         <Banner />
         <section className="mt-20 px-6 py-16">
            <div className="mx-auto max-w-[1200px]">
               <h1 className="text-center text-[1.8rem] font-bold text-[#0B2C4A]">
                  {t("choosePlan")}
               </h1>

               <PricingTabs
                  activeCategory={activeCategory}
                  onChange={setActiveCategory}
                  t={t}
               />

               {pricingHandlers.loading ? (
                  <div className="mt-16">
                     <PricingShimmer />
                  </div>
               ) : (
                  <div className="mt-16">
                     <div
                        className={`grid gap-6 mx-auto ${
                           activeCategory === "parents"
                              ? "grid-cols-1 md:grid-cols-2 max-w-[850px]"
                              : "grid-cols-1 max-w-[420px]"
                        }`}
                     >
                        {activeCategory === "parents" && plans.length > 0 && (
   <ParentPlans
      plans={plans}              // 👈 was empty {}
      t={t}
      onSelectPlan={(id) => {
         setSelectedPriceId(id);
         handleGetStarted();
      }}
   />
)}

{activeCategory === "parents" && !pricingHandlers.loading && plans.length === 0 && (
   <p className="col-span-2 text-center text-[1.2rem] text-gray-500">{t("noPlan")}</p>
)}

                        {activeCategory === "school" && <SchoolCard t={t} />}
                     </div>
                  </div>
               )}
            </div>
         </section>

         <DistrictBulkPurchase />
         <Footer />
      </div>
   );
};

export default Pricing;