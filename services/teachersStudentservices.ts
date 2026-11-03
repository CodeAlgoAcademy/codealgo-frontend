import http from "axios.config";
import { getAccessToken } from "utils/getTokens";



const createStudentLevelThresHold = async (
  data: any,
  class_id: string | number,
  student_id: string | number
) => {
  const response = await http.post(
    `/academics/class/${class_id}/student/${student_id}/level-threshold/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );
  return response.data;
};

const editStudentScreentimeteachers = async (
  data: any,
  class_id: string | number,
  student_id: string | number,
  id: string | number
) => {
  const response = await http.put(
    `/academics/class/${class_id}/student/${student_id}/screen-time/${id}/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );
  return response.data;
};

const getStudentBlockGameProgress = async (class_id: string | number, student_id:string | number) => {
   const response = await http.get(`/academics/class/${class_id}/student/${student_id}/block-progress/`, {
      headers: {
         Authorization: `Bearer ${getAccessToken()}`,
      },
   });
   return response.data;
};

const getStudentBlockGameSkill = async (class_id: string | number, student_id:string | number) => {
   const response = await http.get(`/academics/class/${class_id}/student/${student_id}/block-skills/`, {
      headers: {
         Authorization: `Bearer ${getAccessToken()}`,
      },
   });
   return response.data;
};
const getStudentBlockGameStandard = async (class_id: string | number, student_id:string | number) => {
   const response = await http.get(`/academics/class/${class_id}/student/${student_id}/block-progress/`, {
      headers: {
         Authorization: `Bearer ${getAccessToken()}`,
      },
   });
   return response.data;
};

  const deleteStudent = async (classId: string | number, studentId: string | number) => {
  const response = await http.delete(
    `/academics/class/${classId}/student/${studentId}`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );
  return response.data;
};

const updateStudentPassword = async (class_id: string | number | undefined, student_id:string | number | undefined, password: string) => {
   const response = await http.put(
      `/academics/class/${class_id}/student/${student_id}/reset-password/`,
      { password },
      { headers: { Authorization: `Bearer ${getAccessToken()}` } }
   );

   return response?.data;
};

const getCodingAccess = async (student_id: string | number) => {
   const response = await http.get(`/academics/block_game/coding-access/${student_id}/`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
   });
   return response.data;
};

const updateCodingAccess = async (
   student_id: string | number, 
   data: { line_coding_locked?: boolean; line_coding_console_only?: boolean; block_coding_max_level?: string; locked_levels?: string[] }
) => {
   const response = await http.patch(`/academics/block_game/coding-access/${student_id}/`, data, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
   });
   return response.data;
};

const getClassDiagnosticSummary = async (classId: string | number) => {
   const response = await http.get(`/academics/visual-scripting/teacher-diagnostics/class/${classId}/summary/`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
   });
   return response.data;
};

const getStudentDiagnosticDetail = async (studentId: string | number) => {
   const response = await http.get(`/academics/visual-scripting/teacher-diagnostics/student/${studentId}/?latest_only=true&limit=20`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
   });
   return response.data;
};

const getLineDiagnosticSummary = async (classId: string | number) => {
   const response = await http.get(`/academics/line-diagnostics/class/${classId}/summary/`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
   });
   return response.data;
};

const getLineStudentDiagnostics = async (studentId: string | number) => {
   const response = await http.get(`/academics/line-diagnostics/student/${studentId}/?latest_only=true&limit=20`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
   });
   return response.data;
};


const teachersStudentServices={
    createStudentLevelThresHold,
    editStudentScreentimeteachers,
    getStudentBlockGameProgress,
    getStudentBlockGameSkill,
    getStudentBlockGameStandard,
    deleteStudent,
    updateStudentPassword,
    updateCodingAccess,
    getCodingAccess,
   getClassDiagnosticSummary,
   getStudentDiagnosticDetail,
   getLineDiagnosticSummary,
   getLineStudentDiagnostics
}
export default teachersStudentServices;