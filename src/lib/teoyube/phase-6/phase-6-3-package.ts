import {
  createDryRunStabilizationPackage,
  createDryRunStabilizationPackageReport,
  type TeoyubeDryRunStabilizationPackageInput,
  type TeoyubeDryRunStabilizationPackageModel
} from "./dry-run-stabilization-package";
import {
  createPhase63OwnerReviewRecord,
  createPhase63OwnerReviewReport,
  type TeoyubePhase63OwnerReviewRecord
} from "./phase-6-3-owner-review";

export type TeoyubePhase63PackageDecision =
  | "phase_6_3_complete"
  | "phase_6_3_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase63PackageModel = {
  id: string;
  dryRunStabilizationPackage: TeoyubeDryRunStabilizationPackageModel;
  dryRunStabilizationPackageReport: ReturnType<typeof createDryRunStabilizationPackageReport>;
  ownerReview: TeoyubePhase63OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase63OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  postStabilizationReadinessScore: number;
  postStabilizationReadinessBand: TeoyubeDryRunStabilizationPackageModel["postStabilizationReadinessScoreReport"]["band"];
  nextActionRecommendation: "Phase 6.4 - Controlled Beta Execution Readiness Review, Operations Lock & Phase 7 Roadmap";
  manualOnly: true;
  inMemoryOnly: true;
  noExternalSend: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

export type TeoyubePhase63PackageReport = {
  valid: boolean;
  decision: TeoyubePhase63PackageDecision;
  package: TeoyubePhase63PackageModel;
  blockers: string[];
  warnings: string[];
  postStabilizationReadinessScore: number;
  postStabilizationReadinessBand: TeoyubePhase63PackageModel["postStabilizationReadinessBand"];
  nextActionRecommendation: "Phase 6.4 - Controlled Beta Execution Readiness Review, Operations Lock & Phase 7 Roadmap";
  manualOnly: true;
  inMemoryOnly: true;
  noExternalSend: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

export function createPhase63Package(input: {
  dryRunStabilizationPackageInput?: TeoyubeDryRunStabilizationPackageInput;
  dryRunStabilizationPackage?: TeoyubeDryRunStabilizationPackageModel;
  ownerReview?: TeoyubePhase63OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase63PackageModel {
  const dryRunStabilizationPackage = input.dryRunStabilizationPackage || createDryRunStabilizationPackage(input.dryRunStabilizationPackageInput);
  const dryRunStabilizationPackageReport = createDryRunStabilizationPackageReport(dryRunStabilizationPackage);
  const ownerReview = input.ownerReview || createPhase63OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const ownerReviewReport = createPhase63OwnerReviewReport(ownerReview);
  const blockers = [
    ...dryRunStabilizationPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...dryRunStabilizationPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_6_3_package",
    dryRunStabilizationPackage,
    dryRunStabilizationPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    postStabilizationReadinessScore: dryRunStabilizationPackageReport.postStabilizationReadinessScore,
    postStabilizationReadinessBand: dryRunStabilizationPackageReport.postStabilizationReadinessBand,
    nextActionRecommendation: "Phase 6.4 - Controlled Beta Execution Readiness Review, Operations Lock & Phase 7 Roadmap",
    manualOnly: true,
    inMemoryOnly: true,
    noExternalSend: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noBrowserPersistenceRequired: true,
    generatedAt: now()
  };
}

export function getPhase63PackageBlockers(pkg: TeoyubePhase63PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase63PackageWarnings(pkg: TeoyubePhase63PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase63PackageDecision(pkg: TeoyubePhase63PackageModel): TeoyubePhase63PackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  return pkg.warnings.length ? "phase_6_3_complete_with_warnings" : "phase_6_3_complete";
}

export function validatePhase63Package(pkg: TeoyubePhase63PackageModel): TeoyubePhase63PackageReport {
  return createPhase63PackageReport(pkg);
}

export function createPhase63PackageReport(pkg: TeoyubePhase63PackageModel): TeoyubePhase63PackageReport {
  const blockers = getPhase63PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase63PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase63PackageWarnings(pkg),
    postStabilizationReadinessScore: pkg.postStabilizationReadinessScore,
    postStabilizationReadinessBand: pkg.postStabilizationReadinessBand,
    nextActionRecommendation: "Phase 6.4 - Controlled Beta Execution Readiness Review, Operations Lock & Phase 7 Roadmap",
    manualOnly: true,
    inMemoryOnly: true,
    noExternalSend: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noBrowserPersistenceRequired: true,
    generatedAt: now()
  };
}
