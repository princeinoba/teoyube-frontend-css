import {
  createPhase91OwnerReviewRecord,
  createPhase91OwnerReviewReport,
  type TeoyubePhase91OwnerReviewRecord
} from "./phase-9-1-owner-review";
import {
  createPublicReleasePreparationPackage,
  createPublicReleasePreparationPackageReport,
  type TeoyubePublicReleasePreparationPackageModel
} from "./public-release-preparation-package";

export type TeoyubePhase91PackageDecision =
  | "phase_9_1_complete"
  | "phase_9_1_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase91PackageModel = {
  id: string;
  publicReleasePreparationPackage: TeoyubePublicReleasePreparationPackageModel;
  publicReleasePreparationPackageReport: ReturnType<typeof createPublicReleasePreparationPackageReport>;
  ownerReview: TeoyubePhase91OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase91OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 9.2 - Public Release Candidate QA, Manual Monitoring Plan & Support Readiness";
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

export type TeoyubePhase91PackageReport = {
  valid: boolean;
  decision: TeoyubePhase91PackageDecision;
  package: TeoyubePhase91PackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 9.2 - Public Release Candidate QA, Manual Monitoring Plan & Support Readiness";
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase91Package(input: {
  ownerReviewed?: boolean;
  ownerReview?: TeoyubePhase91OwnerReviewRecord;
  publicReleasePreparationPackage?: TeoyubePublicReleasePreparationPackageModel;
} = {}): TeoyubePhase91PackageModel {
  const ownerReviewed = input.ownerReviewed ?? true;
  const publicReleasePreparationPackage = input.publicReleasePreparationPackage || createPublicReleasePreparationPackage({ ownerReviewed });
  const publicReleasePreparationPackageReport = createPublicReleasePreparationPackageReport(publicReleasePreparationPackage);
  const ownerReview = input.ownerReview || createPhase91OwnerReviewRecord({
    reviewed: ownerReviewed,
    nextPhaseAccepted: ownerReviewed,
    notes: ["Phase 9.1 package generated for controlled public release candidate QA preparation."]
  });
  const ownerReviewReport = createPhase91OwnerReviewReport(ownerReview);
  const blockers = [
    ...publicReleasePreparationPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...publicReleasePreparationPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_9_1_package",
    publicReleasePreparationPackage,
    publicReleasePreparationPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 9.2 - Public Release Candidate QA, Manual Monitoring Plan & Support Readiness",
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

export function getPhase91PackageBlockers(pkg: TeoyubePhase91PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase91PackageWarnings(pkg: TeoyubePhase91PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase91PackageDecision(pkg: TeoyubePhase91PackageModel): TeoyubePhase91PackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  return pkg.warnings.length ? "phase_9_1_complete_with_warnings" : "phase_9_1_complete";
}

export function validatePhase91Package(pkg: TeoyubePhase91PackageModel): TeoyubePhase91PackageReport {
  return createPhase91PackageReport(pkg);
}

export function createPhase91PackageReport(pkg: TeoyubePhase91PackageModel): TeoyubePhase91PackageReport {
  const blockers = getPhase91PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase91PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase91PackageWarnings(pkg),
    nextActionRecommendation: "Phase 9.2 - Public Release Candidate QA, Manual Monitoring Plan & Support Readiness",
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
