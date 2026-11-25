import { useMediaQuery } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { useTranslation } from "react-i18next";

const Avatar = ({ name }: { name: string }) => {
   const defaultSrc = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name
   )}&backgroundColor=0961D6,14B8A6,6D28D9&textColor=ffffff`;
   return <img src={defaultSrc} alt={name} loading="lazy" className="testimonial-avatar" />;
};

type TextTestimonial = {
   type: "text";
   quote: string;
   author: string;
   handle: string;
   role: string;
   tags: string[];
};

type ImageTestimonial = {
   type: "image";
   image: string;
   alt?: string;
};

type Testimonial = TextTestimonial | ImageTestimonial;

// The testimonial-* classes and the star row live in styles/globals.css. The
// five stars are one element drawn in CSS, not five inline SVGs: with the row
// repeated for the marquee they used to be 80 KB of the homepage's HTML.
const TextTestimonialCard = ({ data }: { data: TextTestimonial }) => (
   <div className="testimonial-card">
      <div className="testimonial-head">
         <Avatar name={data.author} />
         <div className="min-w-0">
            <p className="testimonial-author">{data.author}</p>
            <p className="testimonial-role">
               {data.handle} • {data.role}
            </p>
         </div>
      </div>

      <p className="testimonial-quote">"{data.quote}"</p>

      <div className="testimonial-foot">
         <div className="testimonial-tags">
            {data.tags.slice(0, 2).map((tag: string, i: number) => (
               <span key={i}>{tag}</span>
            ))}
         </div>
         <span className="testimonial-stars" role="img" aria-label="5 out of 5 stars" />
      </div>
   </div>
);

const ImageTestimonialCard = ({ data }: { data: ImageTestimonial }) => (
   <div className="testimonial-photo">
      <img src={data.image} alt={data.alt ?? ""} loading="lazy" />
   </div>
);

const TestimonialCard = ({ data }: { data: Testimonial }) =>
   data.type === "image" ? <ImageTestimonialCard data={data} /> : <TextTestimonialCard data={data} />;

const MarqueeRow = ({
   items,
   direction,
   duration,
   paused,
}: {
   items: Testimonial[];
   direction: "ltr" | "rtl";
   duration: number;
   paused: boolean;
}) => {
   const containerRef = useRef<HTMLDivElement>(null);
   const trackRef = useRef<HTMLDivElement>(null);

   // The server renders the row once. The copies that make the loop seamless
   // are added in the browser, once the row can be measured: the server cannot
   // know how many a given screen needs, and sending four of them to everyone
   // made this section two thirds of the page's HTML.
   const [repeatCount, setRepeatCount] = useState(1);

   useEffect(() => {
      const calculate = () => {
         const container = containerRef.current;
         const track = trackRef.current;
         if (!container || !track || items.length === 0) return;

         // Width of one copy of the row: from the first card to the last card of the first set.
         const first = track.children[0] as HTMLElement | undefined;
         const last = track.children[items.length - 1] as HTMLElement | undefined;
         if (!first || !last) return;
         const singleSetWidth = last.offsetLeft + last.offsetWidth - first.offsetLeft;
         const containerWidth = container.offsetWidth;
         if (singleSetWidth === 0 || containerWidth === 0) return;

         const needed = Math.ceil((containerWidth * 3) / singleSetWidth) + 1;
         setRepeatCount(Math.max(2, needed));
      };

      calculate();
      window.addEventListener("resize", calculate);
      return () => window.removeEventListener("resize", calculate);
   }, [items]);

   const loopItems = useMemo(() => Array.from({ length: repeatCount }, () => items).flat(), [items, repeatCount]);

   // The row only starts moving once it has its copies; a single copy would
   // scroll away and leave a gap.
   const animated = repeatCount > 1;

   // Speed, distance and pause are set on the element from here, not through a
   // style prop, so the server-rendered HTML carries no inline style.
   useEffect(() => {
      const track = trackRef.current;
      if (!track) return;
      track.style.setProperty("--marquee-duration", `${duration}s`);
      track.style.setProperty("--marquee-distance", `${100 / repeatCount}%`);
      track.style.animationPlayState = paused ? "paused" : "";
   }, [duration, repeatCount, paused]);

   return (
      <div ref={containerRef} className="group relative overflow-hidden">
         <div
            ref={trackRef}
            className={`flex w-max gap-4 group-hover:[animation-play-state:paused] ${
               animated ? (direction === "ltr" ? "animate-marquee-ltr" : "animate-marquee-rtl") : ""
            }`}
         >
            {loopItems.map((testimony, index) => (
               <TestimonialCard key={index} data={testimony} />
            ))}
         </div>
      </div>
   );
};

// --- Main Component ---
const VoiceOfOurCommunity = () => {
   const { t } = useTranslation("home");
   const isMobile = useMediaQuery("(max-width: 768px)");
   const features = useSelector((state: RootState) => state.accessibility.features);
   const animationsPaused = useMemo(() => features["pause animations"], [features]);

   const testimonialTexts = t("testimonials", { returnObjects: true }) as {
      quote: string;
      author: string;
      handle: string;
      role: string;
      tags: string[];
   }[];

   const imageSlots = [
      "/assets/landing/fifa1.jpeg",
      "/assets/landing/fifa10.png",
      "/assets/landing/fifa12.png",
      "/assets/landing/fifa11.png",
      "/assets/landing/fifa3.jpeg",
      "/assets/landing/fifa10.png",
      "/assets/landing/fifa4.jpeg",
   ];

   const allTestimonials = useMemo<Testimonial[]>(() => {
      const result: Testimonial[] = [];
      testimonialTexts.forEach((text, i) => {
         result.push({
            type: "text",
            quote: text.quote,
            author: text.author,
            handle: text.handle,
            role: text.role,
            tags: text.tags,
         });
         if (imageSlots[i]) {
            result.push({ type: "image", image: imageSlots[i], alt: t("imageTestimonialAlt") });
         }
      });
      return result;
   }, [testimonialTexts, t]);

   const row1 = useMemo(() => allTestimonials.slice(0, 5), [allTestimonials]);
   const row2 = useMemo(() => allTestimonials.slice(5), [allTestimonials]);

   const duration = isMobile ? 18 : 14;

   return (
      <section className="overflow-hidden bg-[#F3F9FA] pt-44">

         <div className=" mx-auto mb-12 bg-mainColor px-4 text-center ">
            <h2 className=" py-4 text-center font-tiltWarp text-[2.1rem] text-white max-md:text-[1.5rem]">{t("whatsTheWord")}</h2>
            <p className="mx-auto max-w-2xl pb-5 text-lg text-white">{t("communitySubtitle")}</p>
         </div>

         <div className="relative w-full space-y-4">
            <MarqueeRow items={row1} direction="ltr" duration={duration} paused={!!animationsPaused} />
            <MarqueeRow items={row2} direction="rtl" duration={duration} paused={!!animationsPaused} />
         </div>
      </section>
   );
};

export default VoiceOfOurCommunity;
