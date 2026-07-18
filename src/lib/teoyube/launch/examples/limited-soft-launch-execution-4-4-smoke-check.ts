import { createLimitedSoftLaunchExecution44ExampleFixQueue } from "./limited-soft-launch-execution-4-4-example";
import {
  createSoftLaunchSafeFixReleasePlan,
  getBlockedFixReleaseCandidates,
  getDeferredFixReleaseCandidates,
  getManualReviewFixReleaseCandidates,
  getSafeFixReleaseCandidates
} from "../soft-launch-safe-fix-release-planner";
import { createSafeFixReleaseSafetyReport } from "../soft-launch-safe-fix-release-safety";
import {
  createSoftLaunchSafeFixReleaseRun,
  createSoftLaunchSafeFixReleaseRunReport,
  recordSoftLaunchSafeFixBlocked,
  recordSoftLaunchSafeFixDeferred,
  recordSoftLaunchSafeFixReleased,
  recordSoftLaunchSafeFixSkipped
} from "../soft-launch-safe-fix-release-recorder";
import { createSoftLaunchStabilizationRegressionRun, createStabilizationRegressionReport, recordStabilizationRegressionResult } from "../soft-launch-stabilization-regression-runner";
import { createSoftLaunchPostReleaseSafetyReport } from "../soft-launch-post-release-safety-verification";
import { createPostReleaseSurfaceStabilizationReport, POST_RELEASE_SURFACES } from "../soft-launch-post-release-surface-stabilization";
import { createSoftLaunchStabilizationPackage, createSoftLaunchStabilizationPackageReport } from "../soft-launch-stabilization-package";
import { createSoftLaunchStabilizationOwnerReviewChecklist, createSoftLaunchStabilizationOwnerReviewReport } from "../soft-launch-stabilization-owner-review";
import { createStabilizationContinuePauseReport } from "../soft-launch-stabilization-continue-pause";
import { runSoftLaunchSafeFixStabilizationAudit } from "../soft-launch-safe-fix-stabilization-audit";

