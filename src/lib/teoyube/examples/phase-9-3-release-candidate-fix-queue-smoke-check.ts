import {
  addReleaseCandidateFixQueueItems,
  createFinalMobileAccessibilityRegressionReport,
  createFinalPrivacyConsentRegressionReport,
  createFinalPublicSafetyRegressionReport,
  createFinalRegressionQaReport,
  createFinalRegressionQaRun,
  createFinalServiceDisabledRegressionReport,
  createPhase93OwnerReviewChecklist,
  createPhase93Package,
  createPhase93PackageReport,
  createPublicGoNoGoReadinessScoreReport,
  createPublicIssue,
  createPublicIssueToFixConversionReport,
  createReleaseCandidateFixQueue,
  createReleaseCandidateFixQueueItem,
  createReleaseCandidateFixQueueReport,
  createReleaseCandidateRemediationPackage,
  createReleaseCandidateRemediationPackageReport,
  createReleaseCandidateRemediationPlan,
  createReleaseCandidateRemediationPlanReport,
  createReleaseCandidateRemediationSafetyReport,
  FINAL_REGRESSION_QA_AREAS,
  getBlockedReleaseCandidateRemediationItems,
  getDeferredReleaseCandidateRemediationItems,
  getOwnerReviewReleaseCandidateRemediationItems,
  getSafeReleaseCandidateRemediationItems,
  recordFinalRegressionQaAreaResult,
  runPhase91Audit,
  runPhase92Audit,
  runPhase93Audit
} from "../phase-9";
import { runPhase91ControlledPublicReleasePreparationSmokeCheck } from "./phase-9-1-controlled-public-release-preparation-smoke-check";
import { runPhase92PublicReleaseCandidateQaSmokeCheck } from "./phase-9-2-public-release-candidate-qa-smoke-check";

export type TeoyubePhase93SmokeCheckResult = {
  id: string;
  passed: boolean;
  notes: string;
};

