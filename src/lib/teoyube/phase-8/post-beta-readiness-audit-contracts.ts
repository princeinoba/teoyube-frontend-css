export type TeoyubePostBetaReadinessAuditStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubePostBetaReadinessAuditArea =
  | "phase_7_completion"
  | "operations_lock"
  | "service_disabled_lock"
  | "manual_feedback_review"
  | "support_workflow"
  | "issue_triage"
  | "product_stabilization"
  | "regression_qa"
  | "readiness_score"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "mobile_accessibility"
  | "performance"
  | "known_limitations"
  | "public_release_preparation"
  | "unknown";

export type TeoyubePostBetaReadinessAuditDecision =
  | "ready_for_product_hardening_planning"
  | "ready_with_warnings"
  | "blocked"
  | "needs_operations_review"
  | "needs_service_reassessment_review"
  | "needs_privacy_security_review"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePostBetaReadinessAuditBlocker = {
  id: string;
  area: TeoyubePostBetaReadinessAuditArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePostBetaReadinessAuditWarning = {
  id: string;
  area: TeoyubePostBetaReadinessAuditArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePostBetaReadinessAuditCheck = {
  id: string;
  area: TeoyubePostBetaReadinessAuditArea;
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubePostBetaReadinessAuditBlocker[];
  warnings: TeoyubePostBetaReadinessAuditWarning[];
};

export type TeoyubePostBetaReadinessEvidence = {
  id: string;
  area: TeoyubePostBetaReadinessAuditArea;
  source: string;
  status: "available" | "planning_only" | "missing" | "warning";
  details: string;
  noRealBetaResultClaimed: boolean;
};

export type TeoyubePostBetaReadinessRisk = {
  id: string;
  area: TeoyubePostBetaReadinessAuditArea;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubePostBetaReadinessAuditReport = {
  valid: boolean;
  status: TeoyubePostBetaReadinessAuditStatus;
  decision: TeoyubePostBetaReadinessAuditDecision;
  checks: TeoyubePostBetaReadinessAuditCheck[];
  evidence: TeoyubePostBetaReadinessEvidence[];
  risks: TeoyubePostBetaReadinessRisk[];
  blockers: TeoyubePostBetaReadinessAuditBlocker[];
  warnings: TeoyubePostBetaReadinessAuditWarning[];
  noRealBetaResultsClaimed: true;
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
