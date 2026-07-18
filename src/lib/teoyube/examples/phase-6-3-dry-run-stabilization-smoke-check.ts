import {
  addDryRunFixQueueItems,
  convertDryRunIssuesToFixQueueItems,
  createDryRunDisabledServiceRegressionReport,
  createDryRunFixQueue,
  createDryRunFixQueueReport,
  createDryRunIssue,
  createDryRunIssueToFixConversionReport,
  createDryRunMobileAccessibilityRegressionReport,
  createDryRunRegressionQaReport,
  createDryRunRegressionQaRun,
  createDryRunSafetyRegressionReport,
  createDryRunStabilizationPackage,
  createDryRunStabilizationPackageReport,
  createDryRunStabilizationPlan,
  createDryRunStabilizationPlanReport,
  createDryRunStabilizationSafetyReport,
  createOperationsReadinessReport,
  createPhase63OwnerReviewChecklist,
  createPhase63Package,
  createPhase63PackageReport,
  createPostStabilizationDryRunReadinessScoreReport,
  getBlockedDryRunStabilizationItems,
  getDeferredDryRunStabilizationItems,
  getOwnerReviewDryRunStabilizationItems,
  getSafeDryRunStabilizationItems,
  runPhase63Audit
} from "../phase-6";

export type TeoyubePhase63SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase63SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase63SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  postStabilizationReadinessScore: number;
  postStabilizationReadinessBand: ReturnType<typeof createPostStabilizationDryRunReadinessScoreReport>["band"];
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

function result(id: string, passed: boolean, details: string): TeoyubePhase63SmokeCheckResult {
  return { id, passed, details };
}

function createPassingRegressionRun() {
  const run = createDryRunRegressionQaRun();
  return createDryRunRegressionQaRun({
    results: run.checks.map((check) => ({
      checkId: check.id,
      area: check.area,
      status: "passed",
      notes: "Smoke-check regression result passed in memory.",
      blocker: false,
      warning: false,
      recordedAt: new Date().toISOString()
    }))
  });
}

