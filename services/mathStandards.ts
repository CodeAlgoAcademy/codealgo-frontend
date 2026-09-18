import http from "axios.config";
import {
  CoverageReport,
  MathDomain,
  MathFramework,
  MathGapResponse,
  MathStandard,
} from "types/interfaces/mathStandards";
import { getAccessToken } from "utils/getTokens";

const auth = () => ({ headers: { Authorization: `Bearer ${getAccessToken()}` } });

const query = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === false) return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

const mathStandardsService = {
  getFrameworks: async (): Promise<MathFramework[]> => {
    const res = await http.get("/academics/math_standards/frameworks/", auth());
    return res.data;
  },

  getDomains: async (framework?: string, grade?: string): Promise<MathDomain[]> => {
    const res = await http.get(
      `/academics/math_standards/domains/${query({ framework, grade })}`,
      auth()
    );
    return res.data;
  },

  getStandards: async (params: {
    framework?: string;
    grade?: string;
    domain?: string;
  }): Promise<MathStandard[]> => {
    const res = await http.get(
      `/academics/math_standards/standards/${query(params)}`,
      auth()
    );
    return res.data;
  },

  getCoverage: async (framework?: string, grade?: string): Promise<CoverageReport> => {
    const res = await http.get(
      `/academics/math_standards/coverage/${query({ framework, grade })}`,
      auth()
    );
    return res.data;
  },

  getGaps: async (framework?: string, grade?: string): Promise<MathGapResponse> => {
    const res = await http.get(
      `/academics/math_standards/gaps/${query({ framework, grade })}`,
      auth()
    );
    return res.data;
  },
};

export default mathStandardsService;
