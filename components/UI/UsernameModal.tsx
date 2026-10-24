import { FC, FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import http from "axios.config";
import { getAccessToken, updateUserInLocalStorage } from "utils/getTokens";

/**
 * Shown once after an Apple / Google sign-up. Those accounts come back with their
 * email (often an Apple private relay address) as the username, so we ask for a
 * real one. Posts to /auth/username/.
 */
const UsernameModal: FC<{ suggestion?: string; onDone: (user: any) => void }> = ({ suggestion, onDone }) => {
   const { t } = useTranslation("auth");
   const [value, setValue] = useState(suggestion || "");
   const [error, setError] = useState("");
   const [busy, setBusy] = useState(false);

   const submit = async (e: FormEvent) => {
      e.preventDefault();
      setBusy(true);
      setError("");
      try {
         const { data } = await http.post(
            "/auth/username/",
            { username: value.trim() },
            { headers: { Authorization: `Bearer ${getAccessToken()}` } }
         );
         updateUserInLocalStorage(data);
         onDone(data);
      } catch (err: any) {
         const d = err?.response?.data;
         setError(d?.detail || d?.details?.[0]?.detail || t("usernameFailed"));
      } finally {
         setBusy(false);
      }
   };

   return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4">
         <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">{t("usernameTitle")}</h2>
            <p className="mt-2 text-sm text-gray-600">{t("usernameHelp")}</p>
            <input
               autoFocus
               value={value}
               onChange={(e) => setValue(e.target.value)}
               maxLength={30}
               className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-mainColor"
               placeholder={t("usernamePlaceholder")}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button
               type="submit"
               disabled={busy || value.trim().length < 3}
               className="mt-5 w-full rounded-xl bg-mainColor py-3 font-semibold text-white disabled:opacity-60"
            >
               {t("usernameSave")}
            </button>
         </form>
      </div>
   );
};

export default UsernameModal;
