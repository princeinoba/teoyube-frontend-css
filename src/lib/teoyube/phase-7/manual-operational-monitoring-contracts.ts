export type TeoyubeManualOperationalMonitoringStatus =
  | "not_started"
  | "ready"
  | "ready_with_warnings"
  | "blocked";

export type TeoyubeManualOperationalMonitoringArea =
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
  | "manual_feedback_review"
  | "manual_issue_triage"
  | "mobile"
  | "accessibility"
  | "unknown";

export type TeoyubeManualOperationalMonitoringCheck = {
  id: string;
  area: TeoyubeManualOperationalMonitoringArea;
  label: string;
  required: boolean;
  manualOnly: true;
  details: string;
};

export type TeoyubeManualOperationalMonitoringResult = {
  checkId: string;
  area: TeoyubeManualOperationalMonitoringArea;
  status: "passed" | "warning" | "blocked" | "not_checked";
  notes: string;
  blocker: boolean;
  warning: boolean;
  recordedAt: string;
};

export type TeoyubeManualOperationalMonitoringRun = {
  id: string;
  checks: TeoyubeManualOperationalMonitoringCheck[];
  results: TeoyubeManualOperationalMonitoringResult[];
  manualOnly: true;
  inMemoryOnly: true;
  publicUrlsFetchedAutomatically: false;
  monitoringProviderConnected: false;
  alertsSent: false;
  analyticsSent: false;
  externalWrite: false;
  generatedAt: string;
};

export type TeoyubeManualOperationalMonitoringDecision =
  | "monitoring_ready"
  | "monitoring_ready_with_warnings"
  | "needs_manual_checks"
  | "blocked";

export type TeoyubeManualOperationalMonitoringBlocker = {
  id: string;
  area: TeoyubeManualOperationalMonitoringArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeManualOperationalMonitoringWarning = {
  id: string;
  area: TeoyubeManualOperationalMonitoringArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualOperationalMonitoringReport = {
  valid: boolean;
  status: TeoyubeManualOperationalMonitoringStatus;
  decision: TeoyubeManualOperationalMonitoringDecision;
  run: TeoyubeManualOperationalMonitoringRun;
  summary: {
    totalCheckCount: number;
    completedCheckCount: number;
    blockerCount: number;
    warningCount: number;
  };
  blockers: TeoyubeManualOperationalMonitoringBlocker[];
  warnings: TeoyubeManualOperationalMonitoringWarning[];
  manualOnly: true;
  inMemoryOnly: true;
  noPublicUrlsFetchedAutomatically: true;
  noMonitoringProviderConnected: true;
  noAlertsSent: true;
  noAnalyticsSent: true;
  noExternalWrite: true;
  generatedAt: string;
};
