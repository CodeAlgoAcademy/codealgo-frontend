// Math standards, mirrors academics/math_standards on the backend.
// Standards and alignments are read only here on purpose: they are seeded and
// curated by staff so the framework data stays trustworthy. Teachers tag their
// own content against them.

export type FrameworkCode = "common_core" | "missouri" | "teks" | "fl_best";

export interface MathFramework {
  id: number;
  code: FrameworkCode;
  name: string;
  is_baseline: boolean;
  jurisdiction: string;
  version: string;
}

export interface MathDomain {
  id: number;
  code: string;
  name: string;
  grade: string;
  sort_index: number;
}

export interface MathStandard {
  id: number;
  code: string;
  grade: string;
  description: string;
  teaching_note: string;
  framework_code: string;
  domain_code: string;
  cluster_code: string;
}

export interface CoverageStandardRow {
  code: string;
  description: string;
  cluster: string;
  fact_set_count: number;
  item_count: number;
  covered: boolean;
  // Covered by a drill generator but nothing authored teaches it. Fluency is
  // not instruction and the report keeps them apart.
  fluency_only: boolean;
}

export interface CoverageDomain {
  domain: string;
  total: number;
  covered: number;
  standards: CoverageStandardRow[];
}

export interface CoverageGrade {
  grade: string;
  total: number;
  covered: number;
  domains: CoverageDomain[];
}

export interface CoverageReport {
  framework: string | null;
  framework_name?: string;
  is_baseline?: boolean;
  grades: CoverageGrade[];
  totals: {
    standards?: number;
    covered?: number;
    percent?: number;
  };
}

export interface MathGap {
  grade: string;
  domain: string;
  code: string;
  description: string;
}

export interface MathGapResponse {
  count: number;
  gaps: MathGap[];
}

export interface FactSetFilters {
  class_id?: string | number;
  operation?: string;
  grade?: string;
  standard?: string;
  framework?: string;
  domain?: string;
  standard_grade?: string;
  mine?: boolean;
  untagged?: boolean;
}

export interface FactSetPayload {
  name: string;
  operation: string;
  operand_a_min: number;
  operand_a_max: number;
  operand_b_min: number;
  operand_b_max: number;
  grade: string;
  math_standard_ids: number[];
}
