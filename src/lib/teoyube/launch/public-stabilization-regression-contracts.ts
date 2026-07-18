import type { TeoyubePublicSafeFixReleaseResult } from "./public-safe-fix-release-contracts";

export type TeoyubePublicStabilizationRegressionCheckType =
  | "scripture_anchor_regression"
  | "explanation_path_regression"
  | "fallback_safety_regression"
  | "confidence_label_regression"
  | "privacy_terms_consent_regression"
  | "consent_controls_regression"
  | "mobile_accessibility_regression"
  | "offline_fallback_regression"
  | "debug_visibility_regression"
  | "public_copy_regression"
  | "fix_specific_regression"
  | "performance_smoke"
  | "unknown";

export type TeoyubePublicStabilizationRegressionResultStatus =
  | "pass"
  | "warning"
  | "fail"
  | "blocked"
  | "not_run";

export type TeoyubePublicStabilizationRegressionDecision =
  | "stabilized"
  | "stabilized_with_warnings"
  | "needs_more_testing"
  | "blocked"
  | "unknown";

export type TeoyubePublicStabilizationRegressionCheck = {
  id: string;
  label: string;
  type: TeoyubePublicStabilizationRegressionCheckType;
  required: boolean;
  publicLaunchCritical: boolean;
};

export type TeoyubePublicStabilizationRegressionResult = {
  id: string;
  checkId: string;
  type: TeoyubePublicStabilizationRegressionCheckType;
  status: TeoyubePublicStabilizationRegressionResultStatus;
  summary: string;
  required: boolean;
  publicLaunchCritical: boolean;
  sourceSafeFixResult?: TeoyubePublicSafeFixReleaseResult;
  notes?: string[];
  generatedAt: string;
};

export type TeoyubePublicStabilizationRegressionRun = {
  id: string;
  label: string;
  checks: TeoyubePublicStabilizationRegressionCheck[];
  results: TeoyubePublicStabilizationRegressionResult[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  publicUrlFetched: false;
  liveAiOrchestrationEnabled: false;
  generatedAt: string;
};

export type TeoyubePublicStabilizationRegressionBlocker = {
  id: string;
  checkId?: string;
  message: string;
  requiredAction: string;
};

export type TeoyubePublicStabilizationRegressionWarning = {
  id: string;
  checkId?: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubePublicStabilizationRegressionReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubePublicStabilizationRegressionDecision;
  run: TeoyubePublicStabilizationRegressionRun;
  checkCount: number;
  resultCount: number;
  passedCount: number;
  warningCount: number;
  blockedCount: number;
  blockers: TeoyubePublicStabilizationRegressionBlocker[];
  warnings: TeoyubePublicStabilizationRegressionWarning[];
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};
