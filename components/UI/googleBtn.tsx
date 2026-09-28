import { FC, useCallback, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import {
   loginWithGoogle,
   signUpWithGoogle,
   loginWithApple,
   signUpWithApple,
   updateAccountType,
   confirmAddRole,
} from "services/authService";
import { openErrorModal } from "store/fetchSlice";
import RoleConfirmationModal from "../modals/RoleConfirmationModal";
import { useTranslation } from "react-i18next";
import { clearSession } from "utils/clearSession";
import {
   AccountRole,
   canAddRoleWithGoogle,
   destinationFor,
   isExternalDestination,
   loginPageFor,
   resolveLogin,
   roleApiName,
   roleFromPath,
   roleLabelKey,
} from "utils/loginRouting";

declare global {
   interface Window {
      AppleID?: {
         auth: {
            init: (config: {
               clientId: string;
               scope: string;
               redirectURI: string;
               usePopup: boolean;
            }) => void;
            signIn: () => Promise<{
               code: string;
               id_token: string;
               user?: {
                  name: { firstName: string; lastName: string };
                  email: string;
               };
            }>;
         };
      };
   }
}

const GoogleBtn: FC = () => {
   const dispatch = useDispatch();
   const router = useRouter();
   const { t } = useTranslation("common");
   const { t: tAuth } = useTranslation("auth");
   const label = (role: AccountRole) => tAuth(roleLabelKey(role));

   const [confirmationData, setConfirmationData] = useState<{
      confirmation_token: string;
      message: string;
   } | null>(null);

   const account: AccountRole = roleFromPath(router.pathname);

   const goTo = useCallback(
      (role: AccountRole) => {
         const destination = destinationFor(role);
         if (isExternalDestination(destination)) {
            window.location.href = destination;
         } else {
            router.push(destination);
         }
      },
      [router]
   );

   const handleRoleConfirmation = async (token: string) => {
      const result = await dispatch(confirmAddRole(token) as any);
      setConfirmationData(null);

      if (confirmAddRole.rejected.match(result)) return;

      goTo(account);
   };

   /**
    * Offer to add the missing role rather than dead-ending. Reuses the signup
    * call, which is what makes the backend raise the 202 that drives
    * RoleConfirmationModal.
    */
   const offerRoleAddition = async (accessToken: string) => {
      if (!canAddRoleWithGoogle(account)) {
         dispatch(openErrorModal({ errorText: [tAuth("noRoleAccessGoogle", { requested: label(account) })] }));
         return;
      }

      const signUpData = await dispatch(
         signUpWithGoogle({ access_token: accessToken, role: account }) as any
      );

      if (signUpWithGoogle.rejected.match(signUpData)) return;

      if (signUpData?.payload?.role_addition_required && signUpData?.payload?.confirmation_token) {
         setConfirmationData({
            confirmation_token: signUpData.payload.confirmation_token,
            message: signUpData.payload.message,
         });
         return;
      }

      goTo(account);
   };

   const handleSignIn = async (accessToken: string) => {
      const data = await dispatch(loginWithGoogle(accessToken) as any);

      // The old code tested `data.payload.error`. A rejected thunk puts the
      // message list itself in payload, so that test was always false and the
      // real reason for the failure was replaced with "Invalid credentials".
      if (loginWithGoogle.rejected.match(data)) return;

      const payload = data?.payload;

      // The backend answers 202, not 4xx, when this email exists under another
      // role and needs confirmation. Axios treats it as success, so it arrives
      // here rather than in a catch.
      if (payload?.role_addition_required && payload?.confirmation_token) {
         setConfirmationData({
            confirmation_token: payload.confirmation_token,
            message: payload.message,
         });
         return;
      }

      const resolution = resolveLogin(payload, account);

      if (resolution.status === "ok") {
         goTo(resolution.role);
         return;
      }

      if (resolution.status === "noRole") {
         await offerRoleAddition(accessToken);
         return;
      }

      // Google confirmed who they are and the account is real - it just is not
      // for this role. Same as the password path: say which account it is, and
      // drop the session rather than leaving them half signed in here.
      clearSession(dispatch);

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

   const handleSignUp = async (accessToken: string) => {
      const signUpData = await dispatch(
         signUpWithGoogle({ access_token: accessToken, role: account }) as any
      );

      if (signUpWithGoogle.rejected.match(signUpData)) return;

      if (signUpData?.payload?.role_addition_required && signUpData?.payload?.confirmation_token) {
         setConfirmationData({
            confirmation_token: signUpData.payload.confirmation_token,
            message: signUpData.payload.message,
         });
         return;
      }

      if (!signUpData?.payload?.access_token) return;

      const updateData = await dispatch(updateAccountType(roleApiName(account)) as any);
      if (updateAccountType.rejected.match(updateData)) return;

      goTo(account);
   };

   const handleClick = useGoogleLogin({
      onSuccess: async (codeResponse) => {
         try {
            if (router.pathname.includes("/login")) {
               await handleSignIn(codeResponse.access_token);
            } else if (router.pathname.includes("/signup")) {
               await handleSignUp(codeResponse.access_token);
            }
         } catch (err) {
            dispatch(openErrorModal({ errorText: [tAuth("googleFailed")] }));
         }
      },
      onError: () => {
         dispatch(openErrorModal({ errorText: [tAuth("googleCancelled")] }));
      },
   });



   const handleAppleClick = async () => {
      try {
         if (!window.AppleID) {
            dispatch(
               openErrorModal({
                  errorText: ["Apple Sign In is loading. Please try again in a moment."],
               })
            );
            return;
         }

window.AppleID.auth.init({
   clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "",
   scope: "name email",
   redirectURI: "https://codealgoacademy.com", // Then try this
   usePopup: true,
});


         const response = await window.AppleID.auth.signIn();
         console.log(response);

         if (!response?.id_token) {
            return;
         }

         const currentPath = router.pathname;
         const firstName = response.user?.name?.firstName || "";
         const lastName = response.user?.name?.lastName || "";

         if (currentPath.includes("/login")) {
            const data = await dispatch(
               loginWithApple({
                  id_token: response.id_token,
                  role: account.toLowerCase(),
               }) as any
            );

            if (!data?.payload?.error) {
               if (currentPath === "/login/teacher" && !data.payload.is_teacher)
                  return dispatch(openErrorModal({ errorText: ["Invalid credentials"] }));

               if (currentPath === "/login/parent" && !data.payload.is_parent)
                  return dispatch(openErrorModal({ errorText: ["Invalid credentials"] }));

               if (currentPath === "/login/organizer" && !data.payload.is_organizer)
                  return dispatch(openErrorModal({ errorText: ["Invalid credentials"] }));

               if (currentPath === "/login/teacher") {
                  router.push("/teachers/addClass");
               } else if (currentPath === "/login/parent") {
                  router.push("/parents");
               } else if (currentPath === "/login/organizer") {
                  router.push("/organizers");
               } else {
                  window.location.href = "https://play.codealgoacademy.com";
               }
            }
         } else if (currentPath.includes("/signup")) {
            const signUpData = await dispatch(
               signUpWithApple({
                  id_token: response.id_token,
                  role: account.toLowerCase(),
                  first_name: firstName,
                  last_name: lastName,
               }) as any
            );

            if (signUpData?.payload?.access_token && !signUpData?.payload?.error) {
               const updateData = await dispatch(updateAccountType(account) as any);

               if (!updateData?.payload?.error) {
                  if (account === "Teacher") {
                     router.push("/teachers/addClass");
                  } else if (account === "Parent") {
                     router.push("/parents");
                  } else if (account === "Organizer") {
                     router.push("/organizers");
                  } else {
                     window.location.href = "https://play.codealgoacademy.com";
                  }
               }
            }
         }
      } catch (err: any) {
    console.log("APPLE ERROR");
    console.log(err);
    console.log(JSON.stringify(err, null, 2));
    console.log("APPLE CLIENT ID:", process.env.NEXT_PUBLIC_APPLE_CLIENT_ID);
console.log(typeof process.env.NEXT_PUBLIC_APPLE_CLIENT_ID);

    dispatch(
        openErrorModal({
            errorText: [
                err?.error ||
                err?.message ||
                "Something went wrong during Apple authentication."
            ],
        })
    );
}
   };

   return (
      <div className="relative w-full flex-1">
         <button
            onClick={() => handleClick()}
            className="mt-6 flex h-[2.5rem] w-full items-center justify-center gap-4 rounded-xl bg-neutral-100/70 text-center font-semibold text-black"
            type="button"
         >
            <i className="text-[22px]">
               <FcGoogle />
            </i>
             <span>{router.pathname.includes("/login") ? t("login") : t("signUp")} with Google</span>
         </button>
         <button
            onClick={handleAppleClick}
            className="mt-6 flex h-[2.5rem] w-full items-center justify-center gap-4 rounded-xl bg-neutral-100/70 text-center font-semibold text-black"
            type="button"
         >
            <i className="text-[22px]">
               <FaApple />
            </i>
            <span>{router.pathname.includes("/login") ? "Sign in" : "Sign up"} with Apple</span>
         </button>

         {confirmationData && (
            <RoleConfirmationModal
               isOpen={!!confirmationData}
               onClose={() => setConfirmationData(null)}
               confirmationData={confirmationData}
               intendedRole={label(account)}
               onConfirm={handleRoleConfirmation}
            />
         )}
      </div>
   );
};

export default GoogleBtn;
