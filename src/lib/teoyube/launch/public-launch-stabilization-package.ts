import { createPublicDailyReviewActionItem, createPublicDailyReviewRecord, createPublicDailyReviewReport } from "./public-daily-review-manager";
import { createPublicFixQueue, addPublicFixQueueItem, createPublicFixQueueReport } from "./public-fix-queue-manager";
import type { TeoyubePublicFixQueue } from "./public-fix-queue-contracts";
import type { TeoyubePublicFixQueueItem } from "./public-feedback-triage-contracts";
import { createPublicPauseContinueReport } from "./public-pause-continue-decision";
import type { TeoyubePublicStabilizationDecision } from "./public-safe-fix-release-contracts";
import { createPublicSafeFixReleaseDecision, createPublicSafeFixReleasePlan, createPublicSafeFixReleasePlanReport } from "./public-safe-fix-release-planner";
import { createPublicSafeFixReleaseRun, createPublicSafeFixReleaseRunReport, recordPublicSafeFixReleased } from "./public-safe-fix-release-recorder";
import { createPublicSafeFixReleaseSafetyReport } from "./public-safe-fix-release-safety";
import { createPublicPostReleaseSafetyReport } from "./public-post-release-safety-verification";
import { createPublicPostReleaseSurfaceStabilizationReport } from "./public-post-release-surface-stabilization";
import { createPublicStabilizationContinuePauseReport } from "./public-stabilization-continue-pause";
import { createPublicStabilizationOwnerReviewRecord, createPublicStabilizationOwnerReviewReport } from "./public-stabilization-owner-review";
import { createPublicStabilizationRegressionReport, createPublicStabilizationRegressionRun, recordPublicStabilizationRegressionResult } from "./public-stabilization-regression-runner";

