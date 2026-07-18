import {
  addManualBetaFeedbackItem,
  createBetaOperationsKnownLimitationsReport,
  createBetaOperationsPackage,
  createBetaOperationsPackageReport,
  createBetaOperationsPauseRollbackReviewReport,
  createBetaSupportRequest,
  createBetaSupportToIssueConversionReport,
  createBetaSupportWorkflowReport,
  createControlledBetaOperationsRunbookReport,
  createManualBetaFeedbackItem,
  createManualBetaFeedbackReview,
  createManualBetaFeedbackReviewReport,
  createManualOperationalMonitoringReport,
  createPassingManualOperationalMonitoringRun,
  createPhase71OwnerReviewChecklist,
  createPhase71Package,
  createPhase71PackageReport,
  runPhase71Audit
} from "../phase-7";

export type TeoyubePhase71SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase71SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase71SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
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

function result(id: string, passed: boolean, details: string): TeoyubePhase71SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase71ControlledBetaOperationsSmokeCheck(): TeoyubePhase71SmokeCheckReport {
  const runbookReport = createControlledBetaOperationsRunbookReport({ ownerApproved: true });
  const feedbackReview = createManualBetaFeedbackReview();
  const feedbackItem = createManualBetaFeedbackItem({
    rawText: "Please make the explanation clearer. My email is participant@example.com.",
    category: "explanation_trace"
  });
  const feedbackReviewWithItem = addManualBetaFeedbackItem(feedbackReview, feedbackItem);
  const feedbackReport = createManualBetaFeedbackReviewReport(feedbackReviewWithItem);
  const supportRequest = createBetaSupportRequest({
    rawText: "The confidence label is confusing on the response panel.",
    category: "confidence_label_confusion"
  });
  const supportReport = createBetaSupportWorkflowReport([supportRequest]);
  const supportToIssueReport = createBetaSupportToIssueConversionReport([supportRequest]);
  const monitoringRun = createPassingManualOperationalMonitoringRun();
  const monitoringReport = createManualOperationalMonitoringReport(monitoringRun);
  const pauseRollbackReport = createBetaOperationsPauseRollbackReviewReport({ fallbackUnsafe: true });
  const knownLimitationsReport = createBetaOperationsKnownLimitationsReport();
  const betaOperationsPackage = createBetaOperationsPackage({
    ownerApproved: true,
    monitoringRun,
    supportRequests: [],
    feedbackReview: feedbackReviewWithItem
  });
  const betaOperationsPackageReport = createBetaOperationsPackageReport(betaOperationsPackage);
  const ownerChecklist = createPhase71OwnerReviewChecklist(true);
  const phase71Package = createPhase71Package({
    betaOperationsPackage,
    ownerReviewed: true
  });
  const phase71PackageReport = createPhase71PackageReport(phase71Package);
  const phase71Audit = runPhase71Audit();

  const checks = [
    result("phase_7_contracts_compile", Array.isArray(runbookReport.runbook.sections), `${runbookReport.runbook.sections.length} runbook section(s).`),
    result("operations_runbook_structured", runbookReport.valid && runbookReport.inMemoryOnly && runbookReport.noUsersContacted, `Runbook decision: ${runbookReport.decision}.`),
    result("feedback_review_manual_only", feedbackReport.valid && feedbackReport.inMemoryOnly && feedbackReport.noFeedbackCollectedAutomatically, `${feedbackReport.summary.itemCount} feedback item(s).`),
    result("feedback_sanitizer_redacts_sensitive_text", Boolean(feedbackReport.review.items[0]?.summary.includes("[redacted-email]") || feedbackReport.review.items[0]?.redactedNotes.some((note) => note.includes("[redacted-email]"))), "Feedback sanitizer redacts contact information."),
    result("support_workflow_sends_no_messages", supportReport.valid && supportReport.noUsersContacted && supportReport.noExternalServicesRequired, `Support decision: ${supportReport.decision}.`),
    result("support_to_issue_converter_structured", supportToIssueReport.convertedIssueCount >= 1 && supportToIssueReport.inMemoryOnly, `${supportToIssueReport.convertedIssueCount} support issue(s).`),
    result("manual_monitoring_fetches_no_urls", monitoringReport.valid && monitoringReport.noPublicUrlsFetchedAutomatically && monitoringReport.noMonitoringProviderConnected, `${monitoringReport.summary.completedCheckCount} monitoring check(s).`),
    result("pause_rollback_performs_no_rollback", pauseRollbackReport.rollbackReviewRecommended && pauseRollbackReport.noRollbackPerformed, "Rollback review is recommended without performing rollback."),
    result("known_limitations_generated", knownLimitationsReport.valid && knownLimitationsReport.limitations.length >= 10, `${knownLimitationsReport.limitations.length} limitation(s).`),
    result("operations_package_in_memory", betaOperationsPackageReport.valid && betaOperationsPackageReport.inMemoryOnly && betaOperationsPackageReport.noExternalSend, `Package decision: ${betaOperationsPackageReport.decision}.`),
    result("owner_review_checklist_exists", ownerChecklist.length >= 10, `${ownerChecklist.length} owner review item(s).`),
    result("phase_7_1_package_valid", phase71PackageReport.valid && phase71PackageReport.inMemoryOnly && phase71PackageReport.noExternalSend, `Phase 7.1 decision: ${phase71PackageReport.decision}.`),
    result("phase_7_1_audit_complete", phase71Audit.complete && phase71Audit.completionPercentage === 100, `Audit completion: ${phase71Audit.completionPercentage}%.`),
    result("no_beta_launch_performed", phase71Package.noBetaLaunchPerformed && phase71Audit.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase71Package.noUsersContacted && phase71Audit.noUsersContacted, "No users are contacted."),
    result("no_feedback_collected", phase71Package.noFeedbackCollectedAutomatically && phase71Audit.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_urls_fetched", phase71Package.noPublicUrlsFetchedAutomatically && phase71Audit.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase71Package.noDatabasePersistenceEnabled && phase71Audit.noDatabasePersistenceEnabled, "No database persistence is enabled."),
    result("no_analytics", phase71Package.noAnalyticsEnabled && phase71Audit.noAnalyticsEnabled, "No analytics are enabled."),
    result("no_monitoring_provider", phase71Package.noMonitoringProviderConnected && phase71Audit.noMonitoringProviderConnected, "No monitoring provider is connected."),
    result("no_live_ai", phase71Package.noLiveAiOrchestrationEnabled && phase71Audit.noLiveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    result("no_admin_auth", phase71Package.noAdminAuthAdded && phase71Audit.noAdminAuthAdded, "No admin auth is added."),
    result("no_cms", phase71Package.noCmsConnected && phase71Audit.noCmsConnected, "No CMS is connected."),
    result("no_external_services_required", phase71Package.noExternalServicesRequired && phase71Audit.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase71Package.noBrowserPersistenceRequired && phase71Audit.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: [
      "Phase 7.1 is an operations planning and support workflow step only.",
      "Manual feedback simulation and product stabilization queue are carried into Phase 7.2."
    ],
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
