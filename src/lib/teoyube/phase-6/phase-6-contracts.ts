export type TeoyubePhase6Status =
  | "planning"
  | "in_progress"
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubePhase6Area =
  | "controlled_beta_execution_planning"
  | "manual_participant_workflow"
  | "manual_feedback_intake"
  | "beta_issue_triage"
  | "beta_operations"
  | "beta_readiness_monitoring"
  | "service_gate_follow_up"
  | "privacy_security_follow_up"
  | "performance_hardening"
  | "mobile_accessibility_hardening"
  | "content_review_follow_up"
  | "operational_stabilization"
  | "owner_review"
  | "unknown";

export type TeoyubePhase6Priority = "critical" | "high" | "medium" | "low";

export type TeoyubePhase6Decision =
  | "ready_for_phase_6_2"
  | "ready_with_warnings"
  | "needs_owner_review"
  | "needs_privacy_review"
  | "needs_service_gate_review"
  | "blocked"
  | "unknown";

export type TeoyubePhase6Blocker = {
  id: string;
  area: TeoyubePhase6Area;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase6Warning = {
  id: string;
  area: TeoyubePhase6Area;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase6Check = {
  id: string;
  area: TeoyubePhase6Area;
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubePhase6Blocker[];
  warnings: TeoyubePhase6Warning[];
};

export type TeoyubePhase6Risk = {
  id: string;
  area: TeoyubePhase6Area;
  priority: TeoyubePhase6Priority;
  status: "open" | "accepted" | "resolved";
  message: string;
  mitigation: string;
};

export type TeoyubePhase6NextAction = {
  id: string;
  label: "Phase 6.2 - Manual Beta Dry Run, Feedback Intake Simulation & Issue Triage";
  area: TeoyubePhase6Area;
  requiredBeforeExecution: boolean;
  summary: string;
};

export type TeoyubePhase6Report = {
  valid: boolean;
  status: TeoyubePhase6Status;
  decision: TeoyubePhase6Decision;
  checks: TeoyubePhase6Check[];
  blockers: TeoyubePhase6Blocker[];
  warnings: TeoyubePhase6Warning[];
  risks: TeoyubePhase6Risk[];
  nextAction: TeoyubePhase6NextAction;
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

