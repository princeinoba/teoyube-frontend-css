import type { TeoyubePreviewDeploymentIssue } from "./preview-deployment-execution-contracts";
import type { TeoyubePreviewDeploymentIssueLog } from "./preview-deployment-issue-log";
import { getPreviewDeploymentBlockingIssues, getPreviewDeploymentIssueWarnings } from "./preview-deployment-issue-log";

const criticalCategories: TeoyubePreviewDeploymentIssue["category"][] = [
  "scripture_anchor",
  "explanation_path",
  "fallback",
  "consent",
  "mobile_ui",
  "accessibility",
  "build",
  "environment",
  "security"
];

export function getCriticalPreviewIssues(issueLog: TeoyubePreviewDeploymentIssueLog): TeoyubePreviewDeploymentIssue[] {
  return issueLog.issues.filter(
    (issue) =>
      issue.status !== "resolved" &&
      (issue.severity === "critical" || issue.severity === "high" || criticalCategories.includes(issue.category))
  );
}

export function getPreviewIssuesByCategory(
  issueLog: TeoyubePreviewDeploymentIssueLog,
  category: TeoyubePreviewDeploymentIssue["category"]
): TeoyubePreviewDeploymentIssue[] {
  return issueLog.issues.filter((issue) => issue.category === category);
}

export function getPreviewIssuesBySurface(issueLog: TeoyubePreviewDeploymentIssueLog, surface: string): TeoyubePreviewDeploymentIssue[] {
  const normalized = surface.toLowerCase();
  return issueLog.issues.filter((issue) => `${issue.title} ${issue.details}`.toLowerCase().includes(normalized));
}

export function triagePreviewDeploymentIssues(issueLog: TeoyubePreviewDeploymentIssueLog) {
  const criticalIssues = getCriticalPreviewIssues(issueLog);
  const blockingIssues = getPreviewDeploymentBlockingIssues(issueLog);
  const warningIssues = getPreviewDeploymentIssueWarnings(issueLog);

  return {
    valid: criticalIssues.length === 0 && blockingIssues.length === 0,
    criticalIssues,
    blockingIssues,
    warningIssues,
    priorityOrder: [
      "Missing Scripture anchors",
      "Missing explanation paths",
      "Unsafe fallback behavior",
      "Missing consent controls",
      "Exposed debug output",
      "Mobile layout blockers",
      "Accessibility blockers",
      "Build failures",
      "Environment safety failures",
      "Accidental external analytics",
      "Accidental persistence enablement",
      "Accidental live AI orchestration"
    ]
  };
}

export function createPreviewIssueResolutionPlan(issueLog: TeoyubePreviewDeploymentIssueLog) {
  const triage = triagePreviewDeploymentIssues(issueLog);

  return {
    requiredActions: [...triage.criticalIssues, ...triage.blockingIssues].map((issue) => issue.recommendedAction),
    warningActions: triage.warningIssues.map((issue) => issue.recommendedAction),
    notes: [
      "Resolve Scripture, explanation, fallback, consent, debug, mobile, accessibility, build, environment, analytics, persistence, and live AI issues before soft-launch candidacy.",
      "This resolution plan is in-memory only."
    ]
  };
}

export function createPreviewIssueTriageReport(issueLog: TeoyubePreviewDeploymentIssueLog) {
  const triage = triagePreviewDeploymentIssues(issueLog);
  const resolutionPlan = createPreviewIssueResolutionPlan(issueLog);

  return {
    ...triage,
    issueCount: issueLog.issues.length,
    resolutionPlan,
    generatedAt: new Date().toISOString()
  };
}

