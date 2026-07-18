export type TeoyubeBetaRegressionQaStatus =
  | "not_started"
  | "in_progress"
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeBetaRegressionQaArea =
  | "real_data"
  | "user_journey"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "controlled_admin"
  | "disabled_services"
  | "mobile"
  | "accessibility"
  | "promise_table"
  | "tig_graph_explorer"
  | "tig_response_panel"
  | "privacy_consent"
  | "unknown";

export type TeoyubeBetaRegressionQaDecision =
  | "regression_passed"
  | "regression_passed_with_warnings"
  | "regression_blocked"
  | "manual_regression_required"
  | "unknown";

export type TeoyubeBetaRegressionQaCheck = {
  id: string;
  area: TeoyubeBetaRegressionQaArea;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeBetaRegressionQaResult = {
  checkId: string;
  area: TeoyubeBetaRegressionQaArea;
  status: "not_run" | "passed" | "warning" | "failed" | "blocked";
  notes: string;
  blocker: boolean;
  warning: boolean;
  recordedAt: string;
};

export type TeoyubeBetaRegressionQaRun = {
  id: string;
  status: TeoyubeBetaRegressionQaStatus;
  checks: TeoyubeBetaRegressionQaCheck[];
  results: TeoyubeBetaRegressionQaResult[];
  manualOnly: true;
  inMemoryOnly: true;
  noPublicUrlFetching: true;
  noUsersContacted: true;
  noAnalyticsSent: true;
  noRegressionRunsPersisted: true;
  noFilesWritten: true;
  noExternalServicesConnected: true;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeBetaRegressionQaBlocker = {
  id: string;
  area: TeoyubeBetaRegressionQaArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeBetaRegressionQaWarning = {
  id: string;
  area: TeoyubeBetaRegressionQaArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeBetaRegressionQaReport = {
  valid: boolean;
  decision: TeoyubeBetaRegressionQaDecision;
  run: TeoyubeBetaRegressionQaRun;
  completedCheckCount: number;
  totalCheckCount: number;
  blockers: TeoyubeBetaRegressionQaBlocker[];
  warnings: TeoyubeBetaRegressionQaWarning[];
  manualOnly: true;
  inMemoryOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlFetching: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};
