export type TeoyubeFirstHourMonitoringStatus =
  | "not_started"
  | "ready"
  | "observing"
  | "issue_found"
  | "paused"
  | "rolled_back"
  | "completed"
  | "blocked"
  | "unknown";

export type TeoyubeFirstHourMonitoringWindow =
  | "minute_0_to_10"
  | "minute_10_to_20"
  | "minute_20_to_40"
  | "minute_40_to_60"
  | "post_first_hour_review"
  | "unknown";

export type TeoyubeFirstHourMonitoringArea =
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
  | "unknown";

export type TeoyubeFirstHourMonitoringDecision =
  | "continue"
  | "continue_with_watch"
  | "pause"
  | "rollback"
  | "blocked"
  | "unknown";

export type TeoyubeFirstHourMonitoringCheckpoint = {
  id: string;
  window: TeoyubeFirstHourMonitoringWindow;
  area: TeoyubeFirstHourMonitoringArea;
  label: string;
  completed: boolean;
  details: string;
};

export type TeoyubeFirstHourMonitoringObservation = {
  id: string;
  window: TeoyubeFirstHourMonitoringWindow;
  area: TeoyubeFirstHourMonitoringArea;
  status: TeoyubeFirstHourMonitoringStatus;
  summary: string;
  observedAt: string;
  ownerNotes: string[];
};

export type TeoyubeFirstHourMonitoringIssue = {
  id: string;
  window: TeoyubeFirstHourMonitoringWindow;
  area: TeoyubeFirstHourMonitoringArea;
  severity: "severity_1_critical" | "severity_2_high" | "severity_3_medium" | "severity_4_low";
  summary: string;
  requiresPause: boolean;
  requiresRollbackReview: boolean;
  notes: string[];
};

export type TeoyubeFirstHourMonitoringBlocker = {
  id: string;
  window: TeoyubeFirstHourMonitoringWindow;
  area: TeoyubeFirstHourMonitoringArea;
  message: string;
};

export type TeoyubeFirstHourMonitoringWarning = {
  id: string;
  window: TeoyubeFirstHourMonitoringWindow;
  area: TeoyubeFirstHourMonitoringArea;
  message: string;
};

export type TeoyubeFirstHourMonitoringReport = {
  valid: boolean;
  status: TeoyubeFirstHourMonitoringStatus;
  decision: TeoyubeFirstHourMonitoringDecision;
  checklist: TeoyubeFirstHourMonitoringCheckpoint[];
  observations: TeoyubeFirstHourMonitoringObservation[];
  issues: TeoyubeFirstHourMonitoringIssue[];
  blockers: TeoyubeFirstHourMonitoringBlocker[];
  warnings: TeoyubeFirstHourMonitoringWarning[];
  noAutomaticMonitoringProvider: true;
  noPublicUrlsFetchedAutomatically: true;
  noFeedbackCollectedAutomatically: true;
  noAnalyticsEnabled: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
