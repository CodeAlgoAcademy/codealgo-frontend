import { ReactNode } from "react";
import { GiConcentricCrescents, GiSoundWaves } from "react-icons/gi";
import {  IoEyeOutline } from "react-icons/io5";
import { MdInvertColors, MdLink, MdOutlineInvertColors } from "react-icons/md";
import { RiCursorLine, RiFontSize, RiFontSize2, RiWheelchairFill } from "react-icons/ri";
import { CiImageOff, CiLineHeight } from "react-icons/ci";
import { LuBrain } from "react-icons/lu";
import { TbPuzzle } from "react-icons/tb";
import { AccessibilityFeatures, AccessibilitySlice } from "types/interfaces/accessibility.interface";
import { BiSolidAdjust, BiSolidBook } from "react-icons/bi";
import { FaDotCircle, FaRegCircle } from "react-icons/fa";
import { FaRegCirclePause, FaRegCirclePlay } from "react-icons/fa6";
import { BsSoundwave } from "react-icons/bs";
import { SpacingIcon } from "@/components/UI/Icons";
import { GrScan } from "react-icons/gr";
import { FiAlignCenter, FiAlignJustify, FiAlignLeft, FiAlignRight } from "react-icons/fi";

export interface IArticle {
   title: string;
   body: string;
   image: string;
   date: string;
   detailPage?: string;
}

export const articles = [
   { id: "startupWorldCup", image: "/assets/blog/press/million.jpg", detailPage: "/startup-world-cup" },
  { id: "herStartup", image: "/assets/press/1.jpg", detailPage: "/her-start-up-needed-a-user-test-lab" },
  { id: "edtechPlatform", image: "/assets/blog/press/codealgopoto.jpg", detailPage: "/codeAlgo-academy-hits-as-edtech-platform" },
  { id: "codealgoStudents", image: "/assets/blog/press/demarris.webp", detailPage: "/codeAlgoStudents" },
  { id: "blackAmbition", image: "/assets/blog/press/blackam.png", detailPage: "/blackambition" },
  { id: "lincStudent", image: "/assets/blog/press/linc.png", detailPage: "/linc-student" },
  { id: "virusesBacteria", image: "/assets/blog/press/save.PNG", detailPage: "/linkedin" },
  { id: "gamification", image: "/assets/blog/press/triumfia.jpg", detailPage: "/gamification" },
  { id: "pipeline", image: "/assets/blog/press/pipeline.jpg", detailPage: "/pipeline" },
  { id: "launchKcAwards", image: "/assets/blog/launch-kc-award.jpg", detailPage: "/launch-kc-awards" },
  { id: "altcapYourBiz", image: "/assets/blog/altcap-your-biz6.jpg", detailPage: "/altcap-your-biz" },
  { id: "codealgoBetaLive", image: "/assets/blog/codealgo-beta-live.png", detailPage: "/codealgo-beta-live" },
  { id: "allGirlsMatter", image: "/assets/blog/all-girls-matter-conference.jpeg", detailPage: "/all-girls-matter-conference" },
  { id: "rockstarAward", image: "/assets/blog/codealgo-wins-rockstar-business-award.jpeg", detailPage: "/codealgo-wins-rockstar-business-award" },
  { id: "proxHiringFair", image: "/assets/blog/codealgo-at-proX.jpeg", detailPage: "/codealgo-at-proX" },
  { id: "purePitchRally", image: "/assets/blog/article1.jpg", detailPage: "/pure-pitch-rally" },
  { id: "familiesTogether", image: "/assets/blog/article6.png", detailPage: "/families-together-conference" },
  { id: "twitterPitch", image: "/assets/blog/article5.png", detailPage: "/twitter-pitch-winner" },
  { id: "codesignResearch", image: "/assets/blog/article3.png", detailPage: "/codesign-research-program" },
  { id: "goodieNation", image: "/assets/blog/article4.png", detailPage: "/codealgo-joins-goodie-nation" },
];

export const accessibility_profiles: {
   name: string;
   icon: ReactNode;
   features: Partial<AccessibilitySlice["features"]>;
}[] = [
   {
      name: "Motor impaired",
      icon: <RiWheelchairFill />,
      features: {
         "pause animations": 1,
      },
   },
   {
      name: "Blind",
      icon: <GiSoundWaves />,
      features: {
         "screen reader": 1,
      },
   },
   {
      name: "Color Blind",
      icon: <MdOutlineInvertColors />,
      features: {
         saturation: 2,
      },
   },
   {
      name: "Low Vision",
      icon: <IoEyeOutline />,
      features: {
         "bigger text": 1,
         "pause animations": 1,
         cursor: 1,
         saturation: 2,
      },
   },
   {
      name: "Cognitive & Learning",
      icon: <TbPuzzle />,
      features: {
         "bigger text": 1,
         "pause animations": 1,
         cursor: 2,
      },
   },
   {
      name: "Seizure & Epileptic",
      icon: <LuBrain />,
      features: {
         "pause animations": 1,
         saturation: 1,
      },
   },
   {
      name: "ADHD",
      icon: <GiConcentricCrescents />,
      features: {
         "screen reader": 2,
         saturation: 1,
      },
   },
];