export type TeoyubePublicLaunchStabilizationPackageBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubePublicLaunchStabilizationPackageWarning = {
  id: string;
  label: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubePublicLaunchStabilizationPackage = {
  id: string;
  label: string;
  safeFixReleasePlanReport: ReturnType<typeof createPublicSafeFixReleasePlanReport>;
  safeFixReleaseSafetyReport: ReturnType<typeof createPublicSafeFixReleaseSafetyReport>;
  safeFixReleaseRunReport: ReturnType<typeof createPublicSafeFixReleaseRunReport>;
  stabilizationRegressionReport: ReturnType<typeof createPublicStabilizationRegressionReport>;
  postReleaseSafetyReport: ReturnType<typeof createPublicPostReleaseSafetyReport>;
  postReleaseSurfaceStabilizationReport: ReturnType<typeof createPublicPostReleaseSurfaceStabilizationReport>;
  fixQueueReport: ReturnType<typeof createPublicFixQueueReport>;
  dailyReviewReport: ReturnType<typeof createPublicDailyReviewReport>;
  pauseContinueReport: ReturnType<typeof createPublicPauseContinueReport>;
  ownerReviewReport: ReturnType<typeof createPublicStabilizationOwnerReviewReport>;
  stabilizationContinuePauseReport: ReturnType<typeof createPublicStabilizationContinuePauseReport>;
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
  publicUrlFetched: false;
  liveAiOrchestrationEnabled: false;
  generatedAt: string;
};

function createDefaultPublicStabilizationFixQueue(): TeoyubePublicFixQueue {
  const safeFix: TeoyubePublicFixQueueItem = {
    id: "public_safe_copy_clarity_fix_6_4",
    title: "Clarify public empty-state wording",
    category: "public_copy",
    severity: "low",
    priority: "low",
    publicLaunchCritical: false,
    publicSafetyCritical: false,
    proposedFix: "Update local public empty-state copy while preserving Scripture anchors, explanation paths, fallback safety, confidence labels, consent controls, public privacy terms consent notices, and manual feedback intake.",
    verificationRequired: ["public_copy_regression", "public_privacy_terms_consent_regression", "owner_review"],
    status: "planned",
    manualOnly: true
  };
  return addPublicFixQueueItem(createPublicFixQueue(), safeFix);
}

function createPassingPublicStabilizationRegressionReport() {
  let run = createPublicStabilizationRegressionRun();
  for (const check of run.checks) {
    run = recordPublicStabilizationRegressionResult(run, {
      checkId: check.id,
      type: check.type,
      status: "pass",
      summary: `${check.label} recorded as passing for the sample public stabilization package.`,
      required: check.required,
      publicLaunchCritical: check.publicLaunchCritical
    });
  }
  return createPublicStabilizationRegressionReport(run);
}

function createPublicReleaseRunReport(planReport: ReturnType<typeof createPublicSafeFixReleasePlanReport>) {
  let run = createPublicSafeFixReleaseRun();
  const candidate = planReport.plan.safeLocalFixes[0];
  if (candidate) {
    run = recordPublicSafeFixReleased(run, {
      candidateId: candidate.id,
      sourceFixQueueItemId: candidate.sourceFixQueueItemId,
      filesChanged: [],
      fixSummary: "Sample public safe local fix release recorded in memory only.",
      safetyStatus: "passed",
      regressionChecksRequired: candidate.regressionChecks,
      verificationStatus: "passed"
    });
  }
  return createPublicSafeFixReleaseRunReport(run);
}

export function createPublicLaunchStabilizationPackage(
  input: Partial<TeoyubePublicLaunchStabilizationPackage> & { fixQueue?: TeoyubePublicFixQueue } = {}
): TeoyubePublicLaunchStabilizationPackage {
  const fixQueue = input.fixQueue || createDefaultPublicStabilizationFixQueue();
  const fixQueueReport = input.fixQueueReport || createPublicFixQueueReport(fixQueue);
  const safeFixPlan = createPublicSafeFixReleasePlan(fixQueue);
  const safeFixReleasePlanReport = input.safeFixReleasePlanReport || createPublicSafeFixReleasePlanReport(safeFixPlan);
  const safeFixReleaseSafetyReport = input.safeFixReleaseSafetyReport || createPublicSafeFixReleaseSafetyReport(safeFixPlan);
  const safeFixReleaseRunReport = input.safeFixReleaseRunReport || createPublicReleaseRunReport(safeFixReleasePlanReport);
  const stabilizationRegressionReport = input.stabilizationRegressionReport || createPassingPublicStabilizationRegressionReport();
  const postReleaseSafetyReport = input.postReleaseSafetyReport || createPublicPostReleaseSafetyReport();
  const postReleaseSurfaceStabilizationReport = input.postReleaseSurfaceStabilizationReport || createPublicPostReleaseSurfaceStabilizationReport();
  const dailyReviewReport = input.dailyReviewReport || createPublicDailyReviewReport([
    createPublicDailyReviewRecord({
      status: "healthy",
      feedbackVolume: 0,
      criticalFeedbackCount: 0,
      publicFixQueueBlockerCount: 0,
      actionItems: [
        createPublicDailyReviewActionItem({
          id: "prepare_public_launch_completion_review",
          label: "Prepare Public Launch Execution 6.5 completion review.",
          requiredBeforeNextDay: false,
          publicLaunchCritical: false
        })
      ]
    })
  ]);
  const pauseContinueReport = input.pauseContinueReport || createPublicPauseContinueReport({
    fixQueueReport,
    dailyReviewReport,
    ownerReviewAccepted: true
  });
  const ownerReviewReport = input.ownerReviewReport || createPublicStabilizationOwnerReviewReport(
    createPublicStabilizationOwnerReviewRecord({ ownerDecision: "continue_public_launch" })
  );
  const stabilizationContinuePauseReport = input.stabilizationContinuePauseReport || createPublicStabilizationContinuePauseReport({
    unresolvedPublicLaunchCriticalIssues: 0,
    publicFixQueueBlockers: fixQueueReport.blockers.length,
    releasePlanBlockers: safeFixReleasePlanReport.blockers.length,
    releaseSafetyBlockers: safeFixReleaseSafetyReport.blockers.length,
    releaseRunBlockers: safeFixReleaseRunReport.blockers.length,
    regressionBlockers: stabilizationRegressionReport.blockers.length,
    postReleaseSafetyBlockers: postReleaseSafetyReport.blockers.length,
    surfaceStabilizationBlockers: postReleaseSurfaceStabilizationReport.blockers.length,
    feedbackTriageDecision: "continue_public_launch",
    dailyReviewDecision: dailyReviewReport.decision,
    ownerReviewDecision: ownerReviewReport.decision,
    ownerReviewAccepted: ownerReviewReport.ready,
    pauseRollbackWatchStatus: "healthy",
    warningCount: safeFixReleasePlanReport.warnings.length + safeFixReleaseSafetyReport.warnings.length + safeFixReleaseRunReport.warningCount + stabilizationRegressionReport.warnings.length + postReleaseSafetyReport.warnings.length + postReleaseSurfaceStabilizationReport.warnings.length
  });

  return {
    id: input.id || "public_launch_stabilization_package_6_4",
    label: input.label || "Public Launch Safe Fix Release & Stabilization Package",
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
      "Public safe-fix release records remain manual and in-memory.",
      "Actual deployment, rollback, user contact, public URL checks, provider setup, analytics, persistence, and live AI orchestration remain outside this module."
    ],
    nextActionRecommendation: input.nextActionRecommendation || "Public Launch Execution 6.5 - Public Launch Completion Review & Post-Launch Readiness",
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
    publicUrlFetched: false,
    liveAiOrchestrationEnabled: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPublicLaunchStabilizationPackageBlockers(
  pkg: TeoyubePublicLaunchStabilizationPackage
): TeoyubePublicLaunchStabilizationPackageBlocker[] {
  return [
    ...pkg.safeFixReleasePlanReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.safeFixReleaseSafetyReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.safeFixReleaseRunReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.stabilizationRegressionReport.blockers.map((entry) => ({ id: entry.id, label: entry.checkId || "Regression", reason: entry.message, requiredAction: entry.requiredAction })),
    ...pkg.postReleaseSafetyReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.postReleaseSurfaceStabilizationReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.ownerReviewReport.blockers.map((entry) => ({ id: entry.id, label: entry.label, reason: entry.reason, requiredAction: entry.requiredAction })),
    ...pkg.stabilizationContinuePauseReport.blockers.map((entry, index) => ({ id: `public_stabilization_continue_pause_${index}`, label: "Public continue/pause blocker", reason: entry, requiredAction: "Resolve before continuing public launch stabilization." })),
    pkg.fileWritten ? { id: "public_stabilization_package_file_written", label: pkg.label, reason: "Package must not write files.", requiredAction: "Keep package in memory." } : undefined,
    pkg.databaseWritten ? { id: "public_stabilization_package_database_written", label: pkg.label, reason: "Package must not write databases.", requiredAction: "Remove persistence." } : undefined,
    pkg.analyticsSent ? { id: "public_stabilization_package_analytics_sent", label: pkg.label, reason: "Package must not send analytics.", requiredAction: "Remove analytics sending." } : undefined,
    pkg.externalServicesCalled ? { id: "public_stabilization_package_external_services_called", label: pkg.label, reason: "Package must not call external services.", requiredAction: "Keep stabilization manual." } : undefined,
    pkg.launchPerformed ? { id: "public_stabilization_package_launch_performed", label: pkg.label, reason: "Package must not launch Teoyube.", requiredAction: "Remove launch execution." } : undefined,
    pkg.rollbackPerformed ? { id: "public_stabilization_package_rollback_performed", label: pkg.label, reason: "Package must not perform rollback.", requiredAction: "Use manual rollback review only." } : undefined,
    pkg.usersContacted ? { id: "public_stabilization_package_users_contacted", label: pkg.label, reason: "Package must not contact users.", requiredAction: "Keep user contact outside code." } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "public_stabilization_package_feedback_collected", label: pkg.label, reason: "Package must not collect feedback automatically.", requiredAction: "Use manual feedback only." } : undefined,
    pkg.publicUrlFetched ? { id: "public_stabilization_package_public_url_fetched", label: pkg.label, reason: "Package must not fetch public URLs.", requiredAction: "Keep URL checks manual." } : undefined,
    pkg.liveAiOrchestrationEnabled ? { id: "public_stabilization_package_live_ai", label: pkg.label, reason: "Package must not enable live AI orchestration.", requiredAction: "Keep live AI orchestration disabled." } : undefined
  ].filter(Boolean) as TeoyubePublicLaunchStabilizationPackageBlocker[];
}

export function getPublicLaunchStabilizationPackageWarnings(
  pkg: TeoyubePublicLaunchStabilizationPackage
): TeoyubePublicLaunchStabilizationPackageWarning[] {
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

export function createPublicLaunchStabilizationPackageDecision(
  pkg: TeoyubePublicLaunchStabilizationPackage
): TeoyubePublicStabilizationDecision {
  const blockers = getPublicLaunchStabilizationPackageBlockers(pkg);
  if (pkg.stabilizationContinuePauseReport.decision === "prepare_rollback") return "prepare_rollback";
  if (blockers.length > 0) return "pause_for_review";
  if (pkg.ownerReviewReport.decision === "needs_owner_review") return "needs_owner_review";
  if (getPublicLaunchStabilizationPackageWarnings(pkg).length > 0) return "continue_with_warnings";
  return pkg.stabilizationContinuePauseReport.decision;
}

export function validatePublicLaunchStabilizationPackage(pkg: TeoyubePublicLaunchStabilizationPackage) {
  const blockers = getPublicLaunchStabilizationPackageBlockers(pkg);
  return { valid: blockers.length === 0, blockers, warnings: getPublicLaunchStabilizationPackageWarnings(pkg) };
}

export function createPublicLaunchStabilizationPackageReport(
  pkg: TeoyubePublicLaunchStabilizationPackage = createPublicLaunchStabilizationPackage()
) {
  const validation = validatePublicLaunchStabilizationPackage(pkg);
  const decision = createPublicLaunchStabilizationPackageDecision(pkg);
  return {
    valid: validation.valid,
    ready: validation.valid && ["continue_public_launch", "continue_with_warnings", "needs_owner_review"].includes(decision),
    decision,
    package: pkg,
    blockers: validation.blockers,
    warnings: validation.warnings,
    safeFixReleaseDecision: createPublicSafeFixReleaseDecision(pkg.safeFixReleasePlanReport.plan),
    inMemoryOnly: true,
    noFixesAppliedAutomatically: true,
    noLaunchPerformed: true,
    noRollbackPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
