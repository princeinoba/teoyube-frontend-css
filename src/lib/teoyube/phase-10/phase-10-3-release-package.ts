import { createControlledPublicReleaseExecutionReport, type TeoyubeControlledReleaseExecutionInput } from "./controlled-public-release-execution";
import { createFirstHourMonitoringReport, type TeoyubeFirstHourMonitoringInput } from "./first-hour-monitoring";
import { createLaunchIssueClassificationReport, type TeoyubeLaunchIssueClassificationInput } from "./launch-issue-classification";
import { createLaunchDecisionLog, createLaunchDecisionLogReport, type TeoyubeLaunchDecisionLog } from "./launch-decision-log";
import { createRollbackReadinessRecord, createRollbackReadinessReport, type TeoyubeRollbackReadinessRecord } from "./controlled-release-rollback-readiness";
import { createSafeFixApprovalReport, type TeoyubeSafeFixApprovalRequest } from "./safe-fix-approval";
import { createPhase103OwnerReviewRecord, createPhase103OwnerReviewReport, type TeoyubePhase103OwnerReviewRecord } from "./phase-10-3-owner-review";

export type TeoyubePhase103ReleasePackageDecision =
  | "ready_for_phase_10_4"
  | "ready_with_warnings"
  | "blocked_by_build_or_release_precheck"
  | "needs_owner_review";

