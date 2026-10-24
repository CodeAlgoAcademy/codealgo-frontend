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
   sourceRow?: number | null;
   sheet?: string;
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

export interface ImportColumn {
   index: number;
   header: string;
   field: string;
   how: "header" | "content" | "manual" | "";
   samples: string[];
}

export interface ImportMeta {
   source?: string;
   strategy?: "table" | "keyValue" | "ai";
   confidence?: "high" | "medium" | "low" | "none";
   headerFound?: boolean;
   headerRow?: number | null;
   sheet?: string;
   sheets?: { name: string; rows: number; used: boolean }[];
   columns?: ImportColumn[];
   preview?: { row: number; cells: string[] }[];
   warnings?: string[];
   needsMapping?: boolean;
}

// Teacher overrides from the column fixer. headerRow is the sheet's own row
// number, null for "no header".
export interface ImportOptions {
   sheet?: string;
   headerRow?: number | null;
   mapping?: Record<string, string>;
}

export interface ImportPreview {
   rows: ImportRow[];
   summary: ImportSummary;
   meta?: ImportMeta;
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

export const previewImport = async (
   classId: string | number,
   file: File,
   options?: ImportOptions,
   ai = false
): Promise<ImportPreview> => {
   const form = new FormData();
   form.append("file", file, file.name);
   if (options && Object.keys(options).length) form.append("options", JSON.stringify(options));
   if (ai) form.append("ai", "true");
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

// Separate OAuth client from site sign in, see ClassroomConnect.
export const GOOGLE_CLASSROOM_CLIENT_ID =
   process.env.NEXT_PUBLIC_GOOGLE_CLASSROOM_CLIENT_ID ||
   "349800986036-stsrvh9gofi3kjsvhdgami1m22i8ofop.apps.googleusercontent.com";

export const GOOGLE_CLASSROOM_SCOPES = [
   "https://www.googleapis.com/auth/classroom.courses.readonly",
   "https://www.googleapis.com/auth/classroom.rosters.readonly",
   "https://www.googleapis.com/auth/classroom.profile.emails",
].join(" ");

export interface GoogleCourse {
   id: string;
   name: string;
   section: string;
   room: string;
}

// The Google token only ever lives in component state and rides along on
// these two calls. The API uses it once and drops it.
export const googleCourses = async (classId: string | number, accessToken: string): Promise<GoogleCourse[]> => {
   const { data } = await http.post(
      `/academics/class/${classId}/student/import/google`,
      { accessToken },
      { headers: auth() }
   );
   return data.courses || [];
};

export const googlePreview = async (
   classId: string | number,
   accessToken: string,
   courseId: string
): Promise<ImportPreview> => {
   const { data } = await http.post(
      `/academics/class/${classId}/student/import/google`,
      { accessToken, courseId },
      { headers: auth() }
   );
   return data;
};
