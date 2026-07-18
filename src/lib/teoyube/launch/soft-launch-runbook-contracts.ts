export type TeoyubeSoftLaunchRunbookStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "not_started"
  | "in_progress"
  | "complete"
  | "unknown";

export type TeoyubeSoftLaunchRunbookPhase =
  | "pre_soft_launch"
  | "launch_day"
  | "active_soft_launch"
  | "daily_review"
  | "issue_triage"
  | "rollback_review"
  | "completion_review"
  | "unknown";

export type TeoyubeSoftLaunchRunbookStep = {
  id: string;
  label: string;
  phase: TeoyubeSoftLaunchRunbookPhase;
  status: TeoyubeSoftLaunchRunbookStatus;
  required: boolean;
  complete: boolean;
  manualOnly: boolean;
  safetyCritical: boolean;
  details: string;
  nextAction?: string;
};

export type TeoyubeSoftLaunchRunbookChecklist = {
  id: string;
  label: string;
  phase: TeoyubeSoftLaunchRunbookPhase;
  steps: TeoyubeSoftLaunchRunbookStep[];
};

export type TeoyubeSoftLaunchOperatingWindow = {
  id: string;
  label: string;
  plannedDurationDays: number;
  startPolicy: "manual_owner_approval_only";
  endPolicy: "manual_completion_review_only";
  notes: string[];
};

export type TeoyubeSoftLaunchParticipantGroup = {
  id: string;
  label: string;
  audience: "internal_reviewers" | "trusted_preview_reviewers" | "owner_only";
  maxParticipants: number;
  guidanceRequired: boolean;
  notes: string[];
};

export type TeoyubeSoftLaunchSupportRole = {
  id: string;
  label: string;
  responsibilities: string[];
  escalationNotes: string[];
};

export type TeoyubeSoftLaunchCommunicationItem = {
  id: string;
  label: string;
  channel: "manual_only";
  phase: TeoyubeSoftLaunchRunbookPhase;
  prepared: boolean;
  sent: false;
  messagePurpose: string;
};

export type TeoyubeSoftLaunchRisk = {
  id: string;
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  mitigation: string;
};

export type TeoyubeSoftLaunchRollbackTrigger = {
  id: string;
  label: string;
  category:
    | "scripture_anchor"
    | "explanation_path"
    | "fallback"
    | "consent"
    | "privacy"
    | "mobile"
    | "accessibility"
    | "debug"
    | "availability"
    | "unknown";
  severity: "high" | "critical";
  requiredAction: string;
};

export type TeoyubeSoftLaunchDailyReviewItem = {
  id: string;
  label: string;
  required: boolean;
  details: string;
};

export type TeoyubeSoftLaunchCompletionDecision =
  | "ready_for_final_launch_preparation_audit"
  | "continue_soft_launch_review"
  | "pause_for_review"
  | "rollback_preview"
  | "blocked"
  | "unknown";

export type TeoyubeSoftLaunchRunbookReport = {
  status: TeoyubeSoftLaunchRunbookStatus;
  ready: boolean;
  decision: TeoyubeSoftLaunchCompletionDecision;
  phases: TeoyubeSoftLaunchRunbookPhase[];
  checklists: TeoyubeSoftLaunchRunbookChecklist[];
  operatingWindow: TeoyubeSoftLaunchOperatingWindow;
  participantGroups: TeoyubeSoftLaunchParticipantGroup[];
  supportRoles: TeoyubeSoftLaunchSupportRole[];
  communicationItems: TeoyubeSoftLaunchCommunicationItem[];
  risks: TeoyubeSoftLaunchRisk[];
  rollbackTriggers: TeoyubeSoftLaunchRollbackTrigger[];
  dailyReviewItems: TeoyubeSoftLaunchDailyReviewItem[];
  blockers: string[];
  warnings: string[];
  actualLaunchPerformed: false;
  communicationsSent: false;
  generatedAt: string;
};
