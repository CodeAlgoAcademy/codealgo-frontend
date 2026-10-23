import React, { ChangeEvent, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store/store";
import { useRouter } from "next/router";
import { loginUser } from "services/authService";
import AuthLayout from "@/components/layouts/AuthLayout";
import GoogleBtn from "@/components/UI/googleBtn";
import AppleBtn from "@/components/UI/appleBtn";
import { updateUser } from "store/authSlice";
import { openErrorModal } from "store/fetchSlice";
import { AuthButton } from "../UI/Button";
import Link from "next/link";
import ResendVerificationEmailModal from "../modals/ResendVerificationEmailModal";
import { PasswordInput } from "../UI/input";
import { useTranslation } from "react-i18next";
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

const Login = ({ route }: { route?: any }) => {
   const dispatch = useDispatch();
   const router = useRouter();
   const credentials = useSelector((state: RootState) => state.user?.auth);
   const [recaptchaVerified, setRecaptchaVerified] = useState(false);
   const [verificationModalOpened, setVerificationModalOpened] = useState<boolean>(false);
   const { t } = useTranslation("auth");

   const requestedRole: AccountRole = roleFromPath(router.pathname);
   const label = (role: AccountRole) => t(roleLabelKey(role));

   const goTo = useCallback(
      (role: AccountRole) => {
         const destination = destinationFor(role, role === "parent" && Boolean(route));
         if (isExternalDestination(destination)) {
            window.location.href = destination;
         } else {
            router.push(destination);
         }
      },
      [route, router]
   );

   /**
    * Says which account this actually is and where it logs in, instead of the
    * old blanket "Invalid credentials".
    */
   const wrongRoleMessage = (roles: AccountRole[]): string[] => {
      const actual = roles.map(label).join(" / ");

      return [
         roles.length === 1
            ? t("wrongRoleTitleOne", { actual, requested: label(requestedRole) })
            : t("wrongRoleTitleMany", { actual, requested: label(requestedRole) }),
         roles.length === 1
            ? t("wrongRoleAction", { page: loginPageFor(roles[0]) })
            : t("wrongRoleActionMany", { pages: roles.map(loginPageFor).join(", ") }),
         t("wrongRolePasswordFine"),
      ];
   };

   const login = async (event: ChangeEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = await dispatch(loginUser());

      // A rejected thunk has already shown the reason via errorResolver.
      if (loginUser.rejected.match(data) || data?.error?.message) return;

      const user = data?.payload;
      const resolution = resolveLogin(user, requestedRole);

      if (resolution.status === "ok") {
         goTo(resolution.role);
         return;
      }

      // The credentials were right, so the thunk has already stored a token.
      // They are not going any further from this page, so do not leave a
      // half-signed-in session behind them.
      clearSession(dispatch);

      dispatch(
         openErrorModal({
            errorText:
               resolution.status === "wrongRole"
                  ? wrongRoleMessage(resolution.roles)
                  : [t("noRoleAccess", { requested: label(requestedRole) })],
         })
      );
   };

   const onReCaptchaVerify = useCallback(async () => {
      setRecaptchaVerified(() => true);
   }, []);

   const onReCaptchaExpire = useCallback(async () => {
      setRecaptchaVerified(() => false);
   }, []);

   return (
      <>
         {verificationModalOpened && (
            <ResendVerificationEmailModal
               closeModal={() => {
                  setVerificationModalOpened(false);
               }}
            />
         )}
         <AuthLayout>
            <>
               <h1 className="text-center text-[25px] font-bold md:text-left md:text-[32px]">
                  {t("logInToYourAccount")} <span>{`(${label(requestedRole)})`}</span>
               </h1>
               <form onSubmit={login}>
                  <label className="mt-6 block text-xl font-semibold">{t("yourEmailOrUsername")}</label>
                  <input
                     value={credentials?.email}
                     onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        dispatch(updateUser({ key: "email", value: e.target.value }));
                     }}
                     type="text"
                     className="auth-input"
                     placeholder={t("enterEmailOrUsername")}
                     required
                  />
                  <label className="mt-6 block text-xl font-semibold">{t("password")}</label>

                  <PasswordInput
                     value={credentials?.password ?? ""}
                     onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        dispatch(updateUser({ key: "password", value: e.target.value }));
                     }}
                  />
                  <div className="mt-2 flex items-center justify-between">
                     <Link href="/change-password">
                         <p className="max-w-fit cursor-pointer font-bold text-[#222] underline">{t("forgotPassword")}</p>
                     </Link>

                     <p className="max-w-fit cursor-pointer font-bold text-[#222] underline" onClick={() => setVerificationModalOpened(true)}>
                         {t("verifyAccount")}
                     </p>
                  </div>
                  <AuthButton text={t("logIn")} />
                  <GoogleBtn />
                  <AppleBtn />
               </form>
            </>
         </AuthLayout>
      </>
   );
};

export default Login;
