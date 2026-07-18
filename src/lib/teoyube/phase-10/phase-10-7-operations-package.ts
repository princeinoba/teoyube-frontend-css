import { createManualOperationsReviewRecord, createManualOperationsReviewReport, type TeoyubeManualOperationsReviewInput } from "./manual-operations-review";
import { createOperationsDecisionLog, createOperationsDecisionLogReport, type TeoyubeOperationsDecisionLog } from "./operations-decision-log";
import { createPhase10CompletionGateRecord, createPhase10CompletionGateReport, type TeoyubePhase10CompletionGateInput } from "./phase-10-completion-gate";
import { createPhase107OwnerReviewRecord, createPhase107OwnerReviewReport, type TeoyubePhase107OwnerReviewRecord } from "./phase-10-7-owner-review";
import { createPublicTrustRefreshReviewRecord, createPublicTrustRefreshReviewReport, type TeoyubePublicTrustRefreshReviewInput } from "./public-trust-refresh-review";
import { createReleaseHealthSnapshot, createReleaseHealthSnapshotReport, type TeoyubeReleaseHealthSnapshotInput } from "./release-health-snapshot";
import { createStabilizedPublicOperationsReport, type TeoyubeStabilizedPublicOperationsInput } from "./stabilized-public-operations";
import { createWeeklyImprovementLoopReport, type TeoyubeWeeklyImprovementLoopInput } from "./weekly-improvement-loop";
import { createWeeklyKnownIssueReviewRecord, createWeeklyKnownIssueReviewReport, type TeoyubeWeeklyKnownIssueReviewInput } from "./weekly-known-issue-review";

export type TeoyubePhase107OperationsPackageDecision =
  | "ready_for_phase_11"
  | "ready_with_warnings"
  | "blocked_by_phase_10_completion_gate"
  | "blocked_by_build_or_local_verification"
  | "needs_owner_review";

