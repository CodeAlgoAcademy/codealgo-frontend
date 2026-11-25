import http from "axios.config";
import { getAccessToken } from "utils/getTokens";
import teachersClassServices from "services/teachersClassServices";
import teachersStudentServices from "services/teachersStudentservices";
import mathTestServices, { toMathTestReport } from "services/mathTestServices";
import {
  IDiagnosticSummary,
  ILineDiagnosticSummary,
  IMathClassSummaryRow,
  IMathQuestReport,
  IMathTestReport,
} from "types/interfaces/teacherstudent.interface";

type Id = string | number;

/**
 * Where the class report gets its data.
 *
 * The report looks the same for a teacher and for an organization admin, but
 * the backend answers them at different addresses with different rules: a
 * teacher must teach the class, an admin must belong to the organization the
 * class is in. The report component takes one of these and never needs to know
 * which kind of user is looking.
 */
export interface ClassReportSource {
  blockRows: (classId: Id) => Promise<IDiagnosticSummary[]>;
  lineRows: (classId: Id) => Promise<ILineDiagnosticSummary[]>;
  mathRows: (classId: Id) => Promise<IMathClassSummaryRow[]>;
  blockDetails: (studentId: Id) => Promise<any[]>;
  lineDetails: (studentId: Id) => Promise<any[]>;
  mathDetails: (studentId: Id, classId: Id) => Promise<IMathQuestReport>;
  mathTests: (studentId: Id) => Promise<IMathTestReport>;
  /** Whether the viewer may assign and cancel math tests. Admins only read. */
  canManageMathTests: boolean;
}

// A summary that comes back without a students array is an empty class, not an error.
const students = <T,>(data: any): T[] => (Array.isArray(data?.students) ? data.students : []);
const list = (data: any): any[] => (Array.isArray(data) ? data : []);

const toMathQuestReport = (data: any): IMathQuestReport => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: Array.isArray(data?.totals) ? data.totals : [],
  recent_rounds: Array.isArray(data?.recent_rounds) ? data.recent_rounds : [],
});

export const teacherReportSource: ClassReportSource = {
  blockRows: (classId) => teachersStudentServices.getClassDiagnosticSummary(classId).then((data) => students<IDiagnosticSummary>(data)),
  lineRows: (classId) => teachersStudentServices.getLineDiagnosticSummary(classId).then((data) => students<ILineDiagnosticSummary>(data)),
  mathRows: (classId) => teachersClassServices.getClassMathSummary(classId),
  blockDetails: (studentId) => teachersStudentServices.getStudentDiagnosticDetail(studentId).then(list),
  lineDetails: (studentId) => teachersStudentServices.getLineStudentDiagnostics(studentId).then(list),
  mathDetails: (studentId, classId) =>
    teachersClassServices.getStudentMathQuestProgressByTeacher(String(studentId), String(classId)),
  mathTests: (studentId) => mathTestServices.getMathTests(studentId),
  canManageMathTests: true,
};

/** The same report for an organization admin, read from /organization/<id>/reports/. */
export const organizationReportSource = (organizationId: Id): ClassReportSource => {
  const get = async (path: string) => {
    const response = await http.get(`/organization/${organizationId}/reports/${path}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    return response?.data;
  };

  return {
    blockRows: (classId) => get(`class/${classId}/block/`).then((data) => students<IDiagnosticSummary>(data)),
    lineRows: (classId) => get(`class/${classId}/line/`).then((data) => students<ILineDiagnosticSummary>(data)),
    mathRows: (classId) => get(`class/${classId}/math/`).then((data) => students<IMathClassSummaryRow>(data)),
    blockDetails: (studentId) => get(`student/${studentId}/block/`).then(list),
    lineDetails: (studentId) => get(`student/${studentId}/line/`).then(list),
    mathDetails: (studentId) => get(`student/${studentId}/math/`).then(toMathQuestReport),
    mathTests: (studentId) => get(`student/${studentId}/math-tests/`).then(toMathTestReport),
    canManageMathTests: false,
  };
};
