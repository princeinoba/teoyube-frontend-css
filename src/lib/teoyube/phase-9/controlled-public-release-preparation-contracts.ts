export type TeoyubeControlledPublicReleasePreparationStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "unknown";

export type TeoyubeControlledPublicReleaseSurface =
  | "home"
  | "canon"
  | "daily_word"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "privacy_notice"
  | "consent_notice"
  | "known_limitations"
  | "support_feedback"
  | "fallback_states"
  | "unknown";

export type TeoyubeControlledPublicReleaseDecision =
  | "ready_for_public_release_candidate_qa"
  | "ready_with_warnings"
  | "blocked"
  | "needs_copy_review"
  | "needs_privacy_security_review"
  | "needs_service_lock_review"
  | "needs_owner_approval"
  | "unknown";

export type TeoyubeControlledPublicReleaseScope = {
  id: string;
  surfaces: TeoyubeControlledPublicReleaseSurface[];
  releaseRemainsControlled: true;
  ownerApprovalRequired: true;
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
};

export type TeoyubeControlledPublicReleaseRequirement = {
  id: string;
  surface: TeoyubeControlledPublicReleaseSurface;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeControlledPublicReleaseBlocker = {
  id: string;
  surface: TeoyubeControlledPublicReleaseSurface;
  message: string;
  requiredAction: string;
};

export type TeoyubeControlledPublicReleaseWarning = {
  id: string;
  surface: TeoyubeControlledPublicReleaseSurface;
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledPublicReleaseCheck = {
  id: string;
  surface: TeoyubeControlledPublicReleaseSurface;
  label: string;
  passed: boolean;
  details: string;
  requirements: TeoyubeControlledPublicReleaseRequirement[];
};

export type TeoyubeControlledPublicReleaseRisk = {
  id: string;
  surface: TeoyubeControlledPublicReleaseSurface;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  mitigation: string;
};

export type TeoyubeControlledPublicReleaseReport = {
  valid: boolean;
  status: TeoyubeControlledPublicReleasePreparationStatus;
  decision: TeoyubeControlledPublicReleaseDecision;
  scope: TeoyubeControlledPublicReleaseScope;
  checks: TeoyubeControlledPublicReleaseCheck[];
  blockers: TeoyubeControlledPublicReleaseBlocker[];
  warnings: TeoyubeControlledPublicReleaseWarning[];
  risks: TeoyubeControlledPublicReleaseRisk[];
  noPublicLaunchPerformed: true;
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
