export type TeoyubeLimitedSoftLaunchStatus =
  | "ready"
  | "ready_with_warnings"
  | "needs_review"
  | "blocked"
  | "not_started"
  | "unknown";

export type TeoyubeLimitedSoftLaunchPhase =
  | "pre_launch_review"
  | "limited_access_setup"
  | "launch_day_review"
  | "active_soft_launch"
  | "feedback_review"
  | "issue_triage"
  | "pause_or_rollback_review"
  | "completion_review"
  | "unknown";

export type TeoyubeLimitedSoftLaunchDecision =
  | "ready_for_limited_soft_launch_plan_review"
  | "ready_after_owner_review"
  | "blocked"
  | "needs_preview_recheck"
  | "needs_safety_review"
  | "needs_qa_review"
  | "unknown";

export type TeoyubeLimitedSoftLaunchParticipantGroup = {
  id: string;
  label: string;
  audience:
    | "owner"
    | "internal_reviewer"
    | "trusted_early_reviewer"
    | "limited_private_preview"
    | "excluded_public"
    | "unknown";
  maxParticipants: number;
  included: boolean;
  invitationMode: "manual_only" | "none";
  guidanceRequired: boolean;
  notes: string[];
};

export type TeoyubeLimitedSoftLaunchSurface = {
  id: string;
  label: string;
  route?: string;
  included: boolean;
  launchReadiness: TeoyubeLimitedSoftLaunchStatus;
  mobileReadiness: TeoyubeLimitedSoftLaunchStatus;
  accessibilityReadiness: TeoyubeLimitedSoftLaunchStatus;
  scriptureAnchorReadiness: TeoyubeLimitedSoftLaunchStatus;
  explanationPathReadiness: TeoyubeLimitedSoftLaunchStatus;
  fallbackReadiness: TeoyubeLimitedSoftLaunchStatus;
  consentReadiness: TeoyubeLimitedSoftLaunchStatus;
  knownLimitations: string[];
  manualQaNotes: string[];
};

export type TeoyubeLimitedSoftLaunchScope = {
  id: string;
  label: string;
  purpose: string;
  participantGroups: TeoyubeLimitedSoftLaunchParticipantGroup[];
  includedSurfaceIds: string[];
  excludedSurfaceIds: string[];
  maxParticipantCount: number;
  publicLaunchExcluded: boolean;
  automatedInvitationsDisabled: boolean;
  realUserContactPerformed: false;
  feedbackCollectionPerformed: false;
  sensitivePersonalDataRequestProhibited: boolean;
  manualFeedbackOnly: boolean;
  notes: string[];
};

export type TeoyubeLimitedSoftLaunchChecklistItem = {
  id: string;
  label: string;
  phase: TeoyubeLimitedSoftLaunchPhase;
  required: boolean;
  complete: boolean;
  launchCritical: boolean;
  details: string;
  nextAction?: string;
};

export type TeoyubeLimitedSoftLaunchRisk = {
  id: string;
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  mitigation: string;
};

export type TeoyubeLimitedSoftLaunchBlocker = {
  id: string;
  label: string;
  phase: TeoyubeLimitedSoftLaunchPhase;
  reason: string;
  requiredAction: string;
  severity: "high" | "critical";
};

export type TeoyubeLimitedSoftLaunchWarning = {
  id: string;
  label: string;
  phase: TeoyubeLimitedSoftLaunchPhase;
  message: string;
  recommendedAction: string;
};

export type TeoyubeLimitedSoftLaunchNextAction = {
  id: string;
  label: string;
  phase: TeoyubeLimitedSoftLaunchPhase;
  requiredBeforeActualSoftLaunch: boolean;
  ownerReviewRequired: boolean;
};

export type TeoyubeLimitedSoftLaunchExecutionPlan = {
  id: string;
  label: string;
  purpose: string;
  status: TeoyubeLimitedSoftLaunchStatus;
  scope: TeoyubeLimitedSoftLaunchScope;
  phases: TeoyubeLimitedSoftLaunchPhase[];
  includedSurfaces: TeoyubeLimitedSoftLaunchSurface[];
  excludedSurfaces: TeoyubeLimitedSoftLaunchSurface[];
  knownLimitations: string[];
  launchWindowPlan: {
    plannedDurationDays: number;
    startPolicy: string;
    endPolicy: string;
    ownerApprovalRequired: boolean;
  };
  participantGuidance: string[];
  manualFeedbackWorkflow: string[];
  issueTriageProcess: string[];
  safetyReviewLoop: string[];
  pauseCriteria: string[];
  rollbackCriteria: string[];
  completionCriteria: string[];
  risks: TeoyubeLimitedSoftLaunchRisk[];
  checklist: TeoyubeLimitedSoftLaunchChecklistItem[];
  ownerReviewRequired: boolean;
  actualLaunchPerformed: false;
  usersContacted: false;
  realFeedbackCollected: false;
  previewUrlFetched: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  generatedAt: string;
};

export type TeoyubeLimitedSoftLaunchExecutionReport = {
  status: TeoyubeLimitedSoftLaunchStatus;
  ready: boolean;
  decision: TeoyubeLimitedSoftLaunchDecision;
  plan: TeoyubeLimitedSoftLaunchExecutionPlan;
  checklistCount: number;
  completedChecklistCount: number;
  blockerCount: number;
  warningCount: number;
  blockers: TeoyubeLimitedSoftLaunchBlocker[];
  warnings: TeoyubeLimitedSoftLaunchWarning[];
  nextActions: TeoyubeLimitedSoftLaunchNextAction[];
  noActualLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollected: true;
  noPreviewUrlFetched: true;
  noExternalWrite: true;
  generatedAt: string;
};
