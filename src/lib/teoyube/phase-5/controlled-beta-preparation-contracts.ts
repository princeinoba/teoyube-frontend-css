export type TeoyubeControlledBetaStatus =
  | "preparation_ready"
  | "ready_with_warnings"
  | "blocked"
  | "owner_review_required"
  | "unknown";

export type TeoyubeControlledBetaSurface =
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

export type TeoyubeControlledBetaParticipantProfile = {
  id: string;
  label: string;
  allowed: boolean;
  notes: string;
};

export type TeoyubeControlledBetaScope = {
  id: string;
  label: string;
  surfaces: TeoyubeControlledBetaSurface[];
  participantProfiles: TeoyubeControlledBetaParticipantProfile[];
  maxParticipants: number;
  controlledAndLimited: boolean;
  manualInvitationOnly: true;
  launchPerformed: false;
  noUsersContactedFromCode: true;
  noAutomaticFeedbackCollection: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  createdAt: string;
};

export type TeoyubeControlledBetaPreparationDecision =
  | "ready_for_manual_beta_qa_preparation"
  | "ready_with_warnings"
  | "blocked"
  | "needs_service_gate_review"
  | "needs_privacy_security_review"
  | "needs_owner_review"
  | "unknown";

export type TeoyubeControlledBetaPreparationBlocker = {
  id: string;
  surface: TeoyubeControlledBetaSurface | "unknown";
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledBetaPreparationWarning = {
  id: string;
  surface: TeoyubeControlledBetaSurface | "unknown";
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledBetaPreparationCheck = {
  id: string;
  surface: TeoyubeControlledBetaSurface | "unknown";
  label: string;
  passed: boolean;
  details: string;
  blockers: TeoyubeControlledBetaPreparationBlocker[];
  warnings: TeoyubeControlledBetaPreparationWarning[];
};

export type TeoyubeControlledBetaPreparationReport = {
  valid: boolean;
  status: TeoyubeControlledBetaStatus;
  decision: TeoyubeControlledBetaPreparationDecision;
  scope: TeoyubeControlledBetaScope;
  checks: TeoyubeControlledBetaPreparationCheck[];
  blockers: TeoyubeControlledBetaPreparationBlocker[];
  warnings: TeoyubeControlledBetaPreparationWarning[];
  ownerReviewRequired: true;
  noBetaLaunchPerformed: true;
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
