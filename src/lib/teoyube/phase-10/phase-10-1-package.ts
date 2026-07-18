import { createControlledPublicReleaseExecutionReport } from "./controlled-public-release-execution-plan";
import { createManualLaunchChecklist, createManualLaunchChecklistReport } from "./manual-launch-checklist";
import { createManualPublicMonitoringBoundaryReport } from "./manual-public-monitoring-boundaries";
import { createControlledPublicSupportFeedbackBoundaryReport } from "./controlled-public-support-feedback-boundaries";
import { createPublicIssueTriageExecutionReport } from "./public-issue-triage-execution-plan";
import { createPauseRollbackExecutionReadinessReport } from "./pause-rollback-execution-readiness";
import { createServiceDisabledExecutionConfirmationReport } from "./service-disabled-execution-confirmation";
import { createPublicReleaseSafetyExecutionConfirmationReport } from "./public-release-safety-execution-confirmation";
import { createRealAppVerificationPreparationReport } from "./real-app-verification-preparation";
import {
  createPhase101OwnerReviewRecord,
  createPhase101OwnerReviewReport,
  type TeoyubePhase101OwnerReviewRecord
} from "./phase-10-1-owner-review";

export type TeoyubePhase101PackageDecision =
  | "phase_10_1_complete"
  | "phase_10_1_complete_with_warnings"
  | "blocked"
  | "needs_owner_review";

export type TeoyubePhase101Package = {
  id: string;
  controlledPublicReleaseExecutionPlanReport: ReturnType<typeof createControlledPublicReleaseExecutionReport>;
  manualLaunchChecklistReport: ReturnType<typeof createManualLaunchChecklistReport>;
  manualMonitoringBoundaryReport: ReturnType<typeof createManualPublicMonitoringBoundaryReport>;
  supportFeedbackBoundaryReport: ReturnType<typeof createControlledPublicSupportFeedbackBoundaryReport>;
  publicIssueTriageExecutionReport: ReturnType<typeof createPublicIssueTriageExecutionReport>;
  pauseRollbackReadinessReport: ReturnType<typeof createPauseRollbackExecutionReadinessReport>;
  serviceDisabledConfirmationReport: ReturnType<typeof createServiceDisabledExecutionConfirmationReport>;
  safetyExecutionConfirmationReport: ReturnType<typeof createPublicReleaseSafetyExecutionConfirmationReport>;
  realAppVerificationPreparationReport: ReturnType<typeof createRealAppVerificationPreparationReport>;
  ownerReview: ReturnType<typeof createPhase101OwnerReviewReport>;
  nextActionRecommendation: "Phase 10.2 - Real App Runtime Verification, Route QA & Build Stabilization";
  blockers: string[];
  warnings: string[];
  noPublicLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function collect(entries: Array<string | { message?: string; details?: string; label?: string }>): string[] {
  return entries.map((entry) => typeof entry === "string" ? entry : entry.message || entry.details || entry.label || "Phase 10.1 item needs attention.");
}

function reportWarnings(report: { warnings?: unknown }): string[] {
  const warnings = Array.isArray(report.warnings) ? report.warnings : [];
  return collect(warnings as Array<string | { message?: string; details?: string; label?: string }>);
}

export function createPhase101Package(input: { ownerReviewed?: boolean; ownerReview?: TeoyubePhase101OwnerReviewRecord } = {}): TeoyubePhase101Package {
  const ownerReviewed = input.ownerReviewed ?? true;
  const controlledPublicReleaseExecutionPlanReport = createControlledPublicReleaseExecutionReport();
  const manualLaunchChecklistReport = createManualLaunchChecklistReport(createManualLaunchChecklist());
  const manualMonitoringBoundaryReport = createManualPublicMonitoringBoundaryReport();
  const supportFeedbackBoundaryReport = createControlledPublicSupportFeedbackBoundaryReport();
  const publicIssueTriageExecutionReport = createPublicIssueTriageExecutionReport();
  const pauseRollbackReadinessReport = createPauseRollbackExecutionReadinessReport();
  const serviceDisabledConfirmationReport = createServiceDisabledExecutionConfirmationReport();
  const safetyExecutionConfirmationReport = createPublicReleaseSafetyExecutionConfirmationReport();
  const realAppVerificationPreparationReport = createRealAppVerificationPreparationReport();
  const ownerReview = createPhase101OwnerReviewReport(input.ownerReview || createPhase101OwnerReviewRecord({
    reviewed: ownerReviewed,
    notes: ["Phase 10.1 completion package generated for Phase 10.2 real app verification."]
  }));
  const blockers = [
    ...collect(controlledPublicReleaseExecutionPlanReport.blockers),
    ...collect(manualLaunchChecklistReport.blockers),
    ...collect(manualMonitoringBoundaryReport.blockers),
    ...collect(supportFeedbackBoundaryReport.blockers),
    ...collect(publicIssueTriageExecutionReport.blockers),
    ...collect(pauseRollbackReadinessReport.blockers),
    ...collect(serviceDisabledConfirmationReport.blockers),
    ...collect(safetyExecutionConfirmationReport.blockers),
    ...collect(realAppVerificationPreparationReport.blockers),
    ...collect(ownerReview.blockers)
  ];
  const warnings = [
    ...reportWarnings(controlledPublicReleaseExecutionPlanReport),
    ...reportWarnings(manualLaunchChecklistReport),
    ...reportWarnings(manualMonitoringBoundaryReport),
    ...reportWarnings(supportFeedbackBoundaryReport),
    ...reportWarnings(publicIssueTriageExecutionReport),
    ...reportWarnings(pauseRollbackReadinessReport),
    ...reportWarnings(serviceDisabledConfirmationReport),
    ...reportWarnings(safetyExecutionConfirmationReport),
    ...reportWarnings(realAppVerificationPreparationReport),
    ...reportWarnings(ownerReview)
  ];
  return {
    id: "phase_10_1_package",
    controlledPublicReleaseExecutionPlanReport,
    manualLaunchChecklistReport,
    manualMonitoringBoundaryReport,
    supportFeedbackBoundaryReport,
    publicIssueTriageExecutionReport,
    pauseRollbackReadinessReport,
    serviceDisabledConfirmationReport,
    safetyExecutionConfirmationReport,
    realAppVerificationPreparationReport,
    ownerReview,
    nextActionRecommendation: "Phase 10.2 - Real App Runtime Verification, Route QA & Build Stabilization",
    blockers,
    warnings,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase101PackageBlockers(pkg: TeoyubePhase101Package): string[] {
  return pkg.blockers;
}

export function getPhase101PackageWarnings(pkg: TeoyubePhase101Package): string[] {
  return pkg.warnings;
}

export function createPhase101PackageDecision(pkg: TeoyubePhase101Package): TeoyubePhase101PackageDecision {
  if (pkg.ownerReview.decision === "needs_owner_review") return "needs_owner_review";
  if (pkg.blockers.length) return "blocked";
  return pkg.warnings.length ? "phase_10_1_complete_with_warnings" : "phase_10_1_complete";
}

export function validatePhase101Package(pkg: TeoyubePhase101Package): boolean {
  return getPhase101PackageBlockers(pkg).length === 0;
}

export function createPhase101PackageReport(pkg: TeoyubePhase101Package) {
  const blockers = getPhase101PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase101PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase101PackageWarnings(pkg),
    nextActionRecommendation: "Phase 10.2 - Real App Runtime Verification, Route QA & Build Stabilization",
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
