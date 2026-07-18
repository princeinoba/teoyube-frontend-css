import { getPreviewDeploymentExecutionChecklist } from "../preview-deployment-execution-checklist";
import { createPreviewDeploymentGoNoGoReport } from "../preview-deployment-go-no-go";
import { addPreviewDeploymentIssue, createPreviewDeploymentIssueLog } from "../preview-deployment-issue-log";
import { createPreviewDeploymentPostCheckReport } from "../preview-deployment-postcheck";
import { createPreviewDeploymentPreflightReport } from "../preview-deployment-preflight";
import { createPreviewDeploymentRunbookReport } from "../preview-deployment-runbook";
import { runPreviewDeploymentExecutionAudit } from "../preview-deployment-execution-audit";
import { createPreviewRollbackPlan } from "../preview-rollback-execution-checklist";
import { createPreviewUrlVerificationPlan } from "../preview-url-verification-plan";

export function runProductionLaunchPreviewExecutionChecklistExample() {
  const executionChecklist = getPreviewDeploymentExecutionChecklist("vercel");
  const preflight = createPreviewDeploymentPreflightReport();
  const postCheck = createPreviewDeploymentPostCheckReport();
  const urlPlan = createPreviewUrlVerificationPlan();
  const issueLog = addPreviewDeploymentIssue(createPreviewDeploymentIssueLog(), {
    id: "sample_manual_warning",
    category: "mobile_ui",
    severity: "medium",
    title: "Sample manual review warning",
    details: "Example warning only; no issue is written to storage.",
    status: "open",
    recommendedAction: "Review mobile layout manually before public preview sharing."
  });
  const rollback = createPreviewRollbackPlan();
  const goNoGo = createPreviewDeploymentGoNoGoReport({ issueLog });
  const runbook = createPreviewDeploymentRunbookReport("vercel");
  const audit = runPreviewDeploymentExecutionAudit();

  return {
    executionChecklist,
    preflight,
    postCheck,
    urlPlan,
    issueLog,
    rollback,
    goNoGo,
    runbook,
    audit,
    generatedAt: new Date().toISOString()
  };
}

