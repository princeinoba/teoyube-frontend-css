export type TeoyubeControlledReleaseExecutionStatus =
  | "not_started"
  | "ready_to_start"
  | "in_progress"
  | "paused"
  | "rolled_back"
  | "completed"
  | "blocked"
  | "unknown";

export type TeoyubeControlledReleaseExecutionStage =
  | "owner_precheck"
  | "public_url_confirmation"
  | "homepage_check"
  | "core_route_check"
  | "tig_panel_check"
  | "visual_graph_check"
  | "mobile_check"
  | "desktop_check"
  | "feedback_intake_check"
  | "first_hour_monitoring"
  | "decision_logging"
  | "owner_decision"
  | "unknown";

export type TeoyubeControlledReleaseExecutionArea =
  | "release_owner"
  | "launch_window"
  | "public_access"
  | "homepage"
  | "navigation"
  | "canon"
  | "calling_compass"
  | "tig_response_panel"
  | "visual_graph"
  | "promise_scripture_prayer_action"
  | "mobile_layout"
  | "desktop_layout"
  | "feedback_intake"
  | "error_handling"
  | "rollback_readiness"
  | "content_safety"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "unknown";

export type TeoyubeControlledReleaseExecutionDecision =
  | "continue_release"
  | "pause_release"
  | "rollback_release"
  | "continue_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeControlledReleaseExecutionCheck = {
  id: string;
  stage: TeoyubeControlledReleaseExecutionStage;
  area: TeoyubeControlledReleaseExecutionArea;
  label: string;
  passed: boolean;
  requiredBeforeRelease: boolean;
  details: string;
};

export type TeoyubeControlledReleaseExecutionResult = {
  id: string;
  stage: TeoyubeControlledReleaseExecutionStage;
  area: TeoyubeControlledReleaseExecutionArea;
  status: TeoyubeControlledReleaseExecutionStatus;
  summary: string;
  checkedAt: string;
  notes: string[];
};

export type TeoyubeControlledReleaseExecutionRecord = {
  id: string;
  releaseOwner: string;
  launchWindow: string;
  publicAccessMethod: string;
  status: TeoyubeControlledReleaseExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  results: TeoyubeControlledReleaseExecutionResult[];
  notes: string[];
  noPublicLaunchPerformedByCode: true;
  noUsersContactedAutomatically: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
};

export type TeoyubeControlledReleaseExecutionBlocker = {
  id: string;
  stage: TeoyubeControlledReleaseExecutionStage;
  area: TeoyubeControlledReleaseExecutionArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledReleaseExecutionWarning = {
  id: string;
  stage: TeoyubeControlledReleaseExecutionStage;
  area: TeoyubeControlledReleaseExecutionArea;
  message: string;
};

export type TeoyubeControlledReleaseExecutionReport = {
  valid: boolean;
  status: TeoyubeControlledReleaseExecutionStatus;
  decision: TeoyubeControlledReleaseExecutionDecision;
  record: TeoyubeControlledReleaseExecutionRecord;
  checklist: TeoyubeControlledReleaseExecutionCheck[];
  blockers: TeoyubeControlledReleaseExecutionBlocker[];
  warnings: TeoyubeControlledReleaseExecutionWarning[];
  noPublicLaunchPerformedByCode: true;
  noAutomaticDeployment: true;
  noUsersContactedAutomatically: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noLiveAiOrchestrationEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};
