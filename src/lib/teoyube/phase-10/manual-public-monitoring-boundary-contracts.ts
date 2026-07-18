export type TeoyubeManualPublicMonitoringBoundaryStatus =
  | "valid"
  | "valid_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeManualPublicMonitoringBoundaryArea =
  | "manual_observation_only"
  | "no_analytics"
  | "no_monitoring_provider"
  | "no_tracking"
  | "no_automatic_alerts"
  | "no_user_contact"
  | "no_feedback_collection"
  | "no_public_url_fetching"
  | "manual_issue_log"
  | "manual_pause_rollback"
  | "privacy_security"
  | "unknown";

export type TeoyubeManualPublicMonitoringBoundaryDecision =
  | "manual_monitoring_ready"
  | "manual_monitoring_ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeManualPublicMonitoringBoundaryRule = {
  id: string;
  area: TeoyubeManualPublicMonitoringBoundaryArea;
  label: string;
  required: boolean;
  passed: boolean;
  details: string;
};

export type TeoyubeManualPublicMonitoringBoundaryCheck = TeoyubeManualPublicMonitoringBoundaryRule;

export type TeoyubeManualPublicMonitoringBoundaryBlocker = {
  id: string;
  area: TeoyubeManualPublicMonitoringBoundaryArea;
  message: string;
};

export type TeoyubeManualPublicMonitoringBoundaryWarning = {
  id: string;
  area: TeoyubeManualPublicMonitoringBoundaryArea;
  message: string;
};

export type TeoyubeManualPublicMonitoringBoundaryReport = {
  valid: boolean;
  status: TeoyubeManualPublicMonitoringBoundaryStatus;
  decision: TeoyubeManualPublicMonitoringBoundaryDecision;
  rules: TeoyubeManualPublicMonitoringBoundaryRule[];
  blockers: TeoyubeManualPublicMonitoringBoundaryBlocker[];
  warnings: TeoyubeManualPublicMonitoringBoundaryWarning[];
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noTrackingEnabled: true;
  noAutomaticAlertsEnabled: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
