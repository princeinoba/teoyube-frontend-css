export type TeoyubeSoftLaunchStabilizationRegressionStatus =
  | "pass"
  | "warning"
  | "fail"
  | "blocked"
  | "not_run"
  | "not_applicable"
  | "unknown";

export type TeoyubeSoftLaunchStabilizationRegressionCheckType =
  | "typecheck"
  | "lint"
  | "build"
  | "test"
  | "smoke_check"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "consent_privacy"
  | "mobile_accessibility"
  | "offline_fallback"
  | "debug_safety"
  | "surface_qa"
  | "feedback_intake"
  | "unknown";

export type TeoyubeSoftLaunchStabilizationRegressionDecision =
  | "stabilized"
  | "stabilized_with_warnings"
  | "blocked"
  | "needs_more_testing"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeSoftLaunchStabilizationRegressionCheck = {
  id: string;
  label: string;
  type: TeoyubeSoftLaunchStabilizationRegressionCheckType;
  required: boolean;
  launchCritical: boolean;
  details: string;
  relatedCandidateId?: string;
  relatedFixResultId?: string;
};

export type TeoyubeSoftLaunchStabilizationRegressionResult = {
  id: string;
  checkId: string;
  type: TeoyubeSoftLaunchStabilizationRegressionCheckType;
  status: TeoyubeSoftLaunchStabilizationRegressionStatus;
  summary: string;
  required: boolean;
  launchCritical: boolean;
  relatedCandidateId?: string;
  relatedFixResultId?: string;
  checkedAt: string;
};

export type TeoyubeSoftLaunchStabilizationRegressionRun = {
  id: string;
  label: string;
  checks: TeoyubeSoftLaunchStabilizationRegressionCheck[];
  results: TeoyubeSoftLaunchStabilizationRegressionResult[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  previewUrlFetched: false;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeSoftLaunchStabilizationRegressionBlocker = {
  id: string;
  checkId?: string;
  type?: TeoyubeSoftLaunchStabilizationRegressionCheckType;
  message: string;
  requiredAction: string;
  severity: "high" | "critical";
};

export type TeoyubeSoftLaunchStabilizationRegressionWarning = {
  id: string;
  checkId?: string;
  type?: TeoyubeSoftLaunchStabilizationRegressionCheckType;
  message: string;
  recommendedAction: string;
};

export type TeoyubeSoftLaunchStabilizationRegressionReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubeSoftLaunchStabilizationRegressionDecision;
  run: TeoyubeSoftLaunchStabilizationRegressionRun;
  checkCount: number;
  resultCount: number;
  passCount: number;
  warningCount: number;
  failCount: number;
  blockedCount: number;
  notRunCount: number;
  notApplicableCount: number;
  blockers: TeoyubeSoftLaunchStabilizationRegressionBlocker[];
  warnings: TeoyubeSoftLaunchStabilizationRegressionWarning[];
  noExternalWrite: true;
  noPreviewUrlFetched: true;
  generatedAt: string;
};
