import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { SALE } from "constants/promo";

// Sale strip above the navbar on the public pages. "Claim offer" goes to the
// signup page set in constants/promo.ts.
// Styled by the .sale-banner class in styles/globals.css.
const SaleBanner = () => {
   const { t } = useTranslation("home");

   // Public pages are built ahead of time, so the end date is checked in the
   // browser: the banner disappears on its own once the sale is over.
   const [over, setOver] = useState(false);
   useEffect(() => {
      setOver(Date.now() > Date.parse(SALE.endsAt));
   }, []);

   if (over) return null;

   return (
      <div className="sale-banner">
         <span>{t("saleBannerText", { percent: SALE.percentOff })}</span>
         <span>
            {t("saleBannerUseCode")} <strong>{SALE.code}</strong>
         </span>
         <Link href={SALE.claimUrl}>
            <a>{t("saleBannerCta")}</a>
         </Link>
      </div>
   );
};

export default SaleBanner;
