import type {
  TeoyubeManualPreviewIssue,
  TeoyubeManualPreviewIssueCategory,
  TeoyubeManualPreviewIssueSeverity,
  TeoyubeManualPreviewIssueTriageResult
} from "./manual-preview-issue-triage-contracts";

const CATEGORY_RULES: Array<{ category: TeoyubeManualPreviewIssueCategory; patterns: string[] }> = [
  { category: "scripture_anchor", patterns: ["scripture", "anchor", "verse", "reference"] },
  { category: "explanation_path", patterns: ["explanation", "trace", "decision path", "graph path", "why teoyube"] },
  { category: "fallback", patterns: ["fallback", "empty response", "unsafe response", "blank response"] },
  { category: "consent", patterns: ["consent", "permission", "opt in", "opt-in"] },
  { category: "privacy", patterns: ["raw sensitive", "sensitive text", "private text", "stored raw"] },
  { category: "debug_safety", patterns: ["debug", "payload", "stack trace", "internal state"] },
  { category: "security", patterns: ["secret", "token", "key exposed", "credential"] },
  { category: "mobile_ui", patterns: ["mobile", "overflow", "responsive", "small screen", "touch"] },
  { category: "accessibility", patterns: ["accessibility", "keyboard", "screen reader", "contrast", "focus"] },
  { category: "environment", patterns: ["environment", "env", "analytics sending", "persistence enabled", "live ai"] },
  { category: "build", patterns: ["build", "compile", "typescript", "lint", "test failed"] },
  { category: "route", patterns: ["route", "404", "page crash", "blank page", "not found"] },
  { category: "confidence", patterns: ["confidence", "overstated", "certainty"] },
  { category: "feedback_controls", patterns: ["feedback", "thumbs", "rating"] },
  { category: "personalization", patterns: ["personalization", "hidden memory", "preference"] },
  { category: "offline", patterns: ["offline", "network unavailable", "read only", "read-only"] },
  { category: "performance", patterns: ["slow", "performance", "timeout", "lag"] },
  { category: "content_clarity", patterns: ["unclear", "confusing", "copy", "wording"] },
  { category: "tig_response", patterns: ["tig", "response panel", "promise cluster", "ai companion"] }
];

const LAUNCH_CRITICAL_CATEGORIES: TeoyubeManualPreviewIssueCategory[] = [
  "scripture_anchor",
  "explanation_path",
  "fallback",
  "consent",
  "privacy",
  "debug_safety",
  "security",
  "mobile_ui",
  "accessibility",
  "route",
  "environment",
  "build"
];

function haystack(issue: TeoyubeManualPreviewIssue): string {
  return [
    issue.title,
    issue.details,
    issue.recommendedAction,
    issue.surface,
    issue.route,
    ...(issue.evidence || [])
  ].filter(Boolean).join(" ").toLowerCase();
}

function includesAny(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern));
}

export function getManualPreviewIssueCategory(issue: TeoyubeManualPreviewIssue): TeoyubeManualPreviewIssueCategory {
  if (issue.category && issue.category !== "unknown") return issue.category;
  const text = haystack(issue);
  const rule = CATEGORY_RULES.find((entry) => includesAny(text, entry.patterns));
  return rule?.category || "unknown";
}

export function getManualPreviewIssueSeverity(issue: TeoyubeManualPreviewIssue): TeoyubeManualPreviewIssueSeverity {
  if (issue.severity && issue.severity !== "unknown") return issue.severity;
  const text = haystack(issue);
  const category = getManualPreviewIssueCategory(issue);

  if (
    includesAny(text, [
      "critical",
      "blank page",
      "page crash",
      "crash",
      "raw sensitive",
      "debug payload",
      "secret",
      "external analytics",
      "production persistence",
      "live ai orchestration"
    ])
  ) {
    return "critical";
  }

  if (LAUNCH_CRITICAL_CATEGORIES.includes(category) || includesAny(text, ["missing", "unsafe", "fail", "blocked", "overflow"])) {
    return "high";
  }

  if (includesAny(text, ["warning", "review", "unclear", "slow"])) return "medium";
  return "low";
}

export function isSafetyCriticalManualPreviewIssue(issue: TeoyubeManualPreviewIssue): boolean {
  if (issue.safetyCritical) return true;
  const category = getManualPreviewIssueCategory(issue);
  const text = haystack(issue);

  return (
    ["scripture_anchor", "explanation_path", "fallback", "consent", "privacy", "debug_safety", "security", "confidence"].includes(category) ||
    includesAny(text, [
      "missing scripture anchor",
      "missing explanation path",
      "unsafe fallback",
      "empty fallback",
      "raw sensitive",
      "debug payload",
      "external analytics",
      "production persistence",
      "live ai orchestration",
      "divine certainty"
    ])
  );
}

