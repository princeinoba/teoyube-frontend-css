import {
  createControlledBetaOperationsLockReport,
  type TeoyubeControlledBetaOperationsLockInput
} from "./controlled-beta-operations-lock";
import {
  createFinalBetaServiceDisabledLock,
  createFinalBetaServiceDisabledLockReport,
  type TeoyubeFinalBetaServiceDisabledLock
} from "./final-beta-service-disabled-lock";
import {
  createPhase6CompletionReport,
  type TeoyubePhase6CompletionReviewInput
} from "./phase-6-completion-review";
import {
  createPhase6EvidenceArchive,
  createPhase6EvidenceArchiveReport,
  type TeoyubePhase6EvidenceArchive,
  type TeoyubePhase6EvidenceArchiveInput
} from "./phase-6-evidence-archive";
import { createPhase6FeatureInventoryReport } from "./phase-6-feature-inventory";
import {
  createPhase6OwnerCompletionReviewRecord,
  createPhase6OwnerCompletionReviewReport,
  type TeoyubePhase6OwnerCompletionReviewRecord
} from "./phase-6-owner-completion-review";
import {
  createPhase6RemainingRiskRegister,
  createPhase6RemainingRiskRegisterReport,
  type TeoyubePhase6RemainingRiskRegister
} from "./phase-6-remaining-risk-register";
import { createPhase7RoadmapReport } from "./phase-7-roadmap-builder";

