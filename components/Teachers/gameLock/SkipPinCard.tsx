import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "store/store";
import { getSkipPin, getSkipPinLog, regenerateSkipPin, setSkipPin, SkipPinUse } from "services/skipPinService";

// Teacher PIN for the in game help (press ~ 3 times, then the teacher types this).
// Each teacher has their own, so a PIN a student saw only affects this teacher's
// students and can be swapped here in one click.
export default function SkipPinCard() {
   const { t } = useTranslation("teacher");
   const { id: classId } = useSelector((state: RootState) => state.currentClass);

   const [pin, setPin] = useState("");
   const [shown, setShown] = useState(false);
   const [editing, setEditing] = useState(false);
   const [draft, setDraft] = useState("");
   const [error, setError] = useState("");
   const [busy, setBusy] = useState(false);
   const [log, setLog] = useState<SkipPinUse[]>([]);

   const loadLog = useCallback(() => {
      getSkipPinLog(classId)
         .then(setLog)
         .catch(() => setLog([]));
   }, [classId]);

   useEffect(() => {
      getSkipPin()
         .then((d) => setPin(d.pin))
         .catch(() => setError(t("skipPinLoadError")));
   }, [t]);

   useEffect(() => {
      loadLog();
   }, [loadLog]);

   const regenerate = async () => {
      setBusy(true);
      setError("");
      try {
         const d = await regenerateSkipPin();
         setPin(d.pin);
         setShown(true);
      } catch {
         setError(t("skipPinSaveError"));
      } finally {
         setBusy(false);
      }
   };

   const save = async () => {
      if (!/^\d{4,6}$/.test(draft)) {
         setError(t("skipPinFormat"));
         return;
      }
      setBusy(true);
      setError("");
      try {
         const d = await setSkipPin(draft);
         setPin(d.pin);
         setShown(true);
         setEditing(false);
      } catch {
         setError(t("skipPinSaveError"));
      } finally {
         setBusy(false);
      }
   };

   const describe = (row: SkipPinUse) => {
      if (row.success) return row.action === "skip" ? t("skipPinUsedSkip") : t("skipPinUsedSolution");
      if (row.reason === "limit") return t("skipPinLimitHit");
      return t("skipPinWrongGuess");
   };

   return (
      <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
         <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
               <h2 className="text-xl font-bold text-slate-800">{t("skipPinTitle")}</h2>
               <p className="mt-1 text-sm text-slate-500">{t("skipPinDescription")}</p>
            </div>

            {editing ? (
               <div className="flex items-center gap-3">
                  <input
                     value={draft}
                     onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 6))}
                     inputMode="numeric"
                     autoFocus
                     className="w-36 rounded-xl border-2 border-slate-200 px-4 py-2 text-center text-2xl font-bold tracking-[0.3em] text-slate-800 outline-none focus:border-blue-400"
                     placeholder="0000"
                  />
                  <button
                     disabled={busy}
                     onClick={save}
                     className="bg-mainColor rounded-xl px-5 py-2 font-bold text-white disabled:opacity-50"
                  >
                     {t("save")}
                  </button>
                  <button
                     onClick={() => {
                        setEditing(false);
                        setError("");
                     }}
                     className="rounded-xl px-3 py-2 font-bold text-slate-400"
                  >
                     {t("cancel")}
                  </button>
               </div>
            ) : (
               <div className="flex items-center gap-3">
                  <button
                     onClick={() => setShown((s) => !s)}
                     title={shown ? t("skipPinHide") : t("skipPinShow")}
                     className="min-w-[9rem] rounded-xl bg-slate-50 px-5 py-2 text-center font-mono text-3xl font-bold tracking-[0.3em] text-slate-800"
                  >
                     {pin ? (shown ? pin : "•".repeat(pin.length)) : "..."}
                  </button>
                  <button
                     disabled={busy}
                     onClick={regenerate}
                     className="whitespace-nowrap rounded-xl border-2 border-slate-100 bg-white px-4 py-2 font-bold text-blue-600 hover:border-blue-200 hover:bg-blue-50 disabled:opacity-50"
                  >
                     {t("skipPinNew")}
                  </button>
                  <button
                     onClick={() => {
                        setDraft("");
                        setError("");
                        setEditing(true);
                     }}
                     className="whitespace-nowrap rounded-xl px-3 py-2 font-bold text-slate-500 hover:text-slate-700"
                  >
                     {t("edit")}
                  </button>
               </div>
            )}
         </div>

         {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}

         <div className="mt-6 border-t border-slate-100 pt-4">
            <div className="mb-2 flex items-center justify-between">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t("skipPinRecent")}</p>
               <button onClick={loadLog} className="text-xs font-bold text-blue-600">
                  {t("skipPinRefresh")}
               </button>
            </div>
            {log.length === 0 ? (
               <p className="text-sm text-slate-400">{t("skipPinNoUses")}</p>
            ) : (
               <ul className="max-h-64 divide-y divide-slate-50 overflow-y-auto">
                  {log.map((row) => (
                     <li key={row.id} className="flex items-center justify-between py-2 text-sm">
                        <span className="font-semibold text-slate-700">
                           {row.first_name || row.last_name ? `${row.first_name} ${row.last_name}` : `@${row.username}`}
                        </span>
                        <span className={row.success ? "text-slate-600" : "font-semibold text-amber-500"}>
                           {describe(row)} {row.unit_level && <span className="text-slate-400">({row.unit_level.replace("_", "-")})</span>}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(row.created_at).toLocaleString()}</span>
                     </li>
                  ))}
               </ul>
            )}
         </div>
      </div>
   );
}
