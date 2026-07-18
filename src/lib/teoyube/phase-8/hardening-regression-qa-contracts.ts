export type TeoyubeHardeningRegressionQaStatus =
  | "passed"
  | "warning"
  | "blocked"
  | "not_run"
  | "unknown";

export type TeoyubeHardeningRegressionQaArea =
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
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "mobile"
  | "accessibility"
  | "performance"
  | "known_limitations"
  | "unknown";

export type TeoyubeHardeningRegressionQaDecision =
  | "regression_passed"
  | "regression_passed_with_warnings"
  | "blocked"
  | "needs_manual_review"
  | "unknown";

export type TeoyubeHardeningRegressionQaBlocker = {
  id: string;
  area: TeoyubeHardeningRegressionQaArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeHardeningRegressionQaWarning = {
  id: string;
  area: TeoyubeHardeningRegressionQaArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeHardeningRegressionQaCheck = {
  id: string;
  area: TeoyubeHardeningRegressionQaArea;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeHardeningRegressionQaResult = {
  id: string;
  checkId: string;
  area: TeoyubeHardeningRegressionQaArea;
  status: TeoyubeHardeningRegressionQaStatus;
  passed: boolean;
  details: string;
};

export type TeoyubeHardeningRegressionQaRun = {
  id: string;
  checks: TeoyubeHardeningRegressionQaCheck[];
  results: TeoyubeHardeningRegressionQaResult[];
  noExternalSend: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noUserContact: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeHardeningRegressionQaReport = {
  valid: boolean;
  decision: TeoyubeHardeningRegressionQaDecision;
  run: TeoyubeHardeningRegressionQaRun;
  blockers: TeoyubeHardeningRegressionQaBlocker[];
  warnings: TeoyubeHardeningRegressionQaWarning[];
  summary: {
    total: number;
    passed: number;
    warnings: number;
    blocked: number;
  };
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
