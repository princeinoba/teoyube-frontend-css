import {
  createControlledPublicGoNoGoReport,
  createFinalPublicKnownLimitationsReport,
  createFinalPublicOwnerApprovalChecklist,
  createPhase94Package,
  createPhase94PackageReport,
  createPublicGoNoGoReadinessPackage,
  createPublicGoNoGoReadinessPackageReport,
  createPublicOperationalHandoffReport,
  createPublicReadinessEvidenceReport,
  createPublicReleaseBoundaryFinalReport,
  createPublicReleasePauseRollbackReport,
  createPublicServiceDisabledFinalConfirmationReport,
  runPhase94Audit
} from "../phase-9";

export type TeoyubePhase94SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase94SmokeCheckReport = {
  valid: boolean;
  results: TeoyubePhase94SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  controlledPublicGoNoGoDecision: string;
  phase94PackageDecision: string;
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function result(id: string, passed: boolean, details: string): TeoyubePhase94SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase94ControlledPublicGoNoGoSmokeCheck(): TeoyubePhase94SmokeCheckReport {
  const controlledPublicGoNoGoReport = createControlledPublicGoNoGoReport({ finalOwnerApproved: true });
  const blockedBoundaryFlag = Boolean("blocked-boundary-smoke-check");
  const blockedBoundaryReport = createPublicReleaseBoundaryFinalReport({
    publicLaunchFromCode: blockedBoundaryFlag,
    automaticUserContactEnabled: blockedBoundaryFlag,
    automaticFeedbackCollectionEnabled: blockedBoundaryFlag,
    automaticPublicUrlFetchingEnabled: blockedBoundaryFlag
  });
  const publicReadinessEvidenceReport = createPublicReadinessEvidenceReport();
  const finalOwnerApprovalChecklist = createFinalPublicOwnerApprovalChecklist(true);
  const operationalHandoffReport = createPublicOperationalHandoffReport();
  const pauseRollbackReport = createPublicReleasePauseRollbackReport();
  const knownLimitationsReport = createFinalPublicKnownLimitationsReport();
  const serviceDisabledReport = createPublicServiceDisabledFinalConfirmationReport();
  const publicGoNoGoReadinessPackage = createPublicGoNoGoReadinessPackage({ ownerReviewed: true });
  const publicGoNoGoReadinessPackageReport = createPublicGoNoGoReadinessPackageReport(publicGoNoGoReadinessPackage);
  const phase94Package = createPhase94Package({ ownerReviewed: true, publicGoNoGoReadinessPackage });
  const phase94PackageReport = createPhase94PackageReport(phase94Package);
  const phase94Audit = runPhase94Audit();

  const results = [
    result("go_no_go_contracts_compile", Boolean(controlledPublicGoNoGoReport.decision), `Go/no-go decision: ${controlledPublicGoNoGoReport.decision}.`),
    result("go_no_go_structured_report", controlledPublicGoNoGoReport.inMemoryOnly && Array.isArray(controlledPublicGoNoGoReport.checks), "Go/no-go report is structured and in-memory."),
    result("readiness_evidence_summary", publicReadinessEvidenceReport.inMemoryOnly && publicReadinessEvidenceReport.evidence.length > 0, "Readiness evidence summary returns structured evidence."),
    result("boundary_blocks_launch_contact_feedback_fetch", blockedBoundaryReport.blockers.length >= 4 && blockedBoundaryReport.decision === "release_boundary_blocked", "Boundary confirmation blocks launch, contact, feedback collection, and public URL fetching."),
    result("final_owner_approval_checklist", finalOwnerApprovalChecklist.length > 0, "Final owner approval checklist exists."),
    result("operational_handoff_no_external_action", operationalHandoffReport.noUsersContacted && operationalHandoffReport.noSchedulingPerformed && operationalHandoffReport.noNotificationsSent, "Operational handoff performs no external action."),
    result("pause_rollback_no_rollback", pauseRollbackReport.noRollbackPerformed && pauseRollbackReport.inMemoryOnly, "Pause/rollback criteria performs no rollback."),
    result("known_limitations_generated", knownLimitationsReport.valid && knownLimitationsReport.limitations.length >= 10, "Known limitations are generated."),
    result("services_remain_disabled", serviceDisabledReport.valid && serviceDisabledReport.noDatabasePersistenceEnabled && serviceDisabledReport.noAnalyticsEnabled && serviceDisabledReport.noLiveAiOrchestrationEnabled, "Service-disabled confirmation keeps services disabled."),
    result("go_no_go_package_in_memory", publicGoNoGoReadinessPackageReport.inMemoryOnly && publicGoNoGoReadinessPackage.noExternalSend, "Public go/no-go package is in-memory only."),
    result("phase_9_4_package_in_memory", phase94PackageReport.inMemoryOnly && phase94Package.noExternalSend, "Phase 9.4 package is in-memory only."),
    result("phase_9_4_audit", phase94Audit.complete && phase94Audit.completionPercentage === 100, "Phase 9.4 audit returns complete structured report."),
    result("no_public_launch", phase94Package.noPublicLaunchPerformed, "No public launch is performed."),
    result("no_beta_launch", phase94Package.noBetaLaunchPerformed, "No beta launch is performed."),
    result("no_users_contacted", phase94Package.noUsersContacted, "No users are contacted."),
    result("no_feedback_collected_automatically", phase94Package.noFeedbackCollectedAutomatically, "No feedback is collected automatically."),
    result("no_public_urls_fetched", phase94Package.noPublicUrlsFetchedAutomatically, "No public URLs are fetched automatically."),
    result("no_database_persistence", phase94Package.noDatabasePersistenceEnabled, "No database persistence is enabled."),
    result("no_analytics", phase94Package.noAnalyticsEnabled, "No analytics are enabled."),
    result("no_monitoring_provider", phase94Package.noMonitoringProviderConnected, "No monitoring provider is connected."),
    result("no_live_ai", phase94Package.noLiveAiOrchestrationEnabled, "No live AI orchestration is enabled."),
    result("no_admin_auth", phase94Package.noAdminAuthAdded, "No admin auth is added."),
    result("no_cms", phase94Package.noCmsConnected, "No CMS is connected."),
    result("no_external_services", phase94Package.noExternalServicesRequired, "No external services are required."),
    result("no_browser_persistence", phase94Package.noBrowserPersistenceRequired, "No localStorage, cookies, or IndexedDB are required.")
  ];
  const blockers = results.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings: [
      ...controlledPublicGoNoGoReport.warnings.map((entry) => entry.message),
      ...phase94PackageReport.warnings
    ],
    controlledPublicGoNoGoDecision: controlledPublicGoNoGoReport.decision,
    phase94PackageDecision: phase94PackageReport.decision,
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
