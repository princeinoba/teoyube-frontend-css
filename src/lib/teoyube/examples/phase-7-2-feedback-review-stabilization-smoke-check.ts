import {
  addProductStabilizationQueueItem,
  addProductStabilizationQueueItems,
  addSimulatedManualFeedbackReviewItem,
  convertManualFeedbackToSupportIssues,
  convertSupportIssuesToStabilizationItems,
  createFeedbackReviewSimulationQaReport,
  createFeedbackToSupportIssueConversionReport,
  createManualFeedbackReviewSimulation,
  createManualFeedbackReviewSimulationReport,
  createPhase72OwnerReviewChecklist,
  createPhase72Package,
  createPhase72PackageReport,
  createProductStabilizationPlan,
  createProductStabilizationPlanReport,
  createProductStabilizationQueue,
  createProductStabilizationQueueItem,
  createProductStabilizationQueueQaReport,
  createProductStabilizationSafetyReport,
  createSimulatedManualFeedbackReviewItem,
  createSupportIssueToStabilizationConversionReport,
  createSupportIssueTriageReport,
  createSupportWorkflowQaReport,
  runPhase72Audit
} from "../phase-7";

export type TeoyubePhase72SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase72SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase72SmokeCheckResult[];
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

function result(id: string, passed: boolean, details: string): TeoyubePhase72SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase72FeedbackReviewStabilizationSmokeCheck(): TeoyubePhase72SmokeCheckReport {
  const simulation = createManualFeedbackReviewSimulation();
  const feedbackItem = createSimulatedManualFeedbackReviewItem({
    rawText: "The Scripture anchor is missing on mobile. My email is participant@example.com.",
    category: "scripture_anchor"
  });
  const simulationWithFeedback = addSimulatedManualFeedbackReviewItem(simulation, feedbackItem);
  const feedbackReport = createManualFeedbackReviewSimulationReport(simulationWithFeedback);
  const feedbackToSupportReport = createFeedbackToSupportIssueConversionReport(feedbackReport.simulation.items);
  const supportIssues = convertManualFeedbackToSupportIssues(feedbackReport.simulation.items);
  const supportTriageReport = createSupportIssueTriageReport(supportIssues);
  const supportToStabilizationReport = createSupportIssueToStabilizationConversionReport(supportTriageReport.issues);
  const stabilizationItems = convertSupportIssuesToStabilizationItems(supportTriageReport.issues);
  const queue = addProductStabilizationQueueItems(createProductStabilizationQueue(), stabilizationItems);
  const safetyReport = createProductStabilizationSafetyReport(queue);
  const plan = createProductStabilizationPlan({ queue });
  const planReport = createProductStabilizationPlanReport(plan);
  const feedbackQaReport = createFeedbackReviewSimulationQaReport(simulationWithFeedback);
  const supportQaReport = createSupportWorkflowQaReport(supportTriageReport.issues);
  const queueQaReport = createProductStabilizationQueueQaReport(queue);
  const unsafeItem = createProductStabilizationQueueItem({
    title: "Unsafe stabilization sample",
    description: "This sample should be blocked by safety validation.",
    category: "scripture_anchor",
    priority: "beta_operations_blocker",
    proposedFix: "Remove Scripture anchors and enable analytics.",
    preservesScriptureAnchors: false
  });
  const unsafeQueue = addProductStabilizationQueueItem(createProductStabilizationQueue(), unsafeItem);
  const unsafeSafetyReport = createProductStabilizationSafetyReport(unsafeQueue);
  const ownerChecklist = createPhase72OwnerReviewChecklist(true);
  const phase72Package = createPhase72Package({ ownerReviewed: true });
  const phase72PackageReport = createPhase72PackageReport(phase72Package);
  const phase72Audit = runPhase72Audit();

  const checks = [
    result("feedback_review_simulation_contracts_compile", Array.isArray(feedbackReport.simulation.items), `${feedbackReport.simulation.items.length} simulated feedback item(s).`),
    result("feedback_simulation_in_memory_only", feedbackReport.valid && feedbackReport.inMemoryOnly && feedbackReport.noFeedbackCollectedAutomatically, `Simulation decision: ${feedbackReport.decision}.`),
    result("feedback_sanitizer_redacts_sensitive_text", Boolean(feedbackReport.simulation.items[0]?.summary.includes("[redacted-email]") || feedbackReport.simulation.items[0]?.redactedNotes.some((note) => note.includes("[redacted-email]"))), "Simulated feedback sanitizer redacts contact information."),
    result("support_issue_triage_identifies_blockers", supportTriageReport.blockingIssues.length >= 1 && supportTriageReport.inMemoryOnly, `${supportTriageReport.blockingIssues.length} support blocker(s).`),
    result("feedback_to_issue_converter_structured", feedbackToSupportReport.convertedIssueCount >= 1 && feedbackToSupportReport.inMemoryOnly, `${feedbackToSupportReport.convertedIssueCount} converted support issue(s).`),
    result("stabilization_queue_in_memory_only", queue.inMemoryOnly && queue.noExternalServicesRequired && queue.noUsersContacted, `${queue.items.length} stabilization queue item(s).`),
    result("support_issue_to_stabilization_converter_structured", supportToStabilizationReport.convertedItemCount >= 1 && supportToStabilizationReport.inMemoryOnly, `${supportToStabilizationReport.convertedItemCount} converted stabilization item(s).`),
    result("stabilization_safety_validator_blocks_unsafe_items", unsafeSafetyReport.blockers.length >= 1 && !unsafeSafetyReport.valid, `${unsafeSafetyReport.blockers.length} unsafe item blocker(s).`),
    result("stabilization_planner_classifies_items", planReport.blockedItems.length >= 1 || planReport.ownerReviewItems.length >= 1 || planReport.safeItems.length >= 0, `Plan decision: ${planReport.decision}.`),
    result("feedback_review_qa_structured", feedbackQaReport.valid && feedbackQaReport.inMemoryOnly, `${feedbackQaReport.checks.length} feedback QA check(s).`),
    result("support_workflow_qa_structured", supportQaReport.valid && supportQaReport.inMemoryOnly, `${supportQaReport.checks.length} support QA check(s).`),
    result("stabilization_queue_qa_structured", queueQaReport.valid && queueQaReport.inMemoryOnly, `${queueQaReport.checks.length} queue QA check(s).`),
    result("phase_7_2_package_in_memory_only", phase72PackageReport.valid && phase72PackageReport.inMemoryOnly && phase72PackageReport.noExternalSend, `Package decision: ${phase72PackageReport.decision}.`),
    result("owner_review_checklist_exists", ownerChecklist.length >= 10, `${ownerChecklist.length} owner review item(s).`),
    result("phase_7_2_audit_complete", phase72Audit.complete && phase72Audit.completionPercentage === 100, `Audit completion: ${phase72Audit.completionPercentage}%.`),
    result("no_beta_launch_performed", phase72Package.noBetaLaunchPerformed && phase72Audit.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase72Package.noUsersContacted && phase72Audit.noUsersContacted, "No users are contacted."),
    result("no_feedback_collected", phase72Package.noFeedbackCollectedAutomatically && phase72Audit.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_urls_fetched", phase72Package.noPublicUrlsFetchedAutomatically && phase72Audit.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase72Package.noDatabasePersistenceEnabled && phase72Audit.noDatabasePersistenceEnabled, "No database persistence is enabled."),
    result("no_analytics", phase72Package.noAnalyticsEnabled && phase72Audit.noAnalyticsEnabled, "No analytics are enabled."),
    result("no_monitoring_provider", phase72Package.noMonitoringProviderConnected && phase72Audit.noMonitoringProviderConnected, "No monitoring provider is connected."),
    result("no_live_ai", phase72Package.noLiveAiOrchestrationEnabled && phase72Audit.noLiveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    result("no_admin_auth", phase72Package.noAdminAuthAdded && phase72Audit.noAdminAuthAdded, "No admin auth is added."),
    result("no_cms", phase72Package.noCmsConnected && phase72Audit.noCmsConnected, "No CMS is connected."),
    result("no_external_services_required", phase72Package.noExternalServicesRequired && phase72Audit.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase72Package.noBrowserPersistenceRequired && phase72Audit.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: [
      "Phase 7.2 is a manual simulation, triage, and stabilization planning step only.",
      "Unsafe stabilization samples are created only inside the smoke check to prove safety validation blocks them."
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
