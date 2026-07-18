import type {
  TeoyubeDryRunIssue,
  TeoyubeDryRunIssueCategory,
  TeoyubeDryRunIssueRecommendedAction,
  TeoyubeDryRunIssueSeverity,
  TeoyubeDryRunIssueSource,
  TeoyubeDryRunIssueTriageBlocker,
  TeoyubeDryRunIssueTriageDecision,
  TeoyubeDryRunIssueTriageReport,
  TeoyubeDryRunIssueTriageWarning
} from "./dry-run-issue-triage-contracts";

const BLOCKING_CATEGORIES: TeoyubeDryRunIssueCategory[] = [
  "scripture_anchor_missing",
  "explanation_trace_missing",
  "unsafe_fallback",
  "confidence_label_missing",
  "review_only_content_visible",
  "disabled_service_issue",
  "controlled_admin_issue",
  "privacy_consent_issue",
  "debug_payload_visible",
  "mobile_issue",
  "accessibility_issue",
  "divine_certainty_language",
  "professional_advice_language"
];

function now(): string {
  return new Date().toISOString();
}

function textFor(issue: Pick<TeoyubeDryRunIssue, "title" | "description">): string {
  return `${issue.title} ${issue.description}`.toLowerCase();
}

export function classifyDryRunIssue(issue: Pick<TeoyubeDryRunIssue, "title" | "description" | "category">): TeoyubeDryRunIssueCategory {
  if (issue.category && issue.category !== "unknown") return issue.category;
  const text = textFor(issue);
  if (text.includes("load")) return "app_not_loading";
  if (text.includes("instruction")) return "participant_instruction_gap";
  if (text.includes("feedback")) return "feedback_boundary_gap";
  if (text.includes("privacy") || text.includes("consent")) return "privacy_consent_issue";
  if (text.includes("scripture") || text.includes("anchor")) return "scripture_anchor_missing";
  if (text.includes("explanation") || text.includes("trace")) return "explanation_trace_missing";
  if (text.includes("fallback")) return "unsafe_fallback";
  if (text.includes("confidence")) return "confidence_label_missing";
  if (text.includes("review-only") || text.includes("draft")) return "review_only_content_visible";
  if (text.includes("database") || text.includes("analytics") || text.includes("service")) return "disabled_service_issue";
  if (text.includes("admin")) return "controlled_admin_issue";
  if (text.includes("debug")) return "debug_payload_visible";
  if (text.includes("mobile")) return "mobile_issue";
  if (text.includes("accessibility") || text.includes("keyboard")) return "accessibility_issue";
  if (text.includes("god told") || text.includes("guarantees") || text.includes("divine certainty")) return "divine_certainty_language";
  if (text.includes("medical") || text.includes("legal") || text.includes("financial") || text.includes("diagnose")) return "professional_advice_language";
  if (text.includes("clarity") || text.includes("confusing")) return "content_clarity";
  return "unknown";
}

export function getDryRunIssueSeverity(issue: Pick<TeoyubeDryRunIssue, "category" | "severity">): TeoyubeDryRunIssueSeverity {
  if (issue.severity && issue.severity !== "unknown") return issue.severity;
  if (["privacy_consent_issue", "disabled_service_issue", "unsafe_fallback", "review_only_content_visible", "debug_payload_visible", "divine_certainty_language", "professional_advice_language"].includes(issue.category)) return "critical";
  if (["scripture_anchor_missing", "explanation_trace_missing", "confidence_label_missing", "mobile_issue", "accessibility_issue", "controlled_admin_issue"].includes(issue.category)) return "high";
  if (["participant_instruction_gap", "feedback_boundary_gap", "content_clarity"].includes(issue.category)) return "medium";
  return "unknown";
}

export function createDryRunIssue(input: {
  id?: string;
  title: string;
  description?: string;
  category?: TeoyubeDryRunIssueCategory;
  severity?: TeoyubeDryRunIssueSeverity;
  source?: TeoyubeDryRunIssueSource;
  status?: TeoyubeDryRunIssue["status"];
}): TeoyubeDryRunIssue {
  const category = classifyDryRunIssue({ title: input.title, description: input.description || "", category: input.category || "unknown" });
  const severity = getDryRunIssueSeverity({ category, severity: input.severity || "unknown" });
  return {
    id: input.id || `dry_run_issue_${category}`,
    title: input.title,
    description: input.description || "",
    category,
    severity,
    source: input.source || "owner_observation",
    status: input.status || (isDryRunBlockingIssue({ category, severity, status: "open" } as TeoyubeDryRunIssue) ? "blocked" : "triaged"),
    simulatedOnly: true,
    createdAt: now()
  };
}

