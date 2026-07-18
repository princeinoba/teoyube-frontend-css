export type TeoyubeSupportIssueStatus = "open" | "triaged" | "blocked" | "resolved" | "deferred";

export type TeoyubeSupportIssueCategory =
  | "app_not_loading"
  | "navigation_confusion"
  | "scripture_anchor_missing"
  | "scripture_anchor_question"
  | "explanation_trace_missing"
  | "explanation_trace_question"
  | "unsafe_fallback"
  | "fallback_confusion"
  | "confidence_label_missing"
  | "confidence_label_confusion"
  | "review_only_content_visible"
  | "privacy_consent_issue"
  | "sensitive_information_submitted"
  | "emergency_or_crisis"
  | "professional_advice_request"
  | "mobile_issue"
  | "accessibility_issue"
  | "technical_issue"
  | "disabled_service_issue"
  | "debug_payload_visible"
  | "divine_certainty_language"
  | "content_clarity"
  | "unknown";

export type TeoyubeSupportIssueSeverity = "critical" | "high" | "medium" | "low" | "informational" | "unknown";

export type TeoyubeSupportIssueSource =
  | "manual_feedback_simulation"
  | "manual_support_note"
  | "manual_owner_note"
  | "manual_monitoring"
  | "phase_7_1_support_workflow"
  | "owner_observation"
  | "unknown";

export type TeoyubeSupportIssue = {
  id: string;
  title: string;
  description: string;
  category: TeoyubeSupportIssueCategory;
  severity: TeoyubeSupportIssueSeverity;
  source: TeoyubeSupportIssueSource;
  sourceId?: string;
  status: TeoyubeSupportIssueStatus;
  sanitized: boolean;
  manualOnly: true;
  inMemoryOnly: true;
  rawSensitiveTextStored: boolean;
  usersContacted: boolean;
  feedbackCollectedAutomatically: boolean;
  publicUrlFetched: boolean;
  databaseWritten: boolean;
  analyticsSent: boolean;
  externalServicesCalled: boolean;
  monitoringProviderConnected: boolean;
  liveAiOrchestrationEnabled: boolean;
  adminAuthAdded: boolean;
  cmsConnected: boolean;
  browserPersistenceRequired: boolean;
  noDivineCertaintyClaimed: boolean;
  createdAt: string;
};

export type TeoyubeSupportIssueTriageDecision =
  | "beta_operations_blocked"
  | "queue_for_product_stabilization"
  | "owner_review_required"
  | "monitor_manually"
  | "resolved"
  | "unknown";

export type TeoyubeSupportIssueRecommendedAction = {
  id: string;
  issueId: string;
  decision: TeoyubeSupportIssueTriageDecision;
  label: string;
  details: string;
  nextStep: string;
};

export type TeoyubeSupportIssueTriageBlocker = {
  id: string;
  issueId?: string;
  category: TeoyubeSupportIssueCategory;
  severity: TeoyubeSupportIssueSeverity;
  message: string;
  requiredAction: string;
};

export type TeoyubeSupportIssueTriageWarning = {
  id: string;
  issueId?: string;
  category: TeoyubeSupportIssueCategory;
  severity: TeoyubeSupportIssueSeverity;
  message: string;
  recommendedAction: string;
};

export type TeoyubeSupportIssueTriageReport = {
  valid: boolean;
  decision: TeoyubeSupportIssueTriageDecision;
  issues: TeoyubeSupportIssue[];
  blockingIssues: TeoyubeSupportIssue[];
  blockers: TeoyubeSupportIssueTriageBlocker[];
  warnings: TeoyubeSupportIssueTriageWarning[];
  recommendedActions: TeoyubeSupportIssueRecommendedAction[];
  manualOnly: true;
  inMemoryOnly: true;
  noAutomaticCollection: true;
  noUsersContacted: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalSend: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  noDivineCertaintyClaimed: true;
  generatedAt: string;
};
