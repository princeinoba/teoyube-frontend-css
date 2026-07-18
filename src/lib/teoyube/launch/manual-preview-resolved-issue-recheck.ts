import type { TeoyubeManualPreviewIssue } from "./manual-preview-issue-triage-contracts";
import type {
  TeoyubeManualPreviewIssueResolutionVerificationItem
} from "./manual-preview-issue-resolution-verification";
import type {
  TeoyubeManualPreviewRegressionResult,
  TeoyubeManualPreviewRegressionRun
} from "./manual-preview-regression-verification-contracts";

export type TeoyubeResolvedIssueRecheckResult = {
  issueId: string;
  issue: TeoyubeManualPreviewIssue;
  passed: boolean;
  ownerReviewPresent: boolean;
  approvedManualResolution: boolean;
  regressionResults: TeoyubeManualPreviewRegressionResult[];
  blockers: string[];
  warnings: string[];
  checkedAt: string;
};

export type TeoyubeResolvedIssueRecheckReport = {
  valid: boolean;
  resultCount: number;
  passedCount: number;
  blockerCount: number;
  warningCount: number;
  results: TeoyubeResolvedIssueRecheckResult[];
  blockers: string[];
  warnings: string[];
  noExternalWrite: true;
  generatedAt: string;
};

export type TeoyubeResolvedIssueResolutionLike = TeoyubeManualPreviewIssueResolutionVerificationItem & {
  ownerReviewPresent?: boolean;
  approvedManualResolution?: boolean;
};

function issueRequiresOwnerReview(issue: TeoyubeManualPreviewIssue): boolean {
  return Boolean(issue.launchCritical || issue.safetyCritical || issue.softLaunchBlocking || issue.severity === "critical");
}

function regressionPassed(results: TeoyubeManualPreviewRegressionResult[]): boolean {
  return results.length > 0 && results.every((result) => result.status === "pass" || result.status === "warning");
}

function safetyWeakened(resolution: TeoyubeResolvedIssueResolutionLike | undefined): boolean {
  const text = [
    resolution?.fixResult?.fixSummary || "",
    resolution?.fixResult?.skippedReason || "",
    resolution?.fixResult?.blockedReason || ""
  ].join(" ").toLowerCase();

  return /remove scripture|hide scripture|remove explanation|hide explanation|disable fallback|weaken fallback|hide consent|enable external analytics|connect database|enable live ai|connect openai/.test(text);
}

export function getResolvedIssueRecheckChecklist(): string[] {
  return [
    "Issue has a fix result or approved manual resolution.",
    "Required regression checks passed or warnings are documented.",
    "Scripture anchor requirement was not removed.",
    "Explanation path requirement was not removed.",
    "Fallback safety was not weakened.",
    "Consent control was not hidden.",
    "Restricted services were not enabled.",
    "Owner review is present when required."
  ];
}

export function verifyResolvedPreviewIssue(
  issue: TeoyubeManualPreviewIssue,
  resolution: TeoyubeResolvedIssueResolutionLike | undefined,
  regressionResults: TeoyubeManualPreviewRegressionResult[]
): TeoyubeResolvedIssueRecheckResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const ownerReviewPresent = resolution?.ownerReviewPresent === true;
  const approvedManualResolution = resolution?.approvedManualResolution === true;
  const hasFixOrManualResolution = Boolean(resolution?.fixResult || approvedManualResolution);

  if (!hasFixOrManualResolution) blockers.push("Issue has no fix result or approved manual resolution.");
  if (!regressionPassed(regressionResults)) blockers.push("Required regression checks have not passed or been warning-documented.");
  if (safetyWeakened(resolution)) blockers.push("Resolution may weaken Scripture, explanation, fallback, consent, or provider boundaries.");
  if (issueRequiresOwnerReview(issue) && !ownerReviewPresent) blockers.push("Owner review is required for this issue.");
  if (regressionResults.some((result) => result.status === "warning")) warnings.push("Regression passed with warnings and needs owner acknowledgement.");

  return {
    issueId: issue.id,
    issue,
    passed: blockers.length === 0,
    ownerReviewPresent,
    approvedManualResolution,
    regressionResults,
    blockers,
    warnings,
    checkedAt: new Date().toISOString()
  };
}

export function verifyResolvedPreviewIssues(
  issues: TeoyubeManualPreviewIssue[],
  resolutions: TeoyubeResolvedIssueResolutionLike[],
  regressionRun: TeoyubeManualPreviewRegressionRun
): TeoyubeResolvedIssueRecheckReport {
  const results = issues.map((issue) => {
    const resolution = resolutions.find((entry) => entry.issueId === issue.id);
    const regressionResults = regressionRun.results.filter((result) =>
      result.relatedIssueId === issue.id || result.relatedFixResultId === resolution?.fixResult?.id
    );

    return verifyResolvedPreviewIssue(issue, resolution, regressionResults);
  });

  return createResolvedIssueRecheckReport(results);
}

export function getResolvedIssueRecheckBlockers(results: TeoyubeResolvedIssueRecheckResult[]): string[] {
  return results.flatMap((result) => result.blockers.map((blocker) => `${result.issueId}: ${blocker}`));
}

export function getResolvedIssueRecheckWarnings(results: TeoyubeResolvedIssueRecheckResult[]): string[] {
  return results.flatMap((result) => result.warnings.map((warning) => `${result.issueId}: ${warning}`));
}

export function createResolvedIssueRecheckReport(results: TeoyubeResolvedIssueRecheckResult[]): TeoyubeResolvedIssueRecheckReport {
  const blockers = getResolvedIssueRecheckBlockers(results);
  const warnings = getResolvedIssueRecheckWarnings(results);

  return {
    valid: blockers.length === 0,
    resultCount: results.length,
    passedCount: results.filter((result) => result.passed).length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    results,
    blockers,
    warnings,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
