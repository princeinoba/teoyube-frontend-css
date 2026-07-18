export type TeoyubePublicIssueStatus =
  | "new"
  | "triaged"
  | "fix_queue"
  | "owner_review"
  | "closed"
  | "unknown";

export type TeoyubePublicIssueCategory =
  | "app_not_loading"
  | "real_data_failure"
  | "user_journey_failure"
  | "scripture_anchor_missing"
  | "explanation_trace_missing"
  | "unsafe_fallback"
  | "confidence_label_missing"
  | "review_only_content_visible"
  | "privacy_consent_issue"
  | "sensitive_information_exposure"
  | "support_boundary_issue"
  | "mobile_issue"
  | "accessibility_issue"
  | "performance_issue"
  | "disabled_service_issue"
  | "debug_payload_visible"
  | "divine_certainty_language"
  | "professional_advice_language"
  | "content_clarity"
  | "unknown";

export type TeoyubePublicIssueSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "unknown";

export type TeoyubePublicIssueSource =
  | "manual_qa"
  | "manual_monitoring"
  | "manual_support"
  | "manual_feedback_review"
  | "owner_review"
  | "unknown";

export type TeoyubePublicIssueRecommendedAction =
  | "move_to_fix_queue"
  | "owner_review_required"
  | "monitor_manually"
  | "document_known_limitation"
  | "close_no_action"
  | "unknown";

export type TeoyubePublicIssue = {
  id: string;
  title: string;
  category: TeoyubePublicIssueCategory;
  severity: TeoyubePublicIssueSeverity;
  source: TeoyubePublicIssueSource;
  status: TeoyubePublicIssueStatus;
  details: string;
  containsSensitiveInformation: boolean;
  createdAt: string;
};

export type TeoyubePublicIssueTriageDecision =
  | "fix_queue_required"
  | "owner_review_required"
  | "ready_with_warnings"
  | "no_blocking_issues"
  | "unknown";

export type TeoyubePublicIssueTriageBlocker = {
  id: string;
  issueId: string;
  category: TeoyubePublicIssueCategory;
  severity: TeoyubePublicIssueSeverity;
  message: string;
  recommendedAction: TeoyubePublicIssueRecommendedAction;
};

export type TeoyubePublicIssueTriageWarning = {
  id: string;
  issueId?: string;
  category: TeoyubePublicIssueCategory;
  message: string;
  recommendedAction: TeoyubePublicIssueRecommendedAction;
};

export type TeoyubePublicIssueTriageReport = {
  valid: boolean;
  decision: TeoyubePublicIssueTriageDecision;
  issues: TeoyubePublicIssue[];
  blockingIssues: TeoyubePublicIssue[];
  blockers: TeoyubePublicIssueTriageBlocker[];
  warnings: TeoyubePublicIssueTriageWarning[];
  noAutomaticFeedbackCollection: true;
  noAutomaticUserContact: true;
  noExternalPersistence: true;
  noAnalyticsEnabled: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
