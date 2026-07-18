export type TeoyubeFinalRegressionQaStatus =
  | "pending"
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeFinalRegressionQaArea =
  | "public_copy"
  | "privacy_consent"
  | "sensitive_data_warning"
  | "known_limitations"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "service_disabled_state"
  | "support_readiness"
  | "feedback_readiness"
  | "issue_triage"
  | "manual_monitoring"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "mobile"
  | "accessibility"
  | "performance_manual"
  | "unknown";

export type TeoyubeFinalRegressionQaDecision =
  | "final_regression_passed"
  | "final_regression_passed_with_warnings"
  | "final_regression_blocked"
  | "unknown";

export type TeoyubeFinalRegressionQaCheck = {
  id: string;
  area: TeoyubeFinalRegressionQaArea;
  label: string;
  required: boolean;
  passed: boolean;
  details: string;
};

export type TeoyubeFinalRegressionQaResult = {
  id: string;
  area: TeoyubeFinalRegressionQaArea;
  status: TeoyubeFinalRegressionQaStatus;
  passed: boolean;
  blocker: boolean;
  notes: string[];
};

export type TeoyubeFinalRegressionQaRun = {
  id: string;
  checks: TeoyubeFinalRegressionQaCheck[];
  results: TeoyubeFinalRegressionQaResult[];
  manualOnly: true;
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noAnalyticsSent: true;
  noQaRunPersisted: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubeFinalRegressionQaBlocker = {
  id: string;
  area: TeoyubeFinalRegressionQaArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeFinalRegressionQaWarning = {
  id: string;
  area: TeoyubeFinalRegressionQaArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeFinalRegressionQaReport = {
  valid: boolean;
  decision: TeoyubeFinalRegressionQaDecision;
  run: TeoyubeFinalRegressionQaRun;
  blockers: TeoyubeFinalRegressionQaBlocker[];
  warnings: TeoyubeFinalRegressionQaWarning[];
  summary: {
    totalChecks: number;
    totalResults: number;
    passedResults: number;
    blockedResults: number;
  };
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
