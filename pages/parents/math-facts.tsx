import React from "react";
import ParentLayout from "@/components/layouts/ParentLayout";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import NoChild from "@/components/parents/UI/NoChild";
import ChildMathFacts from "@/components/parents/mathfact/ChildMathFacts";
import { useTranslation } from "react-i18next";

const MathFacts = () => {
   const { children, currentChild } = useSelector((state: RootState) => state.parentChild);
   const { t } = useTranslation("parent");

   if (!children || children?.length === 0) {
      return <NoChild />;
   }

   return (
      <ParentLayout title={t("mathFacts")} showChildrenList>
         {/* Keyed by child so switching children starts from a clean slate. */}
         <ChildMathFacts key={currentChild?.id} childId={currentChild?.id} childName={currentChild?.fullName} />
      </ParentLayout>
   );
};

export default MathFacts;
