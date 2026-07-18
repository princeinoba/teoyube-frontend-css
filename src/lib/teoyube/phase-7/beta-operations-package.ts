import {
  createBetaIssueEscalationWorkflowReport,
  type TeoyubeBetaOperationalIssue
} from "./beta-issue-escalation-workflow";
import { createBetaOperationsKnownLimitationsReport } from "./beta-operations-known-limitations";
import {
  createBetaOperationsPauseRollbackReviewReport,
  type TeoyubeBetaOperationsPauseRollbackInput
} from "./beta-operations-pause-rollback-review";
import {
  createBetaSupportToIssueConversionReport
} from "./beta-support-to-issue-converter";
import {
  createBetaSupportWorkflowReport
} from "./beta-support-workflow";
import type { TeoyubeBetaSupportRequest } from "./beta-support-workflow-contracts";
import {
  createControlledBetaOperationsRunbookReport,
  type TeoyubeControlledBetaOperationsRunbookInput
} from "./controlled-beta-operations-runbook";
import {
  createManualBetaFeedbackReview,
  createManualBetaFeedbackReviewReport
} from "./manual-beta-feedback-review";
import type {
  TeoyubeManualBetaFeedbackItem,
  TeoyubeManualBetaFeedbackReview
} from "./manual-beta-feedback-review-contracts";
import {
  createManualOperationalMonitoringReport,
  createManualOperationalMonitoringRun
} from "./manual-operational-monitoring";
import type { TeoyubeManualOperationalMonitoringRun } from "./manual-operational-monitoring-contracts";

export type TeoyubeBetaOperationsPackageDecision =
  | "beta_operations_ready"
  | "beta_operations_ready_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubeBetaOperationsPackageModel = {
  id: string;
  operationsRunbookReport: ReturnType<typeof createControlledBetaOperationsRunbookReport>;
  manualFeedbackReviewReport: ReturnType<typeof createManualBetaFeedbackReviewReport>;
  betaSupportWorkflowReport: ReturnType<typeof createBetaSupportWorkflowReport>;
  manualOperationalMonitoringReport: ReturnType<typeof createManualOperationalMonitoringReport>;
  betaIssueEscalationReport: ReturnType<typeof createBetaIssueEscalationWorkflowReport>;
  supportToIssueConversionReport: ReturnType<typeof createBetaSupportToIssueConversionReport>;
  pauseRollbackReviewReport: ReturnType<typeof createBetaOperationsPauseRollbackReviewReport>;
  knownLimitationsReport: ReturnType<typeof createBetaOperationsKnownLimitationsReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.2 - Manual Feedback Review Simulation, Support Issue Triage & Product Stabilization Queue";
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

