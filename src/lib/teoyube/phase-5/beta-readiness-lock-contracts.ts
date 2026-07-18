export type TeoyubeBetaReadinessLockStatus =
  | "locked"
  | "locked_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

export type TeoyubeBetaReadinessLockedArea =
  | "beta_scope"
  | "manual_qa_plan"
  | "qa_execution_evidence"
  | "readiness_score"
  | "fix_queue"
  | "remediation"
  | "regression_qa"
  | "go_no_go"
  | "launch_boundary"
  | "owner_approval"
  | "operational_handoff"
  | "service_disabled_state"
  | "privacy_security"
  | "reviewed_content_gate"
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "mobile_accessibility"
  | "known_limitations"
  | "unknown";

export type TeoyubeBetaReadinessLockDecision =
  | "locked_ready_for_phase_6_planning"
  | "locked_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeBetaReadinessLockRule = {
  id: string;
  area: TeoyubeBetaReadinessLockedArea;
  label: string;
  required: boolean;
  locked: boolean;
  details: string;
};

export type TeoyubeBetaReadinessLockedItem = {
  id: string;
  area: TeoyubeBetaReadinessLockedArea;
  label: string;
  locked: boolean;
  rules: TeoyubeBetaReadinessLockRule[];
  sourceFiles: string[];
};

export type TeoyubeBetaReadinessLockBlocker = {
  id: string;
  area: TeoyubeBetaReadinessLockedArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeBetaReadinessLockWarning = {
  id: string;
  area: TeoyubeBetaReadinessLockedArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeBetaReadinessLockReport = {
  valid: boolean;
  status: TeoyubeBetaReadinessLockStatus;
  decision: TeoyubeBetaReadinessLockDecision;
  lockedItems: TeoyubeBetaReadinessLockedItem[];
  blockers: TeoyubeBetaReadinessLockBlocker[];
  warnings: TeoyubeBetaReadinessLockWarning[];
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
