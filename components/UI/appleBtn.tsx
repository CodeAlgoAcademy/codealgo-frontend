import { FC, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { FaApple } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { loginWithApple } from "services/authService";
import { openErrorModal } from "store/fetchSlice";
import { clearSession } from "utils/clearSession";
import {
   AccountRole,
   destinationFor,
   isExternalDestination,
   loginPageFor,
   resolveLogin,
   roleFromPath,
   roleLabelKey,
} from "utils/loginRouting";

// Services ID with Sign in with Apple on, same value as APPLE_SERVICES_ID on the API.
// The button stays hidden until it is set.
const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_SERVICES_ID || "";
// Must be listed under Return URLs on the Services ID. Defaults to this site's origin.
const APPLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || "";
const APPLE_JS = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

declare global {
   interface Window {
      AppleID?: any;
   }
}

function loadAppleJs(): Promise<void> {
   if (typeof window === "undefined") return Promise.reject(new Error("no window"));
   if (window.AppleID?.auth) return Promise.resolve();
   return new Promise((resolve, reject) => {
      let script = document.getElementById("apple-signin-js") as HTMLScriptElement | null;
      if (!script) {
         script = document.createElement("script");
         script.id = "apple-signin-js";
         script.src = APPLE_JS;
         script.async = true;
         document.head.appendChild(script);
      }
      script.addEventListener("load", () => resolve());
      script.addEventListener("error", () => reject(new Error("Could not load Sign in with Apple")));
      if (window.AppleID?.auth) resolve();
   });
}

function randomString(bytes = 32): string {
   const buf = new Uint8Array(bytes);
   window.crypto.getRandomValues(buf);
   return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string): Promise<string> {
   const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
   return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const AppleBtn: FC = () => {
   const dispatch = useDispatch();
   const router = useRouter();
   const { t } = useTranslation("common");
   const { t: tAuth } = useTranslation("auth");
   const [ready, setReady] = useState(false);

   const account: AccountRole = roleFromPath(router.pathname);
   const label = (role: AccountRole) => tAuth(roleLabelKey(role));

   // Load early so the click goes straight to AppleID.auth.signIn() and the popup is
   // still tied to the click. Loading on click gets the popup blocked in Safari.
   useEffect(() => {
      if (!APPLE_CLIENT_ID) return;
      loadAppleJs()
         .then(() => setReady(true))
         .catch(() => setReady(false));
   }, []);

   const goTo = useCallback(
      (role: AccountRole) => {
         const destination = destinationFor(role);
         if (isExternalDestination(destination)) window.location.href = destination;
         else router.push(destination);
      },
      [router]
   );

   const handleClick = async () => {
      if (!window.AppleID?.auth) {
         dispatch(openErrorModal({ errorText: [tAuth("appleFailed")] }));
         return;
      }

      const rawNonce = randomString();
      let response: any;
      try {
         window.AppleID.auth.init({
            clientId: APPLE_CLIENT_ID,
            scope: "name email",
            redirectURI: APPLE_REDIRECT_URI || window.location.origin,
            state: randomString(12),
            nonce: await sha256Hex(rawNonce),
            usePopup: true,
         });
         response = await window.AppleID.auth.signIn();
      } catch (err: any) {
         const code = err?.error || "";
         if (code === "popup_closed_by_user" || code === "user_cancelled_authorize") {
            dispatch(openErrorModal({ errorText: [tAuth("appleCancelled")] }));
         } else {
            dispatch(openErrorModal({ errorText: [tAuth("appleFailed")] }));
         }
         return;
      }

      const idToken = response?.authorization?.id_token;
      if (!idToken) {
         dispatch(openErrorModal({ errorText: [tAuth("appleFailed")] }));
         return;
      }

      const name = response?.user?.name || {};
      const data = await dispatch(
         loginWithApple({
            id_token: idToken,
            nonce: rawNonce,
            first_name: name.firstName || "",
            last_name: name.lastName || "",
            // There is no organizer role on the API; a brand new account made from
            // that page would otherwise be a student.
            role: account === "organizer" ? "teacher" : account,
         }) as any
      );

      if (loginWithApple.rejected.match(data)) return;

      const resolution = resolveLogin(data?.payload, account);
      if (resolution.status === "ok") {
         goTo(resolution.role);
         return;
      }

      // Same as the password and Google paths: the account is real, just not for
      // this role. Say which it is and where to log in, and do not leave it signed in.
      clearSession(dispatch);
      if (resolution.status === "noRole") {
         dispatch(openErrorModal({ errorText: [tAuth("noRoleAccessGoogle", { requested: label(account) })] }));
         return;
      }

      const actual = resolution.roles.map(label).join(" / ");
      dispatch(
         openErrorModal({
            errorText: [
               resolution.roles.length === 1
                  ? tAuth("wrongRoleTitleOne", { actual, requested: label(account) })
                  : tAuth("wrongRoleTitleMany", { actual, requested: label(account) }),
               resolution.roles.length === 1
                  ? tAuth("wrongRoleAction", { page: loginPageFor(resolution.roles[0]) })
                  : tAuth("wrongRoleActionMany", { pages: resolution.roles.map(loginPageFor).join(", ") }),
            ],
         })
      );
   };

   if (!APPLE_CLIENT_ID) return null;

   return (
      <div className="relative w-full flex-1">
         <button
            onClick={handleClick}
            disabled={!ready}
            className="mt-3 flex h-[2.5rem] w-full items-center justify-center gap-4 rounded-xl bg-black text-center font-semibold text-white disabled:opacity-60"
            type="button"
         >
            <i className="text-[22px]">
               <FaApple />
            </i>
            <span>{router.pathname.includes("/login") ? t("login") : t("signUp")} with Apple</span>
         </button>
      </div>
   );
};

export default AppleBtn;