export const accessibility_functions: Record<
   AccessibilityFeatures,
   {
      step: 0 | 1 | 2 | 3 | 4;
      name: string;
      icon: ReactNode;
   }[]
> = {
   "contrast +": [
      {
         step: 0,
         name: "Contrast +",
         icon: <BiSolidAdjust />,
      },
      {
         step: 1,
         name: "Invert Colors",
         icon: <BiSolidAdjust />,
      },
      {
         step: 2,
         name: "Dark Colors",
         icon: <FaDotCircle />,
      },
      {
         step: 3,
         name: "Light Colors",
         icon: <FaRegCircle />,
      },
   ],
   "screen reader": [
      {
         step: 0,
         name: "Screen Reader",
         icon: <BsSoundwave />,
      },
      {
         step: 1,
         name: "Read Normal",
         icon: <BsSoundwave />,
      },
      {
         step: 2,
         name: "Read Fast",
         icon: <GiSoundWaves />,
      },
      {
         step: 3,
         name: "Read Slow",
         icon: <BsSoundwave />,
      },
   ],
   "highlight links": [
      {
         step: 0,
         name: "Highlight Links",
         icon: <MdLink />,
      },
      {
         step: 1,
         name: "Highlight Links",
         icon: <MdLink />,
      },
   ],
   "bigger text": [
      {
         step: 0,
         name: "Bigger Text",
         icon: <RiFontSize2 />,
      },
      {
         step: 1,
         name: "Bigger Text",
         icon: <RiFontSize2 className="text-[2rem]" />,
      },
      {
         step: 2,
         name: "Bigger Text",
         icon: <RiFontSize2 className="text-[2.1rem]" />,
      },
      {
         step: 3,
         name: "Bigger Text",
         icon: <RiFontSize2 className="!text-[2.3rem]" />,
      },
      {
         step: 4,
         name: "Bigger Text",
         icon: <RiFontSize2 className="text-[2.5rem]" />,
      },
   ],
   "text spacing": [
      {
         step: 0,
         name: "Text Spacing",
         icon: <SpacingIcon count={3} />,
      },
      {
         step: 1,
         name: "Light Spacing",
         icon: <SpacingIcon count={1} />,
      },

      {
         step: 2,
         name: "Moderate Spacing",
         icon: <SpacingIcon count={3} />,
      },
      {
         step: 3,
         name: "Heavy Spacing",
         icon: <SpacingIcon count={4} />,
      },
   ],
   "pause animations": [
      {
         step: 0,
         name: "Pause Animations",
         icon: <FaRegCirclePause />,
      },
      {
         step: 1,
         name: "Pause Animations",
         icon: <FaRegCirclePlay />,
      },
   ],
   "hide images": [
      {
         step: 0,
         name: "Hide Images",
         icon: <CiImageOff />,
      },
      {
         step: 1,
         name: "Hide Images",
         icon: <CiImageOff />,
      },
   ],
   "legible fonts": [
      {
         step: 0,
         name: "Legible Fonts",
         icon: <RiFontSize />,
      },
      {
         step: 1,
         name: "Legible Fonts",
         icon: <RiFontSize />,
      },
   ],
   cursor: [
      {
         step: 0,
         name: "Cursor",
         icon: <RiCursorLine />,
      },
      {
         step: 1,
         name: "Big Cursor",
         icon: <RiCursorLine />,
      },
      {
         step: 2,
         name: "Reading Mask",
         icon: <GrScan />,
      },
      {
         step: 3,
         name: "Reading Guide",
         icon: <GrScan />,
      },
   ],
   "line height": [
      {
         step: 0,
         name: "Line Height",
         icon: <CiLineHeight />,
      },
      {
         step: 1,
         name: "Line Height (1.5x)",
         icon: <CiLineHeight />,
      },
      {
         step: 2,
         name: "Line Height (1.75x)",
         icon: <CiLineHeight />,
      },
      {
         step: 3,
         name: "Line Height (2x)",
         icon: <CiLineHeight />,
      },
   ],
   "text align": [
      {
         step: 0,
         name: "Text Align",
         icon: <FiAlignCenter />,
      },
      {
         step: 1,
         name: "Align Left",
         icon: <FiAlignLeft />,
      },
      {
         step: 2,
         name: "Align Right",
         icon: <FiAlignRight />,
      },
      {
         step: 3,
         name: "Align Center",
         icon: <FiAlignCenter />,
      },
      {
         step: 4,
         name: "Justify",
         icon: <FiAlignJustify />,
      },
   ],
   saturation: [
      {
         step: 0,
         name: "Saturation",
         icon: <MdInvertColors />,
      },
      {
         step: 1,
         name: "Low Saturation",
         icon: <MdInvertColors />,
      },
      {
         step: 2,
         name: "High Saturation",
         icon: <MdInvertColors />,
      },
      {
         step: 3,
         name: "Desaturate",
         icon: <MdInvertColors />,
      },
   ],
   dictionary: [
      {
         step: 0,
         name: "Dictionary",
         icon: <BiSolidBook />,
      },
      {
         step: 1,
         name: "Dictionary",
         icon: <BiSolidBook />,
      },
   ],
};
