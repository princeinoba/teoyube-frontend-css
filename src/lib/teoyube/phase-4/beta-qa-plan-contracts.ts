export type TeoyubeBetaQaStatus =
  | "planned"
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "manual_execution_required"
  | "unknown";

export type TeoyubeBetaQaArea =
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
  | "admin_workflow_prototype"
  | "mobile"
  | "accessibility"
  | "fallback"
  | "scripture_anchor"
  | "explanation_trace"
  | "privacy_consent"
  | "service_disabled_state"
  | "unknown";

export type TeoyubeBetaQaScenario = {
  id: string;
  area: TeoyubeBetaQaArea;
  title: string;
  critical: boolean;
  manual: true;
  expectedResult: string;
  protects: string[];
};

export type TeoyubeBetaQaChecklistItem = {
  id: string;
  area: TeoyubeBetaQaArea;
  label: string;
  required: boolean;
  complete: boolean;
  details: string;
};

export type TeoyubeBetaQaRun = {
  id: string;
  status: TeoyubeBetaQaStatus;
  scenarios: TeoyubeBetaQaScenario[];
  checklist: TeoyubeBetaQaChecklistItem[];
  manualOnly: true;
  inMemoryOnly: true;
  noUsersContacted: true;
  noScheduleCreated: true;
  createdAt: string;
};

export type TeoyubeBetaQaResult = {
  scenarioId: string;
  area: TeoyubeBetaQaArea;
  status: "pass" | "warning" | "fail" | "not_run";
  notes: string;
  blocker: boolean;
};

export type TeoyubeBetaQaDecision =
  | "beta_qa_plan_ready"
  | "beta_qa_plan_ready_with_warnings"
  | "manual_execution_required"
  | "blocked";

export type TeoyubeBetaQaBlocker = {
  id: string;
  area: TeoyubeBetaQaArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeBetaQaWarning = {
  id: string;
  area: TeoyubeBetaQaArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeBetaQaReport = {
  valid: boolean;
  decision: TeoyubeBetaQaDecision;
  run: TeoyubeBetaQaRun;
  criticalScenarios: TeoyubeBetaQaScenario[];
  blockers: TeoyubeBetaQaBlocker[];
  warnings: TeoyubeBetaQaWarning[];
  scenarioCount: number;
  checklistCount: number;
  manualOnly: true;
  noUsersContacted: true;
  noScheduleCreated: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
