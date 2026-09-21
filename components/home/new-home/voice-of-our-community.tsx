import { useMediaQuery } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { useTranslation } from "react-i18next";

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const Avatar = ({ name }: { name: string }) => {
  const defaultSrc = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0961D6,14B8A6,6D28D9&textColor=ffffff`;
  return (
    <img
      src={defaultSrc}
      alt={name}
      className="h-10 w-10 flex-shrink-0 rounded-full object-cover shadow-sm border border-gray-100"
    />
  );
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

const TextTestimonialCard = ({ data }: { data: TextTestimonial }) => (
  <div className="flex h-[280px] w-[350px] flex-shrink-0 flex-col rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md">
    {/* Header */}
    <div className="flex items-center gap-3 mb-4">
      <Avatar name={data.author} />
      <div className="min-w-0">
        <p className="font-bold text-gray-900 text-[0.95rem] truncate">{data.author}</p>
        <p className="text-gray-500 text-xs truncate">{data.handle} • {data.role}</p>
      </div>
    </div>

    <p className="text-gray-700 text-sm leading-relaxed mb-6 flex-grow overflow-hidden line-clamp-5">
      "{data.quote}"
    </p>

    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
      <div className="flex gap-1 text-xs text-blue-500 font-medium overflow-hidden">
        {data.tags.slice(0, 2).map((tag: string, i: number) => (
          <span key={i} className="hover:underline cursor-pointer whitespace-nowrap">{tag}</span>
        ))}
      </div>
      <div className="flex gap-0.5 text-yellow-400 flex-shrink-0">
        {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4" />)}
      </div>
    </div>
  </div>
);

const ImageTestimonialCard = ({ data }: { data: ImageTestimonial }) => (
  <div className="h-[280px] w-[220px] flex-shrink-0 overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-gray-100 transition-shadow duration-300 hover:shadow-md">
    <img
      src={data.image}
      alt={data.alt ?? ""}
      loading="lazy"
      className="h-full w-full object-cover"
    />
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
  const singleSetRef = useRef<HTMLDivElement>(null);
  const [repeatCount, setRepeatCount] = useState(4);

  useEffect(() => {
    const calculate = () => {
      if (!containerRef.current || !singleSetRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const singleSetWidth = singleSetRef.current.scrollWidth;
      if (singleSetWidth === 0 || containerWidth === 0) return;
      const needed = Math.ceil((containerWidth * 3) / singleSetWidth) + 1;
      setRepeatCount(Math.max(2, needed));
    };

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [items]);

  const loopItems = useMemo(
    () => Array.from({ length: repeatCount }, () => items).flat(),
    [items, repeatCount]
  );

  return (
    <div ref={containerRef} className="group relative overflow-hidden">
      <div
        ref={singleSetRef}
        className="absolute invisible flex gap-4 pointer-events-none"
        aria-hidden="true"
      >
        {items.map((testimony, index) => (
          <TestimonialCard key={index} data={testimony} />
        ))}
      </div>

      <div
        className={`flex w-max gap-4 ${
          direction === "ltr" ? "animate-marquee-ltr" : "animate-marquee-rtl"
        } group-hover:[animation-play-state:paused]`}
        style={
          {
            animationDuration: `${duration}s`,
            animationPlayState: paused ? "paused" : undefined,
            "--marquee-distance": `${100 / repeatCount}%`,
          } as React.CSSProperties
        }
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
    "/assets/landing/fifa9.jpg",
    "/assets/landing/fifa2.jpeg",
    "/assets/landing/fifa8.jpg",
    "/assets/landing/fifa3.jpeg",
    "/assets/landing/fifa7.jpg",
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
    <section className="bg-[#F3F9FA] py-20 overflow-hidden">
      <style>{`
        @keyframes marquee-ltr {
          from { transform: translateX(calc(-1 * var(--marquee-distance, 50%))); }
          to { transform: translateX(0); }
        }
        @keyframes marquee-rtl {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-1 * var(--marquee-distance, 50%))); }
        }
        .animate-marquee-ltr { animation-name: marquee-ltr; animation-timing-function: linear; animation-iteration-count: infinite; }
        .animate-marquee-rtl { animation-name: marquee-rtl; animation-timing-function: linear; animation-iteration-count: infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-ltr, .animate-marquee-rtl { animation: none; }
        }
      `}</style>

      <div className="container mx-auto px-4 max-w-7xl mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          {t("whatsTheWord")}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t("communitySubtitle")}
        </p>
      </div>

      <div className="relative w-full space-y-4">
        <MarqueeRow items={row1} direction="ltr" duration={duration} paused={!!animationsPaused} />
        <MarqueeRow items={row2} direction="rtl" duration={duration} paused={!!animationsPaused} />
      </div>
    </section>
  );
};

export default VoiceOfOurCommunity;