import { FC } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import { APP_RETURN_URL, WEB_GAME_URL } from "./activateApi";

const ReturnToGame: FC<{ message: string }> = ({ message }) => {
   const { t } = useTranslation("auth");
   return (
      <div className="text-center">
         <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
         <h2 className="mt-4 text-xl font-semibold text-green-700">{t("activateDoneTitle")}</h2>
         <p className="mt-2 text-gray-600">{message}</p>
         <a
            href={APP_RETURN_URL}
            className="mt-6 block w-full rounded-xl bg-mainColor py-3 text-center font-semibold text-white"
         >
            {t("activateBackToApp")}
         </a>
         <a href={WEB_GAME_URL} className="mt-3 block w-full rounded-xl border border-gray-300 py-3 text-center font-semibold text-gray-800">
            {t("activatePlayOnWeb")}
         </a>
         <p className="mt-4 text-sm text-gray-500">{t("activateCloseHint")}</p>
      </div>
   );
};

export default ReturnToGame;
