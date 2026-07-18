import { getManualPreviewRecheckChecklist } from "../manual-preview-recheck-checklist";
import {
  createManualPreviewRecheckReport,
  createManualPreviewRecheckRun,
  recordManualPreviewRecheckResult
} from "../manual-preview-recheck-runner";
import { verifyResolvedPreviewIssue } from "../manual-preview-resolved-issue-recheck";
import {
  createManualPreviewRegressionReport,
  createManualPreviewRegressionRun,
  recordManualPreviewRegressionResult
} from "../manual-preview-regression-verification-runner";
import { createPostFixSafetyVerificationReport, getPostFixSafetyVerificationChecklist } from "../manual-preview-post-fix-safety-verification";
import { createPostFixSurfaceRegressionReport, getPostFixSurfaceRegressionChecklist } from "../manual-preview-post-fix-surface-regression";
import { createSoftLaunchCandidateCriteriaReport } from "../soft-launch-candidate-criteria";
import { createSoftLaunchCandidateConfirmationReport } from "../soft-launch-candidate-confirmation";
import { createSoftLaunchCandidatePackage, createSoftLaunchCandidatePackageReport } from "../soft-launch-candidate-package";
import { createSoftLaunchCandidateReleaseNotes } from "../soft-launch-candidate-release-notes";
import { createSoftLaunchCandidateOwnerReviewChecklist } from "../soft-launch-candidate-owner-review";
import { runSoftLaunchCandidateConfirmationAudit } from "../soft-launch-candidate-confirmation-audit";
import type { TeoyubeManualPreviewIssue } from "../manual-preview-issue-triage-contracts";
import type { TeoyubeManualPreviewSafeFixResult } from "../manual-preview-safe-fix-contracts";
import type { TeoyubeResolvedIssueRecheckReport, TeoyubeResolvedIssueResolutionLike } from "../manual-preview-resolved-issue-recheck";

export type ManualPreviewDeployment25SmokeCheckReport = {
  valid: boolean;
  errors: string[];
  noActualDeploymentPerformed: true;
  noSoftLaunchPerformed: true;
  noUsersContacted: true;
  noPreviewUrlFetched: true;
  noDatabaseRequired: true;
  noExternalApisRequired: true;
  noAnalyticsProviderRequired: true;
  noServiceWorkerRequired: true;
  noBrowserStorageRequired: true;
  noFileWritesRequired: true;
  generatedAt: string;
};

function assert(condition: boolean, message: string): string {
  return condition ? "" : message;
}

function issue(severity: "low" | "critical" = "low"): TeoyubeManualPreviewIssue {
  return {
    id: severity === "critical" ? "smoke_unresolved_critical_issue" : "smoke_resolved_issue",
    title: severity === "critical" ? "Unresolved critical issue" : "Resolved preview issue",
    details: "Smoke-check issue.",
    category: severity === "critical" ? "scripture_anchor" : "content_clarity",
    severity,
    launchCritical: severity === "critical",
    safetyCritical: severity === "critical",
    softLaunchBlocking: severity === "critical"
  };
}

function fixResult(resolvedIssue: TeoyubeManualPreviewIssue): TeoyubeManualPreviewSafeFixResult {
  return {
    id: "smoke_recheck_fix_result",
    candidateId: "smoke_recheck_candidate",
    issueId: resolvedIssue.id,
    status: "verified",
    filesChanged: ["docs/teoyube/manual-preview-deployment-2-5-preview-recheck-soft-launch-candidate-confirmation.md"],
    fixSummary: "Smoke-check safe documentation fix.",
    riskLevel: "low",
    regressionChecksRequired: [
      {
        id: "smoke_recheck_regression",
        label: "Smoke re-check regression",
        category: "content_clarity",
        required: true,
        launchCritical: false,
        verificationModule: "manual-preview-recheck-runner",
        details: "Verify safe documentation fix."
      }
    ],
    verificationStatus: "passed",
    appliedAt: new Date().toISOString()
  };
}

function recheckAllItems() {
  const items = getManualPreviewRecheckChecklist();
  let run = createManualPreviewRecheckRun({ items });
  items.forEach((entry) => {
    run = recordManualPreviewRecheckResult(run, {
      itemId: entry.id,
      status: "pass",
      scope: entry.scope,
      surface: entry.surface,
      summary: `${entry.label} passed.`,
      required: entry.required,
      launchCritical: entry.launchCritical,
      ownerReviewed: true
    });
  });
  return run;
}

