import {
  createAdminReviewBoardReport,
  createAdminReviewBoardViewModel
} from "./admin-review-board-view-model";
import { createAdminWorkflowActionSimulationReport } from "./admin-workflow-action-simulator";
import { createBetaQaIssueTriageReport, type TeoyubeBetaQaIssue } from "./beta-qa-issue-triage";
import { createBetaQaPlan, createBetaQaPlanReport } from "./beta-qa-plan-builder";
import { createBetaQaRunbookReport } from "./beta-qa-runbook";
import {
  createControlledAdminWorkspace,
  createControlledAdminWorkspaceReport
} from "./controlled-admin-workspace";
import type { TeoyubeControlledAdminWorkspace } from "./controlled-admin-prototype-contracts";
import {
  createPhase44Package,
  createPhase44PackageReport
} from "./phase-4-4-package";
import { createServiceReadinessReviewReport } from "./service-readiness-review";

export type TeoyubeBetaReadinessPackageDecision =
  | "beta_readiness_package_ready"
  | "beta_readiness_package_ready_with_warnings"
  | "blocked";

export type TeoyubeBetaReadinessPackage = {
  id: string;
  workspace: TeoyubeControlledAdminWorkspace;
  workspaceReport: ReturnType<typeof createControlledAdminWorkspaceReport>;
  adminReviewBoard: ReturnType<typeof createAdminReviewBoardReport>;
  actionSimulation: ReturnType<typeof createAdminWorkflowActionSimulationReport>;
  serviceReadiness: ReturnType<typeof createServiceReadinessReviewReport>;
  betaQaPlan: ReturnType<typeof createBetaQaPlanReport>;
  betaQaRunbook: ReturnType<typeof createBetaQaRunbookReport>;
  betaIssueTriage: ReturnType<typeof createBetaQaIssueTriageReport>;
  reviewedContentGateStatus: ReturnType<typeof createPhase44PackageReport>["phase44Package"]["reviewedContentGate"];
  promiseTableUxStatus: ReturnType<typeof createPhase44PackageReport>["phase44Package"]["promiseTableUx"];
  tigGraphUxStatus: ReturnType<typeof createPhase44PackageReport>["phase44Package"]["tigGraphExperience"];
  nextActionRecommendation: "Phase 4.6 - Beta Readiness Review, Service Decision Lock & Phase 4 Completion";
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

export type TeoyubeBetaReadinessPackageReport = {
  valid: boolean;
  decision: TeoyubeBetaReadinessPackageDecision;
  betaReadinessPackage: TeoyubeBetaReadinessPackage;
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

export function createBetaReadinessPackage(input: {
  workspace?: TeoyubeControlledAdminWorkspace;
  issues?: TeoyubeBetaQaIssue[];
} = {}): TeoyubeBetaReadinessPackage {
  const workspace = input.workspace || createControlledAdminWorkspace();
  const viewModel = createAdminReviewBoardViewModel({ workspace });
  const phase44Report = createPhase44PackageReport(createPhase44Package());
  return {
    id: "phase_4_5_beta_readiness_package",
    workspace,
    workspaceReport: createControlledAdminWorkspaceReport(workspace),
    adminReviewBoard: createAdminReviewBoardReport({ viewModel }),
    actionSimulation: createAdminWorkflowActionSimulationReport(workspace),
    serviceReadiness: createServiceReadinessReviewReport(),
    betaQaPlan: createBetaQaPlanReport(createBetaQaPlan()),
    betaQaRunbook: createBetaQaRunbookReport(),
    betaIssueTriage: createBetaQaIssueTriageReport(input.issues || []),
    reviewedContentGateStatus: phase44Report.phase44Package.reviewedContentGate,
    promiseTableUxStatus: phase44Report.phase44Package.promiseTableUx,
    tigGraphUxStatus: phase44Report.phase44Package.tigGraphExperience,
    nextActionRecommendation: "Phase 4.6 - Beta Readiness Review, Service Decision Lock & Phase 4 Completion",
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

export function getBetaReadinessPackageBlockers(betaPackage: TeoyubeBetaReadinessPackage): string[] {
  return [
    ...betaPackage.workspaceReport.blockers.map((entry) => entry.message),
    ...betaPackage.adminReviewBoard.blockers.map((entry) => entry.message),
    ...betaPackage.actionSimulation.blockers,
    ...betaPackage.serviceReadiness.blockers.map((entry) => entry.message),
    ...betaPackage.betaQaPlan.blockers.map((entry) => entry.message),
    ...betaPackage.betaQaRunbook.blockers,
    ...betaPackage.betaIssueTriage.blockers,
    ...betaPackage.reviewedContentGateStatus.blockers.map((entry) => entry.message),
    ...betaPackage.promiseTableUxStatus.blockers.map((entry) => entry.message),
    ...betaPackage.tigGraphUxStatus.blockers.map((entry) => entry.message)
  ];
}

export function getBetaReadinessPackageWarnings(betaPackage: TeoyubeBetaReadinessPackage): string[] {
  return [
    ...betaPackage.workspaceReport.warnings.map((entry) => entry.message),
    ...betaPackage.adminReviewBoard.warnings.map((entry) => entry.message),
    ...betaPackage.actionSimulation.warnings,
    ...betaPackage.serviceReadiness.warnings.map((entry) => entry.message),
    ...betaPackage.betaQaPlan.warnings.map((entry) => entry.message),
    ...betaPackage.betaQaRunbook.warnings,
    ...betaPackage.betaIssueTriage.warnings,
    ...betaPackage.reviewedContentGateStatus.warnings.map((entry) => entry.message),
    ...betaPackage.promiseTableUxStatus.warnings.map((entry) => entry.message),
    ...betaPackage.tigGraphUxStatus.warnings.map((entry) => entry.message)
  ];
}

export function createBetaReadinessPackageDecision(betaPackage: TeoyubeBetaReadinessPackage): TeoyubeBetaReadinessPackageDecision {
  const blockers = getBetaReadinessPackageBlockers(betaPackage);
  const warnings = getBetaReadinessPackageWarnings(betaPackage);
  if (blockers.length) return "blocked";
  return warnings.length ? "beta_readiness_package_ready_with_warnings" : "beta_readiness_package_ready";
}

export function validateBetaReadinessPackage(betaPackage: TeoyubeBetaReadinessPackage): TeoyubeBetaReadinessPackageReport {
  return createBetaReadinessPackageReport(betaPackage);
}

export function createBetaReadinessPackageReport(betaPackage: TeoyubeBetaReadinessPackage): TeoyubeBetaReadinessPackageReport {
  const blockers = getBetaReadinessPackageBlockers(betaPackage);
  const warnings = getBetaReadinessPackageWarnings(betaPackage);
  return {
    valid: blockers.length === 0,
    decision: createBetaReadinessPackageDecision(betaPackage),
    betaReadinessPackage: betaPackage,
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
