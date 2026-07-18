import {
  addSimulatedManualFeedbackReviewItem,
  createManualFeedbackReviewSimulation,
  createManualFeedbackReviewSimulationReport,
  createSimulatedManualFeedbackReviewItem
} from "./manual-feedback-review-simulation";
import type { TeoyubeManualFeedbackReviewSimulation } from "./manual-feedback-review-simulation-contracts";
import {
  createFeedbackToSupportIssueConversionReport
} from "./feedback-to-support-issue-converter";
import {
  createSupportIssueTriageReport
} from "./support-issue-triage";
import type { TeoyubeSupportIssue } from "./support-issue-triage-contracts";
import {
  addProductStabilizationQueueItems,
  createProductStabilizationQueue,
  createProductStabilizationQueueReport
} from "./product-stabilization-queue-manager";
import type {
  TeoyubeProductStabilizationQueue,
  TeoyubeProductStabilizationQueueItem
} from "./product-stabilization-queue-contracts";
import {
  createSupportIssueToStabilizationConversionReport
} from "./support-issue-to-stabilization-converter";
import {
  createProductStabilizationSafetyReport
} from "./product-stabilization-safety-validator";
import {
  createProductStabilizationPlan,
  createProductStabilizationPlanReport
} from "./product-stabilization-planner";
import {
  createFeedbackReviewSimulationQaReport
} from "./feedback-review-simulation-qa";
import {
  createSupportWorkflowQaReport
} from "./support-workflow-qa";
import {
  createProductStabilizationQueueQaReport
} from "./product-stabilization-queue-qa";
import {
  createPhase72OwnerReviewRecord,
  createPhase72OwnerReviewReport,
  type TeoyubePhase72OwnerReviewRecord
} from "./phase-7-2-owner-review";

export type TeoyubePhase72SafePatchSummary = {
  fileChanged: string;
  issueAddressed: string;
  safetyReason: string;
  regressionChecksRequired: string[];
};

export type TeoyubePhase72PackageDecision =
  | "phase_7_2_complete"
  | "phase_7_2_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase72PackageModel = {
  id: string;
  feedbackReviewSimulationReport: ReturnType<typeof createManualFeedbackReviewSimulationReport>;
  feedbackToSupportIssueConversionReport: ReturnType<typeof createFeedbackToSupportIssueConversionReport>;
  supportIssueTriageReport: ReturnType<typeof createSupportIssueTriageReport>;
  supportIssueToStabilizationConversionReport: ReturnType<typeof createSupportIssueToStabilizationConversionReport>;
  productStabilizationQueueReport: ReturnType<typeof createProductStabilizationQueueReport>;
  stabilizationSafetyReport: ReturnType<typeof createProductStabilizationSafetyReport>;
  stabilizationPlanReport: ReturnType<typeof createProductStabilizationPlanReport>;
  feedbackReviewSimulationQaReport: ReturnType<typeof createFeedbackReviewSimulationQaReport>;
  supportWorkflowQaReport: ReturnType<typeof createSupportWorkflowQaReport>;
  stabilizationQueueQaReport: ReturnType<typeof createProductStabilizationQueueQaReport>;
  safePatchSummary: TeoyubePhase72SafePatchSummary[];
  ownerReview: TeoyubePhase72OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase72OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.3 - Product Stabilization Pass, Regression QA & Beta Operations Readiness Score";
  manualOnly: true;
  inMemoryOnly: true;
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
  generatedAt: string;
};

export type TeoyubePhase72PackageReport = {
  valid: boolean;
  decision: TeoyubePhase72PackageDecision;
  package: TeoyubePhase72PackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 7.3 - Product Stabilization Pass, Regression QA & Beta Operations Readiness Score";
  manualOnly: true;
  inMemoryOnly: true;
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
  generatedAt: string;
};

function defaultSimulation(): TeoyubeManualFeedbackReviewSimulation {
  const simulation = createManualFeedbackReviewSimulation();
  const item = createSimulatedManualFeedbackReviewItem({
    rawText: "The confidence label on the TIG response panel is confusing on mobile.",
    category: "confidence_label"
  });
  return addSimulatedManualFeedbackReviewItem(simulation, item);
}

function stringMessages(entries: Array<{ message?: string; details?: string } | string>): string[] {
  return entries.map((entry) => typeof entry === "string" ? entry : entry.message || entry.details || "Phase 7.2 review item needs attention.");
}

