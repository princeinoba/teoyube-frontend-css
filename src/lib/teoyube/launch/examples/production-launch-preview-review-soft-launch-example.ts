import { createPreviewDeploymentIssueLog, addPreviewDeploymentIssue } from "../preview-deployment-issue-log";
import { createPreviewDeploymentReviewReport } from "../preview-deployment-review";
import { createPreviewIssueTriageReport } from "../preview-issue-triage";
import { createPreviewQaReviewRun, recordPreviewSurfaceResult } from "../preview-qa-result-collector";
import { createPreviewSafetyReviewReport } from "../preview-safety-review";
import { createSoftLaunchGoNoGoReport } from "../soft-launch-go-no-go";
import { createSoftLaunchManualApprovalRecord } from "../soft-launch-manual-approval";
import { createSoftLaunchReadinessPackage, createSoftLaunchReadinessPackageReport } from "../soft-launch-readiness-package";
import { createSoftLaunchScopeConfirmation, createSoftLaunchScopeReport } from "../soft-launch-scope-confirmation";
import { runPreviewReviewSoftLaunchAudit } from "../preview-review-soft-launch-audit";

export function runProductionLaunchPreviewReviewSoftLaunchExample() {
  const previewReview = createPreviewDeploymentReviewReport({
    deploymentOccurred: true,
    previewUrlCaptured: true
  });
  const qaRun = recordPreviewSurfaceResult(
    recordPreviewSurfaceResult(createPreviewQaReviewRun(), "Canon"),
    "TIG Response Panel",
    {
      notes: "Sample in-memory QA result for the preview review example."
    }
  );
  const issueLog = addPreviewDeploymentIssue(createPreviewDeploymentIssueLog(), {
    id: "sample_preview_review_note",
    category: "unknown",
    severity: "low",
    title: "Sample preview review note",
    details: "Example issue only; no storage or external system is used.",
    status: "resolved",
    recommendedAction: "Keep manual notes available for owner review."
  });
  const issueTriage = createPreviewIssueTriageReport(issueLog);
  const safetyReview = createPreviewSafetyReviewReport();
  const scope = createSoftLaunchScopeConfirmation({ accepted: true });
  const scopeReport = createSoftLaunchScopeReport(scope);
  const manualApproval = createSoftLaunchManualApprovalRecord({
    approved: false,
    notes: ["Example keeps final manual approval pending."]
  });
  const goNoGo = createSoftLaunchGoNoGoReport({ qaRun, issueLog, manualApproval });
  const readinessPackage = createSoftLaunchReadinessPackage({
    qaRun,
    issueLog,
    scope,
    manualApproval
  });
  const readinessPackageReport = createSoftLaunchReadinessPackageReport(readinessPackage);
  const audit = runPreviewReviewSoftLaunchAudit();

  return {
    previewReview,
    qaRun,
    issueTriage,
    safetyReview,
    scopeReport,
    manualApproval,
    goNoGo,
    readinessPackageReport,
    audit,
    actualDeploymentPerformed: false,
    actualSoftLaunchPerformed: false,
    generatedAt: new Date().toISOString()
  };
}
