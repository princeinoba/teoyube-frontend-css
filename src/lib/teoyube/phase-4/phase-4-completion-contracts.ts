export type TeoyubePhase4CompletionStatus =
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePhase4CompletionArea =
  | "product_experience_audit"
  | "content_depth_map"
  | "controlled_service_decision_plan"
  | "surface_polish"
  | "content_expansion_backlog"
  | "admin_workflow_design"
  | "content_review_queue"
  | "promise_cluster_drafts"
  | "reviewed_content_gate"
  | "promise_table_ux"
  | "tig_graph_experience"
  | "controlled_admin_prototype"
  | "service_readiness_review"
  | "beta_qa_plan"
  | "service_decision_lock"
  | "beta_readiness_review"
  | "documentation"
  | "roadmap"
  | "unknown";

export type TeoyubePhase4CompletionDecision =
  | "phase_4_complete"
  | "phase_4_complete_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_beta_readiness_fix"
  | "needs_service_lock_fix"
  | "unknown";

export type TeoyubePhase4CompletionBlocker = {
  id: string;
  area: TeoyubePhase4CompletionArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase4CompletionWarning = {
  id: string;
  area: TeoyubePhase4CompletionArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase4CompletionCheck = {
  id: string;
  area: TeoyubePhase4CompletionArea;
  label: string;
  complete: boolean;
  details: string;
  blockers: TeoyubePhase4CompletionBlocker[];
  warnings: TeoyubePhase4CompletionWarning[];
};

export type TeoyubePhase4RemainingRisk = {
  id: string;
  area:
    | "content_depth"
    | "scripture_anchor"
    | "promise_cluster"
    | "reviewed_content_gate"
    | "admin_prototype"
    | "service_decision"
    | "beta_qa"
    | "promise_table_ux"
    | "tig_graph_ux"
    | "mobile"
    | "accessibility"
    | "privacy"
    | "security"
    | "future_persistence"
    | "future_analytics"
    | "future_monitoring"
    | "future_live_ai"
    | "unknown";
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "accepted" | "resolved";
  message: string;
  mitigation: string;
  resolution?: string;
};

export type TeoyubePhase5RoadmapItem = {
  id: string;
  theme:
    | "controlled_beta_preparation"
    | "manual_beta_qa_execution"
    | "reviewed_content_release_process"
    | "admin_workflow_decision"
    | "service_implementation_gate"
    | "privacy_security_review"
    | "performance_hardening"
    | "mobile_accessibility_hardening"
    | "public_feedback_readiness"
    | "operational_readiness"
    | "unknown";
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  summary: string;
  blockedBy: string[];
  doesNotConnectServices: true;
};

export type TeoyubePhase4CompletionReport = {
  valid: boolean;
  status: TeoyubePhase4CompletionStatus;
  decision: TeoyubePhase4CompletionDecision;
  checks: TeoyubePhase4CompletionCheck[];
  blockers: TeoyubePhase4CompletionBlocker[];
  warnings: TeoyubePhase4CompletionWarning[];
  completionPercentage: number;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase4CompletionPackage = {
  id: string;
  betaReadinessReview: unknown;
  serviceDecisionLock: unknown;
  disabledServiceEnforcementQa: unknown;
  completionReview: TeoyubePhase4CompletionReport;
  featureInventory: unknown;
  remainingRiskRegister: unknown;
  ownerCompletionReview: unknown;
  phase5Roadmap: unknown;
  nextActionRecommendation: "Phase 5.1 - Controlled Beta Preparation, Manual QA Execution Plan & Service Gate Review";
  inMemoryOnly: true;
  generatedAt: string;
};
