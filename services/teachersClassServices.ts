import http from "axios.config";
import { IChildTopics } from "types/interfaces";
import { getAccessToken } from "utils/getTokens";
import { IEncounterReport, IMathQuestReport } from "types/interfaces/teacherstudent.interface";
import { DashboardRange, IClassDashboard } from "types/interfaces/classDashboard.interface";

const bulkUpdateClassLevelThreshold = async (
  class_id: string | number,
  data: { grade: string; level: number }
) => {
  const response = await http.patch(
    `academics/class/${class_id}/levelthreshold/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );
  return response.data;
};

const bulkUpdateClassScreenTime = async (
  class_id: string | number,
  data: { timeLimit: number | string | null; dayOfTheWeek: string }
) => {
  const response = await http.patch(
    `academics/class/${class_id}/screentime/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );
  return response.data;
};

const getStudentLineProgressByTeacher = async (studentId: string, classId:string) => {
   try {
      const response = await http.get<IChildTopics>(`/academics/class/${classId}/student/${studentId}/progress`, {
         headers: {
            Authorization: `Bearer ${getAccessToken()}`,
         },
      });

      console.log(response?.data);
      return response?.data;
   } catch (error) {
      // throw error;
   }
};

const getStudentLinecodingSkillsByTeacher = async (studentId: string, classId: string) => {
   const response = await http.get(`/academics/class/${classId}/student/${studentId}/skills`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
   });
   return response.data; 
};


const getStudentLineProgressNewByTeacher = async (studentId: string, classId: string) => {
    try {
      const response = await http.get(`/academics/class/${classId}/student/${studentId}/line-progress/`, {
         headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      return response?.data || []; 
   } catch (error) {
      console.error(error);
      return [];
   }
};

const getStudentLinecodingSkillsNewByTeacher = async (studentId: string, classId: string) => {
  const response = await http.get(
    `/academics/class/${classId}/student/${studentId}/line-skills/`,
    {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    }
  );
  return response.data ?? [];
};



// Quest line progress. Quests are how students play line coding now, and the
// game only syncs to /academics/quests, which line-progress above never reads.
const getStudentQuestProgressByTeacher = async (studentId: string, classId: string) => {
  try {
    const response = await http.get(`/academics/class/${classId}/student/${studentId}/quest-progress/`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Math Quest (the math game): stars and mastery per Common Core standard, plus
// per grade totals and the last few rounds. Rows are shaped like the other
// progress rows so the dashboard can list them alongside.
const emptyMathQuestReport: IMathQuestReport = { rows: [], totals: [], recent_rounds: [] };

const getStudentMathQuestProgressByTeacher = async (studentId: string, classId: string): Promise<IMathQuestReport> => {
  try {
    const response = await http.get(`/academics/class/${classId}/student/${studentId}/math-quest-progress/`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    const data = response?.data;
    return {
      rows: Array.isArray(data?.rows) ? data.rows : [],
      totals: Array.isArray(data?.totals) ? data.totals : [],
      recent_rounds: Array.isArray(data?.recent_rounds) ? data.recent_rounds : [],
    };
  } catch (error) {
    console.error(error);
    return emptyMathQuestReport;
  }
};

// Overworld encounters: ambush battles, coins and pets, plus how the student
// did on the review levels those battles replay.
export const emptyEncounterReport: IEncounterReport = {
  played: false,
  battles_won: 0,
  battles_fled: 0,
  rescues: 0,
  boss_wins: 0,
  coins_collected: 0,
  code_coins_solved: 0,
  answers_right: 0,
  answers_wrong: 0,
  accuracy: null,
  pets: [],
  active_pet: null,
  total_pets: 0,
  foes: [],
  review: [],
  last_activity: null,
};

const getStudentEncounterProgressByTeacher = async (studentId: string, classId: string): Promise<IEncounterReport> => {
  try {
    const response = await http.get(`/academics/class/${classId}/student/${studentId}/encounter-progress/`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    const data = response?.data || {};
    return {
      ...emptyEncounterReport,
      ...data,
      pets: Array.isArray(data.pets) ? data.pets : [],
      foes: Array.isArray(data.foes) ? data.foes : [],
      review: Array.isArray(data.review) ? data.review : [],
    };
  } catch (error) {
    console.error(error);
    return emptyEncounterReport;
  }
};

const getClassDashboard = async (classId: string | number, range: DashboardRange, tz?: string): Promise<IClassDashboard> => {
  const response = await http.get<IClassDashboard>(`/academics/class/${classId}/dashboard/`, {
    params: { range, tz },
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  return response.data;
};

const teachersClassBaseServices = {
  bulkUpdateClassLevelThreshold,
  bulkUpdateClassScreenTime,
  getStudentLineProgressByTeacher,
  getStudentLinecodingSkillsByTeacher,
  getStudentLinecodingSkillsNewByTeacher,
  getStudentLineProgressNewByTeacher,
  getStudentQuestProgressByTeacher,
  getStudentMathQuestProgressByTeacher,
  getStudentEncounterProgressByTeacher,
  getClassDashboard,
};

export default teachersClassBaseServices;