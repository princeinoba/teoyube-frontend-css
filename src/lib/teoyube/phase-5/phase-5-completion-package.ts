import {
  createPhase5CompletionReport,
  type TeoyubePhase5CompletionReviewInput
} from "./phase-5-completion-review";
import {
  createBetaReadinessLock,
  createBetaReadinessLockReport,
  type TeoyubeBetaReadinessLock
} from "./beta-readiness-lock";
import {
  createFinalDisabledServiceLock,
  createFinalDisabledServiceLockReport,
  type TeoyubeFinalDisabledServiceLock
} from "./final-disabled-service-lock";
import {
  createBetaReadinessEvidenceArchive,
  createBetaReadinessEvidenceArchiveReport,
  type TeoyubeBetaReadinessEvidenceArchive,
  type TeoyubeBetaReadinessEvidenceArchiveInput
} from "./beta-readiness-evidence-archive";
import { createPhase5FeatureInventoryReport } from "./phase-5-feature-inventory";
import {
  createPhase5RemainingRiskRegister,
  createPhase5RemainingRiskRegisterReport,
  type TeoyubePhase5RemainingRiskRegister
} from "./phase-5-remaining-risk-register";
import {
  createPhase5OwnerCompletionReviewRecord,
  createPhase5OwnerCompletionReviewReport,
  type TeoyubePhase5OwnerCompletionReviewRecord
} from "./phase-5-owner-completion-review";
import { createPhase6RoadmapReport } from "./phase-6-roadmap-builder";

