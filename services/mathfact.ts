import http from "axios.config";
import { CreateAssignmentBulkPayload, CreateAssignmentPayload, MathFactAnalyticsPair, MathFactAssignmentDetail, MathFactAssignmentList, MathFactSet, StudentMathOverview } from "types/interfaces/mathfact";
import { FactSetFilters, FactSetPayload } from "types/interfaces/mathStandards";
import { getAccessToken } from "utils/getTokens";

const buildQuery = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === false) return;
    search.set(key, String(value));
  });
  return search.toString();
};

const mathFactsService = {
  // filters is optional, so the existing single-argument calls keep working.
  getFactSets: async (
    classId: string | number,
    filters: Omit<FactSetFilters, "class_id"> = {}
  ): Promise<MathFactSet[]> => {
    const qs = buildQuery({ class_id: classId, ...filters });
    const res = await http.get(`/academics/math_facts/fact-sets/?${qs}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return res.data;
},

  createFactSet: async (payload: FactSetPayload): Promise<MathFactSet> => {
    const res = await http.post(`/academics/math_facts/fact-sets/`, payload, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return res.data;
  },

  updateFactSet: async (
    id: number,
    payload: Partial<FactSetPayload>
  ): Promise<MathFactSet> => {
    const res = await http.patch(`/academics/math_facts/fact-sets/${id}/`, payload, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return res.data;
  },

  deleteFactSet: async (id: number): Promise<void> => {
    await http.delete(`/academics/math_facts/fact-sets/${id}/`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
  },

  // Shared sets cannot be edited. Copy one to get an editable version.
  duplicateFactSet: async (id: number): Promise<MathFactSet> => {
    const res = await http.post(`/academics/math_facts/fact-sets/${id}/duplicate/`, {}, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return res.data;
  },
 
getAssignments: async (classId: string | number): Promise<StudentMathOverview[]> => {
    const res = await http.get(`/academics/class/${classId}/math-facts/assignments/`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return res.data;
},
 
  getAssignment: async (classId: string | number, pk: number): Promise<MathFactAssignmentDetail> => {
    const res = await http.get(`/academics/class/${classId}/math-facts/assignments/${pk}/`,{
        headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return res.data;
  },
 
 createAssignment: async (
  classId: string | number,
  payload: {
    fact_set_ids: number[];
    student_ids: number[];
    question_count: number;
    target_accuracy: number;
    target_avg_time: number;
    status: string;
  }
): Promise<any> => {
  const res = await http.post(`/academics/class/${classId}/math-facts/assignments/`, payload, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return res.data;
},

  getStudentOverview: async (classId: string | number): Promise<any[]> => {
    const res = await http.get(`/academics/class/${classId}/math-facts/assignments/`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return res.data;
  },

  updateAssignment: async (
    classId: string | number,
    pk: number,
    payload: Partial<CreateAssignmentPayload>
  ): Promise<MathFactAssignmentDetail> => {
    const res = await http.patch(`/academics/class/${classId}/math-facts/assignments/${pk}/`, payload,{
        headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return res.data;
  },
 
  deleteAssignment: async (classId: string | number, pk: number): Promise<void> => {
    await http.delete(`/academics/class/${classId}/math-facts/assignments/${pk}/`,{
        headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
  },

  getAnalytics: async (
  classId: string | number,
  studentId?: string | number,
  operation?: string
): Promise<MathFactAnalyticsPair[]> => {
  const params = new URLSearchParams();
  if (studentId && studentId !== "all") params.set("student_id", String(studentId));
  if (operation && operation !== "all") params.set("operation", operation);

  const res = await http.get(
    `/academics/class/${classId}/math-facts/analytics/?${params.toString()}`,
    { headers: { Authorization: `Bearer ${getAccessToken()}` } }
  );
  return res.data;
},

};
 
export default mathFactsService;
 




