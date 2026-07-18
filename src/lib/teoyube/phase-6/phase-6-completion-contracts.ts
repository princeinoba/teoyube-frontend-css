export type TeoyubePhase6CompletionStatus =
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubePhase6CompletionArea =
  | "controlled_beta_execution_plan"
  | "manual_participant_workflow"
  | "communication_boundaries"
  | "feedback_boundaries"
  | "issue_intake"
  | "operations_checklist"
  | "safety_theology_boundaries"
  | "privacy_consent_boundaries"
  | "service_disabled_boundaries"
  | "manual_beta_dry_run"
  | "simulated_participant_session"
  | "feedback_intake_simulation"
  | "dry_run_issue_triage"
  | "dry_run_fix_queue"
  | "stabilization"
  | "operations_readiness"
  | "regression_qa"
  | "readiness_score"
  | "owner_review"
  | "documentation"
  | "roadmap"
  | "unknown";

export type TeoyubePhase6CompletionDecision =
  | "phase_6_complete"
  | "phase_6_complete_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_operations_fix"
  | "needs_service_boundary_fix"
  | "needs_documentation_fix"
  | "unknown";

export type TeoyubePhase6CompletionBlocker = {
  id: string;
  area: TeoyubePhase6CompletionArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase6CompletionWarning = {
  id: string;
  area: TeoyubePhase6CompletionArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase6CompletionCheck = {
  id: string;
  area: TeoyubePhase6CompletionArea;
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubePhase6CompletionBlocker[];
  warnings: TeoyubePhase6CompletionWarning[];
};

export type TeoyubePhase6RemainingRisk = {
  id: string;
  area:
    | "manual_execution"
    | "participant_workflow"
    | "communication_boundaries"
    | "feedback_boundaries"
    | "issue_intake"
    | "operations_readiness"
    | "pause_rollback"
    | "service_disabled_state"
    | "privacy_consent"
    | "scripture_anchor"
    | "explanation_trace"
    | "fallback"
    | "confidence_label"
    | "reviewed_content_gate"
    | "controlled_admin"
    | "mobile"
    | "accessibility"
    | "future_persistence"
    | "future_analytics"
    | "future_monitoring"
    | "future_live_ai"
    | "unknown";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "accepted" | "resolved";
  message: string;
  mitigation: string;
  resolution?: string;
};

export type TeoyubePhase6LockedOperationsItem = {
  id: string;
  area: TeoyubePhase6CompletionArea;
  label: string;
  locked: boolean;
  rules: string[];
  sourceFiles: string[];
};

export type TeoyubePhase7RoadmapItem = {
  id: string;
  theme:
    | "controlled_beta_operations"
    | "manual_feedback_review"
    | "manual_issue_triage"
    | "beta_support_workflow"
    | "operational_monitoring_manual"
    | "content_review_follow_up"
    | "product_stabilization"
    | "mobile_accessibility_hardening"
    | "performance_hardening"
    | "service_gate_follow_up"
    | "privacy_security_follow_up"
    | "post_beta_readiness"
    | "unknown";
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  summary: string;
  blockedBy: string[];
  doesNotLaunchBeta: true;
  doesNotContactUsers: true;
  doesNotConnectServices: true;
};

export type TeoyubePhase6CompletionReport = {
  valid: boolean;
  status: TeoyubePhase6CompletionStatus;
  decision: TeoyubePhase6CompletionDecision;
  checks: TeoyubePhase6CompletionCheck[];
  blockers: TeoyubePhase6CompletionBlocker[];
  warnings: TeoyubePhase6CompletionWarning[];
  completionPercentage: number;
  lockedOperationsItems: TeoyubePhase6LockedOperationsItem[];
  remainingRisks: TeoyubePhase6RemainingRisk[];
  phase7RoadmapItems: TeoyubePhase7RoadmapItem[];
  nextMilestone: "TEOYUBE Phase 7 - Controlled Beta Operations, Manual Feedback Review & Product Stabilization";
  nextStep: "Phase 7.1 - Controlled Beta Operations Runbook, Manual Feedback Review & Support Workflow";
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
  noUserAccountsAdded: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase6CompletionPackage = {
  id: string;
  completionReport: TeoyubePhase6CompletionReport;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.1 - Controlled Beta Operations Runbook, Manual Feedback Review & Support Workflow";
  noExternalSend: true;
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
  noUserAccountsAdded: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
