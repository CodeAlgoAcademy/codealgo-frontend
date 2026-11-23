// components/pricing/ParentPlans.tsx
import React, { FC } from "react";
import PlanCard from "@/components/parents/billing/priceCard";
import { IPlan } from "types/interfaces";
import { TFunction } from "i18next";
import { FREE_TRIAL_ENABLED } from "@/components/utils/subscriptionUtils";

interface ParentPlansProps {
   plans: IPlan[];
   t: TFunction;
   onSelectPlan: (priceId: number) => void;
}

const toDollars = (cents: number) => cents / 100;

const ParentPlans: FC<ParentPlansProps> = ({ plans, t, onSelectPlan }) => {
   return (
      <>
         {plans.map((plan) => {
            const monthlyPrice = plan.prices?.find((p) => p.interval === "MONTH");
            const yearlyPrice = plan.prices?.find((p) => p.interval === "YEAR");

            // Effective monthly rate when paying yearly
            const yearlyMonthlyEquivalent = yearlyPrice
               ? toDollars(yearlyPrice.amount_in_cent) / 12
               : 0;

            return (
               <React.Fragment key={plan.id}>
                  {yearlyPrice && monthlyPrice && (
                     <PlanCard
                        key={yearlyPrice.id}
                        title={t("annualPlanTitle", { planName: plan.name })}
                        price={Number(yearlyMonthlyEquivalent.toFixed(2))}
                        originalPrice={toDollars(monthlyPrice.amount_in_cent)}
                        interval="mo"
                        trialText={FREE_TRIAL_ENABLED ? t("sevenDayFreeTrial") : undefined}
                        billingText={t("billedYearly", {
                           amount: toDollars(yearlyPrice.amount_in_cent),
                        })}
                        showButton
                        buttonText={FREE_TRIAL_ENABLED ? t("tryForFree") : t("getStartedPlan")}
                        onSelect={() => onSelectPlan(yearlyPrice.id)}
                     />
                  )}

                  {monthlyPrice && (
                     <PlanCard
                        key={monthlyPrice.id}
                        title={t("monthlyPlanTitle", { planName: plan.name })}
                        price={toDollars(monthlyPrice.amount_in_cent)}
                        interval="mo"
                        trialText={FREE_TRIAL_ENABLED ? t("sevenDayFreeTrial") : undefined}
                        billingText={t("billedMonthly", {
                           amount: toDollars(monthlyPrice.amount_in_cent),
                        })}
                        showButton
                        buttonText={FREE_TRIAL_ENABLED ? t("tryForFree") : t("getStartedPlan")}
                        onSelect={() => onSelectPlan(monthlyPrice.id)}
                     />
                  )}
               </React.Fragment>
            );
         })}
      </>
   );
};

export default ParentPlans;