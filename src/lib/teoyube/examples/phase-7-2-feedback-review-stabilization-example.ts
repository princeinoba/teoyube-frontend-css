import {
  addProductStabilizationQueueItems,
  addSimulatedManualFeedbackReviewItem,
  convertManualFeedbackToSupportIssues,
  convertSupportIssuesToStabilizationItems,
  createFeedbackReviewSimulationQaReport,
  createManualFeedbackReviewSimulation,
  createManualFeedbackReviewSimulationReport,
  createPhase72OwnerReviewRecord,
  createPhase72Package,
  createPhase72PackageReport,
  createProductStabilizationPlan,
  createProductStabilizationPlanReport,
  createProductStabilizationQueue,
  createProductStabilizationQueueQaReport,
  createProductStabilizationQueueReport,
  createProductStabilizationSafetyReport,
  createSimulatedManualFeedbackReviewItem,
  createSupportIssueTriageReport,
  createSupportWorkflowQaReport,
  runPhase72Audit
} from "../phase-7";

export function createPhase72FeedbackReviewStabilizationExample() {
  const simulation = createManualFeedbackReviewSimulation();
  const simulatedFeedback = createSimulatedManualFeedbackReviewItem({
    rawText: "The confidence label on mobile is confusing. Contact me at participant@example.com.",
    category: "confidence_label"
  });
  const simulationWithFeedback = addSimulatedManualFeedbackReviewItem(simulation, simulatedFeedback);
  const feedbackReviewSimulationReport = createManualFeedbackReviewSimulationReport(simulationWithFeedback);

  const supportIssues = convertManualFeedbackToSupportIssues(feedbackReviewSimulationReport.simulation.items);
  const supportIssueTriageReport = createSupportIssueTriageReport(supportIssues);

  const stabilizationItems = convertSupportIssuesToStabilizationItems(supportIssueTriageReport.issues);
  const stabilizationQueue = addProductStabilizationQueueItems(createProductStabilizationQueue(), stabilizationItems);
  const productStabilizationQueueReport = createProductStabilizationQueueReport(stabilizationQueue);
  const stabilizationSafetyReport = createProductStabilizationSafetyReport(stabilizationQueue);
  const stabilizationPlan = createProductStabilizationPlan({ queue: stabilizationQueue });
  const stabilizationPlanReport = createProductStabilizationPlanReport(stabilizationPlan);

  const feedbackReviewSimulationQaReport = createFeedbackReviewSimulationQaReport(simulationWithFeedback);
  const supportWorkflowQaReport = createSupportWorkflowQaReport(supportIssueTriageReport.issues);
  const stabilizationQueueQaReport = createProductStabilizationQueueQaReport(stabilizationQueue);

  const ownerReview = createPhase72OwnerReviewRecord({
    reviewed: true,
    notes: ["Phase 7.2 example reviewed as simulation-only, manual-only, and service-disabled."]
  });
  const phase72Package = createPhase72Package({
    feedbackSimulation: simulationWithFeedback,
    supportIssues: supportIssueTriageReport.issues,
    stabilizationQueue,
    ownerReview
  });
  const phase72PackageReport = createPhase72PackageReport(phase72Package);
  const phase72Audit = runPhase72Audit();

  return {
    feedbackReviewSimulationReport,
    supportIssueTriageReport,
    productStabilizationQueueReport,
    stabilizationSafetyReport,
    stabilizationPlanReport,
    feedbackReviewSimulationQaReport,
    supportWorkflowQaReport,
    stabilizationQueueQaReport,
    ownerReview,
    phase72PackageReport,
    phase72Audit,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noExternalServicesRequired: true,
    noBrowserPersistenceRequired: true
  };
}
