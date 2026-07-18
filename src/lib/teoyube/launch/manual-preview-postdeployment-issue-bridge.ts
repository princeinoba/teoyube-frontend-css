import type { TeoyubePostDeploymentQaResult, TeoyubePostDeploymentQaRun } from "./manual-preview-postdeployment-qa-contracts";
import { addPreviewDeploymentIssue, type TeoyubePreviewDeploymentIssueLog } from "./preview-deployment-issue-log";
import type { TeoyubePreviewDeploymentIssue } from "./preview-deployment-execution-contracts";

type NewPreviewIssue = Omit<TeoyubePreviewDeploymentIssue, "createdAt" | "updatedAt">;

function categoryFromResult(result: TeoyubePostDeploymentQaResult): TeoyubePreviewDeploymentIssue["category"] {
  if (result.scriptureAnchorResult === "fail" || result.checkId.includes("scripture")) return "scripture_anchor";
  if (result.explanationPathResult === "fail" || result.checkId.includes("explanation")) return "explanation_path";
  if (result.fallbackResult === "fail" || result.checkId.includes("fallback")) return "fallback";
  if (result.consentResult === "fail" || result.checkId.includes("consent")) return "consent";
  if (result.mobileResult === "fail" || result.checkId.includes("mobile")) return "mobile_ui";
  if (result.accessibilityResult === "fail" || result.checkId.includes("accessibility")) return "accessibility";
  if (result.privacyResult === "fail" || result.checkId.includes("privacy") || result.checkId.includes("debug")) return "security";
  return "tig_response";
}

function severityFromResult(result: TeoyubePostDeploymentQaResult): TeoyubePreviewDeploymentIssue["severity"] {
  if (result.status === "blocked" || result.privacyResult === "fail" || result.debugSafetyResult === "fail") return "critical";
  if (result.blocker || result.status === "fail") return "high";
  return "medium";
}

export function createIssueFromPostDeploymentQaResult(
  result: TeoyubePostDeploymentQaResult
): NewPreviewIssue | undefined {
  if (!result.blocker && !result.warning && result.status !== "warning" && result.status !== "fail" && result.status !== "blocked") {
    return undefined;
  }

  return {
    id: `postdeployment_${result.surface}_${result.checkId}_${result.id}`.replace(/[^a-zA-Z0-9_-]/g, "_"),
    category: categoryFromResult(result),
    severity: severityFromResult(result),
    title: `Post-deployment QA ${result.status}: ${result.surface}`,
    details: result.notes || `${result.surface} failed or warned on ${result.checkId}.`,
    status: "open",
    recommendedAction: result.blocker
      ? "Resolve this issue before preview review."
      : "Review this warning before preview review."
  };
}

export function createIssuesFromPostDeploymentQaRun(run: TeoyubePostDeploymentQaRun): NewPreviewIssue[] {
  return run.results
    .map(createIssueFromPostDeploymentQaResult)
    .filter((issue): issue is NewPreviewIssue => Boolean(issue));
}

export function addPostDeploymentQaIssuesToPreviewIssueLog(
  issueLog: TeoyubePreviewDeploymentIssueLog,
  run: TeoyubePostDeploymentQaRun
): TeoyubePreviewDeploymentIssueLog {
  return createIssuesFromPostDeploymentQaRun(run).reduce(
    (log, issue) => addPreviewDeploymentIssue(log, issue),
    issueLog
  );
}

export function createPostDeploymentIssueBridgeReport(
  issueLog: TeoyubePreviewDeploymentIssueLog,
  run: TeoyubePostDeploymentQaRun
) {
  const issues = createIssuesFromPostDeploymentQaRun(run);
  const updatedLog = addPostDeploymentQaIssuesToPreviewIssueLog(issueLog, run);

  return {
    valid: true,
    inMemoryOnly: true,
    issueCountCreated: issues.length,
    originalIssueCount: issueLog.issues.length,
    updatedIssueCount: updatedLog.issues.length,
    issues,
    updatedLog,
    analyticsSent: false,
    databaseWritten: false,
    filesWritten: false,
    generatedAt: new Date().toISOString()
  };
}
