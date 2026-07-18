import {
  createAdminReviewBoardReport,
  createAdminReviewBoardViewModel
} from "./admin-review-board-view-model";
import { createAdminWorkflowActionSimulationReport } from "./admin-workflow-action-simulator";
import {
  createBetaReadinessPackage,
  createBetaReadinessPackageReport
} from "./beta-readiness-package";
import { createBetaQaIssueTriageReport } from "./beta-qa-issue-triage";
import { createBetaQaPlan, createBetaQaPlanReport } from "./beta-qa-plan-builder";
import { createBetaQaRunbookReport } from "./beta-qa-runbook";
import {
  createControlledAdminWorkspace,
  createControlledAdminWorkspaceReport
} from "./controlled-admin-workspace";
import type { TeoyubeControlledAdminWorkspace } from "./controlled-admin-prototype-contracts";
import {
  createPhase45OwnerReviewRecord,
  createPhase45OwnerReviewReport,
  type TeoyubePhase45OwnerReviewRecord
} from "./phase-4-5-owner-review";
import { createServiceReadinessReviewReport } from "./service-readiness-review";

export type TeoyubePhase45PackageDecision =
  | "phase_4_5_complete"
  | "phase_4_5_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase45Package = {
  id: string;
  controlledAdminWorkspace: ReturnType<typeof createControlledAdminWorkspaceReport>;
  adminReviewBoardViewModel: ReturnType<typeof createAdminReviewBoardReport>;
  adminWorkflowActionSimulation: ReturnType<typeof createAdminWorkflowActionSimulationReport>;
  serviceReadinessReview: ReturnType<typeof createServiceReadinessReviewReport>;
  betaQaPlan: ReturnType<typeof createBetaQaPlanReport>;
  betaQaRunbook: ReturnType<typeof createBetaQaRunbookReport>;
  betaIssueTriage: ReturnType<typeof createBetaQaIssueTriageReport>;
  betaReadinessPackage: ReturnType<typeof createBetaReadinessPackageReport>;
  ownerReview: TeoyubePhase45OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase45OwnerReviewReport>;
  recommendedNextAction: "Phase 4.6 - Beta Readiness Review, Service Decision Lock & Phase 4 Completion";
  noProductionCms: true;
  noAdminAuthAdded: true;
  noUserAccountsAdded: true;
  noDatabasePersistenceEnabled: true;
  noExternalServicesRequired: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noEmailsOrNotificationsSent: true;
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubePhase45PackageReport = {
  valid: boolean;
  decision: TeoyubePhase45PackageDecision;
  phase45Package: TeoyubePhase45Package;
  blockers: string[];
  warnings: string[];
  noProductionCms: true;
  noAdminAuthAdded: true;
  noUserAccountsAdded: true;
  noDatabasePersistenceEnabled: true;
  noExternalServicesRequired: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noEmailsOrNotificationsSent: true;
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export function createPhase45Package(input: {
  workspace?: TeoyubeControlledAdminWorkspace;
  ownerReview?: TeoyubePhase45OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase45Package {
  const workspace = input.workspace || createControlledAdminWorkspace();
  const viewModel = createAdminReviewBoardViewModel({ workspace });
  const betaReadinessPackage = createBetaReadinessPackage({ workspace });
  const ownerReview = input.ownerReview || createPhase45OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });

  return {
    id: "phase_4_5_package",
    controlledAdminWorkspace: createControlledAdminWorkspaceReport(workspace),
    adminReviewBoardViewModel: createAdminReviewBoardReport({ viewModel }),
    adminWorkflowActionSimulation: createAdminWorkflowActionSimulationReport(workspace),
    serviceReadinessReview: createServiceReadinessReviewReport(),
    betaQaPlan: createBetaQaPlanReport(createBetaQaPlan()),
    betaQaRunbook: createBetaQaRunbookReport(),
    betaIssueTriage: createBetaQaIssueTriageReport(),
    betaReadinessPackage: createBetaReadinessPackageReport(betaReadinessPackage),
    ownerReview,
    ownerReviewReport: createPhase45OwnerReviewReport(ownerReview),
    recommendedNextAction: "Phase 4.6 - Beta Readiness Review, Service Decision Lock & Phase 4 Completion",
    noProductionCms: true,
    noAdminAuthAdded: true,
    noUserAccountsAdded: true,
    noDatabasePersistenceEnabled: true,
    noExternalServicesRequired: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noEmailsOrNotificationsSent: true,
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase45PackageBlockers(phase45Package: TeoyubePhase45Package): string[] {
  return [
    ...phase45Package.controlledAdminWorkspace.blockers.map((entry) => entry.message),
    ...phase45Package.adminReviewBoardViewModel.blockers.map((entry) => entry.message),
    ...phase45Package.adminWorkflowActionSimulation.blockers,
    ...phase45Package.serviceReadinessReview.blockers.map((entry) => entry.message),
    ...phase45Package.betaQaPlan.blockers.map((entry) => entry.message),
    ...phase45Package.betaQaRunbook.blockers,
    ...phase45Package.betaIssueTriage.blockers,
    ...phase45Package.betaReadinessPackage.blockers
  ];
}

export function getPhase45PackageWarnings(phase45Package: TeoyubePhase45Package): string[] {
  return [
    ...phase45Package.controlledAdminWorkspace.warnings.map((entry) => entry.message),
    ...phase45Package.adminReviewBoardViewModel.warnings.map((entry) => entry.message),
    ...phase45Package.adminWorkflowActionSimulation.warnings,
    ...phase45Package.serviceReadinessReview.warnings.map((entry) => entry.message),
    ...phase45Package.betaQaPlan.warnings.map((entry) => entry.message),
    ...phase45Package.betaQaRunbook.warnings,
    ...phase45Package.betaIssueTriage.warnings,
    ...phase45Package.betaReadinessPackage.warnings,
    ...phase45Package.ownerReviewReport.warnings
  ];
}

export function createPhase45PackageDecision(phase45Package: TeoyubePhase45Package): TeoyubePhase45PackageDecision {
  const blockers = getPhase45PackageBlockers(phase45Package);
  const warnings = getPhase45PackageWarnings(phase45Package);
  if (blockers.length) return "blocked";
  if (phase45Package.ownerReviewReport.blockers.length) return "needs_owner_review";
  return warnings.length ? "phase_4_5_complete_with_warnings" : "phase_4_5_complete";
}

export function validatePhase45Package(phase45Package: TeoyubePhase45Package): TeoyubePhase45PackageReport {
  return createPhase45PackageReport(phase45Package);
}

export function createPhase45PackageReport(phase45Package: TeoyubePhase45Package): TeoyubePhase45PackageReport {
  const blockers = getPhase45PackageBlockers(phase45Package);
  const warnings = getPhase45PackageWarnings(phase45Package);
  return {
    valid: blockers.length === 0,
    decision: createPhase45PackageDecision(phase45Package),
    phase45Package,
    blockers,
    warnings,
    noProductionCms: true,
    noAdminAuthAdded: true,
    noUserAccountsAdded: true,
    noDatabasePersistenceEnabled: true,
    noExternalServicesRequired: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noEmailsOrNotificationsSent: true,
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
