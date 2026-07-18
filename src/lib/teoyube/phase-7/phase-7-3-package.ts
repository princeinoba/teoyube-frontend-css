import {
  createProductStabilizationPassPackage,
  createProductStabilizationPassPackageReport,
  type TeoyubeProductStabilizationPassPackageModel
} from "./product-stabilization-pass-package";
import {
  createPhase73OwnerReviewRecord,
  createPhase73OwnerReviewReport,
  type TeoyubePhase73OwnerReviewRecord
} from "./phase-7-3-owner-review";

export type TeoyubePhase73PackageDecision =
  | "phase_7_3_complete"
  | "phase_7_3_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase73PackageModel = {
  id: string;
  productStabilizationPassPackage: TeoyubeProductStabilizationPassPackageModel;
  productStabilizationPassPackageReport: ReturnType<typeof createProductStabilizationPassPackageReport>;
  ownerReview: TeoyubePhase73OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase73OwnerReviewReport>;
  readinessScore: number;
  readinessScoreBand: string;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.4 - Phase 7 Completion Review, Operations Lock & Phase 8 Roadmap";
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

export type TeoyubePhase73PackageReport = {
  valid: boolean;
  decision: TeoyubePhase73PackageDecision;
  package: TeoyubePhase73PackageModel;
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  readinessScoreBand: string;
  nextActionRecommendation: "Phase 7.4 - Phase 7 Completion Review, Operations Lock & Phase 8 Roadmap";
  manualOnly: true;
  inMemoryOnly: true;
  noExternalSend: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};

export function createPhase73Package(input: {
  productStabilizationPassPackage?: TeoyubeProductStabilizationPassPackageModel;
  ownerReview?: TeoyubePhase73OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase73PackageModel {
  const productStabilizationPassPackage = input.productStabilizationPassPackage || createProductStabilizationPassPackage();
  const productStabilizationPassPackageReport = createProductStabilizationPassPackageReport(productStabilizationPassPackage);
  const ownerReview = input.ownerReview || createPhase73OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const ownerReviewReport = createPhase73OwnerReviewReport(ownerReview);
  const blockers = [
    ...productStabilizationPassPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...productStabilizationPassPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_7_3_package",
    productStabilizationPassPackage,
    productStabilizationPassPackageReport,
    ownerReview,
    ownerReviewReport,
    readinessScore: productStabilizationPassPackage.betaOperationsReadinessScoreReport.score,
    readinessScoreBand: productStabilizationPassPackage.betaOperationsReadinessScoreReport.band,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 7.4 - Phase 7 Completion Review, Operations Lock & Phase 8 Roadmap",
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

export function getPhase73PackageBlockers(pkg: TeoyubePhase73PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase73PackageWarnings(pkg: TeoyubePhase73PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase73PackageDecision(pkg: TeoyubePhase73PackageModel): TeoyubePhase73PackageDecision {
  if (pkg.blockers.length || pkg.readinessScoreBand === "blocked") return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  if (pkg.productStabilizationPassPackageReport.decision === "needs_owner_review" && !pkg.ownerReview.reviewed) return "needs_owner_review";
  return pkg.warnings.length ? "phase_7_3_complete_with_warnings" : "phase_7_3_complete";
}

export function validatePhase73Package(pkg: TeoyubePhase73PackageModel): TeoyubePhase73PackageReport {
  return createPhase73PackageReport(pkg);
}

export function createPhase73PackageReport(pkg: TeoyubePhase73PackageModel): TeoyubePhase73PackageReport {
  const blockers = getPhase73PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase73PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase73PackageWarnings(pkg),
    readinessScore: pkg.readinessScore,
    readinessScoreBand: pkg.readinessScoreBand,
    nextActionRecommendation: "Phase 7.4 - Phase 7 Completion Review, Operations Lock & Phase 8 Roadmap",
    manualOnly: true,
    inMemoryOnly: true,
    noExternalSend: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
