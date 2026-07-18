import {
  createControlledPublicGoNoGoReport,
  createFinalPublicKnownLimitationsReport,
  createFinalPublicOwnerApprovalRecord,
  createFinalPublicOwnerApprovalReport,
  createPhase94OwnerReviewRecord,
  createPhase94OwnerReviewReport,
  createPhase94Package,
  createPhase94PackageReport,
  createPublicGoNoGoReadinessPackage,
  createPublicGoNoGoReadinessPackageReport,
  createPublicOperationalHandoff,
  createPublicOperationalHandoffReport,
  createPublicReadinessEvidenceReport,
  createPublicReleaseBoundaryFinalReport,
  createPublicReleasePauseRollbackReport,
  createPublicServiceDisabledFinalConfirmationReport,
  runPhase94Audit
} from "../phase-9";

export function runPhase94ControlledPublicGoNoGoExample() {
  const controlledPublicGoNoGoReport = createControlledPublicGoNoGoReport({ finalOwnerApproved: true });
  const publicReadinessEvidenceReport = createPublicReadinessEvidenceReport();
  const publicReleaseBoundaryFinalReport = createPublicReleaseBoundaryFinalReport();
  const finalPublicOwnerApprovalRecord = createFinalPublicOwnerApprovalRecord({
    reviewed: true,
    nextPhaseAccepted: true,
    notes: ["Owner approval is structured, manual, and does not launch publicly."]
  });
  const finalPublicOwnerApprovalReport = createFinalPublicOwnerApprovalReport(finalPublicOwnerApprovalRecord);
  const publicOperationalHandoff = createPublicOperationalHandoff();
  const publicOperationalHandoffReport = createPublicOperationalHandoffReport();
  const pauseRollbackCriteriaReport = createPublicReleasePauseRollbackReport();
  const finalKnownLimitationsReport = createFinalPublicKnownLimitationsReport();
  const serviceDisabledFinalConfirmationReport = createPublicServiceDisabledFinalConfirmationReport();
  const publicGoNoGoReadinessPackage = createPublicGoNoGoReadinessPackage({ ownerReviewed: true });
  const publicGoNoGoReadinessPackageReport = createPublicGoNoGoReadinessPackageReport(publicGoNoGoReadinessPackage);
  const phase94OwnerReviewRecord = createPhase94OwnerReviewRecord({
    reviewed: true,
    nextPhaseAccepted: true,
    notes: ["Phase 9.4 owner review accepts Phase 9.5 completion review only."]
  });
  const phase94OwnerReviewReport = createPhase94OwnerReviewReport(phase94OwnerReviewRecord);
  const phase94Package = createPhase94Package({
    ownerReviewed: true,
    publicGoNoGoReadinessPackage,
    ownerReview: phase94OwnerReviewRecord
  });
  const phase94PackageReport = createPhase94PackageReport(phase94Package);
  const phase94Audit = runPhase94Audit();

  return {
    controlledPublicGoNoGoReport,
    publicReadinessEvidenceReport,
    publicReleaseBoundaryFinalReport,
    finalPublicOwnerApprovalReport,
    publicOperationalHandoff,
    publicOperationalHandoffReport,
    pauseRollbackCriteriaReport,
    finalKnownLimitationsReport,
    serviceDisabledFinalConfirmationReport,
    publicGoNoGoReadinessPackageReport,
    phase94OwnerReviewReport,
    phase94PackageReport,
    phase94Audit,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}
