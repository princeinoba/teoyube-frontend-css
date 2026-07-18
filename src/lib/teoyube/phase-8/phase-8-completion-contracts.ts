import type { TeoyubePhase9RoadmapItem } from "./phase-9-roadmap-contracts";

export type { TeoyubePhase9RoadmapItem } from "./phase-9-roadmap-contracts";

export type TeoyubePhase8CompletionStatus =
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase8CompletionArea =
  | "post_beta_readiness_audit"
  | "product_hardening_plan"
  | "controlled_service_reassessment"
  | "product_hardening_execution"
  | "mobile_accessibility_pass"
  | "performance_review"
  | "privacy_security_review"
  | "controlled_service_decision_package"
  | "public_release_readiness_gate"
  | "public_release_candidate_plan"
  | "final_readiness_review"
  | "final_privacy_security_lock"
  | "final_service_decision_lock"
  | "final_boundary_lock"
  | "owner_review"
  | "documentation"
  | "roadmap"
  | "unknown";

export type TeoyubePhase8CompletionDecision =
  | "phase_8_complete"
  | "phase_8_complete_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_privacy_security_fix"
  | "needs_service_decision_fix"
  | "needs_documentation_fix"
  | "unknown";

export type TeoyubePhase8CompletionBlocker = {
  id: string;
  area: TeoyubePhase8CompletionArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase8CompletionWarning = {
  id: string;
  area: TeoyubePhase8CompletionArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase8CompletionCheck = {
  id: string;
  area: TeoyubePhase8CompletionArea;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase8RemainingRiskArea =
  | "post_beta_readiness"
  | "product_hardening"
  | "mobile_accessibility"
  | "performance"
  | "privacy_security"
  | "sensitive_data"
  | "consent"
  | "service_decision"
  | "public_release_readiness"
  | "public_release_boundary"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "manual_support_feedback"
  | "future_persistence"
  | "future_analytics"
  | "future_monitoring"
  | "future_live_ai"
  | "unknown";

export type TeoyubePhase8RemainingRisk = {
  id: string;
  area: TeoyubePhase8RemainingRiskArea;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "accepted" | "resolved";
  message: string;
  mitigation: string;
  resolution?: string;
};

export type TeoyubePhase8LockedReadinessItem = {
  id: string;
  area: TeoyubePhase8CompletionArea;
  label: string;
  locked: boolean;
  details: string;
};

export type TeoyubePhase8CompletionReport = {
  valid: boolean;
  status: TeoyubePhase8CompletionStatus;
  decision: TeoyubePhase8CompletionDecision;
  checks: TeoyubePhase8CompletionCheck[];
  blockers: TeoyubePhase8CompletionBlocker[];
  warnings: TeoyubePhase8CompletionWarning[];
  lockedReadinessItems: TeoyubePhase8LockedReadinessItem[];
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase8CompletionPackage = {
  id: string;
  publicReleaseCandidateReport: unknown;
  finalPublicReadinessReport: unknown;
  finalPrivacySecurityLockReport: unknown;
  finalServiceDecisionLockReport: unknown;
  finalPublicReleaseBoundaryLockReport: unknown;
  phase8CompletionReview: TeoyubePhase8CompletionReport;
  phase8EvidenceArchive: unknown;
  phase8FeatureInventory: unknown;
  phase8RemainingRiskRegister: unknown;
  ownerCompletionReview: unknown;
  phase9Roadmap: unknown;
  completionReport: TeoyubePhase8CompletionReport;
  remainingRisks: TeoyubePhase8RemainingRisk[];
  phase9RoadmapItems: TeoyubePhase9RoadmapItem[];
  nextActionRecommendation: "Phase 9.1 - Controlled Public Release Preparation Plan, Final Copy Review & Owner Approval Gate";
  blockers: string[];
  warnings: string[];
  noExternalSend: true;
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
