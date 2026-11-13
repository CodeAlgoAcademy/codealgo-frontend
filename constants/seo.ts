export const SITE_URL = "https://codealgoacademy.com";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

// Rendered on every page from _app.tsx. Other schemas point at it with
// { "@id": ORGANIZATION_ID } rather than repeating the details.
//
// Plain "Organization": audit tools look for that exact type and don't treat
// subtypes such as EducationalOrganization as a match.
export const organizationSchema = (sameAs: string[]) => ({
   "@context": "https://schema.org",
   "@type": "Organization",
   "@id": ORGANIZATION_ID,
   name: "CodeAlgo Academy",
   url: SITE_URL,
   logo: `${SITE_URL}/assets/CodeAlgo_Logo.png`,
   description: "Game-based coding, math, and AI literacy for K-8 students.",
   email: "info@codealgoacademy.com",
   address: {
      "@type": "PostalAddress",
      streetAddress: "800 E 18th St",
      addressLocality: "Kansas City",
      addressRegion: "MO",
      postalCode: "64108",
      addressCountry: "US",
   },
   sameAs,
});
