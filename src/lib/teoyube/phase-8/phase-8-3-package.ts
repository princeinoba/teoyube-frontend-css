import { createConsentPublicCopyReviewReport } from "./consent-public-copy-review";
import { createControlledServiceDecisionPackage, createControlledServiceDecisionPackageReport } from "./controlled-service-decision-package";
import { createPhase83OwnerReviewRecord, createPhase83OwnerReviewReport, type TeoyubePhase83OwnerReviewRecord } from "./phase-8-3-owner-review";
import { createPrivacySecurityReviewReport } from "./privacy-security-review";
import { createPublicReleaseBoundaryReport } from "./public-release-boundary-validator";
import { createPublicReleaseKnownLimitationsReport } from "./public-release-known-limitations-review";
import { createPublicReleaseReadinessGateReport } from "./public-release-readiness-gate";
import { createPublicReleaseSafetyReadinessReport } from "./public-release-safety-readiness";
import { createPublicReleaseSupportFeedbackReport } from "./public-release-support-feedback-readiness";
import { createSensitiveDataBoundaryReviewReport } from "./sensitive-data-boundary-review";
import { createServiceDecisionLockValidationReport } from "./service-decision-lock-validator";

export type TeoyubePhase83PackageDecision =
  | "phase_8_3_complete"
  | "phase_8_3_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase83PackageModel = {
  id: string;
  privacySecurityReviewReport: ReturnType<typeof createPrivacySecurityReviewReport>;
  sensitiveDataBoundaryReviewReport: ReturnType<typeof createSensitiveDataBoundaryReviewReport>;
  consentPublicCopyReviewReport: ReturnType<typeof createConsentPublicCopyReviewReport>;
  controlledServiceDecisionPackageReport: ReturnType<typeof createControlledServiceDecisionPackageReport>;
  serviceDecisionLockValidationReport: ReturnType<typeof createServiceDecisionLockValidationReport>;
  publicReleaseReadinessGateReport: ReturnType<typeof createPublicReleaseReadinessGateReport>;
  publicReleaseBoundaryReport: ReturnType<typeof createPublicReleaseBoundaryReport>;
  knownLimitationsReport: ReturnType<typeof createPublicReleaseKnownLimitationsReport>;
  supportFeedbackReadinessReport: ReturnType<typeof createPublicReleaseSupportFeedbackReport>;
  safetyReadinessReport: ReturnType<typeof createPublicReleaseSafetyReadinessReport>;
  ownerReview: TeoyubePhase83OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase83OwnerReviewReport>;
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 8.4 - Public Release Candidate Planning, Final Readiness Review & Phase 9 Roadmap";
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

export type TeoyubePhase83PackageReport = {
  valid: boolean;
  decision: TeoyubePhase83PackageDecision;
  package: TeoyubePhase83PackageModel;
  blockers: string[];
  warnings: string[];
  publicReleaseReadinessGateDecision: ReturnType<typeof createPublicReleaseReadinessGateReport>["decision"];
  nextActionRecommendation: "Phase 8.4 - Public Release Candidate Planning, Final Readiness Review & Phase 9 Roadmap";
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function collect(entries: Array<string | { message?: string; details?: string }>): string[] {
  return entries.map((entry) => typeof entry === "string" ? entry : entry.message || entry.details || "Phase 8.3 package item needs attention.");
}

export function createPhase83Package(input: {
  ownerReview?: TeoyubePhase83OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase83PackageModel {
  const privacySecurityReviewReport = createPrivacySecurityReviewReport({ ownerReviewed: input.ownerReviewed ?? false });
  const sensitiveDataBoundaryReviewReport = createSensitiveDataBoundaryReviewReport();
  const consentPublicCopyReviewReport = createConsentPublicCopyReviewReport();
  const controlledServiceDecisionPackageReport = createControlledServiceDecisionPackageReport(createControlledServiceDecisionPackage());
  const serviceDecisionLockValidationReport = createServiceDecisionLockValidationReport();
  const publicReleaseReadinessGateReport = createPublicReleaseReadinessGateReport();
  const publicReleaseBoundaryReport = createPublicReleaseBoundaryReport();
  const knownLimitationsReport = createPublicReleaseKnownLimitationsReport();
  const supportFeedbackReadinessReport = createPublicReleaseSupportFeedbackReport();
  const safetyReadinessReport = createPublicReleaseSafetyReadinessReport();
  const ownerReview = input.ownerReview || createPhase83OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });
  const ownerReviewReport = createPhase83OwnerReviewReport(ownerReview);
  const blockers = [
    ...collect(privacySecurityReviewReport.blockers),
    ...sensitiveDataBoundaryReviewReport.blockers,
    ...consentPublicCopyReviewReport.blockers,
    ...collect(controlledServiceDecisionPackageReport.blockers),
    ...serviceDecisionLockValidationReport.blockers,
    ...collect(publicReleaseReadinessGateReport.blockers),
    ...publicReleaseBoundaryReport.blockers,
    ...knownLimitationsReport.blockers,
    ...supportFeedbackReadinessReport.blockers,
    ...safetyReadinessReport.blockers,
    ...ownerReviewReport.blockers
  ];
  const warnings = [
    ...collect(privacySecurityReviewReport.warnings),
    ...sensitiveDataBoundaryReviewReport.warnings,
    ...consentPublicCopyReviewReport.warnings,
    ...collect(controlledServiceDecisionPackageReport.warnings),
    ...serviceDecisionLockValidationReport.warnings,
    ...collect(publicReleaseReadinessGateReport.warnings),
    ...publicReleaseBoundaryReport.warnings,
    ...knownLimitationsReport.warnings,
    ...supportFeedbackReadinessReport.warnings,
    ...safetyReadinessReport.warnings,
    ...ownerReviewReport.warnings
  ];

  return {
    id: "phase_8_3_package",
    privacySecurityReviewReport,
    sensitiveDataBoundaryReviewReport,
    consentPublicCopyReviewReport,
    controlledServiceDecisionPackageReport,
    serviceDecisionLockValidationReport,
    publicReleaseReadinessGateReport,
    publicReleaseBoundaryReport,
    knownLimitationsReport,
    supportFeedbackReadinessReport,
    safetyReadinessReport,
    ownerReview,
    ownerReviewReport,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 8.4 - Public Release Candidate Planning, Final Readiness Review & Phase 9 Roadmap",
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

export function getPhase83PackageBlockers(pkg: TeoyubePhase83PackageModel): string[] {
  return pkg.blockers;
}

export function getPhase83PackageWarnings(pkg: TeoyubePhase83PackageModel): string[] {
  return pkg.warnings;
}

export function createPhase83PackageDecision(pkg: TeoyubePhase83PackageModel): TeoyubePhase83PackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.ownerReviewReport.decision === "owner_review_pending" || pkg.privacySecurityReviewReport.decision === "needs_owner_review") return "needs_owner_review";
  return pkg.warnings.length ? "phase_8_3_complete_with_warnings" : "phase_8_3_complete";
}

export function validatePhase83Package(pkg: TeoyubePhase83PackageModel): TeoyubePhase83PackageReport {
  return createPhase83PackageReport(pkg);
}

export function createPhase83PackageReport(pkg: TeoyubePhase83PackageModel): TeoyubePhase83PackageReport {
  const blockers = getPhase83PackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createPhase83PackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getPhase83PackageWarnings(pkg),
    publicReleaseReadinessGateDecision: pkg.publicReleaseReadinessGateReport.decision,
    nextActionRecommendation: "Phase 8.4 - Public Release Candidate Planning, Final Readiness Review & Phase 9 Roadmap",
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
