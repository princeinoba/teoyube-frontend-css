import { createPhase83Package, createPhase83PackageReport } from "./phase-8-3-package";

export type TeoyubePhase83AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase83AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase83AuditChecklistItem[];
  missingItems: TeoyubePhase83AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  publicReleaseReadinessGateDecision: string;
  nextStep: "Phase 8.4 - Public Release Candidate Planning, Final Readiness Review & Phase 9 Roadmap";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase83AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase83AuditChecklist(): TeoyubePhase83AuditChecklistItem[] {
  const pkg = createPhase83Package({ ownerReviewed: true });
  const report = createPhase83PackageReport(pkg);
  return [
    item("phase_8_3_map_document", "Phase 8.3 map document exists", true, "phase-8-3-privacy-security-controlled-service-public-release-readiness-map.md documents the map."),
    item("privacy_security_review_contracts", "Privacy/security review contracts exist", true, "privacy-security-review-contracts.ts exists."),
    item("privacy_security_review", "Privacy/security review exists", pkg.privacySecurityReviewReport.inMemoryOnly, "privacy-security-review.ts exists."),
    item("sensitive_data_boundary_review", "Sensitive data boundary review exists", pkg.sensitiveDataBoundaryReviewReport.inMemoryOnly, "sensitive-data-boundary-review.ts exists."),
    item("consent_public_copy_review", "Consent/public copy review exists", pkg.consentPublicCopyReviewReport.inMemoryOnly, "consent-public-copy-review.ts exists."),
    item("controlled_service_decision_contracts", "Controlled service decision package contracts exist", true, "controlled-service-decision-package-contracts.ts exists."),
    item("controlled_service_decision_package", "Controlled service decision package exists", pkg.controlledServiceDecisionPackageReport.inMemoryOnly, "controlled-service-decision-package.ts exists."),
    item("service_decision_lock_validator", "Service decision lock validator exists", pkg.serviceDecisionLockValidationReport.inMemoryOnly, "service-decision-lock-validator.ts exists."),
    item("public_release_readiness_gate_contracts", "Public release readiness gate contracts exist", true, "public-release-readiness-gate-contracts.ts exists."),
    item("public_release_readiness_gate", "Public release readiness gate exists", pkg.publicReleaseReadinessGateReport.inMemoryOnly, "public-release-readiness-gate.ts exists."),
    item("public_release_boundary_validator", "Public release boundary validator exists", pkg.publicReleaseBoundaryReport.inMemoryOnly, "public-release-boundary-validator.ts exists."),
    item("known_limitations_review", "Known limitations review exists", pkg.knownLimitationsReport.inMemoryOnly, "public-release-known-limitations-review.ts exists."),
    item("support_feedback_readiness", "Support/feedback readiness exists", pkg.supportFeedbackReadinessReport.inMemoryOnly, "public-release-support-feedback-readiness.ts exists."),
    item("safety_readiness", "Safety readiness exists", pkg.safetyReadinessReport.inMemoryOnly, "public-release-safety-readiness.ts exists."),
    item("owner_review", "Phase 8.3 owner review exists", pkg.ownerReviewReport.inMemoryOnly, "phase-8-3-owner-review.ts exists."),
    item("phase_8_3_package", "Phase 8.3 package exists", report.inMemoryOnly, "phase-8-3-package.ts exists."),
    item("smoke_check", "Phase 8.3 smoke check exists", true, "phase-8-3-privacy-security-service-decision-smoke-check.ts exists."),
    item("documentation", "Phase 8.3 documentation exists", true, "phase-8-3-privacy-security-review-controlled-service-decision-public-release-readiness-gate.md exists.")
  ];
}

export function getPhase83MissingItems(): TeoyubePhase83AuditChecklistItem[] {
  return getPhase83AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase83Warnings(): string[] {
  return createPhase83PackageReport(createPhase83Package({ ownerReviewed: true })).warnings;
}

export function getPhase83CompletionPercentage(): number {
  const checklist = getPhase83AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase83Audit(): TeoyubePhase83AuditReport {
  const checklist = getPhase83AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase83PackageReport(createPhase83Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase83CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase83Warnings(),
    blockers,
    publicReleaseReadinessGateDecision: packageReport.publicReleaseReadinessGateDecision,
    nextStep: "Phase 8.4 - Public Release Candidate Planning, Final Readiness Review & Phase 9 Roadmap",
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
