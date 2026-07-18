import type {
  TeoyubeBetaIssueCategory,
  TeoyubeBetaIssueSeverity
} from "./beta-issue-intake-plan";

export type TeoyubeBetaIssueStatus =
  | "open"
  | "triaged"
  | "fix_queued"
  | "resolved"
  | "deferred"
  | "blocked"
  | "unknown";

export type TeoyubeBetaIssueSource =
  | "manual_qa"
  | "real_data_qa"
  | "user_journey_qa"
  | "scripture_explanation_fallback_qa"
  | "mobile_accessibility_qa"
  | "reviewed_content_gate_qa"
  | "controlled_admin_qa"
  | "disabled_service_qa"
  | "owner_review"
  | "support_note"
  | "unknown";

export type TeoyubeBetaIssueTriageDecision =
  | "block_beta"
  | "queue_fix"
  | "owner_review"
  | "monitor"
  | "resolved"
  | "unknown";

export type TeoyubeBetaIssueRecommendedAction = {
  id: string;
  issueId: string;
  decision: TeoyubeBetaIssueTriageDecision;
  label: string;
  details: string;
  nextStep: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA" | "Owner review" | "Manual monitoring";
};

export type TeoyubeBetaIssue = {
  id: string;
  title: string;
  description: string;
  category: TeoyubeBetaIssueCategory;
  severity: TeoyubeBetaIssueSeverity;
  status: TeoyubeBetaIssueStatus;
  source: TeoyubeBetaIssueSource;
  surface: string;
  evidence: string[];
  manuallyReported: true;
  containsSensitiveText: false;
  createdAt: string;
  updatedAt?: string;
};

export type TeoyubeBetaIssueTriageBlocker = {
  id: string;
  issueId: string;
  category: TeoyubeBetaIssueCategory;
  severity: TeoyubeBetaIssueSeverity;
  message: string;
  requiredAction: string;
};

export type TeoyubeBetaIssueTriageWarning = {
  id: string;
  issueId: string;
  category: TeoyubeBetaIssueCategory;
  severity: TeoyubeBetaIssueSeverity;
  message: string;
  recommendedAction: string;
};

export type TeoyubeBetaIssueTriageReport = {
  valid: boolean;
  decision: TeoyubeBetaIssueTriageDecision;
  issues: TeoyubeBetaIssue[];
  blockingIssues: TeoyubeBetaIssue[];
  blockers: TeoyubeBetaIssueTriageBlocker[];
  warnings: TeoyubeBetaIssueTriageWarning[];
  recommendedActions: TeoyubeBetaIssueRecommendedAction[];
  manualOnly: true;
  noAutomaticCollection: true;
  noUsersContacted: true;
  noExternalSend: true;
  inMemoryOnly: true;
  generatedAt: string;
};
