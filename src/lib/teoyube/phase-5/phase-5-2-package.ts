import {
  createBetaQaExecutionPackage,
  createBetaQaExecutionPackageReport,
  type TeoyubeBetaQaExecutionPackage
} from "./beta-qa-execution-package";
import {
  createPhase52OwnerReviewRecord,
  createPhase52OwnerReviewReport,
  type TeoyubePhase52OwnerReviewRecord
} from "./phase-5-2-owner-review";

export type TeoyubePhase52PackageDecision =
  | "phase_5_2_complete"
  | "phase_5_2_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase52PackageModel = {
  id: string;
  betaQaExecutionPackage: TeoyubeBetaQaExecutionPackage;
  betaQaExecutionPackageReport: ReturnType<typeof createBetaQaExecutionPackageReport>;
  ownerReview: TeoyubePhase52OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase52OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  nextActionRecommendation: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA";
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

export type TeoyubePhase52PackageReport = {
  valid: boolean;
  decision: TeoyubePhase52PackageDecision;
  phase52Package: TeoyubePhase52PackageModel;
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  nextActionRecommendation: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA";
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

export function createPhase52Package(input: {
  betaQaExecutionPackage?: TeoyubeBetaQaExecutionPackage;
  ownerReview?: TeoyubePhase52OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase52PackageModel {
  const betaQaExecutionPackage = input.betaQaExecutionPackage || createBetaQaExecutionPackage();
  const betaQaExecutionPackageReport = createBetaQaExecutionPackageReport(betaQaExecutionPackage);
  const ownerReview = input.ownerReview || createPhase52OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const ownerReviewReport = createPhase52OwnerReviewReport(ownerReview);
  const blockers = getPhase52PackageBlockersFromReports(betaQaExecutionPackageReport, ownerReviewReport);
  const warnings = getPhase52PackageWarningsFromReports(betaQaExecutionPackageReport, ownerReviewReport);
  return {
    id: "phase_5_2_manual_beta_qa_execution_package",
    betaQaExecutionPackage,
    betaQaExecutionPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    readinessScore: betaQaExecutionPackageReport.readinessScore,
    nextActionRecommendation: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA",
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

function getPhase52PackageBlockersFromReports(
  betaQaExecutionPackageReport: ReturnType<typeof createBetaQaExecutionPackageReport>,
  ownerReviewReport: ReturnType<typeof createPhase52OwnerReviewReport>
): string[] {
  return [
    ...betaQaExecutionPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
}

function getPhase52PackageWarningsFromReports(
  betaQaExecutionPackageReport: ReturnType<typeof createBetaQaExecutionPackageReport>,
  ownerReviewReport: ReturnType<typeof createPhase52OwnerReviewReport>
): string[] {
  return [
    ...betaQaExecutionPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
}

export function getPhase52PackageBlockers(pkg: TeoyubePhase52PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase52PackageWarnings(pkg: TeoyubePhase52PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase52PackageDecision(pkg: TeoyubePhase52PackageModel): TeoyubePhase52PackageDecision {
  const blockers = getPhase52PackageBlockers(pkg);
  if (blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  return getPhase52PackageWarnings(pkg).length ? "phase_5_2_complete_with_warnings" : "phase_5_2_complete";
}

export function validatePhase52Package(pkg: TeoyubePhase52PackageModel): TeoyubePhase52PackageReport {
  return createPhase52PackageReport(pkg);
}

export function createPhase52PackageReport(pkg: TeoyubePhase52PackageModel): TeoyubePhase52PackageReport {
  const blockers = getPhase52PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase52PackageDecision(pkg),
    phase52Package: pkg,
    blockers,
    warnings: getPhase52PackageWarnings(pkg),
    readinessScore: pkg.readinessScore,
    nextActionRecommendation: "Phase 5.3 - Beta Fix Queue, Readiness Remediation & Regression QA",
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
