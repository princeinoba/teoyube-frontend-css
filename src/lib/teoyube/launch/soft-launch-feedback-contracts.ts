export type TeoyubeSoftLaunchFeedbackType =
  | "bug"
  | "mobile_layout_issue"
  | "accessibility_issue"
  | "scripture_anchor_issue"
  | "explanation_path_issue"
  | "fallback_issue"
  | "consent_issue"
  | "personalization_preview_issue"
  | "content_clarity"
  | "spiritual_content_feedback"
  | "feature_request"
  | "confusion"
  | "positive_feedback"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackCategory =
  | "scripture"
  | "explanation"
  | "fallback"
  | "consent"
  | "privacy"
  | "mobile"
  | "accessibility"
  | "content"
  | "personalization"
  | "availability"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackSource =
  | "manual_owner_note"
  | "manual_reviewer_note"
  | "participant_report"
  | "internal_qa"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackStatus =
  | "open"
  | "in_review"
  | "triaged"
  | "resolved"
  | "deferred"
  | "wont_fix"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackPrivacyStatus =
  | "safe_redacted"
  | "needs_manual_privacy_review"
  | "blocked_raw_sensitive_text"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackTriageDecision =
  | "continue_monitoring"
  | "document_known_limitation"
  | "fix_before_wider_sharing"
  | "pause_soft_launch"
  | "rollback_preview"
  | "safety_review_required"
  | "consent_review_required"
  | "scripture_content_review_required"
  | "accessibility_review_required"
  | "unknown";

export type TeoyubeSoftLaunchFeedbackItem = {
  id: string;
  type: TeoyubeSoftLaunchFeedbackType;
  category: TeoyubeSoftLaunchFeedbackCategory;
  severity: TeoyubeSoftLaunchFeedbackSeverity;
  source: TeoyubeSoftLaunchFeedbackSource;
  status: TeoyubeSoftLaunchFeedbackStatus;
  surface?: string;
  summary: string;
  redactedNotes?: string;
  rawNotesStored: false;
  containsSensitivePrivateText: boolean;
  hiddenPersonalizationCreated: false;
  analyticsSent: false;
  databaseWritten: false;
  requiresManualReview: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeSoftLaunchFeedbackIntakeResult = {
  valid: boolean;
  item: TeoyubeSoftLaunchFeedbackItem;
  errors: string[];
  warnings: string[];
};

export type TeoyubeSoftLaunchFeedbackLog = {
  id: string;
  items: TeoyubeSoftLaunchFeedbackItem[];
  inMemoryOnly: true;
  analyticsSent: false;
  databaseWritten: false;
  fileWritten: false;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubeSoftLaunchFeedbackSummary = {
  itemCount: number;
  blockerCount: number;
  warningCount: number;
  criticalCount: number;
  highCount: number;
  scriptureIssueCount: number;
  explanationIssueCount: number;
  fallbackIssueCount: number;
  consentIssueCount: number;
  privacyReviewCount: number;
  generatedAt: string;
};
