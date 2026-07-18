import {
  createControlledBetaReadinessPackage,
  createControlledBetaReadinessPackageReport,
  type TeoyubeControlledBetaReadinessPackage,
  type TeoyubeControlledBetaReadinessPackageInput
} from "./controlled-beta-readiness-package";
import {
  createPhase54OwnerReviewRecord,
  createPhase54OwnerReviewReport,
  type TeoyubePhase54OwnerReviewRecord
} from "./phase-5-4-owner-review";

export type TeoyubePhase54PackageDecision =
  | "phase_5_4_complete"
  | "phase_5_4_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase54PackageModel = {
  id: string;
  controlledBetaReadinessPackage: TeoyubeControlledBetaReadinessPackage;
  controlledBetaReadinessPackageReport: ReturnType<typeof createControlledBetaReadinessPackageReport>;
  ownerReview: TeoyubePhase54OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase54OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  goNoGoDecision: string;
  nextActionRecommendation: "Phase 5.5 - Phase 5 Completion Review, Beta Readiness Lock & Phase 6 Roadmap";
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

export type TeoyubePhase54PackageReport = {
  valid: boolean;
  decision: TeoyubePhase54PackageDecision;
  phase54Package: TeoyubePhase54PackageModel;
  blockers: string[];
  warnings: string[];
  goNoGoDecision: string;
  nextActionRecommendation: "Phase 5.5 - Phase 5 Completion Review, Beta Readiness Lock & Phase 6 Roadmap";
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

export function createPhase54Package(input: {
  readinessPackageInput?: TeoyubeControlledBetaReadinessPackageInput;
  controlledBetaReadinessPackage?: TeoyubeControlledBetaReadinessPackage;
  ownerReview?: TeoyubePhase54OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase54PackageModel {
  const controlledBetaReadinessPackage = input.controlledBetaReadinessPackage || createControlledBetaReadinessPackage(input.readinessPackageInput);
  const controlledBetaReadinessPackageReport = createControlledBetaReadinessPackageReport(controlledBetaReadinessPackage);
  const ownerReview = input.ownerReview || createPhase54OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const ownerReviewReport = createPhase54OwnerReviewReport(ownerReview);
  const blockers = [
    ...controlledBetaReadinessPackageReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...controlledBetaReadinessPackageReport.warnings,
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_5_4_controlled_beta_go_no_go_owner_approval_operational_handoff_package",
    controlledBetaReadinessPackage,
    controlledBetaReadinessPackageReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    goNoGoDecision: controlledBetaReadinessPackage.goNoGoReport.decision,
    nextActionRecommendation: "Phase 5.5 - Phase 5 Completion Review, Beta Readiness Lock & Phase 6 Roadmap",
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

export function getPhase54PackageBlockers(pkg: TeoyubePhase54PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase54PackageWarnings(pkg: TeoyubePhase54PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase54PackageDecision(pkg: TeoyubePhase54PackageModel): TeoyubePhase54PackageDecision {
  const blockers = getPhase54PackageBlockers(pkg);
  if (blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending" || pkg.controlledBetaReadinessPackageReport.decision === "ready_for_owner_approval") return "needs_owner_review";
  return getPhase54PackageWarnings(pkg).length ? "phase_5_4_complete_with_warnings" : "phase_5_4_complete";
}

export function validatePhase54Package(pkg: TeoyubePhase54PackageModel): TeoyubePhase54PackageReport {
  return createPhase54PackageReport(pkg);
}

export function createPhase54PackageReport(pkg: TeoyubePhase54PackageModel): TeoyubePhase54PackageReport {
  const blockers = getPhase54PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase54PackageDecision(pkg),
    phase54Package: pkg,
    blockers,
    warnings: getPhase54PackageWarnings(pkg),
    goNoGoDecision: pkg.goNoGoDecision,
    nextActionRecommendation: "Phase 5.5 - Phase 5 Completion Review, Beta Readiness Lock & Phase 6 Roadmap",
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
