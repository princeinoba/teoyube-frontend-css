import {
  createPhase82OwnerReviewRecord,
  createPhase82OwnerReviewReport,
  type TeoyubePhase82OwnerReviewRecord
} from "./phase-8-2-owner-review";
import {
  createProductHardeningPackage,
  createProductHardeningPackageReport,
  type TeoyubeProductHardeningPackageModel
} from "./product-hardening-package";

export type TeoyubePhase82PackageDecision =
  | "phase_8_2_complete"
  | "phase_8_2_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase82PackageModel = {
  id: string;
  productHardeningPackage: TeoyubeProductHardeningPackageModel;
  productHardeningPackageReport: ReturnType<typeof createProductHardeningPackageReport>;
  ownerReview: TeoyubePhase82OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase82OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 8.3 - Privacy/Security Review, Controlled Service Decision Package & Public Release Readiness Gate";
  noExternalSend: true;
  noPublicLaunchPerformed: true;
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

export type TeoyubePhase82PackageReport = {
  valid: boolean;
  decision: TeoyubePhase82PackageDecision;
  package: TeoyubePhase82PackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 8.3 - Privacy/Security Review, Controlled Service Decision Package & Public Release Readiness Gate";
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase82Package(input: {
  productHardeningPackage?: TeoyubeProductHardeningPackageModel;
  ownerReview?: TeoyubePhase82OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase82PackageModel {
  const ownerReviewed = input.ownerReviewed ?? false;
  const productHardeningPackage = input.productHardeningPackage || createProductHardeningPackage();
  const productHardeningPackageReport = createProductHardeningPackageReport(productHardeningPackage);
  const ownerReview = input.ownerReview || createPhase82OwnerReviewRecord({ reviewed: ownerReviewed });
  const ownerReviewReport = createPhase82OwnerReviewReport(ownerReview);
  const blockers = [
    ...productHardeningPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...productHardeningPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];

  return {
    id: "phase_8_2_package",
    productHardeningPackage,
    productHardeningPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 8.3 - Privacy/Security Review, Controlled Service Decision Package & Public Release Readiness Gate",
    noExternalSend: true,
    noPublicLaunchPerformed: true,
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
    generatedAt: new Date().toISOString()
  };
}

export function getPhase82PackageBlockers(pkg: TeoyubePhase82PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase82PackageWarnings(pkg: TeoyubePhase82PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase82PackageDecision(pkg: TeoyubePhase82PackageModel): TeoyubePhase82PackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending" || pkg.productHardeningPackageReport.decision === "needs_owner_review") return "needs_owner_review";
  return pkg.warnings.length ? "phase_8_2_complete_with_warnings" : "phase_8_2_complete";
}

export function validatePhase82Package(pkg: TeoyubePhase82PackageModel): TeoyubePhase82PackageReport {
  return createPhase82PackageReport(pkg);
}

export function createPhase82PackageReport(pkg: TeoyubePhase82PackageModel): TeoyubePhase82PackageReport {
  const blockers = getPhase82PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase82PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase82PackageWarnings(pkg),
    nextActionRecommendation: "Phase 8.3 - Privacy/Security Review, Controlled Service Decision Package & Public Release Readiness Gate",
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
