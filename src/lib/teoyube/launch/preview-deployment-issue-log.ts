import type { TeoyubePreviewDeploymentIssue } from "./preview-deployment-execution-contracts";

export type TeoyubePreviewDeploymentIssueLog = {
  id: string;
  issues: TeoyubePreviewDeploymentIssue[];
  createdAt: string;
  updatedAt: string;
};

export function createPreviewDeploymentIssueLog(): TeoyubePreviewDeploymentIssueLog {
  const now = new Date().toISOString();

  return {
    id: "preview_deployment_issue_log",
    issues: [],
    createdAt: now,
    updatedAt: now
  };
}

export function addPreviewDeploymentIssue(
  log: TeoyubePreviewDeploymentIssueLog,
  issue: Omit<TeoyubePreviewDeploymentIssue, "createdAt" | "updatedAt">
): TeoyubePreviewDeploymentIssueLog {
  const now = new Date().toISOString();

  return {
    ...log,
    issues: [
      ...log.issues,
      {
        ...issue,
        createdAt: now,
        updatedAt: now
      }
    ],
    updatedAt: now
  };
}

export function updatePreviewDeploymentIssue(
  log: TeoyubePreviewDeploymentIssueLog,
  issueId: string,
  update: Partial<Omit<TeoyubePreviewDeploymentIssue, "id" | "createdAt">>
): TeoyubePreviewDeploymentIssueLog {
  const now = new Date().toISOString();

  return {
    ...log,
    issues: log.issues.map((issue) =>
      issue.id === issueId
        ? {
            ...issue,
            ...update,
            updatedAt: now
          }
        : issue
    ),
    updatedAt: now
  };
}

export function getPreviewDeploymentBlockingIssues(log: TeoyubePreviewDeploymentIssueLog): TeoyubePreviewDeploymentIssue[] {
  return log.issues.filter((issue) => issue.status !== "resolved" && (issue.severity === "high" || issue.severity === "critical"));
}

export function getPreviewDeploymentIssueWarnings(log: TeoyubePreviewDeploymentIssueLog): TeoyubePreviewDeploymentIssue[] {
  return log.issues.filter((issue) => issue.status !== "resolved" && issue.severity === "medium");
}

export function summarizePreviewDeploymentIssues(log: TeoyubePreviewDeploymentIssueLog) {
  const blockingIssues = getPreviewDeploymentBlockingIssues(log);
  const warnings = getPreviewDeploymentIssueWarnings(log);

  return {
    issueCount: log.issues.length,
    openIssueCount: log.issues.filter((issue) => issue.status === "open" || issue.status === "in_review").length,
    resolvedIssueCount: log.issues.filter((issue) => issue.status === "resolved").length,
    blockingIssueCount: blockingIssues.length,
    warningIssueCount: warnings.length,
    blockingIssues,
    warnings,
    generatedAt: new Date().toISOString()
  };
}

