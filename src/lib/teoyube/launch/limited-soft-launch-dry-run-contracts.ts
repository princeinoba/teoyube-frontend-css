export type TeoyubeLimitedSoftLaunchDryRunStatus =
  | "ready"
  | "passed"
  | "ready_with_warnings"
  | "needs_review"
  | "blocked"
  | "not_started"
  | "unknown";

export type TeoyubeLimitedSoftLaunchDryRunPhase =
  | "preflight_rehearsal"
  | "launch_day_rehearsal"
  | "surface_review_rehearsal"
  | "feedback_intake_rehearsal"
  | "issue_triage_rehearsal"
  | "rollback_rehearsal"
  | "daily_review_rehearsal"
  | "owner_review"
  | "completion_review"
  | "unknown";

export type TeoyubeLimitedSoftLaunchDryRunDecision =
  | "ready_for_final_soft_launch_readiness_package"
  | "ready_after_owner_review"
  | "blocked"
  | "needs_runbook_fix"
  | "needs_safety_review"
  | "needs_qa_review"
  | "unknown";

export type TeoyubeLimitedSoftLaunchOwnerReviewStatus =
  | "accepted"
  | "blocked"
  | "needs_review"
  | "not_started"
  | "unknown";

export type TeoyubeLimitedSoftLaunchDryRunResultStatus =
  | "pass"
  | "warning"
  | "fail"
  | "not_run";

export type TeoyubeLimitedSoftLaunchDryRunScenario = {
  id: string;
  label: string;
  phase: TeoyubeLimitedSoftLaunchDryRunPhase;
  description: string;
  expectedEvidence: string;
  critical: boolean;
  safetyCritical: boolean;
  manualOnly: true;
};

export type TeoyubeLimitedSoftLaunchDryRunStep = {
  id: string;
  label: string;
  phase: TeoyubeLimitedSoftLaunchDryRunPhase;
  required: boolean;
  complete: boolean;
  manualOnly: true;
  details: string;
};

export type TeoyubeLimitedSoftLaunchDryRunResult = {
  id: string;
  scenarioId?: string;
  stepId?: string;
  phase: TeoyubeLimitedSoftLaunchDryRunPhase;
  status: TeoyubeLimitedSoftLaunchDryRunResultStatus;
  summary: string;
  sanitized: boolean;
  launchCritical: boolean;
  checkedAt: string;
};

export type TeoyubeLimitedSoftLaunchDryRunBlocker = {
  id: string;
  label: string;
  phase: TeoyubeLimitedSoftLaunchDryRunPhase;
  reason: string;
  requiredAction: string;
  severity: "high" | "critical";
};

export type TeoyubeLimitedSoftLaunchDryRunWarning = {
  id: string;
  label: string;
  phase: TeoyubeLimitedSoftLaunchDryRunPhase;
  message: string;
  recommendedAction: string;
};

export type TeoyubeLimitedSoftLaunchDryRun = {
  id: string;
  label: string;
  status: TeoyubeLimitedSoftLaunchDryRunStatus;
  scenarios: TeoyubeLimitedSoftLaunchDryRunScenario[];
  stepResults: TeoyubeLimitedSoftLaunchDryRunResult[];
  scenarioResults: TeoyubeLimitedSoftLaunchDryRunResult[];
  inMemoryOnly: true;
  sampleOnly: true;
  actualLaunchPerformed: false;
  usersContacted: false;
  realFeedbackCollected: false;
  previewUrlFetched: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  browserStorageWritten: false;
  fileWritten: false;
  generatedAt: string;
  updatedAt: string;
};

export type TeoyubeLimitedSoftLaunchDryRunReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubeLimitedSoftLaunchDryRunDecision;
  run: TeoyubeLimitedSoftLaunchDryRun;
  scenarioCount: number;
  recordedScenarioCount: number;
  stepResultCount: number;
  criticalScenarioCount: number;
  passedCriticalScenarioCount: number;
  blockerCount: number;
  warningCount: number;
  blockers: TeoyubeLimitedSoftLaunchDryRunBlocker[];
  warnings: TeoyubeLimitedSoftLaunchDryRunWarning[];
  noActualLaunchPerformed: true;
  noUsersContacted: true;
  noRealFeedbackCollected: true;
  noPreviewUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubeLimitedSoftLaunchOwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  details: string;
};

export type TeoyubeLimitedSoftLaunchOwnerReviewRecord = {
  id: string;
  label: string;
  status: TeoyubeLimitedSoftLaunchOwnerReviewStatus;
  checklist: TeoyubeLimitedSoftLaunchOwnerReviewChecklistItem[];
  decisionAccepted: boolean;
  decisionBlocked: boolean;
  ownerNotes: string[];
  manualApprovalOnly: true;
  signatureRequired: false;
  messagesSent: false;
  usersContacted: false;
  generatedAt: string;
};

export type TeoyubeLimitedSoftLaunchOwnerReviewReport = {
  valid: boolean;
  ready: boolean;
  status: TeoyubeLimitedSoftLaunchOwnerReviewStatus;
  record: TeoyubeLimitedSoftLaunchOwnerReviewRecord;
  checklistCount: number;
  completedChecklistCount: number;
  blockers: string[];
  warnings: string[];
  noMessagesSent: true;
  noUsersContacted: true;
  generatedAt: string;
};
