export type TeoyubeOperationsReadinessStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeOperationsReadinessArea =
  | "participant_workflow"
  | "communication_boundaries"
  | "feedback_boundaries"
  | "issue_intake"
  | "operations_checklist"
  | "pause_rollback"
  | "service_disabled_state"
  | "privacy_consent"
  | "scripture_explanation_fallback"
  | "mobile_accessibility"
  | "known_limitations"
  | "owner_review"
  | "unknown";

export type TeoyubeOperationsReadinessDecision =
  | "operations_ready"
  | "operations_ready_with_warnings"
  | "owner_review_required"
  | "blocked"
  | "unknown";

export type TeoyubeOperationsReadinessCheck = {
  id: string;
  area: TeoyubeOperationsReadinessArea;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeOperationsReadinessResult = {
  id: string;
  area: TeoyubeOperationsReadinessArea;
  checkId: string;
  passed: boolean;
  warning: boolean;
  notes: string;
};

export type TeoyubeOperationsReadinessBlocker = {
  id: string;
  area: TeoyubeOperationsReadinessArea;
  message: string;
  requiredAction: string;
};

export type TeoyubeOperationsReadinessWarning = {
  id: string;
  area: TeoyubeOperationsReadinessArea;
  message: string;
  recommendedAction: string;
};

export type TeoyubeOperationsReadinessReport = {
  valid: boolean;
  status: TeoyubeOperationsReadinessStatus;
  decision: TeoyubeOperationsReadinessDecision;
  checks: TeoyubeOperationsReadinessCheck[];
  results: TeoyubeOperationsReadinessResult[];
  blockers: TeoyubeOperationsReadinessBlocker[];
  warnings: TeoyubeOperationsReadinessWarning[];
  manualOnly: true;
  inMemoryOnly: true;
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
  generatedAt: string;
};