export function createPhase72Package(input: {
  feedbackSimulation?: TeoyubeManualFeedbackReviewSimulation;
  supportIssues?: TeoyubeSupportIssue[];
  stabilizationQueue?: TeoyubeProductStabilizationQueue;
  stabilizationItems?: TeoyubeProductStabilizationQueueItem[];
  safePatchSummary?: TeoyubePhase72SafePatchSummary[];
  ownerReview?: TeoyubePhase72OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase72PackageModel {
  const feedbackSimulation = input.feedbackSimulation || defaultSimulation();
  const feedbackReviewSimulationReport = createManualFeedbackReviewSimulationReport(feedbackSimulation);
  const feedbackToSupportIssueConversionReport = createFeedbackToSupportIssueConversionReport(feedbackSimulation.items);
  const supportIssues = input.supportIssues || feedbackToSupportIssueConversionReport.issues;
  const supportIssueTriageReport = createSupportIssueTriageReport(supportIssues);
  const supportIssueToStabilizationConversionReport = createSupportIssueToStabilizationConversionReport(supportIssueTriageReport.issues);
  const baseQueue = input.stabilizationQueue || createProductStabilizationQueue();
  const stabilizationItems = input.stabilizationItems || supportIssueToStabilizationConversionReport.items;
  const queue = input.stabilizationQueue ? input.stabilizationQueue : addProductStabilizationQueueItems(baseQueue, stabilizationItems);
  const productStabilizationQueueReport = createProductStabilizationQueueReport(queue);
  const stabilizationSafetyReport = createProductStabilizationSafetyReport(queue);
  const stabilizationPlan = createProductStabilizationPlan({ queue });
  const stabilizationPlanReport = createProductStabilizationPlanReport(stabilizationPlan);
  const feedbackReviewSimulationQaReport = createFeedbackReviewSimulationQaReport(feedbackSimulation);
  const supportWorkflowQaReport = createSupportWorkflowQaReport(supportIssueTriageReport.issues);
  const stabilizationQueueQaReport = createProductStabilizationQueueQaReport(queue);
  const ownerReview = input.ownerReview || createPhase72OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const ownerReviewReport = createPhase72OwnerReviewReport(ownerReview);
  const blockers = [
    ...stringMessages(feedbackReviewSimulationReport.blockers),
    ...stringMessages(supportIssueTriageReport.blockers),
    ...stringMessages(productStabilizationQueueReport.blockers),
    ...stringMessages(stabilizationSafetyReport.blockers),
    ...stabilizationPlanReport.blockers,
    ...feedbackReviewSimulationQaReport.blockers,
    ...supportWorkflowQaReport.blockers,
    ...stabilizationQueueQaReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...stringMessages(feedbackReviewSimulationReport.warnings),
    ...feedbackToSupportIssueConversionReport.warnings,
    ...stringMessages(supportIssueTriageReport.warnings),
    ...supportIssueToStabilizationConversionReport.warnings,
    ...stringMessages(productStabilizationQueueReport.warnings),
    ...stringMessages(stabilizationSafetyReport.warnings),
    ...stabilizationPlanReport.warnings,
    ...feedbackReviewSimulationQaReport.warnings,
    ...supportWorkflowQaReport.warnings,
    ...stabilizationQueueQaReport.warnings,
    ...ownerReviewReport.warnings
  ];
  return {
    id: "phase_7_2_package",
    feedbackReviewSimulationReport,
    feedbackToSupportIssueConversionReport,
    supportIssueTriageReport,
    supportIssueToStabilizationConversionReport,
    productStabilizationQueueReport,
    stabilizationSafetyReport,
    stabilizationPlanReport,
    feedbackReviewSimulationQaReport,
    supportWorkflowQaReport,
    stabilizationQueueQaReport,
    safePatchSummary: input.safePatchSummary || [],
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 7.3 - Product Stabilization Pass, Regression QA & Beta Operations Readiness Score",
    manualOnly: true,
    inMemoryOnly: true,
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
    generatedAt: new Date().toISOString()
  };
}

export function getPhase72PackageBlockers(pkg: TeoyubePhase72PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase72PackageWarnings(pkg: TeoyubePhase72PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase72PackageDecision(pkg: TeoyubePhase72PackageModel): TeoyubePhase72PackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending") return "needs_owner_review";
  return pkg.warnings.length ? "phase_7_2_complete_with_warnings" : "phase_7_2_complete";
}

export function validatePhase72Package(pkg: TeoyubePhase72PackageModel): TeoyubePhase72PackageReport {
  return createPhase72PackageReport(pkg);
}

export function createPhase72PackageReport(pkg: TeoyubePhase72PackageModel): TeoyubePhase72PackageReport {
  const blockers = getPhase72PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase72PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase72PackageWarnings(pkg),
    nextActionRecommendation: "Phase 7.3 - Product Stabilization Pass, Regression QA & Beta Operations Readiness Score",
    manualOnly: true,
    inMemoryOnly: true,
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
    generatedAt: new Date().toISOString()
  };
}
