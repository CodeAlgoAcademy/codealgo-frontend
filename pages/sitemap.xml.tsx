import { GetServerSideProps } from "next";
import { posts } from "public/blog.data";
import { articles } from "public/data";

const SITE_URL = "https://codealgoacademy.com";

// Public, indexable pages. Dashboards, payment, email verification and referral
// links are left out on purpose and disallowed in public/robots.txt. Press and
// blog entries come from the same lists the /press and /blog index pages render,
// so a new article shows up here without touching this file.
const staticPaths = [
   "/",
   "/about",
   "/for-parents",
   "/for-educators",
   "/pricing",
   "/case-studies",
   "/learn-more",
   "/parents-resources",
   "/teachers-resources",
   "/dev-forum",
   "/student-internships",
   "/faq",
   "/contact",
   "/press",
   "/blog",
   "/privacy-policy",
   "/signup",
   "/login",
];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
   const paths = [
      ...staticPaths,
      ...articles.map((article) => `/press${article.detailPage}`),
      ...posts.filter((post) => post.detailPage).map((post) => `/blog${post.detailPage}`),
   ];

   const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...paths.map((path) => `  <url><loc>${SITE_URL}${path === "/" ? "" : path}</loc></url>`),
      "</urlset>",
      "",
   ].join("\n");

   res.setHeader("Content-Type", "application/xml; charset=utf-8");
   res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
   res.end(xml);

   return { props: {} };
};

export default function Sitemap() {
   return null;
}