export type TeoyubePhase93SmokeCheckReport = {
  valid: boolean;
  results: TeoyubePhase93SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  publicGoNoGoReadinessScoreBand: string;
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

function result(id: string, passed: boolean, notes: string): TeoyubePhase93SmokeCheckResult {
  return { id, passed, notes };
}

export function runPhase93ReleaseCandidateFixQueueSmokeCheck(): TeoyubePhase93SmokeCheckReport {
  const publicIssues = [
    createPublicIssue({
      id: "smoke_content_clarity",
      title: "Smoke content clarity issue",
      category: "content_clarity",
      severity: "low",
      details: "Low-risk public copy clarity issue."
    }),
    createPublicIssue({
      id: "smoke_missing_scripture_anchor",
      title: "Smoke missing Scripture anchor issue",
      category: "scripture_anchor_missing",
      severity: "critical",
      details: "Critical issue should convert into an owner-review/public-release-blocker fix item."
    })
  ];
  const conversionReport = createPublicIssueToFixConversionReport(publicIssues);
  const queue = addReleaseCandidateFixQueueItems(createReleaseCandidateFixQueue(), conversionReport.fixItems);
  const queueReport = createReleaseCandidateFixQueueReport(queue);
  const safeItem = createReleaseCandidateFixQueueItem({ id: "safe_doc_fix", title: "Safe documentation fix", category: "documentation", priority: "low", status: "queued", riskLevel: "safe_local" });
  const ownerReviewItem = createReleaseCandidateFixQueueItem({ id: "owner_review_fix", title: "Owner review Scripture fix", category: "scripture_anchor", priority: "public_release_blocker", status: "owner_review_required", riskLevel: "owner_review" });
  const blockedItem = createReleaseCandidateFixQueueItem({ id: "blocked_fix", title: "Blocked unsafe fix", category: "service_disabled_state", priority: "high", status: "blocked", riskLevel: "blocked" });
  const deferredItem = createReleaseCandidateFixQueueItem({ id: "deferred_fix", title: "Deferred performance note", category: "performance_manual", priority: "defer", status: "deferred", riskLevel: "defer" });
  const remediationPlan = createReleaseCandidateRemediationPlan({
    items: [
      {
        id: "remediation_safe_doc_fix",
        fixItem: safeItem,
        status: "safe_to_remediate",
        actions: [{ id: "safe_doc_action", label: "Safe doc action", details: "Documentation-only safe action.", safeLocalAction: true }],
        risk: {},
        safeLocalRemediation: true,
        ownerReviewRequired: false,
        blocked: false,
        deferred: false,
        notes: ["Safe item."]
      },
      {
        id: "remediation_owner_review_fix",
        fixItem: ownerReviewItem,
        status: "owner_review_required",
        actions: [{ id: "owner_review_action", label: "Owner review action", details: "Owner review required before remediation.", safeLocalAction: false }],
        risk: {},
        safeLocalRemediation: false,
        ownerReviewRequired: true,
        blocked: false,
        deferred: false,
        notes: ["Owner review required."]
      },
      {
        id: "remediation_blocked_fix",
        fixItem: blockedItem,
        status: "blocked",
        actions: [{ id: "blocked_action", label: "Blocked action", details: "Unsafe action is blocked.", safeLocalAction: false }],
        risk: { enablesUnapprovedServices: true },
        safeLocalRemediation: false,
        ownerReviewRequired: false,
        blocked: true,
        deferred: false,
        notes: ["Blocked item."]
      },
      {
        id: "remediation_deferred_fix",
        fixItem: deferredItem,
        status: "deferred",
        actions: [{ id: "deferred_action", label: "Deferred action", details: "Deferred manual performance review.", safeLocalAction: true }],
        risk: {},
        safeLocalRemediation: false,
        ownerReviewRequired: false,
        blocked: false,
        deferred: true,
        notes: ["Deferred item."]
      }
    ]
  });
  const remediationPlanReport = createReleaseCandidateRemediationPlanReport(remediationPlan);
  const unsafeSafetyReport = createReleaseCandidateRemediationSafetyReport(remediationPlan);
  const safePlan = createReleaseCandidateRemediationPlan({ queue: createReleaseCandidateFixQueue() });
  const safeSafetyReport = createReleaseCandidateRemediationSafetyReport(safePlan);

  let finalRegressionRun = createFinalRegressionQaRun();
  for (const area of FINAL_REGRESSION_QA_AREAS) {
    finalRegressionRun = recordFinalRegressionQaAreaResult(finalRegressionRun, area, { passed: true, status: "passed", notes: [`${area} smoke regression passed.`] });
  }
  const finalRegressionQaReport = createFinalRegressionQaReport(finalRegressionRun);
  const serviceDisabledRegressionReport = createFinalServiceDisabledRegressionReport();
  const publicSafetyRegressionReport = createFinalPublicSafetyRegressionReport();
  const privacyConsentRegressionReport = createFinalPrivacyConsentRegressionReport();
  const mobileAccessibilityRegressionReport = createFinalMobileAccessibilityRegressionReport();
  const goNoGoScoreReport = createPublicGoNoGoReadinessScoreReport();
  const remediationPackage = createReleaseCandidateRemediationPackage();
  const remediationPackageReport = createReleaseCandidateRemediationPackageReport(remediationPackage);
  const ownerChecklist = createPhase93OwnerReviewChecklist();
  const phase93Package = createPhase93Package();
  const phase93PackageReport = createPhase93PackageReport(phase93Package);
  const phase91Smoke = runPhase91ControlledPublicReleasePreparationSmokeCheck();
  const phase92Smoke = runPhase92PublicReleaseCandidateQaSmokeCheck();
  const phase91Audit = runPhase91Audit();
  const phase92Audit = runPhase92Audit();
  const phase93Audit = runPhase93Audit();

  const results = [
    result("fix_queue_contracts_compile", Array.isArray(queue.items), `${queue.items.length} fix item(s) queued.`),
    result("fix_queue_manager_in_memory", queueReport.inMemoryOnly && queueReport.noExternalWrite && queueReport.noExternalServices, `Queue decision: ${queueReport.decision}.`),
    result("public_issue_to_fix_structured", conversionReport.fixItems.length === 2 && conversionReport.inMemoryOnly, `${conversionReport.fixItems.length} issue(s) converted.`),
    result("remediation_planner_classifies_items", getSafeReleaseCandidateRemediationItems(remediationPlan).length === 1 && getOwnerReviewReleaseCandidateRemediationItems(remediationPlan).length === 1 && getBlockedReleaseCandidateRemediationItems(remediationPlan).length === 1 && getDeferredReleaseCandidateRemediationItems(remediationPlan).length === 1, "Remediation planner separates safe, owner-review, blocked, and deferred items."),
    result("remediation_plan_reports_blocker", !remediationPlanReport.valid && remediationPlanReport.summary.blockedItems === 1, "Remediation plan report surfaces blocked items."),
    result("remediation_safety_blocks_unsafe", !unsafeSafetyReport.valid && unsafeSafetyReport.blockers.length > 0, "Unsafe remediation is blocked."),
    result("remediation_safety_safe_plan_valid", safeSafetyReport.valid, "Safe empty remediation plan validates."),
    result("final_regression_qa_in_memory", finalRegressionQaReport.valid && finalRegressionQaReport.inMemoryOnly && finalRegressionQaReport.summary.totalResults === FINAL_REGRESSION_QA_AREAS.length, "Final regression QA runner works in memory only."),
    result("service_disabled_regression_safe", serviceDisabledRegressionReport.valid && serviceDisabledRegressionReport.noDatabasePersistenceEnabled && serviceDisabledRegressionReport.noAnalyticsEnabled && serviceDisabledRegressionReport.noMonitoringProviderConnected, "Services remain disabled."),
    result("public_safety_regression_safe", publicSafetyRegressionReport.valid && publicSafetyRegressionReport.scriptureAnchorsProtected && publicSafetyRegressionReport.explanationTracesProtected && publicSafetyRegressionReport.fallbackSafetyProtected && publicSafetyRegressionReport.confidenceLabelsProtected, "Public safety regression protects core boundaries."),
    result("privacy_consent_regression_safe", privacyConsentRegressionReport.valid && privacyConsentRegressionReport.noRawSensitiveTextStorage && privacyConsentRegressionReport.noSensitiveBrowserPersistence && privacyConsentRegressionReport.noHiddenPersonalization, "Privacy/consent regression preserves privacy boundaries."),
    result("mobile_accessibility_regression_structured", mobileAccessibilityRegressionReport.valid && mobileAccessibilityRegressionReport.graphListFallbackAvailable && mobileAccessibilityRegressionReport.promiseTableMobileViewAvailable, "Mobile/accessibility regression returns structured report."),
    result("go_no_go_score_band", goNoGoScoreReport.band === "excellent" && goNoGoScoreReport.score === 100, `Public go/no-go score band: ${goNoGoScoreReport.band}.`),
    result("remediation_package_in_memory", remediationPackageReport.valid && remediationPackageReport.inMemoryOnly, `Remediation package decision: ${remediationPackageReport.decision}.`),
    result("owner_review_checklist_exists", ownerChecklist.length >= 14, `${ownerChecklist.length} owner review items exist.`),
    result("phase_9_3_package_valid", phase93PackageReport.valid && phase93PackageReport.inMemoryOnly, `Phase 9.3 package decision: ${phase93PackageReport.decision}.`),
    result("phase_9_1_smoke_valid", phase91Smoke.valid, "Phase 9.1 smoke remains valid."),
    result("phase_9_2_smoke_valid", phase92Smoke.valid, "Phase 9.2 smoke remains valid."),
    result("phase_9_1_audit_complete", phase91Audit.complete && phase91Audit.completionPercentage === 100, `Phase 9.1 audit completion: ${phase91Audit.completionPercentage}%.`),
    result("phase_9_2_audit_complete", phase92Audit.complete && phase92Audit.completionPercentage === 100, `Phase 9.2 audit completion: ${phase92Audit.completionPercentage}%.`),
    result("phase_9_3_audit_complete", phase93Audit.complete && phase93Audit.completionPercentage === 100, `Phase 9.3 audit completion: ${phase93Audit.completionPercentage}%.`),
    result("no_public_launch", phase93Audit.noPublicLaunchPerformed && phase93Package.noPublicLaunchPerformed, "No public launch is performed."),
    result("no_beta_launch", phase93Audit.noBetaLaunchPerformed && phase93Package.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase93Audit.noUsersContacted && phase93Package.noUsersContacted, "No users are contacted."),
    result("no_feedback_auto_collection", phase93Audit.noFeedbackCollectedAutomatically && phase93Package.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_url_fetching", phase93Audit.noPublicUrlsFetchedAutomatically && phase93Package.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase93Audit.noDatabasePersistenceEnabled && phase93Package.noDatabasePersistenceEnabled, "Database persistence remains disabled."),
    result("no_analytics", phase93Audit.noAnalyticsEnabled && phase93Package.noAnalyticsEnabled, "Analytics remain disabled."),
    result("no_monitoring_provider", phase93Audit.noMonitoringProviderConnected && phase93Package.noMonitoringProviderConnected, "No production monitoring provider is connected."),
    result("no_live_ai", phase93Audit.noLiveAiOrchestrationEnabled && phase93Package.noLiveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    result("no_admin_auth_or_cms", phase93Audit.noAdminAuthAdded && phase93Audit.noCmsConnected && phase93Package.noAdminAuthAdded && phase93Package.noCmsConnected, "Admin auth and CMS remain disabled."),
    result("no_external_services", phase93Audit.noExternalServicesRequired && phase93Package.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase93Audit.noBrowserPersistenceRequired && phase93Package.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = results.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.notes}`);

  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings: [
      "Phase 9.3 is release candidate fix queue, final regression QA, and public go/no-go readiness scoring only; it does not launch, contact users, collect feedback automatically, fetch public URLs automatically, persist data, or connect services.",
      ...phase93PackageReport.warnings
    ],
    publicGoNoGoReadinessScoreBand: phase93PackageReport.readinessScoreBand,
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
