export type TeoyubeManualFeedbackBoundaryStatus =
  | "manual_only"
  | "manual_ready"
  | "needs_redaction"
  | "blocked"
  | "unknown";

export type TeoyubeManualFeedbackCategory =
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
  | "unknown";

export type TeoyubeManualFeedbackPrivacyFlag =
  | "contains_sensitive_personal_text"
  | "contains_contact_information"
  | "contains_crisis_or_emergency_content"
  | "contains_professional_advice_request"
  | "contains_prayer_or_spiritual_disclosure"
  | "safe_to_track_manually"
  | "unknown";

export type TeoyubeManualFeedbackBoundaryDecision =
  | "manual_feedback_allowed_for_redacted_review"
  | "needs_manual_redaction"
  | "manual_handling_required"
  | "blocked"
  | "unknown";

export type TeoyubeManualFeedbackBoundaryRule = {
  id: string;
  label: string;
  required: true;
  satisfied: boolean;
  details: string;
};

export type TeoyubeManualFeedbackItem = {
  id: string;
  category: TeoyubeManualFeedbackCategory;
  note: string;
  redactedNote?: string;
  privacyFlags: TeoyubeManualFeedbackPrivacyFlag[];
  manuallySubmitted: boolean;
  storeRawText: boolean;
};

export type TeoyubeManualFeedbackBoundaryBlocker = {
  id: string;
  message: string;
  requiredAction: string;
};

export type TeoyubeManualFeedbackBoundaryWarning = {
  id: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeManualFeedbackBoundaryReport = {
  valid: boolean;
  status: TeoyubeManualFeedbackBoundaryStatus;
  decision: TeoyubeManualFeedbackBoundaryDecision;
  rules: TeoyubeManualFeedbackBoundaryRule[];
  feedback: TeoyubeManualFeedbackItem[];
  blockers: TeoyubeManualFeedbackBoundaryBlocker[];
  warnings: TeoyubeManualFeedbackBoundaryWarning[];
  noAutomaticCollection: true;
  noDatabaseStorage: true;
  noAnalytics: true;
  noHiddenPersonalization: true;
  noRawSensitiveTextStorageByDefault: true;
  inMemoryOnly: true;
  generatedAt: string;
};

