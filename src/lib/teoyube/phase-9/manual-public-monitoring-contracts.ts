export type TeoyubeManualPublicMonitoringStatus =
  | "pending"
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeManualPublicMonitoringArea =
  | "app_load_manual"
  | "real_data_loading"
  | "user_journey"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "service_disabled_state"
  | "privacy_consent"
  | "manual_support"
  | "manual_feedback"
  | "manual_issue_triage"
  | "mobile"
  | "accessibility"
  | "performance_manual"
  | "unknown";

export type TeoyubeManualPublicMonitoringDecision =
  | "manual_monitoring_ready"
  | "manual_monitoring_ready_with_warnings"
  | "manual_monitoring_blocked"
  | "unknown";

export type TeoyubeManualPublicMonitoringCheck = {
  id: string;
  area: TeoyubeManualPublicMonitoringArea;
  label: string;
  required: boolean;
  passed: boolean;
  details: string;
};

export type TeoyubeManualPublicMonitoringResult = {
  id: string;
  area: TeoyubeManualPublicMonitoringArea;
  status: TeoyubeManualPublicMonitoringStatus;
  passed: boolean;
  notes: string[];
  blocker: boolean;
};

export type TeoyubeManualPublicMonitoringRun = {
  id: string;
  checklist: TeoyubeManualPublicMonitoringCheck[];
  results: TeoyubeManualPublicMonitoringResult[];
  manualOnly: true;
  noPublicUrlFetch: true;
  noMonitoringProviderConnected: true;
  noAlertsSent: true;
  noAnalyticsSent: true;
  noExternalPersistence: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubeManualPublicMonitoringBlocker = {
  id: string;
  area: TeoyubeManualPublicMonitoringArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeManualPublicMonitoringWarning = {
  id: string;
  area: TeoyubeManualPublicMonitoringArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualPublicMonitoringReport = {
  valid: boolean;
  status: TeoyubeManualPublicMonitoringStatus;
  decision: TeoyubeManualPublicMonitoringDecision;
  run: TeoyubeManualPublicMonitoringRun;
  blockers: TeoyubeManualPublicMonitoringBlocker[];
  warnings: TeoyubeManualPublicMonitoringWarning[];
  summary: {
    totalChecks: number;
    totalResults: number;
    passedResults: number;
    blockedResults: number;
  };
  manualOnly: true;
  noPublicUrlFetch: true;
  noMonitoringProviderConnected: true;
  noAlertsSent: true;
  noAnalyticsSent: true;
  noExternalPersistence: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
