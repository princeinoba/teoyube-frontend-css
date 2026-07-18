import {
  createControlledBetaGoNoGoReport,
  type TeoyubeControlledBetaGoNoGoInput
} from "./controlled-beta-go-no-go";
import {
  createBetaReadinessEvidenceReport,
  type TeoyubeBetaReadinessEvidenceInput
} from "./beta-readiness-evidence-summary";
import {
  createBetaLaunchBoundaryReport,
  type TeoyubeBetaLaunchBoundaryInput
} from "./beta-launch-boundary-validator";
import {
  createControlledBetaOwnerApprovalRecord,
  createControlledBetaOwnerApprovalReport
} from "./controlled-beta-owner-approval";
import type { TeoyubeControlledBetaOwnerApprovalRecord } from "./controlled-beta-owner-approval-contracts";
import {
  createBetaOperationalHandoff,
  createBetaOperationalHandoffReport,
  type TeoyubeBetaOperationalHandoffInput
} from "./beta-operational-handoff";
import {
  createControlledBetaPauseRollbackReport,
  type TeoyubeControlledBetaPauseRollbackInput
} from "./beta-pause-rollback-criteria";
import { createControlledBetaKnownLimitationsReport } from "./beta-known-limitations";

export type TeoyubeControlledBetaReadinessPackageDecision =
  | "ready_for_phase_5_5"
  | "ready_with_warnings"
  | "ready_for_owner_approval"
  | "blocked";

export type TeoyubeControlledBetaReadinessPackageInput = {
  goNoGoInput?: TeoyubeControlledBetaGoNoGoInput;
  evidenceInput?: TeoyubeBetaReadinessEvidenceInput;
  boundaryInput?: TeoyubeBetaLaunchBoundaryInput;
  ownerApprovalRecord?: TeoyubeControlledBetaOwnerApprovalRecord;
  handoffInput?: TeoyubeBetaOperationalHandoffInput;
  pauseRollbackInput?: TeoyubeControlledBetaPauseRollbackInput;
};

