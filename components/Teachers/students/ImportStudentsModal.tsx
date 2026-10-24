import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { FaTimes, FaFileUpload, FaDownload, FaPrint, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { RootState } from "store/store";
import { openSuccessModal } from "store/modalSlice";
import {
   commitImport,
   CreatedLogin,
   GOOGLE_CLASSROOM_CLIENT_ID,
   GOOGLE_CLASSROOM_SCOPES,
   GoogleCourse,
   googleCourses,
   googlePreview,
   IMPORT_CHUNK,
   ImportPreview,
   ImportResult,
   ImportRow,
   importErrorMessage,
   previewImport,
   recheckImport,
} from "services/studentImportService";

type Step = "upload" | "courses" | "review" | "importing" | "done";
type Filter = "all" | "issues";

const ACCEPT = ".csv,.txt,.xlsx,.xls,.pdf";

const STATUS_STYLE: Record<string, string> = {
   new: "bg-green-100 text-green-800",
   existing: "bg-blue-100 text-blue-800",
   in_class: "bg-gray-200 text-gray-700",
   duplicate: "bg-yellow-100 text-yellow-800",
   error: "bg-red-100 text-red-700",
};

const csvCell = (v: string | number) => {
   const s = String(v ?? "");
   return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const downloadText = (name: string, text: string, type = "text/csv") => {
   const blob = new Blob([text], { type });
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = name;
   document.body.appendChild(a);
   a.click();
   a.remove();
   setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const emptyResult = (): ImportResult => ({
   created: [],
   linked: [],
   skipped: [],
   failed: [],
   summary: { created: 0, linked: 0, skipped: 0, failed: 0 },
});

// Classroom runs on its own OAuth client (tristedw's CodeAlgo Cloud project,
// where the Classroom API and scopes are set up), not the one the site uses
// for Google sign in. So it gets its own provider, and the hook has to live
// inside it.
const ClassroomConnect = ({
   disabled,
   label,
   onToken,
   onError,
}: {
   disabled: boolean;
   label: string;
   onToken: (token: string) => void;
   onError: () => void;
}) => {
   const connect = useGoogleLogin({
      scope: GOOGLE_CLASSROOM_SCOPES,
      onSuccess: ({ access_token }) => onToken(access_token),
      onError,
   });
   return (
      <button
         type="button"
         disabled={disabled}
         onClick={() => connect()}
         className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 py-3 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
      >
         <FcGoogle className="text-2xl" /> {label}
      </button>
   );
};

const ImportStudentsModal = ({ onClose, onImported }: { onClose: () => void; onImported?: () => void }) => {
   const { t } = useTranslation("teacher");
   const dispatch = useDispatch();
   const classId = useSelector((state: RootState) => state.currentClass.id);
   const className = useSelector((state: RootState) => state.currentClass.className);

   const [step, setStep] = useState<Step>("upload");
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState("");
   const [dragging, setDragging] = useState(false);
   const [fileName, setFileName] = useState("");
   const [rows, setRows] = useState<ImportRow[]>([]);
   const [meta, setMeta] = useState<ImportPreview["meta"]>();
   const [stale, setStale] = useState(false);
   const [filter, setFilter] = useState<Filter>("all");
   const [progress, setProgress] = useState({ done: 0, total: 0 });
   const [result, setResult] = useState<ImportResult>(emptyResult());
   const inputRef = useRef<HTMLInputElement>(null);
   const [mounted, setMounted] = useState(false);
   const [googleToken, setGoogleToken] = useState("");
   const [courses, setCourses] = useState<GoogleCourse[]>([]);

   // Portal to body. Rendered inline it inherits the add student modal's
   // stacking context and the sidebar ends up on top of it.
   useEffect(() => setMounted(true), []);

   const counts = useMemo(() => {
      const c = { new: 0, existing: 0, skip: 0, error: 0, selected: 0 };
      rows.forEach((r) => {
         if (r.status === "new") c.new++;
         else if (r.status === "existing") c.existing++;
         else if (r.status === "error") c.error++;
         else c.skip++;
         if (r.include && (r.status === "new" || r.status === "existing")) c.selected++;
      });
      return c;
   }, [rows]);

   const visibleRows = filter === "issues" ? rows.filter((r) => r.status !== "new" || r.messages.length) : rows;

   const showPreview = (preview: ImportPreview) => {
      setRows(preview.rows);
      setMeta(preview.meta);
      setStale(false);
      setFilter(preview.rows.some((r) => r.status !== "new") ? "issues" : "all");
      setStep("review");
   };

   const handleFile = async (file?: File | null) => {
      if (!file || !classId) return;
      setError("");
      setFileName(file.name);
      setBusy(true);
      try {
         showPreview(await previewImport(classId, file));
      } catch (e: any) {
         setError(importErrorMessage(e, t("importReadFailed")));
      } finally {
         setBusy(false);
      }
   };

   const onGoogleToken = async (access_token: string) => {
      if (!classId) return;
      setGoogleToken(access_token);
      setError("");
      setBusy(true);
      try {
         const list = await googleCourses(classId, access_token);
         setCourses(list);
         setStep("courses");
      } catch (e: any) {
         setError(importErrorMessage(e, t("importGoogleFailed")));
      } finally {
         setBusy(false);
      }
   };

   const pickCourse = async (course: GoogleCourse) => {
      if (!classId) return;
      setError("");
      setBusy(true);
      setFileName(course.section ? `${course.name} (${course.section})` : course.name);
      try {
         showPreview(await googlePreview(classId, googleToken, course.id));
      } catch (e: any) {
         if (e?.response?.status === 401) {
            setGoogleToken("");
            setStep("upload");
         }
         setError(importErrorMessage(e, t("importGoogleFailed")));
      } finally {
         setBusy(false);
      }
   };

   const updateRow = (rowNum: number, patch: Partial<ImportRow>) => {
      setRows((prev) => prev.map((r) => (r.row === rowNum ? { ...r, ...patch } : r)));
      setStale(true);
   };

   const editField = (r: ImportRow, field: keyof ImportRow, value: string) => {
      const patch: Partial<ImportRow> = { [field]: value } as Partial<ImportRow>;
      if (field === "username") patch.usernameGenerated = false;
      if (field === "password") patch.passwordGenerated = false;
      if (r.status === "error") patch.include = true; // fixing it means they want it in
      updateRow(r.row, patch);
   };

   const toggleInclude = (r: ImportRow) => {
      const include = !r.include;
      // Ticking a row the server held back because of a matching name means
      // "these are two different kids". A real account match cannot be forced.
      if (include && (r.status === "in_class" || r.status === "duplicate") && !r.existingId) {
         updateRow(r.row, { include, allowSameName: true });
      } else {
         setRows((prev) => prev.map((x) => (x.row === r.row ? { ...x, include } : x)));
      }
   };

   const recheck = async () => {
      if (!classId) return;
      setBusy(true);
      setError("");
      try {
         const checked = await recheckImport(classId, rows);
         setRows(checked.rows);
         setStale(false);
      } catch (e: any) {
         setError(importErrorMessage(e, t("importCheckFailed")));
      } finally {
         setBusy(false);
      }
   };

   const runImport = async () => {
      if (!classId) return;
      const toSend = rows.filter((r) => r.include && (r.status === "new" || r.status === "existing"));
      if (!toSend.length) return;
      setStep("importing");
      setError("");
      setProgress({ done: 0, total: toSend.length });
      const total = emptyResult();
      for (let i = 0; i < toSend.length; i += IMPORT_CHUNK) {
         const chunk = toSend.slice(i, i + IMPORT_CHUNK);
         try {
            const res = await commitImport(classId, chunk);
            total.created.push(...res.created);
            total.linked.push(...res.linked);
            total.skipped.push(...res.skipped);
            total.failed.push(...res.failed);
         } catch (e: any) {
            const msg = importErrorMessage(e, t("importChunkFailed"));
            chunk.forEach((r) =>
               total.failed.push({ row: r.row, firstName: r.firstName, lastName: r.lastName, messages: [msg] })
            );
         }
         setProgress({ done: Math.min(i + IMPORT_CHUNK, toSend.length), total: toSend.length });
      }
      total.summary = {
         created: total.created.length,
         linked: total.linked.length,
         skipped: total.skipped.length,
         failed: total.failed.length,
      };
      setResult(total);
      setStep("done");
      if (total.created.length || total.linked.length) onImported?.();
   };

   const downloadTemplate = () => {
      downloadText(
         "codealgo-student-template.csv",
         "First Name,Last Name,Email,Username,Password,Birthdate\nMia,Kowalski,,,,2016-05-01\nLiam,Chen,,,,\n"
      );
   };

   const downloadLogins = (created: CreatedLogin[]) => {
      const lines = [["First Name", "Last Name", "Username", "Password", "Email"].join(",")];
      created.forEach((c) =>
         lines.push([c.firstName, c.lastName, c.username, c.password, c.email].map(csvCell).join(","))
      );
      const safe = (className || "class").replace(/[^\w-]+/g, "_");
      downloadText(`${safe}-student-logins.csv`, "﻿" + lines.join("\n") + "\n");
   };

   const printCards = () => {
      onClose();
      dispatch(openSuccessModal({ message: t("importDone"), type: "pdf" }));
   };

   const close = () => {
      if (step === "importing") return;
      if (step === "done" && result.created.length) {
         if (!window.confirm(t("importCloseWarning"))) return;
      }
      onClose();
   };

   const input = (r: ImportRow, field: "firstName" | "lastName" | "username" | "password" | "email", width: string) => (
      <input
         value={(r[field] as string) || ""}
         disabled={r.status === "existing" || (r.status === "in_class" && !!r.existingId)}
         onChange={(e) => editField(r, field, e.target.value)}
         className={`${width} rounded border border-gray-300 px-2 py-1 text-sm disabled:border-transparent disabled:bg-transparent`}
         spellCheck={false}
      />
   );

   if (!mounted) return null;

   return createPortal(
      <section className="fixed inset-0 z-[1000] overflow-y-auto bg-black/60" data-testid="import-students-modal">
         <div className="flex min-h-full items-center justify-center p-4">
            <main className="relative w-full max-w-[1100px] rounded-xl bg-white p-6 shadow-2xl">
               <header className="mb-4 flex items-start justify-between gap-4">
                  <div>
                     <h1 className="text-xl font-bold text-gray-800 md:text-2xl">{t("importTitle")}</h1>
                     {className && <p className="text-sm text-gray-500">{className}</p>}
                  </div>
                  {step !== "importing" && (
                     <button className="text-2xl text-red-600" onClick={close} aria-label="close">
                        <FaTimes />
                     </button>
                  )}
               </header>

               {error && (
                  <p className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                     <FaExclamationTriangle /> {error}
                  </p>
               )}

               {step === "upload" && (
                  <div>
                     <p className="mb-4 text-sm text-gray-600">{t("importIntro")}</p>
                     <div
                        onDragOver={(e) => {
                           e.preventDefault();
                           setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                           e.preventDefault();
                           setDragging(false);
                           handleFile(e.dataTransfer.files?.[0]);
                        }}
                        onClick={() => !busy && inputRef.current?.click()}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
                           dragging ? "border-mainColor bg-blue-50" : "border-gray-300 hover:bg-gray-50"
                        }`}
                     >
                        <FaFileUpload className="text-4xl text-mainColor" />
                        <p className="font-semibold text-gray-800">{busy ? t("importReading", { name: fileName }) : t("importDrop")}</p>
                        <p className="text-xs text-gray-500">{t("importFormats")}</p>
                        <input
                           ref={inputRef}
                           type="file"
                           accept={ACCEPT}
                           className="hidden"
                           value=""
                           onChange={(e) => handleFile(e.target.files?.[0])}
                        />
                     </div>
                     <div className="my-4 flex items-center gap-3 text-xs uppercase text-gray-400">
                        <span className="h-px flex-1 bg-gray-200" />
                        {t("importOr")}
                        <span className="h-px flex-1 bg-gray-200" />
                     </div>
                     <GoogleOAuthProvider clientId={GOOGLE_CLASSROOM_CLIENT_ID}>
                        <ClassroomConnect
                           disabled={busy}
                           label={t("importFromGoogle")}
                           onToken={onGoogleToken}
                           onError={() => setError(t("importGoogleFailed"))}
                        />
                     </GoogleOAuthProvider>
                     <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-600">
                        <li>{t("importTipNames")}</li>
                        <li>{t("importTipCreds")}</li>
                        <li>{t("importTipDupes")}</li>
                     </ul>
                     <button onClick={downloadTemplate} className="mt-4 flex items-center gap-2 text-sm text-mainColor hover:underline">
                        <FaDownload /> {t("importTemplate")}
                     </button>
                  </div>
               )}

               {step === "courses" && (
                  <div>
                     <p className="mb-3 text-sm text-gray-600">{t("importPickCourse")}</p>
                     {courses.length === 0 ? (
                        <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">{t("importNoCourses")}</p>
                     ) : (
                        <div className="grid max-h-[55vh] gap-2 overflow-auto md:grid-cols-2">
                           {courses.map((c) => (
                              <button
                                 key={c.id}
                                 disabled={busy}
                                 onClick={() => pickCourse(c)}
                                 className="rounded-lg border border-gray-200 p-4 text-left hover:border-mainColor hover:bg-blue-50 disabled:opacity-60"
                              >
                                 <p className="font-semibold text-gray-800">{c.name}</p>
                                 {(c.section || c.room) && (
                                    <p className="text-xs text-gray-500">{[c.section, c.room].filter(Boolean).join(" · ")}</p>
                                 )}
                              </button>
                           ))}
                        </div>
                     )}
                     {busy && <p className="mt-3 text-sm text-gray-500">{t("importLoadingRoster")}</p>}
                     <button className="mt-4 rounded-full px-4 py-2 text-sm hover:bg-gray-100" onClick={() => setStep("upload")} disabled={busy}>
                        {t("importBack")}
                     </button>
                  </div>
               )}

               {step === "review" && (
                  <div>
                     <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">{t("importCountNew", { count: counts.new })}</span>
                        {counts.existing > 0 && (
                           <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">{t("importCountExisting", { count: counts.existing })}</span>
                        )}
                        {counts.skip > 0 && (
                           <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-700">{t("importCountSkip", { count: counts.skip })}</span>
                        )}
                        {counts.error > 0 && (
                           <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">{t("importCountError", { count: counts.error })}</span>
                        )}
                        <span className="ml-auto text-xs text-gray-500">
                           {fileName}
                           {meta?.source === "google"
                              ? ` (${t("importGoogleSource")})`
                              : meta?.source
                              ? ` (${meta.source.toUpperCase()})`
                              : ""}
                        </span>
                     </div>
                     <div className="mb-2 flex gap-2 text-sm">
                        <button
                           className={`rounded px-3 py-1 ${filter === "all" ? "bg-mainColor text-white" : "bg-gray-100"}`}
                           onClick={() => setFilter("all")}
                        >
                           {t("importShowAll", { count: rows.length })}
                        </button>
                        <button
                           className={`rounded px-3 py-1 ${filter === "issues" ? "bg-mainColor text-white" : "bg-gray-100"}`}
                           onClick={() => setFilter("issues")}
                        >
                           {t("importShowIssues")}
                        </button>
                     </div>
                     <div className="max-h-[55vh] overflow-auto rounded border">
                        <table className="w-full min-w-[900px] text-left text-sm">
                           <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
                              <tr>
                                 <th className="p-2"></th>
                                 <th className="p-2">{t("importColFirst")}</th>
                                 <th className="p-2">{t("importColLast")}</th>
                                 <th className="p-2">{t("importColUsername")}</th>
                                 <th className="p-2">{t("importColPassword")}</th>
                                 <th className="p-2">{t("importColEmail")}</th>
                                 <th className="p-2">{t("importColStatus")}</th>
                              </tr>
                           </thead>
                           <tbody>
                              {visibleRows.map((r) => {
                                 const lockedOut = r.status === "error" || (r.status === "in_class" && !!r.existingId);
                                 return (
                                    <tr key={r.row} className={`border-t align-top ${r.include ? "" : "opacity-60"}`}>
                                       <td className="p-2">
                                          <input
                                             type="checkbox"
                                             checked={r.include}
                                             disabled={lockedOut}
                                             onChange={() => toggleInclude(r)}
                                             title={t("importInclude")}
                                          />
                                       </td>
                                       <td className="p-2">{input(r, "firstName", "w-28")}</td>
                                       <td className="p-2">{input(r, "lastName", "w-28")}</td>
                                       <td className="p-2">{input(r, "username", "w-36")}</td>
                                       <td className="p-2">
                                          {r.status === "existing" ? (
                                             <span className="text-xs text-gray-500">{t("importPasswordKept")}</span>
                                          ) : (
                                             input(r, "password", "w-28")
                                          )}
                                       </td>
                                       <td className="p-2">{input(r, "email", "w-44")}</td>
                                       <td className="p-2">
                                          <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[r.status]}`}>
                                             {t(`importStatus_${r.status}`)}
                                          </span>
                                          {r.messages.map((m, i) => (
                                             <p key={i} className="mt-1 max-w-[260px] text-xs text-gray-600">
                                                {m}
                                             </p>
                                          ))}
                                       </td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                     <footer className="mt-4 flex flex-col-reverse items-stretch justify-between gap-3 md:flex-row md:items-center">
                        <button
                           className="rounded-full px-4 py-2 text-sm hover:bg-gray-100"
                           onClick={() => {
                              setStep(meta?.source === "google" && googleToken ? "courses" : "upload");
                              setRows([]);
                              setError("");
                           }}
                           disabled={busy}
                        >
                           {meta?.source === "google" ? t("importChooseAnotherClass") : t("importChooseAnother")}
                        </button>
                        {stale ? (
                           <button
                              className="min-w-[200px] rounded-full bg-yellow-500 px-6 py-3 font-semibold text-white disabled:opacity-60"
                              onClick={recheck}
                              disabled={busy}
                           >
                              {busy ? t("processing") : t("importRecheck")}
                           </button>
                        ) : (
                           <button
                              className="min-w-[200px] rounded-full bg-mainColor px-6 py-3 font-semibold text-white disabled:opacity-60"
                              onClick={runImport}
                              disabled={busy || counts.selected === 0}
                           >
                              {t("importGo", { count: counts.selected })}
                           </button>
                        )}
                     </footer>
                  </div>
               )}

               {step === "importing" && (
                  <div className="py-10 text-center">
                     <p className="mb-4 font-semibold text-gray-800">
                        {t("importProgress", { done: progress.done, total: progress.total })}
                     </p>
                     <div className="mx-auto h-3 w-full max-w-md overflow-hidden rounded-full bg-gray-200">
                        <div
                           className="h-full bg-mainColor transition-all"
                           style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                        />
                     </div>
                     <p className="mt-3 text-xs text-gray-500">{t("importDontClose")}</p>
                  </div>
               )}

               {step === "done" && (
                  <div>
                     <p className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-700">
                        <FaCheckCircle />
                        {t("importResult", { created: result.summary.created, linked: result.summary.linked })}
                     </p>
                     {result.created.length > 0 && (
                        <>
                           <p className="mb-3 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">{t("importSaveWarning")}</p>
                           <div className="max-h-[40vh] overflow-auto rounded border">
                              <table className="w-full text-left text-sm">
                                 <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                       <th className="p-2">{t("importColName")}</th>
                                       <th className="p-2">{t("importColUsername")}</th>
                                       <th className="p-2">{t("importColPassword")}</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {result.created.map((c) => (
                                       <tr key={c.id} className="border-t">
                                          <td className="p-2">
                                             {c.firstName} {c.lastName}
                                          </td>
                                          <td className="p-2 font-mono">{c.username}</td>
                                          <td className="p-2 font-mono">{c.password}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </>
                     )}
                     {result.failed.length > 0 && (
                        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                           <p className="font-semibold">{t("importFailedHeading", { count: result.failed.length })}</p>
                           {result.failed.map((f) => (
                              <p key={f.row}>
                                 {f.firstName} {f.lastName}: {(f.messages || []).join(" ")}
                              </p>
                           ))}
                        </div>
                     )}
                     <footer className="mt-5 flex flex-col gap-3 md:flex-row md:justify-end">
                        {result.created.length > 0 && (
                           <button
                              className="flex items-center justify-center gap-2 rounded-full border border-mainColor px-5 py-3 text-mainColor"
                              onClick={() => downloadLogins(result.created)}
                           >
                              <FaDownload /> {t("importDownloadLogins")}
                           </button>
                        )}
                        {(result.created.length > 0 || result.linked.length > 0) && (
                           <button
                              className="flex items-center justify-center gap-2 rounded-full border border-mainColor px-5 py-3 text-mainColor"
                              onClick={printCards}
                           >
                              <FaPrint /> {t("importPrintCards")}
                           </button>
                        )}
                        <button className="rounded-full bg-mainColor px-8 py-3 font-semibold text-white" onClick={close}>
                           {t("importFinish")}
                        </button>
                     </footer>
                  </div>
               )}
            </main>
         </div>
      </section>,
      document.body
   );
};

export default ImportStudentsModal;
