import { createControlledExpansionGateRecord, createControlledExpansionGateReport, type TeoyubeControlledExpansionGateInput } from "./controlled-expansion-gate";
import { createControlledReleaseExpansionReadinessReport, type TeoyubeControlledReleaseExpansionReadinessInput } from "./controlled-release-expansion-readiness";
import { createKnownLimitationsReadinessRecord, createKnownLimitationsReadinessReport, type TeoyubeKnownLimitationsReadinessInput } from "./known-limitations-readiness";
import { createPhase106OwnerReviewRecord, createPhase106OwnerReviewReport, type TeoyubePhase106OwnerReviewRecord } from "./phase-10-6-owner-review";
import { createPublicSafetyBoundaryReviewRecord, createPublicSafetyBoundaryReviewReport, type TeoyubePublicSafetyBoundaryReviewInput } from "./public-safety-boundary-review";
import { createPublicTrustReviewRecord, createPublicTrustReviewReport, type TeoyubePublicTrustReviewInput } from "./public-trust-review";
import { createStabilizedOperationsHandoffRecord, createStabilizedOperationsHandoffReport, type TeoyubeStabilizedOperationsHandoffInput } from "./stabilized-operations-handoff";
import { createStabilizedOperationsRunbookRecord, createStabilizedOperationsRunbookReport, type TeoyubeStabilizedOperationsRunbookInput } from "./stabilized-operations-runbook";

export type TeoyubePhase106OperationsPackageDecision =
  | "ready_for_phase_10_7"
  | "ready_with_warnings"
  | "blocked_by_operations_review"
  | "blocked_by_build_or_local_verification"
  | "needs_owner_review";

