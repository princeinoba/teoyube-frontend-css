import {
  createDryRunDisabledServiceVerificationReport,
  createDryRunExecutionPackage,
  createDryRunExecutionPackageReport,
  createDryRunIssue,
  createDryRunIssueTriageReport,
  createDryRunMobileAccessibilityReport,
  createDryRunPauseRollbackReport,
  createDryRunReadinessScoreReport,
  createDryRunScriptureExplanationFallbackReport,
  createFeedbackIntakeSimulation,
  createFeedbackIntakeSimulationReport,
  createFeedbackToIssueSimulationReport,
  createManualBetaDryRun,
  createManualBetaDryRunReport,
  createPhase62OwnerReviewChecklist,
  createPhase62Package,
  createPhase62PackageReport,
  createSimulatedFeedbackItem,
  createSimulatedParticipantSession,
  createSimulatedParticipantSessionReport,
  getManualBetaDryRunScenarios,
  runPhase62Audit
} from "../phase-6";

export type TeoyubePhase62SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase62SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase62SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  readinessScore: number;
  readinessBand: ReturnType<typeof createDryRunReadinessScoreReport>["band"];
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

function result(id: string, passed: boolean, details: string): TeoyubePhase62SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase62ManualBetaDryRunSmokeCheck(): TeoyubePhase62SmokeCheckReport {
  const scenarios = getManualBetaDryRunScenarios();
  const dryRun = createManualBetaDryRun({
    results: scenarios.map((scenario, index) => ({
      id: `smoke_dry_run_result_${index + 1}`,
      scenarioId: scenario.id,
      area: scenario.area,
      status: "passed",
      notes: "Smoke-check simulated step passed while staying manual and in-memory.",
      simulatedOnly: true,
      recordedAt: new Date().toISOString()
    }))
  });
  const dryRunReport = createManualBetaDryRunReport(dryRun);
  const participantSession = createSimulatedParticipantSession({
    observations: [{
      id: "smoke_simulated_participant_observation",
      surface: "manual_beta_dry_run",
      note: "Smoke check confirms simulated participant boundaries and visible safety notices.",
      sanitized: true,
      recordedByOwner: true,
      simulatedOnly: true,
      createdAt: new Date().toISOString()
    }]
  });
  const participantSessionReport = createSimulatedParticipantSessionReport(participantSession);
  const feedbackItem = createSimulatedFeedbackItem({
    id: "smoke_feedback_positive",
    category: "positive_feedback",
    note: "Simulated owner note: dry-run instructions are understandable."
  });
  const feedbackSimulation = createFeedbackIntakeSimulation({ items: [feedbackItem] });
  const feedbackSimulationReport = createFeedbackIntakeSimulationReport(feedbackSimulation);
  const feedbackToIssueReport = createFeedbackToIssueSimulationReport(feedbackSimulation.items);
  const sampleIssue = createDryRunIssue({
    id: "smoke_content_clarity_issue",
    title: "Smoke content clarity issue",
    description: "Manual owner review should clarify a dry-run note.",
    category: "content_clarity",
    source: "owner_observation"
  });
  const issueTriageReport = createDryRunIssueTriageReport([sampleIssue]);
  const pauseRollbackReport = createDryRunPauseRollbackReport([]);
  const disabledServiceVerificationReport = createDryRunDisabledServiceVerificationReport();
  const scriptureExplanationFallbackReport = createDryRunScriptureExplanationFallbackReport();
  const mobileAccessibilityReport = createDryRunMobileAccessibilityReport();
  const readinessScoreReport = createDryRunReadinessScoreReport();
  const dryRunExecutionPackage = createDryRunExecutionPackage();
  const dryRunExecutionPackageReport = createDryRunExecutionPackageReport(dryRunExecutionPackage);
  const ownerReviewChecklist = createPhase62OwnerReviewChecklist();
  const phase62Package = createPhase62Package({ ownerReviewed: true });
  const phase62PackageReport = createPhase62PackageReport(phase62Package);
  const audit = runPhase62Audit();

  const checks = [
    result("dry_run_scenarios_structured", scenarios.length >= 8, `${scenarios.length} dry-run scenario(s) generated.`),
    result("dry_run_runner_manual_only", dryRunReport.valid && dryRunReport.manualOnly && dryRunReport.noBetaLaunchPerformed, `Dry-run decision: ${dryRunReport.decision}.`),
    result("simulated_participant_no_contact", participantSessionReport.valid && participantSessionReport.noUsersContacted && participantSessionReport.noPersistence, "Simulated participant session stores no identity and contacts nobody."),
    result("feedback_intake_manual_only", feedbackSimulationReport.valid && feedbackSimulationReport.noAutomaticCollection && feedbackSimulationReport.noDatabaseStorage, "Feedback intake simulation remains manual and in-memory."),
    result("feedback_to_issue_structured", feedbackToIssueReport.valid && feedbackToIssueReport.noAutomaticCollection && feedbackToIssueReport.inMemoryOnly, `${feedbackToIssueReport.issueCount} issue(s) created from positive feedback.`),
    result("issue_triage_structured", issueTriageReport.valid && issueTriageReport.manualOnly && issueTriageReport.inMemoryOnly, `Issue triage decision: ${issueTriageReport.decision}.`),
    result("pause_rollback_safe", pauseRollbackReport.valid && pauseRollbackReport.manualOnly && pauseRollbackReport.noUsersContacted, `Pause/rollback decision: ${pauseRollbackReport.decision}.`),
    result("disabled_services_verified", disabledServiceVerificationReport.valid && disabledServiceVerificationReport.enabledServiceCount === 0, `${disabledServiceVerificationReport.disabledServiceCount} disabled service check(s) passed.`),
    result("scripture_explanation_fallback_verified", scriptureExplanationFallbackReport.valid && scriptureExplanationFallbackReport.scriptureAnchorsPreserved && scriptureExplanationFallbackReport.explanationPathsPreserved && scriptureExplanationFallbackReport.fallbackSafetyPreserved, "Scripture, explanation, and fallback protections remain visible."),
    result("mobile_accessibility_verified", mobileAccessibilityReport.valid && mobileAccessibilityReport.mobileSafe && mobileAccessibilityReport.accessibilitySafe, "Mobile/accessibility dry-run checks are structured."),
    result("readiness_score_structured", readinessScoreReport.valid && readinessScoreReport.score >= 90, `Readiness score: ${readinessScoreReport.score}; band: ${readinessScoreReport.band}.`),
    result("dry_run_execution_package_in_memory", dryRunExecutionPackageReport.valid && dryRunExecutionPackageReport.inMemoryOnly && dryRunExecutionPackageReport.noExternalServicesRequired, `Execution package decision: ${dryRunExecutionPackageReport.decision}.`),
    result("owner_review_checklist_exists", ownerReviewChecklist.length >= 10, `${ownerReviewChecklist.length} owner review item(s) generated.`),
    result("phase_6_2_package_in_memory", phase62PackageReport.valid && phase62PackageReport.inMemoryOnly && phase62PackageReport.noExternalSend, `Phase 6.2 package decision: ${phase62PackageReport.decision}.`),
    result("phase_6_2_audit_complete", audit.complete && audit.completionPercentage === 100, `Audit completion: ${audit.completionPercentage}%.`),
    result("no_beta_launch_performed", phase62Package.noBetaLaunchPerformed && audit.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase62Package.noUsersContacted && audit.noUsersContacted, "No users are contacted."),
    result("no_feedback_collected", phase62Package.noFeedbackCollectedAutomatically && audit.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_urls_fetched", phase62Package.noPublicUrlsFetchedAutomatically && audit.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase62Package.noDatabasePersistenceEnabled && audit.noDatabasePersistenceEnabled, "No database persistence is enabled."),
    result("no_analytics", phase62Package.noAnalyticsEnabled && audit.noAnalyticsEnabled, "No analytics are enabled."),
    result("no_monitoring_provider", phase62Package.noMonitoringProviderConnected && audit.noMonitoringProviderConnected, "No monitoring provider is connected."),
    result("no_live_ai", phase62Package.noLiveAiOrchestrationEnabled && audit.noLiveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    result("no_admin_auth", phase62Package.noAdminAuthAdded && audit.noAdminAuthAdded, "No admin auth is added."),
    result("no_cms", phase62Package.noCmsConnected && audit.noCmsConnected, "No CMS is connected."),
    result("no_external_services_required", phase62Package.noExternalServicesRequired && audit.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase62Package.noBrowserPersistenceRequired && audit.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: [
      "Phase 6.2 is a manual dry-run simulation and does not launch beta.",
      "Mobile/accessibility warnings are owner-review reminders, not telemetry."
    ],
    readinessScore: readinessScoreReport.score,
    readinessBand: readinessScoreReport.band,
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
