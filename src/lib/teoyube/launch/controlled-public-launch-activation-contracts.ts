export type TeoyubeControlledPublicLaunchActivationStatus =
  | "ready"
  | "ready_with_warnings"
  | "needs_review"
  | "blocked"
  | "not_started"
  | "unknown";

export type TeoyubeControlledPublicLaunchActivationPhase =
  | "pre_activation_review"
  | "owner_approval"
  | "environment_confirmation"
  | "production_service_confirmation"
  | "public_surface_confirmation"
  | "public_access_confirmation"
  | "public_communication_readiness"
  | "first_hour_monitoring_readiness"
  | "public_feedback_intake_readiness"
  | "pause_rollback_readiness"
  | "activation_decision"
  | "unknown";

export type TeoyubeControlledPublicLaunchActivationDecision =
  | "ready_for_manual_public_activation"
  | "ready_after_owner_review"
  | "blocked"
  | "needs_environment_review"
  | "needs_service_review"
  | "needs_safety_review"
  | "needs_surface_review"
  | "needs_privacy_review"
  | "needs_qa_review"
  | "unknown";

export type TeoyubeControlledPublicLaunchActivationCheck = {
  id: string;
  label: string;
  phase: TeoyubeControlledPublicLaunchActivationPhase;
  required: boolean;
  complete: boolean;
  launchCritical: boolean;
  details: string;
  nextAction?: string;
};

export type TeoyubeControlledPublicLaunchActivationChecklist = {
  id: string;
  label: string;
  checks: TeoyubeControlledPublicLaunchActivationCheck[];
  manualOnly: true;
};

export type TeoyubeControlledPublicLaunchActivationBlocker = {
  id: string;
  label: string;
  phase: TeoyubeControlledPublicLaunchActivationPhase;
  severity: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubeControlledPublicLaunchActivationWarning = {
  id: string;
  label: string;
  phase: TeoyubeControlledPublicLaunchActivationPhase;
  severity: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledPublicLaunchOwnerApproval = {
  id: string;
  label: string;
  status: "approved" | "needs_review" | "blocked" | "unknown";
  checklist: TeoyubeControlledPublicLaunchActivationCheck[];
  controlledPublicActivationAccepted: boolean;
  controlledPublicActivationBlocked: boolean;
  ownerNotes: string[];
  manualApprovalOnly: true;
  signatureRequired: false;
  publicLaunchPerformed: false;
  messagesSent: false;
  usersContacted: false;
  generatedAt: string;
};

export type TeoyubeControlledPublicLaunchWindow = {
  id: string;
  label: string;
  proposedStartTime: string;
  proposedPublicLaunchDuration: string;
  ownerAvailable: boolean;
  supportAvailable: boolean;
  issueTriageAvailable: boolean;
  rollbackDecisionAvailable: boolean;
  publicCommunicationTiming: string;
  publicQaCheckTiming: string;
  firstHourMonitoringTiming: string;
  dailyReviewTiming: string;
  knownLimitations: string[];
  pauseCriteria: string[];
  rollbackCriteria: string[];
  manualEntryOnly: true;
  scheduledByCode: false;
  calendarInvitesSent: false;
  usersContacted: false;
  generatedAt: string;
};

export type TeoyubeControlledPublicAccessStatus = {
  id: string;
  label: string;
  publicRouteAccessIntentional: boolean;
  publicLaunchScopeDocumented: boolean;
  excludedLimitedSurfacesDocumented: boolean;
  privacyTermsConsentAccessible: boolean;
  sensitivePersonalInformationWarningVisible: boolean;
  automatedInvitationsDisabled: boolean;
  userContactFromCode: false;
  hiddenTrackingEnabled: false;
  analyticsSent: false;
  databasePersistenceActive: false;
  liveAiOrchestrationActive: false;
  generatedAt: string;
};

export type TeoyubeControlledPublicCommunicationStatus = {
  id: string;
  label: string;
  publicLaunchNoticeDraftExists: boolean;
  privacyNoticeAvailable: boolean;
  termsNoticeAvailable: boolean;
  consentNoticeAvailable: boolean;
  sensitiveInformationWarningExists: boolean;
  aiTigTransparencyNoticeExists: boolean;
  knownLimitationsNoticeExists: boolean;
  feedbackInstructionsExist: boolean;
  noDivineCertaintyClaimIncluded: boolean;
  professionalAdviceBoundaryIncluded: boolean;
  personalizationConsentNoticeIncluded: boolean;
  productionServiceStatusNoticeIncluded: boolean;
  messagesSentByCode: false;
  usersContacted: false;
  generatedAt: string;
};

export type TeoyubeControlledPublicPauseRollbackStatus = {
  id: string;
  label: string;
  pauseCriteria: string[];
  rollbackCriteria: string[];
  rollbackPerformed: false;
  providerCommandsExecuted: false;
  manualDecisionOnly: true;
  generatedAt: string;
};

export type TeoyubeControlledPublicLaunchActivationReport = {
  status: TeoyubeControlledPublicLaunchActivationStatus;
  ready: boolean;
  decision: TeoyubeControlledPublicLaunchActivationDecision;
  checklist: TeoyubeControlledPublicLaunchActivationChecklist;
  checklistCount: number;
  completedChecklistCount: number;
  blockerCount: number;
  warningCount: number;
  blockers: TeoyubeControlledPublicLaunchActivationBlocker[];
  warnings: TeoyubeControlledPublicLaunchActivationWarning[];
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlFetched: true;
  noExternalAnalyticsSent: true;
  noProductionPersistenceEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noExternalWrite: true;
  generatedAt: string;
};
