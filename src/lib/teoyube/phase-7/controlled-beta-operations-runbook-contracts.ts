export type TeoyubeControlledBetaOperationsRunbookStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeControlledBetaOperationsRunbookSection =
  | "pre_session_manual_check"
  | "participant_instruction_review"
  | "privacy_consent_reminder"
  | "known_limitations_review"
  | "manual_feedback_review"
  | "manual_issue_triage"
  | "support_response"
  | "pause_rollback_review"
  | "service_disabled_check"
  | "scripture_explanation_fallback_check"
  | "mobile_accessibility_check"
  | "post_session_review"
  | "owner_review"
  | "unknown";

export type TeoyubeControlledBetaOperationsRunbookChecklistItem = {
  id: string;
  section: TeoyubeControlledBetaOperationsRunbookSection;
  label: string;
  required: boolean;
  complete: boolean;
  manualOnly: true;
  details: string;
};

export type TeoyubeControlledBetaOperationsRunbookBoundary = {
  id: string;
  section: TeoyubeControlledBetaOperationsRunbookSection;
  label: string;
  protected: boolean;
  details: string;
};

export type TeoyubeControlledBetaOperationsRunbook = {
  id: string;
  label: string;
  sections: TeoyubeControlledBetaOperationsRunbookSection[];
  checklist: TeoyubeControlledBetaOperationsRunbookChecklistItem[];
  boundaries: TeoyubeControlledBetaOperationsRunbookBoundary[];
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

export type TeoyubeControlledBetaOperationsRunbookDecision =
  | "runbook_ready"
  | "runbook_ready_with_warnings"
  | "needs_owner_review"
  | "blocked"
  | "unknown";

export type TeoyubeControlledBetaOperationsRunbookBlocker = {
  id: string;
  section: TeoyubeControlledBetaOperationsRunbookSection;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledBetaOperationsRunbookWarning = {
  id: string;
  section: TeoyubeControlledBetaOperationsRunbookSection;
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledBetaOperationsRunbookReport = {
  valid: boolean;
  status: TeoyubeControlledBetaOperationsRunbookStatus;
  decision: TeoyubeControlledBetaOperationsRunbookDecision;
  runbook: TeoyubeControlledBetaOperationsRunbook;
  blockers: TeoyubeControlledBetaOperationsRunbookBlocker[];
  warnings: TeoyubeControlledBetaOperationsRunbookWarning[];
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
