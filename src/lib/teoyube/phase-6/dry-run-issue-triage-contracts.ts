export type TeoyubeDryRunIssueStatus = "open" | "triaged" | "blocked" | "resolved";

export type TeoyubeDryRunIssueCategory =
  | "app_not_loading"
  | "participant_instruction_gap"
  | "feedback_boundary_gap"
  | "privacy_consent_issue"
  | "scripture_anchor_missing"
  | "explanation_trace_missing"
  | "unsafe_fallback"
  | "confidence_label_missing"
  | "review_only_content_visible"
  | "disabled_service_issue"
  | "controlled_admin_issue"
  | "debug_payload_visible"
  | "mobile_issue"
  | "accessibility_issue"
  | "divine_certainty_language"
  | "professional_advice_language"
  | "content_clarity"
  | "unknown";

export type TeoyubeDryRunIssueSeverity = "critical" | "high" | "medium" | "low" | "informational" | "unknown";

export type TeoyubeDryRunIssueSource =
  | "dry_run_step"
  | "simulated_participant_session"
  | "simulated_feedback"
  | "owner_observation"
  | "verification"
  | "unknown";

export type TeoyubeDryRunIssue = {
  id: string;
  title: string;
  description: string;
  category: TeoyubeDryRunIssueCategory;
  severity: TeoyubeDryRunIssueSeverity;
  source: TeoyubeDryRunIssueSource;
  status: TeoyubeDryRunIssueStatus;
  simulatedOnly: true;
  createdAt: string;
};

export type TeoyubeDryRunIssueTriageDecision =
  | "dry_run_blocked"
  | "queue_for_phase_6_3"
  | "owner_review"
  | "monitor"
  | "resolved"
  | "unknown";

export type TeoyubeDryRunIssueRecommendedAction = {
  id: string;
  issueId: string;
  decision: TeoyubeDryRunIssueTriageDecision;
  label: string;
  details: string;
  nextStep: string;
};

export type TeoyubeDryRunIssueTriageBlocker = {
  id: string;
  issueId: string;
  category: TeoyubeDryRunIssueCategory;
  severity: TeoyubeDryRunIssueSeverity;
  message: string;
  requiredAction: string;
};

export type TeoyubeDryRunIssueTriageWarning = {
  id: string;
  issueId: string;
  category: TeoyubeDryRunIssueCategory;
  severity: TeoyubeDryRunIssueSeverity;
  message: string;
  recommendedAction: string;
};

export type TeoyubeDryRunIssueTriageReport = {
  valid: boolean;
  decision: TeoyubeDryRunIssueTriageDecision;
  issues: TeoyubeDryRunIssue[];
  blockingIssues: TeoyubeDryRunIssue[];
  blockers: TeoyubeDryRunIssueTriageBlocker[];
  warnings: TeoyubeDryRunIssueTriageWarning[];
  recommendedActions: TeoyubeDryRunIssueRecommendedAction[];
  simulatedOnly: true;
  manualOnly: true;
  noAutomaticCollection: true;
  noUsersContacted: true;
  noExternalSend: true;
  inMemoryOnly: true;
  generatedAt: string;
};

