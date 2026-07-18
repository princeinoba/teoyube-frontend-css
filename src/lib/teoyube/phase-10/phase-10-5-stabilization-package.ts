import { createControlledReleaseExpansionRecord, createControlledReleaseExpansionReport, type TeoyubeControlledReleaseExpansionInput } from "./controlled-release-expansion-decision";
import { createFirstWeekStabilizationDecisionLog, createFirstWeekStabilizationDecisionLogReport, type TeoyubeFirstWeekStabilizationDecisionLog } from "./first-week-stabilization-decision-log";
import { createFirstWeekStabilizationReport, type TeoyubeFirstWeekStabilizationInput } from "./first-week-stabilization";
import { createKnownIssueRegister, createKnownIssueRegisterReport, type TeoyubeKnownIssueRegister } from "./known-issue-register";
import { createManualFeedbackLoopReport, type TeoyubeManualFeedbackLoopInput } from "./manual-feedback-loop";
import { createPhase105OwnerReviewRecord, createPhase105OwnerReviewReport, type TeoyubePhase105OwnerReviewRecord } from "./phase-10-5-owner-review";
import { createRepeatedIssuePatternReport, type TeoyubeRepeatedIssuePatternRecord } from "./repeated-issue-pattern-review";
import { createSafeFixBatch, createSafeFixBatchReport, type TeoyubeSafeFixBatch } from "./safe-fix-batch-review";

export type TeoyubePhase105StabilizationPackageDecision =
  | "ready_for_phase_10_6"
  | "ready_with_warnings"
  | "blocked_by_first_week_review"
  | "blocked_by_build_or_local_verification"
  | "needs_owner_review";

