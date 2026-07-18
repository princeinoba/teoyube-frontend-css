export type TeoyubeDryRunRegressionQaStatus =
  | "not_started"
  | "in_progress"
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeDryRunRegressionQaArea =
  | "participant_workflow"
  | "communication_boundary"
  | "feedback_boundary"
  | "issue_intake"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "reviewed_content_gate"
  | "controlled_admin"
  | "mobile"
  | "accessibility"
  | "promise_table"
  | "tig_graph_explorer"
  | "tig_response_panel"
  | "operations_readiness"
  | "unknown";

export type TeoyubeDryRunRegressionQaDecision =
  | "regression_passed"
  | "regression_passed_with_warnings"
  | "regression_blocked"
  | "manual_regression_required"
  | "unknown";

export type TeoyubeDryRunRegressionQaCheck = {
  id: string;
  area: TeoyubeDryRunRegressionQaArea;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeDryRunRegressionQaResult = {
  checkId: string;
  area: TeoyubeDryRunRegressionQaArea;
  status: "not_run" | "passed" | "warning" | "failed" | "blocked";
  notes: string;
  blocker: boolean;
  warning: boolean;
  recordedAt: string;
};

export type TeoyubeDryRunRegressionQaRun = {
  id: string;
  status: TeoyubeDryRunRegressionQaStatus;
  checks: TeoyubeDryRunRegressionQaCheck[];
  results: TeoyubeDryRunRegressionQaResult[];
  manualOnly: true;
  inMemoryOnly: true;
  noPublicUrlFetching: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noAnalyticsSent: true;
  noRegressionRunsPersisted: true;
  noFilesWritten: true;
  noExternalServicesConnected: true;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeDryRunRegressionQaBlocker = {
  id: string;
  area: TeoyubeDryRunRegressionQaArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeDryRunRegressionQaWarning = {
  id: string;
  area: TeoyubeDryRunRegressionQaArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeDryRunRegressionQaReport = {
  valid: boolean;
  decision: TeoyubeDryRunRegressionQaDecision;
  run: TeoyubeDryRunRegressionQaRun;
  completedCheckCount: number;
  totalCheckCount: number;
  blockers: TeoyubeDryRunRegressionQaBlocker[];
  warnings: TeoyubeDryRunRegressionQaWarning[];
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
