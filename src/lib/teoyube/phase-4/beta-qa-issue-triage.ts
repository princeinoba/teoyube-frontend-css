import type { TeoyubeBetaQaArea } from "./beta-qa-plan-contracts";

export type TeoyubeBetaQaIssueSeverity = "critical" | "high" | "medium" | "low";

export type TeoyubeBetaQaIssue = {
  id: string;
  area: TeoyubeBetaQaArea;
  title: string;
  description: string;
  tags: string[];
  status: "open" | "triaged" | "blocked" | "deferred" | "resolved";
  createdAt: string;
};

export type TeoyubeBetaQaIssueTriageReport = {
  valid: boolean;
  issues: TeoyubeBetaQaIssue[];
  blockingIssues: TeoyubeBetaQaIssue[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

const BLOCKING_PATTERNS = [
  "missing scripture",
  "scripture anchor missing",
  "missing explanation",
  "unsafe fallback",
  "divine certainty",
  "debug payload",
  "review-only content",
  "service enabled",
  "persisting data",
  "localstorage",
  "indexeddb",
  "cookie",
  "critical mobile",
  "critical accessibility",
  "privacy consent"
];

export function createBetaQaIssue(input: {
  id: string;
  area?: TeoyubeBetaQaArea;
  title: string;
  description: string;
  tags?: string[];
  status?: TeoyubeBetaQaIssue["status"];
}): TeoyubeBetaQaIssue {
  return {
    id: input.id,
    area: input.area || "unknown",
    title: input.title,
    description: input.description,
    tags: input.tags || [],
    status: input.status || "open",
    createdAt: new Date().toISOString()
  };
}

export function classifyBetaQaIssue(issue: TeoyubeBetaQaIssue): TeoyubeBetaQaArea {
  const text = `${issue.title} ${issue.description} ${issue.tags.join(" ")}`.toLowerCase();
  if (text.includes("scripture")) return "scripture_anchor";
  if (text.includes("explanation") || text.includes("trace")) return "explanation_trace";
  if (text.includes("privacy") || text.includes("consent")) return "privacy_consent";
  if (text.includes("mobile")) return "mobile";
  if (text.includes("accessibility") || text.includes("keyboard") || text.includes("focus")) return "accessibility";
  if (text.includes("admin")) return "admin_workflow_prototype";
  if (text.includes("service") || text.includes("database") || text.includes("analytics")) return "service_disabled_state";
  return issue.area;
}

export function isBetaQaBlockingIssue(issue: TeoyubeBetaQaIssue): boolean {
  const text = `${issue.title} ${issue.description} ${issue.tags.join(" ")}`.toLowerCase();
  return issue.status === "blocked" || BLOCKING_PATTERNS.some((pattern) => text.includes(pattern));
}

export function getBetaQaIssueSeverity(issue: TeoyubeBetaQaIssue): TeoyubeBetaQaIssueSeverity {
  if (isBetaQaBlockingIssue(issue)) return "critical";
  if (issue.tags.includes("high")) return "high";
  if (issue.tags.includes("low")) return "low";
  return "medium";
}

export function getBetaQaIssueRecommendedAction(issue: TeoyubeBetaQaIssue): string {
  if (isBetaQaBlockingIssue(issue)) {
    return "Pause beta readiness, fix the blocker, and rerun relevant Scripture, explanation, fallback, service-disabled, privacy, mobile, or accessibility checks.";
  }
  return "Triage manually and map the issue to a follow-up regression check before Phase 4.6.";
}

export function createBetaQaIssueTriageReport(issues: TeoyubeBetaQaIssue[] = []): TeoyubeBetaQaIssueTriageReport {
  const normalizedIssues = issues.map((issue) => ({ ...issue, area: classifyBetaQaIssue(issue) }));
  const blockingIssues = normalizedIssues.filter(isBetaQaBlockingIssue);
  return {
    valid: blockingIssues.length === 0,
    issues: normalizedIssues,
    blockingIssues,
    blockers: blockingIssues.map((issue) => `${issue.title}: ${getBetaQaIssueRecommendedAction(issue)}`),
    warnings: normalizedIssues
      .filter((issue) => !isBetaQaBlockingIssue(issue))
      .map((issue) => `${issue.title}: ${getBetaQaIssueRecommendedAction(issue)}`),
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
