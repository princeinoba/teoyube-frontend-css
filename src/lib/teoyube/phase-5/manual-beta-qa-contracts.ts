export type TeoyubeManualBetaQaStatus =
  | "planned"
  | "manual_execution_required"
  | "in_progress"
  | "complete"
  | "blocked"
  | "unknown";

export type TeoyubeManualBetaQaArea =
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
  | "unknown";

export type TeoyubeManualBetaQaDecision =
  | "manual_beta_qa_plan_ready"
  | "manual_execution_required"
  | "blocked"
  | "unknown";

export type TeoyubeManualBetaQaScenario = {
  id: string;
  area: TeoyubeManualBetaQaArea;
  title: string;
  critical: boolean;
  manualOnly: true;
  expectedResult: string;
  protects: string[];
};

export type TeoyubeManualBetaQaChecklistItem = {
  id: string;
  area: TeoyubeManualBetaQaArea;
  label: string;
  required: boolean;
  complete: boolean;
  details: string;
};

export type TeoyubeManualBetaQaRun = {
  id: string;
  status: TeoyubeManualBetaQaStatus;
  scenarios: TeoyubeManualBetaQaScenario[];
  checklist: TeoyubeManualBetaQaChecklistItem[];
  exitCriteria: string[];
  pauseCriteria: string[];
  rollbackCriteria: string[];
  manualOnly: true;
  noPublicUrlAutomation: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubeManualBetaQaBlocker = {
  id: string;
  area: TeoyubeManualBetaQaArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeManualBetaQaWarning = {
  id: string;
  area: TeoyubeManualBetaQaArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualBetaQaResult = {
  scenarioId: string;
  area: TeoyubeManualBetaQaArea;
  status: "not_run" | "passed" | "failed" | "blocked";
  notes?: string;
};

export type TeoyubeManualBetaQaReport = {
  valid: boolean;
  decision: TeoyubeManualBetaQaDecision;
  run: TeoyubeManualBetaQaRun;
  criticalScenarios: TeoyubeManualBetaQaScenario[];
  blockers: TeoyubeManualBetaQaBlocker[];
  warnings: TeoyubeManualBetaQaWarning[];
  scenarioCount: number;
  checklistCount: number;
  manualOnly: true;
  noPublicUrlAutomation: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
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
