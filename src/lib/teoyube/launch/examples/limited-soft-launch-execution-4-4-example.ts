import { addSoftLaunchFixQueueItems, createSoftLaunchFixQueue } from "../soft-launch-fix-queue-manager";
import type { TeoyubeSoftLaunchFixQueueItem } from "../soft-launch-feedback-triage-contracts";
import { createSoftLaunchSafeFixReleasePlan } from "../soft-launch-safe-fix-release-planner";
import { createSafeFixReleaseSafetyReport } from "../soft-launch-safe-fix-release-safety";
import { createSoftLaunchSafeFixReleaseRun, recordSoftLaunchSafeFixBlocked, recordSoftLaunchSafeFixReleased } from "../soft-launch-safe-fix-release-recorder";
import { createSoftLaunchStabilizationRegressionRun, createStabilizationRegressionReport, recordStabilizationRegressionResult } from "../soft-launch-stabilization-regression-runner";
import { createSoftLaunchPostReleaseSafetyReport } from "../soft-launch-post-release-safety-verification";
import { createPostReleaseSurfaceStabilizationReport } from "../soft-launch-post-release-surface-stabilization";
import { createSoftLaunchStabilizationPackage, createSoftLaunchStabilizationPackageReport } from "../soft-launch-stabilization-package";
import { createSoftLaunchStabilizationOwnerReviewRecord, createSoftLaunchStabilizationOwnerReviewReport } from "../soft-launch-stabilization-owner-review";
import { createStabilizationContinuePauseReport } from "../soft-launch-stabilization-continue-pause";
import { runSoftLaunchSafeFixStabilizationAudit } from "../soft-launch-safe-fix-stabilization-audit";

function item(input: Partial<TeoyubeSoftLaunchFixQueueItem> & { id: string; title: string; proposedFix: string }): TeoyubeSoftLaunchFixQueueItem {
  return {
    sourceFeedbackId: input.sourceFeedbackId,
    category: input.category || "content_clarity",
    severity: input.severity || "low",
    priority: input.priority || "low",
    launchCritical: input.launchCritical ?? false,
    safetyCritical: input.safetyCritical ?? false,
    verificationRequired: input.verificationRequired || ["typecheck", "smoke_check"],
    status: input.status || "new",
    manualOnly: true,
    ...input
  };
}

export function createLimitedSoftLaunchExecution44ExampleFixQueue() {
  return addSoftLaunchFixQueueItems(createSoftLaunchFixQueue(), [
    item({
      id: "example_safe_copy_fix",
      title: "Clarify manual empty-state copy",
      proposedFix: "Clarify local safe empty-state copy while preserving Scripture anchors, explanation paths, fallback safety, consent controls, privacy, and confidence labels."
    }),
    item({
      id: "example_manual_scripture_fix",
      title: "Restore missing Scripture anchor display",
      category: "scripture_anchor",
      severity: "high",
      priority: "launch_blocker",
      launchCritical: true,
      safetyCritical: true,
      proposedFix: "Restore Scripture anchor display with owner review before release.",
      verificationRequired: ["Scripture/explanation verification", "owner_review"]
    }),
    item({
      id: "example_blocked_unsafe_fix",
      title: "Unsafe shortcut proposal",
      category: "fallback",
      severity: "critical",
      priority: "launch_blocker",
      launchCritical: true,
      safetyCritical: true,
      proposedFix: "Remove Scripture anchors and enable external analytics to inspect fallback usage.",
      verificationRequired: ["blocked_safety_review"]
    }),
    item({
      id: "example_deferred_docs_fix",
      title: "Document a non-critical known limitation",
      category: "feature_request",
      severity: "low",
      priority: "defer",
      proposedFix: "Document the limitation for a later owner review cycle.",
      verificationRequired: ["owner_review"]
    })
  ]);
}

export function runLimitedSoftLaunchExecution44Example() {
  const fixQueue = createLimitedSoftLaunchExecution44ExampleFixQueue();
  const releasePlan = createSoftLaunchSafeFixReleasePlan(fixQueue);
  const safetyReport = createSafeFixReleaseSafetyReport(releasePlan);
  let releaseRun = createSoftLaunchSafeFixReleaseRun();
  if (releasePlan.safeLocalFixes[0]) {
    releaseRun = recordSoftLaunchSafeFixReleased(releaseRun, {
      candidateId: releasePlan.safeLocalFixes[0].id,
      sourceFixQueueItemId: releasePlan.safeLocalFixes[0].sourceFixQueueItemId,
      filesChanged: [],
      fixSummary: "Sample safe local fix release recorded in memory only.",
      safetyStatus: "passed",
      regressionChecksRequired: releasePlan.safeLocalFixes[0].regressionChecks,
      verificationStatus: "passed"
    });
  }
  if (releasePlan.blockedFixes[0]) {
    releaseRun = recordSoftLaunchSafeFixBlocked(releaseRun, releasePlan.blockedFixes[0], "Unsafe fix is blocked by the safe fix release validator.");
  }
  let regressionRun = createSoftLaunchStabilizationRegressionRun();
  for (const check of regressionRun.checks) {
    regressionRun = recordStabilizationRegressionResult(regressionRun, {
      checkId: check.id,
      type: check.type,
      status: "pass",
      summary: `${check.label} passed for the sample stabilization run.`,
      required: check.required,
      launchCritical: check.launchCritical
    });
  }
  const regressionReport = createStabilizationRegressionReport(regressionRun);
  const postReleaseSafetyReport = createSoftLaunchPostReleaseSafetyReport();
  const surfaceReport = createPostReleaseSurfaceStabilizationReport();
  const stabilizationPackage = createSoftLaunchStabilizationPackage();
  const stabilizationPackageReport = createSoftLaunchStabilizationPackageReport(stabilizationPackage);
  const ownerReviewReport = createSoftLaunchStabilizationOwnerReviewReport(
    createSoftLaunchStabilizationOwnerReviewRecord({ ownerDecision: stabilizationPackageReport.decision })
  );
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

  return {
    fixQueue,
    releasePlan,
    safetyReport,
    releaseRun,
    regressionReport,
    postReleaseSafetyReport,
    surfaceReport,
    stabilizationPackageReport,
    ownerReviewReport,
    continuePauseReport,
    audit
  };
}
