import { LevelThresholdInputProps } from "@/components/parents/UI/levelthreshold";
import { IPlayedLevel } from "./teacherstudent.interface";

export type days = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface IChildSkill {
   id: number;
   title: string;
   level: number;
   name?:string;
   value?:string;
}

export interface IChildProgress {
   title: string;
   level: number;
   progress: number;
   standard_code?:string;
   standard_name?:string;
   iready_math_desc?:string;
   common_core_math_desc?:string;
   unit_level?:string;
   grade?:string;
   name?:string;
   source?: "quest" | "math";
   quest_line_id?: string;
   completed_quests?: number;
   total_quests?: number;
   current_quest?: string | null;
   standards?: string[];
}

export interface IChildTopics {
   current: IChildProgress | null; 
   topic: IChildProgress[];
}

export interface ICodingAccess {
   line_coding_locked: boolean;
   block_coding_max_level: string;
   locked_levels?: string[];
   math_locked?: boolean;
   math_max_grade?: string;
   math_locked_standards?: string[];
   played_levels?: IPlayedLevel[];
}

export interface IParentChild {
   question_level?: number;
   skills?: IChildSkill[];
   progress?: IChildTopics;
   level?: number;
   username: string;
   fullName: string;
   codingExperience: string;
   dob: string;
   password: string;
   confirmPassword?: string;
   timeLimits: screentimeTypes[];
   friend?: string;
   id: number | string;
   pendingRequests?: FriendRequests[];
   friendRequests?: FriendRequests[];
   friends?: {
      id: number;
      friend: string;
   }[];
   student_id?:number;
  levelThresholds: LevelThresholdInputProps[]
   selectedChild?: boolean;
   codingAccess?: ICodingAccess; 
}

export interface IParentChildren extends IParentChild {
   children: IParentChild[];
   currentChild: IParentChild;
}

export interface screentimeTypes {
   id?: number | string;
   dayOfTheWeek: days;
   timeLimit: "" | string | number | "No Limit"|null;
}

export interface FriendRequests {
   id: number;
   from_user: string;
   to_user: string;
}
