import { createSoftLaunchDailyReviewActionItem, createSoftLaunchDailyReviewRecord, createSoftLaunchDailyReviewReport } from "./soft-launch-daily-review-manager";
import { createSoftLaunchFixQueue, addSoftLaunchFixQueueItem, createSoftLaunchFixQueueReport } from "./soft-launch-fix-queue-manager";
import type { TeoyubeSoftLaunchFixQueue } from "./soft-launch-fix-queue-contracts";
import type { TeoyubeSoftLaunchFixQueueItem } from "./soft-launch-feedback-triage-contracts";
import { createSoftLaunchPauseContinueDecision } from "./soft-launch-pause-continue-decision";
import { createSafeFixReleaseSafetyReport } from "./soft-launch-safe-fix-release-safety";
import { createSoftLaunchSafeFixReleaseDecision, createSoftLaunchSafeFixReleasePlan, createSoftLaunchSafeFixReleasePlanReport } from "./soft-launch-safe-fix-release-planner";
import { createSoftLaunchSafeFixReleaseRun, createSoftLaunchSafeFixReleaseRunReport, recordSoftLaunchSafeFixReleased } from "./soft-launch-safe-fix-release-recorder";
import type { TeoyubeSoftLaunchStabilizationDecision } from "./soft-launch-safe-fix-release-contracts";
import { createSoftLaunchPostReleaseSafetyReport } from "./soft-launch-post-release-safety-verification";
import { createPostReleaseSurfaceStabilizationReport } from "./soft-launch-post-release-surface-stabilization";
import { createSoftLaunchStabilizationRegressionRun, createStabilizationRegressionReport, recordStabilizationRegressionResult } from "./soft-launch-stabilization-regression-runner";
import { createSoftLaunchStabilizationOwnerReviewRecord, createSoftLaunchStabilizationOwnerReviewReport } from "./soft-launch-stabilization-owner-review";
import { createStabilizationContinuePauseReport } from "./soft-launch-stabilization-continue-pause";

