import type {
  TeoyubePublicIssue,
  TeoyubePublicIssueCategory,
  TeoyubePublicIssueRecommendedAction,
  TeoyubePublicIssueSeverity,
  TeoyubePublicIssueSource,
  TeoyubePublicIssueStatus,
  TeoyubePublicIssueTriageBlocker,
  TeoyubePublicIssueTriageDecision,
  TeoyubePublicIssueTriageReport,
  TeoyubePublicIssueTriageWarning
} from "./public-issue-triage-contracts";

const BLOCKING_CATEGORIES: TeoyubePublicIssueCategory[] = [
  "app_not_loading",
  "scripture_anchor_missing",
  "explanation_trace_missing",
  "unsafe_fallback",
  "confidence_label_missing",
  "review_only_content_visible",
  "privacy_consent_issue",
  "sensitive_information_exposure",
  "disabled_service_issue",
  "debug_payload_visible",
  "divine_certainty_language",
  "professional_advice_language"
];

export function createPublicIssue(input: Partial<TeoyubePublicIssue> & { title?: string } = {}): TeoyubePublicIssue {
  return {
    id: input.id || `public_issue_${input.category || "unknown"}`,
    title: input.title || "Public release candidate issue",
    category: input.category || "unknown",
    severity: input.severity || "medium",
    source: input.source || "manual_qa",
    status: input.status || "new",
    details: input.details || "Manually recorded candidate issue.",
    containsSensitiveInformation: input.containsSensitiveInformation === true,
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function classifyPublicIssue(issue: TeoyubePublicIssue): TeoyubePublicIssueCategory {
  return issue.category || "unknown";
}

export function getPublicIssueSeverity(issue: TeoyubePublicIssue): TeoyubePublicIssueSeverity {
  if (issue.severity && issue.severity !== "unknown") return issue.severity;
  return BLOCKING_CATEGORIES.includes(issue.category) ? "high" : "medium";
}

export function isPublicBlockingIssue(issue: TeoyubePublicIssue): boolean {
  if (issue.severity === "critical") return true;
  if (issue.category === "mobile_issue" || issue.category === "accessibility_issue") return issue.severity === "high";
  return BLOCKING_CATEGORIES.includes(issue.category);
}

export function getPublicIssueRecommendedAction(issue: TeoyubePublicIssue): TeoyubePublicIssueRecommendedAction {
  if (isPublicBlockingIssue(issue)) return "move_to_fix_queue";
  if (issue.category === "content_clarity" || issue.category === "performance_issue") return "monitor_manually";
  if (issue.status === "owner_review") return "owner_review_required";
  return "document_known_limitation";
}

export function triagePublicIssues(issues: TeoyubePublicIssue[]): TeoyubePublicIssue[] {
  return issues.map((issue) => ({
    ...issue,
    severity: getPublicIssueSeverity(issue),
    status: isPublicBlockingIssue(issue) ? "fix_queue" : "triaged"
  }));
}

export function getPublicBlockingIssues(issues: TeoyubePublicIssue[]): TeoyubePublicIssue[] {
  return triagePublicIssues(issues).filter(isPublicBlockingIssue);
}

export function getPublicIssueTriageWarnings(issues: TeoyubePublicIssue[]): TeoyubePublicIssueTriageWarning[] {
  return [
    { id: "public_issue_triage_manual_only", category: "unknown", message: "Public issue triage is manual and in-memory; it does not contact users, collect feedback automatically, persist issues, or send analytics.", recommendedAction: "monitor_manually" },
    ...issues.filter((issue) => issue.containsSensitiveInformation).map((issue) => ({ id: `${issue.id}_sensitive_warning`, issueId: issue.id, category: issue.category, message: "Issue is flagged as containing sensitive information and should be redacted manually.", recommendedAction: "owner_review_required" as const }))
  ];
}

export function createPublicIssueTriageDecision(issues: TeoyubePublicIssue[]): TeoyubePublicIssueTriageDecision {
  const blockingIssues = getPublicBlockingIssues(issues);
  if (blockingIssues.length) return "fix_queue_required";
  if (issues.some((issue) => issue.status === "owner_review")) return "owner_review_required";
  return getPublicIssueTriageWarnings(issues).length ? "ready_with_warnings" : "no_blocking_issues";
}

export function createPublicIssueTriageReport(issues: TeoyubePublicIssue[]): TeoyubePublicIssueTriageReport {
  const triagedIssues = triagePublicIssues(issues);
  const blockingIssues = triagedIssues.filter(isPublicBlockingIssue);
  const blockers: TeoyubePublicIssueTriageBlocker[] = blockingIssues.map((issue) => ({
    id: `${issue.id}_blocker`,
    issueId: issue.id,
    category: issue.category,
    severity: issue.severity,
    message: issue.details,
    recommendedAction: getPublicIssueRecommendedAction(issue)
  }));
  return {
    valid: blockers.length === 0,
    decision: createPublicIssueTriageDecision(triagedIssues),
    issues: triagedIssues,
    blockingIssues,
    blockers,
    warnings: getPublicIssueTriageWarnings(triagedIssues),
    noAutomaticFeedbackCollection: true,
    noAutomaticUserContact: true,
    noExternalPersistence: true,
    noAnalyticsEnabled: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export type TeoyubePublicIssueInput = Partial<TeoyubePublicIssue> & {
  category?: TeoyubePublicIssueCategory;
  severity?: TeoyubePublicIssueSeverity;
  source?: TeoyubePublicIssueSource;
  status?: TeoyubePublicIssueStatus;
};
