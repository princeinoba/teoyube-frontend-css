import type {
  TeoyubeBetaIssueCategory,
  TeoyubeBetaIssueSeverity
} from "./beta-issue-intake-plan";
import type {
  TeoyubeBetaIssue,
  TeoyubeBetaIssueRecommendedAction,
  TeoyubeBetaIssueSource,
  TeoyubeBetaIssueStatus,
  TeoyubeBetaIssueTriageBlocker,
  TeoyubeBetaIssueTriageDecision,
  TeoyubeBetaIssueTriageReport,
  TeoyubeBetaIssueTriageWarning
} from "./beta-issue-triage-execution-contracts";

const BLOCKING_CATEGORIES: TeoyubeBetaIssueCategory[] = [
  "app_not_loading",
  "scripture_anchor_missing",
  "explanation_trace_missing",
  "unsafe_fallback",
  "review_only_content_visible",
  "privacy_consent_issue",
  "disabled_service_issue",
  "debug_payload_visible",
  "divine_certainty_language",
  "professional_advice_language"
];

const CATEGORY_SEVERITY: Partial<Record<TeoyubeBetaIssueCategory, TeoyubeBetaIssueSeverity>> = {
  app_not_loading: "critical",
  real_data_failure: "high",
  user_journey_failure: "high",
  scripture_anchor_missing: "high",
  explanation_trace_missing: "high",
  unsafe_fallback: "critical",
  confidence_label_missing: "medium",
  review_only_content_visible: "critical",
  privacy_consent_issue: "critical",
  mobile_issue: "medium",
  accessibility_issue: "medium",
  admin_prototype_issue: "high",
  disabled_service_issue: "critical",
  debug_payload_visible: "critical",
  divine_certainty_language: "critical",
  professional_advice_language: "critical",
  performance_issue: "medium",
  content_clarity: "low",
  unknown: "unknown"
};

function now(): string {
  return new Date().toISOString();
}

function textForIssue(issue: Pick<TeoyubeBetaIssue, "title" | "description">): string {
  return `${issue.title} ${issue.description}`.toLowerCase();
}

export function classifyBetaIssue(issue: Pick<TeoyubeBetaIssue, "title" | "description" | "category">): TeoyubeBetaIssueCategory {
  if (issue.category && issue.category !== "unknown") return issue.category;
  const text = textForIssue(issue);
  if (text.includes("scripture") || text.includes("anchor")) return "scripture_anchor_missing";
  if (text.includes("explanation") || text.includes("trace")) return "explanation_trace_missing";
  if (text.includes("fallback")) return "unsafe_fallback";
  if (text.includes("confidence")) return "confidence_label_missing";
  if (text.includes("review-only") || text.includes("draft")) return "review_only_content_visible";
  if (text.includes("privacy") || text.includes("consent")) return "privacy_consent_issue";
  if (text.includes("analytics") || text.includes("database") || text.includes("service") || text.includes("live ai")) return "disabled_service_issue";
  if (text.includes("debug")) return "debug_payload_visible";
  if (text.includes("god told") || text.includes("god guarantees") || text.includes("divine certainty")) return "divine_certainty_language";
  if (text.includes("medical advice") || text.includes("legal advice") || text.includes("financial advice") || text.includes("diagnose")) return "professional_advice_language";
  if (text.includes("mobile")) return "mobile_issue";
  if (text.includes("accessibility") || text.includes("keyboard")) return "accessibility_issue";
  if (text.includes("admin")) return "admin_prototype_issue";
  if (text.includes("data")) return "real_data_failure";
  if (text.includes("journey")) return "user_journey_failure";
  if (text.includes("load")) return "app_not_loading";
  return "unknown";
}

export function getBetaIssueSeverity(issue: Pick<TeoyubeBetaIssue, "category" | "severity">): TeoyubeBetaIssueSeverity {
  if (issue.severity && issue.severity !== "unknown") return issue.severity;
  return CATEGORY_SEVERITY[issue.category] || "unknown";
}

export function createBetaIssue(input: {
  id?: string;
  title: string;
  description?: string;
  category?: TeoyubeBetaIssueCategory;
  severity?: TeoyubeBetaIssueSeverity;
  status?: TeoyubeBetaIssueStatus;
  source?: TeoyubeBetaIssueSource;
  surface?: string;
  evidence?: string[];
}): TeoyubeBetaIssue {
  const base = {
    title: input.title,
    description: input.description || "",
    category: input.category || "unknown"
  };
  const category = classifyBetaIssue(base);
  return {
    id: input.id || `beta_issue_${category}_${Date.now()}`,
    title: input.title,
    description: input.description || "",
    category,
    severity: getBetaIssueSeverity({ category, severity: input.severity || "unknown" }),
    status: input.status || "open",
    source: input.source || "manual_qa",
    surface: input.surface || "unknown",
    evidence: input.evidence || [],
    manuallyReported: true,
    containsSensitiveText: false,
    createdAt: now()
  };
}

