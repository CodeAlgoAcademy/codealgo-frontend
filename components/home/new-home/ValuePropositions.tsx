import { useTranslation } from "react-i18next";

const ValuePropositions = () => {
   const { t } = useTranslation("home");

   const features = [
      {
         title: t("standardsAligned"),
         description: t("standardsAlignedDesc"),
         image: "/assets/landing/csta.png",
         accent: "bg-mainColor",
         clip: "clip-path-right-parallelogram",
      },
      {
         title: t("safeAndSecure"),
         description: t("safeAndSecureDesc"),
         image: "/assets/landing/k-8.png",
         accent: "bg-mainGreen",
         clip: "clip-path-center-parallelogram",
      },
      {
         title: t("funAndAccessible"),
         description: t("funAndAccessibleDesc"),
         image: "/assets/landing/mobile.png",
         accent: "bg-mainPink",
         clip: "clip-path-left-parallelogram",
      },
   ];

   return (
      <section className="relative bg-white py-24">
         <div className="container mx-auto px-6">
            <div className="mb-16 flex flex-col gap-4 border-b border-mainBlack/10 pb-10 md:flex-row md:items-end md:justify-between">
               <h2 className="max-w-lg font-tiltWarp text-3xl leading-tight text-mainBlack md:text-4xl">
{t("perfectBalance")}
                </h2>
                <p className="max-w-xs font-workSans text-sm leading-relaxed text-mainBlack/60">
                   {t("perfectBalanceSub")}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
               {features.map((feature) => (
                  <div key={feature.title} className="flex flex-col items-start">
                     <div className="relative mb-6 flex h-48 w-full items-center justify-center overflow-hidden">
                        <div
                           className={`${feature.clip} ${feature.accent} absolute inset-0 opacity-10`}
                           aria-hidden="true"
                        />
                        <img
                           src={feature.image}
                           alt={feature.title}
                           className="relative max-h-full max-w-[70%] object-contain"
                        />
                     </div>

                     <div className={`mb-4 h-1 w-10 rounded-full ${feature.accent}`} />

                     <h3 className="mb-3 font-tiltWarp text-xl text-mainBlack">
                        {feature.title}
                     </h3>

                     <p className="font-workSans leading-relaxed text-mainBlack/60">
                        {feature.description}
                     </p>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default ValuePropositions;