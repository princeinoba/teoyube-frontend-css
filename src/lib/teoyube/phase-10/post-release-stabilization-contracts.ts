export type TeoyubePostReleaseStabilizationStatus =
  | "not_started"
  | "reviewing"
  | "stable"
  | "stable_with_warnings"
  | "needs_safe_fixes"
  | "paused"
  | "rollback_required"
  | "blocked"
  | "unknown";

export type TeoyubePostReleaseStabilizationArea =
  | "app_availability"
  | "homepage"
  | "navigation"
  | "canon"
  | "calling_compass"
  | "tig_response_panel"
  | "visual_graph"
  | "spiritual_response_sections"
  | "mobile_layout"
  | "desktop_layout"
  | "feedback_intake"
  | "error_handling"
  | "content_safety"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "owner_review"
  | "unknown";

export type TeoyubePostReleaseStabilizationDecision =
  | "continue_controlled_release"
  | "continue_with_watch"
  | "pause_promotion"
  | "safe_fix_required"
  | "rollback_required"
  | "move_to_first_week_stabilization"
  | "blocked"
  | "unknown";

export type TeoyubePostReleaseStabilizationCheck = {
  id: string;
  area: TeoyubePostReleaseStabilizationArea;
  label: string;
  passed: boolean;
  critical: boolean;
  details: string;
};

export type TeoyubePostReleaseStabilizationResult = {
  id: string;
  area: TeoyubePostReleaseStabilizationArea;
  status: TeoyubePostReleaseStabilizationStatus;
  summary: string;
  reviewedAt: string;
  notes: string[];
};

export type TeoyubePostReleaseStabilizationRecord = {
  id: string;
  status: TeoyubePostReleaseStabilizationStatus;
  releaseOwner: string;
  firstDayWindow: string;
  results: TeoyubePostReleaseStabilizationResult[];
  notes: string[];
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
};

export type TeoyubePostReleaseStabilizationBlocker = {
  id: string;
  area: TeoyubePostReleaseStabilizationArea;
  message: string;
  requiredAction: string;
};

export type TeoyubePostReleaseStabilizationWarning = {
  id: string;
  area: TeoyubePostReleaseStabilizationArea;
  message: string;
};

export type TeoyubePostReleaseStabilizationReport = {
  valid: boolean;
  status: TeoyubePostReleaseStabilizationStatus;
  decision: TeoyubePostReleaseStabilizationDecision;
  record: TeoyubePostReleaseStabilizationRecord;
  checklist: TeoyubePostReleaseStabilizationCheck[];
  blockers: TeoyubePostReleaseStabilizationBlocker[];
  warnings: TeoyubePostReleaseStabilizationWarning[];
  noPublicLaunchPerformedByCode: true;
  noAutomaticDeployment: true;
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};