export function isBetaBlockingIssue(issue: TeoyubeBetaIssue): boolean {
  return issue.status !== "resolved" && (issue.severity === "critical" || BLOCKING_CATEGORIES.includes(issue.category));
}

export function getBetaIssueRecommendedAction(issue: TeoyubeBetaIssue): TeoyubeBetaIssueRecommendedAction {
  if (isBetaBlockingIssue(issue)) {
    return {
      id: `${issue.id}_block_beta`,
      issueId: issue.id,
      decision: "block_beta",
      label: "Block beta readiness",
      details: "Move this issue into Phase 5.3 remediation before beta execution.",
      nextStep: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA"
    };
  }
  if (["high", "medium"].includes(issue.severity)) {
    return {
      id: `${issue.id}_queue_fix`,
      issueId: issue.id,
      decision: "queue_fix",
      label: "Queue fix",
      details: "Track this issue in the manual fix queue and regression list.",
      nextStep: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA"
    };
  }
  return {
    id: `${issue.id}_monitor`,
    issueId: issue.id,
    decision: issue.status === "resolved" ? "resolved" : "monitor",
    label: issue.status === "resolved" ? "Resolved" : "Monitor manually",
    details: "No automatic contact, storage, or analytics should be used for this issue.",
    nextStep: issue.status === "resolved" ? "Owner review" : "Manual monitoring"
  };
}

export function getBetaBlockingIssues(issues: TeoyubeBetaIssue[]): TeoyubeBetaIssue[] {
  return issues.filter(isBetaBlockingIssue);
}

export function getBetaIssueTriageWarnings(issues: TeoyubeBetaIssue[]): TeoyubeBetaIssueTriageWarning[] {
  return issues
    .filter((issue) => !isBetaBlockingIssue(issue) && issue.status !== "resolved")
    .map((issue) => ({
      id: `${issue.id}_warning`,
      issueId: issue.id,
      category: issue.category,
      severity: issue.severity,
      message: `${issue.title} needs manual triage follow-up.`,
      recommendedAction: getBetaIssueRecommendedAction(issue).details
    }));
}

export function triageBetaIssues(issues: TeoyubeBetaIssue[]): TeoyubeBetaIssue[] {
  return issues.map((issue) => ({
    ...issue,
    category: classifyBetaIssue(issue),
    severity: getBetaIssueSeverity(issue),
    status: issue.status === "open" ? (isBetaBlockingIssue(issue) ? "blocked" : "triaged") : issue.status,
    updatedAt: now()
  }));
}

export function createBetaIssueTriageDecision(issues: TeoyubeBetaIssue[]): TeoyubeBetaIssueTriageDecision {
  const triaged = triageBetaIssues(issues);
  if (getBetaBlockingIssues(triaged).length) return "block_beta";
  if (triaged.some((issue) => ["high", "medium"].includes(issue.severity) && issue.status !== "resolved")) return "queue_fix";
  if (triaged.some((issue) => issue.status !== "resolved")) return "owner_review";
  return issues.length ? "resolved" : "monitor";
}

export function createBetaIssueTriageExecutionReport(issues: TeoyubeBetaIssue[] = []): TeoyubeBetaIssueTriageReport {
  const triaged = triageBetaIssues(issues);
  const blockingIssues = getBetaBlockingIssues(triaged);
  const blockers: TeoyubeBetaIssueTriageBlocker[] = blockingIssues.map((issue) => ({
    id: `${issue.id}_blocker`,
    issueId: issue.id,
    category: issue.category,
    severity: issue.severity,
    message: `${issue.title} blocks beta readiness.`,
    requiredAction: getBetaIssueRecommendedAction(issue).details
  }));
  const warnings = getBetaIssueTriageWarnings(triaged);
  return {
    valid: blockers.length === 0,
    decision: createBetaIssueTriageDecision(triaged),
    issues: triaged,
    blockingIssues,
    blockers,
    warnings,
    recommendedActions: triaged.map(getBetaIssueRecommendedAction),
    manualOnly: true,
    noAutomaticCollection: true,
    noUsersContacted: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}
