import {
  createDryRunExecutionPackage,
  createDryRunExecutionPackageReport,
  type TeoyubeDryRunExecutionPackageInput,
  type TeoyubeDryRunExecutionPackageModel
} from "./dry-run-execution-package";
import {
  createPhase62OwnerReviewRecord,
  createPhase62OwnerReviewReport,
  type TeoyubePhase62OwnerReviewRecord
} from "./phase-6-2-owner-review";

export type TeoyubePhase62PackageDecision =
  | "phase_6_2_complete"
  | "phase_6_2_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase62PackageModel = {
  id: string;
  dryRunExecutionPackage: TeoyubeDryRunExecutionPackageModel;
  dryRunExecutionPackageReport: ReturnType<typeof createDryRunExecutionPackageReport>;
  ownerReview: TeoyubePhase62OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase62OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness";
  manualOnly: true;
  simulatedOnly: true;
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

export type TeoyubePhase62PackageReport = {
  valid: boolean;
  decision: TeoyubePhase62PackageDecision;
  package: TeoyubePhase62PackageModel;
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  readinessBand: TeoyubePhase62PackageModel["dryRunExecutionPackage"]["readinessScoreReport"]["band"];
  nextActionRecommendation: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness";
  manualOnly: true;
  simulatedOnly: true;
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

export function createPhase62Package(input: {
  dryRunExecutionPackageInput?: TeoyubeDryRunExecutionPackageInput;
  dryRunExecutionPackage?: TeoyubeDryRunExecutionPackageModel;
  ownerReview?: TeoyubePhase62OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase62PackageModel {
  const dryRunExecutionPackage = input.dryRunExecutionPackage || createDryRunExecutionPackage(input.dryRunExecutionPackageInput);
  const dryRunExecutionPackageReport = createDryRunExecutionPackageReport(dryRunExecutionPackage);
  const ownerReview = input.ownerReview || createPhase62OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const ownerReviewReport = createPhase62OwnerReviewReport(ownerReview);
  const blockers = [
    ...dryRunExecutionPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...dryRunExecutionPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_6_2_package",
    dryRunExecutionPackage,
    dryRunExecutionPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness",
    manualOnly: true,
    simulatedOnly: true,
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

export function getPhase62PackageBlockers(pkg: TeoyubePhase62PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase62PackageWarnings(pkg: TeoyubePhase62PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase62PackageDecision(pkg: TeoyubePhase62PackageModel): TeoyubePhase62PackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  return pkg.warnings.length ? "phase_6_2_complete_with_warnings" : "phase_6_2_complete";
}

export function validatePhase62Package(pkg: TeoyubePhase62PackageModel): TeoyubePhase62PackageReport {
  return createPhase62PackageReport(pkg);
}

export function createPhase62PackageReport(pkg: TeoyubePhase62PackageModel): TeoyubePhase62PackageReport {
  const blockers = getPhase62PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase62PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase62PackageWarnings(pkg),
    readinessScore: pkg.dryRunExecutionPackage.readinessScoreReport.score,
    readinessBand: pkg.dryRunExecutionPackage.readinessScoreReport.band,
    nextActionRecommendation: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness",
    manualOnly: true,
    simulatedOnly: true,
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
