import {
  addManualBetaFeedbackItem,
  convertBetaSupportRequestsToIssues,
  createBetaOperationsKnownLimitationsReport,
  createBetaOperationsPackage,
  createBetaOperationsPackageReport,
  createBetaOperationsPauseRollbackReviewReport,
  createBetaSupportRequest,
  createBetaSupportToIssueConversionReport,
  createBetaSupportWorkflowReport,
  createControlledBetaOperationsRunbook,
  createControlledBetaOperationsRunbookReport,
  createManualBetaFeedbackItem,
  createManualBetaFeedbackReview,
  createManualBetaFeedbackReviewReport,
  createManualOperationalMonitoringReport,
  createPassingManualOperationalMonitoringRun,
  createPhase71OwnerReviewRecord,
  createPhase71OwnerReviewReport,
  createPhase71Package,
  createPhase71PackageReport,
  runPhase71Audit
} from "../phase-7";

export function runPhase71ControlledBetaOperationsExample() {
  const operationsRunbook = createControlledBetaOperationsRunbook({ ownerApproved: true });
  const operationsRunbookReport = createControlledBetaOperationsRunbookReport({ ownerApproved: true });

  const feedbackReview = createManualBetaFeedbackReview();
  const manualFeedback = createManualBetaFeedbackItem({
    rawText: "The confidence label helped, but the explanation could be clearer. Contact me at example@example.com.",
    category: "confidence_label",
    severity: "medium"
  });
  const feedbackReviewWithItem = addManualBetaFeedbackItem(feedbackReview, manualFeedback);
  const manualFeedbackReviewReport = createManualBetaFeedbackReviewReport(feedbackReviewWithItem);

  const supportRequest = createBetaSupportRequest({
    rawText: "I am confused by the confidence label on the TIG response panel.",
    category: "confidence_label_confusion"
  });
  const supportWorkflowReport = createBetaSupportWorkflowReport([supportRequest]);
  const supportIssues = convertBetaSupportRequestsToIssues([supportRequest]);
  const supportToIssueConversionReport = createBetaSupportToIssueConversionReport([supportRequest]);

  const monitoringRun = createPassingManualOperationalMonitoringRun();
  const monitoringReport = createManualOperationalMonitoringReport(monitoringRun);
  const pauseRollbackReviewReport = createBetaOperationsPauseRollbackReviewReport({
    confidenceLabelsMissing: false,
    fallbackUnsafe: false
  });
  const knownLimitationsReport = createBetaOperationsKnownLimitationsReport();

  const betaOperationsPackage = createBetaOperationsPackage({
    ownerApproved: true,
    feedbackReview: feedbackReviewWithItem,
    supportRequests: [],
    monitoringRun
  });
  const betaOperationsPackageReport = createBetaOperationsPackageReport(betaOperationsPackage);
  const ownerReviewRecord = createPhase71OwnerReviewRecord({ reviewed: true });
  const ownerReviewReport = createPhase71OwnerReviewReport(ownerReviewRecord);
  const phase71Package = createPhase71Package({
    betaOperationsPackage,
    ownerReview: ownerReviewRecord
  });
  const phase71PackageReport = createPhase71PackageReport(phase71Package);
  const phase71Audit = runPhase71Audit();

  return {
    operationsRunbook,
    operationsRunbookReport,
    feedbackReview,
    manualFeedback,
    feedbackReviewWithItem,
    manualFeedbackReviewReport,
    supportRequest,
    supportWorkflowReport,
    supportIssues,
    supportToIssueConversionReport,
    monitoringRun,
    monitoringReport,
    pauseRollbackReviewReport,
    knownLimitationsReport,
    betaOperationsPackage,
    betaOperationsPackageReport,
    ownerReviewRecord,
    ownerReviewReport,
    phase71Package,
    phase71PackageReport,
    phase71Audit
  };
}