export function runLimitedSoftLaunchExecution44SmokeCheck() {
  const fixQueue = createLimitedSoftLaunchExecution44ExampleFixQueue();
  const releasePlan = createSoftLaunchSafeFixReleasePlan(fixQueue);
  const safetyReport = createSafeFixReleaseSafetyReport(releasePlan);
  let releaseRun = createSoftLaunchSafeFixReleaseRun();
  const safeCandidate = getSafeFixReleaseCandidates(releasePlan)[0];
  const manualCandidate = getManualReviewFixReleaseCandidates(releasePlan)[0];
  const blockedCandidate = getBlockedFixReleaseCandidates(releasePlan)[0];
  const deferredCandidate = getDeferredFixReleaseCandidates(releasePlan)[0];

  if (safeCandidate) {
    releaseRun = recordSoftLaunchSafeFixReleased(releaseRun, {
      candidateId: safeCandidate.id,
      sourceFixQueueItemId: safeCandidate.sourceFixQueueItemId,
      filesChanged: [],
      fixSummary: "Smoke safe fix release recorded in memory only.",
      safetyStatus: "passed",
      regressionChecksRequired: safeCandidate.regressionChecks,
      verificationStatus: "passed"
    });
  }
  if (manualCandidate) releaseRun = recordSoftLaunchSafeFixSkipped(releaseRun, manualCandidate, "Owner review required.");
  if (blockedCandidate) releaseRun = recordSoftLaunchSafeFixBlocked(releaseRun, blockedCandidate, "Unsafe fix blocked.");
  if (deferredCandidate) releaseRun = recordSoftLaunchSafeFixDeferred(releaseRun, deferredCandidate, "Deferred for a later review cycle.");
  const releaseRunReport = createSoftLaunchSafeFixReleaseRunReport(releaseRun);

  let regressionRun = createSoftLaunchStabilizationRegressionRun();
  for (const check of regressionRun.checks) {
    regressionRun = recordStabilizationRegressionResult(regressionRun, {
      checkId: check.id,
      type: check.type,
      status: "pass",
      summary: `${check.label} passed in smoke check.`,
      required: check.required,
      launchCritical: check.launchCritical
    });
  }
  const regressionReport = createStabilizationRegressionReport(regressionRun);
  const postReleaseSafetyReport = createSoftLaunchPostReleaseSafetyReport();
  const surfaceReport = createPostReleaseSurfaceStabilizationReport();
  const stabilizationPackage = createSoftLaunchStabilizationPackage();
  const stabilizationPackageReport = createSoftLaunchStabilizationPackageReport(stabilizationPackage);
  const ownerChecklist = createSoftLaunchStabilizationOwnerReviewChecklist();
  const ownerReviewReport = createSoftLaunchStabilizationOwnerReviewReport();
  const continuePauseReport = createStabilizationContinuePauseReport({
    regressionBlockers: regressionReport.blockers.length,
    postReleaseSafetyBlockers: postReleaseSafetyReport.blockers.length,
    surfaceStabilizationBlockers: surfaceReport.blockers.length,
    ownerReviewDecision: ownerReviewReport.decision,
    dailyReviewDecision: "continue_soft_launch",
    feedbackTriageDecision: "continue_soft_launch",
    pauseRollbackWatchStatus: "healthy"
  });
  const audit = runSoftLaunchSafeFixStabilizationAudit();

  const checks = [
    releasePlan.candidates.length >= 4,
    getSafeFixReleaseCandidates(releasePlan).length >= 1,
    getManualReviewFixReleaseCandidates(releasePlan).length >= 1,
    getBlockedFixReleaseCandidates(releasePlan).length >= 1,
    getDeferredFixReleaseCandidates(releasePlan).length >= 1,
    !safetyReport.valid && safetyReport.blockers.some((entry) => entry.id.includes("safe_fix_removes_scripture")),
    releaseRun.inMemoryOnly && !releaseRun.databaseWritten && !releaseRun.analyticsSent && !releaseRun.fileWritten && !releaseRun.externalServicesCalled,
    releaseRunReport.resultCount >= 4,
    regressionRun.inMemoryOnly && !regressionRun.previewUrlFetched && regressionReport.decision === "stabilized",
    postReleaseSafetyReport.scriptureAnchoringRequired && postReleaseSafetyReport.explanationPathsRequired && postReleaseSafetyReport.fallbackSafetyReady,
    postReleaseSafetyReport.consentSafetyReady && postReleaseSafetyReport.externalAnalyticsDisabled && postReleaseSafetyReport.productionPersistenceDisabled && postReleaseSafetyReport.liveAiOrchestrationDisabled,
    surfaceReport.requiredSurfaceCount >= POST_RELEASE_SURFACES.length && surfaceReport.checkCount >= POST_RELEASE_SURFACES.length * 10,
    stabilizationPackage.inMemoryOnly && stabilizationPackageReport.noFixesAppliedAutomatically && stabilizationPackageReport.noUsersContacted,
    ownerChecklist.length >= 12 && ownerReviewReport.ready,
    continuePauseReport.decision === "continue_soft_launch",
    audit.complete && audit.completionPercentage === 100,
    !stabilizationPackage.usersContacted,
    !stabilizationPackage.feedbackCollectedAutomatically,
    !stabilizationPackage.analyticsSent,
    !stabilizationPackage.databaseWritten,
    !stabilizationPackage.externalServicesCalled && !stabilizationPackage.previewUrlFetched,
    stabilizationPackageReport.noExternalWrite && stabilizationPackageReport.noLaunchPerformed && stabilizationPackageReport.noRollbackPerformed
  ];

  return {
    valid: checks.every(Boolean),
    checkCount: checks.length,
    passedCheckCount: checks.filter(Boolean).length,
    noActualLaunchPerformed: true,
    noRollbackPerformed: true,
    noUsersContacted: true,
    noRealFeedbackCollectedAutomatically: true,
    noPreviewUrlFetched: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noDatabaseExternalApisAnalyticsStorageOrFileWritesRequired: true,
    noServiceWorkerRequired: true,
    noLocalStorageCookiesIndexedDbRequired: true,
    stabilizationDecision: stabilizationPackageReport.decision,
    continuePauseDecision: continuePauseReport.decision,
    audit,
    generatedAt: new Date().toISOString()
  };
}
