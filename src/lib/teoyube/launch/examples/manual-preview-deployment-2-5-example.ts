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
import {
  createSoftLaunchCandidateOwnerReviewRecord,
  createSoftLaunchCandidateOwnerReviewReport
} from "../soft-launch-candidate-owner-review";
import { runSoftLaunchCandidateConfirmationAudit } from "../soft-launch-candidate-confirmation-audit";
import type { TeoyubeManualPreviewIssue } from "../manual-preview-issue-triage-contracts";
import type { TeoyubeManualPreviewSafeFixResult } from "../manual-preview-safe-fix-contracts";
import type { TeoyubeResolvedIssueResolutionLike } from "../manual-preview-resolved-issue-recheck";

function sampleResolvedIssue(): TeoyubeManualPreviewIssue {
  return {
    id: "sample_recheck_copy_clarity",
    title: "Reflection copy re-check",
    details: "Sample issue resolved by a safe local copy/documentation clarification.",
    category: "content_clarity",
    severity: "low",
    source: "manual_owner_review",
    surface: "tig_response_panel"
  };
}

function sampleFixResult(issue: TeoyubeManualPreviewIssue): TeoyubeManualPreviewSafeFixResult {
  return {
    id: "sample_recheck_fix_result",
    candidateId: "sample_recheck_candidate",
    issueId: issue.id,
    status: "verified",
    filesChanged: ["docs/teoyube/manual-preview-deployment-2-5-preview-recheck-soft-launch-candidate-confirmation.md"],
    fixSummary: "Documented preview re-check and soft launch candidate confirmation.",
    riskLevel: "low",
    regressionChecksRequired: [
      {
        id: "sample_recheck_regression",
        label: "Sample re-check regression",
        category: "content_clarity",
        required: true,
        launchCritical: false,
        verificationModule: "manual-preview-recheck-runner",
        details: "Verify the safe fix remains documented."
      }
    ],
    verificationStatus: "passed",
    appliedAt: new Date().toISOString()
  };
}

