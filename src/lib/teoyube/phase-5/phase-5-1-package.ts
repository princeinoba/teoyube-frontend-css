import { createBetaFeedbackReadinessReport } from "./beta-feedback-readiness-plan";
import { createBetaIssueIntakePlanReport } from "./beta-issue-intake-plan";
import { createBetaOperationalReadinessReport } from "./beta-operational-readiness";
import { createControlledBetaPreparationReport } from "./controlled-beta-preparation";
import { createManualBetaQaExecutionPlan, createManualBetaQaExecutionPlanReport } from "./manual-beta-qa-execution-plan";
import {
  createPhase51OwnerReviewRecord,
  createPhase51OwnerReviewReport,
  type TeoyubePhase51OwnerReviewRecord
} from "./phase-5-1-owner-review";
import { createPrivacySecurityReadinessReport } from "./privacy-security-readiness";
import { createServiceGateReviewReport } from "./service-gate-review";

export type TeoyubePhase51PackageDecision =
  | "phase_5_1_complete"
  | "phase_5_1_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase51PackageModel = {
  id: string;
  controlledBetaPreparation: ReturnType<typeof createControlledBetaPreparationReport>;
  manualBetaQaExecutionPlan: ReturnType<typeof createManualBetaQaExecutionPlanReport>;
  serviceGateReview: ReturnType<typeof createServiceGateReviewReport>;
  privacySecurityReadiness: ReturnType<typeof createPrivacySecurityReadinessReport>;
  betaIssueIntakePlan: ReturnType<typeof createBetaIssueIntakePlanReport>;
  betaFeedbackReadinessPlan: ReturnType<typeof createBetaFeedbackReadinessReport>;
  betaOperationalReadiness: ReturnType<typeof createBetaOperationalReadinessReport>;
  ownerReview: TeoyubePhase51OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase51OwnerReviewReport>;
  nextActionRecommendation: "Phase 5.2 - Manual Beta QA Execution, Issue Triage & Readiness Score";
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

export type TeoyubePhase51PackageReport = {
  valid: boolean;
  decision: TeoyubePhase51PackageDecision;
  phase51Package: TeoyubePhase51PackageModel;
  blockers: string[];
  warnings: string[];
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

export function createPhase51Package(input: {
  ownerReview?: TeoyubePhase51OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase51PackageModel {
  const ownerReview = input.ownerReview || createPhase51OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const ownerReviewed = input.ownerReviewed ?? ownerReview.reviewed;
  return {
    id: "phase_5_1_controlled_beta_preparation_package",
    controlledBetaPreparation: createControlledBetaPreparationReport(),
    manualBetaQaExecutionPlan: createManualBetaQaExecutionPlanReport(createManualBetaQaExecutionPlan()),
    serviceGateReview: createServiceGateReviewReport(),
    privacySecurityReadiness: createPrivacySecurityReadinessReport(),
    betaIssueIntakePlan: createBetaIssueIntakePlanReport(),
    betaFeedbackReadinessPlan: createBetaFeedbackReadinessReport(),
    betaOperationalReadiness: createBetaOperationalReadinessReport({ ownerReviewComplete: ownerReviewed }),
    ownerReview,
    ownerReviewReport: createPhase51OwnerReviewReport(ownerReview),
    nextActionRecommendation: "Phase 5.2 - Manual Beta QA Execution, Issue Triage & Readiness Score",
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

export function getPhase51PackageBlockers(pkg: TeoyubePhase51PackageModel): string[] {
  return [
    ...pkg.controlledBetaPreparation.blockers.map((entry) => entry.message),
    ...pkg.manualBetaQaExecutionPlan.blockers.map((entry) => entry.message),
    ...pkg.serviceGateReview.blockers.map((entry) => entry.message),
    ...pkg.privacySecurityReadiness.blockers,
    ...pkg.betaIssueIntakePlan.blockers,
    ...pkg.betaFeedbackReadinessPlan.blockers,
    ...pkg.betaOperationalReadiness.blockers,
    ...pkg.ownerReviewReport.blockers
  ];
}

export function getPhase51PackageWarnings(pkg: TeoyubePhase51PackageModel): string[] {
  return [
    ...pkg.controlledBetaPreparation.warnings.map((entry) => entry.message),
    ...pkg.manualBetaQaExecutionPlan.warnings.map((entry) => entry.message),
    ...pkg.serviceGateReview.warnings.map((entry) => entry.message),
    ...pkg.privacySecurityReadiness.warnings,
    ...pkg.betaIssueIntakePlan.warnings,
    ...pkg.betaFeedbackReadinessPlan.warnings,
    ...pkg.betaOperationalReadiness.warnings,
    ...pkg.ownerReviewReport.warnings
  ];
}

export function createPhase51PackageDecision(pkg: TeoyubePhase51PackageModel): TeoyubePhase51PackageDecision {
  const blockers = getPhase51PackageBlockers(pkg);
  const warnings = getPhase51PackageWarnings(pkg);
  if (blockers.length) return "blocked";
  return warnings.length ? "phase_5_1_complete_with_warnings" : "phase_5_1_complete";
}

export function validatePhase51Package(pkg: TeoyubePhase51PackageModel): TeoyubePhase51PackageReport {
  return createPhase51PackageReport(pkg);
}

export function createPhase51PackageReport(pkg: TeoyubePhase51PackageModel): TeoyubePhase51PackageReport {
  const blockers = getPhase51PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase51PackageDecision(pkg),
    phase51Package: pkg,
    blockers,
    warnings: getPhase51PackageWarnings(pkg),
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