export type TeoyubePhase103ReleasePackage = {
  id: string;
  controlledReleaseExecutionReport: ReturnType<typeof createControlledPublicReleaseExecutionReport>;
  firstHourMonitoringReport: ReturnType<typeof createFirstHourMonitoringReport>;
  launchIssueClassificationReport: ReturnType<typeof createLaunchIssueClassificationReport>;
  launchDecisionLogReport: ReturnType<typeof createLaunchDecisionLogReport>;
  rollbackReadinessReport: ReturnType<typeof createRollbackReadinessReport>;
  safeFixApprovalReport?: ReturnType<typeof createSafeFixApprovalReport>;
  ownerReviewReport: ReturnType<typeof createPhase103OwnerReviewReport>;
  ownerDecisionSummary: string;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Fix build/runtime blockers, then use Phase 10.4 for post-release stabilization and first-day review.";
  noPublicLaunchPerformedByCode: true;
  noAutomaticDeployment: true;
  noUsersContactedAutomatically: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noLiveAiOrchestrationEnabled: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase103ReleasePackageInput = {
  phase102VerificationPassed?: boolean;
  controlledReleaseExecutionInput?: TeoyubeControlledReleaseExecutionInput;
  firstHourMonitoringInput?: TeoyubeFirstHourMonitoringInput;
  launchIssueInput?: TeoyubeLaunchIssueClassificationInput;
  launchDecisionLog?: TeoyubeLaunchDecisionLog;
  rollbackReadinessRecord?: TeoyubeRollbackReadinessRecord;
  safeFixRequest?: TeoyubeSafeFixApprovalRequest;
  ownerReview?: TeoyubePhase103OwnerReviewRecord;
  ownerDecisionSummary?: string;
};

function collect(entries: unknown[]): string[] {
  return entries.map((entry) => {
    if (typeof entry === "string") return entry;
    if (entry && typeof entry === "object") {
      const record = entry as Record<string, unknown>;
      return String(record.message || record.summary || record.details || record.id || "Phase 10.3 item needs attention.");
    }
    return "Phase 10.3 item needs attention.";
  });
}

function defaultExecutionInput(phase102VerificationPassed = false): TeoyubeControlledReleaseExecutionInput {
  return {
    status: "not_started",
    releaseOwnerConfirmed: true,
    launchWindowConfirmed: true,
    phase101ChecklistReviewed: true,
    phase102VerificationReviewed: true,
    phase102VerificationPassed,
    publicAccessMethodConfirmedManually: true,
    rollbackPathReviewed: true,
    feedbackIntakeMethodConfirmed: true,
    noPrivateDataVisible: true,
    noDebugPayloadVisible: true,
    scriptureAnchorsPreserved: true,
    explanationTracesPreserved: true,
    confidenceLabelsVisible: true,
    privacyConsentNoticesVisible: true,
    serviceDisabledStatePreserved: true,
    notes: ["Phase 10.3 package prepares manual execution only; no public launch is performed by code."]
  };
}

function defaultRollbackRecord(): TeoyubeRollbackReadinessRecord {
  return createRollbackReadinessRecord({
    previousStableDeploymentIdentified: true,
    lastKnownStableCommitIdentified: true,
    rollbackMethodUnderstood: true,
    releaseOwnerCanPauseRelease: true,
    releaseOwnerCanCommunicatePauseManually: true,
    criticalIssueCriteriaReviewed: true,
    secretPrivateDataExposureRollbackRuleReviewed: true,
    rollbackDecisionCanBeLogged: true,
    noAutomatedRollbackIntroduced: true,
    notes: ["Rollback readiness is manual; this package introduces no rollback automation."]
  });
}

export function createPhase103ReleasePackage(input: TeoyubePhase103ReleasePackageInput = {}): TeoyubePhase103ReleasePackage {
  const controlledReleaseExecutionReport = createControlledPublicReleaseExecutionReport(input.controlledReleaseExecutionInput || defaultExecutionInput(input.phase102VerificationPassed ?? false));
  const firstHourMonitoringReport = createFirstHourMonitoringReport(input.firstHourMonitoringInput);
  const launchIssueClassificationReport = createLaunchIssueClassificationReport(input.launchIssueInput);
  const launchDecisionLogReport = createLaunchDecisionLogReport(input.launchDecisionLog || createLaunchDecisionLog());
  const rollbackReadinessReport = createRollbackReadinessReport(input.rollbackReadinessRecord || defaultRollbackRecord());
  const safeFixApprovalReport = input.safeFixRequest ? createSafeFixApprovalReport(input.safeFixRequest) : undefined;
  const ownerReviewReport = createPhase103OwnerReviewReport(input.ownerReview || createPhase103OwnerReviewRecord({
    reviewed: true,
    nextPhase10StepAccepted: false,
    notes: ["Owner review records that Phase 10.4 is blocked until build/runtime verification and any launch decision blockers are resolved."]
  }));
  const blockers = [
    ...collect(controlledReleaseExecutionReport.blockers),
    ...collect(firstHourMonitoringReport.blockers),
    ...collect(launchIssueClassificationReport.blockers),
    ...collect(launchDecisionLogReport.blockers),
    ...collect(rollbackReadinessReport.blockers),
    ...(safeFixApprovalReport ? collect(safeFixApprovalReport.blockers) : []),
    ...collect(ownerReviewReport.blockers)
  ];
  const warnings = [
    ...collect(controlledReleaseExecutionReport.warnings),
    ...collect(firstHourMonitoringReport.warnings),
    ...collect(launchIssueClassificationReport.warnings),
    ...collect(launchDecisionLogReport.warnings),
    ...collect(rollbackReadinessReport.warnings),
    ...(safeFixApprovalReport ? collect(safeFixApprovalReport.warnings) : []),
    ...collect(ownerReviewReport.warnings)
  ];
  return {
    id: "phase_10_3_release_package",
    controlledReleaseExecutionReport,
    firstHourMonitoringReport,
    launchIssueClassificationReport,
    launchDecisionLogReport,
    rollbackReadinessReport,
    safeFixApprovalReport,
    ownerReviewReport,
    ownerDecisionSummary: input.ownerDecisionSummary || "Manual release execution is prepared, but public launch is not performed by code.",
    blockers,
    warnings,
    nextActionRecommendation: "Fix build/runtime blockers, then use Phase 10.4 for post-release stabilization and first-day review.",
    noPublicLaunchPerformedByCode: true,
    noAutomaticDeployment: true,
    noUsersContactedAutomatically: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noLiveAiOrchestrationEnabled: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase103ReleasePackageBlockers(pkg: TeoyubePhase103ReleasePackage): string[] {
  return pkg.blockers;
}

export function getPhase103ReleasePackageWarnings(pkg: TeoyubePhase103ReleasePackage): string[] {
  return pkg.warnings;
}

export function validatePhase103ReleasePackage(pkg: TeoyubePhase103ReleasePackage): boolean {
  return getPhase103ReleasePackageBlockers(pkg).length === 0;
}

export function createPhase103ReleasePackageDecision(pkg: TeoyubePhase103ReleasePackage): TeoyubePhase103ReleasePackageDecision {
  if (pkg.ownerReviewReport.decision === "needs_owner_review") return "needs_owner_review";
  if (pkg.blockers.length) return "blocked_by_build_or_release_precheck";
  return pkg.warnings.length ? "ready_with_warnings" : "ready_for_phase_10_4";
}

export function createPhase103ReleasePackageReport(pkg: TeoyubePhase103ReleasePackage) {
  return {
    valid: validatePhase103ReleasePackage(pkg),
    decision: createPhase103ReleasePackageDecision(pkg),
    package: pkg,
    blockers: getPhase103ReleasePackageBlockers(pkg),
    warnings: getPhase103ReleasePackageWarnings(pkg),
    nextActionRecommendation: pkg.nextActionRecommendation,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
