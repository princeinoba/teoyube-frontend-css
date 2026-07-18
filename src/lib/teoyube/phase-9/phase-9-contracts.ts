export type TeoyubePhase9Status =
  | "planned"
  | "in_progress"
  | "complete"
  | "complete_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubePhase9Area =
  | "controlled_public_release_preparation"
  | "public_release_candidate_review"
  | "final_public_copy_review"
  | "final_owner_approval"
  | "support_feedback_readiness"
  | "manual_public_monitoring"
  | "service_gate_follow_up"
  | "privacy_security_final_review"
  | "performance_mobile_accessibility_final_review"
  | "operational_readiness"
  | "release_boundary"
  | "known_limitations"
  | "unknown";

export type TeoyubePhase9Priority = "critical" | "high" | "medium" | "low";

export type TeoyubePhase9Decision =
  | "ready_for_phase_9_2"
  | "ready_with_warnings"
  | "blocked"
  | "needs_copy_review"
  | "needs_privacy_security_review"
  | "needs_service_lock_review"
  | "needs_owner_approval"
  | "needs_operational_readiness_review"
  | "unknown";

export type TeoyubePhase9Blocker = {
  id: string;
  area: TeoyubePhase9Area;
  message: string;
  requiredAction: string;
};

export type TeoyubePhase9Warning = {
  id: string;
  area: TeoyubePhase9Area;
  message: string;
  recommendedAction: string;
};

export type TeoyubePhase9Check = {
  id: string;
  area: TeoyubePhase9Area;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase9Risk = {
  id: string;
  area: TeoyubePhase9Area;
  priority: TeoyubePhase9Priority;
  status: "open" | "accepted" | "resolved";
  message: string;
  mitigation: string;
};

export type TeoyubePhase9NextAction = {
  id: string;
  area: TeoyubePhase9Area;
  priority: TeoyubePhase9Priority;
  label: string;
  details: string;
  ownerReviewRequired: boolean;
  doesNotLaunchPublicly: true;
  doesNotContactUsers: true;
  doesNotConnectServices: true;
};

export type TeoyubePhase9Report = {
  valid: boolean;
  status: TeoyubePhase9Status;
  decision: TeoyubePhase9Decision;
  checks: TeoyubePhase9Check[];
  blockers: TeoyubePhase9Blocker[];
  warnings: TeoyubePhase9Warning[];
  risks: TeoyubePhase9Risk[];
  nextActions: TeoyubePhase9NextAction[];
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
