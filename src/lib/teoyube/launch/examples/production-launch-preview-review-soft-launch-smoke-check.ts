import { createLaunchQualityGateReport } from "../launch-quality-gates";
import { createPreviewDeploymentIssueLog } from "../preview-deployment-issue-log";
import { createPreviewDeploymentReviewReport } from "../preview-deployment-review";
import { createPreviewIssueTriageReport } from "../preview-issue-triage";
import { createPreviewQaReviewRun, recordPreviewSurfaceResult, summarizePreviewQaResults } from "../preview-qa-result-collector";
import { createPreviewSafetyReviewReport } from "../preview-safety-review";
import { runPreviewReviewSoftLaunchAudit } from "../preview-review-soft-launch-audit";
import { createSoftLaunchGoNoGoReport } from "../soft-launch-go-no-go";
import { createSoftLaunchManualApprovalRecord } from "../soft-launch-manual-approval";
import { createSoftLaunchReadinessPackage, createSoftLaunchReadinessPackageReport } from "../soft-launch-readiness-package";
import { createSoftLaunchScopeConfirmation, validateSoftLaunchScope } from "../soft-launch-scope-confirmation";

export type ProductionLaunchPreviewReviewSoftLaunchSmokeCheckResult = {
  valid: boolean;
  errors: string[];
  noActualDeploymentPerformed: boolean;
  noSoftLaunchPerformed: boolean;
  noExternalSystemsRequired: boolean;
  notes: string[];
  generatedAt: string;
};

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runProductionLaunchPreviewReviewSoftLaunchSmokeCheck(): ProductionLaunchPreviewReviewSoftLaunchSmokeCheckResult {
  const review = createPreviewDeploymentReviewReport();
  const qaRun = recordPreviewSurfaceResult(createPreviewQaReviewRun(), "Canon");
  const qaSummary = summarizePreviewQaResults(qaRun);
  const issueLog = createPreviewDeploymentIssueLog();
  const triage = createPreviewIssueTriageReport(issueLog);
  const safety = createPreviewSafetyReviewReport();
  const scope = createSoftLaunchScopeConfirmation({ accepted: true });
  const scopeValidation = validateSoftLaunchScope(scope);
  const approval = createSoftLaunchManualApprovalRecord();
  const goNoGo = createSoftLaunchGoNoGoReport({ qaRun, issueLog, manualApproval: { approved: false } });
  const readinessPackage = createSoftLaunchReadinessPackage({ qaRun, issueLog, scope, manualApproval: approval });
  const readinessPackageReport = createSoftLaunchReadinessPackageReport(readinessPackage);
  const audit = runPreviewReviewSoftLaunchAudit();
  const gates = createLaunchQualityGateReport();

  const errors = clean([
    review.checklistCount > 0 && review.valid ? "" : "Preview deployment review should return a valid structured report.",
    qaSummary.resultCount === 1 ? "" : "Preview QA collector should record in-memory results.",
    triage.valid && triage.issueCount === 0 ? "" : "Preview issue triage should return a structured clean report for an empty log.",
    safety.valid && safety.checkCount > 0 ? "" : "Preview safety review should return a valid structured report.",
    goNoGo.ready && !goNoGo.actualSoftLaunchPerformed ? "" : "Soft launch go/no-go should be ready for review and must not perform a soft launch.",
    approval.id === "soft_launch_manual_approval" ? "" : "Manual approval record should be created.",
    scopeValidation.valid ? "" : "Soft launch scope should validate when accepted.",
    readinessPackageReport.valid && !readinessPackageReport.externalWritePerformed ? "" : "Soft launch readiness package should validate without external writes.",
    audit.complete && audit.completionPercentage === 100 ? "" : "Preview review soft launch audit should be complete.",
    gates.gates.some((entry) => entry.id === "preview_deployment_review_report_exists") ? "" : "Launch quality gates should include preview review checks."
  ]);

  return {
    valid: errors.length === 0,
    errors,
    noActualDeploymentPerformed: true,
    noSoftLaunchPerformed: true,
    noExternalSystemsRequired: true,
    notes: [
      "No actual deployment is performed.",
      "No soft launch is performed.",
      "No database, external APIs, analytics provider, service worker, localStorage, cookies, IndexedDB, or file writes are required."
    ],
    generatedAt: new Date().toISOString()
  };
}