function resolvedIssueReport(): TeoyubeResolvedIssueRecheckReport {
  const resolvedIssue = issue("low");
  const resolvedFix = fixResult(resolvedIssue);
  let regressionRun = createManualPreviewRegressionRun({ fixResults: [resolvedFix] });
  resolvedFix.regressionChecksRequired.forEach((check) => {
    regressionRun = recordManualPreviewRegressionResult(regressionRun, {
      checkId: check.id,
      type: "surface_qa",
      status: "pass",
      summary: `${check.label} passed.`,
      required: check.required,
      launchCritical: check.launchCritical,
      relatedIssueId: resolvedIssue.id,
      relatedFixResultId: resolvedFix.id
    });
  });
  const resolution: TeoyubeResolvedIssueResolutionLike = {
    issueId: resolvedIssue.id,
    issue: resolvedIssue,
    verified: true,
    status: "resolved",
    fixResult: resolvedFix,
    regressionResults: regressionRun.results,
    blockers: [],
    warnings: [],
    verifiedAt: new Date().toISOString(),
    ownerReviewPresent: true,
    approvedManualResolution: true
  };
  const result = verifyResolvedPreviewIssue(resolvedIssue, resolution, regressionRun.results);

  return {
    valid: result.passed,
    resultCount: 1,
    passedCount: result.passed ? 1 : 0,
    blockerCount: result.blockers.length,
    warningCount: result.warnings.length,
    results: [result],
    blockers: result.blockers,
    warnings: result.warnings,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function runManualPreviewDeployment25SmokeCheck(): ManualPreviewDeployment25SmokeCheckReport {
  const recheckRun = recheckAllItems();
  const recheckReport = createManualPreviewRecheckReport(recheckRun);
  const unresolvedCritical = verifyResolvedPreviewIssue(issue("critical"), undefined, []);
  const resolvedReport = resolvedIssueReport();
  const unsafeCriteria = createSoftLaunchCandidateCriteriaReport({
    unresolvedLaunchCriticalIssues: 1,
    unresolvedScriptureAnchorBlockers: 1,
    unsafeFallbackBlockers: 1,
    externalAnalyticsEnabled: true,
    productionPersistenceEnabled: true,
    liveAiOrchestrationEnabled: true
  });
  const criteriaReport = createSoftLaunchCandidateCriteriaReport();
  const safetyResults = getPostFixSafetyVerificationChecklist().map((entry) => ({
    id: `${entry.id}_smoke_result`,
    checkId: entry.id,
    type: entry.type,
    status: "pass" as const,
    summary: `${entry.label} passed.`,
    required: entry.required,
    launchCritical: entry.launchCritical,
    checkedAt: new Date().toISOString()
  }));
  const surfaceResults = getPostFixSurfaceRegressionChecklist().map((entry) => ({
    id: `${entry.id}_smoke_result`,
    checkId: entry.id,
    type: entry.type,
    status: "pass" as const,
    summary: `${entry.label} passed.`,
    required: entry.required,
    launchCritical: entry.launchCritical,
    checkedAt: new Date().toISOString()
  }));
  const regressionReport = createManualPreviewRegressionReport(createManualPreviewRegressionRun({}));
  const postFixSafety = createPostFixSafetyVerificationReport(safetyResults);
  const postFixSurface = createPostFixSurfaceRegressionReport(surfaceResults);
  const confirmationReport = createSoftLaunchCandidateConfirmationReport({
    previewRecheckReport: recheckReport,
    resolvedIssueRecheckReport: resolvedReport,
    regressionVerificationReport: {
      ...regressionReport,
      valid: true,
      decision: "verified"
    },
    postFixSafetyReport: postFixSafety,
    postFixSurfaceRegressionReport: postFixSurface,
    criteriaReport,
    ownerReviewAccepted: true,
    manualApprovalAccepted: true
  });
  const candidatePackage = createSoftLaunchCandidatePackage({
    confirmationReport,
    previewRecheckReport: recheckReport,
    resolvedIssueRecheckReport: resolvedReport,
    postFixSafetyReport: postFixSafety,
    postFixSurfaceRegressionReport: postFixSurface
  });
  const packageReport = createSoftLaunchCandidatePackageReport(candidatePackage);
  const releaseNotes = createSoftLaunchCandidateReleaseNotes();
  const ownerReviewChecklist = createSoftLaunchCandidateOwnerReviewChecklist();
  const audit = runSoftLaunchCandidateConfirmationAudit();
  const errors = [
    assert(getManualPreviewRecheckChecklist().length > 0, "Re-check checklist should exist."),
    assert(recheckRun.inMemoryOnly && !recheckRun.databaseWritten && !recheckRun.analyticsSent && !recheckRun.filesWritten && !recheckRun.externalServicesCalled && !recheckRun.previewUrlFetched && !recheckRun.softLaunchPerformed && !recheckRun.usersContacted, "Re-check runner should remain in-memory only."),
    assert(recheckReport.valid && recheckReport.decision === "ready_for_soft_launch_candidate_confirmation", "Passing re-check results should be ready for candidate confirmation."),
    assert(!unresolvedCritical.passed && unresolvedCritical.blockers.length > 0, "Unresolved critical issues should not pass resolved issue re-check."),
    assert(!unsafeCriteria.valid && unsafeCriteria.blockerCount >= 4, "Unsafe soft launch readiness should be blocked."),
    assert(confirmationReport.ready && ["confirmed_soft_launch_candidate", "confirmed_after_owner_review"].includes(confirmationReport.decision), "Candidate confirmation should return a structured ready decision."),
    assert(packageReport.valid && candidatePackage.inMemoryOnly && !candidatePackage.externallySent && !candidatePackage.fileWritten, "Candidate package should be valid and in-memory only."),
    assert(releaseNotes.messagesSent === false && releaseNotes.usersContacted === false && releaseNotes.knownLimitations.length > 0, "Release notes should be generated without sending messages."),
    assert(ownerReviewChecklist.length >= 10, "Owner review checklist should exist."),
    assert(audit.complete && audit.completionPercentage === 100, "Soft launch candidate confirmation audit should be complete.")
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    errors,
    noActualDeploymentPerformed: true,
    noSoftLaunchPerformed: true,
    noUsersContacted: true,
    noPreviewUrlFetched: true,
    noDatabaseRequired: true,
    noExternalApisRequired: true,
    noAnalyticsProviderRequired: true,
    noServiceWorkerRequired: true,
    noBrowserStorageRequired: true,
    noFileWritesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