export type TeoyubePhase105StabilizationPackage = {
  id: string;
  firstWeekStabilizationReport: ReturnType<typeof createFirstWeekStabilizationReport>;
  manualFeedbackLoopReport: ReturnType<typeof createManualFeedbackLoopReport>;
  repeatedIssuePatternReport: ReturnType<typeof createRepeatedIssuePatternReport>;
  knownIssueRegisterReport: ReturnType<typeof createKnownIssueRegisterReport>;
  safeFixBatchReviewReport: ReturnType<typeof createSafeFixBatchReport>;
  controlledReleaseExpansionDecisionReport: ReturnType<typeof createControlledReleaseExpansionReport>;
  firstWeekStabilizationDecisionLogReport: ReturnType<typeof createFirstWeekStabilizationDecisionLogReport>;
  ownerReviewReport: ReturnType<typeof createPhase105OwnerReviewReport>;
  ownerDecisionSummary: string;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Fix build/typecheck/local verification blockers, then use Phase 10.6 for controlled release expansion readiness and operations handoff.";
  noPublicExpansionPerformedByCode: true;
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

export type TeoyubePhase105StabilizationPackageInput = {
  localVerificationPassed?: boolean;
  firstWeekInput?: TeoyubeFirstWeekStabilizationInput;
  manualFeedbackLoopInput?: TeoyubeManualFeedbackLoopInput;
  repeatedIssuePatterns?: TeoyubeRepeatedIssuePatternRecord[];
  knownIssueRegister?: TeoyubeKnownIssueRegister;
  safeFixBatch?: TeoyubeSafeFixBatch;
  controlledExpansionInput?: TeoyubeControlledReleaseExpansionInput;
  decisionLog?: TeoyubeFirstWeekStabilizationDecisionLog;
  ownerReview?: TeoyubePhase105OwnerReviewRecord;
  ownerDecisionSummary?: string;
};

function collect(entries: unknown[]): string[] {
  return entries.map((entry) => {
    if (typeof entry === "string") return entry;
    if (entry && typeof entry === "object") {
      const record = entry as Record<string, unknown>;
      return String(record.message || record.summary || record.details || record.id || "Phase 10.5 item needs attention.");
    }
    return "Phase 10.5 item needs attention.";
  });
}

function defaultFirstWeekInput(localVerificationPassed = false): TeoyubeFirstWeekStabilizationInput {
  return {
    status: localVerificationPassed ? "stable_with_warnings" : "blocked",
    firstDayReviewCompleted: true,
    unresolvedSeverity1IssuesReviewed: true,
    unresolvedSeverity2IssuesReviewed: true,
    severity3And4IssuesCategorized: true,
    manualFeedbackReviewedDaily: true,
    repeatedIssuesIdentified: true,
    safeFixQueueReviewed: true,
    safeFixBatchCandidatesReviewed: true,
    knownIssueRegisterUpdated: true,
    rollbackReadinessReconfirmed: true,
    ownerDecisionRecorded: true,
    noPrivateDataExposureReported: true,
    noSecretExposureReported: true,
    noUnsafeSpiritualResponsePatternReported: true,
    scriptureAnchorsPreserved: true,
    explanationTracesPreserved: true,
    fallbackSafetyPreserved: true,
    confidenceLabelsPreserved: true,
    privacyConsentBoundariesPreserved: true,
    serviceDisabledStatePreserved: true,
    notes: ["Phase 10.5 package is local-only; build/typecheck/local verification remains the release gate."]
  };
}

function defaultManualFeedbackInput(): TeoyubeManualFeedbackLoopInput {
  return {
    feedbackSourceManual: true,
    noAutomaticFeedbackCollectionIntroduced: true,
    noSensitivePersonalDataStoredInCode: true,
    feedbackCategorized: true,
    repeatedIssuesFlagged: true,
    spiritualSafetyConcernsEscalated: true,
    routePageConcernsLinked: true,
    safeFixCandidatesPreserveBoundaries: true,
    futureEnhancementsSeparated: true,
    noVanityMetricsOrHiddenTracking: true,
    items: []
  };
}

function defaultControlledExpansionInput(localVerificationPassed = false): TeoyubeControlledReleaseExpansionInput {
  return {
    status: localVerificationPassed ? "remain_limited" : "blocked",
    selectedExpansionLevel: "remain_limited_public",
    firstWeekStabilizationReviewed: true,
    manualFeedbackLoopReviewed: true,
    repeatedIssuePatternsReviewed: true,
    knownIssueRegisterReviewed: true,
    safeFixBatchReviewed: true,
    noUnresolvedSeverity1Issues: true,
    noExpansionBlockingSeverity2Issues: true,
    rollbackReadinessConfirmed: true,
    ownerApprovalRecorded: true,
    safetyBoundariesPreserved: true,
    controlledExpansionLevelSelected: true,
    conditionsDocumentedIfApplicable: true,
    conditions: localVerificationPassed ? ["Remain limited until Phase 10.6 readiness review."] : ["Expansion is blocked until local verification passes."]
  };
}

export function createPhase105StabilizationPackage(input: TeoyubePhase105StabilizationPackageInput = {}): TeoyubePhase105StabilizationPackage {
  const localVerificationPassed = input.localVerificationPassed ?? false;
  const firstWeekStabilizationReport = createFirstWeekStabilizationReport(input.firstWeekInput || defaultFirstWeekInput(localVerificationPassed));
  const manualFeedbackLoopReport = createManualFeedbackLoopReport(input.manualFeedbackLoopInput || defaultManualFeedbackInput());
  const repeatedIssuePatternReport = createRepeatedIssuePatternReport(input.repeatedIssuePatterns || []);
  const knownIssueRegisterReport = createKnownIssueRegisterReport(input.knownIssueRegister || createKnownIssueRegister());
  const safeFixBatchReviewReport = createSafeFixBatchReport(input.safeFixBatch || createSafeFixBatch());
  const controlledReleaseExpansionDecisionReport = createControlledReleaseExpansionReport(createControlledReleaseExpansionRecord(input.controlledExpansionInput || defaultControlledExpansionInput(localVerificationPassed)));
  const firstWeekStabilizationDecisionLogReport = createFirstWeekStabilizationDecisionLogReport(input.decisionLog || createFirstWeekStabilizationDecisionLog());
  const ownerReviewReport = createPhase105OwnerReviewReport(input.ownerReview || createPhase105OwnerReviewRecord({
    reviewed: true,
    nextPhase10StepAccepted: false,
    notes: ["Owner review records that Phase 10.6 is blocked until build/typecheck/local verification blockers are fixed."]
  }));
  const localVerificationBlocker = localVerificationPassed ? [] : ["Local build/typecheck/runtime verification has not passed in this workspace."];
  const blockers = [
    ...localVerificationBlocker,
    ...collect(firstWeekStabilizationReport.blockers),
    ...collect(manualFeedbackLoopReport.blockers),
    ...collect(repeatedIssuePatternReport.blockers),
    ...collect(knownIssueRegisterReport.blockers),
    ...collect(safeFixBatchReviewReport.blockers),
    ...collect(controlledReleaseExpansionDecisionReport.blockers),
    ...collect(firstWeekStabilizationDecisionLogReport.blockers),
    ...collect(ownerReviewReport.blockers)
  ];
  const warnings = [
    ...collect(firstWeekStabilizationReport.warnings),
    ...collect(manualFeedbackLoopReport.warnings),
    ...collect(repeatedIssuePatternReport.warnings),
    ...collect(knownIssueRegisterReport.warnings),
    ...collect(safeFixBatchReviewReport.warnings),
    ...collect(controlledReleaseExpansionDecisionReport.warnings),
    ...collect(firstWeekStabilizationDecisionLogReport.warnings),
    ...collect(ownerReviewReport.warnings)
  ];
  return {
    id: "phase_10_5_stabilization_package",
    firstWeekStabilizationReport,
    manualFeedbackLoopReport,
    repeatedIssuePatternReport,
    knownIssueRegisterReport,
    safeFixBatchReviewReport,
    controlledReleaseExpansionDecisionReport,
    firstWeekStabilizationDecisionLogReport,
    ownerReviewReport,
    ownerDecisionSummary: input.ownerDecisionSummary || "Manual first-week stabilization structure is prepared; no expansion, feedback collection, monitoring, or external sending is performed by code.",
    blockers,
    warnings,
    nextActionRecommendation: "Fix build/typecheck/local verification blockers, then use Phase 10.6 for controlled release expansion readiness and operations handoff.",
    noPublicExpansionPerformedByCode: true,
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

export function getPhase105StabilizationPackageBlockers(pkg: TeoyubePhase105StabilizationPackage): string[] {
  return pkg.blockers;
}

export function getPhase105StabilizationPackageWarnings(pkg: TeoyubePhase105StabilizationPackage): string[] {
  return pkg.warnings;
}

export function validatePhase105StabilizationPackage(pkg: TeoyubePhase105StabilizationPackage): boolean {
  return getPhase105StabilizationPackageBlockers(pkg).length === 0;
}

export function createPhase105StabilizationPackageDecision(pkg: TeoyubePhase105StabilizationPackage): TeoyubePhase105StabilizationPackageDecision {
  if (pkg.ownerReviewReport.decision === "needs_owner_review") return "needs_owner_review";
  if (pkg.blockers.some((entry) => entry.includes("Local build/typecheck/runtime verification"))) return "blocked_by_build_or_local_verification";
  if (pkg.blockers.length) return "blocked_by_first_week_review";
  return pkg.warnings.length ? "ready_with_warnings" : "ready_for_phase_10_6";
}

export function createPhase105StabilizationPackageReport(pkg: TeoyubePhase105StabilizationPackage) {
  return {
    valid: validatePhase105StabilizationPackage(pkg),
    decision: createPhase105StabilizationPackageDecision(pkg),
    package: pkg,
    blockers: getPhase105StabilizationPackageBlockers(pkg),
    warnings: getPhase105StabilizationPackageWarnings(pkg),
    nextActionRecommendation: pkg.nextActionRecommendation,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
