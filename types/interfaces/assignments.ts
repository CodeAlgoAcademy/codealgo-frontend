export interface BlockTopic {
  id: number;
  name: string;
  question_count?: number;
}

export interface AssignmentTopic {
  id: number;
  name: string;
}
 
export interface BlockStandardWithTopics {
  id: number;
  code: string;
  name: string;
  grade: string;
  description: string;
  topic_count: number;
  question_count?: number;
  topics: BlockTopic[];
}
 
export interface CreateAssignmentPayload {
  title: string;
  topic_ids: number[];
  question_order: "random" | "in_sequence";
  question_count: number;
  start_now: boolean;
  scheduled_at?: string | null;
  student_ids?: number[];
  game_type?: "block" | "line";
}
 
export interface AssignmentStandard {
  id: number;
  code: string;
  name: string;
  grade: string;
}
 
export interface AssignmentListItem {
  id: number;
  title: string;
  status: string;
  question_order: string;
  question_count: number;
  scheduled_at: string | null;
  created_at: string;
  standards: AssignmentStandard[];
  student_count: number;
  completed_count: number;
topics: AssignmentTopic[];
progress_percentage:string
  game_type: "block" | "line"; 
}
 