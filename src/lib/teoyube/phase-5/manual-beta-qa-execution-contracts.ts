export type TeoyubeManualBetaQaExecutionStatus =
  | "not_started"
  | "in_progress"
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeManualBetaQaExecutionArea =
  | "real_data_loading"
  | "user_journey"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "reviewed_content_gate"
  | "controlled_admin_prototype"
  | "fallback"
  | "scripture_anchor"
  | "explanation_trace"
  | "confidence_label"
  | "mobile"
  | "accessibility"
  | "privacy_consent"
  | "service_disabled_state"
  | "performance_manual"
  | "unknown";

export type TeoyubeManualBetaQaExecutionSurface =
  | "home"
  | "canon"
  | "daily_word"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "reviewed_content_gate"
  | "controlled_admin_prototype"
  | "unknown";

export type TeoyubeManualBetaQaExecutionDecision =
  | "qa_passed"
  | "qa_passed_with_warnings"
  | "qa_blocked"
  | "needs_fix_queue"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeManualBetaQaExecutionEvidence = {
  id: string;
  label: string;
  notes: string;
  capturedManually: true;
  containsSensitiveText: false;
};

export type TeoyubeManualBetaQaExecutionScenario = {
  id: string;
  area: TeoyubeManualBetaQaExecutionArea;
  surface: TeoyubeManualBetaQaExecutionSurface;
  title: string;
  critical: boolean;
  expectedResult: string;
};

export type TeoyubeManualBetaQaExecutionResult = {
  scenarioId: string;
  area: TeoyubeManualBetaQaExecutionArea;
  surface: TeoyubeManualBetaQaExecutionSurface;
  status: "not_run" | "passed" | "warning" | "failed" | "blocked";
  notes: string;
  blocker: boolean;
  warning: boolean;
  evidence: TeoyubeManualBetaQaExecutionEvidence[];
  recordedAt: string;
};

export type TeoyubeManualBetaQaExecutionRun = {
  id: string;
  status: TeoyubeManualBetaQaExecutionStatus;
  scenarios: TeoyubeManualBetaQaExecutionScenario[];
  results: TeoyubeManualBetaQaExecutionResult[];
  manualOnly: true;
  inMemoryOnly: true;
  noPublicUrlFetching: true;
  noUsersContacted: true;
  noAnalyticsSent: true;
  noQaRunsPersisted: true;
  noFilesWritten: true;
  noExternalServicesConnected: true;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeManualBetaQaExecutionBlocker = {
  id: string;
  area: TeoyubeManualBetaQaExecutionArea;
  surface: TeoyubeManualBetaQaExecutionSurface;
  message: string;
  requiredAction: string;
};

export type TeoyubeManualBetaQaExecutionWarning = {
  id: string;
  area: TeoyubeManualBetaQaExecutionArea;
  surface: TeoyubeManualBetaQaExecutionSurface;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualBetaQaExecutionReport = {
  valid: boolean;
  decision: TeoyubeManualBetaQaExecutionDecision;
  run: TeoyubeManualBetaQaExecutionRun;
  completedScenarioCount: number;
  totalScenarioCount: number;
  blockers: TeoyubeManualBetaQaExecutionBlocker[];
  warnings: TeoyubeManualBetaQaExecutionWarning[];
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
