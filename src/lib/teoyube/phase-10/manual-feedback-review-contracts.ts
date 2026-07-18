import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";

export type TeoyubeManualFeedbackReviewStatus =
  | "new"
  | "reviewing"
  | "categorized"
  | "triaged"
  | "deferred"
  | "blocked"
  | "unknown";

export type TeoyubeManualFeedbackReviewSource =
  | "owner_note"
  | "manual_email_review"
  | "manual_message_review"
  | "manual_form_export"
  | "support_note"
  | "unknown";

export type TeoyubeManualFeedbackReviewCategory =
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

export type TeoyubeManualFeedbackReviewDecision =
  | "no_action"
  | "log_for_watch"
  | "triage_as_issue"
  | "safe_fix_candidate"
  | "pause_release"
  | "rollback_required"
  | "defer_to_backlog"
  | "unknown";

export type TeoyubeManualFeedbackItem = {
  id: string;
  source: TeoyubeManualFeedbackReviewSource;
  category: TeoyubeManualFeedbackReviewCategory;
  status: TeoyubeManualFeedbackReviewStatus;
  summary: string;
  affectedArea: string;
  issueSeverity?: TeoyubeFirstDayIssueSeverity;
  containsSensitivePersonalData: boolean;
  spiritualSafetyConcern: boolean;
  notes: string[];
};

export type TeoyubeManualFeedbackReviewResult = {
  feedback: TeoyubeManualFeedbackItem;
  decision: TeoyubeManualFeedbackReviewDecision;
  rationale: string;
};

export type TeoyubeManualFeedbackReviewBlocker = {
  id: string;
  feedbackId: string;
  message: string;
};

export type TeoyubeManualFeedbackReviewWarning = {
  id: string;
  feedbackId: string;
  message: string;
};

export type TeoyubeManualFeedbackReviewReport = {
  valid: boolean;
  checklist: Array<{ id: string; label: string; passed: boolean; details: string }>;
  results: TeoyubeManualFeedbackReviewResult[];
  blockers: TeoyubeManualFeedbackReviewBlocker[];
  warnings: TeoyubeManualFeedbackReviewWarning[];
  decision: TeoyubeManualFeedbackReviewDecision;
  noAutomaticFeedbackCollection: true;
  noSensitiveDataStoredInCode: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
