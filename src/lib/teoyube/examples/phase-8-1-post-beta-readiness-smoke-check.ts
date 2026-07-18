import {
  createControlledServiceReassessmentGate,
  createControlledServiceReassessmentReport,
  createContentReviewFollowUpReport,
  createMobileAccessibilityHardeningReport,
  createPerformanceHardeningReport,
  createPhase81OwnerReviewChecklist,
  createPhase81Package,
  createPhase81PackageReport,
  createPostBetaReadinessAuditReport,
  createPrivacySecurityFollowUpReport,
  createProductHardeningPlan,
  createProductHardeningPlanReport,
  createPublicReleasePreparationReport,
  createSafeHardeningPatchValidationReport,
  createServiceReassessmentEnforcementQaReport,
  runPhase81Audit,
  type TeoyubeProductHardeningItem
} from "../phase-8";
import { runPhase74Audit } from "../phase-7";
import { runPhase74CompletionReviewSmokeCheck } from "./phase-7-4-completion-review-smoke-check";

export type TeoyubePhase81SmokeCheckResult = {
  id: string;
  passed: boolean;
  notes: string;
};

export type TeoyubePhase81SmokeCheckReport = {
  valid: boolean;
  results: TeoyubePhase81SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
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

function result(id: string, passed: boolean, notes: string): TeoyubePhase81SmokeCheckResult {
  return { id, passed, notes };
}

export function runPhase81PostBetaReadinessSmokeCheck(): TeoyubePhase81SmokeCheckReport {
  const postBetaReadinessAudit = createPostBetaReadinessAuditReport();
  const productHardeningPlan = createProductHardeningPlan();
  const productHardeningPlanReport = createProductHardeningPlanReport(productHardeningPlan);
  const unsafePatchBase = productHardeningPlan.items[0] as TeoyubeProductHardeningItem;
  const unsafePatchCandidate: TeoyubeProductHardeningItem = {
    ...unsafePatchBase,
    preservesScriptureAnchors: false,
    noBrowserPersistence: false as true
  };
  const unsafePatchValidation = createSafeHardeningPatchValidationReport([unsafePatchCandidate]);
  const serviceReassessmentGate = createControlledServiceReassessmentGate();
  const serviceReassessmentReport = createControlledServiceReassessmentReport(serviceReassessmentGate);
  const serviceEnforcementQa = createServiceReassessmentEnforcementQaReport();
  const privacySecurityFollowUp = createPrivacySecurityFollowUpReport();
  const performanceHardening = createPerformanceHardeningReport();
  const mobileAccessibilityHardening = createMobileAccessibilityHardeningReport();
  const contentReviewFollowUp = createContentReviewFollowUpReport();
  const publicReleasePreparation = createPublicReleasePreparationReport({ ownerApproved: true });
  const ownerChecklist = createPhase81OwnerReviewChecklist();
  const phase81Package = createPhase81Package({ ownerReviewed: true });
  const phase81PackageReport = createPhase81PackageReport(phase81Package);
  const phase74SmokeCheck = runPhase74CompletionReviewSmokeCheck();
  const phase74Audit = runPhase74Audit();
  const phase81Audit = runPhase81Audit();

  const results = [
    result("phase_8_contracts_compile", typeof phase81Audit.completionPercentage === "number", "Phase 8.1 audit types and contracts are represented."),
    result("post_beta_readiness_structured", postBetaReadinessAudit.valid && postBetaReadinessAudit.inMemoryOnly, `Post-beta readiness decision: ${postBetaReadinessAudit.decision}.`),
    result("product_hardening_plan_structured", productHardeningPlanReport.valid && productHardeningPlanReport.plan.items.length > 0, `${productHardeningPlanReport.plan.items.length} hardening item(s) represented.`),
    result("safe_validator_blocks_unsafe_patch", !unsafePatchValidation.valid && unsafePatchValidation.blockers.length >= 2, "Unsafe Scripture-anchor removal and browser persistence are blocked."),
    result("service_reassessment_connects_no_services", serviceReassessmentReport.valid && serviceReassessmentReport.items.every((entry) => entry.noServiceConnected), `${serviceReassessmentReport.items.length} service gate(s) reassessed without connection.`),
    result("service_enforcement_qa_disabled", serviceEnforcementQa.valid && serviceEnforcementQa.noExternalServicesRequired, "Service enforcement QA confirms services remain disabled."),
    result("privacy_security_follow_up_structured", privacySecurityFollowUp.valid && privacySecurityFollowUp.noHiddenPersonalization, `${privacySecurityFollowUp.checklist.length} privacy/security item(s) represented.`),
    result("performance_plan_no_monitoring", performanceHardening.valid && performanceHardening.noExternalMonitoringConnected && performanceHardening.noAnalyticsEnabled, `${performanceHardening.items.length} performance item(s) represented.`),
    result("mobile_accessibility_plan_structured", mobileAccessibilityHardening.valid && mobileAccessibilityHardening.preservesScriptureAnchors, `${mobileAccessibilityHardening.items.length} mobile/accessibility item(s) represented.`),
    result("content_review_drafts_gated", contentReviewFollowUp.valid && contentReviewFollowUp.reviewOnlyDraftsGated && contentReviewFollowUp.noProductionJsonWrite, `${contentReviewFollowUp.items.length} content follow-up item(s) represented.`),
    result("public_release_not_launched", publicReleasePreparation.valid && publicReleasePreparation.noPublicReleaseLaunched, `Public release preparation decision: ${publicReleasePreparation.decision}.`),
    result("owner_review_checklist_exists", ownerChecklist.length >= 10, `${ownerChecklist.length} owner review item(s) represented.`),
    result("phase_8_1_package_in_memory", phase81PackageReport.valid && phase81PackageReport.inMemoryOnly && phase81Package.inMemoryOnly, `Phase 8.1 package decision: ${phase81PackageReport.decision}.`),
    result("phase_7_4_smoke_check_still_valid", phase74SmokeCheck.valid, "Phase 7.4 smoke check remains valid."),
    result("phase_7_4_audit_still_complete", phase74Audit.complete && phase74Audit.completionPercentage === 100, "Phase 7.4 audit remains complete."),
    result("phase_8_1_audit_structured", phase81Audit.complete && phase81Audit.completionPercentage === 100, `Phase 8.1 audit completion: ${phase81Audit.completionPercentage}%.`),
    result("no_public_launch", postBetaReadinessAudit.noPublicLaunchPerformed && phase81Audit.noPublicLaunchPerformed, "No public launch is performed."),
    result("no_beta_launch", postBetaReadinessAudit.noBetaLaunchPerformed && phase81Audit.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", postBetaReadinessAudit.noUsersContacted && phase81Audit.noUsersContacted, "No users are contacted."),
    result("no_feedback_auto_collection", postBetaReadinessAudit.noFeedbackCollectedAutomatically && phase81Audit.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_url_fetching", postBetaReadinessAudit.noPublicUrlsFetchedAutomatically && phase81Audit.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", postBetaReadinessAudit.noDatabasePersistenceEnabled && serviceEnforcementQa.noDatabasePersistenceEnabled && phase81Audit.noDatabasePersistenceEnabled, "Database persistence remains disabled."),
    result("no_analytics", postBetaReadinessAudit.noAnalyticsEnabled && serviceEnforcementQa.noAnalyticsEnabled && phase81Audit.noAnalyticsEnabled, "Analytics remain disabled."),
    result("no_monitoring_provider", postBetaReadinessAudit.noMonitoringProviderConnected && serviceEnforcementQa.noMonitoringProviderConnected && phase81Audit.noMonitoringProviderConnected, "No production monitoring provider is connected."),
    result("no_live_ai", postBetaReadinessAudit.noLiveAiOrchestrationEnabled && serviceEnforcementQa.noLiveAiOrchestrationEnabled && phase81Audit.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    result("no_admin_auth_or_cms", postBetaReadinessAudit.noAdminAuthAdded && postBetaReadinessAudit.noCmsConnected && phase81Audit.noAdminAuthAdded && phase81Audit.noCmsConnected, "Admin auth and CMS remain disabled."),
    result("no_external_services", postBetaReadinessAudit.noExternalServicesRequired && serviceReassessmentReport.noExternalServicesRequired && phase81Audit.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", postBetaReadinessAudit.noBrowserPersistenceRequired && phase81Audit.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = results.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.notes}`);

  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings: [
      "Phase 8.1 is post-beta readiness planning only; it does not claim verified real beta results from inside the codebase.",
      ...postBetaReadinessAudit.warnings.map((entry) => entry.message),
      ...phase81PackageReport.warnings
    ],
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
