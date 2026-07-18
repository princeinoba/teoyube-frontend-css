import { runPhase84Audit } from "../phase-8";
import { runPhase84PublicReleaseCandidateSmokeCheck } from "./phase-8-4-public-release-candidate-smoke-check";
import {
  createControlledPublicReleasePreparationReport,
  createFinalOwnerApprovalGateChecklist,
  createFinalPublicCopyReviewReport,
  createFinalPublicReleaseKnownLimitationsReport,
  createPhase91Package,
  createPhase91PackageReport,
  createPublicReleaseOperationalReadinessReport,
  createPublicReleasePreparationPackage,
  createPublicReleasePreparationPackageReport,
  createPublicReleasePrivacySecurityConfirmationReport,
  createPublicReleaseSafetyConfirmationReport,
  createPublicReleaseServiceLockConfirmationReport,
  createSupportFeedbackPublicReadinessReport,
  runPhase91Audit
} from "../phase-9";

export type TeoyubePhase91SmokeCheckResult = {
  id: string;
  passed: boolean;
  notes: string;
};

export type TeoyubePhase91SmokeCheckReport = {
  valid: boolean;
  results: TeoyubePhase91SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  phase91PackageDecision: string;
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

function result(id: string, passed: boolean, notes: string): TeoyubePhase91SmokeCheckResult {
  return { id, passed, notes };
}

export function runPhase91ControlledPublicReleasePreparationSmokeCheck(): TeoyubePhase91SmokeCheckReport {
  const phase84Smoke = runPhase84PublicReleaseCandidateSmokeCheck();
  const phase84Audit = runPhase84Audit();
  const controlledPreparationReport = createControlledPublicReleasePreparationReport({ ownerApprovalRequired: true, publicCopyReviewRequired: true });
  const unsafeCopyReport = createFinalPublicCopyReviewReport({
    privacyCopyPresent: false,
    divineCertaintyLanguage: true,
    professionalAdviceClaims: true,
    unapprovedServicesImpliedActive: true
  });
  const finalPublicCopyReviewReport = createFinalPublicCopyReviewReport();
  const knownLimitationsReport = createFinalPublicReleaseKnownLimitationsReport();
  const serviceLockReport = createPublicReleaseServiceLockConfirmationReport();
  const unsafePrivacyReport = createPublicReleasePrivacySecurityConfirmationReport({
    rawSensitiveTextStorageEnabled: true,
    hiddenPersonalization: true,
    sensitiveBrowserPersistenceRequired: true,
    automaticFeedbackCollection: true,
    automaticUserContact: true
  });
  const privacySecurityReport = createPublicReleasePrivacySecurityConfirmationReport();
  const safetyReport = createPublicReleaseSafetyConfirmationReport();
  const supportFeedbackReport = createSupportFeedbackPublicReadinessReport();
  const operationalReadinessReport = createPublicReleaseOperationalReadinessReport({ ownerReviewPathExists: true });
  const ownerApprovalChecklist = createFinalOwnerApprovalGateChecklist();
  const preparationPackage = createPublicReleasePreparationPackage({ ownerReviewed: true });
  const preparationPackageReport = createPublicReleasePreparationPackageReport(preparationPackage);
  const phase91Package = createPhase91Package({ ownerReviewed: true, publicReleasePreparationPackage: preparationPackage });
  const phase91PackageReport = createPhase91PackageReport(phase91Package);
  const phase91Audit = runPhase91Audit();

  const results = [
    result("phase_9_contracts_compile", controlledPreparationReport.checks.length > 0, "Phase 9 contracts are represented by structured reports."),
    result("controlled_preparation_structured", controlledPreparationReport.valid && controlledPreparationReport.inMemoryOnly, `Controlled preparation decision: ${controlledPreparationReport.decision}.`),
    result("final_public_copy_blocks_unsafe_copy", !unsafeCopyReport.valid && unsafeCopyReport.blockers.length >= 3, "Final public copy review blocks unsafe copy."),
    result("final_public_copy_safe_default", finalPublicCopyReviewReport.valid && finalPublicCopyReviewReport.inMemoryOnly, "Final public copy review passes safe defaults."),
    result("known_limitations_generated", knownLimitationsReport.valid && knownLimitationsReport.limitations.length >= 12, `${knownLimitationsReport.limitations.length} known limitation(s) generated.`),
    result("service_locks_disabled", serviceLockReport.valid && serviceLockReport.noServiceEnabled && serviceLockReport.noDatabasePersistenceEnabled && serviceLockReport.noLiveAiOrchestrationEnabled, "Service lock confirmation keeps services disabled."),
    result("privacy_blocks_unsafe_storage", !unsafePrivacyReport.valid && unsafePrivacyReport.blockers.length >= 4, "Privacy/security confirmation blocks unsafe storage, hidden personalization, browser persistence, auto feedback, and auto contact."),
    result("privacy_safe_default", privacySecurityReport.valid && privacySecurityReport.noHiddenPersonalization && privacySecurityReport.noSensitiveBrowserPersistence, "Privacy/security confirmation passes safe defaults."),
    result("safety_preserves_surfaces", safetyReport.valid && safetyReport.scriptureAnchorsProtected && safetyReport.explanationTracesProtected && safetyReport.fallbackSafetyProtected && safetyReport.confidenceLabelsProtected, "Safety confirmation preserves Scripture, explanation, fallback, and confidence."),
    result("support_feedback_manual", supportFeedbackReport.valid && supportFeedbackReport.supportRemainsManual && supportFeedbackReport.feedbackRemainsManual && supportFeedbackReport.noAutomaticContact, "Support/feedback readiness remains manual."),
    result("operational_no_external_action", operationalReadinessReport.valid && operationalReadinessReport.noAutomaticExternalAction, "Operational readiness performs no external action."),
    result("owner_approval_checklist_exists", ownerApprovalChecklist.length >= 10, `${ownerApprovalChecklist.length} owner approval checklist item(s) represented.`),
    result("public_release_preparation_package_in_memory", preparationPackageReport.valid && preparationPackageReport.inMemoryOnly, `Preparation package decision: ${preparationPackageReport.decision}.`),
    result("phase_9_1_package_in_memory", phase91PackageReport.valid && phase91PackageReport.inMemoryOnly, `Phase 9.1 package decision: ${phase91PackageReport.decision}.`),
    result("phase_8_4_smoke_valid", phase84Smoke.valid, "Phase 8.4 smoke check remains valid."),
    result("phase_8_4_audit_complete", phase84Audit.complete && phase84Audit.completionPercentage === 100, "Phase 8.4 audit remains complete."),
    result("phase_9_1_audit_complete", phase91Audit.complete && phase91Audit.completionPercentage === 100, `Phase 9.1 audit completion: ${phase91Audit.completionPercentage}%.`),
    result("no_public_launch", phase91Audit.noPublicLaunchPerformed && phase91Package.noPublicLaunchPerformed, "No public launch is performed."),
    result("no_beta_launch", phase91Audit.noBetaLaunchPerformed && phase91Package.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase91Audit.noUsersContacted && phase91Package.noUsersContacted, "No users are contacted."),
    result("no_feedback_auto_collection", phase91Audit.noFeedbackCollectedAutomatically && phase91Package.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_url_fetching", phase91Audit.noPublicUrlsFetchedAutomatically && phase91Package.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase91Audit.noDatabasePersistenceEnabled && phase91Package.noDatabasePersistenceEnabled, "Database persistence remains disabled."),
    result("no_analytics", phase91Audit.noAnalyticsEnabled && phase91Package.noAnalyticsEnabled, "Analytics remain disabled."),
    result("no_monitoring_provider", phase91Audit.noMonitoringProviderConnected && phase91Package.noMonitoringProviderConnected, "No production monitoring provider is connected."),
    result("no_live_ai", phase91Audit.noLiveAiOrchestrationEnabled && phase91Package.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    result("no_admin_auth_or_cms", phase91Audit.noAdminAuthAdded && phase91Audit.noCmsConnected && phase91Package.noAdminAuthAdded && phase91Package.noCmsConnected, "Admin auth and CMS remain disabled."),
    result("no_external_services", phase91Audit.noExternalServicesRequired && phase91Package.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase91Audit.noBrowserPersistenceRequired && phase91Package.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = results.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.notes}`);

  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings: [
      "Phase 9.1 is controlled public release preparation only; it does not launch, contact users, collect feedback automatically, fetch public URLs automatically, publish content, persist data, or connect services.",
      ...phase91PackageReport.warnings
    ],
    phase91PackageDecision: phase91PackageReport.decision,
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
