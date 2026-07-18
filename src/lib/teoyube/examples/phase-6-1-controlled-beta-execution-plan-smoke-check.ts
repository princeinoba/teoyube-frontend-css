import {
  createBetaOperationsChecklistReport,
  createBetaPrivacyConsentBoundaryReport,
  createBetaSafetyTheologyBoundaryReport,
  createBetaServiceDisabledBoundaryReport,
  createControlledBetaExecutionPackage,
  createControlledBetaExecutionPackageReport,
  createControlledBetaExecutionPlan,
  createControlledBetaExecutionReport,
  createControlledBetaIssueIntakeReport,
  createManualBetaCommunicationBoundaryReport,
  createManualFeedbackBoundaryReport,
  createManualParticipantWorkflowReport,
  createPhase61OwnerReviewChecklist,
  createPhase61Package,
  createPhase61PackageReport,
  runPhase61Audit
} from "../phase-6";

export type TeoyubePhase61SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase61SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase61SmokeCheckResult[];
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

function result(id: string, passed: boolean, details: string): TeoyubePhase61SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase61ControlledBetaExecutionPlanSmokeCheck(): TeoyubePhase61SmokeCheckReport {
  const executionPlan = createControlledBetaExecutionPlan();
  const executionReport = createControlledBetaExecutionReport(executionPlan);
  const participantWorkflow = createManualParticipantWorkflowReport({ ownerReviewed: true });
  const communicationBoundary = createManualBetaCommunicationBoundaryReport();
  const feedbackBoundary = createManualFeedbackBoundaryReport();
  const issueIntake = createControlledBetaIssueIntakeReport();
  const operationsChecklist = createBetaOperationsChecklistReport();
  const safetyTheology = createBetaSafetyTheologyBoundaryReport();
  const privacyConsent = createBetaPrivacyConsentBoundaryReport();
  const serviceDisabled = createBetaServiceDisabledBoundaryReport();
  const executionPackage = createControlledBetaExecutionPackage({ participantWorkflowInput: { ownerReviewed: true } });
  const executionPackageReport = createControlledBetaExecutionPackageReport(executionPackage);
  const ownerChecklist = createPhase61OwnerReviewChecklist();
  const phase61Package = createPhase61Package({
    controlledBetaExecutionPackage: executionPackage,
    ownerReviewed: true
  });
  const phase61PackageReport = createPhase61PackageReport(phase61Package);
  const audit = runPhase61Audit();

  const checks = [
    result("phase_6_contracts_compile", executionReport.plan.checks.length >= 15, `${executionReport.plan.checks.length} execution plan check(s) generated.`),
    result("execution_plan_structured", executionReport.valid && executionReport.inMemoryOnly, `Execution decision: ${executionReport.decision}.`),
    result("participant_workflow_manual_only", participantWorkflow.valid && participantWorkflow.noAutomaticContact && participantWorkflow.noAutomaticInvitation, "Participant workflow does not contact users."),
    result("communication_drafts_not_sent", communicationBoundary.valid && communicationBoundary.draftsAreNotSentByCode, "Communication drafts are plain text and not sent by code."),
    result("feedback_collects_nothing_automatically", feedbackBoundary.valid && feedbackBoundary.noAutomaticCollection, "Feedback boundaries collect nothing automatically."),
    result("issue_intake_manual_only", issueIntake.valid && issueIntake.manualOnly && issueIntake.noAutomaticCollection, "Issue intake is manual only."),
    result("operations_checklist_structured", operationsChecklist.valid && operationsChecklist.checklist.length >= 20, `${operationsChecklist.checklist.length} operations item(s) generated.`),
    result("safety_theology_preserved", safetyTheology.valid && safetyTheology.scriptureAnchorsVisible && safetyTheology.explanationTracesVisible && safetyTheology.fallbackSafe && safetyTheology.confidenceLabelsHumble, "Scripture, explanation, fallback, and confidence boundaries are preserved."),
    result("privacy_consent_preserved", privacyConsent.valid && privacyConsent.privacyNoticeVisible && privacyConsent.consentBoundaryVisible && privacyConsent.noHiddenPersonalization, "Privacy, consent, and no hidden personalization boundaries are preserved."),
    result("services_disabled", serviceDisabled.valid && serviceDisabled.databasePersistenceDisabled && serviceDisabled.analyticsDisabled && serviceDisabled.liveAiDisabled, "Service-disabled boundaries remain locked."),
    result("execution_package_in_memory", executionPackage.inMemoryOnly && executionPackageReport.inMemoryOnly, `Execution package decision: ${executionPackageReport.decision}.`),
    result("owner_review_checklist_exists", ownerChecklist.length >= 10, `${ownerChecklist.length} owner review item(s) generated.`),
    result("phase_6_1_package_in_memory", phase61Package.inMemoryOnly && phase61PackageReport.inMemoryOnly, `Phase 6.1 package decision: ${phase61PackageReport.decision}.`),
    result("phase_6_1_audit_structured", audit.complete && audit.completionPercentage === 100, `Audit completion: ${audit.completionPercentage}%.`),
    result("no_beta_launch_performed", phase61Package.noBetaLaunchPerformed && audit.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase61Package.noUsersContacted && audit.noUsersContacted, "No users are contacted."),
    result("no_feedback_collected", phase61Package.noFeedbackCollectedAutomatically && audit.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_urls_fetched", phase61Package.noPublicUrlsFetchedAutomatically && audit.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase61Package.noDatabasePersistenceEnabled && audit.noDatabasePersistenceEnabled, "No database persistence is enabled."),
    result("no_analytics", phase61Package.noAnalyticsEnabled && audit.noAnalyticsEnabled, "No analytics are enabled."),
    result("no_monitoring_provider", phase61Package.noMonitoringProviderConnected && audit.noMonitoringProviderConnected, "No monitoring provider is connected."),
    result("no_live_ai", phase61Package.noLiveAiOrchestrationEnabled && audit.noLiveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    result("no_admin_auth", phase61Package.noAdminAuthAdded && audit.noAdminAuthAdded, "No admin auth is added."),
    result("no_cms", phase61Package.noCmsConnected && audit.noCmsConnected, "No CMS is connected."),
    result("no_external_services_required", phase61Package.noExternalServicesRequired && audit.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence_required", phase61Package.noBrowserPersistenceRequired && audit.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: [
      "Phase 6.1 is planning only and does not run a beta.",
      "Phase 6.2 remains a manual dry-run simulation step, not a launch."
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

