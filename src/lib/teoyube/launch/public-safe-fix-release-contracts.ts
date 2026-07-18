import type { TeoyubePublicFixQueue } from "./public-fix-queue-contracts";
import type { TeoyubePublicFixQueueItem } from "./public-feedback-triage-contracts";

export type TeoyubePublicSafeFixReleaseStatus =
  | "candidate"
  | "planned"
  | "released"
  | "skipped"
  | "blocked"
  | "deferred"
  | "verified"
  | "unknown";

export type TeoyubePublicSafeFixReleaseType =
  | "mobile_layout_patch"
  | "accessibility_patch"
  | "public_copy_patch"
  | "content_clarity_patch"
  | "privacy_notice_patch"
  | "terms_notice_patch"
  | "consent_visibility_patch"
  | "fallback_display_patch"
  | "offline_fallback_patch"
  | "scripture_anchor_display_patch"
  | "explanation_path_display_patch"
  | "confidence_label_patch"
  | "debug_visibility_patch"
  | "export_fix"
  | "type_error_fix"
  | "test_fixture_fix"
  | "documentation_fix"
  | "manual_only"
  | "blocked"
  | "unknown";

export type TeoyubePublicSafeFixReleaseRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubePublicSafeFixReleaseDecision =
  | "ready_for_safe_release"
  | "ready_after_owner_review"
  | "blocked"
  | "defer"
  | "manual_review_required"
  | "unknown";

export type TeoyubePublicStabilizationStatus =
  | "stabilized"
  | "stabilized_with_warnings"
  | "needs_review"
  | "pause_recommended"
  | "rollback_recommended"
  | "blocked"
  | "unknown";

export type TeoyubePublicStabilizationDecision =
  | "continue_public_launch"
  | "continue_with_warnings"
  | "pause_for_review"
  | "prepare_rollback"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePublicSafeFixReleaseCandidate = {
  id: string;
  sourceFixQueueItemId?: string;
  sourceFixQueueItem?: TeoyubePublicFixQueueItem;
  title: string;
  releaseType: TeoyubePublicSafeFixReleaseType;
  riskLevel: TeoyubePublicSafeFixReleaseRiskLevel;
  summary: string;
  proposedFix: string;
  filesToChange: string[];
  localOnly: boolean;
  smallScope: boolean;
  reversible: boolean;
  regressionTestable: boolean;
  manualOnly: true;
  preservesScriptureAnchors: boolean;
  preservesExplanationPaths: boolean;
  preservesFallbackSafety: boolean;
  preservesConfidenceLabels: boolean;
  preservesConsentControls: boolean;
  preservesPrivacyTermsConsentNotices: boolean;
  hiddenPersonalizationDisabled: boolean;
  externalAnalyticsDisabled: boolean;
  productionPersistenceDisabled: boolean;
  liveAiOrchestrationDisabled: boolean;
  noSecretsExposed: boolean;
  noRawSensitiveTextStorage: boolean;
  noDivineCertaintyClaims: boolean;
  noLegalApprovalClaimedWithoutRecord: boolean;
  noExternalProductionServices: boolean;
  ownerReviewRequired: boolean;
  deferred: boolean;
  blockedReason?: string;
  regressionChecks: string[];
  status: TeoyubePublicSafeFixReleaseStatus;
  createdAt: string;
};

export type TeoyubePublicSafeFixReleasePlan = {
  id: string;
  label: string;
  sourceFixQueueId?: string;
  sourceFixQueue?: TeoyubePublicFixQueue;
  candidates: TeoyubePublicSafeFixReleaseCandidate[];
  safeLocalFixes: TeoyubePublicSafeFixReleaseCandidate[];
  manualReviewFixes: TeoyubePublicSafeFixReleaseCandidate[];
  blockedFixes: TeoyubePublicSafeFixReleaseCandidate[];
  deferredFixes: TeoyubePublicSafeFixReleaseCandidate[];
  manualOnly: true;
  inMemoryOnly: true;
  noAutoApply: true;
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

export type TeoyubePublicSafeFixReleaseBlocker = {
  id: string;
  candidateId?: string;
  label: string;
  reason: string;
  requiredAction: string;
  riskLevel: "high" | "critical";
};

export type TeoyubePublicSafeFixReleaseWarning = {
  id: string;
  candidateId?: string;
  label: string;
  message: string;
  recommendedAction: string;
  riskLevel: "low" | "medium" | "high";
};

export type TeoyubePublicSafeFixReleaseResult = {
  id: string;
  candidateId: string;
  sourceFixQueueItemId?: string;
  status: TeoyubePublicSafeFixReleaseStatus;
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

export type TeoyubePublicSafeFixReleaseReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubePublicSafeFixReleaseDecision;
  plan: TeoyubePublicSafeFixReleasePlan;
  candidateCount: number;
  safeReleaseCount: number;
  manualReviewCount: number;
  blockedCount: number;
  deferredCount: number;
  blockers: TeoyubePublicSafeFixReleaseBlocker[];
  warnings: TeoyubePublicSafeFixReleaseWarning[];
  noFixesAppliedAutomatically: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};
