import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";
import React from "react";
import Script from "next/script";

class MyDocument extends Document {
   static async getInitialProps(ctx: DocumentContext) {
      const initialProps = await Document.getInitialProps(ctx);
      return { ...initialProps };
   }

   render() {
      return (
         <Html lang="en" suppressHydrationWarning>
            <Head>
               {/* No <title> or description here. _document tags can't be
                   overridden by next/head, so every page would ship a second,
                   identical description. The fallback lives in _app.tsx. */}

               <link rel="icon" href="/favicon.ico" sizes="any" />
               <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

               {/* gtag.js is loaded on every page (see <Script> below). */}
               <link rel="preconnect" href="https://www.googletagmanager.com" />

               {/* <!-- Facebook Meta Tags --> */}
               <meta property="og:url" content="https://www.codealgoacademy.com" />
               <meta property="og:type" content="website" />
               <meta property="og:title" content="CodeAlgo Academy" />
               <meta
                  property="og:description"
                  content="3D games from CodeAlgo academy will bring students to computer sciences where they can teach themselves as they play."
               />
               <meta property="og:image" content="https://res.cloudinary.com/denettr1i/image/upload/v1742451547/codealgo.png" />
               <meta property="og:image:alt" content="CodeAlgo Home Page" />

               {/* <!-- Twitter Meta Tags --> */}
               <meta name="twitter:card" content="summary_large_image" />
               <meta property="twitter:domain" content="codealgoacademy.com" />
               <meta property="twitter:url" content="https://www.codealgoacademy.com" />
               <meta name="twitter:title" content="CodeAlgo Academy" />
               <meta
                  name="twitter:description"
                  content="3D games from CodeAlgo academy will bring students to computer sciences where they can teach themselves as they play."
               />
               <meta name="twitter:image" content="https://res.cloudinary.com/denettr1i/image/upload/v1742451547/codealgo.png" />
            </Head>
            <body>
               <Main />
               <NextScript />
            <Script
                      strategy="afterInteractive"
                      src="https://www.googletagmanager.com/gtag/js?id=G-80CZZG1HG5"
                    />
                    <Script
                      id="google-analytics"
                      strategy="afterInteractive"
                    >
                      {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-80CZZG1HG5', {
                          page_path: window.location.pathname,
                        });
                      `}
                    </Script>
            </body>
         </Html>
      );
   }
}

export default MyDocument;
