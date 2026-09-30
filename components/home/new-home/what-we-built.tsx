import React, { useEffect, useMemo, useState } from "react";
import ReactPlayer from "react-player";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { cn } from "utils";
import LetsLearnTogether from "./lets-learn-together";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const WhatWeBuilt = () => {
   const { push } = useRouter();
   const [mounted, setMounted] = useState<boolean>(false);
   const [playing, setPlaying] = useState<boolean>(false);
   const features = useSelector((state: RootState) => state.accessibility.features);
   const { t } = useTranslation("home");

   const animationsPaused = useMemo(() => features["pause animations"], [features]);
   const toggle = () => {
      setPlaying(!playing);
   };

   useEffect(() => setMounted(true), []);
   const toSignUp = () => push("/signup");

   return (
      <section className="w-full bg-blueToBlackGradient pt-12 pb-1">
         <h1
            onClick={toSignUp}
            className="mx-auto max-w-fit cursor-pointer rounded-md bg-mainRed py-2 px-5 text-center font-tiltWarp text-[2rem] font-bold text-white shadow-md max-md:text-[1.5rem]"
         >
            {t("letsHaveFunTogether")}
         </h1>

         <div className="relative mx-auto mt-12 h-[200px] w-[700px] max-w-[90vw] overflow-hidden rounded-[2rem] bg-white object-contain shadow-xl shadow-mainBlack md:h-[400px]">
            <img src="/assets/0002.png" alt="" className={cn("h-full w-full object-cover", playing && "hidden")} />

            {mounted && (
               <ReactPlayer
                  width="100%"
                  height="100%"
                  url="https://youtu.be/vm69BVRxDv8"
                  playing={!animationsPaused && playing}
                  muted
                  controls={false}
                  loop
                  style={{
                     objectFit: "cover",
                     objectPosition: "center",
                     display: playing ? "block" : "none",
                  }}
               />
            )}

            {!playing && (
               <div onClick={toggle} className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] cursor-pointer">
                  <img className="h-[110px] w-[110px] max-sm:h-[80px] max-sm:w-[80px]" src="/assets/landing/play-icon.png" alt="Play Video" />
               </div>
            )}

            {!playing && (
               <img
                  className="absolute top-[15%] right-[98.5%] z-[-1] w-[150px] translate-x-[30%] object-contain max-md:hidden"
                  src="/assets/0013_2.png"
               />
            )}
         </div>

         <LetsLearnTogether />
      </section>
   );
};

export default WhatWeBuilt;
