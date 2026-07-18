import type { TeoyubeManualFeedbackCategory } from "./manual-feedback-boundary-contracts";

export type TeoyubeControlledBetaIssueCategory =
  | "app_not_loading"
  | "scripture_anchor_missing"
  | "explanation_trace_missing"
  | "unsafe_fallback"
  | "confidence_label_missing"
  | "review_only_content_visible"
  | "privacy_consent_issue"
  | "disabled_service_accidentally_enabled"
  | "admin_prototype_persistence_detected"
  | "debug_payload_visible"
  | "critical_mobile_blocker"
  | "critical_accessibility_blocker"
  | "divine_certainty_language"
  | "professional_advice_language"
  | "manual_feedback"
  | "unknown";

export type TeoyubeControlledBetaIssueSeverity = "low" | "medium" | "high" | "critical" | "unknown";

export type TeoyubeControlledBetaIssue = {
  id: string;
  title: string;
  description: string;
  category: TeoyubeControlledBetaIssueCategory;
  severity: TeoyubeControlledBetaIssueSeverity;
  feedbackCategory?: TeoyubeManualFeedbackCategory;
  manuallyReported: true;
  status: "open" | "triaged" | "blocked" | "resolved";
  createdAt: string;
};

export type TeoyubeControlledBetaIssueEscalationRule = {
  id: string;
  category: TeoyubeControlledBetaIssueCategory;
  blocksBeta: boolean;
  action: string;
};

export type TeoyubeControlledBetaIssueIntakePlan = {
  id: string;
  categories: TeoyubeControlledBetaIssueCategory[];
  severityLevels: TeoyubeControlledBetaIssueSeverity[];
  escalationRules: TeoyubeControlledBetaIssueEscalationRule[];
  manualOnly: true;
  noAutomaticCollection: true;
  noUsersContacted: true;
  noExternalSend: true;
  inMemoryOnly: true;
};

export type TeoyubeControlledBetaIssueIntakeReport = {
  valid: boolean;
  plan: TeoyubeControlledBetaIssueIntakePlan;
  issues: TeoyubeControlledBetaIssue[];
  blockingIssues: TeoyubeControlledBetaIssue[];
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  noAutomaticCollection: true;
  noUsersContacted: true;
  noExternalSend: true;
  inMemoryOnly: true;
  generatedAt: string;
};

const BLOCKING_CATEGORIES: TeoyubeControlledBetaIssueCategory[] = [
  "app_not_loading",
  "scripture_anchor_missing",
  "explanation_trace_missing",
  "unsafe_fallback",
  "confidence_label_missing",
  "review_only_content_visible",
  "privacy_consent_issue",
  "disabled_service_accidentally_enabled",
  "admin_prototype_persistence_detected",
  "debug_payload_visible",
  "critical_mobile_blocker",
  "critical_accessibility_blocker",
  "divine_certainty_language",
  "professional_advice_language"
];

function now(): string {
  return new Date().toISOString();
}

export function getControlledBetaIssueCategories(): TeoyubeControlledBetaIssueCategory[] {
  return [...BLOCKING_CATEGORIES, "manual_feedback", "unknown"];
}

export function getControlledBetaIssueSeverityLevels(): TeoyubeControlledBetaIssueSeverity[] {
  return ["low", "medium", "high", "critical", "unknown"];
}

export function getControlledBetaIssueEscalationRules(): TeoyubeControlledBetaIssueEscalationRule[] {
  return getControlledBetaIssueCategories().map((category) => ({
    id: `${category}_escalation`,
    category,
    blocksBeta: BLOCKING_CATEGORIES.includes(category),
    action: BLOCKING_CATEGORIES.includes(category)
      ? "Block Phase 6.2 dry-run simulation until owner triage and safe fix review are complete."
      : "Track manually and review during owner checkpoint."
  }));
}

export function createControlledBetaIssueIntakePlan(): TeoyubeControlledBetaIssueIntakePlan {
  return {
    id: "phase_6_1_controlled_beta_issue_intake_plan",
    categories: getControlledBetaIssueCategories(),
    severityLevels: getControlledBetaIssueSeverityLevels(),
    escalationRules: getControlledBetaIssueEscalationRules(),
    manualOnly: true,
    noAutomaticCollection: true,
    noUsersContacted: true,
    noExternalSend: true,
    inMemoryOnly: true
  };
}

