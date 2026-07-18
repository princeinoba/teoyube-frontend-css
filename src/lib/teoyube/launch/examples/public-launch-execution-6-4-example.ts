import { createPublicFixQueue, addPublicFixQueueItem } from "../public-fix-queue-manager";
import { createPublicSafeFixReleasePlan, createPublicSafeFixReleasePlanReport } from "../public-safe-fix-release-planner";
import { createPublicSafeFixReleaseSafetyReport } from "../public-safe-fix-release-safety";
import { createPublicSafeFixReleaseRun, createPublicSafeFixReleaseRunReport, recordPublicSafeFixBlocked, recordPublicSafeFixReleased } from "../public-safe-fix-release-recorder";
import { createPublicStabilizationRegressionRun, createPublicStabilizationRegressionReport, recordPublicStabilizationRegressionResult } from "../public-stabilization-regression-runner";
import { createPublicPostReleaseSafetyReport } from "../public-post-release-safety-verification";
import { createPublicPostReleaseSurfaceStabilizationReport } from "../public-post-release-surface-stabilization";
import { createPublicLaunchStabilizationPackage, createPublicLaunchStabilizationPackageReport } from "../public-launch-stabilization-package";
import { createPublicStabilizationOwnerReviewRecord, createPublicStabilizationOwnerReviewReport } from "../public-stabilization-owner-review";
import { createPublicStabilizationContinuePauseReport } from "../public-stabilization-continue-pause";
import { runPublicSafeFixStabilizationAudit } from "../public-safe-fix-stabilization-audit";

export function createPublicLaunchExecution64ExampleFixQueue() {
  let queue = createPublicFixQueue();
  queue = addPublicFixQueueItem(queue, {
    id: "public_copy_empty_state_safe_fix",
    title: "Clarify public empty-state copy",
    category: "public_copy",
    severity: "low",
    priority: "low",
    proposedFix: "Update local empty-state wording while preserving Scripture anchors, explanation paths, fallback safety, confidence labels, consent controls, public privacy terms consent notices, and manual feedback intake.",
    verificationRequired: ["public_copy_regression", "public_privacy_terms_consent_regression", "owner_review"],
    status: "planned",
    publicLaunchCritical: false,
    publicSafetyCritical: false
  });
  queue = addPublicFixQueueItem(queue, {
    id: "public_feature_manual_review_fix",
    title: "Defer provider-backed public feature request",
    category: "feature_request",
    severity: "medium",
    priority: "defer",
    proposedFix: "Defer this broad provider-backed feature request to manual owner review outside public safe-fix release.",
    verificationRequired: ["owner_review"],
    status: "deferred",
    publicLaunchCritical: false,
    publicSafetyCritical: false
  });
  queue = addPublicFixQueueItem(queue, {
    id: "public_unsafe_analytics_fix",
    title: "Unsafe analytics and raw feedback proposal",
    category: "privacy",
    severity: "critical",
    priority: "public_launch_blocker",
    proposedFix: "Enable analytics and store raw sensitive feedback automatically.",
    verificationRequired: ["owner_review"],
    status: "blocked",
    publicLaunchCritical: true,
    publicSafetyCritical: true
  });
  return queue;
}

function createPassingExampleRegressionReport() {
  let run = createPublicStabilizationRegressionRun();
  for (const check of run.checks) {
    run = recordPublicStabilizationRegressionResult(run, {
      checkId: check.id,
      type: check.type,
      status: "pass",
      summary: `${check.label} passed for the example public stabilization run.`,
      required: check.required,
      publicLaunchCritical: check.publicLaunchCritical
    });
  }
  return createPublicStabilizationRegressionReport(run);
}

export function runPublicLaunchExecution64Example() {
  const fixQueue = createPublicLaunchExecution64ExampleFixQueue();
  const safeFixReleasePlan = createPublicSafeFixReleasePlan(fixQueue);
  const safeFixReleasePlanReport = createPublicSafeFixReleasePlanReport(safeFixReleasePlan);
  const safeFixReleaseSafetyReport = createPublicSafeFixReleaseSafetyReport(safeFixReleasePlan);
  let safeFixReleaseRun = createPublicSafeFixReleaseRun();
  const safeCandidate = safeFixReleasePlan.safeLocalFixes[0];
  const blockedCandidate = safeFixReleasePlan.blockedFixes[0];

  if (safeCandidate) {
    safeFixReleaseRun = recordPublicSafeFixReleased(safeFixReleaseRun, {
      candidateId: safeCandidate.id,
      sourceFixQueueItemId: safeCandidate.sourceFixQueueItemId,
      filesChanged: ["docs/teoyube/public-launch-execution-6-4-public-safe-fix-release-launch-stabilization.md"],
      fixSummary: "Example public safe copy fix recorded manually.",
      safetyStatus: "passed",
      regressionChecksRequired: safeCandidate.regressionChecks,
      verificationStatus: "passed"
    });
  }

  if (blockedCandidate) {
    safeFixReleaseRun = recordPublicSafeFixBlocked(safeFixReleaseRun, {
      candidateId: blockedCandidate.id,
      sourceFixQueueItemId: blockedCandidate.sourceFixQueueItemId,
      filesChanged: [],
      fixSummary: "Unsafe analytics/raw-feedback proposal blocked.",
      blockedReason: blockedCandidate.blockedReason || "Unsafe public launch change.",
      regressionChecksRequired: blockedCandidate.regressionChecks
    });
  }

  const safeFixReleaseRunReport = createPublicSafeFixReleaseRunReport(safeFixReleaseRun);
  const stabilizationRegressionReport = createPassingExampleRegressionReport();
  const postReleaseSafetyReport = createPublicPostReleaseSafetyReport();
  const postReleaseSurfaceStabilizationReport = createPublicPostReleaseSurfaceStabilizationReport();
  const stabilizationPackage = createPublicLaunchStabilizationPackage();
  const stabilizationPackageReport = createPublicLaunchStabilizationPackageReport(stabilizationPackage);
  const ownerReviewReport = createPublicStabilizationOwnerReviewReport(
    createPublicStabilizationOwnerReviewRecord({ ownerDecision: stabilizationPackageReport.decision })
  );
  const stabilizationContinuePauseReport = createPublicStabilizationContinuePauseReport({
    publicFixQueueBlockers: 0,
    releasePlanBlockers: safeFixReleasePlanReport.blockers.length,
    releaseSafetyBlockers: safeFixReleaseSafetyReport.blockers.length,
    releaseRunBlockers: safeFixReleaseRunReport.blockers.length,
    regressionBlockers: stabilizationRegressionReport.blockers.length,
    postReleaseSafetyBlockers: postReleaseSafetyReport.blockers.length,
    surfaceStabilizationBlockers: postReleaseSurfaceStabilizationReport.blockers.length,
    ownerReviewDecision: ownerReviewReport.decision,
    ownerReviewAccepted: ownerReviewReport.ready,
    pauseRollbackWatchStatus: "healthy",
    warningCount: safeFixReleasePlanReport.warnings.length + safeFixReleaseSafetyReport.warnings.length + stabilizationRegressionReport.warnings.length
  });
  const audit = runPublicSafeFixStabilizationAudit();

  return {
    fixQueue,
    safeFixReleasePlanReport,
    safeFixReleaseSafetyReport,
    safeFixReleaseRunReport,
    stabilizationRegressionReport,
    postReleaseSafetyReport,
    postReleaseSurfaceStabilizationReport,
    stabilizationPackage,
    stabilizationPackageReport,
    ownerReviewReport,
    stabilizationContinuePauseReport,
    audit
  };
}
