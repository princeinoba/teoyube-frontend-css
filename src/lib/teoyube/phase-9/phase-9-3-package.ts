import {
  createPhase93OwnerReviewRecord,
  createPhase93OwnerReviewReport,
  type TeoyubePhase93OwnerReviewRecord
} from "./phase-9-3-owner-review";
import {
  createReleaseCandidateRemediationPackage,
  createReleaseCandidateRemediationPackageReport,
  type TeoyubeReleaseCandidateRemediationPackageModel
} from "./release-candidate-remediation-package";

export type TeoyubePhase93PackageDecision =
  | "phase_9_3_complete"
  | "phase_9_3_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase93PackageModel = {
  id: string;
  releaseCandidateRemediationPackage: TeoyubeReleaseCandidateRemediationPackageModel;
  releaseCandidateRemediationPackageReport: ReturnType<typeof createReleaseCandidateRemediationPackageReport>;
  ownerReview: TeoyubePhase93OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase93OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  readinessScoreBand: string;
  nextActionRecommendation: "Phase 9.4 - Controlled Public Go/No-Go, Final Owner Approval & Operational Handoff";
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

export type TeoyubePhase93PackageReport = {
  valid: boolean;
  decision: TeoyubePhase93PackageDecision;
  package: TeoyubePhase93PackageModel;
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  readinessScoreBand: string;
  nextActionRecommendation: "Phase 9.4 - Controlled Public Go/No-Go, Final Owner Approval & Operational Handoff";
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase93Package(input: {
  ownerReviewed?: boolean;
  ownerReview?: TeoyubePhase93OwnerReviewRecord;
  releaseCandidateRemediationPackage?: TeoyubeReleaseCandidateRemediationPackageModel;
} = {}): TeoyubePhase93PackageModel {
  const ownerReviewed = input.ownerReviewed ?? true;
  const releaseCandidateRemediationPackage = input.releaseCandidateRemediationPackage || createReleaseCandidateRemediationPackage();
  const releaseCandidateRemediationPackageReport = createReleaseCandidateRemediationPackageReport(releaseCandidateRemediationPackage);
  const ownerReview = input.ownerReview || createPhase93OwnerReviewRecord({
    reviewed: ownerReviewed,
    nextPhaseAccepted: ownerReviewed,
    notes: ["Phase 9.3 package generated for controlled public go/no-go and operational handoff preparation only."]
  });
  const ownerReviewReport = createPhase93OwnerReviewReport(ownerReview);
  const blockers = [
    ...releaseCandidateRemediationPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...releaseCandidateRemediationPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_9_3_package",
    releaseCandidateRemediationPackage,
    releaseCandidateRemediationPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    readinessScore: releaseCandidateRemediationPackage.publicGoNoGoReadinessScoreReport.score,
    readinessScoreBand: releaseCandidateRemediationPackage.publicGoNoGoReadinessScoreReport.band,
    nextActionRecommendation: "Phase 9.4 - Controlled Public Go/No-Go, Final Owner Approval & Operational Handoff",
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

export function getPhase93PackageBlockers(pkg: TeoyubePhase93PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase93PackageWarnings(pkg: TeoyubePhase93PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase93PackageDecision(pkg: TeoyubePhase93PackageModel): TeoyubePhase93PackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending" || pkg.releaseCandidateRemediationPackageReport.decision === "needs_owner_review") return "needs_owner_review";
  return pkg.warnings.length ? "phase_9_3_complete_with_warnings" : "phase_9_3_complete";
}

export function validatePhase93Package(pkg: TeoyubePhase93PackageModel): TeoyubePhase93PackageReport {
  return createPhase93PackageReport(pkg);
}

export function createPhase93PackageReport(pkg: TeoyubePhase93PackageModel): TeoyubePhase93PackageReport {
  const blockers = getPhase93PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase93PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase93PackageWarnings(pkg),
    readinessScore: pkg.readinessScore,
    readinessScoreBand: pkg.readinessScoreBand,
    nextActionRecommendation: "Phase 9.4 - Controlled Public Go/No-Go, Final Owner Approval & Operational Handoff",
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
