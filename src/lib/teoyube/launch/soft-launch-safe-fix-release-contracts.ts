import type { TeoyubeSoftLaunchFixQueue } from "./soft-launch-fix-queue-contracts";
import type { TeoyubeSoftLaunchFixQueueItem } from "./soft-launch-feedback-triage-contracts";

export type TeoyubeSoftLaunchSafeFixReleaseStatus =
  | "candidate"
  | "planned"
  | "released"
  | "skipped"
  | "blocked"
  | "deferred"
  | "verified"
  | "unknown";

export type TeoyubeSoftLaunchSafeFixReleaseType =
  | "ui_layout_patch"
  | "accessibility_patch"
  | "copy_clarity_patch"
  | "fallback_display_patch"
  | "scripture_anchor_display_patch"
  | "explanation_path_display_patch"
  | "consent_visibility_patch"
  | "debug_visibility_patch"
  | "export_fix"
  | "type_error_fix"
  | "test_fixture_fix"
  | "documentation_fix"
  | "manual_only"
  | "blocked"
  | "unknown";

export type TeoyubeSoftLaunchSafeFixReleaseRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubeSoftLaunchSafeFixReleaseDecision =
  | "ready_for_safe_release"
  | "ready_after_owner_review"
  | "blocked"
  | "defer"
  | "manual_review_required"
  | "unknown";

export type TeoyubeSoftLaunchStabilizationStatus =
  | "stabilized"
  | "stabilized_with_warnings"
  | "needs_review"
  | "pause_recommended"
  | "rollback_recommended"
  | "blocked"
  | "unknown";

export type TeoyubeSoftLaunchStabilizationDecision =
  | "continue_soft_launch"
  | "continue_with_warnings"
  | "pause_for_review"
  | "prepare_rollback"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeSoftLaunchSafeFixReleaseCandidate = {
  id: string;
  sourceFixQueueItemId?: string;
  sourceFixQueueItem?: TeoyubeSoftLaunchFixQueueItem;
  title: string;
  releaseType: TeoyubeSoftLaunchSafeFixReleaseType;
  riskLevel: TeoyubeSoftLaunchSafeFixReleaseRiskLevel;
  summary: string;
  proposedFix: string;
  filesToChange: string[];
  localOnly: boolean;
  smallScope: boolean;
  reversible: boolean;
  regressionTestable: boolean;
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
  noExternalProductionServices: boolean;
  ownerReviewRequired: boolean;
  deferred: boolean;
  blockedReason?: string;
  regressionChecks: string[];
  status: TeoyubeSoftLaunchSafeFixReleaseStatus;
  createdAt: string;
};

export type TeoyubeSoftLaunchSafeFixReleasePlan = {
  id: string;
  label: string;
  sourceFixQueueId?: string;
  sourceFixQueue?: TeoyubeSoftLaunchFixQueue;
  candidates: TeoyubeSoftLaunchSafeFixReleaseCandidate[];
  safeLocalFixes: TeoyubeSoftLaunchSafeFixReleaseCandidate[];
  manualReviewFixes: TeoyubeSoftLaunchSafeFixReleaseCandidate[];
  blockedFixes: TeoyubeSoftLaunchSafeFixReleaseCandidate[];
  deferredFixes: TeoyubeSoftLaunchSafeFixReleaseCandidate[];
  manualOnly: true;
  inMemoryOnly: true;
  noAutoApply: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  generatedAt: string;
};

export type TeoyubeSoftLaunchSafeFixReleaseBlocker = {
  id: string;
  candidateId?: string;
  label: string;
  reason: string;
  requiredAction: string;
  riskLevel: "high" | "critical";
};

export type TeoyubeSoftLaunchSafeFixReleaseWarning = {
  id: string;
  candidateId?: string;
  label: string;
  message: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
};

export type TeoyubeSoftLaunchSafeFixReleaseResult = {
  id: string;
  candidateId: string;
  sourceFixQueueItemId?: string;
  status: TeoyubeSoftLaunchSafeFixReleaseStatus;
  filesChanged: string[];
  fixSummary: string;
  safetyStatus: "passed" | "warning" | "failed" | "blocked" | "not_run";
  regressionChecksRequired: string[];
  verificationStatus: "not_run" | "passed" | "warning" | "failed" | "blocked";
  skippedReason?: string;
  blockedReason?: string;
  deferredReason?: string;
  releasedAt?: string;
};

export type TeoyubeSoftLaunchSafeFixReleaseReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubeSoftLaunchSafeFixReleaseDecision;
  plan: TeoyubeSoftLaunchSafeFixReleasePlan;
  candidateCount: number;
  safeReleaseCount: number;
  manualReviewCount: number;
  blockedCount: number;
  deferredCount: number;
  blockers: TeoyubeSoftLaunchSafeFixReleaseBlocker[];
  warnings: TeoyubeSoftLaunchSafeFixReleaseWarning[];
  noFixesAppliedAutomatically: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalWrite: true;
  generatedAt: string;
};
