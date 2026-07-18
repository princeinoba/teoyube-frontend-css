import {
  createBetaOperationsPackage,
  createBetaOperationsPackageReport,
  type TeoyubeBetaOperationsPackageModel
} from "./beta-operations-package";
import {
  createPhase71OwnerReviewRecord,
  createPhase71OwnerReviewReport,
  type TeoyubePhase71OwnerReviewRecord
} from "./phase-7-1-owner-review";

export type TeoyubePhase71PackageDecision =
  | "phase_7_1_complete"
  | "phase_7_1_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase71PackageModel = {
  id: string;
  betaOperationsPackage: TeoyubeBetaOperationsPackageModel;
  betaOperationsPackageReport: ReturnType<typeof createBetaOperationsPackageReport>;
  ownerReview: TeoyubePhase71OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase71OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.2 - Manual Feedback Review Simulation, Support Issue Triage & Product Stabilization Queue";
  manualOnly: true;
  inMemoryOnly: true;
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
  generatedAt: string;
};

export type TeoyubePhase71PackageReport = {
  valid: boolean;
  decision: TeoyubePhase71PackageDecision;
  package: TeoyubePhase71PackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.2 - Manual Feedback Review Simulation, Support Issue Triage & Product Stabilization Queue";
  manualOnly: true;
  inMemoryOnly: true;
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
  generatedAt: string;
};

export function createPhase71Package(input: {
  betaOperationsPackage?: TeoyubeBetaOperationsPackageModel;
  ownerReview?: TeoyubePhase71OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase71PackageModel {
  const betaOperationsPackage = input.betaOperationsPackage || createBetaOperationsPackage({ ownerApproved: input.ownerReviewed ?? true });
  const betaOperationsPackageReport = createBetaOperationsPackageReport(betaOperationsPackage);
  const ownerReview = input.ownerReview || createPhase71OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const ownerReviewReport = createPhase71OwnerReviewReport(ownerReview);
  const blockers = [
    ...betaOperationsPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...betaOperationsPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_7_1_package",
    betaOperationsPackage,
    betaOperationsPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 7.2 - Manual Feedback Review Simulation, Support Issue Triage & Product Stabilization Queue",
    manualOnly: true,
    inMemoryOnly: true,
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
    generatedAt: new Date().toISOString()
  };
}

export function getPhase71PackageBlockers(pkg: TeoyubePhase71PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase71PackageWarnings(pkg: TeoyubePhase71PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase71PackageDecision(pkg: TeoyubePhase71PackageModel): TeoyubePhase71PackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  return pkg.warnings.length ? "phase_7_1_complete_with_warnings" : "phase_7_1_complete";
}

export function validatePhase71Package(pkg: TeoyubePhase71PackageModel): TeoyubePhase71PackageReport {
  return createPhase71PackageReport(pkg);
}

export function createPhase71PackageReport(pkg: TeoyubePhase71PackageModel): TeoyubePhase71PackageReport {
  const blockers = getPhase71PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase71PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase71PackageWarnings(pkg),
    nextActionRecommendation: "Phase 7.2 - Manual Feedback Review Simulation, Support Issue Triage & Product Stabilization Queue",
    manualOnly: true,
    inMemoryOnly: true,
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
    generatedAt: new Date().toISOString()
  };
}
