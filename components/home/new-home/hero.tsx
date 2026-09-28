import Image from "next/image";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const Hero = () => {
   const { push } = useRouter();
   const features = useSelector((state: RootState) => state.accessibility.features);
   const { t } = useTranslation("home");

   const animationsPaused = useMemo(() => features["pause animations"], [features]);
   const floatStyle: React.CSSProperties = {
      animationPlayState: animationsPaused ? "paused" : "running",
   };

   const toSignUp = () => push("/signup");
   const toPricing = () => push("/pricing");

   return (
      <header className="relative isolate overflow-hidden bg-white">
         <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-10">
            <div className="flex flex-col-reverse items-center gap-12 lg:flex-row lg:justify-center lg:gap-16">
               {/* Left Column: Text & Buttons */}
               <div className="w-full max-w-lg lg:w-full">
                  <h1 className="mb-3 text-3xl font-bold leading-[1.1] text-gray-900 sm:text-4xl md:text-5xl">{t("TheroTitle")}</h1>
                  <h2 className="mb-2 text-xl font-bold leading-[1.1] text-gray-900 sm:text-2xl md:text-xl">{t("TheroTitle2")}</h2>

                  <p className="mb-2 text-lg text-gray-600">{t("TheroDescription")}</p>
                  <p className="relative mb-8 inline-block text-lg text-gray-600">
                     {t("TheroFreeLine")}
                     <svg
                        className="absolute -bottom-2 left-0 h-2 w-full text-mainRed"
                        viewBox="0 0 200 8"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                     >
                        <path d="M0 5 Q 50 0, 100 4 T 200 3" stroke="currentColor" strokeWidth="3" fill="none" />
                     </svg>
                  </p>

                  <div className="flex w-full max-w-sm flex-col gap-4">
                     <button
                        onClick={toSignUp}
                        className="w-full rounded-xl bg-mainRed px-8 py-4 text-base font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                     >
                        {t("teachersSignUpFree")}
                     </button>
                     <button
                        onClick={toPricing}
                        className="w-full rounded-xl border border-mainRed bg-[#f3dad9] px-8 py-4 text-base font-bold text-[#0F3D5C] transition-colors hover:bg-[#DCE9F3]"
                     >
                        {t("parentsExplorePlans")}
                     </button>
                  </div>
               </div>

               {/* Right Hero (Fixed Layout) */}
             <div className="relative mx-auto flex min-h-[460px] w-full items-center justify-center lg:mt-0">
   <Image
      src="/assets/landing/heroshaped.avif"
      alt=""
      layout="fill"
      priority
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 select-none object-contain"
   />

   <div className="relative w-[95%] max-w-[550px]">
      <div className="relative z-10 aspect-video w-full overflow-hidden rounded-lg border-[8px] border-black bg-black shadow-2xl sm:border-[10px]">
         <video
            src="/assets/landing/hero11.mp4"
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
         />
      </div>

      <div
         style={floatStyle}
         className="absolute -left-8 -top-20 z-20 sm:-left-16 sm:-top-16"
      >
         <Image
            src="/assets/landing/images16.png"
            alt={t("heroAltMath")}
            width={180}
            height={180}
            className="object-contain drop-shadow-lg"
         />
      </div>

      <div
         style={floatStyle}
         className="absolute -right-10 -top-10 z-20 sm:-right-14 sm:-top-12"
      >
         <Image
            src="/assets/landing/image18.png"
            alt={t("heroAltEla")}
            width={180}
            height={180}
            className="object-contain drop-shadow-lg"
         />
      </div>

      <div
         style={floatStyle}
         className="absolute left-1/2 top-full z-20 -translate-x-1/2 -translate-y-6"
      >
         <Image
            src="/assets/landing/image15.png"
            alt={t("heroAltCoppa")}
            width={180}
            height={180}
            className="object-contain drop-shadow-md"
         />
      </div>
   </div>
</div>
            </div>
         </div>

         <style jsx>{`
            @keyframes float {
               0%,
               100% {
                  transform: translateY(0);
               }
               50% {
                  transform: translateY(-8px);
               }
            }
            .animate-float {
               animation: float 4s ease-in-out infinite;
            }
            .animate-float-slow {
               animation: float 5s ease-in-out infinite;
            }
            .animate-float-slower {
               animation: float 6s ease-in-out infinite;
            }
            @media (prefers-reduced-motion: reduce) {
               .animate-float,
               .animate-float-slow,
               .animate-float-slower {
                  animation: none !important;
                  transform: none !important;
               }
            }
         `}</style>
      </header>
   );
};

export default Hero;