export type TeoyubeControlledBetaReadinessPackage = {
  id: string;
  goNoGoReport: ReturnType<typeof createControlledBetaGoNoGoReport>;
  evidenceReport: ReturnType<typeof createBetaReadinessEvidenceReport>;
  launchBoundaryReport: ReturnType<typeof createBetaLaunchBoundaryReport>;
  ownerApprovalReport: ReturnType<typeof createControlledBetaOwnerApprovalReport>;
  operationalHandoff: ReturnType<typeof createBetaOperationalHandoff>;
  operationalHandoffReport: ReturnType<typeof createBetaOperationalHandoffReport>;
  pauseRollbackCriteriaReport: ReturnType<typeof createControlledBetaPauseRollbackReport>;
  knownLimitationsReport: ReturnType<typeof createControlledBetaKnownLimitationsReport>;
  remainingRisks: string[];
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

export type TeoyubeControlledBetaReadinessPackageReport = {
  valid: boolean;
  decision: TeoyubeControlledBetaReadinessPackageDecision;
  readinessPackage: TeoyubeControlledBetaReadinessPackage;
  blockers: string[];
  warnings: string[];
  remainingRisks: string[];
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

export function createControlledBetaReadinessPackage(input: TeoyubeControlledBetaReadinessPackageInput = {}): TeoyubeControlledBetaReadinessPackage {
  const ownerApprovalRecord = input.ownerApprovalRecord || createControlledBetaOwnerApprovalRecord();
  const goNoGoReport = createControlledBetaGoNoGoReport(input.goNoGoInput);
  const evidenceReport = createBetaReadinessEvidenceReport(input.evidenceInput);
  const launchBoundaryReport = createBetaLaunchBoundaryReport(input.boundaryInput);
  const ownerApprovalReport = createControlledBetaOwnerApprovalReport(ownerApprovalRecord);
  const operationalHandoffInput = input.handoffInput || {
    goNoGoInput: input.goNoGoInput,
    evidenceInput: input.evidenceInput,
    boundaryInput: input.boundaryInput,
    ownerApprovalRecord,
    pauseRollbackInput: input.pauseRollbackInput
  };
  const operationalHandoff = createBetaOperationalHandoff(operationalHandoffInput);
  const operationalHandoffReport = createBetaOperationalHandoffReport(operationalHandoffInput);
  const pauseRollbackCriteriaReport = createControlledBetaPauseRollbackReport(input.pauseRollbackInput);
  const knownLimitationsReport = createControlledBetaKnownLimitationsReport();
  const remainingRisks = [
    ...goNoGoReport.risks.map((entry) => entry.message),
    ...operationalHandoff.remainingRisks,
    ...pauseRollbackCriteriaReport.matchedPauseCriteria.map((entry) => entry.details),
    ...pauseRollbackCriteriaReport.matchedRollbackCriteria.map((entry) => entry.details)
  ];

  return {
    id: "phase_5_4_controlled_beta_readiness_package",
    goNoGoReport,
    evidenceReport,
    launchBoundaryReport,
    ownerApprovalReport,
    operationalHandoff,
    operationalHandoffReport,
    pauseRollbackCriteriaReport,
    knownLimitationsReport,
    remainingRisks,
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

export function getControlledBetaReadinessPackageBlockers(pkg: TeoyubeControlledBetaReadinessPackage): string[] {
  return [
    ...pkg.goNoGoReport.blockers.map((entry) => entry.message),
    ...pkg.evidenceReport.blockers,
    ...pkg.launchBoundaryReport.blockers.map((entry) => entry.message),
    ...pkg.ownerApprovalReport.blockers.map((entry) => entry.message),
    ...pkg.operationalHandoffReport.blockers.map((entry) => entry.message)
  ];
}

export function getControlledBetaReadinessPackageWarnings(pkg: TeoyubeControlledBetaReadinessPackage): string[] {
  return [
    ...pkg.goNoGoReport.warnings.map((entry) => entry.message),
    ...pkg.evidenceReport.warnings,
    ...pkg.launchBoundaryReport.warnings.map((entry) => entry.message),
    ...pkg.ownerApprovalReport.warnings.map((entry) => entry.message),
    ...pkg.operationalHandoffReport.warnings.map((entry) => entry.message),
    ...(pkg.pauseRollbackCriteriaReport.pauseRecommended ? ["Pause criteria matched; manual pause review is recommended."] : []),
    ...(pkg.pauseRollbackCriteriaReport.rollbackReviewRecommended ? ["Rollback criteria matched; manual rollback review is recommended."] : [])
  ];
}

export function createControlledBetaReadinessPackageDecision(pkg: TeoyubeControlledBetaReadinessPackage): TeoyubeControlledBetaReadinessPackageDecision {
  const blockers = getControlledBetaReadinessPackageBlockers(pkg);
  const warnings = getControlledBetaReadinessPackageWarnings(pkg);
  if (blockers.length) return "blocked";
  if (pkg.ownerApprovalReport.decision === "not_approved") return "ready_for_owner_approval";
  return warnings.length ? "ready_with_warnings" : "ready_for_phase_5_5";
}

export function validateControlledBetaReadinessPackage(pkg: TeoyubeControlledBetaReadinessPackage): TeoyubeControlledBetaReadinessPackageReport {
  return createControlledBetaReadinessPackageReport(pkg);
}

export function createControlledBetaReadinessPackageReport(pkg: TeoyubeControlledBetaReadinessPackage): TeoyubeControlledBetaReadinessPackageReport {
  const blockers = getControlledBetaReadinessPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createControlledBetaReadinessPackageDecision(pkg),
    readinessPackage: pkg,
    blockers,
    warnings: getControlledBetaReadinessPackageWarnings(pkg),
    remainingRisks: pkg.remainingRisks,
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
