export type TeoyubeFirstWeekStabilizationStatus =
  | "not_started"
  | "reviewing"
  | "stable"
  | "stable_with_warnings"
  | "needs_safe_fix_batch"
  | "pause_recommended"
  | "rollback_required"
  | "ready_for_limited_expansion"
  | "blocked"
  | "unknown";

export type TeoyubeFirstWeekStabilizationArea =
  | "app_availability"
  | "core_routes"
  | "canon"
  | "calling_compass"
  | "tig_response_panel"
  | "visual_graph"
  | "spiritual_response_sections"
  | "mobile_layout"
  | "desktop_layout"
  | "manual_feedback"
  | "issue_patterns"
  | "safe_fix_queue"
  | "known_issues"
  | "rollback_readiness"
  | "owner_review"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "unknown";

export type TeoyubeFirstWeekStabilizationDecision =
  | "continue_controlled_release"
  | "continue_with_watch"
  | "pause_promotion"
  | "rollback_required"
  | "safe_fix_batch_required"
  | "ready_for_limited_expansion"
  | "not_ready_for_expansion"
  | "blocked"
  | "unknown";

export type TeoyubeFirstWeekStabilizationCheck = {
  id: string;
  area: TeoyubeFirstWeekStabilizationArea;
  label: string;
  passed: boolean;
  critical: boolean;
  details: string;
};

export type TeoyubeFirstWeekStabilizationResult = {
  id: string;
  area: TeoyubeFirstWeekStabilizationArea;
  status: TeoyubeFirstWeekStabilizationStatus;
  summary: string;
  reviewedAt: string;
  notes: string[];
};

export type TeoyubeFirstWeekStabilizationRecord = {
  id: string;
  status: TeoyubeFirstWeekStabilizationStatus;
  releaseOwner: string;
  firstWeekWindow: string;
  results: TeoyubeFirstWeekStabilizationResult[];
  notes: string[];
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
};

export type TeoyubeFirstWeekStabilizationBlocker = {
  id: string;
  area: TeoyubeFirstWeekStabilizationArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeFirstWeekStabilizationWarning = {
  id: string;
  area: TeoyubeFirstWeekStabilizationArea;
  message: string;
};

export type TeoyubeFirstWeekStabilizationReport = {
  valid: boolean;
  status: TeoyubeFirstWeekStabilizationStatus;
  decision: TeoyubeFirstWeekStabilizationDecision;
  record: TeoyubeFirstWeekStabilizationRecord;
  checklist: TeoyubeFirstWeekStabilizationCheck[];
  blockers: TeoyubeFirstWeekStabilizationBlocker[];
  warnings: TeoyubeFirstWeekStabilizationWarning[];
  noPublicExpansionPerformedByCode: true;
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
