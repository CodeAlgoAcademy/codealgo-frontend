import { Provider } from "react-redux";
import { store } from "../store/store";
import Layout from "@/components/layouts/Layout";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import "../styles/GeneralNav.css";
import "../styles/Calendar.css";
// react-big-calendar ships its own stylesheet. Next only allows a global
// CSS import from _app, so it lives here rather than next to the page.
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import Head from "next/head";
import "swiper/css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "../i18n";
import { useEffect } from "react";
import { useRouter } from "next/router";
import i18n, { detectLanguage, loadTranslations, syncLanguageToBackend } from "../i18n";
import { captureReferral } from "utils/referral";
import { trackSiteVisit } from "utils/siteVisit";

const GA_ID = "G-80CZZG1HG5";

function MyApp({ Component, pageProps }: AppProps) {
   const router = useRouter();

   useEffect(() => {
      const detected = detectLanguage();
      if (detected !== i18n.language) {
         i18n.changeLanguage(detected);
      }
      loadTranslations(detected);
   }, []);

   useEffect(() => {
      const handleLanguageChange = (lng: string) => {
         loadTranslations(lng);
         syncLanguageToBackend(lng);
      };
      i18n.on("languageChanged", handleLanguageChange);
      return () => {
         i18n.off("languageChanged", handleLanguageChange);
      };
   }, []);

   useEffect(() => {
      const handleRouteChange = (url: string) => {
         if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("config", GA_ID, { page_path: url });
         }
      };
      router.events.on("routeChangeComplete", handleRouteChange);
      return () => {
         router.events.off("routeChangeComplete", handleRouteChange);
      };
   }, [router.events]);

   // A partner's ?ref= can land on any page, so this watches every navigation
   // rather than only the first load. Does nothing when the URL has no code.
   useEffect(() => {
      captureReferral();
      router.events.on("routeChangeComplete", captureReferral);
      return () => {
         router.events.off("routeChangeComplete", captureReferral);
      };
   }, [router.events]);

   // Site traffic for the marketing dashboard. Throttles itself to one call per
   // tab per day unless the url has utm tags, see utils/siteVisit.ts.
   useEffect(() => {
      trackSiteVisit();
      router.events.on("routeChangeComplete", trackSiteVisit);
      return () => {
         router.events.off("routeChangeComplete", trackSiteVisit);
      };
   }, [router.events]);

   return (
      <Provider store={store}>
         <Layout>
           <Head>
  <title>CodeAlgo Academy | Online Coding Classes for Kids</title>
  <meta name="description" content="CodeAlgo Academy teaches kids ages 6-18 to code through fun, game-based lessons. Learn Python, algorithms & more." />
</Head>
            <Component {...pageProps} />
         </Layout>
      </Provider>
   );
}

export default MyApp;
