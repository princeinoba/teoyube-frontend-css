export type TeoyubeControlledBetaExecutionStatus =
  | "planning_only"
  | "manual_ready"
  | "ready_with_warnings"
  | "owner_review_required"
  | "blocked"
  | "unknown";

export type TeoyubeControlledBetaExecutionSurface =
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
  | "controlled_admin_prototype"
  | "fallback_states"
  | "privacy_consent"
  | "unknown";

export type TeoyubeControlledBetaExecutionDecision =
  | "ready_for_manual_beta_dry_run_planning"
  | "ready_with_warnings"
  | "blocked"
  | "needs_owner_review"
  | "needs_privacy_review"
  | "needs_service_gate_review"
  | "unknown";

export type TeoyubeControlledBetaExecutionScope = {
  id: string;
  label: string;
  surfaces: TeoyubeControlledBetaExecutionSurface[];
  participantLimit: number;
  manualOnly: boolean;
  ownerApprovalRequired: boolean;
  exclusions: string[];
};

export type TeoyubeControlledBetaExecutionWindow = {
  id: string;
  label: string;
  plannedStart?: string;
  plannedEnd?: string;
  manualDryRunOnly: boolean;
  noAutomaticActivation: boolean;
  ownerApprovalRequired: boolean;
};

export type TeoyubeControlledBetaExecutionCheck = {
  id: string;
  label: string;
  surface: TeoyubeControlledBetaExecutionSurface;
  passed: boolean;
  details: string;
};

export type TeoyubeControlledBetaExecutionBlocker = {
  id: string;
  surface: TeoyubeControlledBetaExecutionSurface;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledBetaExecutionWarning = {
  id: string;
  surface: TeoyubeControlledBetaExecutionSurface;
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledBetaExecutionPlan = {
  id: string;
  status: TeoyubeControlledBetaExecutionStatus;
  scope: TeoyubeControlledBetaExecutionScope;
  window: TeoyubeControlledBetaExecutionWindow;
  checks: TeoyubeControlledBetaExecutionCheck[];
  ownerApprovalRequired: true;
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

export type TeoyubeControlledBetaExecutionReport = {
  valid: boolean;
  status: TeoyubeControlledBetaExecutionStatus;
  decision: TeoyubeControlledBetaExecutionDecision;
  plan: TeoyubeControlledBetaExecutionPlan;
  blockers: TeoyubeControlledBetaExecutionBlocker[];
  warnings: TeoyubeControlledBetaExecutionWarning[];
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

