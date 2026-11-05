import http from "axios.config";
import { getAccessToken } from "utils/getTokens";
import { IMathTest, IMathTestKind, IMathTestReport } from "types/interfaces/teacherstudent.interface";

// Math Quest pre / mid / post / knowledge tests. Same endpoints for teachers and
// parents, the backend checks the user is related to the student.
const base = (studentId: string | number) => `/academics/math_quest/tests/student/${studentId}/`;
const auth = () => ({ headers: { Authorization: `Bearer ${getAccessToken()}` } });

export const emptyMathTestReport: IMathTestReport = { tests: [], summary: [], grades: [], kinds: [] };

const getMathTests = async (studentId: string | number): Promise<IMathTestReport> => {
  const { data } = await http.get(base(studentId), auth());
  return {
    tests: Array.isArray(data?.tests) ? data.tests : [],
    summary: Array.isArray(data?.summary) ? data.summary : [],
    grades: Array.isArray(data?.grades) ? data.grades : [],
    kinds: Array.isArray(data?.kinds) ? data.kinds : [],
  };
};

const runMathTest = async (studentId: string | number, kind: IMathTestKind, grade: string): Promise<IMathTest> => {
  const body = kind === "knowledge" ? { kind } : { kind, grade };
  const { data } = await http.post(base(studentId), body, auth());
  return data;
};

const cancelMathTest = async (studentId: string | number, testId: number): Promise<void> => {
  await http.delete(`${base(studentId)}${testId}/`, auth());
};

const mathTestServices = { getMathTests, runMathTest, cancelMathTest };

export default mathTestServices;
