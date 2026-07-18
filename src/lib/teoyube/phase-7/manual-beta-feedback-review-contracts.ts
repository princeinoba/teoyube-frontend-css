export type TeoyubeManualBetaFeedbackReviewStatus =
  | "empty"
  | "ready"
  | "ready_with_warnings"
  | "blocked";

export type TeoyubeManualBetaFeedbackCategory =
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "word_card"
  | "promise_table"
  | "prayer_companion"
  | "compass_experience"
  | "tig_response_panel"
  | "tig_graph_explorer"
  | "mobile"
  | "accessibility"
  | "privacy_consent"
  | "content_clarity"
  | "positive_feedback"
  | "feature_request"
  | "sensitive_content"
  | "support_request"
  | "unknown";

export type TeoyubeManualBetaFeedbackPrivacyFlag =
  | "contains_sensitive_text"
  | "contains_contact_info"
  | "contains_secret"
  | "emergency_or_crisis"
  | "medical_legal_financial"
  | "professional_advice"
  | "spiritual_safety_review"
  | "none";

export type TeoyubeManualBetaFeedbackItem = {
  id: string;
  category: TeoyubeManualBetaFeedbackCategory;
  summary: string;
  redactedNotes: string[];
  privacyFlags: TeoyubeManualBetaFeedbackPrivacyFlag[];
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "reviewed" | "converted_to_issue" | "deferred";
  source: "manual_owner_note" | "manual_participant_note" | "manual_support_note" | "simulated_note";
  sanitized: boolean;
  manualOnly: true;
  rawSensitiveTextStored: boolean;
  feedbackCollectedAutomatically: boolean;
  externalServicesCalled: boolean;
  databaseWritten: boolean;
  analyticsSent: boolean;
  hiddenPersonalizationCreated: boolean;
  generatedAt: string;
};

export type TeoyubeManualBetaFeedbackReviewResult = {
  valid: boolean;
  item: TeoyubeManualBetaFeedbackItem;
  blockers: TeoyubeManualBetaFeedbackReviewBlocker[];
  warnings: TeoyubeManualBetaFeedbackReviewWarning[];
};

export type TeoyubeManualBetaFeedbackReviewDecision =
  | "ready_for_manual_issue_triage"
  | "ready_with_warnings"
  | "needs_manual_privacy_review"
  | "blocked"
  | "empty";

export type TeoyubeManualBetaFeedbackReviewBlocker = {
  id: string;
  category: TeoyubeManualBetaFeedbackCategory;
  message: string;
  requiredAction: string;
};

export type TeoyubeManualBetaFeedbackReviewWarning = {
  id: string;
  category: TeoyubeManualBetaFeedbackCategory;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualBetaFeedbackReview = {
  id: string;
  items: TeoyubeManualBetaFeedbackItem[];
  manualOnly: true;
  inMemoryOnly: true;
  noFeedbackCollectedAutomatically: true;
  noExternalWrite: true;
  noUsersContacted: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noHiddenPersonalizationCreated: true;
  generatedAt: string;
};

export type TeoyubeManualBetaFeedbackReviewReport = {
  valid: boolean;
  status: TeoyubeManualBetaFeedbackReviewStatus;
  decision: TeoyubeManualBetaFeedbackReviewDecision;
  review: TeoyubeManualBetaFeedbackReview;
  summary: {
    itemCount: number;
    blockerCount: number;
    warningCount: number;
    privacyReviewCount: number;
    criticalCount: number;
    highCount: number;
  };
  blockers: TeoyubeManualBetaFeedbackReviewBlocker[];
  warnings: TeoyubeManualBetaFeedbackReviewWarning[];
  manualOnly: true;
  inMemoryOnly: true;
  sanitizedOnly: boolean;
  noFeedbackCollectedAutomatically: true;
  noExternalWrite: true;
  noUsersContacted: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noHiddenPersonalizationCreated: true;
  generatedAt: string;
};
