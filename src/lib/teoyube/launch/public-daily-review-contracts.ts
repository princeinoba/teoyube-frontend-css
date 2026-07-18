import type { TeoyubePublicDailyReviewDecision } from "./public-feedback-triage-contracts";

export type TeoyubePublicDailyReviewStatus =
  | "healthy"
  | "healthy_with_warnings"
  | "needs_review"
  | "pause_recommended"
  | "rollback_recommended"
  | "blocked"
  | "unknown";

export type TeoyubePublicDailyReviewActionItem = {
  id: string;
  label: string;
  owner: "owner" | "support" | "engineering" | "content" | "legal" | "unknown";
  requiredBeforeNextDay: boolean;
  publicLaunchCritical: boolean;
};

export type TeoyubePublicDailyReviewRecord = {
  id: string;
  label: string;
  status: TeoyubePublicDailyReviewStatus;
  publicAppAvailability: TeoyubePublicDailyReviewStatus;
  publicSurfaceHealth: TeoyubePublicDailyReviewStatus;
  privacyTermsConsentStatus: TeoyubePublicDailyReviewStatus;
  mobileAccessibilityIssues: number;
  scriptureAnchorIssues: number;
  explanationPathIssues: number;
  fallbackIssues: number;
  confidenceLabelIssues: number;
  consentPrivacyIssues: number;
  feedbackVolume: number;
  criticalFeedbackCount: number;
  publicFixQueueBlockerCount: number;
  pauseRollbackWatchStatus: TeoyubePublicDailyReviewStatus;
  actionItems: TeoyubePublicDailyReviewActionItem[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  generatedAt: string;
};

export type TeoyubePublicDailyReviewSummary = {
  recordCount: number;
  feedbackVolume: number;
  criticalFeedbackCount: number;
  publicLaunchBlockerCount: number;
  actionItemCount: number;
};

export type TeoyubePublicDailyReviewBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubePublicDailyReviewWarning = {
  id: string;
  label: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubePublicDailyReviewReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubePublicDailyReviewDecision;
  records: TeoyubePublicDailyReviewRecord[];
  summary: TeoyubePublicDailyReviewSummary;
  blockers: TeoyubePublicDailyReviewBlocker[];
  warnings: TeoyubePublicDailyReviewWarning[];
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalWrite: true;
  generatedAt: string;
};