export function runManualPreviewDeployment25Example() {
  const issue = sampleResolvedIssue();
  const fixResult = sampleFixResult(issue);
  const checklist = getManualPreviewRecheckChecklist();
  let recheckRun = createManualPreviewRecheckRun({ items: checklist });

  checklist.forEach((entry) => {
    recheckRun = recordManualPreviewRecheckResult(recheckRun, {
      itemId: entry.id,
      status: "pass",
      scope: entry.scope,
      surface: entry.surface,
      summary: `${entry.label} passed in the sample 2.5 re-check.`,
      required: entry.required,
      launchCritical: entry.launchCritical,
      ownerReviewed: true
    });
  });

  const safetyResults = getPostFixSafetyVerificationChecklist().map((entry) => ({
    id: `${entry.id}_example_result`,
    checkId: entry.id,
    type: entry.type,
    status: "pass" as const,
    summary: `${entry.label} passed in the sample 2.5 flow.`,
    required: entry.required,
    launchCritical: entry.launchCritical,
    checkedAt: new Date().toISOString()
  }));
  const surfaceResults = getPostFixSurfaceRegressionChecklist().map((entry) => ({
    id: `${entry.id}_example_result`,
    checkId: entry.id,
    type: entry.type,
    status: "pass" as const,
    summary: `${entry.label} passed in the sample 2.5 flow.`,
    required: entry.required,
    launchCritical: entry.launchCritical,
    checkedAt: new Date().toISOString()
  }));
  let regressionRun = createManualPreviewRegressionRun({ fixResults: [fixResult] });

  fixResult.regressionChecksRequired.forEach((check) => {
    regressionRun = recordManualPreviewRegressionResult(regressionRun, {
      checkId: check.id,
      type: "surface_qa",
      status: "pass",
      summary: `${check.label} passed.`,
      required: check.required,
      launchCritical: check.launchCritical,
      relatedIssueId: issue.id,
      relatedFixResultId: fixResult.id
    });
  });

  const resolution: TeoyubeResolvedIssueResolutionLike = {
    issueId: issue.id,
    issue,
    verified: true,
    status: "resolved",
    fixResult,
    regressionResults: regressionRun.results,
    blockers: [],
    warnings: [],
    verifiedAt: new Date().toISOString(),
    ownerReviewPresent: true,
    approvedManualResolution: true
  };
  const resolvedIssueRecheck = verifyResolvedPreviewIssue(issue, resolution, regressionRun.results);
  const recheckReport = createManualPreviewRecheckReport(recheckRun);
  const regressionReport = createManualPreviewRegressionReport(regressionRun);
  const postFixSafetyReport = createPostFixSafetyVerificationReport(safetyResults);
  const postFixSurfaceRegressionReport = createPostFixSurfaceRegressionReport(surfaceResults);
  const criteriaReport = createSoftLaunchCandidateCriteriaReport();
  const confirmationReport = createSoftLaunchCandidateConfirmationReport({
    previewRecheckReport: recheckReport,
    resolvedIssueRecheckReport: {
      valid: resolvedIssueRecheck.passed,
      resultCount: 1,
      passedCount: resolvedIssueRecheck.passed ? 1 : 0,
      blockerCount: resolvedIssueRecheck.blockers.length,
      warningCount: resolvedIssueRecheck.warnings.length,
      results: [resolvedIssueRecheck],
      blockers: resolvedIssueRecheck.blockers,
      warnings: resolvedIssueRecheck.warnings,
      noExternalWrite: true,
      generatedAt: new Date().toISOString()
    },
    regressionVerificationReport: regressionReport,
    postFixSafetyReport,
    postFixSurfaceRegressionReport,
    criteriaReport,
    ownerReviewAccepted: true,
    manualApprovalAccepted: true
  });
  const candidatePackage = createSoftLaunchCandidatePackage({
    confirmationReport,
    previewRecheckReport: recheckReport,
    resolvedIssueRecheckReport: {
      valid: resolvedIssueRecheck.passed,
      resultCount: 1,
      passedCount: resolvedIssueRecheck.passed ? 1 : 0,
      blockerCount: resolvedIssueRecheck.blockers.length,
      warningCount: resolvedIssueRecheck.warnings.length,
      results: [resolvedIssueRecheck],
      blockers: resolvedIssueRecheck.blockers,
      warnings: resolvedIssueRecheck.warnings,
      noExternalWrite: true,
      generatedAt: new Date().toISOString()
    },
    regressionVerificationReport: regressionReport,
    postFixSafetyReport,
    postFixSurfaceRegressionReport
  });
  const ownerReview = createSoftLaunchCandidateOwnerReviewReport(createSoftLaunchCandidateOwnerReviewRecord({
    previewRecheckReviewed: true,
    resolvedIssuesReviewed: true,
    regressionResultsReviewed: true,
    scriptureAnchoringReviewed: true,
    explanationPathsReviewed: true,
    fallbackSafetyReviewed: true,
    consentPrivacyReviewed: true,
    mobileAccessibilityReviewed: true,
    knownLimitationsAccepted: true,
    feedbackIntakePlanAccepted: true,
    rollbackCriteriaAccepted: true,
    softLaunchCandidateDecisionAccepted: true,
    notes: "Sample owner review accepts the soft launch candidate confirmation package."
  }));

  return {
    recheckRun,
    recheckReport,
    resolvedIssueRecheck,
    regressionRun,
    regressionReport,
    postFixSafetyReport,
    postFixSurfaceRegressionReport,
    criteriaReport,
    confirmationReport,
    candidatePackage,
    packageReport: createSoftLaunchCandidatePackageReport(candidatePackage),
    releaseNotes: createSoftLaunchCandidateReleaseNotes(),
    ownerReview,
    audit: runSoftLaunchCandidateConfirmationAudit(),
    noActualDeploymentPerformed: true,
    noSoftLaunchPerformed: true,
    noUsersContacted: true,
    noPreviewUrlFetched: true,
    noExternalServicesCalled: true,
    generatedAt: new Date().toISOString()
  };
}
