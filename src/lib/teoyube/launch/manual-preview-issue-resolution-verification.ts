import type {
  TeoyubeManualPreviewIssue
} from "./manual-preview-issue-triage-contracts";
import type {
  TeoyubeManualPreviewRegressionResult,
  TeoyubeManualPreviewRegressionRun
} from "./manual-preview-regression-verification-contracts";
import type { TeoyubeManualPreviewSafeFixResult } from "./manual-preview-safe-fix-contracts";

export type TeoyubeManualPreviewIssueResolutionVerificationItem = {
  issueId: string;
  issue: TeoyubeManualPreviewIssue;
  verified: boolean;
  status: "resolved" | "unresolved" | "blocked" | "needs_more_testing";
  fixResult?: TeoyubeManualPreviewSafeFixResult;
  regressionResults: TeoyubeManualPreviewRegressionResult[];
  blockers: string[];
  warnings: string[];
  verifiedAt: string;
};

export type TeoyubeManualPreviewIssueResolutionVerificationReport = {
  valid: boolean;
  issueCount: number;
  resolvedCount: number;
  unresolvedCount: number;
  blockerCount: number;
  warningCount: number;
  items: TeoyubeManualPreviewIssueResolutionVerificationItem[];
  blockers: string[];
  warnings: string[];
  noExternalWrite: true;
  generatedAt: string;
};

function issueIsCritical(issue: TeoyubeManualPreviewIssue): boolean {
  return Boolean(issue.launchCritical || issue.safetyCritical || issue.softLaunchBlocking || issue.severity === "critical");
}

function resultPassed(result: TeoyubeManualPreviewRegressionResult): boolean {
  return result.status === "pass" || result.status === "warning";
}

function allRequiredRegressionPassed(
  issue: TeoyubeManualPreviewIssue,
  fixResult: TeoyubeManualPreviewSafeFixResult,
  regressionResults: TeoyubeManualPreviewRegressionResult[]
): boolean {
  const requiredChecks = fixResult.regressionChecksRequired.filter((check) => check.required);
  if (requiredChecks.length === 0) return !issueIsCritical(issue);

  return requiredChecks.every((check) =>
    regressionResults.some((result) =>
      result.checkId === check.id &&
      result.relatedFixResultId === fixResult.id &&
      resultPassed(result)
    )
  );
}

function safetyWeakened(fixResult: TeoyubeManualPreviewSafeFixResult): boolean {
  const summary = [
    fixResult.fixSummary,
    fixResult.blockedReason || "",
    fixResult.skippedReason || ""
  ].join(" ").toLowerCase();

  return /remove scripture|hide scripture|remove explanation|hide explanation|disable fallback|remove fallback|hide consent|remove consent|enable external analytics|connect database|enable live ai|connect openai/.test(summary);
}

export function verifyManualPreviewIssueResolution(
  issue: TeoyubeManualPreviewIssue,
  fixResult: TeoyubeManualPreviewSafeFixResult | undefined,
  regressionResults: TeoyubeManualPreviewRegressionResult[]
): TeoyubeManualPreviewIssueResolutionVerificationItem {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!fixResult) {
    blockers.push("No fix result exists for this issue.");
  }

  if (fixResult && !["applied", "verified"].includes(fixResult.status)) {
    blockers.push("Fix result is not applied or verified.");
  }

  if (fixResult && (fixResult.verificationStatus === "failed" || fixResult.verificationStatus === "blocked")) {
    blockers.push("Fix result verification failed or is blocked.");
  }

  if (fixResult && issueIsCritical(issue) && !allRequiredRegressionPassed(issue, fixResult, regressionResults)) {
    blockers.push("Launch-critical issue does not have all required regression checks passed or warning-documented.");
  }

  if (fixResult && safetyWeakened(fixResult)) {
    blockers.push("Fix summary indicates a launch safety guardrail may have been weakened.");
  }

  if (fixResult && fixResult.verificationStatus === "warning") {
    warnings.push("Fix result has warning-level verification and needs owner acknowledgement.");
  }

  const verified = blockers.length === 0 && Boolean(fixResult);

  return {
    issueId: issue.id,
    issue,
    verified,
    status: verified ? "resolved" : issueIsCritical(issue) ? "blocked" : "needs_more_testing",
    fixResult,
    regressionResults,
    blockers,
    warnings,
    verifiedAt: new Date().toISOString()
  };
}

export function verifyManualPreviewIssueResolutions(
  issues: TeoyubeManualPreviewIssue[],
  fixResults: TeoyubeManualPreviewSafeFixResult[],
  regressionRun: TeoyubeManualPreviewRegressionRun
): TeoyubeManualPreviewIssueResolutionVerificationReport {
  const items = issues.map((issue) => {
    const fixResult = fixResults.find((result) => result.issueId === issue.id);
    const regressionResults = regressionRun.results.filter((result) =>
      result.relatedIssueId === issue.id || result.relatedFixResultId === fixResult?.id
    );

    return verifyManualPreviewIssueResolution(issue, fixResult, regressionResults);
  });
  const blockers = getResolutionVerificationBlockers(items);
  const warnings = getResolutionVerificationWarnings(items);

  return {
    valid: blockers.length === 0,
    issueCount: issues.length,
    resolvedCount: getResolvedManualPreviewIssues(items).length,
    unresolvedCount: getUnresolvedManualPreviewIssues(items).length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    items,
    blockers,
    warnings,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function getResolvedManualPreviewIssues(
  verification: TeoyubeManualPreviewIssueResolutionVerificationItem[] | TeoyubeManualPreviewIssueResolutionVerificationReport
): TeoyubeManualPreviewIssueResolutionVerificationItem[] {
  const items = Array.isArray(verification) ? verification : verification.items;
  return items.filter((item) => item.verified);
}

export function getUnresolvedManualPreviewIssues(
  verification: TeoyubeManualPreviewIssueResolutionVerificationItem[] | TeoyubeManualPreviewIssueResolutionVerificationReport
): TeoyubeManualPreviewIssueResolutionVerificationItem[] {
  const items = Array.isArray(verification) ? verification : verification.items;
  return items.filter((item) => !item.verified);
}

export function getResolutionVerificationBlockers(
  verification: TeoyubeManualPreviewIssueResolutionVerificationItem[] | TeoyubeManualPreviewIssueResolutionVerificationReport
): string[] {
  const items = Array.isArray(verification) ? verification : verification.items;
  return items.flatMap((item) => item.blockers.map((blocker) => `${item.issueId}: ${blocker}`));
}

export function getResolutionVerificationWarnings(
  verification: TeoyubeManualPreviewIssueResolutionVerificationItem[] | TeoyubeManualPreviewIssueResolutionVerificationReport
): string[] {
  const items = Array.isArray(verification) ? verification : verification.items;
  return items.flatMap((item) => item.warnings.map((warning) => `${item.issueId}: ${warning}`));
}

export function createIssueResolutionVerificationReport(
  verification: TeoyubeManualPreviewIssueResolutionVerificationItem[] | TeoyubeManualPreviewIssueResolutionVerificationReport
): TeoyubeManualPreviewIssueResolutionVerificationReport {
  if (!Array.isArray(verification)) return verification;

  const blockers = getResolutionVerificationBlockers(verification);
  const warnings = getResolutionVerificationWarnings(verification);

  return {
    valid: blockers.length === 0,
    issueCount: verification.length,
    resolvedCount: getResolvedManualPreviewIssues(verification).length,
    unresolvedCount: getUnresolvedManualPreviewIssues(verification).length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    items: verification,
    blockers,
    warnings,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
