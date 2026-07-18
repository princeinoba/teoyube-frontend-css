import {
  createBetaFeedbackReadinessReport,
  createBetaIssueIntakePlanReport,
  createBetaOperationalReadinessReport,
  createControlledBetaPreparationReport,
  createControlledBetaScope,
  createManualBetaQaExecutionPlan,
  createManualBetaQaExecutionPlanReport,
  createPhase51OwnerReviewRecord,
  createPhase51Package,
  createPhase51PackageReport,
  createPrivacySecurityReadinessReport,
  createServiceGateReviewReport,
  runPhase51Audit
} from "../phase-5";

export function runPhase51ControlledBetaPreparationExample() {
  const controlledBetaScope = createControlledBetaScope();
  const controlledBetaPreparation = createControlledBetaPreparationReport({ scope: controlledBetaScope });
  const manualBetaQaExecutionPlan = createManualBetaQaExecutionPlan();
  const manualBetaQaExecutionPlanReport = createManualBetaQaExecutionPlanReport(manualBetaQaExecutionPlan);
  const serviceGateReview = createServiceGateReviewReport();
  const privacySecurityReadiness = createPrivacySecurityReadinessReport();
  const betaIssueIntakePlan = createBetaIssueIntakePlanReport();
  const betaFeedbackReadinessPlan = createBetaFeedbackReadinessReport();
  const betaOperationalReadiness = createBetaOperationalReadinessReport();
  const ownerReview = createPhase51OwnerReviewRecord();
  const phase51Package = createPhase51Package({ ownerReview });
  const phase51PackageReport = createPhase51PackageReport(phase51Package);
  const phase51Audit = runPhase51Audit();

  return {
    controlledBetaScope,
    controlledBetaPreparation,
    manualBetaQaExecutionPlan,
    manualBetaQaExecutionPlanReport,
    serviceGateReview,
    privacySecurityReadiness,
    betaIssueIntakePlan,
    betaFeedbackReadinessPlan,
    betaOperationalReadiness,
    ownerReview,
    phase51Package,
    phase51PackageReport,
    phase51Audit
  };
}