export type TeoyubePhase107OperationsPackage = {
  id: string;
  stabilizedPublicOperationsReport: ReturnType<typeof createStabilizedPublicOperationsReport>;
  weeklyImprovementLoopReport: ReturnType<typeof createWeeklyImprovementLoopReport>;
  manualOperationsReviewReport: ReturnType<typeof createManualOperationsReviewReport>;
  weeklyKnownIssueReviewReport: ReturnType<typeof createWeeklyKnownIssueReviewReport>;
  publicTrustRefreshReviewReport: ReturnType<typeof createPublicTrustRefreshReviewReport>;
  releaseHealthSnapshotReport: ReturnType<typeof createReleaseHealthSnapshotReport>;
  operationsDecisionLogReport: ReturnType<typeof createOperationsDecisionLogReport>;
  phase10CompletionGateReport: ReturnType<typeof createPhase10CompletionGateReport>;
  ownerReviewReport: ReturnType<typeof createPhase107OwnerReviewReport>;
  ownerDecisionSummary: string;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Fix build/typecheck/local verification blockers before marking Phase 10 complete.";
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

export type TeoyubePhase107OperationsPackageInput = {
  localVerificationPassed?: boolean;
  stabilizedOperationsInput?: TeoyubeStabilizedPublicOperationsInput;
  weeklyImprovementLoopInput?: TeoyubeWeeklyImprovementLoopInput;
  manualOperationsInput?: TeoyubeManualOperationsReviewInput;
  weeklyKnownIssueInput?: TeoyubeWeeklyKnownIssueReviewInput;
  publicTrustRefreshInput?: TeoyubePublicTrustRefreshReviewInput;
  releaseHealthInput?: TeoyubeReleaseHealthSnapshotInput;
  operationsDecisionLog?: TeoyubeOperationsDecisionLog;
  completionGateInput?: TeoyubePhase10CompletionGateInput;
  ownerReview?: TeoyubePhase107OwnerReviewRecord;
  ownerDecisionSummary?: string;
};

function collect(entries: unknown[]): string[] {
  return entries.map((entry) => {
    if (typeof entry === "string") return entry;
    if (entry && typeof entry === "object") {
      const record = entry as Record<string, unknown>;
      return String(record.message || record.summary || record.details || record.id || "Phase 10.7 item needs attention.");
    }
    return "Phase 10.7 item needs attention.";
  });
}

function defaultOperationsInput(localVerificationPassed = false): TeoyubeStabilizedPublicOperationsInput {
  return {
    status: localVerificationPassed ? "stable_with_warnings" : "blocked",
    stabilizedOperationsHandoffReviewed: true,
    manualMonitoringCadenceDocumented: true,
    weeklyFeedbackReviewCadenceDocumented: true,
    knownIssueRegisterReviewed: true,
    safeFixBatchProcessReviewed: true,
    rollbackProcessReviewed: true,
    publicTrustRefreshProcessReviewed: true,
    noUnresolvedSeverity1Issues: true,
    noUnapprovedSeverity2Blockers: true,
    noPrivateDataExposureReported: true,
    noSecretExposureReported: true,
    noUnsafeSpiritualResponsePatternReported: true,
    scriptureAnchorsPreserved: true,
    explanationTracesPreserved: true,
    fallbackSafetyPreserved: true,
    confidenceLabelsPreserved: true,
    privacyConsentBoundariesPreserved: true,
    knownLimitationsDocumented: true,
    serviceDisabledStatePreserved: true,
    ownerDecisionRecorded: true,
    notes: ["Phase 10.7 package is local-only; build/typecheck/local verification remains the completion gate."]
  };
}

function defaultWeeklyLoopInput(): TeoyubeWeeklyImprovementLoopInput {
  return {
    reviewIsManual: true,
    noAutomaticFeedbackCollectionIntroduced: true,
    noSensitivePersonalDataStoredInCode: true,
    feedbackThemesCategorized: true,
    repeatedIssuesFlagged: true,
    knownIssuesUpdated: true,
    safeFixCandidatesPreserveBoundaries: true,
    futureEnhancementsSeparated: true,
    roadmapChangesDocumented: true,
    ownerDecisionRecorded: true,
    items: []
  };
}

function defaultManualOperationsInput(): TeoyubeManualOperationsReviewInput {
  return {
    appAvailabilityReviewedManually: true,
    coreRoutesReviewedManually: true,
    manualFeedbackReviewed: true,
    issueTriageReviewed: true,
    knownIssueRegisterReviewed: true,
    safeFixBatchProcessReviewed: true,
    rollbackReadinessReviewed: true,
    publicTrustRefreshReviewed: true,
    documentationUpdatedIfNeeded: true,
    ownerNotesRecorded: true,
    notes: ["Manual operations review remains owner-led."]
  };
}

function defaultPublicTrustRefreshInput(): TeoyubePublicTrustRefreshReviewInput {
  return {
    noDivineCertaintyClaim: true,
    noGuaranteedProphecyClaim: true,
    knownLimitationsVisibleOrDocumented: true,
    privacyConsentVisibleWhereRequired: true,
    confidenceLabelsVisibleWhereRequired: true,
    explanationTracesAvailableWhereRequired: true,
    scriptureAnchorsPreserved: true,
    fallbackStatesSafeAndClear: true,
    disabledServicesClearlyExplained: true,
    supportFeedbackExpectationsClear: true,
    noHiddenPersonalizationIntroduced: true,
    notes: ["Public trust boundaries remain in force."]
  };
}

function defaultHealthInput(localVerificationPassed = false): TeoyubeReleaseHealthSnapshotInput {
  return {
    appStabilityStatus: localVerificationPassed ? "healthy_with_warnings" : "blocked",
    routeStabilityStatus: localVerificationPassed ? "healthy_with_warnings" : "blocked",
    manualFeedbackStatus: "healthy_with_warnings",
    knownIssueStatus: "healthy_with_warnings",
    safeFixBatchStatus: "healthy_with_warnings",
    publicTrustStatus: "healthy_with_warnings",
    rollbackReadinessStatus: "healthy_with_warnings",
    ownerReviewStatus: "healthy_with_warnings",
    phase10CompletionReadiness: localVerificationPassed ? "healthy_with_warnings" : "blocked",
    notes: ["Release health snapshot is manual and local-only."]
  };
}

function defaultCompletionGateInput(localVerificationPassed = false): TeoyubePhase10CompletionGateInput {
  return {
    status: localVerificationPassed ? "complete_with_warnings" : "blocked",
    phase101Complete: true,
    phase102Complete: localVerificationPassed,
    phase103Complete: localVerificationPassed,
    phase104Complete: localVerificationPassed,
    phase105Complete: localVerificationPassed,
    phase106Complete: localVerificationPassed,
    phase107Complete: localVerificationPassed,
    buildTypecheckLocalVerificationReviewed: localVerificationPassed,
    routeQaReviewed: localVerificationPassed,
    controlledReleaseExecutionReviewed: true,
    firstDayStabilizationReviewed: true,
    firstWeekStabilizationReviewed: true,
    publicTrustReviewPassed: true,
    knownLimitationsReadinessReviewed: true,
    stabilizedOperationsHandoffReviewed: true,
    weeklyImprovementLoopCreated: true,
    noUnresolvedSeverity1Issue: true,
    noUnapprovedSeverity2Blocker: true,
    ownerApprovalRecorded: localVerificationPassed,
    notes: localVerificationPassed ? ["Phase 10 completion gate may complete with warnings after owner review."] : ["Phase 10 completion gate is blocked until local verification passes."]
  };
}

export function createPhase107OperationsPackage(input: TeoyubePhase107OperationsPackageInput = {}): TeoyubePhase107OperationsPackage {
  const localVerificationPassed = input.localVerificationPassed ?? false;
  const stabilizedPublicOperationsReport = createStabilizedPublicOperationsReport(input.stabilizedOperationsInput || defaultOperationsInput(localVerificationPassed));
  const weeklyImprovementLoopReport = createWeeklyImprovementLoopReport(input.weeklyImprovementLoopInput || defaultWeeklyLoopInput());
  const manualOperationsReviewReport = createManualOperationsReviewReport(createManualOperationsReviewRecord(input.manualOperationsInput || defaultManualOperationsInput()));
  const weeklyKnownIssueReviewReport = createWeeklyKnownIssueReviewReport(createWeeklyKnownIssueReviewRecord(input.weeklyKnownIssueInput || { items: [] }));
  const publicTrustRefreshReviewReport = createPublicTrustRefreshReviewReport(createPublicTrustRefreshReviewRecord(input.publicTrustRefreshInput || defaultPublicTrustRefreshInput()));
  const releaseHealthSnapshotReport = createReleaseHealthSnapshotReport(createReleaseHealthSnapshot(input.releaseHealthInput || defaultHealthInput(localVerificationPassed)));
  const operationsDecisionLogReport = createOperationsDecisionLogReport(input.operationsDecisionLog || createOperationsDecisionLog());
  const phase10CompletionGateReport = createPhase10CompletionGateReport(createPhase10CompletionGateRecord(input.completionGateInput || defaultCompletionGateInput(localVerificationPassed)));
  const ownerReviewReport = createPhase107OwnerReviewReport(input.ownerReview || createPhase107OwnerReviewRecord({
    reviewed: true,
    nextMajorMilestoneAccepted: false,
    notes: ["Owner review records that Phase 11 is blocked until build/typecheck/local verification and Phase 10 completion gate blockers are fixed."]
  }));
  const localVerificationBlocker = localVerificationPassed ? [] : ["Local build/typecheck/runtime verification has not passed in this workspace."];
  const blockers = [
    ...localVerificationBlocker,
    ...collect(stabilizedPublicOperationsReport.blockers),
    ...collect(weeklyImprovementLoopReport.blockers),
    ...collect(manualOperationsReviewReport.blockers),
    ...collect(weeklyKnownIssueReviewReport.blockers),
    ...collect(publicTrustRefreshReviewReport.blockers),
    ...collect(releaseHealthSnapshotReport.blockers),
    ...collect(operationsDecisionLogReport.blockers),
    ...collect(phase10CompletionGateReport.blockers),
    ...collect(ownerReviewReport.blockers)
  ];
  const warnings = [
    ...collect(stabilizedPublicOperationsReport.warnings),
    ...collect(weeklyImprovementLoopReport.warnings),
    ...collect(manualOperationsReviewReport.warnings),
    ...collect(weeklyKnownIssueReviewReport.warnings),
    ...collect(publicTrustRefreshReviewReport.warnings),
    ...collect(releaseHealthSnapshotReport.warnings),
    ...collect(operationsDecisionLogReport.warnings),
    ...collect(phase10CompletionGateReport.warnings),
    ...collect(ownerReviewReport.warnings)
  ];
  return {
    id: "phase_10_7_operations_package",
    stabilizedPublicOperationsReport,
    weeklyImprovementLoopReport,
    manualOperationsReviewReport,
    weeklyKnownIssueReviewReport,
    publicTrustRefreshReviewReport,
    releaseHealthSnapshotReport,
    operationsDecisionLogReport,
    phase10CompletionGateReport,
    ownerReviewReport,
    ownerDecisionSummary: input.ownerDecisionSummary || "Manual stabilized operations and Phase 10 completion gate structure is prepared; no launch, expansion, deployment, monitoring, feedback collection, or external sending is performed by code.",
    blockers,
    warnings,
    nextActionRecommendation: "Fix build/typecheck/local verification blockers before marking Phase 10 complete.",
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

export function getPhase107OperationsPackageBlockers(pkg: TeoyubePhase107OperationsPackage): string[] {
  return pkg.blockers;
}

export function getPhase107OperationsPackageWarnings(pkg: TeoyubePhase107OperationsPackage): string[] {
  return pkg.warnings;
}

export function validatePhase107OperationsPackage(pkg: TeoyubePhase107OperationsPackage): boolean {
  return getPhase107OperationsPackageBlockers(pkg).length === 0;
}

export function createPhase107OperationsPackageDecision(pkg: TeoyubePhase107OperationsPackage): TeoyubePhase107OperationsPackageDecision {
  if (pkg.ownerReviewReport.decision === "needs_owner_review") return "needs_owner_review";
  if (pkg.blockers.some((entry) => entry.includes("Local build/typecheck/runtime verification"))) return "blocked_by_build_or_local_verification";
  if (pkg.phase10CompletionGateReport.decision === "blocked" || pkg.blockers.length) return "blocked_by_phase_10_completion_gate";
  return pkg.warnings.length ? "ready_with_warnings" : "ready_for_phase_11";
}

export function createPhase107OperationsPackageReport(pkg: TeoyubePhase107OperationsPackage) {
  return {
    valid: validatePhase107OperationsPackage(pkg),
    decision: createPhase107OperationsPackageDecision(pkg),
    package: pkg,
    blockers: getPhase107OperationsPackageBlockers(pkg),
    warnings: getPhase107OperationsPackageWarnings(pkg),
    nextActionRecommendation: pkg.nextActionRecommendation,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
