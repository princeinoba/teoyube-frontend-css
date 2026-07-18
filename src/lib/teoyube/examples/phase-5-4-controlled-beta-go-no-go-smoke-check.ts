import {
  createBetaLaunchBoundaryReport,
  createBetaOperationalHandoff,
  createBetaOperationalHandoffReport,
  createBetaReadinessEvidenceReport,
  createControlledBetaGoNoGoChecklist,
  createControlledBetaGoNoGoReport,
  createControlledBetaKnownLimitationsReport,
  createControlledBetaOwnerApprovalChecklist,
  createControlledBetaOwnerApprovalRecord,
  createControlledBetaPauseRollbackReport,
  createControlledBetaReadinessPackage,
  createControlledBetaReadinessPackageReport,
  createPhase54OwnerReviewChecklist,
  createPhase54Package,
  createPhase54PackageReport,
  runPhase54Audit
} from "../phase-5";

export type TeoyubePhase54SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase54SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase54SmokeCheckResult[];
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

function result(id: string, passed: boolean, details: string): TeoyubePhase54SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase54ControlledBetaGoNoGoSmokeCheck(): TeoyubePhase54SmokeCheckReport {
  const goNoGoChecklist = createControlledBetaGoNoGoChecklist();
  const goNoGoReport = createControlledBetaGoNoGoReport();
  const evidenceReport = createBetaReadinessEvidenceReport();
  const boundaryReport = createBetaLaunchBoundaryReport();
  const boundaryViolationReport = createBetaLaunchBoundaryReport({
    automaticBetaLaunchEnabled: true,
    automaticUserContactEnabled: true,
    automaticFeedbackCollectionEnabled: true
  });
  const ownerApprovalChecklist = createControlledBetaOwnerApprovalChecklist();
  const ownerApprovalRecord = createControlledBetaOwnerApprovalRecord();
  const operationalHandoff = createBetaOperationalHandoff({ ownerApprovalRecord });
  const operationalHandoffReport = createBetaOperationalHandoffReport({ ownerApprovalRecord });
  const pauseRollbackReport = createControlledBetaPauseRollbackReport({
    unsafe_fallback: true
  });
  const knownLimitationsReport = createControlledBetaKnownLimitationsReport();
  const readinessPackage = createControlledBetaReadinessPackage({ ownerApprovalRecord });
  const readinessPackageReport = createControlledBetaReadinessPackageReport(readinessPackage);
  const phase54OwnerChecklist = createPhase54OwnerReviewChecklist();
  const phase54Package = createPhase54Package({ controlledBetaReadinessPackage: readinessPackage });
  const phase54PackageReport = createPhase54PackageReport(phase54Package);
  const audit = runPhase54Audit();

  const checks = [
    result("go_no_go_contracts_compile", goNoGoChecklist.length >= 20, `${goNoGoChecklist.length} go/no-go check(s) generated.`),
    result("go_no_go_structured_report", goNoGoReport.checks.length === goNoGoChecklist.length && goNoGoReport.inMemoryOnly, `Decision: ${goNoGoReport.decision}.`),
    result("evidence_summary_structured_report", evidenceReport.summary.preparationEvidence.length > 0 && evidenceReport.inMemoryOnly, "Evidence summary returned structured evidence."),
    result("boundary_validator_blocks_automatic_actions", boundaryViolationReport.blockers.length >= 3, `${boundaryViolationReport.blockers.length} boundary blocker(s) detected for automatic launch/contact/feedback.`),
    result("default_boundary_validator_clear", boundaryReport.valid && boundaryReport.noBetaLaunchPerformed && boundaryReport.noUsersContacted, "Default boundary report remains preparation-only."),
    result("owner_approval_checklist_exists", ownerApprovalChecklist.length >= 18, `${ownerApprovalChecklist.length} owner approval item(s) generated.`),
    result("operational_handoff_no_external_action", operationalHandoff.noBetaLaunchPerformed && operationalHandoff.noUsersContacted && operationalHandoff.noNotificationsSent, "Operational handoff performs no external action."),
    result("operational_handoff_report_structured", operationalHandoffReport.items.length >= 10 && operationalHandoffReport.inMemoryOnly, "Operational handoff report is structured."),
    result("pause_rollback_no_execution", pauseRollbackReport.pauseRecommended && pauseRollbackReport.noPausePerformed && pauseRollbackReport.noRollbackPerformed, "Pause/rollback report recommends review without executing rollback."),
    result("known_limitations_generated", knownLimitationsReport.limitations.length >= 10, `${knownLimitationsReport.limitations.length} known limitation(s) generated.`),
    result("readiness_package_in_memory_only", readinessPackage.inMemoryOnly && readinessPackageReport.inMemoryOnly, `Readiness package decision: ${readinessPackageReport.decision}.`),
    result("phase_5_4_owner_review_checklist_exists", phase54OwnerChecklist.length >= 9, `${phase54OwnerChecklist.length} Phase 5.4 owner review item(s) generated.`),
    result("phase_5_4_package_in_memory_only", phase54Package.inMemoryOnly && phase54PackageReport.inMemoryOnly, `Phase 5.4 package decision: ${phase54PackageReport.decision}.`),
    result("phase_5_4_audit_structured", audit.complete && audit.completionPercentage === 100, `Audit completion: ${audit.completionPercentage}%.`),
    result("no_beta_launch_performed", goNoGoReport.noBetaLaunchPerformed && readinessPackage.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", goNoGoReport.noUsersContacted && readinessPackage.noUsersContacted, "No users are contacted."),
    result("no_feedback_collected", goNoGoReport.noFeedbackCollectedAutomatically && readinessPackage.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_urls_fetched", goNoGoReport.noPublicUrlsFetchedAutomatically && readinessPackage.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("services_disabled", readinessPackage.noDatabasePersistenceEnabled && readinessPackage.noAnalyticsEnabled && readinessPackage.noMonitoringProviderConnected && readinessPackage.noLiveAiOrchestrationEnabled, "Database, analytics, monitoring, and live AI remain disabled."),
    result("admin_cms_disabled", readinessPackage.noAdminAuthAdded && readinessPackage.noCmsConnected, "Admin auth and CMS remain disconnected."),
    result("no_browser_persistence_required", readinessPackage.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings: [
      "Default Phase 5.4 owner approval remains pending until manually accepted.",
      "The smoke check intentionally triggers pause criteria and boundary violation examples to verify blocking behavior."
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
