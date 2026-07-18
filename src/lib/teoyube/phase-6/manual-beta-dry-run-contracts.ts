export type TeoyubeManualBetaDryRunStatus =
  | "not_started"
  | "in_progress"
  | "passed"
  | "passed_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubeManualBetaDryRunArea =
  | "execution_plan"
  | "participant_workflow"
  | "communication_boundary"
  | "feedback_boundary"
  | "issue_intake"
  | "operations_checklist"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "privacy_consent"
  | "service_disabled_state"
  | "reviewed_content_gate"
  | "controlled_admin_prototype"
  | "mobile"
  | "accessibility"
  | "pause_rollback"
  | "unknown";

export type TeoyubeManualBetaDryRunDecision =
  | "dry_run_passed"
  | "dry_run_passed_with_warnings"
  | "dry_run_blocked"
  | "needs_issue_triage"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeManualBetaDryRunStep = {
  id: string;
  area: TeoyubeManualBetaDryRunArea;
  label: string;
  order: number;
  manualOnly: true;
  details: string;
};

export type TeoyubeManualBetaDryRunScenario = {
  id: string;
  area: TeoyubeManualBetaDryRunArea;
  label: string;
  steps: TeoyubeManualBetaDryRunStep[];
  noUserContact: true;
  noUrlFetch: true;
  simulatedOnly: true;
};

export type TeoyubeManualBetaDryRunResult = {
  id: string;
  scenarioId: string;
  stepId?: string;
  area: TeoyubeManualBetaDryRunArea;
  status: "passed" | "warning" | "blocked" | "not_run";
  notes: string;
  simulatedOnly: true;
  recordedAt: string;
};

export type TeoyubeManualBetaDryRunEvidence = {
  id: string;
  area: TeoyubeManualBetaDryRunArea;
  label: string;
  status: "confirmed" | "warning" | "blocked" | "not_observed";
  details: string;
};

export type TeoyubeManualBetaDryRun = {
  id: string;
  status: TeoyubeManualBetaDryRunStatus;
  scenarios: TeoyubeManualBetaDryRunScenario[];
  results: TeoyubeManualBetaDryRunResult[];
  evidence: TeoyubeManualBetaDryRunEvidence[];
  manualOnly: true;
  simulatedOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeManualBetaDryRunBlocker = {
  id: string;
  area: TeoyubeManualBetaDryRunArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeManualBetaDryRunWarning = {
  id: string;
  area: TeoyubeManualBetaDryRunArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualBetaDryRunReport = {
  valid: boolean;
  status: TeoyubeManualBetaDryRunStatus;
  decision: TeoyubeManualBetaDryRunDecision;
  run: TeoyubeManualBetaDryRun;
  summary: {
    scenarioCount: number;
    resultCount: number;
    passedCount: number;
    warningCount: number;
    blockedCount: number;
  };
  blockers: TeoyubeManualBetaDryRunBlocker[];
  warnings: TeoyubeManualBetaDryRunWarning[];
  manualOnly: true;
  simulatedOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
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

