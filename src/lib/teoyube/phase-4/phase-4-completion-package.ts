import { createBetaReadinessReviewReport } from "./beta-readiness-review";
import { createDisabledServiceEnforcementQaReport } from "./disabled-service-enforcement-qa";
import {
  createPhase4CompletionReport
} from "./phase-4-completion-review";
import {
  createPhase4FeatureInventoryReport
} from "./phase-4-feature-inventory";
import {
  createPhase4OwnerCompletionReviewRecord,
  createPhase4OwnerCompletionReviewReport,
  type TeoyubePhase4OwnerCompletionReviewRecord
} from "./phase-4-owner-completion-review";
import {
  createPhase4RemainingRiskRegister,
  createPhase4RemainingRiskRegisterReport,
  type TeoyubePhase4RemainingRiskRegister
} from "./phase-4-remaining-risk-register";
import { createPhase5RoadmapReport } from "./phase-5-roadmap-builder";
import { createServiceDecisionLockReport } from "./service-decision-lock";

export type TeoyubePhase4CompletionPackageDecision =
  | "phase_4_complete"
  | "phase_4_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase4CompletionPackageModel = {
  id: string;
  betaReadinessReview: ReturnType<typeof createBetaReadinessReviewReport>;
  serviceDecisionLock: ReturnType<typeof createServiceDecisionLockReport>;
  disabledServiceEnforcementQa: ReturnType<typeof createDisabledServiceEnforcementQaReport>;
  phase4CompletionReview: ReturnType<typeof createPhase4CompletionReport>;
  featureInventory: ReturnType<typeof createPhase4FeatureInventoryReport>;
  remainingRiskRegister: TeoyubePhase4RemainingRiskRegister;
  remainingRiskRegisterReport: ReturnType<typeof createPhase4RemainingRiskRegisterReport>;
  ownerCompletionReview: TeoyubePhase4OwnerCompletionReviewRecord;
  ownerCompletionReviewReport: ReturnType<typeof createPhase4OwnerCompletionReviewReport>;
  phase5Roadmap: ReturnType<typeof createPhase5RoadmapReport>;
  nextActionRecommendation: "Phase 5.1 - Controlled Beta Preparation, Manual QA Execution Plan & Service Gate Review";
  noExternalSend: true;
  noProductionDataModified: true;
  noAutomaticPublishing: true;
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

export type TeoyubePhase4CompletionPackageReport = {
  valid: boolean;
  decision: TeoyubePhase4CompletionPackageDecision;
  completionPackage: TeoyubePhase4CompletionPackageModel;
  blockers: string[];
  warnings: string[];
  noExternalSend: true;
  noProductionDataModified: true;
  noAutomaticPublishing: true;
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

export function createPhase4CompletionPackage(input: {
  ownerReview?: TeoyubePhase4OwnerCompletionReviewRecord;
  ownerReviewed?: boolean;
  riskRegister?: TeoyubePhase4RemainingRiskRegister;
} = {}): TeoyubePhase4CompletionPackageModel {
  const riskRegister = input.riskRegister || createPhase4RemainingRiskRegister();
  const ownerCompletionReview = input.ownerReview || createPhase4OwnerCompletionReviewRecord({ reviewed: input.ownerReviewed ?? false });

  return {
    id: "phase_4_completion_package",
    betaReadinessReview: createBetaReadinessReviewReport(),
    serviceDecisionLock: createServiceDecisionLockReport(),
    disabledServiceEnforcementQa: createDisabledServiceEnforcementQaReport(),
    phase4CompletionReview: createPhase4CompletionReport(),
    featureInventory: createPhase4FeatureInventoryReport(),
    remainingRiskRegister: riskRegister,
    remainingRiskRegisterReport: createPhase4RemainingRiskRegisterReport(riskRegister),
    ownerCompletionReview,
    ownerCompletionReviewReport: createPhase4OwnerCompletionReviewReport(ownerCompletionReview),
    phase5Roadmap: createPhase5RoadmapReport(),
    nextActionRecommendation: "Phase 5.1 - Controlled Beta Preparation, Manual QA Execution Plan & Service Gate Review",
    noExternalSend: true,
    noProductionDataModified: true,
    noAutomaticPublishing: true,
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

export function getPhase4CompletionPackageBlockers(pkg: TeoyubePhase4CompletionPackageModel): string[] {
  return [
    ...pkg.betaReadinessReview.blockers.map((entry) => entry.message),
    ...pkg.serviceDecisionLock.blockers.map((entry) => entry.message),
    ...pkg.disabledServiceEnforcementQa.blockers,
    ...pkg.phase4CompletionReview.blockers.map((entry) => entry.message),
    ...pkg.featureInventory.blockers,
    ...pkg.remainingRiskRegisterReport.blockers,
    ...pkg.phase5Roadmap.blockers
  ];
}

export function getPhase4CompletionPackageWarnings(pkg: TeoyubePhase4CompletionPackageModel): string[] {
  return [
    ...pkg.betaReadinessReview.warnings.map((entry) => entry.message),
    ...pkg.serviceDecisionLock.warnings.map((entry) => entry.message),
    ...pkg.disabledServiceEnforcementQa.warnings,
    ...pkg.phase4CompletionReview.warnings.map((entry) => entry.message),
    ...pkg.featureInventory.warnings,
    ...pkg.remainingRiskRegisterReport.warnings,
    ...pkg.ownerCompletionReviewReport.warnings,
    ...pkg.phase5Roadmap.warnings
  ];
}

export function createPhase4CompletionPackageDecision(pkg: TeoyubePhase4CompletionPackageModel): TeoyubePhase4CompletionPackageDecision {
  const blockers = getPhase4CompletionPackageBlockers(pkg);
  const warnings = getPhase4CompletionPackageWarnings(pkg);
  if (blockers.length) return "blocked";
  if (pkg.ownerCompletionReviewReport.blockers.length) return "needs_owner_review";
  return warnings.length ? "phase_4_complete_with_warnings" : "phase_4_complete";
}

export function validatePhase4CompletionPackage(pkg: TeoyubePhase4CompletionPackageModel): TeoyubePhase4CompletionPackageReport {
  return createPhase4CompletionPackageReport(pkg);
}

export function createPhase4CompletionPackageReport(pkg: TeoyubePhase4CompletionPackageModel): TeoyubePhase4CompletionPackageReport {
  const blockers = getPhase4CompletionPackageBlockers(pkg);
  const warnings = getPhase4CompletionPackageWarnings(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase4CompletionPackageDecision(pkg),
    completionPackage: pkg,
    blockers,
    warnings,
    noExternalSend: true,
    noProductionDataModified: true,
    noAutomaticPublishing: true,
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
