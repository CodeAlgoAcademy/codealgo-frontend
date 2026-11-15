import { LevelThresholdInputProps } from "@/components/parents/UI/levelthreshold";
import { IChildSkill, IChildTopics, screentimeTypes } from "./parent.interface";

export interface BaseStudent {
 question_level?: number;
   skills?: IChildSkill[];
   progress?: IChildTopics;
   level?: number;
   username: string;
   fullName: string;
   firstName:string;
   lastName:string;
   codingExperience: string;
   dob: string;
   timeLimits: screentimeTypes[];
   friend?: string;
   id?: string | number;
   friends?: {
      id: number;
      friend: string;
   }[];
   student_id:string | number;
  levelThresholds: LevelThresholdInputProps[];
  classId: number | string;
  codingAccess?: ICodingAccess; 

}

export interface IPlayedLevel {
   unit_level: string;
   sort_index: number;
   completed: boolean;
}

export interface IPlayedMathStandard {
   code: string;
   grade: string;
   description: string;
   stars: number;
   mastered: boolean;
}

export interface ICodingAccess {
   line_coding_locked: boolean;
   // Python quests only, back to back in the console. No overworld.
   line_coding_console_only?: boolean;
   block_coding_max_level: string;
   locked_levels?: string[];
   // Math Quest: whole game on/off, highest grade it opens ("" = no cap),
   // and standards sent back to redo.
   math_locked?: boolean;
   math_max_grade?: string;
   math_locked_standards?: string[];
   // Only returned by the teacher / parent endpoint.
   played_levels?: IPlayedLevel[];
   played_math_standards?: IPlayedMathStandard[];
}

export interface IMathQuestRow {
   source: "math";
   standard_code: string;
   standard_name: string;
   name: string;
   grade: string;
   domain: string;
   progress: number;
   unit_level: string;
   common_core_math_desc: string;
   completed: boolean;
   mastered: boolean;
   stars: number;
   best_accuracy: number;
   plays: number;
   answered: number;
   correct: number;
   tier: number;
   redo: boolean;
   last_activity: string | null;
}

export interface IMathQuestGradeTotal {
   grade: string;
   total: number;
   mastered: number;
   practicing: number;
}

export interface IMathQuestRound {
   mode: "skill" | "mix";
   standard_code: string;
   answered: number;
   correct: number;
   stars: number;
   created_at: string;
}

export interface IMathQuestReport {
   rows: IMathQuestRow[];
   totals: IMathQuestGradeTotal[];
   recent_rounds: IMathQuestRound[];
}

export interface IEncounterPet {
   id: string;
   name: string;
   fact: string;
}

export interface IEncounterFoe {
   id: string;
   name: string;
   wins: number;
}

export interface IEncounterReviewRow {
   level_id: string;
   title: string;
   quest_line: string;
   topic: string;
   right: number;
   wrong: number;
   accuracy: number;
}

// Overworld ambushes, coins and pets for one student (academics/encounters).
export interface IEncounterReport {
   played: boolean;
   battles_won: number;
   battles_fled: number;
   rescues: number;
   boss_wins: number;
   coins_collected: number;
   code_coins_solved: number;
   answers_right: number;
   answers_wrong: number;
   accuracy: number | null;
   pets: IEncounterPet[];
   active_pet: string | null;
   total_pets: number;
   foes: IEncounterFoe[];
   review: IEncounterReviewRow[];
   last_activity: string | null;
}

export type IMathTestKind = "pre" | "mid" | "post" | "knowledge";

export interface IMathTestResult {
   code: string;
   correct: boolean;
   description: string;
}

export interface IMathTestDomain {
   domain: string;
   domain_name: string;
   answered: number;
   correct: number;
   score: number;
}

export interface IMathTest {
   id: number;
   kind: IMathTestKind;
   kind_label: string;
   grade: string;
   status: "pending" | "completed" | "cancelled";
   source: "auto" | "teacher" | "parent";
   assigned_by: string;
   question_count: number;
   answered: number;
   correct: number;
   score: number;
   duration_seconds: number;
   created_at: string;
   completed_at: string | null;
   results?: IMathTestResult[];
   domains?: IMathTestDomain[];
}

export interface IMathTestGradeSummary {
   grade: string;
   pre: number | null;
   mid: number | null;
   post: number | null;
   growth: number | null;
}

export interface IMathTestReport {
   tests: IMathTest[];
   summary: IMathTestGradeSummary[];
   grades: string[];
   kinds: { value: IMathTestKind; label: string }[];
}
export interface ITeacherStudentsState{
  students: BaseStudent[];
  currentStudent: BaseStudent;
  diagnosticSummary: IDiagnosticSummary[]; 
  lineDiagnosticSummary: ILineDiagnosticSummary[];
  isLoading: boolean;
  error?: string;
}

export interface IDiagnosticSummary {
   student_id: number;
   student_name: string;
   last_completed_unit_level: string;
   mastery_band: "remediation" | "developing" | "proficient" | "advanced";
   persistence_band: "low" | "moderate" | "high";
   independence_band: "guided" | "independent";
   recommended_action: string;
   flags: string[];
}

export interface ILineDiagnosticRecord {
   id: number;
   student: number;
   standard: number;
   standard_code?: string;
   standard_name?: string;
   unit_level: string;
   level_name: string;
   status: string;
   started_at: string;
   completed_at: string | null;
   duration_seconds: number;
   attempts: number;
   pass_count: number;
   fail_count: number;
   hint_uses: number;
   code_snapshot: string;
   ai_feedback: string;
   resilience_flag: boolean;
   innovation_flag: boolean;
   communication_flag: boolean;
   critical_thinking_flag: boolean;
   mastery_band: string;
   persistence_band: string;
   independence_band: string;
   recommended_action: string;
   teacher_flagged: boolean;
   teacher_notes: string;
}

export interface ILineDiagnosticSummary {
   student_id: number;
   student_name: string;
   last_completed_unit_level: string;
   mastery_band: string;
   persistence_band: string;
   independence_band: string;
   recommended_action: string;
   flags: string[];
}