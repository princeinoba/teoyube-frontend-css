import {
  createControlledPublicReleaseExecutionPlan,
  createControlledPublicReleaseExecutionPlanReport,
  createControlledPublicSupportFeedbackBoundaryReport,
  createManualLaunchChecklist,
  createManualPublicMonitoringBoundaryReport,
  createPauseRollbackExecutionReadinessReport,
  createPhase101OwnerReviewRecord,
  createPhase101OwnerReviewReport,
  createPhase101Package,
  createPhase101PackageReport,
  createPublicIssueTriageExecutionReport,
  createPublicReleaseSafetyExecutionConfirmationReport,
  createRealAppVerificationPreparationReport,
  createServiceDisabledExecutionConfirmationReport,
  runPhase101Audit
} from "../phase-10";

export function createPhase101ControlledPublicReleaseExecutionExample() {
  const executionPlan = createControlledPublicReleaseExecutionPlan();
  const executionReport = createControlledPublicReleaseExecutionPlanReport();
  const manualLaunchChecklist = createManualLaunchChecklist();
  const monitoringBoundaries = createManualPublicMonitoringBoundaryReport();
  const supportFeedbackBoundaries = createControlledPublicSupportFeedbackBoundaryReport();
  const issueTriage = createPublicIssueTriageExecutionReport();
  const pauseRollback = createPauseRollbackExecutionReadinessReport();
  const serviceDisabled = createServiceDisabledExecutionConfirmationReport();
  const safety = createPublicReleaseSafetyExecutionConfirmationReport();
  const realAppVerification = createRealAppVerificationPreparationReport();
  const ownerReviewRecord = createPhase101OwnerReviewRecord({
    reviewed: true,
    notes: ["Example owner review accepts Phase 10.2 as the next real app verification step."]
  });
  const ownerReview = createPhase101OwnerReviewReport(ownerReviewRecord);
  const phase101Package = createPhase101Package({ ownerReview: ownerReviewRecord });
  return {
    executionPlan,
    executionReport,
    manualLaunchChecklist,
    monitoringBoundaries,
    supportFeedbackBoundaries,
    issueTriage,
    pauseRollback,
    serviceDisabled,
    safety,
    realAppVerification,
    ownerReview,
    packageReport: createPhase101PackageReport(phase101Package),
    audit: runPhase101Audit()
  };
}
