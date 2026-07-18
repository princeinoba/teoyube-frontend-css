export type TeoyubeUiRegressionStatus = "passed" | "warning" | "blocked";

export type TeoyubeUiRegressionSurface =
  | "word_card"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "promise_table"
  | "canon"
  | "daily_word"
  | "prayer"
  | "calling"
  | "unknown";

export type TeoyubeUiRegressionCheck = {
  id: string;
  surface: TeoyubeUiRegressionSurface;
  label: string;
  required: boolean;
};

export type TeoyubeUiRegressionBlocker = {
  id: string;
  surface: TeoyubeUiRegressionSurface;
  message: string;
  requiredAction: string;
};

export type TeoyubeUiRegressionWarning = {
  id: string;
  surface: TeoyubeUiRegressionSurface;
  message: string;
  recommendedAction: string;
};

export type TeoyubeUiRegressionResult = {
  check: TeoyubeUiRegressionCheck;
  status: TeoyubeUiRegressionStatus;
  details: string;
  blockers: TeoyubeUiRegressionBlocker[];
  warnings: TeoyubeUiRegressionWarning[];
};

export type TeoyubeUiRegressionDecision = "ready" | "ready_with_warnings" | "blocked";

export type TeoyubeUiRegressionReport = {
  decision: TeoyubeUiRegressionDecision;
  valid: boolean;
  checks: TeoyubeUiRegressionCheck[];
  results: TeoyubeUiRegressionResult[];
  blockers: TeoyubeUiRegressionBlocker[];
  warnings: TeoyubeUiRegressionWarning[];
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};
