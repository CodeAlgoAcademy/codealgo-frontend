import http from "../axios.config";
import { getAccessToken } from "utils/getTokens";

export type ImportStatus = "new" | "existing" | "in_class" | "duplicate" | "error";

export interface ImportRow {
   row: number;
   firstName: string;
   lastName: string;
   email: string;
   username: string;
   password: string;
   dob: string;
   grade: string;
   studentNumber: string;
   status: ImportStatus;
   include: boolean;
   messages: string[];
   usernameGenerated: boolean;
   passwordGenerated: boolean;
   existingId: number | null;
   allowSameName: boolean;
}

export interface ImportSummary {
   new: number;
   existing: number;
   in_class: number;
   duplicate: number;
   error: number;
   total: number;
   toImport: number;
}

export interface ImportPreview {
   rows: ImportRow[];
   summary: ImportSummary;
   meta?: { source?: string; headerFound?: boolean; columns?: Record<string, string> };
}

export interface CreatedLogin {
   row: number;
   id: number;
   firstName: string;
   lastName: string;
   username: string;
   password: string;
   email: string;
}

interface RowNote {
   row: number;
   firstName: string;
   lastName: string;
   status?: string;
   messages?: string[];
   username?: string;
}

export interface ImportResult {
   created: CreatedLogin[];
   linked: RowNote[];
   skipped: RowNote[];
   failed: RowNote[];
   summary: { created: number; linked: number; skipped: number; failed: number };
}

// Server caps a commit at 50. Each new account is a password hash on the API,
// so smaller requests keep any one of them short and give the progress bar
// something to do.
export const IMPORT_CHUNK = 25;

const auth = () => ({ Authorization: `Bearer ${getAccessToken()}` });

export const previewImport = async (classId: string | number, file: File): Promise<ImportPreview> => {
   const form = new FormData();
   form.append("file", file, file.name);
   const { data } = await http.post(`/academics/class/${classId}/student/import/preview`, form, {
      headers: { ...auth(), "Content-Type": "multipart/form-data" },
   });
   return data;
};

export const recheckImport = async (classId: string | number, rows: ImportRow[]): Promise<ImportPreview> => {
   const { data } = await http.post(
      `/academics/class/${classId}/student/import`,
      { rows, dryRun: true },
      { headers: auth() }
   );
   return data;
};

export const commitImport = async (classId: string | number, rows: ImportRow[]): Promise<ImportResult> => {
   const { data } = await http.post(`/academics/class/${classId}/student/import`, { rows }, { headers: auth() });
   return data;
};

export const importErrorMessage = (error: any, fallback: string): string => {
   const data = error?.response?.data;
   if (typeof data?.message === "string") return data.message;
   if (Array.isArray(data?.message)) return data.message.join(" ");
   if (typeof data?.detail === "string") return data.detail;
   return fallback;
};
