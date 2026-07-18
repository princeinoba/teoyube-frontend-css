import {
  createPhase92OwnerReviewRecord,
  createPhase92OwnerReviewReport,
  type TeoyubePhase92OwnerReviewRecord
} from "./phase-9-2-owner-review";
import {
  createPublicReleaseCandidateQaPackage,
  createPublicReleaseCandidateQaPackageReport,
  type TeoyubePublicReleaseCandidateQaPackageModel
} from "./public-release-candidate-qa-package";

export type TeoyubePhase92PackageDecision =
  | "phase_9_2_complete"
  | "phase_9_2_complete_with_warnings"
  | "needs_fix_queue"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase92PackageModel = {
  id: string;
  publicReleaseCandidateQaPackage: TeoyubePublicReleaseCandidateQaPackageModel;
  publicReleaseCandidateQaPackageReport: ReturnType<typeof createPublicReleaseCandidateQaPackageReport>;
  ownerReview: TeoyubePhase92OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase92OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  readinessScoreBand: string;
  nextActionRecommendation: "Phase 9.3 - Release Candidate Fix Queue, Final Regression QA & Public Go/No-Go Readiness Score";
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

export type TeoyubePhase92PackageReport = {
  valid: boolean;
  decision: TeoyubePhase92PackageDecision;
  package: TeoyubePhase92PackageModel;
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  readinessScoreBand: string;
  nextActionRecommendation: "Phase 9.3 - Release Candidate Fix Queue, Final Regression QA & Public Go/No-Go Readiness Score";
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase92Package(input: {
  ownerReviewed?: boolean;
  ownerReview?: TeoyubePhase92OwnerReviewRecord;
  publicReleaseCandidateQaPackage?: TeoyubePublicReleaseCandidateQaPackageModel;
} = {}): TeoyubePhase92PackageModel {
  const ownerReviewed = input.ownerReviewed ?? true;
  const publicReleaseCandidateQaPackage = input.publicReleaseCandidateQaPackage || createPublicReleaseCandidateQaPackage();
  const publicReleaseCandidateQaPackageReport = createPublicReleaseCandidateQaPackageReport(publicReleaseCandidateQaPackage);
  const ownerReview = input.ownerReview || createPhase92OwnerReviewRecord({
    reviewed: ownerReviewed,
    nextPhaseAccepted: ownerReviewed,
    notes: ["Phase 9.2 package generated for release candidate fix queue and final regression QA preparation only."]
  });
  const ownerReviewReport = createPhase92OwnerReviewReport(ownerReview);
  const blockers = [
    ...publicReleaseCandidateQaPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...publicReleaseCandidateQaPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_9_2_package",
    publicReleaseCandidateQaPackage,
    publicReleaseCandidateQaPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    readinessScore: publicReleaseCandidateQaPackage.readinessScoreReport.score,
    readinessScoreBand: publicReleaseCandidateQaPackage.readinessScoreReport.band,
    nextActionRecommendation: "Phase 9.3 - Release Candidate Fix Queue, Final Regression QA & Public Go/No-Go Readiness Score",
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

export function getPhase92PackageBlockers(pkg: TeoyubePhase92PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase92PackageWarnings(pkg: TeoyubePhase92PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase92PackageDecision(pkg: TeoyubePhase92PackageModel): TeoyubePhase92PackageDecision {
  if (pkg.blockers.length) return "needs_fix_queue";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  return pkg.warnings.length ? "phase_9_2_complete_with_warnings" : "phase_9_2_complete";
}

export function validatePhase92Package(pkg: TeoyubePhase92PackageModel): TeoyubePhase92PackageReport {
  return createPhase92PackageReport(pkg);
}

export function createPhase92PackageReport(pkg: TeoyubePhase92PackageModel): TeoyubePhase92PackageReport {
  const blockers = getPhase92PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase92PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase92PackageWarnings(pkg),
    readinessScore: pkg.readinessScore,
    readinessScoreBand: pkg.readinessScoreBand,
    nextActionRecommendation: "Phase 9.3 - Release Candidate Fix Queue, Final Regression QA & Public Go/No-Go Readiness Score",
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