export type TeoyubeSoftLaunchStabilizationPackageBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubeSoftLaunchStabilizationPackageWarning = {
  id: string;
  label: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeSoftLaunchStabilizationPackage = {
  id: string;
  label: string;
  safeFixReleasePlanReport: ReturnType<typeof createSoftLaunchSafeFixReleasePlanReport>;
  safeFixReleaseSafetyReport: ReturnType<typeof createSafeFixReleaseSafetyReport>;
  safeFixReleaseRunReport: ReturnType<typeof createSoftLaunchSafeFixReleaseRunReport>;
  stabilizationRegressionReport: ReturnType<typeof createStabilizationRegressionReport>;
  postReleaseSafetyReport: ReturnType<typeof createSoftLaunchPostReleaseSafetyReport>;
  postReleaseSurfaceStabilizationReport: ReturnType<typeof createPostReleaseSurfaceStabilizationReport>;
  fixQueueReport: ReturnType<typeof createSoftLaunchFixQueueReport>;
  dailyReviewReport: ReturnType<typeof createSoftLaunchDailyReviewReport>;
  pauseContinueReport: ReturnType<typeof createSoftLaunchPauseContinueDecision>;
  ownerReviewReport: ReturnType<typeof createSoftLaunchStabilizationOwnerReviewReport>;
  stabilizationContinuePauseReport: ReturnType<typeof createStabilizationContinuePauseReport>;
  knownLimitations: string[];
  nextActionRecommendation: string;
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  launchPerformed: false;
  rollbackPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  previewUrlFetched: false;
  generatedAt: string;
};

function createDefaultStabilizationFixQueue(): TeoyubeSoftLaunchFixQueue {
  const safeFix: TeoyubeSoftLaunchFixQueueItem = {
    id: "safe_copy_clarity_fix_4_4",
    title: "Clarify safe empty-state wording",
    category: "content_clarity",
    severity: "low",
    priority: "low",
    launchCritical: false,
    safetyCritical: false,
    proposedFix: "Update local empty-state copy while preserving Scripture anchors, explanation paths, fallback safety, consent controls, privacy, and confidence labels.",
    verificationRequired: ["typecheck", "smoke_check", "owner_review"],
    status: "new",
    manualOnly: true
  };
  return addSoftLaunchFixQueueItem(createSoftLaunchFixQueue(), safeFix);
}

function createPassingRegressionReport() {
  let run = createSoftLaunchStabilizationRegressionRun();
  for (const check of run.checks) {
    run = recordStabilizationRegressionResult(run, {
      checkId: check.id,
      type: check.type,
      status: "pass",
      summary: `${check.label} recorded as passing for the stabilization package sample.`,
      required: check.required,
      launchCritical: check.launchCritical
    });
  }
  return createStabilizationRegressionReport(run);
}

function createReleaseRunReport(planReport: ReturnType<typeof createSoftLaunchSafeFixReleasePlanReport>) {
  let run = createSoftLaunchSafeFixReleaseRun();
  const candidate = planReport.plan.safeLocalFixes[0];
  if (candidate) {
    run = recordSoftLaunchSafeFixReleased(run, {
      candidateId: candidate.id,
      sourceFixQueueItemId: candidate.sourceFixQueueItemId,
      filesChanged: [],
      fixSummary: "Sample safe local fix release recorded in memory only.",
      safetyStatus: "passed",
      regressionChecksRequired: candidate.regressionChecks,
      verificationStatus: "passed"
    });
  }
  return createSoftLaunchSafeFixReleaseRunReport(run);
}

export function createSoftLaunchStabilizationPackage(
  input: Partial<TeoyubeSoftLaunchStabilizationPackage> & { fixQueue?: TeoyubeSoftLaunchFixQueue } = {}
): TeoyubeSoftLaunchStabilizationPackage {
  const fixQueue = input.fixQueue || createDefaultStabilizationFixQueue();
  const fixQueueReport = input.fixQueueReport || createSoftLaunchFixQueueReport(fixQueue);
  const safeFixPlan = createSoftLaunchSafeFixReleasePlan(fixQueue);
  const safeFixReleasePlanReport = input.safeFixReleasePlanReport || createSoftLaunchSafeFixReleasePlanReport(safeFixPlan);
  const safeFixReleaseSafetyReport = input.safeFixReleaseSafetyReport || createSafeFixReleaseSafetyReport(safeFixPlan);
  const safeFixReleaseRunReport = input.safeFixReleaseRunReport || createReleaseRunReport(safeFixReleasePlanReport);
  const stabilizationRegressionReport = input.stabilizationRegressionReport || createPassingRegressionReport();
  const postReleaseSafetyReport = input.postReleaseSafetyReport || createSoftLaunchPostReleaseSafetyReport();
  const postReleaseSurfaceStabilizationReport = input.postReleaseSurfaceStabilizationReport || createPostReleaseSurfaceStabilizationReport();
  const dailyReviewReport = input.dailyReviewReport || createSoftLaunchDailyReviewReport([
    createSoftLaunchDailyReviewRecord({
      status: "healthy",
      feedbackVolume: 0,
      criticalFeedbackCount: 0,
      fixQueueLaunchBlockerCount: 0,
      actionItems: [
        createSoftLaunchDailyReviewActionItem({
          id: "prepare_completion_review",
          label: "Prepare 4.5 completion review.",
          requiredBeforeNextDay: false,
          launchCritical: false
        })
      ]
    })
  ]);
  const pauseContinueReport = input.pauseContinueReport || createSoftLaunchPauseContinueDecision({
    fixQueueReport,
    dailyReviewReport
  });
  const ownerReviewReport = input.ownerReviewReport || createSoftLaunchStabilizationOwnerReviewReport(
    createSoftLaunchStabilizationOwnerReviewRecord({ ownerDecision: "continue_soft_launch" })
  );
  const stabilizationContinuePauseReport = input.stabilizationContinuePauseReport || createStabilizationContinuePauseReport({
    unresolvedLaunchCriticalIssues: 0,
    fixQueueBlockers: fixQueueReport.blockers.length,
    regressionBlockers: stabilizationRegressionReport.blockers.length,
    postReleaseSafetyBlockers: postReleaseSafetyReport.blockers.length,
    surfaceStabilizationBlockers: postReleaseSurfaceStabilizationReport.blockers.length,
    feedbackTriageDecision: "continue_soft_launch",
    dailyReviewDecision: dailyReviewReport.decision,
    ownerReviewDecision: ownerReviewReport.decision,
    pauseRollbackWatchStatus: "healthy",
    warningCount: safeFixReleasePlanReport.warnings.length + safeFixReleaseRunReport.warningCount + stabilizationRegressionReport.warnings.length + postReleaseSafetyReport.warnings.length + postReleaseSurfaceStabilizationReport.warnings.length
  });

  return {
    id: input.id || "soft_launch_stabilization_package_4_4",
    label: input.label || "Soft Launch Safe Fix Release & Stabilization Package",
    safeFixReleasePlanReport,
    safeFixReleaseSafetyReport,
    safeFixReleaseRunReport,
    stabilizationRegressionReport,
    postReleaseSafetyReport,
    postReleaseSurfaceStabilizationReport,
    fixQueueReport,
    dailyReviewReport,
    pauseContinueReport,
    ownerReviewReport,
    stabilizationContinuePauseReport,
    knownLimitations: input.knownLimitations || [
      "Safe fix release records remain manual and in-memory.",
      "Actual deployment, rollback, user contact, and provider operations remain outside this module."
    ],
    nextActionRecommendation: input.nextActionRecommendation || "Limited Soft Launch Execution 4.5 - Soft Launch Completion Review & Public Launch Readiness",
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    launchPerformed: false,
    rollbackPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    previewUrlFetched: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getSoftLaunchStabilizationPackageBlockers(
  pkg: TeoyubeSoftLaunchStabilizationPackage
): TeoyubeSoftLaunchStabilizationPackageBlocker[] {
  return [
    ...pkg.safeFixReleasePlanReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.safeFixReleaseSafetyReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.safeFixReleaseRunReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.stabilizationRegressionReport.blockers.map((entry) => ({ id: entry.id, label: entry.checkId || "Regression", reason: entry.message, requiredAction: entry.requiredAction })),
    ...pkg.postReleaseSafetyReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.postReleaseSurfaceStabilizationReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.ownerReviewReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.stabilizationContinuePauseReport.blockers.map((entry, index) => ({ id: `stabilization_continue_pause_${index}`, label: "Continue/pause blocker", reason: entry, requiredAction: "Resolve before continuing." })),
    pkg.fileWritten ? { id: "stabilization_package_file_written", label: pkg.label, reason: "Package must not write files.", requiredAction: "Keep package in memory." } : undefined,
    pkg.databaseWritten ? { id: "stabilization_package_database_written", label: pkg.label, reason: "Package must not write databases.", requiredAction: "Remove persistence." } : undefined,
    pkg.analyticsSent ? { id: "stabilization_package_analytics_sent", label: pkg.label, reason: "Package must not send analytics.", requiredAction: "Remove analytics sending." } : undefined,
    pkg.externalServicesCalled ? { id: "stabilization_package_external_services_called", label: pkg.label, reason: "Package must not call external services.", requiredAction: "Keep stabilization manual." } : undefined,
    pkg.launchPerformed ? { id: "stabilization_package_launch_performed", label: pkg.label, reason: "Package must not launch Teoyube.", requiredAction: "Remove launch execution." } : undefined,
    pkg.rollbackPerformed ? { id: "stabilization_package_rollback_performed", label: pkg.label, reason: "Package must not perform rollback.", requiredAction: "Use manual rollback review only." } : undefined,
    pkg.usersContacted ? { id: "stabilization_package_users_contacted", label: pkg.label, reason: "Package must not contact users.", requiredAction: "Keep user contact outside code." } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "stabilization_package_feedback_collected", label: pkg.label, reason: "Package must not collect feedback automatically.", requiredAction: "Use manual feedback only." } : undefined,
    pkg.previewUrlFetched ? { id: "stabilization_package_preview_url_fetched", label: pkg.label, reason: "Package must not fetch preview URLs.", requiredAction: "Keep URL checks manual." } : undefined
  ].filter(Boolean) as TeoyubeSoftLaunchStabilizationPackageBlocker[];
}

export function getSoftLaunchStabilizationPackageWarnings(
  pkg: TeoyubeSoftLaunchStabilizationPackage
): TeoyubeSoftLaunchStabilizationPackageWarning[] {
  return [
    ...pkg.safeFixReleasePlanReport.warnings.map((entry) => ({ id: entry.id, label: entry.label, message: entry.message, recommendedAction: entry.recommendedAction })),
    ...pkg.safeFixReleaseSafetyReport.warnings.map((entry) => ({ id: entry.id, label: entry.label, message: entry.message, recommendedAction: entry.recommendedAction })),
    ...pkg.safeFixReleaseRunReport.warnings.map((entry) => ({ id: entry.id, label: entry.label, message: entry.message, recommendedAction: entry.recommendedAction })),
    ...pkg.stabilizationRegressionReport.warnings.map((entry) => ({ id: entry.id, label: entry.checkId || "Regression", message: entry.message, recommendedAction: entry.recommendedAction })),
    ...pkg.postReleaseSafetyReport.warnings.map((entry) => ({ id: entry.id, label: entry.label, message: entry.message, recommendedAction: entry.recommendedAction })),
    ...pkg.postReleaseSurfaceStabilizationReport.warnings.map((entry) => ({ id: entry.id, label: entry.label, message: entry.message, recommendedAction: entry.recommendedAction })),
    ...pkg.ownerReviewReport.warnings.map((entry) => ({ id: entry.id, label: entry.label, message: entry.message, recommendedAction: entry.recommendedAction }))
  ];
}

export function createSoftLaunchStabilizationPackageDecision(
  pkg: TeoyubeSoftLaunchStabilizationPackage
): TeoyubeSoftLaunchStabilizationDecision {
  const blockers = getSoftLaunchStabilizationPackageBlockers(pkg);
  if (pkg.stabilizationContinuePauseReport.decision === "prepare_rollback") return "prepare_rollback";
  if (blockers.length > 0) return "pause_for_review";
  if (pkg.ownerReviewReport.decision === "needs_owner_review") return "needs_owner_review";
  if (getSoftLaunchStabilizationPackageWarnings(pkg).length > 0) return "continue_with_warnings";
  return pkg.stabilizationContinuePauseReport.decision;
}

export function validateSoftLaunchStabilizationPackage(pkg: TeoyubeSoftLaunchStabilizationPackage) {
  const blockers = getSoftLaunchStabilizationPackageBlockers(pkg);
  return { valid: blockers.length === 0, blockers, warnings: getSoftLaunchStabilizationPackageWarnings(pkg) };
}

export function createSoftLaunchStabilizationPackageReport(
  pkg: TeoyubeSoftLaunchStabilizationPackage = createSoftLaunchStabilizationPackage()
) {
  const validation = validateSoftLaunchStabilizationPackage(pkg);
  const decision = createSoftLaunchStabilizationPackageDecision(pkg);
  return {
    valid: validation.valid,
    ready: validation.valid && ["continue_soft_launch", "continue_with_warnings", "needs_owner_review"].includes(decision),
    decision,
    package: pkg,
    blockers: validation.blockers,
    warnings: validation.warnings,
    safeFixReleaseDecision: createSoftLaunchSafeFixReleaseDecision(pkg.safeFixReleasePlanReport.plan),
    inMemoryOnly: true,
    noFixesAppliedAutomatically: true,
    noLaunchPerformed: true,
    noRollbackPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPreviewUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
