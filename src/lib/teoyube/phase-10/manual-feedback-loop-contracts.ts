import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";

export type TeoyubeManualFeedbackLoopStatus =
  | "new"
  | "reviewing"
  | "categorized"
  | "pattern_flagged"
  | "triaged"
  | "safe_fix_candidate"
  | "deferred"
  | "resolved"
  | "unknown";

export type TeoyubeManualFeedbackLoopCadence =
  | "daily"
  | "twice_weekly"
  | "weekly"
  | "as_needed"
  | "unknown";

export type TeoyubeManualFeedbackLoopSource =
  | "owner_observation"
  | "manual_email_review"
  | "manual_message_review"
  | "manual_conversation_note"
  | "support_note"
  | "unknown";

export type TeoyubeManualFeedbackLoopCategory =
  | "bug_report"
  | "confusion"
  | "content_clarity"
  | "spiritual_safety"
  | "layout"
  | "mobile_usability"
  | "performance"
  | "feature_request"
  | "encouragement"
  | "unknown";

export type TeoyubeManualFeedbackLoopDecision =
  | "no_action"
  | "watch"
  | "triage_as_issue"
  | "safe_fix_candidate"
  | "pause_release"
  | "rollback_required"
  | "defer_to_backlog"
  | "unknown";

export type TeoyubeManualFeedbackLoopItem = {
  id: string;
  source: TeoyubeManualFeedbackLoopSource;
  cadence: TeoyubeManualFeedbackLoopCadence;
  category: TeoyubeManualFeedbackLoopCategory;
  status: TeoyubeManualFeedbackLoopStatus;
  summary: string;
  affectedArea: string;
  issueSeverity?: TeoyubeFirstDayIssueSeverity;
  repeatedIssue: boolean;
  containsSensitivePersonalData: boolean;
  spiritualSafetyConcern: boolean;
  notes: string[];
};

export type TeoyubeManualFeedbackLoopReview = {
  feedback: TeoyubeManualFeedbackLoopItem;
  decision: TeoyubeManualFeedbackLoopDecision;
  rationale: string;
  safeFixCandidate: boolean;
  repeatedPatternCandidate: boolean;
};

export type TeoyubeManualFeedbackLoopBlocker = {
  id: string;
  feedbackId: string;
  message: string;
};

export type TeoyubeManualFeedbackLoopWarning = {
  id: string;
  feedbackId: string;
  message: string;
};

export type TeoyubeManualFeedbackLoopReport = {
  valid: boolean;
  checklist: Array<{ id: string; label: string; passed: boolean; details: string }>;
  reviews: TeoyubeManualFeedbackLoopReview[];
  blockers: TeoyubeManualFeedbackLoopBlocker[];
  warnings: TeoyubeManualFeedbackLoopWarning[];
  decision: TeoyubeManualFeedbackLoopDecision;
  noAutomaticFeedbackCollection: true;
  noSensitiveDataStoredInCode: true;
  noExternalServicesRequired: true;
  noAnalyticsEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};
