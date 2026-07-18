import {
  createConsentPublicCopyReviewReport,
  createControlledServiceDecisionPackage,
  createControlledServiceDecisionPackageReport,
  createPhase83OwnerReviewChecklist,
  createPhase83Package,
  createPhase83PackageReport,
  createPrivacySecurityReviewReport,
  createPublicReleaseBoundaryReport,
  createPublicReleaseKnownLimitationsReport,
  createPublicReleaseReadinessGateReport,
  createPublicReleaseSafetyReadinessReport,
  createPublicReleaseSupportFeedbackReport,
  createSensitiveDataBoundaryReviewReport,
  createServiceDecisionLockValidationReport,
  runPhase81Audit,
  runPhase82Audit,
  runPhase83Audit
} from "../phase-8";
import { runPhase81PostBetaReadinessSmokeCheck } from "./phase-8-1-post-beta-readiness-smoke-check";
import { runPhase82ProductHardeningSmokeCheck } from "./phase-8-2-product-hardening-smoke-check";

export type TeoyubePhase83SmokeCheckResult = {
  id: string;
  passed: boolean;
  notes: string;
};

export type TeoyubePhase83SmokeCheckReport = {
  valid: boolean;
  results: TeoyubePhase83SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  publicReleaseReadinessGateDecision: string;
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function result(id: string, passed: boolean, notes: string): TeoyubePhase83SmokeCheckResult {
  return { id, passed, notes };
}

export function runPhase83PrivacySecurityServiceDecisionSmokeCheck(): TeoyubePhase83SmokeCheckReport {
  const privacySecurityReviewReport = createPrivacySecurityReviewReport({ ownerReviewed: true });
  const unsafeSensitiveDataReport = createSensitiveDataBoundaryReviewReport({ rawSensitiveTextStored: true });
  const sensitiveDataBoundaryReviewReport = createSensitiveDataBoundaryReviewReport();
  const unsafeCopyReport = createConsentPublicCopyReviewReport({ divineCertaintyClaimed: true, professionalAdviceClaimed: true });
  const consentPublicCopyReviewReport = createConsentPublicCopyReviewReport();
  const controlledServiceDecisionPackage = createControlledServiceDecisionPackage();
  const controlledServiceDecisionPackageReport = createControlledServiceDecisionPackageReport(controlledServiceDecisionPackage);
  const serviceDecisionLockValidationReport = createServiceDecisionLockValidationReport();
  const publicReleaseReadinessGateReport = createPublicReleaseReadinessGateReport();
  const unsafeBoundaryReport = createPublicReleaseBoundaryReport({
    publicLaunchFromCode: true,
    automaticUserContact: true,
    automaticFeedbackCollection: true
  });
  const publicReleaseBoundaryReport = createPublicReleaseBoundaryReport();
  const knownLimitationsReport = createPublicReleaseKnownLimitationsReport();
  const supportFeedbackReadinessReport = createPublicReleaseSupportFeedbackReport();
  const safetyReadinessReport = createPublicReleaseSafetyReadinessReport();
  const ownerReviewChecklist = createPhase83OwnerReviewChecklist();
  const phase81Smoke = runPhase81PostBetaReadinessSmokeCheck();
  const phase82Smoke = runPhase82ProductHardeningSmokeCheck();
  const phase81Audit = runPhase81Audit();
  const phase82Audit = runPhase82Audit();
  const phase83Package = createPhase83Package({ ownerReviewed: true });
  const phase83PackageReport = createPhase83PackageReport(phase83Package);
  const phase83Audit = runPhase83Audit();

  const results = [
    result("privacy_security_contracts_compile", privacySecurityReviewReport.checks.length > 0, "Privacy/security contracts are represented by structured checks."),
    result("privacy_security_review_structured", privacySecurityReviewReport.valid && privacySecurityReviewReport.inMemoryOnly, `${privacySecurityReviewReport.checks.length} privacy/security check(s) represented.`),
    result("sensitive_boundary_blocks_storage", !unsafeSensitiveDataReport.valid && unsafeSensitiveDataReport.blockers.length > 0, "Unsafe raw sensitive text storage is blocked."),
    result("sensitive_boundary_safe_default", sensitiveDataBoundaryReviewReport.valid, "Sensitive data boundary passes safe defaults."),
    result("copy_blocks_unsafe_claims", !unsafeCopyReport.valid && unsafeCopyReport.blockers.length > 0, "Divine-certainty and professional-advice copy claims are blocked."),
    result("copy_safe_default", consentPublicCopyReviewReport.valid, "Consent/public copy passes safe defaults."),
    result("service_package_no_services", controlledServiceDecisionPackageReport.valid && controlledServiceDecisionPackageReport.noServiceConnected, "Controlled service package connects no services."),
    result("service_locks_disabled", serviceDecisionLockValidationReport.valid && serviceDecisionLockValidationReport.noServicesEnabled, "Service decision locks keep services disabled."),
    result("release_readiness_gate_structured", publicReleaseReadinessGateReport.valid && publicReleaseReadinessGateReport.inMemoryOnly, `Readiness gate decision: ${publicReleaseReadinessGateReport.decision}.`),
    result("boundary_blocks_launch_contact_feedback", !unsafeBoundaryReport.valid && unsafeBoundaryReport.blockers.length >= 3, "Boundary validator blocks launch, contact, and feedback collection."),
    result("boundary_safe_default", publicReleaseBoundaryReport.valid, "Public release boundaries pass safe defaults."),
    result("known_limitations_generated", knownLimitationsReport.valid && knownLimitationsReport.limitations.length >= 10, `${knownLimitationsReport.limitations.length} known limitation(s) generated.`),
    result("support_feedback_manual", supportFeedbackReadinessReport.valid && supportFeedbackReadinessReport.supportRemainsManual && supportFeedbackReadinessReport.feedbackRemainsManual, "Support and feedback readiness remain manual."),
    result("safety_readiness_preserved", safetyReadinessReport.valid && safetyReadinessReport.preservesScriptureAnchors && safetyReadinessReport.preservesExplanationTraces && safetyReadinessReport.preservesFallbackSafety && safetyReadinessReport.preservesConfidenceLabels, "Safety readiness preserves Scripture, explanation, fallback, and confidence."),
    result("owner_review_checklist_exists", ownerReviewChecklist.length >= 10, `${ownerReviewChecklist.length} owner review item(s) represented.`),
    result("phase_8_1_smoke_valid", phase81Smoke.valid, "Phase 8.1 smoke check remains valid."),
    result("phase_8_2_smoke_valid", phase82Smoke.valid, "Phase 8.2 smoke check remains valid."),
    result("phase_8_1_audit_complete", phase81Audit.complete && phase81Audit.completionPercentage === 100, "Phase 8.1 audit remains complete."),
    result("phase_8_2_audit_complete", phase82Audit.complete && phase82Audit.completionPercentage === 100, "Phase 8.2 audit remains complete."),
    result("phase_8_3_package_in_memory", phase83PackageReport.valid && phase83PackageReport.inMemoryOnly, `Phase 8.3 package decision: ${phase83PackageReport.decision}.`),
    result("phase_8_3_audit_complete", phase83Audit.complete && phase83Audit.completionPercentage === 100, `Phase 8.3 audit completion: ${phase83Audit.completionPercentage}%.`),
    result("no_public_launch", phase83Audit.noPublicLaunchPerformed && phase83Package.noPublicLaunchPerformed, "No public launch is performed."),
    result("no_beta_launch", phase83Audit.noBetaLaunchPerformed && phase83Package.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase83Audit.noUsersContacted && phase83Package.noUsersContacted, "No users are contacted."),
    result("no_feedback_auto_collection", phase83Audit.noFeedbackCollectedAutomatically && phase83Package.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_url_fetching", phase83Audit.noPublicUrlsFetchedAutomatically && phase83Package.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase83Audit.noDatabasePersistenceEnabled && phase83Package.noDatabasePersistenceEnabled, "Database persistence remains disabled."),
    result("no_analytics", phase83Audit.noAnalyticsEnabled && phase83Package.noAnalyticsEnabled, "Analytics remain disabled."),
    result("no_monitoring_provider", phase83Audit.noMonitoringProviderConnected && phase83Package.noMonitoringProviderConnected, "No production monitoring provider is connected."),
    result("no_live_ai", phase83Audit.noLiveAiOrchestrationEnabled && phase83Package.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    result("no_admin_auth_or_cms", phase83Audit.noAdminAuthAdded && phase83Audit.noCmsConnected && phase83Package.noAdminAuthAdded && phase83Package.noCmsConnected, "Admin auth and CMS remain disabled."),
    result("no_external_services", phase83Audit.noExternalServicesRequired && phase83Package.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase83Audit.noBrowserPersistenceRequired && phase83Package.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = results.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.notes}`);

  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings: [
      "Phase 8.3 is privacy/security, service-decision, and readiness-gate planning only; it does not launch, contact users, collect feedback automatically, fetch public URLs automatically, or connect services.",
      ...phase83PackageReport.warnings
    ],
    publicReleaseReadinessGateDecision: phase83PackageReport.publicReleaseReadinessGateDecision,
    noPublicLaunchPerformed: true,
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
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
