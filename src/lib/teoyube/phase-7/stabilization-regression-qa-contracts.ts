export type TeoyubeStabilizationRegressionQaStatus =
  | "not_started"
  | "in_progress"
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeStabilizationRegressionQaArea =
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "reviewed_content_gate"
  | "controlled_admin"
  | "manual_feedback_review"
  | "support_workflow"
  | "issue_triage"
  | "product_stabilization_queue"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "mobile"
  | "accessibility"
  | "performance_manual"
  | "known_limitations"
  | "unknown";

export type TeoyubeStabilizationRegressionQaDecision =
  | "regression_passed"
  | "regression_passed_with_warnings"
  | "regression_blocked"
  | "manual_regression_required"
  | "unknown";

export type TeoyubeStabilizationRegressionQaCheck = {
  id: string;
  area: TeoyubeStabilizationRegressionQaArea;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeStabilizationRegressionQaResult = {
  checkId: string;
  area: TeoyubeStabilizationRegressionQaArea;
  status: "not_run" | "passed" | "warning" | "failed" | "blocked";
  notes: string;
  blocker: boolean;
  warning: boolean;
  recordedAt: string;
};

export type TeoyubeStabilizationRegressionQaRun = {
  id: string;
  status: TeoyubeStabilizationRegressionQaStatus;
  checks: TeoyubeStabilizationRegressionQaCheck[];
  results: TeoyubeStabilizationRegressionQaResult[];
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

export type TeoyubeStabilizationRegressionQaBlocker = {
  id: string;
  area: TeoyubeStabilizationRegressionQaArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeStabilizationRegressionQaWarning = {
  id: string;
  area: TeoyubeStabilizationRegressionQaArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeStabilizationRegressionQaReport = {
  valid: boolean;
  decision: TeoyubeStabilizationRegressionQaDecision;
  run: TeoyubeStabilizationRegressionQaRun;
  completedCheckCount: number;
  totalCheckCount: number;
  blockers: TeoyubeStabilizationRegressionQaBlocker[];
  warnings: TeoyubeStabilizationRegressionQaWarning[];
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
