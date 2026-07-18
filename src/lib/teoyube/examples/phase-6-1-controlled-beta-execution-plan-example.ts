import {
  createBetaOperationsChecklistReport,
  createBetaPrivacyConsentBoundaryReport,
  createBetaSafetyTheologyBoundaryReport,
  createBetaServiceDisabledBoundaryReport,
  createControlledBetaExecutionPackage,
  createControlledBetaExecutionPackageReport,
  createControlledBetaExecutionPlan,
  createControlledBetaExecutionReport,
  createControlledBetaIssueIntakePlan,
  createManualBetaCommunicationBoundaryReport,
  createManualFeedbackBoundaryReport,
  createManualParticipantWorkflowReport,
  createPhase61OwnerReviewRecord,
  createPhase61OwnerReviewReport,
  createPhase61Package,
  createPhase61PackageReport,
  runPhase61Audit
} from "../phase-6";

export function runPhase61ControlledBetaExecutionPlanExample() {
  const controlledBetaExecutionPlan = createControlledBetaExecutionPlan();
  const controlledBetaExecutionReport = createControlledBetaExecutionReport(controlledBetaExecutionPlan);
  const manualParticipantWorkflowReport = createManualParticipantWorkflowReport({ ownerReviewed: true });
  const manualCommunicationBoundaryReport = createManualBetaCommunicationBoundaryReport();
  const manualFeedbackBoundaryReport = createManualFeedbackBoundaryReport();
  const controlledBetaIssueIntakePlan = createControlledBetaIssueIntakePlan();
  const betaOperationsChecklistReport = createBetaOperationsChecklistReport();
  const safetyTheologyBoundaryReport = createBetaSafetyTheologyBoundaryReport();
  const privacyConsentBoundaryReport = createBetaPrivacyConsentBoundaryReport();
  const serviceDisabledBoundaryReport = createBetaServiceDisabledBoundaryReport();
  const controlledBetaExecutionPackage = createControlledBetaExecutionPackage({
    participantWorkflowInput: { ownerReviewed: true }
  });
  const controlledBetaExecutionPackageReport = createControlledBetaExecutionPackageReport(controlledBetaExecutionPackage);
  const ownerReviewRecord = createPhase61OwnerReviewRecord({ reviewed: true });
  const ownerReviewReport = createPhase61OwnerReviewReport(ownerReviewRecord);
  const phase61Package = createPhase61Package({
    controlledBetaExecutionPackage,
    ownerReview: ownerReviewRecord
  });
  const phase61PackageReport = createPhase61PackageReport(phase61Package);
  const phase61Audit = runPhase61Audit();

  return {
    controlledBetaExecutionPlan,
    controlledBetaExecutionReport,
    manualParticipantWorkflowReport,
    manualCommunicationBoundaryReport,
    manualFeedbackBoundaryReport,
    controlledBetaIssueIntakePlan,
    betaOperationsChecklistReport,
    safetyTheologyBoundaryReport,
    privacyConsentBoundaryReport,
    serviceDisabledBoundaryReport,
    controlledBetaExecutionPackage,
    controlledBetaExecutionPackageReport,
    ownerReviewRecord,
    ownerReviewReport,
    phase61Package,
    phase61PackageReport,
    phase61Audit
  };
}

