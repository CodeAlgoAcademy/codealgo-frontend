import type { TFunction } from "i18next";

// Grades Math Quest covers, in order. Same codes the backend uses for
// math_max_grade and the Common Core standards (K, then 1 to 6).
export const MATH_QUEST_GRADES = ["K", "1", "2", "3", "4", "5", "6"] as const;

// Takes the namespace's own t so "kindergarten" / "gradeN" come from teacher.json.
export const mathGradeLabel = (grade: string, t: TFunction<any, any>): string =>
   String(grade === "K" ? t("kindergarten") : t("gradeN", { n: grade }));
