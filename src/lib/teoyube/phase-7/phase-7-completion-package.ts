import {
  createControlledBetaOperationsFinalLockReport,
  type TeoyubeControlledBetaOperationsFinalLockInput
} from "./controlled-beta-operations-final-lock";
import {
  createFinalPhase7ServiceDisabledLock,
  createFinalPhase7ServiceDisabledLockReport,
  type TeoyubeFinalPhase7ServiceDisabledLock
} from "./final-phase-7-service-disabled-lock";
import {
  createPhase7CompletionReport,
  type TeoyubePhase7CompletionReviewInput
} from "./phase-7-completion-review";
import {
  createPhase7EvidenceArchive,
  createPhase7EvidenceArchiveReport,
  type TeoyubePhase7EvidenceArchive,
  type TeoyubePhase7EvidenceArchiveInput
} from "./phase-7-evidence-archive";
import { createPhase7FeatureInventoryReport } from "./phase-7-feature-inventory";
import {
  createPhase7OwnerCompletionReviewRecord,
  createPhase7OwnerCompletionReviewReport,
  type TeoyubePhase7OwnerCompletionReviewRecord
} from "./phase-7-owner-completion-review";
import {
  createPhase7RemainingRiskRegister,
  createPhase7RemainingRiskRegisterReport,
  type TeoyubePhase7RemainingRiskRegister
} from "./phase-7-remaining-risk-register";
import { createPhase8RoadmapReport } from "./phase-8-roadmap-builder";

