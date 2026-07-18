export type TeoyubeControlledBetaOperationsFinalLockStatus =
  | "locked"
  | "locked_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeControlledBetaOperationsLockedArea =
  | "manual_operations_only"
  | "manual_feedback_review"
  | "manual_support_workflow"
  | "manual_issue_triage"
  | "manual_monitoring"
  | "product_stabilization"
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

export type TeoyubeControlledBetaOperationsLockedItem = {
  id: string;
  area: TeoyubeControlledBetaOperationsLockedArea;
  label: string;
  locked: boolean;
  details: string;
  sourceFiles: string[];
};

export type TeoyubeControlledBetaOperationsFinalLockRule = {
  id: string;
  area: TeoyubeControlledBetaOperationsLockedArea;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeControlledBetaOperationsFinalLockBlocker = {
  id: string;
  area: TeoyubeControlledBetaOperationsLockedArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledBetaOperationsFinalLockWarning = {
  id: string;
  area: TeoyubeControlledBetaOperationsLockedArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledBetaOperationsFinalLockDecision =
  | "locked_ready_for_phase_8_planning"
  | "locked_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeControlledBetaOperationsFinalLockReport = {
  valid: boolean;
  status: TeoyubeControlledBetaOperationsFinalLockStatus;
  decision: TeoyubeControlledBetaOperationsFinalLockDecision;
  lockedItems: TeoyubeControlledBetaOperationsLockedItem[];
  rules: TeoyubeControlledBetaOperationsFinalLockRule[];
  blockers: TeoyubeControlledBetaOperationsFinalLockBlocker[];
  warnings: TeoyubeControlledBetaOperationsFinalLockWarning[];
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
