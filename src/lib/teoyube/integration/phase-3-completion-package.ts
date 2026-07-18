import { createPhase4RoadmapReport } from "./phase-4-roadmap-builder";
import { createPhase3CompletionReport } from "./phase-3-completion-review";
import { createPhase3FeatureInventoryReport } from "./phase-3-feature-inventory";
import { createPhase3IntegrationLockReport } from "./phase-3-integration-lock";
import {
  createPhase3OwnerReviewRecord,
  createPhase3OwnerReviewReport,
  type TeoyubePhase3OwnerReviewRecord
} from "./phase-3-owner-review";
import {
  createPhase3RemainingRiskRegister,
  createPhase3RemainingRiskRegisterReport,
  type TeoyubePhase3RemainingRiskRegister
} from "./phase-3-remaining-risk-register";

export type TeoyubePhase3CompletionPackageDecision =
  | "phase_3_complete"
  | "phase_3_complete_with_warnings"
  | "blocked"
  | "ready_for_phase_4_1";

export type TeoyubePhase3CompletionPackage = {
  id: string;
  completionReview: ReturnType<typeof createPhase3CompletionReport>;
  integrationLock: ReturnType<typeof createPhase3IntegrationLockReport>;
  featureInventory: ReturnType<typeof createPhase3FeatureInventoryReport>;
  remainingRiskRegister: TeoyubePhase3RemainingRiskRegister;
  remainingRiskReport: ReturnType<typeof createPhase3RemainingRiskRegisterReport>;
  ownerReview: TeoyubePhase3OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase3OwnerReviewReport>;
  phase4Roadmap: ReturnType<typeof createPhase4RoadmapReport>;
  recommendedNextAction: "Phase 4.1 - Product Experience Audit, Content Depth Map & Controlled Service Decision Plan";
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase3CompletionPackageReport = {
  valid: boolean;
  decision: TeoyubePhase3CompletionPackageDecision;
  blockers: string[];
  warnings: string[];
  completionPackage: TeoyubePhase3CompletionPackage;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase3CompletionPackage(input: {
  ownerReview?: TeoyubePhase3OwnerReviewRecord;
  riskRegister?: TeoyubePhase3RemainingRiskRegister;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase3CompletionPackage {
  const ownerReview = input.ownerReview || createPhase3OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const remainingRiskRegister = input.riskRegister || createPhase3RemainingRiskRegister();

  return {
    id: "phase_3_completion_package",
    completionReview: createPhase3CompletionReport(),
    integrationLock: createPhase3IntegrationLockReport(),
    featureInventory: createPhase3FeatureInventoryReport(),
    remainingRiskRegister,
    remainingRiskReport: createPhase3RemainingRiskRegisterReport(remainingRiskRegister),
    ownerReview,
    ownerReviewReport: createPhase3OwnerReviewReport(ownerReview),
    phase4Roadmap: createPhase4RoadmapReport(),
    recommendedNextAction: "Phase 4.1 - Product Experience Audit, Content Depth Map & Controlled Service Decision Plan",
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase3CompletionPackageBlockers(completionPackage: TeoyubePhase3CompletionPackage): string[] {
  return [
    ...completionPackage.completionReview.blockers.map((entry) => entry.message),
    ...completionPackage.integrationLock.blockers.map((entry) => entry.message),
    ...(completionPackage.featureInventory.valid ? [] : ["Phase 3 feature inventory is incomplete."]),
    ...completionPackage.remainingRiskReport.blockers,
    ...(completionPackage.phase4Roadmap.valid ? [] : ["Phase 4 roadmap is incomplete."])
  ];
}

export function getPhase3CompletionPackageWarnings(completionPackage: TeoyubePhase3CompletionPackage): string[] {
  return [
    ...completionPackage.completionReview.warnings.map((entry) => entry.message),
    ...completionPackage.integrationLock.warnings.map((entry) => entry.message),
    ...completionPackage.remainingRiskReport.warnings,
    ...completionPackage.ownerReviewReport.warnings,
    ...completionPackage.phase4Roadmap.risks.map((entry) => entry.message)
  ];
}

export function createPhase3CompletionPackageDecision(
  completionPackage: TeoyubePhase3CompletionPackage
): TeoyubePhase3CompletionPackageDecision {
  const blockers = getPhase3CompletionPackageBlockers(completionPackage);
  const warnings = getPhase3CompletionPackageWarnings(completionPackage);
  if (blockers.length) return "blocked";
  if (warnings.length) return "phase_3_complete_with_warnings";
  return "phase_3_complete";
}

export function validatePhase3CompletionPackage(
  completionPackage: TeoyubePhase3CompletionPackage
): TeoyubePhase3CompletionPackageReport {
  return createPhase3CompletionPackageReport(completionPackage);
}

export function createPhase3CompletionPackageReport(
  completionPackage: TeoyubePhase3CompletionPackage
): TeoyubePhase3CompletionPackageReport {
  const blockers = getPhase3CompletionPackageBlockers(completionPackage);
  const warnings = getPhase3CompletionPackageWarnings(completionPackage);

  return {
    valid: blockers.length === 0,
    decision: createPhase3CompletionPackageDecision(completionPackage),
    blockers,
    warnings,
    completionPackage,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
