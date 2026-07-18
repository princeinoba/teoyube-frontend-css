import {
  createBetaRemediationPackage,
  createBetaRemediationPackageReport,
  type TeoyubeBetaRemediationPackage
} from "./beta-remediation-package";
import {
  createPhase53OwnerReviewRecord,
  createPhase53OwnerReviewReport,
  type TeoyubePhase53OwnerReviewRecord
} from "./phase-5-3-owner-review";

export type TeoyubePhase53PackageDecision =
  | "phase_5_3_complete"
  | "phase_5_3_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase53PackageModel = {
  id: string;
  betaRemediationPackage: TeoyubeBetaRemediationPackage;
  betaRemediationPackageReport: ReturnType<typeof createBetaRemediationPackageReport>;
  ownerReview: TeoyubePhase53OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase53OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  postRemediationReadinessScore: number;
  postRemediationReadinessBand: string;
  nextActionRecommendation: "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff";
  noExternalSend: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
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

export type TeoyubePhase53PackageReport = {
  valid: boolean;
  decision: TeoyubePhase53PackageDecision;
  phase53Package: TeoyubePhase53PackageModel;
  blockers: string[];
  warnings: string[];
  postRemediationReadinessScore: number;
  postRemediationReadinessBand: string;
  nextActionRecommendation: "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff";
  noExternalSend: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
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

export function createPhase53Package(input: {
  betaRemediationPackage?: TeoyubeBetaRemediationPackage;
  ownerReview?: TeoyubePhase53OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase53PackageModel {
  const betaRemediationPackage = input.betaRemediationPackage || createBetaRemediationPackage();
  const betaRemediationPackageReport = createBetaRemediationPackageReport(betaRemediationPackage);
  const ownerReview = input.ownerReview || createPhase53OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const ownerReviewReport = createPhase53OwnerReviewReport(ownerReview);
  const blockers = [
    ...betaRemediationPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...betaRemediationPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_5_3_beta_fix_queue_readiness_remediation_regression_qa_package",
    betaRemediationPackage,
    betaRemediationPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    postRemediationReadinessScore: betaRemediationPackageReport.postRemediationReadinessScore,
    postRemediationReadinessBand: betaRemediationPackageReport.postRemediationReadinessBand,
    nextActionRecommendation: "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff",
    noExternalSend: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
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

export function getPhase53PackageBlockers(pkg: TeoyubePhase53PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase53PackageWarnings(pkg: TeoyubePhase53PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase53PackageDecision(pkg: TeoyubePhase53PackageModel): TeoyubePhase53PackageDecision {
  const blockers = getPhase53PackageBlockers(pkg);
  if (blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  return getPhase53PackageWarnings(pkg).length ? "phase_5_3_complete_with_warnings" : "phase_5_3_complete";
}

export function validatePhase53Package(pkg: TeoyubePhase53PackageModel): TeoyubePhase53PackageReport {
  return createPhase53PackageReport(pkg);
}

export function createPhase53PackageReport(pkg: TeoyubePhase53PackageModel): TeoyubePhase53PackageReport {
  const blockers = getPhase53PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase53PackageDecision(pkg),
    phase53Package: pkg,
    blockers,
    warnings: getPhase53PackageWarnings(pkg),
    postRemediationReadinessScore: pkg.postRemediationReadinessScore,
    postRemediationReadinessBand: pkg.postRemediationReadinessBand,
    nextActionRecommendation: "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff",
    noExternalSend: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
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
