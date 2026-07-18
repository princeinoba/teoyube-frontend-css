import {
  classifyManualPreviewIssue,
  isSoftLaunchBlockingIssue
} from "./manual-preview-issue-classifier";
import type {
  TeoyubeManualPreviewIssue,
  TeoyubeManualPreviewIssueCategory,
  TeoyubeManualPreviewIssueTriageReport,
  TeoyubeManualPreviewIssueTriageResult
} from "./manual-preview-issue-triage-contracts";

function groupBy<T>(items: T[], getKey: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = getKey(item) || "unknown";
    return {
      ...groups,
      [key]: [...(groups[key] || []), item]
    };
  }, {});
}

export function prioritizeManualPreviewIssues(issues: TeoyubeManualPreviewIssue[]): TeoyubeManualPreviewIssueTriageResult[] {
  return issues
    .map(classifyManualPreviewIssue)
    .sort((a, b) => b.priority - a.priority || a.issueId.localeCompare(b.issueId));
}

export function triageManualPreviewIssues(issues: TeoyubeManualPreviewIssue[]): TeoyubeManualPreviewIssueTriageResult[] {
  return prioritizeManualPreviewIssues(issues);
}

export function getCriticalManualPreviewIssues(issues: TeoyubeManualPreviewIssue[]): TeoyubeManualPreviewIssueTriageResult[] {
  return prioritizeManualPreviewIssues(issues).filter((issue) => issue.severity === "critical" || issue.launchCritical);
}

export function getManualPreviewIssuesByCategory(
  issues: TeoyubeManualPreviewIssue[],
  category: TeoyubeManualPreviewIssueCategory
): TeoyubeManualPreviewIssueTriageResult[] {
  return prioritizeManualPreviewIssues(issues).filter((issue) => issue.category === category);
}

export function getManualPreviewIssuesBySurface(
  issues: TeoyubeManualPreviewIssue[],
  surface: string
): TeoyubeManualPreviewIssueTriageResult[] {
  const normalized = surface.toLowerCase();
  return prioritizeManualPreviewIssues(issues).filter((issue) =>
    `${issue.issue.surface || ""} ${issue.issue.title} ${issue.issue.details}`.toLowerCase().includes(normalized)
  );
}

export function getManualPreviewIssueBlockers(issues: TeoyubeManualPreviewIssue[]): TeoyubeManualPreviewIssueTriageResult[] {
  return prioritizeManualPreviewIssues(issues).filter((issue) => issue.softLaunchBlocking);
}

export function getManualPreviewIssueWarnings(issues: TeoyubeManualPreviewIssue[]): TeoyubeManualPreviewIssueTriageResult[] {
  return prioritizeManualPreviewIssues(issues).filter((issue) => !issue.softLaunchBlocking && !issue.deferrable);
}

export function createManualPreviewIssueTriageReport(issues: TeoyubeManualPreviewIssue[]): TeoyubeManualPreviewIssueTriageReport {
  const triagedIssues = prioritizeManualPreviewIssues(issues);
  const blockers = triagedIssues.filter((issue) => issue.softLaunchBlocking);
  const warnings = triagedIssues.filter((issue) => !issue.softLaunchBlocking && !issue.deferrable);
  const deferrableIssues = triagedIssues.filter((issue) => issue.deferrable);
  const safetyCriticalIssues = triagedIssues.filter((issue) => issue.safetyCritical);
  const softLaunchBlockers = triagedIssues.filter((issue) => isSoftLaunchBlockingIssue(issue.normalizedIssue));

  return {
    valid: blockers.length === 0,
    issueCount: issues.length,
    criticalCount: triagedIssues.filter((issue) => issue.severity === "critical").length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    deferrableCount: deferrableIssues.length,
    triagedIssues,
    groupedByCategory: groupBy(triagedIssues, (issue) => issue.category),
    groupedBySurface: groupBy(triagedIssues, (issue) => issue.issue.surface || "unknown"),
    blockers,
    warnings,
    safetyCriticalIssues,
    softLaunchBlockers,
    deferrableIssues,
    priorityOrder: triagedIssues,
    noExternalWrite: true,
    noPreviewUrlFetched: true,
    generatedAt: new Date().toISOString()
  };
}
