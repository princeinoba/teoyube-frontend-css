import {
  createPhase94OwnerReviewRecord,
  createPhase94OwnerReviewReport,
  type TeoyubePhase94OwnerReviewRecord
} from "./phase-9-4-owner-review";
import {
  createPublicGoNoGoReadinessPackage,
  createPublicGoNoGoReadinessPackageReport,
  type TeoyubePublicGoNoGoReadinessPackageModel
} from "./public-go-no-go-readiness-package";

export type TeoyubePhase94PackageDecision =
  | "phase_9_4_complete"
  | "phase_9_4_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase94PackageModel = {
  id: string;
  publicGoNoGoReadinessPackage: TeoyubePublicGoNoGoReadinessPackageModel;
  publicGoNoGoReadinessPackageReport: ReturnType<typeof createPublicGoNoGoReadinessPackageReport>;
  ownerReview: TeoyubePhase94OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase94OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  decision: TeoyubePhase94PackageDecision;
  nextActionRecommendation: "Phase 9.5 - Phase 9 Completion Review, Public Readiness Lock & Phase 10 Roadmap";
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

export type TeoyubePhase94PackageReport = {
  valid: boolean;
  decision: TeoyubePhase94PackageDecision;
  package: TeoyubePhase94PackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 9.5 - Phase 9 Completion Review, Public Readiness Lock & Phase 10 Roadmap";
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase94Package(input: {
  ownerReviewed?: boolean;
  ownerReview?: TeoyubePhase94OwnerReviewRecord;
  publicGoNoGoReadinessPackage?: TeoyubePublicGoNoGoReadinessPackageModel;
} = {}): TeoyubePhase94PackageModel {
  const ownerReviewed = input.ownerReviewed ?? true;
  const publicGoNoGoReadinessPackage = input.publicGoNoGoReadinessPackage || createPublicGoNoGoReadinessPackage({ ownerReviewed });
  const publicGoNoGoReadinessPackageReport = createPublicGoNoGoReadinessPackageReport(publicGoNoGoReadinessPackage);
  const ownerReview = input.ownerReview || createPhase94OwnerReviewRecord({
    reviewed: ownerReviewed,
    nextPhaseAccepted: ownerReviewed,
    notes: ["Phase 9.4 package generated for Phase 9 completion review and Phase 10 roadmap planning only."]
  });
  const ownerReviewReport = createPhase94OwnerReviewReport(ownerReview);
  const blockers = [
    ...publicGoNoGoReadinessPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...publicGoNoGoReadinessPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
  const decision = blockers.length
    ? "blocked"
    : ownerReviewReport.decision === "owner_review_pending"
      ? "needs_owner_review"
      : warnings.length
        ? "phase_9_4_complete_with_warnings"
        : "phase_9_4_complete";
  return {
    id: "phase_9_4_package",
    publicGoNoGoReadinessPackage,
    publicGoNoGoReadinessPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    decision,
    nextActionRecommendation: "Phase 9.5 - Phase 9 Completion Review, Public Readiness Lock & Phase 10 Roadmap",
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

export function getPhase94PackageBlockers(pkg: TeoyubePhase94PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase94PackageWarnings(pkg: TeoyubePhase94PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase94PackageDecision(pkg: TeoyubePhase94PackageModel): TeoyubePhase94PackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  return pkg.warnings.length ? "phase_9_4_complete_with_warnings" : "phase_9_4_complete";
}

export function validatePhase94Package(pkg: TeoyubePhase94PackageModel): TeoyubePhase94PackageReport {
  return createPhase94PackageReport(pkg);
}

export function createPhase94PackageReport(pkg: TeoyubePhase94PackageModel): TeoyubePhase94PackageReport {
  const blockers = getPhase94PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase94PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase94PackageWarnings(pkg),
    nextActionRecommendation: "Phase 9.5 - Phase 9 Completion Review, Public Readiness Lock & Phase 10 Roadmap",
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
