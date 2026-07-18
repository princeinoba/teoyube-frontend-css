import { createControlledPublicReleasePreparationReport } from "./controlled-public-release-preparation";
import { createFinalOwnerApprovalGateRecord, createFinalOwnerApprovalGateReport } from "./final-owner-approval-gate";
import { createFinalPublicCopyReviewReport } from "./final-public-copy-review";
import { createFinalPublicReleaseKnownLimitationsReport } from "./public-release-known-limitations-final-review";
import { createPublicReleaseOperationalReadinessReport } from "./public-release-operational-readiness";
import { createPublicReleasePrivacySecurityConfirmationReport } from "./public-release-privacy-security-confirmation";
import { createPublicReleaseSafetyConfirmationReport } from "./public-release-safety-confirmation";
import { createPublicReleaseServiceLockConfirmationReport } from "./public-release-service-lock-confirmation";
import { createSupportFeedbackPublicReadinessReport } from "./support-feedback-public-readiness";

export type TeoyubePublicReleasePreparationPackageDecision =
  | "ready_for_phase_9_2"
  | "ready_with_warnings"
  | "blocked"
  | "needs_owner_approval";

export type TeoyubePublicReleasePreparationPackageModel = {
  id: string;
  controlledPublicReleasePreparationReport: ReturnType<typeof createControlledPublicReleasePreparationReport>;
  finalPublicCopyReviewReport: ReturnType<typeof createFinalPublicCopyReviewReport>;
  knownLimitationsFinalReviewReport: ReturnType<typeof createFinalPublicReleaseKnownLimitationsReport>;
  serviceLockConfirmationReport: ReturnType<typeof createPublicReleaseServiceLockConfirmationReport>;
  privacySecurityConfirmationReport: ReturnType<typeof createPublicReleasePrivacySecurityConfirmationReport>;
  safetyConfirmationReport: ReturnType<typeof createPublicReleaseSafetyConfirmationReport>;
  supportFeedbackReadinessReport: ReturnType<typeof createSupportFeedbackPublicReadinessReport>;
  operationalReadinessReport: ReturnType<typeof createPublicReleaseOperationalReadinessReport>;
  finalOwnerApprovalGateReport: ReturnType<typeof createFinalOwnerApprovalGateReport>;
  nextActionRecommendation: "Phase 9.2 - Public Release Candidate QA, Manual Monitoring Plan & Support Readiness";
  blockers: string[];
  warnings: string[];
  noExternalSend: true;
  noPublicLaunchPerformed: true;
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

export type TeoyubePublicReleasePreparationPackageReport = {
  valid: boolean;
  decision: TeoyubePublicReleasePreparationPackageDecision;
  package: TeoyubePublicReleasePreparationPackageModel;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 9.2 - Public Release Candidate QA, Manual Monitoring Plan & Support Readiness";
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function collect(entries: Array<string | { message?: string; details?: string }>): string[] {
  return entries.map((entry) => typeof entry === "string" ? entry : entry.message || entry.details || "Public release preparation item needs attention.");
}

export function createPublicReleasePreparationPackage(input: { ownerReviewed?: boolean } = {}): TeoyubePublicReleasePreparationPackageModel {
  const ownerReviewed = input.ownerReviewed ?? true;
  const controlledPublicReleasePreparationReport = createControlledPublicReleasePreparationReport({ ownerApprovalRequired: true, publicCopyReviewRequired: true });
  const finalPublicCopyReviewReport = createFinalPublicCopyReviewReport();
  const knownLimitationsFinalReviewReport = createFinalPublicReleaseKnownLimitationsReport();
  const serviceLockConfirmationReport = createPublicReleaseServiceLockConfirmationReport();
  const privacySecurityConfirmationReport = createPublicReleasePrivacySecurityConfirmationReport();
  const safetyConfirmationReport = createPublicReleaseSafetyConfirmationReport();
  const supportFeedbackReadinessReport = createSupportFeedbackPublicReadinessReport();
  const operationalReadinessReport = createPublicReleaseOperationalReadinessReport({ ownerReviewPathExists: true });
  const finalOwnerApprovalGateReport = createFinalOwnerApprovalGateReport(createFinalOwnerApprovalGateRecord({ reviewed: ownerReviewed, nextPhaseAccepted: ownerReviewed }));
  const blockers = [
    ...collect(controlledPublicReleasePreparationReport.blockers),
    ...collect(finalPublicCopyReviewReport.blockers),
    ...knownLimitationsFinalReviewReport.blockers,
    ...serviceLockConfirmationReport.blockers,
    ...privacySecurityConfirmationReport.blockers,
    ...safetyConfirmationReport.blockers,
    ...supportFeedbackReadinessReport.blockers,
    ...operationalReadinessReport.blockers,
    ...collect(finalOwnerApprovalGateReport.blockers)
  ];
  const warnings = [
    ...collect(controlledPublicReleasePreparationReport.warnings),
    ...collect(finalPublicCopyReviewReport.warnings),
    ...knownLimitationsFinalReviewReport.warnings,
    ...serviceLockConfirmationReport.warnings,
    ...privacySecurityConfirmationReport.warnings,
    ...safetyConfirmationReport.warnings,
    ...supportFeedbackReadinessReport.warnings,
    ...operationalReadinessReport.warnings,
    ...collect(finalOwnerApprovalGateReport.warnings)
  ];
  return {
    id: "phase_9_1_public_release_preparation_package",
    controlledPublicReleasePreparationReport,
    finalPublicCopyReviewReport,
    knownLimitationsFinalReviewReport,
    serviceLockConfirmationReport,
    privacySecurityConfirmationReport,
    safetyConfirmationReport,
    supportFeedbackReadinessReport,
    operationalReadinessReport,
    finalOwnerApprovalGateReport,
    nextActionRecommendation: "Phase 9.2 - Public Release Candidate QA, Manual Monitoring Plan & Support Readiness",
    blockers,
    warnings,
    noExternalSend: true,
    noPublicLaunchPerformed: true,
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

export function getPublicReleasePreparationPackageBlockers(pkg: TeoyubePublicReleasePreparationPackageModel): string[] {
  return pkg.blockers;
}

export function getPublicReleasePreparationPackageWarnings(pkg: TeoyubePublicReleasePreparationPackageModel): string[] {
  return pkg.warnings;
}

export function createPublicReleasePreparationPackageDecision(pkg: TeoyubePublicReleasePreparationPackageModel): TeoyubePublicReleasePreparationPackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.finalOwnerApprovalGateReport.decision === "not_approved") return "needs_owner_approval";
  return pkg.warnings.length ? "ready_with_warnings" : "ready_for_phase_9_2";
}

export function validatePublicReleasePreparationPackage(pkg: TeoyubePublicReleasePreparationPackageModel): TeoyubePublicReleasePreparationPackageReport {
  return createPublicReleasePreparationPackageReport(pkg);
}

export function createPublicReleasePreparationPackageReport(pkg: TeoyubePublicReleasePreparationPackageModel): TeoyubePublicReleasePreparationPackageReport {
  const blockers = getPublicReleasePreparationPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPublicReleasePreparationPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPublicReleasePreparationPackageWarnings(pkg),
    nextActionRecommendation: "Phase 9.2 - Public Release Candidate QA, Manual Monitoring Plan & Support Readiness",
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
