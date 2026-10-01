export type DashboardRange = 1 | 7 | 30;

export interface IDashboardStudentRef {
   user_id: number;
   student_id: number | null;
   name: string;
}

export interface IDashboardPulse {
   total_students: number;
   active_today: number;
   active_in_range: number;
   never_logged_in: number;
   math_minutes: number;
   math_rounds: number;
   math_answered: number;
   math_accuracy: number | null;
   quests_completed: number;
   levels_completed: number;
   open_assignments: number;
}

export interface IDashboardDay {
   date: string;
   active_students: number;
   math_rounds: number;
   quests_completed: number;
   levels_completed: number;
   math_minutes: number;
}

export type AttentionCode = "never_logged_in" | "inactive" | "assignment_not_started" | "low_accuracy" | "stuck_math";

export interface IAttentionReason {
   code: AttentionCode;
   days?: number;
   count?: number;
   accuracy?: number;
   answered?: number;
   standard_code?: string;
   plays?: number;
   best_accuracy?: number;
}

export interface IAttentionStudent extends IDashboardStudentRef {
   reasons: IAttentionReason[];
}

export interface ITroubleSpot {
   standard_code: string;
   description: string;
   accuracy: number;
   answered: number;
   students: number;
}

export type ActivityType = "login" | "math_round" | "quest" | "level" | "assignment" | "math_facts_mastered";

export interface IActivityEvent extends IDashboardStudentRef {
   type: ActivityType;
   at: string;
   mode?: string;
   standard_code?: string;
   correct?: number;
   answered?: number;
   stars?: number;
   quest?: string;
   quest_line?: string;
   level_code?: string;
   title?: string;
   accuracy?: number | null;
}

export interface IDashboardAssignment {
   id: number;
   kind: "coding" | "math_facts";
   game_type: string;
   title: string;
   total: number;
   completed: number;
   in_progress: number;
   not_started: number;
   avg_accuracy: number | null;
   created_at: string;
   is_live: boolean;
}

export interface IClassDashboard {
   range_days: DashboardRange;
   generated_at: string;
   pulse: IDashboardPulse;
   daily: IDashboardDay[];
   needs_attention: IAttentionStudent[];
   trouble_spots: ITroubleSpot[];
   activity: IActivityEvent[];
   assignments: IDashboardAssignment[];
}