export type TeoyubePhase7CompletionPackageDecision =
  | "phase_7_complete"
  | "phase_7_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase7CompletionPackageModel = {
  id: string;
  phase7CompletionReview: ReturnType<typeof createPhase7CompletionReport>;
  operationsFinalLockReport: ReturnType<typeof createControlledBetaOperationsFinalLockReport>;
  finalPhase7ServiceDisabledLock: TeoyubeFinalPhase7ServiceDisabledLock;
  finalPhase7ServiceDisabledLockReport: ReturnType<typeof createFinalPhase7ServiceDisabledLockReport>;
  phase7EvidenceArchive: TeoyubePhase7EvidenceArchive;
  phase7EvidenceArchiveReport: ReturnType<typeof createPhase7EvidenceArchiveReport>;
  featureInventory: ReturnType<typeof createPhase7FeatureInventoryReport>;
  remainingRiskRegister: TeoyubePhase7RemainingRiskRegister;
  remainingRiskRegisterReport: ReturnType<typeof createPhase7RemainingRiskRegisterReport>;
  ownerCompletionReview: TeoyubePhase7OwnerCompletionReviewRecord;
  ownerCompletionReviewReport: ReturnType<typeof createPhase7OwnerCompletionReviewReport>;
  phase8Roadmap: ReturnType<typeof createPhase8RoadmapReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 8.1 - Post-Beta Readiness Audit, Product Hardening Plan & Service Reassessment Gate";
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
  noReviewedContentAutoPublished: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase7CompletionPackageReport = {
  valid: boolean;
  decision: TeoyubePhase7CompletionPackageDecision;
  completionPackage: TeoyubePhase7CompletionPackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 8.1 - Post-Beta Readiness Audit, Product Hardening Plan & Service Reassessment Gate";
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
  noReviewedContentAutoPublished: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase7CompletionPackage(input: {
  completionInput?: TeoyubePhase7CompletionReviewInput;
  operationsLockInput?: TeoyubeControlledBetaOperationsFinalLockInput;
  evidenceInput?: TeoyubePhase7EvidenceArchiveInput;
  finalPhase7ServiceDisabledLock?: TeoyubeFinalPhase7ServiceDisabledLock;
  phase7EvidenceArchive?: TeoyubePhase7EvidenceArchive;
  remainingRiskRegister?: TeoyubePhase7RemainingRiskRegister;
  ownerCompletionReview?: TeoyubePhase7OwnerCompletionReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase7CompletionPackageModel {
  const ownerReviewed = input.ownerReviewed ?? false;
  const finalPhase7ServiceDisabledLock = input.finalPhase7ServiceDisabledLock || createFinalPhase7ServiceDisabledLock();
  const phase7EvidenceArchive = input.phase7EvidenceArchive || createPhase7EvidenceArchive(input.evidenceInput);
  const remainingRiskRegister = input.remainingRiskRegister || createPhase7RemainingRiskRegister();
  const ownerCompletionReview = input.ownerCompletionReview || createPhase7OwnerCompletionReviewRecord({ reviewed: ownerReviewed });
  const phase7CompletionReview = createPhase7CompletionReport({ ...input.completionInput, ownerReviewed: input.completionInput?.ownerReviewed ?? ownerReviewed });
  const operationsFinalLockReport = createControlledBetaOperationsFinalLockReport({ ...input.operationsLockInput, ownerReviewed: input.operationsLockInput?.ownerReviewed ?? ownerReviewed });
  const finalPhase7ServiceDisabledLockReport = createFinalPhase7ServiceDisabledLockReport(finalPhase7ServiceDisabledLock);
  const phase7EvidenceArchiveReport = createPhase7EvidenceArchiveReport(input.evidenceInput);
  const featureInventory = createPhase7FeatureInventoryReport();
  const remainingRiskRegisterReport = createPhase7RemainingRiskRegisterReport(remainingRiskRegister);
  const ownerCompletionReviewReport = createPhase7OwnerCompletionReviewReport(ownerCompletionReview);
  const phase8Roadmap = createPhase8RoadmapReport();
  const blockers = [
    ...phase7CompletionReview.blockers.map((entry) => entry.message),
    ...operationsFinalLockReport.blockers.map((entry) => entry.message),
    ...finalPhase7ServiceDisabledLockReport.blockers,
    ...phase7EvidenceArchiveReport.blockers,
    ...featureInventory.blockers,
    ...remainingRiskRegisterReport.blockers,
    ...ownerCompletionReviewReport.blockers,
    ...phase8Roadmap.blockers
  ];
  const warnings = [
    ...phase7CompletionReview.warnings.map((entry) => entry.message),
    ...operationsFinalLockReport.warnings.map((entry) => entry.message),
    ...finalPhase7ServiceDisabledLockReport.warnings,
    ...phase7EvidenceArchiveReport.warnings,
    ...featureInventory.warnings,
    ...remainingRiskRegisterReport.warnings,
    ...ownerCompletionReviewReport.warnings,
    ...phase8Roadmap.warnings
  ];

  return {
    id: "phase_7_completion_package",
    phase7CompletionReview,
    operationsFinalLockReport,
    finalPhase7ServiceDisabledLock,
    finalPhase7ServiceDisabledLockReport,
    phase7EvidenceArchive,
    phase7EvidenceArchiveReport,
    featureInventory,
    remainingRiskRegister,
    remainingRiskRegisterReport,
    ownerCompletionReview,
    ownerCompletionReviewReport,
    phase8Roadmap,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 8.1 - Post-Beta Readiness Audit, Product Hardening Plan & Service Reassessment Gate",
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
    noReviewedContentAutoPublished: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase7CompletionPackageBlockers(pkg: TeoyubePhase7CompletionPackageModel): string[] {
  return pkg.blockers;
}

export function getPhase7CompletionPackageWarnings(pkg: TeoyubePhase7CompletionPackageModel): string[] {
  return pkg.warnings;
}

export function createPhase7CompletionPackageDecision(pkg: TeoyubePhase7CompletionPackageModel): TeoyubePhase7CompletionPackageDecision {
  const blockers = getPhase7CompletionPackageBlockers(pkg);
  const warnings = getPhase7CompletionPackageWarnings(pkg);
  if (blockers.length) return "blocked";
  if (pkg.ownerCompletionReviewReport.decision === "owner_completion_pending") return "needs_owner_review";
  return warnings.length ? "phase_7_complete_with_warnings" : "phase_7_complete";
}

export function validatePhase7CompletionPackage(pkg: TeoyubePhase7CompletionPackageModel): TeoyubePhase7CompletionPackageReport {
  return createPhase7CompletionPackageReport(pkg);
}

export function createPhase7CompletionPackageReport(pkg: TeoyubePhase7CompletionPackageModel): TeoyubePhase7CompletionPackageReport {
  const blockers = getPhase7CompletionPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase7CompletionPackageDecision(pkg),
    completionPackage: pkg,
    blockers,
    warnings: getPhase7CompletionPackageWarnings(pkg),
    nextActionRecommendation: "Phase 8.1 - Post-Beta Readiness Audit, Product Hardening Plan & Service Reassessment Gate",
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
    noReviewedContentAutoPublished: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
