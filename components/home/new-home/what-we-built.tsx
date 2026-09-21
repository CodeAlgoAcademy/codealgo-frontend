import React, {  useEffect, useMemo, useState } from "react";
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
      <section className="w-full bg-pink-50/30 py-10">
         <LetsLearnTogether />
      </section>
   );
};

export default WhatWeBuilt;