export function runPhase63DryRunStabilizationSmokeCheck(): TeoyubePhase63SmokeCheckReport {
  const safeIssue = createDryRunIssue({
    id: "smoke_content_clarity_issue",
    title: "Smoke content clarity issue",
    description: "Manual owner review should clarify a dry-run note.",
    category: "content_clarity",
    severity: "medium",
    source: "owner_observation"
  });
  const ownerReviewIssue = createDryRunIssue({
    id: "smoke_scripture_anchor_issue",
    title: "Smoke Scripture anchor owner-review issue",
    description: "Owner review should confirm anchor visibility.",
    category: "scripture_anchor_missing",
    severity: "high",
    source: "owner_observation"
  });
  const fixItems = convertDryRunIssuesToFixQueueItems([safeIssue, ownerReviewIssue]);
  const conversionReport = createDryRunIssueToFixConversionReport([safeIssue, ownerReviewIssue]);
  const queue = addDryRunFixQueueItems(createDryRunFixQueue(), fixItems);
  const queueReport = createDryRunFixQueueReport(queue);
  const stabilizationPlan = createDryRunStabilizationPlan({ queue });
  const stabilizationPlanReport = createDryRunStabilizationPlanReport(stabilizationPlan);
  const unsafePlan = {
    ...stabilizationPlan,
    items: stabilizationPlan.items.map((item, index) => index === 0 ? { ...item, safetyChecks: { removesScriptureAnchors: true } } : item)
  };
  const safetyReport = createDryRunStabilizationSafetyReport(stabilizationPlan);
  const unsafeSafetyReport = createDryRunStabilizationSafetyReport(unsafePlan);
  const operationsReadinessReport = createOperationsReadinessReport();
  const regressionRun = createPassingRegressionRun();
  const regressionQaReport = createDryRunRegressionQaReport(regressionRun);
  const disabledServiceRegressionReport = createDryRunDisabledServiceRegressionReport();
  const safetyRegressionReport = createDryRunSafetyRegressionReport();
  const mobileAccessibilityRegressionReport = createDryRunMobileAccessibilityRegressionReport();
  const postStabilizationReadinessScoreReport = createPostStabilizationDryRunReadinessScoreReport({ stabilizationPlan });
  const stabilizationPackage = createDryRunStabilizationPackage({ regressionRun });
  const stabilizationPackageReport = createDryRunStabilizationPackageReport(stabilizationPackage);
  const ownerReviewChecklist = createPhase63OwnerReviewChecklist();
  const phase63Package = createPhase63Package({ ownerReviewed: true });
  const phase63PackageReport = createPhase63PackageReport(phase63Package);
  const audit = runPhase63Audit();

  const checks = [
    result("fix_queue_contracts_compile", Array.isArray(fixItems), `${fixItems.length} fix item(s) converted.`),
    result("fix_queue_manager_in_memory", queueReport.valid && queueReport.inMemoryOnly && queueReport.noUsersContacted, `Queue decision: ${queueReport.decision}.`),
    result("issue_to_fix_converter_structured", conversionReport.valid && conversionReport.fixItems.length >= 2 && conversionReport.inMemoryOnly, `${conversionReport.fixItems.length} structured fix item(s).`),
    result("stabilization_planner_separates_items", getSafeDryRunStabilizationItems(stabilizationPlan).length >= 1 && getOwnerReviewDryRunStabilizationItems(stabilizationPlan).length >= 1 && getBlockedDryRunStabilizationItems(stabilizationPlan).length === 0 && getDeferredDryRunStabilizationItems(stabilizationPlan).length === 0, "Planner separates safe and owner-review items."),
    result("stabilization_plan_in_memory", stabilizationPlanReport.valid && stabilizationPlanReport.inMemoryOnly && stabilizationPlanReport.noFeedbackCollectedAutomatically, `Plan decision: ${stabilizationPlanReport.decision}.`),
    result("stabilization_safety_validator_blocks_unsafe", safetyReport.valid && !unsafeSafetyReport.valid && unsafeSafetyReport.blockers.length > 0, "Safety validator blocks unsafe Scripture-anchor removal."),
    result("operations_readiness_structured", operationsReadinessReport.valid && operationsReadinessReport.inMemoryOnly && operationsReadinessReport.noUsersContacted, `Operations decision: ${operationsReadinessReport.decision}.`),
    result("regression_qa_in_memory", regressionQaReport.valid && regressionQaReport.inMemoryOnly && regressionQaReport.completedCheckCount === regressionQaReport.totalCheckCount, `${regressionQaReport.completedCheckCount} regression check(s) completed.`),
    result("disabled_service_regression_passes", disabledServiceRegressionReport.valid && disabledServiceRegressionReport.enabledServiceCount === 0, "Disabled services remain disabled."),
    result("safety_regression_structured", safetyRegressionReport.valid && safetyRegressionReport.scriptureAnchorsPreserved && safetyRegressionReport.explanationPathsPreserved && safetyRegressionReport.fallbackSafetyPreserved, "Safety regression preserves anchors, traces, and fallback."),
    result("mobile_accessibility_regression_structured", mobileAccessibilityRegressionReport.valid && mobileAccessibilityRegressionReport.mobileSafe && mobileAccessibilityRegressionReport.accessibilitySafe, "Mobile/accessibility regression remains valid."),
    result("post_stabilization_score_structured", postStabilizationReadinessScoreReport.valid && postStabilizationReadinessScoreReport.score >= 90, `Score: ${postStabilizationReadinessScoreReport.score}; band: ${postStabilizationReadinessScoreReport.band}.`),
    result("stabilization_package_in_memory", stabilizationPackageReport.valid && stabilizationPackageReport.inMemoryOnly && stabilizationPackageReport.noExternalServicesRequired, `Stabilization package decision: ${stabilizationPackageReport.decision}.`),
    result("owner_review_checklist_exists", ownerReviewChecklist.length >= 13, `${ownerReviewChecklist.length} owner review item(s).`),
    result("phase_6_3_package_valid", phase63PackageReport.valid && phase63PackageReport.inMemoryOnly && phase63PackageReport.noExternalSend, `Phase 6.3 package decision: ${phase63PackageReport.decision}.`),
    result("phase_6_3_audit_complete", audit.complete && audit.completionPercentage === 100, `Audit completion: ${audit.completionPercentage}%.`),
    result("no_beta_launch_performed", phase63Package.noBetaLaunchPerformed && audit.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase63Package.noUsersContacted && audit.noUsersContacted, "No users are contacted."),
    result("no_feedback_collected", phase63Package.noFeedbackCollectedAutomatically && audit.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_urls_fetched", phase63Package.noPublicUrlsFetchedAutomatically && audit.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase63Package.noDatabasePersistenceEnabled && audit.noDatabasePersistenceEnabled, "No database persistence is enabled."),
    result("no_analytics", phase63Package.noAnalyticsEnabled && audit.noAnalyticsEnabled, "No analytics are enabled."),
    result("no_monitoring_provider", phase63Package.noMonitoringProviderConnected && audit.noMonitoringProviderConnected, "No monitoring provider is connected."),
    result("no_live_ai", phase63Package.noLiveAiOrchestrationEnabled && audit.noLiveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    result("no_admin_auth", phase63Package.noAdminAuthAdded && audit.noAdminAuthAdded, "No admin auth is added."),
    result("no_cms", phase63Package.noCmsConnected && audit.noCmsConnected, "No CMS is connected."),
    result("no_external_services_required", phase63Package.noExternalServicesRequired && audit.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase63Package.noBrowserPersistenceRequired && audit.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: [
      "Phase 6.3 is stabilization decision support and does not launch beta.",
      "Owner-review items remain manual and are not auto-fixed."
    ],
    postStabilizationReadinessScore: postStabilizationReadinessScoreReport.score,
    postStabilizationReadinessBand: postStabilizationReadinessScoreReport.band,
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
