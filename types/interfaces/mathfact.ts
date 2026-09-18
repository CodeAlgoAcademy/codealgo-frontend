import { MathStandard } from "types/interfaces/mathStandards";

export interface Standards{
  id:string
  name:string;
  code:string
}

export type MathOperation = "add" | "subtract" | "multiply" | "divide";
 
export interface MathFactSet {
  id: number;
  name: string;
  operation: MathOperation;
  operation_display: string;
  operand_a_min: number;
  operand_a_max: number;
  operand_b_min: number;
  operand_b_max: number;
  grade: string;
  created_by: number | null;
  standards: Standards[];
  // Coding standards above, math standards below. Both optional so anything
  // holding an older response still type checks.
  math_standards?: MathStandard[];
  // False for the shipped sets, which are shared across teachers.
  is_editable?: boolean;
}
 
export interface MathFactAssignmentList {
  id: number;
  fact_set: number;
  fact_set_name: string;
  status: "active" | "archived";
  student_count: number;
  mastered_count: number;
  created_at: string;
  student_records: any;
  student_id: number;
}
 
export interface MathFactAssignmentStudentRecord {
  id: number;
  student_username: string;
  status: "not_started" | "in_progress" | "completed";
  sessions_completed: number;
  best_accuracy: number;
  best_avg_time: number;
  is_mastered: boolean;
  mastered_at: string | null;
  last_played_at: string | null;
  student_id: number;
}
 
export interface MathFactAssignmentDetail {
  id: number;
  fact_set: MathFactSet;
  classroom: number;
  question_count: number;
  time_limit_seconds: number | null;
  target_accuracy: number;
  target_avg_time: number;
  status: "active" | "archived";
  created_at: string;
  student_records: MathFactAssignmentStudentRecord[];

}

export interface CreateAssignmentBulkPayload {
  fact_set_ids: number[]; 
  student_ids?: number[];
  question_count: number;
  time_limit_seconds: number | null;
  target_accuracy: number;
  target_avg_time: number;
  status: string;
}

export interface MathFactAnalyticsPair {
  operand_a: number;
  operand_b: number;
  operation: string;
  total: number;
  errors: number;
}

export interface CreateAssignmentPayload {
  fact_set_ids: number[];
  student_ids?: number[];
  question_count: number;
  time_limit_seconds?: number | null;
  target_accuracy: number;
  target_avg_time: number;
  status: string;
}

export interface MathFactActiveAssignment {
  id: number;
  fact_set_id: number;
  fact_set_name: string;
  operation: MathOperation;
  operation_display: string;
  question_count: number;
  target_accuracy: number;
  target_avg_time: number;
  status: string;
  is_mastered: boolean;
}

export interface StudentMathOverview {
  id: number;
  username: string;
  full_name: string;
  active_assignments: MathFactActiveAssignment[];
}

export interface ErrorPair {
  operand_a: number;
  operand_b: number;
  operation: string;
  total: number;
  errors: number;
}