export function isLaunchCriticalManualPreviewIssue(issue: TeoyubeManualPreviewIssue): boolean {
  if (issue.launchCritical) return true;
  const severity = getManualPreviewIssueSeverity(issue);
  const category = getManualPreviewIssueCategory(issue);
  const text = haystack(issue);

  return (
    severity === "critical" ||
    LAUNCH_CRITICAL_CATEGORIES.includes(category) ||
    includesAny(text, [
      "missing scripture anchor",
      "missing explanation path",
      "unsafe fallback",
      "empty fallback",
      "consent controls missing",
      "raw sensitive text",
      "debug payload visible",
      "external analytics unexpectedly sending",
      "production persistence unexpectedly enabled",
      "live ai orchestration unexpectedly enabled",
      "broken mobile layout",
      "critical accessibility",
      "page crash",
      "blank state"
    ])
  );
}

export function isSoftLaunchBlockingIssue(issue: TeoyubeManualPreviewIssue): boolean {
  if (issue.softLaunchBlocking) return true;
  const severity = getManualPreviewIssueSeverity(issue);
  return severity === "critical" || severity === "high" || isLaunchCriticalManualPreviewIssue(issue);
}

function priorityFromIssue(issue: TeoyubeManualPreviewIssue): number {
  const severity = getManualPreviewIssueSeverity(issue);
  const category = getManualPreviewIssueCategory(issue);
  const severityScore = severity === "critical" ? 100 : severity === "high" ? 80 : severity === "medium" ? 50 : severity === "low" ? 20 : 10;
  const safetyScore = isSafetyCriticalManualPreviewIssue(issue) ? 20 : 0;
  const categoryScore = ["scripture_anchor", "explanation_path", "fallback", "consent", "privacy", "debug_safety", "security"].includes(category) ? 10 : 0;

  return severityScore + safetyScore + categoryScore;
}

export function classifyManualPreviewIssue(issue: TeoyubeManualPreviewIssue): TeoyubeManualPreviewIssueTriageResult {
  const category = getManualPreviewIssueCategory(issue);
  const severity = getManualPreviewIssueSeverity(issue);
  const launchCritical = isLaunchCriticalManualPreviewIssue({ ...issue, category, severity });
  const safetyCritical = isSafetyCriticalManualPreviewIssue({ ...issue, category, severity });
  const softLaunchBlocking = isSoftLaunchBlockingIssue({ ...issue, category, severity });
  const deferrable = Boolean(issue.deferrable || (!softLaunchBlocking && severity !== "critical" && severity !== "high"));
  const recommendedAction =
    issue.recommendedAction ||
    (softLaunchBlocking
      ? "Resolve this issue before soft launch review."
      : "Review and schedule this issue after launch-critical blockers are resolved.");

  return {
    issueId: issue.id,
    issue,
    normalizedIssue: {
      ...issue,
      category,
      severity,
      status: issue.status || "triaged",
      launchCritical,
      safetyCritical,
      softLaunchBlocking,
      deferrable,
      recommendedAction
    },
    category,
    severity,
    launchCritical,
    safetyCritical,
    softLaunchBlocking,
    deferrable,
    priority: priorityFromIssue({ ...issue, category, severity }),
    reasons: [
      `Category classified as ${category}.`,
      `Severity classified as ${severity}.`,
      launchCritical ? "Issue is launch-critical." : "Issue is not launch-critical by default.",
      softLaunchBlocking ? "Issue blocks soft launch review." : "Issue can be reviewed after higher-priority blockers."
    ],
    recommendedAction
  };
}

export function createManualPreviewIssueClassificationReport(issues: TeoyubeManualPreviewIssue[]) {
  const triagedIssues = issues.map(classifyManualPreviewIssue);

  return {
    valid: true,
    issueCount: issues.length,
    launchCriticalCount: triagedIssues.filter((issue) => issue.launchCritical).length,
    safetyCriticalCount: triagedIssues.filter((issue) => issue.safetyCritical).length,
    softLaunchBlockingCount: triagedIssues.filter((issue) => issue.softLaunchBlocking).length,
    triagedIssues,
    generatedAt: new Date().toISOString()
  };
}