export type TeoyubePhase106OperationsPackage = {
  id: string;
  controlledReleaseExpansionReadinessReport: ReturnType<typeof createControlledReleaseExpansionReadinessReport>;
  publicTrustReviewReport: ReturnType<typeof createPublicTrustReviewReport>;
  knownLimitationsReadinessReport: ReturnType<typeof createKnownLimitationsReadinessReport>;
  publicSafetyBoundaryReviewReport: ReturnType<typeof createPublicSafetyBoundaryReviewReport>;
  stabilizedOperationsHandoffReport: ReturnType<typeof createStabilizedOperationsHandoffReport>;
  controlledExpansionGateReport: ReturnType<typeof createControlledExpansionGateReport>;
  stabilizedOperationsRunbookReport: ReturnType<typeof createStabilizedOperationsRunbookReport>;
  ownerReviewReport: ReturnType<typeof createPhase106OwnerReviewReport>;
  ownerDecisionSummary: string;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Fix build/typecheck/local verification blockers, then use Phase 10.7 for stabilized public operations and Phase 10 completion gate.";
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

export type TeoyubePhase106OperationsPackageInput = {
  localVerificationPassed?: boolean;
  expansionReadinessInput?: TeoyubeControlledReleaseExpansionReadinessInput;
  publicTrustInput?: TeoyubePublicTrustReviewInput;
  knownLimitationsInput?: TeoyubeKnownLimitationsReadinessInput;
  publicSafetyInput?: TeoyubePublicSafetyBoundaryReviewInput;
  handoffInput?: TeoyubeStabilizedOperationsHandoffInput;
  gateInput?: TeoyubeControlledExpansionGateInput;
  runbookInput?: TeoyubeStabilizedOperationsRunbookInput;
  ownerReview?: TeoyubePhase106OwnerReviewRecord;
  ownerDecisionSummary?: string;
};

function collect(entries: unknown[]): string[] {
  return entries.map((entry) => {
    if (typeof entry === "string") return entry;
    if (entry && typeof entry === "object") {
      const record = entry as Record<string, unknown>;
      return String(record.message || record.summary || record.details || record.id || "Phase 10.6 item needs attention.");
    }
    return "Phase 10.6 item needs attention.";
  });
}

function defaultExpansionReadinessInput(localVerificationPassed = false): TeoyubeControlledReleaseExpansionReadinessInput {
  return {
    status: localVerificationPassed ? "ready_with_conditions" : "blocked",
    phase105FirstWeekStabilizationReviewed: true,
    manualFeedbackLoopReviewed: true,
    repeatedIssuePatternsReviewed: true,
    knownIssueRegisterReviewed: true,
    safeFixBatchReviewCompleted: true,
    noUnresolvedSeverity1Issues: true,
    noUnresolvedExpansionBlockingSeverity2Issues: true,
    noPrivateDataExposureReported: true,
    noSecretExposureReported: true,
    noUnsafeSpiritualResponsePatternReported: true,
    rollbackReadinessConfirmed: true,
    supportExpectationsDocumented: true,
    publicTrustReviewCompleted: true,
    ownerApprovalRecorded: true,
    scriptureAnchorsPreserved: true,
    explanationTracesPreserved: true,
    fallbackSafetyPreserved: true,
    confidenceLabelsPreserved: true,
    privacyConsentBoundariesPreserved: true,
    knownLimitationsVisibleOrDocumented: true,
    serviceDisabledStatePreserved: true,
    notes: ["Phase 10.6 package is local-only; build/typecheck/local verification remains the release gate."]
  };
}

function defaultPublicTrustInput(): TeoyubePublicTrustReviewInput {
  return {
    status: "trusted_with_conditions",
    noDivineCertaintyClaim: true,
    noGuaranteedProphecyClaim: true,
    noProfessionalAdviceReplacement: true,
    knownLimitationsVisibleOrDocumented: true,
    privacyNoticeVisibleWhereRequired: true,
    consentNoticeVisibleWhereRequired: true,
    confidenceLabelsVisibleWhereRequired: true,
    explanationTracesAvailableWhereRequired: true,
    scriptureAnchorsPreserved: true,
    fallbackStatesSafeAndClear: true,
    disabledServicesClearlyExplained: true,
    controlledReleaseStatusClear: true,
    supportFeedbackExpectationsClear: true,
    noHiddenPersonalizationIntroduced: true,
    conditions: ["Remain limited until local verification passes."]
  };
}

function defaultKnownLimitationsInput(): TeoyubeKnownLimitationsReadinessInput {
  return {
    controlledReleaseStatusDocumented: true,
    unfinishedFeaturesNotPresentedAsComplete: true,
    disabledServicesClearlyIdentified: true,
    liveAiLimitationsClear: true,
    manualFeedbackProcessClear: true,
    supportResponseExpectationsRealistic: true,
    spiritualGuidanceBoundariesClear: true,
    emergencyProfessionalLimitationsClear: true,
    knownIssuesNotHiddenFromOwnerReview: true,
    noHiddenTrackingDependency: true,
    notes: ["Known limitations remain visible or documented for controlled release."]
  };
}

function defaultPublicSafetyInput(): TeoyubePublicSafetyBoundaryReviewInput {
  return {
    scriptureAnchorsPreserved: true,
    explanationTracesPreserved: true,
    fallbackSafetyPreserved: true,
    confidenceLabelsVisible: true,
    privacyConsentNoticesPreserved: true,
    knownLimitationsVisible: true,
    noHiddenPersonalization: true,
    noDivineCertaintyClaim: true,
    noAuthoritativeProfessionalAdvice: true,
    noExternalServicesWithoutReview: true,
    noAnalyticsTrackingWithoutReview: true,
    noDatabasePersistenceWithoutReview: true,
    noUnreviewedTheologicalProductionContent: true,
    notes: ["Public safety boundaries remain protected."]
  };
}

function defaultHandoffInput(): TeoyubeStabilizedOperationsHandoffInput {
  return {
    status: "ready_with_conditions",
    releaseOwnerIdentified: true,
    manualMonitoringCadenceDocumented: true,
    manualFeedbackReviewCadenceDocumented: true,
    issueTriageProcessDocumented: true,
    knownIssueRegisterMaintained: true,
    safeFixBatchProcessDocumented: true,
    rollbackProcessDocumented: true,
    publicTrustReviewCompleted: true,
    weeklyImprovementLoopPrepared: true,
    remainingLimitationsDocumented: true,
    nextOperationsPhaseAcceptedByOwner: false,
    conditions: ["Operations handoff waits on local verification."]
  };
}

function defaultGateInput(localVerificationPassed = false): TeoyubeControlledExpansionGateInput {
  return {
    expansionLevel: "remain_limited",
    controlledReleaseExpansionReadinessReviewed: true,
    publicTrustReviewPassed: true,
    knownLimitationsReadinessReviewed: true,
    publicSafetyBoundaryReviewPassed: true,
    stabilizedOperationsHandoffReadinessReviewed: true,
    rollbackReadinessConfirmed: true,
    noUnresolvedSeverity1Issue: true,
    noUnapprovedExpansionBlockingSeverity2Issue: true,
    ownerApprovalRecorded: true,
    expansionLevelSelected: true,
    expansionConditionsDocumented: true,
    conditions: localVerificationPassed ? ["Owner may choose limited expansion after Phase 10.7 review."] : ["Remain limited until local verification passes."]
  };
}

function defaultRunbookInput(): TeoyubeStabilizedOperationsRunbookInput {
  return {
    dailyManualCheckProcess: true,
    weeklyFeedbackReviewProcess: true,
    weeklyKnownIssueReviewProcess: true,
    safeFixBatchReviewProcess: true,
    rollbackReviewProcess: true,
    ownerDecisionLogProcess: true,
    publicTrustReviewRefreshProcess: true,
    severity1And2EscalationProcess: true,
    documentationUpdateProcess: true,
    roadmapUpdateProcess: true,
    notes: ["Runbook is local-only and does not create automated monitoring or user contact."]
  };
}

export function createPhase106OperationsPackage(input: TeoyubePhase106OperationsPackageInput = {}): TeoyubePhase106OperationsPackage {
  const localVerificationPassed = input.localVerificationPassed ?? false;
  const controlledReleaseExpansionReadinessReport = createControlledReleaseExpansionReadinessReport(input.expansionReadinessInput || defaultExpansionReadinessInput(localVerificationPassed));
  const publicTrustReviewReport = createPublicTrustReviewReport(createPublicTrustReviewRecord(input.publicTrustInput || defaultPublicTrustInput()));
  const knownLimitationsReadinessReport = createKnownLimitationsReadinessReport(createKnownLimitationsReadinessRecord(input.knownLimitationsInput || defaultKnownLimitationsInput()));
  const publicSafetyBoundaryReviewReport = createPublicSafetyBoundaryReviewReport(createPublicSafetyBoundaryReviewRecord(input.publicSafetyInput || defaultPublicSafetyInput()));
  const stabilizedOperationsHandoffReport = createStabilizedOperationsHandoffReport(createStabilizedOperationsHandoffRecord(input.handoffInput || defaultHandoffInput()));
  const controlledExpansionGateReport = createControlledExpansionGateReport(createControlledExpansionGateRecord(input.gateInput || defaultGateInput(localVerificationPassed)));
  const stabilizedOperationsRunbookReport = createStabilizedOperationsRunbookReport(createStabilizedOperationsRunbookRecord(input.runbookInput || defaultRunbookInput()));
  const ownerReviewReport = createPhase106OwnerReviewReport(input.ownerReview || createPhase106OwnerReviewRecord({
    reviewed: true,
    nextPhase10StepAccepted: false,
    notes: ["Owner review records that Phase 10.7 is blocked until build/typecheck/local verification blockers are fixed."]
  }));
  const localVerificationBlocker = localVerificationPassed ? [] : ["Local build/typecheck/runtime verification has not passed in this workspace."];
  const blockers = [
    ...localVerificationBlocker,
    ...collect(controlledReleaseExpansionReadinessReport.blockers),
    ...collect(publicTrustReviewReport.blockers),
    ...collect(knownLimitationsReadinessReport.blockers),
    ...collect(publicSafetyBoundaryReviewReport.blockers),
    ...collect(stabilizedOperationsHandoffReport.blockers),
    ...collect(controlledExpansionGateReport.blockers),
    ...collect(stabilizedOperationsRunbookReport.blockers),
    ...collect(ownerReviewReport.blockers)
  ];
  const warnings = [
    ...collect(controlledReleaseExpansionReadinessReport.warnings),
    ...collect(publicTrustReviewReport.warnings),
    ...collect(knownLimitationsReadinessReport.warnings),
    ...collect(publicSafetyBoundaryReviewReport.warnings),
    ...collect(stabilizedOperationsHandoffReport.warnings),
    ...collect(controlledExpansionGateReport.warnings),
    ...collect(stabilizedOperationsRunbookReport.warnings),
    ...collect(ownerReviewReport.warnings)
  ];
  return {
    id: "phase_10_6_operations_package",
    controlledReleaseExpansionReadinessReport,
    publicTrustReviewReport,
    knownLimitationsReadinessReport,
    publicSafetyBoundaryReviewReport,
    stabilizedOperationsHandoffReport,
    controlledExpansionGateReport,
    stabilizedOperationsRunbookReport,
    ownerReviewReport,
    ownerDecisionSummary: input.ownerDecisionSummary || "Manual expansion readiness and stabilized operations handoff structure is prepared; no expansion, deployment, monitoring, feedback collection, or external sending is performed by code.",
    blockers,
    warnings,
    nextActionRecommendation: "Fix build/typecheck/local verification blockers, then use Phase 10.7 for stabilized public operations and Phase 10 completion gate.",
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

export function getPhase106OperationsPackageBlockers(pkg: TeoyubePhase106OperationsPackage): string[] {
  return pkg.blockers;
}

export function getPhase106OperationsPackageWarnings(pkg: TeoyubePhase106OperationsPackage): string[] {
  return pkg.warnings;
}

export function validatePhase106OperationsPackage(pkg: TeoyubePhase106OperationsPackage): boolean {
  return getPhase106OperationsPackageBlockers(pkg).length === 0;
}

export function createPhase106OperationsPackageDecision(pkg: TeoyubePhase106OperationsPackage): TeoyubePhase106OperationsPackageDecision {
  if (pkg.ownerReviewReport.decision === "needs_owner_review") return "needs_owner_review";
  if (pkg.blockers.some((entry) => entry.includes("Local build/typecheck/runtime verification"))) return "blocked_by_build_or_local_verification";
  if (pkg.blockers.length) return "blocked_by_operations_review";
  return pkg.warnings.length ? "ready_with_warnings" : "ready_for_phase_10_7";
}

export function createPhase106OperationsPackageReport(pkg: TeoyubePhase106OperationsPackage) {
  return {
    valid: validatePhase106OperationsPackage(pkg),
    decision: createPhase106OperationsPackageDecision(pkg),
    package: pkg,
    blockers: getPhase106OperationsPackageBlockers(pkg),
    warnings: getPhase106OperationsPackageWarnings(pkg),
    nextActionRecommendation: pkg.nextActionRecommendation,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