export type TeoyubePhase5CompletionPackageDecision =
  | "phase_5_complete"
  | "phase_5_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase5CompletionPackageModel = {
  id: string;
  phase5CompletionReview: ReturnType<typeof createPhase5CompletionReport>;
  betaReadinessLock: TeoyubeBetaReadinessLock;
  betaReadinessLockReport: ReturnType<typeof createBetaReadinessLockReport>;
  finalDisabledServiceLock: TeoyubeFinalDisabledServiceLock;
  finalDisabledServiceLockReport: ReturnType<typeof createFinalDisabledServiceLockReport>;
  betaReadinessEvidenceArchive: TeoyubeBetaReadinessEvidenceArchive;
  betaReadinessEvidenceArchiveReport: ReturnType<typeof createBetaReadinessEvidenceArchiveReport>;
  featureInventory: ReturnType<typeof createPhase5FeatureInventoryReport>;
  remainingRiskRegister: TeoyubePhase5RemainingRiskRegister;
  remainingRiskRegisterReport: ReturnType<typeof createPhase5RemainingRiskRegisterReport>;
  ownerCompletionReview: TeoyubePhase5OwnerCompletionReviewRecord;
  ownerCompletionReviewReport: ReturnType<typeof createPhase5OwnerCompletionReviewReport>;
  phase6Roadmap: ReturnType<typeof createPhase6RoadmapReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 6.1 - Controlled Beta Execution Plan, Manual Participant Workflow & Feedback Boundaries";
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
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase5CompletionPackageReport = {
  valid: boolean;
  decision: TeoyubePhase5CompletionPackageDecision;
  completionPackage: TeoyubePhase5CompletionPackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 6.1 - Controlled Beta Execution Plan, Manual Participant Workflow & Feedback Boundaries";
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
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase5CompletionPackage(input: {
  completionInput?: TeoyubePhase5CompletionReviewInput;
  evidenceInput?: TeoyubeBetaReadinessEvidenceArchiveInput;
  betaReadinessLock?: TeoyubeBetaReadinessLock;
  finalDisabledServiceLock?: TeoyubeFinalDisabledServiceLock;
  betaReadinessEvidenceArchive?: TeoyubeBetaReadinessEvidenceArchive;
  remainingRiskRegister?: TeoyubePhase5RemainingRiskRegister;
  ownerCompletionReview?: TeoyubePhase5OwnerCompletionReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase5CompletionPackageModel {
  const betaReadinessLock = input.betaReadinessLock || createBetaReadinessLock();
  const finalDisabledServiceLock = input.finalDisabledServiceLock || createFinalDisabledServiceLock();
  const betaReadinessEvidenceArchive = input.betaReadinessEvidenceArchive || createBetaReadinessEvidenceArchive(input.evidenceInput);
  const remainingRiskRegister = input.remainingRiskRegister || createPhase5RemainingRiskRegister();
  const ownerCompletionReview = input.ownerCompletionReview || createPhase5OwnerCompletionReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const phase5CompletionReview = createPhase5CompletionReport(input.completionInput);
  const betaReadinessLockReport = createBetaReadinessLockReport(betaReadinessLock);
  const finalDisabledServiceLockReport = createFinalDisabledServiceLockReport(finalDisabledServiceLock);
  const betaReadinessEvidenceArchiveReport = createBetaReadinessEvidenceArchiveReport(input.evidenceInput);
  const featureInventory = createPhase5FeatureInventoryReport();
  const remainingRiskRegisterReport = createPhase5RemainingRiskRegisterReport(remainingRiskRegister);
  const ownerCompletionReviewReport = createPhase5OwnerCompletionReviewReport(ownerCompletionReview);
  const phase6Roadmap = createPhase6RoadmapReport();
  const blockers = [
    ...phase5CompletionReview.blockers.map((entry) => entry.message),
    ...betaReadinessLockReport.blockers.map((entry) => entry.message),
    ...finalDisabledServiceLockReport.blockers,
    ...betaReadinessEvidenceArchiveReport.blockers,
    ...featureInventory.blockers,
    ...remainingRiskRegisterReport.blockers,
    ...ownerCompletionReviewReport.blockers,
    ...phase6Roadmap.blockers
  ];
  const warnings = [
    ...phase5CompletionReview.warnings.map((entry) => entry.message),
    ...betaReadinessLockReport.warnings.map((entry) => entry.message),
    ...finalDisabledServiceLockReport.warnings,
    ...betaReadinessEvidenceArchiveReport.warnings,
    ...featureInventory.warnings,
    ...remainingRiskRegisterReport.warnings,
    ...ownerCompletionReviewReport.warnings,
    ...phase6Roadmap.warnings
  ];

  return {
    id: "phase_5_completion_package",
    phase5CompletionReview,
    betaReadinessLock,
    betaReadinessLockReport,
    finalDisabledServiceLock,
    finalDisabledServiceLockReport,
    betaReadinessEvidenceArchive,
    betaReadinessEvidenceArchiveReport,
    featureInventory,
    remainingRiskRegister,
    remainingRiskRegisterReport,
    ownerCompletionReview,
    ownerCompletionReviewReport,
    phase6Roadmap,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 6.1 - Controlled Beta Execution Plan, Manual Participant Workflow & Feedback Boundaries",
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
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase5CompletionPackageBlockers(pkg: TeoyubePhase5CompletionPackageModel): string[] {
  return pkg.blockers;
}

export function getPhase5CompletionPackageWarnings(pkg: TeoyubePhase5CompletionPackageModel): string[] {
  return pkg.warnings;
}

export function createPhase5CompletionPackageDecision(pkg: TeoyubePhase5CompletionPackageModel): TeoyubePhase5CompletionPackageDecision {
  const blockers = getPhase5CompletionPackageBlockers(pkg);
  const warnings = getPhase5CompletionPackageWarnings(pkg);
  if (blockers.length) return "blocked";
  if (pkg.ownerCompletionReviewReport.decision === "owner_completion_pending") return "needs_owner_review";
  return warnings.length ? "phase_5_complete_with_warnings" : "phase_5_complete";
}

export function validatePhase5CompletionPackage(pkg: TeoyubePhase5CompletionPackageModel): TeoyubePhase5CompletionPackageReport {
  return createPhase5CompletionPackageReport(pkg);
}

export function createPhase5CompletionPackageReport(pkg: TeoyubePhase5CompletionPackageModel): TeoyubePhase5CompletionPackageReport {
  const blockers = getPhase5CompletionPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase5CompletionPackageDecision(pkg),
    completionPackage: pkg,
    blockers,
    warnings: getPhase5CompletionPackageWarnings(pkg),
    nextActionRecommendation: "Phase 6.1 - Controlled Beta Execution Plan, Manual Participant Workflow & Feedback Boundaries",
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
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
