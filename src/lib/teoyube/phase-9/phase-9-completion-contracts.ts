export type { TeoyubePhase10RoadmapItem } from "./phase-10-roadmap-contracts";

export type TeoyubePhase9CompletionStatus =
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase9CompletionArea =
  | "controlled_public_release_preparation"
  | "final_public_copy_review"
  | "known_limitations"
  | "service_lock_confirmation"
  | "privacy_security_confirmation"
  | "safety_confirmation"
  | "support_feedback_readiness"
  | "operational_readiness"
  | "owner_approval_gate"
  | "release_candidate_qa"
  | "manual_monitoring"
  | "public_support_readiness"
  | "public_issue_triage"
  | "public_feedback_readiness"
  | "release_candidate_fix_queue"
  | "final_regression_qa"
  | "public_go_no_go_score"
  | "controlled_public_go_no_go"
  | "final_owner_approval"
  | "operational_handoff"
  | "pause_rollback"
  | "documentation"
  | "roadmap"
  | "unknown";

export type TeoyubePhase9CompletionDecision =
  | "phase_9_complete"
  | "phase_9_complete_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_public_readiness_fix"
  | "needs_service_lock_fix"
  | "needs_documentation_fix"
  | "unknown";

export type TeoyubePhase9CompletionBlocker = {
  id: string;
  area: TeoyubePhase9CompletionArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase9CompletionWarning = {
  id: string;
  area: TeoyubePhase9CompletionArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase9CompletionCheck = {
  id: string;
  area: TeoyubePhase9CompletionArea;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase9RemainingRisk = {
  id: string;
  area: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "accepted" | "resolved";
  message: string;
  mitigation: string;
  resolution?: string;
};

export type TeoyubePhase9LockedReadinessItem = {
  id: string;
  area: TeoyubePhase9CompletionArea;
  label: string;
  locked: boolean;
  details: string;
};

export type TeoyubePhase9CompletionReport = {
  valid: boolean;
  status: TeoyubePhase9CompletionStatus;
  decision: TeoyubePhase9CompletionDecision;
  checks: TeoyubePhase9CompletionCheck[];
  blockers: TeoyubePhase9CompletionBlocker[];
  warnings: TeoyubePhase9CompletionWarning[];
  lockedReadinessItems: TeoyubePhase9LockedReadinessItem[];
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

export type TeoyubePhase9CompletionPackage = {
  id: string;
  phase9CompletionReview: TeoyubePhase9CompletionReport;
  publicReadinessLockReport: unknown;
  finalServiceDisabledLockReport: unknown;
  phase9EvidenceArchive: unknown;
  phase9FeatureInventory: unknown;
  phase9RemainingRiskRegister: unknown;
  ownerCompletionReview: unknown;
  phase10Roadmap: unknown;
  completionReport: TeoyubePhase9CompletionReport;
  remainingRisks: TeoyubePhase9RemainingRisk[];
  phase10RoadmapItems: import("./phase-10-roadmap-contracts").TeoyubePhase10RoadmapItem[];
  nextActionRecommendation: "Phase 10.1 - Controlled Public Release Execution Plan, Manual Launch Checklist & Monitoring Boundaries";
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