export type TeoyubePhase6CompletionPackageDecision =
  | "phase_6_complete"
  | "phase_6_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase6CompletionPackageModel = {
  id: string;
  phase6CompletionReview: ReturnType<typeof createPhase6CompletionReport>;
  operationsLockReport: ReturnType<typeof createControlledBetaOperationsLockReport>;
  finalBetaServiceDisabledLock: TeoyubeFinalBetaServiceDisabledLock;
  finalBetaServiceDisabledLockReport: ReturnType<typeof createFinalBetaServiceDisabledLockReport>;
  phase6EvidenceArchive: TeoyubePhase6EvidenceArchive;
  phase6EvidenceArchiveReport: ReturnType<typeof createPhase6EvidenceArchiveReport>;
  featureInventory: ReturnType<typeof createPhase6FeatureInventoryReport>;
  remainingRiskRegister: TeoyubePhase6RemainingRiskRegister;
  remainingRiskRegisterReport: ReturnType<typeof createPhase6RemainingRiskRegisterReport>;
  ownerCompletionReview: TeoyubePhase6OwnerCompletionReviewRecord;
  ownerCompletionReviewReport: ReturnType<typeof createPhase6OwnerCompletionReviewReport>;
  phase7Roadmap: ReturnType<typeof createPhase7RoadmapReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.1 - Controlled Beta Operations Runbook, Manual Feedback Review & Support Workflow";
  noExternalSend: true;
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
  noUserAccountsAdded: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase6CompletionPackageReport = {
  valid: boolean;
  decision: TeoyubePhase6CompletionPackageDecision;
  completionPackage: TeoyubePhase6CompletionPackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.1 - Controlled Beta Operations Runbook, Manual Feedback Review & Support Workflow";
  noExternalSend: true;
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
  noUserAccountsAdded: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase6CompletionPackage(input: {
  completionInput?: TeoyubePhase6CompletionReviewInput;
  operationsLockInput?: TeoyubeControlledBetaOperationsLockInput;
  evidenceInput?: TeoyubePhase6EvidenceArchiveInput;
  finalBetaServiceDisabledLock?: TeoyubeFinalBetaServiceDisabledLock;
  phase6EvidenceArchive?: TeoyubePhase6EvidenceArchive;
  remainingRiskRegister?: TeoyubePhase6RemainingRiskRegister;
  ownerCompletionReview?: TeoyubePhase6OwnerCompletionReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase6CompletionPackageModel {
  const ownerReviewed = input.ownerReviewed ?? false;
  const finalBetaServiceDisabledLock = input.finalBetaServiceDisabledLock || createFinalBetaServiceDisabledLock();
  const phase6EvidenceArchive = input.phase6EvidenceArchive || createPhase6EvidenceArchive(input.evidenceInput);
  const remainingRiskRegister = input.remainingRiskRegister || createPhase6RemainingRiskRegister();
  const ownerCompletionReview = input.ownerCompletionReview || createPhase6OwnerCompletionReviewRecord({ reviewed: ownerReviewed });
  const phase6CompletionReview = createPhase6CompletionReport({ ...input.completionInput, ownerReviewed: input.completionInput?.ownerReviewed ?? ownerReviewed });
  const operationsLockReport = createControlledBetaOperationsLockReport({ ...input.operationsLockInput, ownerReviewed: input.operationsLockInput?.ownerReviewed ?? ownerReviewed });
  const finalBetaServiceDisabledLockReport = createFinalBetaServiceDisabledLockReport(finalBetaServiceDisabledLock);
  const phase6EvidenceArchiveReport = createPhase6EvidenceArchiveReport(input.evidenceInput);
  const featureInventory = createPhase6FeatureInventoryReport();
  const remainingRiskRegisterReport = createPhase6RemainingRiskRegisterReport(remainingRiskRegister);
  const ownerCompletionReviewReport = createPhase6OwnerCompletionReviewReport(ownerCompletionReview);
  const phase7Roadmap = createPhase7RoadmapReport();
  const blockers = [
    ...phase6CompletionReview.blockers.map((entry) => entry.message),
    ...operationsLockReport.blockers.map((entry) => entry.message),
    ...finalBetaServiceDisabledLockReport.blockers,
    ...phase6EvidenceArchiveReport.blockers,
    ...featureInventory.blockers,
    ...remainingRiskRegisterReport.blockers,
    ...ownerCompletionReviewReport.blockers,
    ...phase7Roadmap.blockers
  ];
  const warnings = [
    ...phase6CompletionReview.warnings.map((entry) => entry.message),
    ...operationsLockReport.warnings.map((entry) => entry.message),
    ...finalBetaServiceDisabledLockReport.warnings,
    ...phase6EvidenceArchiveReport.warnings,
    ...featureInventory.warnings,
    ...remainingRiskRegisterReport.warnings,
    ...ownerCompletionReviewReport.warnings,
    ...phase7Roadmap.warnings
  ];

  return {
    id: "phase_6_completion_package",
    phase6CompletionReview,
    operationsLockReport,
    finalBetaServiceDisabledLock,
    finalBetaServiceDisabledLockReport,
    phase6EvidenceArchive,
    phase6EvidenceArchiveReport,
    featureInventory,
    remainingRiskRegister,
    remainingRiskRegisterReport,
    ownerCompletionReview,
    ownerCompletionReviewReport,
    phase7Roadmap,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 7.1 - Controlled Beta Operations Runbook, Manual Feedback Review & Support Workflow",
    noExternalSend: true,
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
    noUserAccountsAdded: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase6CompletionPackageBlockers(pkg: TeoyubePhase6CompletionPackageModel): string[] {
  return pkg.blockers;
}

export function getPhase6CompletionPackageWarnings(pkg: TeoyubePhase6CompletionPackageModel): string[] {
  return pkg.warnings;
}

export function createPhase6CompletionPackageDecision(pkg: TeoyubePhase6CompletionPackageModel): TeoyubePhase6CompletionPackageDecision {
  const blockers = getPhase6CompletionPackageBlockers(pkg);
  const warnings = getPhase6CompletionPackageWarnings(pkg);
  if (blockers.length) return "blocked";
  if (pkg.ownerCompletionReviewReport.decision === "owner_completion_pending") return "needs_owner_review";
  return warnings.length ? "phase_6_complete_with_warnings" : "phase_6_complete";
}

export function validatePhase6CompletionPackage(pkg: TeoyubePhase6CompletionPackageModel): TeoyubePhase6CompletionPackageReport {
  return createPhase6CompletionPackageReport(pkg);
}

export function createPhase6CompletionPackageReport(pkg: TeoyubePhase6CompletionPackageModel): TeoyubePhase6CompletionPackageReport {
  const blockers = getPhase6CompletionPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase6CompletionPackageDecision(pkg),
    completionPackage: pkg,
    blockers,
    warnings: getPhase6CompletionPackageWarnings(pkg),
    nextActionRecommendation: "Phase 7.1 - Controlled Beta Operations Runbook, Manual Feedback Review & Support Workflow",
    noExternalSend: true,
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
    noUserAccountsAdded: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
