import type {
  TeoyubeManualPreviewIssue,
  TeoyubeManualPreviewIssueFixPlan,
  TeoyubeManualPreviewIssueRegressionCheck
} from "./manual-preview-issue-triage-contracts";

export type TeoyubeManualPreviewSafeFixStatus =
  | "candidate"
  | "planned"
  | "applied"
  | "skipped"
  | "blocked"
  | "verified"
  | "unknown";

export type TeoyubeManualPreviewSafeFixType =
  | "ui_layout_patch"
  | "accessibility_patch"
  | "copy_clarity_patch"
  | "fallback_display_patch"
  | "debug_visibility_patch"
  | "export_fix"
  | "type_error_fix"
  | "test_fixture_fix"
  | "documentation_fix"
  | "manual_only"
  | "blocked"
  | "unknown";

export type TeoyubeManualPreviewSafeFixRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubeManualPreviewSafeFixDecision =
  | "safe_to_apply"
  | "manual_review_required"
  | "blocked"
  | "defer"
  | "already_resolved"
  | "unknown";

export type TeoyubeManualPreviewSafeFixCandidate = {
  id: string;
  issue: TeoyubeManualPreviewIssue;
  fixPlan: TeoyubeManualPreviewIssueFixPlan;
  fixType: TeoyubeManualPreviewSafeFixType;
  riskLevel: TeoyubeManualPreviewSafeFixRiskLevel;
  summary: string;
  filesToChange: string[];
  localOnly: boolean;
  smallScope: boolean;
  reversible: boolean;
  preservesScriptureAnchors: boolean;
  preservesExplanationPaths: boolean;
  preservesFallbackSafety: boolean;
  preservesConsentControls: boolean;
  keepsPersonalizationVisible: boolean;
  externalAnalyticsDisabled: boolean;
  productionPersistenceDisabled: boolean;
  liveAiOrchestrationDisabled: boolean;
  noSecretsExposed: boolean;
  noRawSensitiveTextStorage: boolean;
  noDivineCertaintyClaims: boolean;
  regressionChecks: TeoyubeManualPreviewIssueRegressionCheck[];
  status: TeoyubeManualPreviewSafeFixStatus;
  createdAt: string;
};

export type TeoyubeManualPreviewSafeFixBlocker = {
  id: string;
  candidateId: string;
  message: string;
  requiredAction: string;
  riskLevel: "high" | "critical";
};

export type TeoyubeManualPreviewSafeFixWarning = {
  id: string;
  candidateId: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualPreviewSafeFixResult = {
  id: string;
  candidateId: string;
  issueId: string;
  status: TeoyubeManualPreviewSafeFixStatus;
  filesChanged: string[];
  fixSummary: string;
  riskLevel: TeoyubeManualPreviewSafeFixRiskLevel;
  regressionChecksRequired: TeoyubeManualPreviewIssueRegressionCheck[];
  verificationStatus: "not_run" | "passed" | "warning" | "failed" | "blocked";
  skippedReason?: string;
  blockedReason?: string;
  appliedAt?: string;
};

export type TeoyubeManualPreviewSafeFixReport = {
  valid: boolean;
  decision: TeoyubeManualPreviewSafeFixDecision;
  candidateCount: number;
  safeToApplyCount: number;
  manualReviewCount: number;
  blockedCount: number;
  deferredCount: number;
  candidates: TeoyubeManualPreviewSafeFixCandidate[];
  blockers: TeoyubeManualPreviewSafeFixBlocker[];
  warnings: TeoyubeManualPreviewSafeFixWarning[];
  noFixesAppliedAutomatically: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubeManualPreviewRegressionVerification = {
  id: string;
  fixResultId: string;
  regressionCheckIds: string[];
  passed: boolean;
  warnings: string[];
  verifiedAt: string;
};

export type TeoyubeManualPreviewRegressionResult = {
  id: string;
  checkId: string;
  status: "pass" | "warning" | "fail" | "blocked" | "skipped" | "not_run";
  summary: string;
  required: boolean;
  launchCritical: boolean;
  checkedAt: string;
};

export type TeoyubeManualPreviewPostFixReview = {
  id: string;
  safeFixReport: TeoyubeManualPreviewSafeFixReport;
  fixResults: TeoyubeManualPreviewSafeFixResult[];
  regressionResults: TeoyubeManualPreviewRegressionResult[];
  reviewedByOwner: boolean;
  readyForPreviewRecheck: boolean;
  notes: string[];
  generatedAt: string;
};
