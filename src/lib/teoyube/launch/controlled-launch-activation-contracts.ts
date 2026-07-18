export type TeoyubeControlledLaunchActivationStatus =
  | "ready"
  | "ready_with_warnings"
  | "needs_review"
  | "blocked"
  | "not_started"
  | "unknown";

export type TeoyubeControlledLaunchActivationPhase =
  | "pre_activation_review"
  | "owner_approval"
  | "environment_confirmation"
  | "surface_confirmation"
  | "participant_access_confirmation"
  | "communication_readiness"
  | "first_hour_monitoring_readiness"
  | "feedback_intake_readiness"
  | "pause_rollback_readiness"
  | "activation_decision"
  | "unknown";

export type TeoyubeControlledLaunchActivationDecision =
  | "ready_for_manual_controlled_activation"
  | "ready_after_owner_review"
  | "blocked"
  | "needs_environment_review"
  | "needs_safety_review"
  | "needs_surface_review"
  | "needs_feedback_workflow_review"
  | "unknown";

export type TeoyubeControlledLaunchActivationCheck = {
  id: string;
  label: string;
  phase: TeoyubeControlledLaunchActivationPhase;
  required: boolean;
  complete: boolean;
  launchCritical: boolean;
  details: string;
  nextAction?: string;
};

export type TeoyubeControlledLaunchActivationChecklist = {
  id: string;
  label: string;
  checks: TeoyubeControlledLaunchActivationCheck[];
  manualOnly: true;
};

export type TeoyubeControlledLaunchActivationBlocker = {
  id: string;
  label: string;
  phase: TeoyubeControlledLaunchActivationPhase;
  severity: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubeControlledLaunchActivationWarning = {
  id: string;
  label: string;
  phase: TeoyubeControlledLaunchActivationPhase;
  severity: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
};

export type TeoyubeControlledLaunchOwnerApproval = {
  id: string;
  label: string;
  status: "approved" | "needs_review" | "blocked" | "unknown";
  checklist: TeoyubeControlledLaunchActivationCheck[];
  controlledActivationAccepted: boolean;
  controlledActivationBlocked: boolean;
  ownerNotes: string[];
  manualApprovalOnly: true;
  signatureRequired: false;
  messagesSent: false;
  usersContacted: false;
  generatedAt: string;
};

export type TeoyubeControlledLaunchWindow = {
  id: string;
  label: string;
  proposedStartTime: string;
  proposedEndTime: string;
  ownerAvailable: boolean;
  supportAvailable: boolean;
  issueTriageAvailable: boolean;
  rollbackDecisionAvailable: boolean;
  dailyReviewTime: string;
  communicationReady: boolean;
  knownLimitations: string[];
  pauseCriteria: string[];
  manualEntryOnly: true;
  scheduledByCode: false;
  calendarInvitesSent: false;
  usersContacted: false;
  generatedAt: string;
};

export type TeoyubeControlledLaunchParticipantAccessStatus = {
  id: string;
  label: string;
  internalReviewersEnabled: boolean;
  trustedEarlyReviewersEnabled: boolean;
  limitedPrivatePreviewGroupEnabled: boolean;
  publicAccessExcluded: boolean;
  manualSharingOnly: boolean;
  automatedInvitationsDisabled: boolean;
  userContactFromCode: false;
  sensitivePersonalInformationRequested: false;
  hiddenTrackingEnabled: false;
  analyticsSent: false;
  generatedAt: string;
};

export type TeoyubeControlledLaunchCommunicationStatus = {
  id: string;
  label: string;
  participantNoticeDraftExists: boolean;
  privacyNoticeDraftExists: boolean;
  safetyNoticeDraftExists: boolean;
  knownLimitationsNoticeExists: boolean;
  feedbackInstructionsExist: boolean;
  messagesSentByCode: false;
  sensitivePersonalInformationWarningIncluded: boolean;
  previewSafePersonalizationNoticeIncluded: boolean;
  externalAnalyticsDisconnectedNoticeIncluded: boolean;
  databasePersistenceDisconnectedNoticeIncluded: boolean;
  liveAiDisabledNoticeIncluded: boolean;
  generatedAt: string;
};

export type TeoyubeControlledLaunchPauseRollbackStatus = {
  id: string;
  label: string;
  pauseCriteria: string[];
  rollbackCriteria: string[];
  rollbackPerformed: false;
  providerCommandsExecuted: false;
  manualDecisionOnly: true;
  generatedAt: string;
};

export type TeoyubeControlledLaunchActivationReport = {
  status: TeoyubeControlledLaunchActivationStatus;
  ready: boolean;
  decision: TeoyubeControlledLaunchActivationDecision;
  checklist: TeoyubeControlledLaunchActivationChecklist;
  checklistCount: number;
  completedChecklistCount: number;
  blockerCount: number;
  warningCount: number;
  blockers: TeoyubeControlledLaunchActivationBlocker[];
  warnings: TeoyubeControlledLaunchActivationWarning[];
  noLaunchPerformed: true;
  noUsersContacted: true;
  noRealFeedbackCollected: true;
  noPreviewUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};
