import type { TeoyubeSoftLaunchDailyReviewDecision } from "./soft-launch-feedback-triage-contracts";

export type TeoyubeSoftLaunchDailyReviewStatus =
  | "healthy"
  | "healthy_with_warnings"
  | "needs_review"
  | "pause_recommended"
  | "rollback_recommended"
  | "blocked"
  | "unknown";

export type TeoyubeSoftLaunchDailyReviewActionItem = {
  id: string;
  label: string;
  owner: "owner" | "support" | "engineering" | "content" | "unknown";
  requiredBeforeNextDay: boolean;
  launchCritical: boolean;
};

export type TeoyubeSoftLaunchDailyReviewRecord = {
  id: string;
  label: string;
  status: TeoyubeSoftLaunchDailyReviewStatus;
  appAvailability: TeoyubeSoftLaunchDailyReviewStatus;
  surfaceHealth: TeoyubeSoftLaunchDailyReviewStatus;
  mobileAccessibilityIssues: number;
  scriptureAnchorIssues: number;
  explanationPathIssues: number;
  fallbackIssues: number;
  consentPrivacyIssues: number;
  feedbackVolume: number;
  criticalFeedbackCount: number;
  fixQueueLaunchBlockerCount: number;
  pauseRollbackWatchStatus: TeoyubeSoftLaunchDailyReviewStatus;
  actionItems: TeoyubeSoftLaunchDailyReviewActionItem[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  generatedAt: string;
};

export type TeoyubeSoftLaunchDailyReviewSummary = {
  recordCount: number;
  feedbackVolume: number;
  criticalFeedbackCount: number;
  launchBlockerCount: number;
  actionItemCount: number;
};

export type TeoyubeSoftLaunchDailyReviewBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubeSoftLaunchDailyReviewWarning = {
  id: string;
  label: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeSoftLaunchDailyReviewReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubeSoftLaunchDailyReviewDecision;
  records: TeoyubeSoftLaunchDailyReviewRecord[];
  summary: TeoyubeSoftLaunchDailyReviewSummary;
  blockers: TeoyubeSoftLaunchDailyReviewBlocker[];
  warnings: TeoyubeSoftLaunchDailyReviewWarning[];
  noExternalWrite: true;
  generatedAt: string;
};