export type TeoyubeBetaOperationsPackageReport = {
  valid: boolean;
  decision: TeoyubeBetaOperationsPackageDecision;
  package: TeoyubeBetaOperationsPackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.2 - Manual Feedback Review Simulation, Support Issue Triage & Product Stabilization Queue";
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

export function createBetaOperationsPackage(input: {
  runbookInput?: TeoyubeControlledBetaOperationsRunbookInput;
  feedbackReview?: TeoyubeManualBetaFeedbackReview;
  feedbackItems?: TeoyubeManualBetaFeedbackItem[];
  supportRequests?: TeoyubeBetaSupportRequest[];
  monitoringRun?: TeoyubeManualOperationalMonitoringRun;
  operationalIssues?: TeoyubeBetaOperationalIssue[];
  pauseRollbackInput?: TeoyubeBetaOperationsPauseRollbackInput;
  ownerApproved?: boolean;
} = {}): TeoyubeBetaOperationsPackageModel {
  const supportRequests = input.supportRequests || [];
  const manualFeedbackReview = input.feedbackReview || createManualBetaFeedbackReview({ items: input.feedbackItems || [] });
  const supportToIssueConversionReport = createBetaSupportToIssueConversionReport(supportRequests);
  const operationalIssues = input.operationalIssues || supportToIssueConversionReport.issues;
  const operationsRunbookReport = createControlledBetaOperationsRunbookReport({ ...input.runbookInput, ownerApproved: input.runbookInput?.ownerApproved ?? input.ownerApproved ?? true });
  const manualFeedbackReviewReport = createManualBetaFeedbackReviewReport(manualFeedbackReview);
  const betaSupportWorkflowReport = createBetaSupportWorkflowReport(supportRequests);
  const manualOperationalMonitoringReport = createManualOperationalMonitoringReport(input.monitoringRun || createManualOperationalMonitoringRun());
  const betaIssueEscalationReport = createBetaIssueEscalationWorkflowReport(operationalIssues);
  const pauseRollbackReviewReport = createBetaOperationsPauseRollbackReviewReport(input.pauseRollbackInput);
  const knownLimitationsReport = createBetaOperationsKnownLimitationsReport();
  const blockers = [
    ...operationsRunbookReport.blockers.map((entry) => entry.message),
    ...manualFeedbackReviewReport.blockers.map((entry) => entry.message),
    ...betaSupportWorkflowReport.blockers.map((entry) => entry.message),
    ...manualOperationalMonitoringReport.blockers.map((entry) => entry.message),
    ...betaIssueEscalationReport.blockers,
    ...supportToIssueConversionReport.blockers
  ];
  const warnings = [
    ...operationsRunbookReport.warnings.map((entry) => entry.message),
    ...manualFeedbackReviewReport.warnings.map((entry) => entry.message),
    ...betaSupportWorkflowReport.warnings.map((entry) => entry.message),
    ...manualOperationalMonitoringReport.warnings.map((entry) => entry.message),
    ...betaIssueEscalationReport.warnings,
    ...supportToIssueConversionReport.warnings,
    ...(pauseRollbackReviewReport.pauseRecommended ? ["Pause review is recommended by manual decision support."] : []),
    ...(pauseRollbackReviewReport.rollbackReviewRecommended ? ["Rollback review is recommended by manual decision support."] : []),
    ...knownLimitationsReport.warnings
  ];
  return {
    id: "phase_7_1_beta_operations_package",
    operationsRunbookReport,
    manualFeedbackReviewReport,
    betaSupportWorkflowReport,
    manualOperationalMonitoringReport,
    betaIssueEscalationReport,
    supportToIssueConversionReport,
    pauseRollbackReviewReport,
    knownLimitationsReport,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 7.2 - Manual Feedback Review Simulation, Support Issue Triage & Product Stabilization Queue",
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

export function getBetaOperationsPackageBlockers(pkg: TeoyubeBetaOperationsPackageModel): string[] {
  return pkg.blockers;
}

export function getBetaOperationsPackageWarnings(pkg: TeoyubeBetaOperationsPackageModel): string[] {
  return pkg.warnings;
}

export function createBetaOperationsPackageDecision(pkg: TeoyubeBetaOperationsPackageModel): TeoyubeBetaOperationsPackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.operationsRunbookReport.decision === "needs_owner_review") return "needs_owner_review";
  return pkg.warnings.length ? "beta_operations_ready_with_warnings" : "beta_operations_ready";
}

export function validateBetaOperationsPackage(pkg: TeoyubeBetaOperationsPackageModel): TeoyubeBetaOperationsPackageReport {
  return createBetaOperationsPackageReport(pkg);
}

export function createBetaOperationsPackageReport(pkg: TeoyubeBetaOperationsPackageModel): TeoyubeBetaOperationsPackageReport {
  const blockers = getBetaOperationsPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createBetaOperationsPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getBetaOperationsPackageWarnings(pkg),
    nextActionRecommendation: "Phase 7.2 - Manual Feedback Review Simulation, Support Issue Triage & Product Stabilization Queue",
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
