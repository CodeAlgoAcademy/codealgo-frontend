import http from "axios.config";
import { getAccessToken } from "utils/getTokens";

export interface SkipPin {
   pin: string;
   updated_at: string;
}

export interface SkipPinUse {
   id: number;
   student_id: number;
   username: string;
   first_name: string;
   last_name: string;
   action: "solution" | "skip";
   unit_level: string;
   level_name: string;
   success: boolean;
   reason: "" | "wrong_pin" | "limit";
   created_at: string;
}

const auth = () => ({ headers: { Authorization: `Bearer ${getAccessToken()}` } });

export async function getSkipPin(): Promise<SkipPin> {
   const { data } = await http.get("/academics/skip-pin/", auth());
   return data;
}

export async function regenerateSkipPin(): Promise<SkipPin> {
   const { data } = await http.post("/academics/skip-pin/", {}, auth());
   return data;
}

export async function setSkipPin(pin: string): Promise<SkipPin> {
   const { data } = await http.put("/academics/skip-pin/", { pin }, auth());
   return data;
}

export async function getSkipPinLog(classId?: number | string): Promise<SkipPinUse[]> {
   const { data } = await http.get("/academics/skip-pin/log/", {
      ...auth(),
      params: classId ? { class_id: classId } : undefined,
   });
   return data;
}
