import { createPostReleaseStabilizationReport, type TeoyubePostReleaseStabilizationInput } from "./post-release-stabilization";
import { createFirstDayIssueTriageReport, type TeoyubeFirstDayIssueInput } from "./first-day-issue-triage";
import { createManualFeedbackReviewReport, type TeoyubeManualFeedbackReviewInput } from "./manual-feedback-review";
import { createSafeFixQueue, createSafeFixQueueReport, type TeoyubeSafeFixQueue } from "./safe-fix-queue";
import { createFirstDayReviewRecord, createFirstDayReviewReport, type TeoyubeFirstDayReviewInput } from "./first-day-review";
import { createStabilizationDecisionLog, createStabilizationDecisionLogReport, type TeoyubeStabilizationDecisionLog } from "./stabilization-decision-log";
import { createPhase104OwnerReviewRecord, createPhase104OwnerReviewReport, type TeoyubePhase104OwnerReviewRecord } from "./phase-10-4-owner-review";

export type TeoyubePhase104StabilizationPackageDecision =
  | "ready_for_phase_10_5"
  | "ready_with_warnings"
  | "blocked_by_first_day_review"
  | "blocked_by_build_or_local_verification"
  | "needs_owner_review";

export type TeoyubePhase104StabilizationPackage = {
  id: string;
  postReleaseStabilizationReport: ReturnType<typeof createPostReleaseStabilizationReport>;
  firstDayIssueTriageReport: ReturnType<typeof createFirstDayIssueTriageReport>;
  manualFeedbackReviewReport: ReturnType<typeof createManualFeedbackReviewReport>;
  safeFixQueueReport: ReturnType<typeof createSafeFixQueueReport>;
  firstDayReviewReport: ReturnType<typeof createFirstDayReviewReport>;
  stabilizationDecisionLogReport: ReturnType<typeof createStabilizationDecisionLogReport>;
  ownerReviewReport: ReturnType<typeof createPhase104OwnerReviewReport>;
  ownerDecisionSummary: string;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Fix build/typecheck/local verification blockers, then use Phase 10.5 for first-week stabilization.";
  noPublicLaunchPerformedByCode: true;
  noAutomaticDeployment: true;
  noAutomaticUserMonitoring: true;
  noAutomaticFeedbackCollection: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase104StabilizationPackageInput = {
  localVerificationPassed?: boolean;
  postReleaseInput?: TeoyubePostReleaseStabilizationInput;
  firstDayIssueInput?: TeoyubeFirstDayIssueInput;
  manualFeedbackInput?: TeoyubeManualFeedbackReviewInput;
  safeFixQueue?: TeoyubeSafeFixQueue;
  firstDayReviewInput?: TeoyubeFirstDayReviewInput;
  decisionLog?: TeoyubeStabilizationDecisionLog;
  ownerReview?: TeoyubePhase104OwnerReviewRecord;
  ownerDecisionSummary?: string;
};

function collect(entries: unknown[]): string[] {
  return entries.map((entry) => {
    if (typeof entry === "string") return entry;
    if (entry && typeof entry === "object") {
      const record = entry as Record<string, unknown>;
      return String(record.message || record.summary || record.details || record.id || "Phase 10.4 item needs attention.");
    }
    return "Phase 10.4 item needs attention.";
  });
}

function defaultPostReleaseInput(localVerificationPassed = false): TeoyubePostReleaseStabilizationInput {
  return {
    status: localVerificationPassed ? "reviewing" : "blocked",
    firstHourMonitoringReviewed: true,
    launchDecisionLogReviewed: true,
    unresolvedSeverity1IssuesReviewed: true,
    unresolvedSeverity2IssuesReviewed: true,
    knownSeverity3IssuesReviewed: true,
    knownSeverity4IssuesReviewed: true,
    feedbackIntakeReviewedManually: true,
    noPrivateDataExposureReported: true,
    noSecretExposureReported: true,
    noCoreRouteCrashReported: localVerificationPassed,
    noUnsafeSpiritualResponsePatternReported: true,
    noMobileBlockingIssueReported: localVerificationPassed,
    safeFixQueueReviewed: true,
    rollbackReadinessStillValid: true,
    ownerDecisionRecorded: true,
    notes: ["Phase 10.4 package is local-only; build/typecheck/local verification remains the release gate."]
  };
}

function defaultFirstDayReviewInput(localVerificationPassed = false): TeoyubeFirstDayReviewInput {
  return {
    firstHourMonitoringReviewed: true,
    launchDecisionLogReviewed: true,
    allSeverity1IssuesReviewed: true,
    allSeverity2IssuesReviewed: true,
    severity3And4IssuesCategorized: true,
    manualFeedbackReviewed: true,
    safeFixQueueReviewed: true,
    rollbackReadinessReconfirmed: true,
    knownIssuesAcceptedOrRejected: true,
    ownerDecisionRecorded: true,
    nextDayWatchItemsIdentified: true,
    firstWeekStabilizationReadinessAssessed: localVerificationPassed,
    ownerDecision: localVerificationPassed ? "move_to_first_week_stabilization" : "blocked",
    nextDayWatchItems: ["Restore local build/typecheck/runtime verification before Phase 10.5."]
  };
}

export function createPhase104StabilizationPackage(input: TeoyubePhase104StabilizationPackageInput = {}): TeoyubePhase104StabilizationPackage {
  const localVerificationPassed = input.localVerificationPassed ?? false;
  const postReleaseStabilizationReport = createPostReleaseStabilizationReport(input.postReleaseInput || defaultPostReleaseInput(localVerificationPassed));
  const firstDayIssueTriageReport = createFirstDayIssueTriageReport(input.firstDayIssueInput);
  const manualFeedbackReviewReport = createManualFeedbackReviewReport(input.manualFeedbackInput);
  const safeFixQueueReport = createSafeFixQueueReport(input.safeFixQueue || createSafeFixQueue());
  const firstDayReviewReport = createFirstDayReviewReport(createFirstDayReviewRecord(input.firstDayReviewInput || defaultFirstDayReviewInput(localVerificationPassed)));
  const stabilizationDecisionLogReport = createStabilizationDecisionLogReport(input.decisionLog || createStabilizationDecisionLog());
  const ownerReviewReport = createPhase104OwnerReviewReport(input.ownerReview || createPhase104OwnerReviewRecord({
    reviewed: true,
    nextPhase10StepAccepted: false,
    notes: ["Owner review records that Phase 10.5 is blocked until build/typecheck/local verification blockers are fixed."]
  }));
  const localVerificationBlocker = localVerificationPassed ? [] : ["Local build/typecheck/runtime verification has not passed in this workspace."];
  const blockers = [
    ...localVerificationBlocker,
    ...collect(postReleaseStabilizationReport.blockers),
    ...collect(firstDayIssueTriageReport.blockers),
    ...collect(manualFeedbackReviewReport.blockers),
    ...collect(safeFixQueueReport.blockers),
    ...collect(firstDayReviewReport.blockers),
    ...collect(stabilizationDecisionLogReport.blockers),
    ...collect(ownerReviewReport.blockers)
  ];
  const warnings = [
    ...collect(postReleaseStabilizationReport.warnings),
    ...collect(firstDayIssueTriageReport.warnings),
    ...collect(manualFeedbackReviewReport.warnings),
    ...collect(safeFixQueueReport.warnings),
    ...collect(firstDayReviewReport.warnings),
    ...collect(stabilizationDecisionLogReport.warnings),
    ...collect(ownerReviewReport.warnings)
  ];
  return {
    id: "phase_10_4_stabilization_package",
    postReleaseStabilizationReport,
    firstDayIssueTriageReport,
    manualFeedbackReviewReport,
    safeFixQueueReport,
    firstDayReviewReport,
    stabilizationDecisionLogReport,
    ownerReviewReport,
    ownerDecisionSummary: input.ownerDecisionSummary || "Manual first-day stabilization structure is prepared; no feedback is collected or stored by code.",
    blockers,
    warnings,
    nextActionRecommendation: "Fix build/typecheck/local verification blockers, then use Phase 10.5 for first-week stabilization.",
    noPublicLaunchPerformedByCode: true,
    noAutomaticDeployment: true,
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase104StabilizationPackageBlockers(pkg: TeoyubePhase104StabilizationPackage): string[] {
  return pkg.blockers;
}

export function getPhase104StabilizationPackageWarnings(pkg: TeoyubePhase104StabilizationPackage): string[] {
  return pkg.warnings;
}

export function validatePhase104StabilizationPackage(pkg: TeoyubePhase104StabilizationPackage): boolean {
  return getPhase104StabilizationPackageBlockers(pkg).length === 0;
}

export function createPhase104StabilizationPackageDecision(pkg: TeoyubePhase104StabilizationPackage): TeoyubePhase104StabilizationPackageDecision {
  if (pkg.ownerReviewReport.decision === "needs_owner_review") return "needs_owner_review";
  if (pkg.blockers.some((entry) => entry.includes("Local build/typecheck/runtime verification"))) return "blocked_by_build_or_local_verification";
  if (pkg.blockers.length) return "blocked_by_first_day_review";
  return pkg.warnings.length ? "ready_with_warnings" : "ready_for_phase_10_5";
}

export function createPhase104StabilizationPackageReport(pkg: TeoyubePhase104StabilizationPackage) {
  return {
    valid: validatePhase104StabilizationPackage(pkg),
    decision: createPhase104StabilizationPackageDecision(pkg),
    package: pkg,
    blockers: getPhase104StabilizationPackageBlockers(pkg),
    warnings: getPhase104StabilizationPackageWarnings(pkg),
    nextActionRecommendation: pkg.nextActionRecommendation,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
