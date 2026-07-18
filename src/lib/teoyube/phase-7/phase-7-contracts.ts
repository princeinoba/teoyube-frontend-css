export type TeoyubePhase7Status =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "in_progress"
  | "unknown";

export type TeoyubePhase7Area =
  | "controlled_beta_operations"
  | "operations_runbook"
  | "manual_feedback_review"
  | "manual_issue_triage"
  | "beta_support_workflow"
  | "manual_operational_monitoring"
  | "content_review_follow_up"
  | "product_stabilization"
  | "mobile_accessibility_hardening"
  | "performance_hardening"
  | "service_gate_follow_up"
  | "privacy_security_follow_up"
  | "post_beta_readiness"
  | "owner_review"
  | "unknown";

export type TeoyubePhase7Priority = "critical" | "high" | "medium" | "low";

export type TeoyubePhase7Decision =
  | "phase_7_1_ready"
  | "phase_7_1_ready_with_warnings"
  | "needs_owner_review"
  | "blocked"
  | "unknown";

export type TeoyubePhase7Blocker = {
  id: string;
  area: TeoyubePhase7Area;
  message: string;
  requiredAction: string;
  priority: TeoyubePhase7Priority;
};

export type TeoyubePhase7Warning = {
  id: string;
  area: TeoyubePhase7Area;
  message: string;
  recommendedAction: string;
  priority: TeoyubePhase7Priority;
};

export type TeoyubePhase7Check = {
  id: string;
  area: TeoyubePhase7Area;
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubePhase7Blocker[];
  warnings: TeoyubePhase7Warning[];
};

export type TeoyubePhase7Risk = {
  id: string;
  area: TeoyubePhase7Area;
  priority: TeoyubePhase7Priority;
  status: "open" | "accepted" | "resolved";
  message: string;
  mitigation: string;
  resolution?: string;
};

export type TeoyubePhase7NextAction = {
  id: string;
  area: TeoyubePhase7Area;
  label: string;
  priority: TeoyubePhase7Priority;
  manualOnly: true;
  doesNotLaunchBeta: true;
  doesNotConnectServices: true;
};

export type TeoyubePhase7Report = {
  valid: boolean;
  status: TeoyubePhase7Status;
  decision: TeoyubePhase7Decision;
  checks: TeoyubePhase7Check[];
  blockers: TeoyubePhase7Blocker[];
  warnings: TeoyubePhase7Warning[];
  risks: TeoyubePhase7Risk[];
  nextActions: TeoyubePhase7NextAction[];
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
