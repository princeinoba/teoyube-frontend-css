export type TeoyubeControlledBetaOperationsLockStatus =
  | "locked"
  | "locked_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeControlledBetaLockedArea =
  | "manual_execution_only"
  | "participant_workflow"
  | "communication_boundaries"
  | "feedback_boundaries"
  | "issue_intake"
  | "pause_rollback"
  | "service_disabled_state"
  | "privacy_consent"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "reviewed_content_gate"
  | "controlled_admin"
  | "mobile_accessibility"
  | "known_limitations"
  | "owner_review"
  | "unknown";

export type TeoyubeControlledBetaLockedItem = {
  id: string;
  area: TeoyubeControlledBetaLockedArea;
  label: string;
  locked: boolean;
  details: string;
  sourceFiles: string[];
};

export type TeoyubeControlledBetaOperationsLockRule = {
  id: string;
  area: TeoyubeControlledBetaLockedArea;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeControlledBetaOperationsLockBlocker = {
  id: string;
  area: TeoyubeControlledBetaLockedArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledBetaOperationsLockWarning = {
  id: string;
  area: TeoyubeControlledBetaLockedArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledBetaOperationsLockDecision =
  | "locked_ready_for_phase_7_planning"
  | "locked_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeControlledBetaOperationsLockReport = {
  valid: boolean;
  status: TeoyubeControlledBetaOperationsLockStatus;
  decision: TeoyubeControlledBetaOperationsLockDecision;
  lockedItems: TeoyubeControlledBetaLockedItem[];
  rules: TeoyubeControlledBetaOperationsLockRule[];
  blockers: TeoyubeControlledBetaOperationsLockBlocker[];
  warnings: TeoyubeControlledBetaOperationsLockWarning[];
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
  noUserAccountsAdded: true;
  noReviewedContentAutoPublished: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
