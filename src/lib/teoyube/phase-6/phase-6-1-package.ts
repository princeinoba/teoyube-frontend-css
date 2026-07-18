import {
  createControlledBetaExecutionPackage,
  createControlledBetaExecutionPackageReport,
  type TeoyubeControlledBetaExecutionPackageInput,
  type TeoyubeControlledBetaExecutionPackageModel
} from "./controlled-beta-execution-package";
import {
  createPhase61OwnerReviewRecord,
  createPhase61OwnerReviewReport,
  type TeoyubePhase61OwnerReviewRecord
} from "./phase-6-1-owner-review";

export type TeoyubePhase61PackageDecision =
  | "phase_6_1_complete"
  | "phase_6_1_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase61PackageModel = {
  id: string;
  controlledBetaExecutionPackage: TeoyubeControlledBetaExecutionPackageModel;
  controlledBetaExecutionPackageReport: ReturnType<typeof createControlledBetaExecutionPackageReport>;
  ownerReview: TeoyubePhase61OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase61OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 6.2 - Manual Beta Dry Run, Feedback Intake Simulation & Issue Triage";
  noExternalSend: true;
  noBetaLaunchPerformed: true;
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

export type TeoyubePhase61PackageReport = {
  valid: boolean;
  decision: TeoyubePhase61PackageDecision;
  package: TeoyubePhase61PackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 6.2 - Manual Beta Dry Run, Feedback Intake Simulation & Issue Triage";
  noExternalSend: true;
  noBetaLaunchPerformed: true;
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

function now(): string {
  return new Date().toISOString();
}

export function createPhase61Package(input: {
  executionPackageInput?: TeoyubeControlledBetaExecutionPackageInput;
  controlledBetaExecutionPackage?: TeoyubeControlledBetaExecutionPackageModel;
  ownerReview?: TeoyubePhase61OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase61PackageModel {
  const controlledBetaExecutionPackage = input.controlledBetaExecutionPackage || createControlledBetaExecutionPackage(input.executionPackageInput);
  const controlledBetaExecutionPackageReport = createControlledBetaExecutionPackageReport(controlledBetaExecutionPackage);
  const ownerReview = input.ownerReview || createPhase61OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const ownerReviewReport = createPhase61OwnerReviewReport(ownerReview);
  const blockers = [
    ...controlledBetaExecutionPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...controlledBetaExecutionPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_6_1_package",
    controlledBetaExecutionPackage,
    controlledBetaExecutionPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 6.2 - Manual Beta Dry Run, Feedback Intake Simulation & Issue Triage",
    noExternalSend: true,
    noBetaLaunchPerformed: true,
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
    generatedAt: now()
  };
}

export function getPhase61PackageBlockers(pkg: TeoyubePhase61PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase61PackageWarnings(pkg: TeoyubePhase61PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase61PackageDecision(pkg: TeoyubePhase61PackageModel): TeoyubePhase61PackageDecision {
  const blockers = getPhase61PackageBlockers(pkg);
  if (blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  return getPhase61PackageWarnings(pkg).length ? "phase_6_1_complete_with_warnings" : "phase_6_1_complete";
}

export function validatePhase61Package(pkg: TeoyubePhase61PackageModel): TeoyubePhase61PackageReport {
  return createPhase61PackageReport(pkg);
}

export function createPhase61PackageReport(pkg: TeoyubePhase61PackageModel): TeoyubePhase61PackageReport {
  const blockers = getPhase61PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase61PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase61PackageWarnings(pkg),
    nextActionRecommendation: "Phase 6.2 - Manual Beta Dry Run, Feedback Intake Simulation & Issue Triage",
    noExternalSend: true,
    noBetaLaunchPerformed: true,
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
    generatedAt: now()
  };
}