export function classifyControlledBetaIssue(issue: Pick<TeoyubeControlledBetaIssue, "title" | "description" | "category">): TeoyubeControlledBetaIssueCategory {
  if (issue.category && issue.category !== "unknown") return issue.category;
  const text = `${issue.title} ${issue.description}`.toLowerCase();
  if (text.includes("load")) return "app_not_loading";
  if (text.includes("scripture") || text.includes("anchor")) return "scripture_anchor_missing";
  if (text.includes("explanation") || text.includes("trace")) return "explanation_trace_missing";
  if (text.includes("fallback")) return "unsafe_fallback";
  if (text.includes("confidence")) return "confidence_label_missing";
  if (text.includes("review-only") || text.includes("draft")) return "review_only_content_visible";
  if (text.includes("privacy") || text.includes("consent")) return "privacy_consent_issue";
  if (text.includes("database") || text.includes("analytics") || text.includes("service enabled")) return "disabled_service_accidentally_enabled";
  if (text.includes("admin") && text.includes("persist")) return "admin_prototype_persistence_detected";
  if (text.includes("debug")) return "debug_payload_visible";
  if (text.includes("mobile")) return "critical_mobile_blocker";
  if (text.includes("accessibility") || text.includes("keyboard")) return "critical_accessibility_blocker";
  if (text.includes("god told") || text.includes("guarantees") || text.includes("divine certainty")) return "divine_certainty_language";
  if (text.includes("medical") || text.includes("legal") || text.includes("financial") || text.includes("diagnose")) return "professional_advice_language";
  if (text.includes("feedback")) return "manual_feedback";
  return "unknown";
}

export function getControlledBetaIssueSeverity(issue: Pick<TeoyubeControlledBetaIssue, "category" | "severity">): TeoyubeControlledBetaIssueSeverity {
  if (issue.severity && issue.severity !== "unknown") return issue.severity;
  if (BLOCKING_CATEGORIES.includes(issue.category)) return "critical";
  if (issue.category === "manual_feedback") return "medium";
  return "unknown";
}

export function createControlledBetaIssue(input: {
  id?: string;
  title: string;
  description?: string;
  category?: TeoyubeControlledBetaIssueCategory;
  severity?: TeoyubeControlledBetaIssueSeverity;
  feedbackCategory?: TeoyubeManualFeedbackCategory;
  status?: TeoyubeControlledBetaIssue["status"];
}): TeoyubeControlledBetaIssue {
  const category = classifyControlledBetaIssue({ title: input.title, description: input.description || "", category: input.category || "unknown" });
  const severity = getControlledBetaIssueSeverity({ category, severity: input.severity || "unknown" });
  return {
    id: input.id || `controlled_beta_issue_${category}`,
    title: input.title,
    description: input.description || "",
    category,
    severity,
    feedbackCategory: input.feedbackCategory,
    manuallyReported: true,
    status: input.status || (BLOCKING_CATEGORIES.includes(category) ? "blocked" : "triaged"),
    createdAt: now()
  };
}

export function isControlledBetaBlockingIssue(issue: TeoyubeControlledBetaIssue): boolean {
  return issue.status !== "resolved" && (issue.severity === "critical" || BLOCKING_CATEGORIES.includes(issue.category));
}

export function createControlledBetaIssueIntakeReport(issues: TeoyubeControlledBetaIssue[] = []): TeoyubeControlledBetaIssueIntakeReport {
  const normalizedIssues = issues.map((issue) => createControlledBetaIssue(issue));
  const blockingIssues = normalizedIssues.filter(isControlledBetaBlockingIssue);
  return {
    valid: blockingIssues.length === 0,
    plan: createControlledBetaIssueIntakePlan(),
    issues: normalizedIssues,
    blockingIssues,
    blockers: blockingIssues.map((issue) => `${issue.title} blocks controlled beta dry-run planning.`),
    warnings: normalizedIssues.filter((issue) => !isControlledBetaBlockingIssue(issue) && issue.status !== "resolved").map((issue) => `${issue.title} needs manual owner review.`),
    manualOnly: true,
    noAutomaticCollection: true,
    noUsersContacted: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

