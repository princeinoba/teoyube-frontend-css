import { createLaunchQualityGateReport } from "../launch-quality-gates";
import { getPreviewDeploymentExecutionChecklist } from "../preview-deployment-execution-checklist";
import { createPreviewDeploymentGoNoGoReport } from "../preview-deployment-go-no-go";
import { addPreviewDeploymentIssue, createPreviewDeploymentIssueLog, summarizePreviewDeploymentIssues } from "../preview-deployment-issue-log";
import { createPreviewDeploymentPostCheckReport } from "../preview-deployment-postcheck";
import { createPreviewDeploymentPreflightReport } from "../preview-deployment-preflight";
import { createPreviewDeploymentRunbookReport } from "../preview-deployment-runbook";
import { runPreviewDeploymentExecutionAudit } from "../preview-deployment-execution-audit";
import { createPreviewRollbackPlan } from "../preview-rollback-execution-checklist";
import { createPreviewUrlVerificationPlan } from "../preview-url-verification-plan";

export type ProductionLaunchPreviewExecutionChecklistSmokeCheckResult = {
  valid: boolean;
  errors: string[];
  noActualDeploymentPerformed: boolean;
  noExternalSystemsRequired: boolean;
  notes: string[];
  generatedAt: string;
};

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runProductionLaunchPreviewExecutionChecklistSmokeCheck(): ProductionLaunchPreviewExecutionChecklistSmokeCheckResult {
  const checklist = getPreviewDeploymentExecutionChecklist();
  const preflight = createPreviewDeploymentPreflightReport();
  const postCheck = createPreviewDeploymentPostCheckReport();
  const urlPlan = createPreviewUrlVerificationPlan();
  const issueLog = addPreviewDeploymentIssue(createPreviewDeploymentIssueLog(), {
    id: "smoke_warning",
    category: "unknown",
    severity: "medium",
    title: "Smoke warning",
    details: "In-memory smoke issue only.",
    status: "open",
    recommendedAction: "Review manually."
  });
  const issueSummary = summarizePreviewDeploymentIssues(issueLog);
  const rollback = createPreviewRollbackPlan();
  const goNoGo = createPreviewDeploymentGoNoGoReport();
  const runbook = createPreviewDeploymentRunbookReport();
  const audit = runPreviewDeploymentExecutionAudit();
  const gates = createLaunchQualityGateReport();

  const errors = clean([
    checklist.steps.length > 0 ? "" : "Execution checklist should exist.",
    preflight.checkCount > 0 && preflight.valid ? "" : "Preflight report should be structured and valid.",
    postCheck.checkCount > 0 ? "" : "Post-check checklist should exist.",
    urlPlan.notes.some((note) => note.includes("does not fetch")) ? "" : "URL verification plan must not fetch external URLs.",
    issueSummary.issueCount === 1 && issueSummary.warningIssueCount === 1 ? "" : "Issue log should work in memory only.",
    rollback.checklist.length > 0 ? "" : "Rollback checklist should exist.",
    goNoGo.checklistCount > 0 && !goNoGo.actualDeploymentCompleted ? "" : "Go/no-go report should exist and not mark deployment complete.",
    runbook.valid && runbook.sectionCount >= 4 ? "" : "Runbook should exist.",
    audit.complete && audit.completionPercentage === 100 ? "" : "Execution audit should be complete.",
    gates.gates.some((entry) => entry.id === "preview_execution_checklist_exists") ? "" : "Launch quality gates should include execution checklist checks."
  ]);

  return {
    valid: errors.length === 0,
    errors,
    noActualDeploymentPerformed: true,
    noExternalSystemsRequired: true,
    notes: [
      "No database, external APIs, analytics provider, service worker, localStorage, cookies, IndexedDB, or file writes are required.",
      "No deployment command is executed.",
      "Preview deployment remains a later manual action."
    ],
    generatedAt: new Date().toISOString()
  };
}

