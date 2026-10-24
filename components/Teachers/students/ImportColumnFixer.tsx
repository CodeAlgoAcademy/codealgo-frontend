import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaChevronRight, FaMagic, FaRedo } from "react-icons/fa";
import { ImportMeta, ImportOptions } from "services/studentImportService";

const FIELD_ORDER = [
   "fullName",
   "firstName",
   "lastName",
   "preferredName",
   "email",
   "username",
   "password",
   "dob",
   "grade",
   "studentNumber",
];

/**
 * Shows what the parser decided about the file and lets the teacher overrule
 * it: which sheet, which row is the header, and what every column is. Opens
 * on its own when the parser was unsure or found nobody.
 */
const ImportColumnFixer = ({
   meta,
   busy,
   onApply,
   onAi,
}: {
   meta: ImportMeta;
   busy: boolean;
   onApply: (options: ImportOptions) => void;
   onAi: (sheet: string | undefined) => void;
}) => {
   const { t } = useTranslation("teacher");
   const unsure = meta.needsMapping || meta.confidence === "low" || meta.confidence === "none";
   const [open, setOpen] = useState(unsure);
   const [sheet, setSheet] = useState<string>("auto");
   const [headerRow, setHeaderRow] = useState<number | null>(meta.headerRow ?? null);
   const [mapping, setMapping] = useState<Record<number, string>>({});
   const [touched, setTouched] = useState({ sheet: false, header: false, mapping: false });

   // A new parse result resets the form to what the server now thinks.
   useEffect(() => {
      const m: Record<number, string> = {};
      (meta.columns || []).forEach((c) => {
         if (c.field) m[c.index] = c.field;
      });
      setMapping(m);
      setHeaderRow(meta.headerRow ?? null);
      setSheet((meta.sheets || []).filter((s) => s.used).length > 1 ? "auto" : meta.sheet || "auto");
      setTouched({ sheet: false, header: false, mapping: false });
      if (meta.needsMapping || meta.confidence === "low") setOpen(true);
   }, [meta]);

   const setField = (index: number, field: string) => {
      setMapping((prev) => {
         const next: Record<number, string> = {};
         Object.entries(prev).forEach(([k, v]) => {
            // One column per field: picking "Email" here clears it elsewhere.
            if (v !== field) next[Number(k)] = v;
         });
         if (field) next[index] = field;
         return next;
      });
      setTouched((p) => ({ ...p, mapping: true }));
   };

   const apply = () => {
      const opts: ImportOptions = {};
      const chosenSheet = sheet === "auto" ? undefined : sheet;
      if (chosenSheet) opts.sheet = chosenSheet;
      if (touched.header || touched.mapping) opts.headerRow = headerRow;
      if (touched.mapping) {
         // A column map only makes sense for one sheet.
         opts.sheet = chosenSheet || meta.sheet;
         opts.mapping = Object.fromEntries(Object.entries(mapping).map(([k, v]) => [String(k), v]));
      }
      onApply(opts);
   };

   const hasName = Object.values(mapping).some((f) => ["fullName", "firstName", "lastName"].includes(f));
   const dirty = touched.sheet || touched.header || touched.mapping;
   const sheets = meta.sheets || [];

   return (
      <div className={`mb-3 rounded-lg border ${unsure ? "border-yellow-300 bg-yellow-50" : "border-gray-200 bg-gray-50"}`}>
         <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-gray-800"
            onClick={() => setOpen((o) => !o)}
         >
            {open ? <FaChevronDown /> : <FaChevronRight />}
            {t("importFixColumns")}
            <span className="ml-2 text-xs font-normal text-gray-500">
               {meta.strategy === "keyValue"
                  ? t("importStrategyKeyValue")
                  : meta.strategy === "ai"
                  ? t("importStrategyAi")
                  : t(`importConfidence_${meta.confidence || "none"}`)}
            </span>
         </button>

         {(meta.warnings || []).length > 0 && (
            <div className="px-3 pb-2 text-xs text-yellow-800">
               {meta.warnings!.map((w, i) => (
                  <p key={i}>{w}</p>
               ))}
            </div>
         )}

         {meta.needsMapping && (
            <p className="px-3 pb-2 text-sm text-gray-700">{t("importNeedsMapping")}</p>
         )}

         {open && (
            <div className="space-y-4 border-t px-3 py-3 text-sm">
               {sheets.length > 1 && (
                  <label className="flex flex-wrap items-center gap-2">
                     <span className="font-medium">{t("importSheet")}</span>
                     <select
                        className="rounded border border-gray-300 px-2 py-1"
                        value={sheet}
                        disabled={busy}
                        onChange={(e) => {
                           setSheet(e.target.value);
                           setTouched((p) => ({ ...p, sheet: true }));
                        }}
                     >
                        <option value="auto">{t("importSheetAuto")}</option>
                        {sheets.map((s) => (
                           <option key={s.name} value={s.name}>
                              {s.name} ({s.rows}){s.used ? " ✓" : ""}
                           </option>
                        ))}
                     </select>
                  </label>
               )}

               {(meta.preview || []).length > 0 && (
                  <div>
                     <div className="mb-1 flex flex-wrap items-center gap-3">
                        <span className="font-medium">{t("importHeaderRow")}</span>
                        <span className="text-xs text-gray-500">{t("importClickHeaderRow")}</span>
                        <button
                           type="button"
                           className={`rounded px-2 py-0.5 text-xs ${headerRow === null ? "bg-mainColor text-white" : "bg-white border"}`}
                           onClick={() => {
                              setHeaderRow(null);
                              setTouched((p) => ({ ...p, header: true }));
                           }}
                        >
                           {t("importNoHeader")}
                        </button>
                     </div>
                     <div className="max-h-48 overflow-auto rounded border bg-white">
                        <table className="w-full text-xs">
                           <tbody>
                              {meta.preview!.map((r) => (
                                 <tr
                                    key={r.row}
                                    onClick={() => {
                                       setHeaderRow(r.row);
                                       setTouched((p) => ({ ...p, header: true }));
                                    }}
                                    className={`cursor-pointer border-t ${
                                       headerRow === r.row ? "bg-blue-100 font-semibold" : "hover:bg-gray-50"
                                    }`}
                                 >
                                    <td className="w-10 px-2 py-1 text-gray-400">{r.row}</td>
                                    {r.cells.map((c, i) => (
                                       <td key={i} className="max-w-[160px] truncate px-2 py-1">
                                          {c}
                                       </td>
                                    ))}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}

               {(meta.columns || []).length > 0 && (
                  <div>
                     <p className="mb-1 font-medium">{t("importColumnsHint")}</p>
                     <div className="grid gap-2 md:grid-cols-2">
                        {meta.columns!.map((c) => (
                           <div key={c.index} className="flex items-center gap-2 rounded border bg-white p-2">
                              <div className="min-w-0 flex-1">
                                 <p className="truncate text-xs font-semibold text-gray-700">
                                    {c.header || t("importColumnN", { n: c.index + 1 })}
                                 </p>
                                 <p className="truncate text-xs text-gray-500">{c.samples.join(" · ") || "-"}</p>
                              </div>
                              <select
                                 className={`w-40 rounded border px-1 py-1 text-xs ${
                                    mapping[c.index] ? "border-mainColor" : "border-gray-300"
                                 }`}
                                 value={mapping[c.index] || ""}
                                 disabled={busy}
                                 onChange={(e) => setField(c.index, e.target.value)}
                              >
                                 <option value="">{t("importIgnore")}</option>
                                 {FIELD_ORDER.map((f) => (
                                    <option key={f} value={f}>
                                       {t(`importField_${f}`)}
                                    </option>
                                 ))}
                              </select>
                           </div>
                        ))}
                     </div>
                     {touched.mapping && !hasName && <p className="mt-1 text-xs text-red-600">{t("importNeedNameColumn")}</p>}
                  </div>
               )}

               <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <button
                     type="button"
                     disabled={busy || !dirty || (touched.mapping && !hasName)}
                     onClick={apply}
                     className="flex items-center justify-center gap-2 rounded-full bg-mainColor px-4 py-2 font-semibold text-white disabled:opacity-50"
                  >
                     <FaRedo /> {t("importApply")}
                  </button>
                  <button
                     type="button"
                     disabled={busy}
                     onClick={() => onAi(sheet === "auto" ? meta.sheet : sheet)}
                     className="flex items-center justify-center gap-2 rounded-full border border-purple-400 px-4 py-2 font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                  >
                     <FaMagic /> {t("importAiRead")}
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

export default ImportColumnFixer;