export function isDryRunBlockingIssue(issue: TeoyubeDryRunIssue): boolean {
  return issue.status !== "resolved" && (issue.severity === "critical" || BLOCKING_CATEGORIES.includes(issue.category));
}

export function getDryRunIssueRecommendedAction(issue: TeoyubeDryRunIssue): TeoyubeDryRunIssueRecommendedAction {
  if (isDryRunBlockingIssue(issue)) {
    return {
      id: `${issue.id}_block`,
      issueId: issue.id,
      decision: "dry_run_blocked",
      label: "Block dry-run readiness",
      details: "Route this issue to Phase 6.3 fix queue and stabilization before further dry-run readiness.",
      nextStep: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness"
    };
  }
  if (["high", "medium"].includes(issue.severity)) {
    return {
      id: `${issue.id}_queue`,
      issueId: issue.id,
      decision: "queue_for_phase_6_3",
      label: "Queue for Phase 6.3",
      details: "Track and stabilize this issue manually.",
      nextStep: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness"
    };
  }
  return {
    id: `${issue.id}_monitor`,
    issueId: issue.id,
    decision: issue.status === "resolved" ? "resolved" : "monitor",
    label: issue.status === "resolved" ? "Resolved" : "Monitor",
    details: "Monitor manually; do not send analytics or contact users.",
    nextStep: "Manual owner review"
  };
}

export function triageDryRunIssues(issues: TeoyubeDryRunIssue[]): TeoyubeDryRunIssue[] {
  return issues.map((issue) => {
    const category = classifyDryRunIssue(issue);
    const severity = getDryRunIssueSeverity({ category, severity: issue.severity });
    const normalized = { ...issue, category, severity, simulatedOnly: true as const };
    return {
      ...normalized,
      status: issue.status === "open" ? (isDryRunBlockingIssue(normalized) ? "blocked" : "triaged") : issue.status
    };
  });
}

export function getDryRunBlockingIssues(issues: TeoyubeDryRunIssue[]): TeoyubeDryRunIssue[] {
  return triageDryRunIssues(issues).filter(isDryRunBlockingIssue);
}

export function getDryRunIssueTriageWarnings(issues: TeoyubeDryRunIssue[]): TeoyubeDryRunIssueTriageWarning[] {
  return triageDryRunIssues(issues)
    .filter((issue) => !isDryRunBlockingIssue(issue) && issue.status !== "resolved")
    .map((issue) => ({
      id: `${issue.id}_warning`,
      issueId: issue.id,
      category: issue.category,
      severity: issue.severity,
      message: `${issue.title} needs manual follow-up.`,
      recommendedAction: getDryRunIssueRecommendedAction(issue).details
    }));
}

export function createDryRunIssueTriageDecision(issues: TeoyubeDryRunIssue[]): TeoyubeDryRunIssueTriageDecision {
  const triaged = triageDryRunIssues(issues);
  if (getDryRunBlockingIssues(triaged).length) return "dry_run_blocked";
  if (triaged.some((issue) => ["high", "medium"].includes(issue.severity) && issue.status !== "resolved")) return "queue_for_phase_6_3";
  if (triaged.some((issue) => issue.status !== "resolved")) return "owner_review";
  return issues.length ? "resolved" : "monitor";
}

export function createDryRunIssueTriageReport(issues: TeoyubeDryRunIssue[] = []): TeoyubeDryRunIssueTriageReport {
  const triaged = triageDryRunIssues(issues);
  const blockingIssues = getDryRunBlockingIssues(triaged);
  const blockers: TeoyubeDryRunIssueTriageBlocker[] = blockingIssues.map((issue) => ({
    id: `${issue.id}_blocker`,
    issueId: issue.id,
    category: issue.category,
    severity: issue.severity,
    message: `${issue.title} blocks dry-run readiness.`,
    requiredAction: getDryRunIssueRecommendedAction(issue).details
  }));
  return {
    valid: blockers.length === 0,
    decision: createDryRunIssueTriageDecision(triaged),
    issues: triaged,
    blockingIssues,
    blockers,
    warnings: getDryRunIssueTriageWarnings(triaged),
    recommendedActions: triaged.map(getDryRunIssueRecommendedAction),
    simulatedOnly: true,
    manualOnly: true,
    noAutomaticCollection: true,
    noUsersContacted: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

