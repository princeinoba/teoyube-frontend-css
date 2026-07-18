export type TeoyubePhase10Status =
  | "complete"
  | "in_progress"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase10Area =
  | "controlled_public_release_execution_planning"
  | "manual_launch_checklist"
  | "manual_public_monitoring"
  | "manual_support_feedback"
  | "public_issue_triage"
  | "pause_rollback_readiness"
  | "service_gate_follow_up"
  | "privacy_security_follow_up"
  | "operational_stabilization"
  | "post_release_readiness"
  | "real_app_verification"
  | "build_route_deployment_readiness"
  | "owner_approval"
  | "unknown";

export type TeoyubePhase10Priority = "critical" | "high" | "medium" | "low";

export type TeoyubePhase10Decision =
  | "phase_10_1_complete"
  | "ready_for_phase_10_2"
  | "ready_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_real_app_verification"
  | "unknown";

export type TeoyubePhase10Check = {
  id: string;
  area: TeoyubePhase10Area;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase10Blocker = {
  id: string;
  area: TeoyubePhase10Area;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase10Warning = {
  id: string;
  area: TeoyubePhase10Area;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase10Risk = {
  id: string;
  area: TeoyubePhase10Area;
  priority: TeoyubePhase10Priority;
  message: string;
  mitigation: string;
};

export type TeoyubePhase10NextAction = {
  id: string;
  area: TeoyubePhase10Area;
  priority: TeoyubePhase10Priority;
  label: string;
  details: string;
};

export type TeoyubePhase10Report = {
  valid: boolean;
  status: TeoyubePhase10Status;
  decision: TeoyubePhase10Decision;
  checks: TeoyubePhase10Check[];
  blockers: TeoyubePhase10Blocker[];
  warnings: TeoyubePhase10Warning[];
  risks: TeoyubePhase10Risk[];
  nextActions: TeoyubePhase10NextAction[];
  noPublicLaunchPerformed: true;
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
