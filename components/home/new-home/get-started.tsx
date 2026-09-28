import Button, { CustomButton } from "@/components/UI/Button";
import { useMediaQuery } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { cn } from "utils";
import { useTranslation } from "react-i18next";

const GetStarted = () => {
   const isMobile = useMediaQuery("(max-width:768px)");
   const { push } = useRouter();
   const { t } = useTranslation("home");

   const buttonClassName = cn(
      "!bg-white !text-black !shadow-md absolute bottom-10 left-[40%] max-md:left-[40%] -translate-x-[50%] max-w-fit min-w-fit min-w-[150px] !mx-auto font-thabit font-bold text-[1.1rem] max-md:text-[.9rem] justify-center"
   );

   const toSignUp = () => push("/signup");

   return (
      <section className="overflow-x-hidden bg-white">
         <div className="px-2 pt-12 pb-12">
            <button
               className="mx-auto block cursor-pointer rounded-3xl bg-mainRed px-6 py-2 text-center font-tiltWarp text-[1.5rem] text-white md:text-[1.8rem]"
               onClick={toSignUp}
            >
               {t("signUpToday")}
            </button>
         </div>

         <div className="mt-0 flex h-[300px] items-center justify-center overflow-hidden md:mt-8 md:h-[650px]">
            <article
               className={cn(
                  "relative hidden h-full flex-1 overflow-hidden",
                  "bg-whiteToBlueGradient",
                  "clip-path-right-parallelogram",
                  "md:-mr-24 md:block"
               )}
            >
               <div className="absolute inset-0 flex items-center justify-center p-10 md:p-16">
                  <Image
                     src="/assets/landing/images14.png"
                     alt="Create your CodeAlgo avatar"
                     layout="fill"
                     priority
                     sizes="33vw"
                     className="object-contain"
                  />
               </div>

               <CustomButton onClick={toSignUp} className={buttonClassName} variant="filled" size="medium">
                  {t("createYourAvatar")}
               </CustomButton>
            </article>

            <article
               className={cn(
                  "relative h-full flex-1 overflow-hidden bg-white",
                  "clip-path-center-parallelogram",
                  "max-md:clip-path-right-parallelogram",
                  "md:-mx-8"
               )}
            >
               <Image
                  src="/assets/landing/image12.png"
                  alt="Learn by playing on CodeAlgo"
                  layout="fill"
                  sizes="(max-width: 768px) 100vw, 34vw"
                  className="object-cover object-center"
               />

               <CustomButton onClick={toSignUp} className={buttonClassName} variant="filled" size="medium">
                  {t("learnByPlaying")}
               </CustomButton>
            </article>

            <article className={cn("relative h-full flex-1 overflow-hidden", "clip-path-left-parallelogram", "md:-ml-24")}>
               <Image
                  src="/assets/landing/image13.png"
                  alt="Kids learning to code on CodeAlgo platform"
                  layout="fill"
                  sizes="(max-width: 768px) 100vw, 34vw"
                  className="object-cover object-center"
               />

               <CustomButton onClick={toSignUp} className={buttonClassName} variant="filled" size="medium">
                  {t("codeYourWorld")}
               </CustomButton>
            </article>
         </div>
      </section>
   );
};

export default GetStarted;
