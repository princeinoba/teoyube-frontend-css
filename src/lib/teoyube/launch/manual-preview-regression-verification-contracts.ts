import type { TeoyubeManualPreviewIssueRegressionCheck } from "./manual-preview-issue-triage-contracts";
import type { TeoyubeManualPreviewSafeFixResult } from "./manual-preview-safe-fix-contracts";

export type TeoyubeManualPreviewRegressionCheckType =
  | "typecheck"
  | "lint"
  | "build"
  | "test"
  | "smoke_check"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "confidence"
  | "consent"
  | "privacy"
  | "mobile"
  | "accessibility"
  | "offline"
  | "debug_safety"
  | "surface_qa"
  | "unknown";

export type TeoyubeManualPreviewRegressionCheckStatus =
  | "pass"
  | "warning"
  | "fail"
  | "blocked"
  | "skipped"
  | "not_run"
  | "unknown";

export type TeoyubeManualPreviewRegressionDecision =
  | "verified"
  | "verified_with_warnings"
  | "blocked"
  | "needs_more_testing"
  | "not_run"
  | "unknown";

export type TeoyubeManualPreviewRegressionCheck = {
  id: string;
  label: string;
  type: TeoyubeManualPreviewRegressionCheckType;
  required: boolean;
  launchCritical: boolean;
  verificationModule: string;
  details: string;
  relatedIssueId?: string;
  relatedFixResultId?: string;
  mappedIssueRegressionCheck?: TeoyubeManualPreviewIssueRegressionCheck;
};

export type TeoyubeManualPreviewRegressionResult = {
  id: string;
  checkId: string;
  type: TeoyubeManualPreviewRegressionCheckType;
  status: TeoyubeManualPreviewRegressionCheckStatus;
  summary: string;
  required: boolean;
  launchCritical: boolean;
  relatedIssueId?: string;
  relatedFixResultId?: string;
  notes?: string;
  checkedAt: string;
};

export type TeoyubeManualPreviewRegressionRun = {
  id: string;
  label: string;
  checks: TeoyubeManualPreviewRegressionCheck[];
  results: TeoyubeManualPreviewRegressionResult[];
  fixResults: TeoyubeManualPreviewSafeFixResult[];
  inMemoryOnly: true;
  databaseWritten: false;
  analyticsSent: false;
  filesWritten: false;
  externalServicesCalled: false;
  previewUrlFetched: false;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeManualPreviewRegressionBlocker = {
  id: string;
  checkId?: string;
  type?: TeoyubeManualPreviewRegressionCheckType;
  message: string;
  requiredAction: string;
  severity: "high" | "critical";
};

export type TeoyubeManualPreviewRegressionWarning = {
  id: string;
  checkId?: string;
  type?: TeoyubeManualPreviewRegressionCheckType;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualPreviewRegressionReport = {
  valid: boolean;
  decision: TeoyubeManualPreviewRegressionDecision;
  run: TeoyubeManualPreviewRegressionRun;
  checkCount: number;
  resultCount: number;
  passCount: number;
  warningCount: number;
  failCount: number;
  blockedCount: number;
  skippedCount: number;
  notRunCount: number;
  blockers: TeoyubeManualPreviewRegressionBlocker[];
  warnings: TeoyubeManualPreviewRegressionWarning[];
  noExternalWrite: true;
  noPreviewUrlFetched: true;
  generatedAt: string;
};
