/** @type {import('next').NextConfig} */

// frame-ancestors lets the analytics dashboard (admin.codealgoacademy.com,
// behind Cloudflare Access) show the live page under its click heatmap.
// Browsers that understand frame-ancestors ignore X-Frame-Options, so the
// SAMEORIGIN below only applies to very old ones.
const frameAncestors = ["'self'", "https://admin.codealgoacademy.com"];
if (process.env.NODE_ENV !== "production") frameAncestors.push("http://localhost:8787");
const ContentSecurityPolicy = `
   frame-ancestors ${frameAncestors.join(" ")};
`;
// next.config.js

const securityHeaders = [
   // Prevent clickjacking. See frame-ancestors above for the one exception.
   { key: "X-Frame-Options", value: "SAMEORIGIN" },
   // Enable XSS protection
   { key: "X-XSS-Protection", value: "1; mode=block" },
   // Prevent MIME sniffing
   { key: "X-Content-Type-Options", value: "nosniff" },
   // Remember HTTPS for a year. No includeSubDomains: that would also force it
   // on blog., play. and admin., which this config has no say over.
   { key: "Strict-Transport-Security", value: "max-age=31536000" },
   // Browsers' default, made explicit: full URL same-origin, origin only cross-origin.
   { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
   {
      key: "Content-Security-Policy",
      value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
   },
];
const nextConfig = {
   reactStrictMode: true,
   swcMinify: true,
   // Emits .next/standalone with a self-contained server.js and only the
   // node_modules the build actually traced. The full install is around 1.5 GB
   // once Syncfusion and MUI are in it, and a Cloudflare Container on the
   // "basic" instance type gets 4 GB of disk for the whole image. Tracing keeps
   // it in the low hundreds of MB. See deploy/cloudflare/Dockerfile.
   output: "standalone",
   // `next build` runs ESLint by default and fails the build on any error.
   // That is the wrong layer for a container image: it couples deploying to
   // lint state, adds minutes to every build, and makes a lint config problem
   // indistinguishable from a broken app.
   //
   // It is not hypothetical here. `.eslintrc.json` extends
   // "plugin:cypress/recommended", but `eslint-plugin-cypress` is not in
   // package.json - so a clean `npm ci` has never been able to resolve it and
   // the image build died on
   //   Failed to load plugin 'cypress': Cannot find module 'eslint-plugin-cypress'
   // Vercel only got away with it because of a warm node_modules cache.
   //
   // Fix the root cause separately - either add eslint-plugin-cypress to
   // devDependencies or drop it from .eslintrc.json - and lint in CI, where a
   // failure is a red check rather than a failed deploy.
   eslint: { ignoreDuringBuilds: true },
   // The footer used to link to /about-us, which never existed (the page is
   // pages/about.tsx). Crawlers and backlinks already have the old URL.
   async redirects() {
      return [{ source: "/about-us", destination: "/about", permanent: true }];
   },
   async headers() {
      return [
         {
            source: "/(.*)",
            headers: securityHeaders,
         },
      ];
   },
};

module.exports = nextConfig;
