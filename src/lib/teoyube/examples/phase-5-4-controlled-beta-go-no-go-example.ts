import {
  createBetaLaunchBoundaryReport,
  createBetaOperationalHandoff,
  createBetaReadinessEvidenceSummary,
  createControlledBetaGoNoGoChecklist,
  createControlledBetaGoNoGoReport,
  createControlledBetaKnownLimitationsReport,
  createControlledBetaOwnerApprovalRecord,
  createControlledBetaOwnerApprovalReport,
  createControlledBetaPauseRollbackReport,
  createControlledBetaReadinessPackage,
  createControlledBetaReadinessPackageReport,
  createPhase54OwnerReviewRecord,
  createPhase54Package,
  createPhase54PackageReport,
  runPhase54Audit
} from "../phase-5";

export function createPhase54ControlledBetaGoNoGoExample() {
  const goNoGoChecklist = createControlledBetaGoNoGoChecklist();
  const goNoGoReport = createControlledBetaGoNoGoReport();
  const evidenceSummary = createBetaReadinessEvidenceSummary();
  const launchBoundaryReport = createBetaLaunchBoundaryReport();
  const ownerApprovalRecord = createControlledBetaOwnerApprovalRecord();
  const ownerApprovalReport = createControlledBetaOwnerApprovalReport(ownerApprovalRecord);
  const operationalHandoff = createBetaOperationalHandoff({ ownerApprovalRecord });
  const pauseRollbackReport = createControlledBetaPauseRollbackReport();
  const knownLimitationsReport = createControlledBetaKnownLimitationsReport();
  const readinessPackage = createControlledBetaReadinessPackage({ ownerApprovalRecord });
  const readinessPackageReport = createControlledBetaReadinessPackageReport(readinessPackage);
  const ownerReview = createPhase54OwnerReviewRecord();
  const phase54Package = createPhase54Package({ controlledBetaReadinessPackage: readinessPackage, ownerReview });
  const phase54PackageReport = createPhase54PackageReport(phase54Package);
  const audit = runPhase54Audit();

  return {
    goNoGoChecklist,
    goNoGoReport,
    evidenceSummary,
    launchBoundaryReport,
    ownerApprovalRecord,
    ownerApprovalReport,
    operationalHandoff,
    pauseRollbackReport,
    knownLimitationsReport,
    readinessPackage,
    readinessPackageReport,
    ownerReview,
    phase54Package,
    phase54PackageReport,
    audit,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true
  };
}
