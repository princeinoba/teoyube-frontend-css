export type TeoyubeLaunchDayMonitoringStatus =
  | "ready"
  | "ready_with_warnings"
  | "needs_review"
  | "blocked"
  | "not_started"
  | "unknown";

export type TeoyubeLaunchDayMonitoringPhase =
  | "pre_launch_manual_check"
  | "activation_observation"
  | "first_hour_review"
  | "surface_health_review"
  | "feedback_intake_review"
  | "issue_escalation_review"
  | "pause_rollback_review"
  | "daily_summary"
  | "unknown";

export type TeoyubeLaunchDayMonitoringDecision =
  | "continue_soft_launch"
  | "continue_with_warnings"
  | "pause_for_review"
  | "rollback_recommended"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeLaunchDayMonitoringCheck = {
  id: string;
  label: string;
  phase: TeoyubeLaunchDayMonitoringPhase;
  required: boolean;
  launchCritical: boolean;
  details: string;
};

export type TeoyubeLaunchDayMonitoringResult = {
  id: string;
  checkId: string;
  phase: TeoyubeLaunchDayMonitoringPhase;
  status: "pass" | "warning" | "fail" | "not_observed" | "unknown";
  notes: string[];
  blocker: boolean;
  warning: boolean;
  recordedManually: true;
  generatedAt: string;
};

export type TeoyubeLaunchDayMonitoringRun = {
  id: string;
  label: string;
  checks: TeoyubeLaunchDayMonitoringCheck[];
  results: TeoyubeLaunchDayMonitoringResult[];
  manualOnly: true;
  inMemoryOnly: true;
  launchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  previewUrlFetched: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  fileWritten: false;
  generatedAt: string;
};

export type TeoyubeLaunchDayMonitoringBlocker = {
  id: string;
  label: string;
  phase: TeoyubeLaunchDayMonitoringPhase;
  severity: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubeLaunchDayMonitoringWarning = {
  id: string;
  label: string;
  phase: TeoyubeLaunchDayMonitoringPhase;
  severity: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
};

export type TeoyubeLaunchDayMonitoringReport = {
  status: TeoyubeLaunchDayMonitoringStatus;
  ready: boolean;
  decision: TeoyubeLaunchDayMonitoringDecision;
  run: TeoyubeLaunchDayMonitoringRun;
  checkCount: number;
  resultCount: number;
  blockerCount: number;
  warningCount: number;
  blockers: TeoyubeLaunchDayMonitoringBlocker[];
  warnings: TeoyubeLaunchDayMonitoringWarning[];
  noLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPreviewUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubeLaunchDaySurfaceHealthStatus = {
  surface: string;
  loadStatus: TeoyubeLaunchDayMonitoringStatus;
  mobileStatus: TeoyubeLaunchDayMonitoringStatus;
  accessibilityStatus: TeoyubeLaunchDayMonitoringStatus;
  scriptureAnchorStatus: TeoyubeLaunchDayMonitoringStatus;
  explanationPathStatus: TeoyubeLaunchDayMonitoringStatus;
  fallbackStatus: TeoyubeLaunchDayMonitoringStatus;
  confidenceLabelStatus: TeoyubeLaunchDayMonitoringStatus;
  consentStatus: TeoyubeLaunchDayMonitoringStatus;
  feedbackStatus: TeoyubeLaunchDayMonitoringStatus;
  debugSafetyStatus: TeoyubeLaunchDayMonitoringStatus;
  privacyStatus: TeoyubeLaunchDayMonitoringStatus;
  notes: string[];
  blocker: boolean;
  warning: boolean;
  recordedManually: true;
};

export type TeoyubeLaunchDayFeedbackIntakeStatus = {
  id: string;
  manualFeedbackOnly: true;
  automatedCollectionDisabled: true;
  databaseWritesDisabled: true;
  analyticsSendingDisabled: true;
  rawSensitiveTextStorageDisabled: true;
  itemCount: number;
};

export type TeoyubeLaunchDayPauseRollbackWatchStatus = {
  id: string;
  pauseRecommended: boolean;
  rollbackRecommended: boolean;
  rollbackPerformed: false;
  providerCommandsExecuted: false;
  manualDecisionOnly: true;
  reasons: string[];
};
