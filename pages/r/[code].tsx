import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect } from "react";
import http from "../../axios.config";
import { storeReferral, trackVisit } from "utils/referral";

/**
 * A partner's short link: codealgoacademy.com/r/<code>.
 *
 * Exists so a marketer can hand out one clean URL and so attribution does not
 * depend on the querystring surviving a share, a shortener or a paste into an
 * app. It stores the code, fires the landing beacon, then sends the visitor on
 * to wherever the partner is configured to point - normally the home page, but
 * it can be /for-parents or /pricing per partner.
 *
 * Unknown or switched off codes still land on the home page rather than a 404.
 * Somebody clicked a link a marketer gave them; a dead end is the worst of the
 * available outcomes.
 */
export default function ReferralLink() {
   const router = useRouter();
   const { code } = router.query;

   useEffect(() => {
      if (!router.isReady) return;

      const value = Array.isArray(code) ? code[0] : code;
      if (!value) {
         router.replace("/");
         return;
      }

      const stored = storeReferral(value, "/");

      const go = async () => {
         let destination = "/";
         try {
            const { data } = await http.get(`/referrals/partner/${encodeURIComponent(value)}/`);
            const path = data?.landing_path || "/";
            // Only ever a path on this site. Nothing stops somebody putting an
            // absolute URL in the admin field, and this is a redirect.
            destination = path.startsWith("/") && !path.startsWith("//") ? path : "/";
         } catch {
            // Unknown code, or the API is having a bad day. The code is already
            // stored either way, and the backend ignores one it does not know.
         }
         if (stored) trackVisit({ ...stored, landingPath: destination });
         router.replace(destination);
      };

      go();
   }, [router.isReady, code]);

   return (
      <>
         <Head>
            <title>CodeAlgo Academy</title>
            <meta name="robots" content="noindex" />
         </Head>
         <div className="flex h-screen w-full items-center justify-center">
            <p className="text-lg text-gray-600">Taking you to CodeAlgo...</p>
         </div>
      </>
   );
}
