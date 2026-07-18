import {
  createControlledPublicGoNoGoReport
} from "./controlled-public-go-no-go";
import {
  createFinalPublicKnownLimitationsReport
} from "./final-public-known-limitations";
import {
  createFinalPublicOwnerApprovalRecord,
  createFinalPublicOwnerApprovalReport
} from "./final-public-owner-approval";
import {
  createPublicOperationalHandoffReport
} from "./public-operational-handoff";
import {
  createPublicReadinessEvidenceReport
} from "./public-readiness-evidence-summary";
import {
  createPublicReleaseBoundaryFinalReport
} from "./public-release-boundary-final-confirmation";
import {
  createPublicReleasePauseRollbackReport
} from "./public-release-pause-rollback-criteria";
import {
  createPublicServiceDisabledFinalConfirmationReport
} from "./public-service-disabled-final-confirmation";

export type TeoyubePublicGoNoGoReadinessPackageDecision =
  | "public_go_no_go_ready_for_phase_9_5"
  | "public_go_no_go_ready_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePublicGoNoGoReadinessPackageModel = {
  id: string;
  controlledPublicGoNoGoReport: ReturnType<typeof createControlledPublicGoNoGoReport>;
  publicReadinessEvidenceReport: ReturnType<typeof createPublicReadinessEvidenceReport>;
  publicReleaseBoundaryFinalReport: ReturnType<typeof createPublicReleaseBoundaryFinalReport>;
  finalPublicOwnerApprovalReport: ReturnType<typeof createFinalPublicOwnerApprovalReport>;
  publicOperationalHandoffReport: ReturnType<typeof createPublicOperationalHandoffReport>;
  pauseRollbackCriteriaReport: ReturnType<typeof createPublicReleasePauseRollbackReport>;
  finalKnownLimitationsReport: ReturnType<typeof createFinalPublicKnownLimitationsReport>;
  serviceDisabledFinalConfirmationReport: ReturnType<typeof createPublicServiceDisabledFinalConfirmationReport>;
  remainingRisks: string[];
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 9.5 - Phase 9 Completion Review, Public Readiness Lock & Phase 10 Roadmap";
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

export type TeoyubePublicGoNoGoReadinessPackageReport = {
  valid: boolean;
  decision: TeoyubePublicGoNoGoReadinessPackageDecision;
  package: TeoyubePublicGoNoGoReadinessPackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 9.5 - Phase 9 Completion Review, Public Readiness Lock & Phase 10 Roadmap";
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPublicGoNoGoReadinessPackage(input: {
  ownerReviewed?: boolean;
  remainingRisks?: string[];
} = {}): TeoyubePublicGoNoGoReadinessPackageModel {
  const ownerReviewed = input.ownerReviewed ?? true;
  const controlledPublicGoNoGoReport = createControlledPublicGoNoGoReport({ finalOwnerApproved: ownerReviewed });
  const publicReadinessEvidenceReport = createPublicReadinessEvidenceReport();
  const publicReleaseBoundaryFinalReport = createPublicReleaseBoundaryFinalReport();
  const finalPublicOwnerApprovalReport = createFinalPublicOwnerApprovalReport(createFinalPublicOwnerApprovalRecord({
    reviewed: ownerReviewed,
    nextPhaseAccepted: ownerReviewed,
    notes: ["Phase 9.4 final owner approval prepared for Phase 9 completion review only."]
  }));
  const publicOperationalHandoffReport = createPublicOperationalHandoffReport();
  const pauseRollbackCriteriaReport = createPublicReleasePauseRollbackReport();
  const finalKnownLimitationsReport = createFinalPublicKnownLimitationsReport();
  const serviceDisabledFinalConfirmationReport = createPublicServiceDisabledFinalConfirmationReport();
  const blockers = [
    ...controlledPublicGoNoGoReport.blockers.map((entry) => entry.message),
    ...publicReadinessEvidenceReport.blockers,
    ...publicReleaseBoundaryFinalReport.blockers,
    ...finalPublicOwnerApprovalReport.blockers.map((entry) => entry.message),
    ...publicOperationalHandoffReport.blockers.map((entry) => entry.message),
    ...pauseRollbackCriteriaReport.blockers,
    ...finalKnownLimitationsReport.blockers,
    ...serviceDisabledFinalConfirmationReport.blockers
  ];
  const warnings = [
    ...controlledPublicGoNoGoReport.warnings.map((entry) => entry.message),
    ...publicReadinessEvidenceReport.warnings,
    ...publicReleaseBoundaryFinalReport.warnings,
    ...finalPublicOwnerApprovalReport.warnings.map((entry) => entry.message),
    ...publicOperationalHandoffReport.warnings.map((entry) => entry.message),
    ...pauseRollbackCriteriaReport.warnings,
    ...finalKnownLimitationsReport.warnings,
    ...serviceDisabledFinalConfirmationReport.warnings
  ];
  return {
    id: "phase_9_4_public_go_no_go_readiness_package",
    controlledPublicGoNoGoReport,
    publicReadinessEvidenceReport,
    publicReleaseBoundaryFinalReport,
    finalPublicOwnerApprovalReport,
    publicOperationalHandoffReport,
    pauseRollbackCriteriaReport,
    finalKnownLimitationsReport,
    serviceDisabledFinalConfirmationReport,
    remainingRisks: input.remainingRisks || [
      "Future public release execution still requires a separate owner-approved planning step.",
      "Manual monitoring, support, feedback review, and issue triage remain operational responsibilities."
    ],
    blockers,
    warnings,
    nextActionRecommendation: "Phase 9.5 - Phase 9 Completion Review, Public Readiness Lock & Phase 10 Roadmap",
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

export function getPublicGoNoGoReadinessPackageBlockers(pkg: TeoyubePublicGoNoGoReadinessPackageModel): string[] {
  return pkg.blockers;
}

export function getPublicGoNoGoReadinessPackageWarnings(pkg: TeoyubePublicGoNoGoReadinessPackageModel): string[] {
  return pkg.warnings;
}

export function createPublicGoNoGoReadinessPackageDecision(pkg: TeoyubePublicGoNoGoReadinessPackageModel): TeoyubePublicGoNoGoReadinessPackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.finalPublicOwnerApprovalReport.decision === "not_approved") return "needs_owner_review";
  return pkg.warnings.length ? "public_go_no_go_ready_with_warnings" : "public_go_no_go_ready_for_phase_9_5";
}

export function validatePublicGoNoGoReadinessPackage(pkg: TeoyubePublicGoNoGoReadinessPackageModel): TeoyubePublicGoNoGoReadinessPackageReport {
  return createPublicGoNoGoReadinessPackageReport(pkg);
}

export function createPublicGoNoGoReadinessPackageReport(pkg: TeoyubePublicGoNoGoReadinessPackageModel): TeoyubePublicGoNoGoReadinessPackageReport {
  const blockers = getPublicGoNoGoReadinessPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPublicGoNoGoReadinessPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPublicGoNoGoReadinessPackageWarnings(pkg),
    nextActionRecommendation: "Phase 9.5 - Phase 9 Completion Review, Public Readiness Lock & Phase 10 Roadmap",
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
