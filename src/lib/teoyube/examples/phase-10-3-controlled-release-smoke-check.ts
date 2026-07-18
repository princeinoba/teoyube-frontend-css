import {
  classifyLaunchIssue,
  createFirstHourMonitoringChecklist,
  createLaunchDecisionLog,
  createLaunchDecisionLogEntry,
  createLaunchDecisionLogReport,
  createPhase103ReleasePackage,
  createPhase103ReleasePackageReport,
  createRollbackReadinessRecord,
  createRollbackReadinessReport,
  createSafeFixApprovalReport,
  createSafeFixApprovalRequest,
  createControlledPublicReleaseExecutionChecklist,
  recordLaunchDecision,
  runPhase103Audit
} from "../phase-10";

export type TeoyubePhase103SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase103SmokeCheckReport = {
  valid: boolean;
  results: TeoyubePhase103SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  nextAction: "Fix build/runtime blockers before Phase 10.4.";
  noPublicLaunchPerformedByCode: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function result(id: string, passed: boolean, details: string): TeoyubePhase103SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase103ControlledReleaseSmokeCheck(): TeoyubePhase103SmokeCheckReport {
  const executionChecklist = createControlledPublicReleaseExecutionChecklist();
  const firstHourChecklist = createFirstHourMonitoringChecklist();
  const severity1 = classifyLaunchIssue({ appDoesNotLoad: true, summary: "App does not load." });
  const severity2 = classifyLaunchIssue({ tigResponsePanelFails: true, summary: "TIG response panel fails." });
  const severity3 = classifyLaunchIssue({ typo: true, summary: "Typo on one card." });
  const severity4 = classifyLaunchIssue({ cosmeticIssue: true, summary: "Cosmetic polish request." });
  const log = recordLaunchDecision(createLaunchDecisionLog(), createLaunchDecisionLogEntry({
    decisionType: "continue_with_warnings",
    releaseOwner: "manual_owner",
    decisionReason: "minor_warnings_only",
    summary: "Continue watching first-hour issues manually.",
    actionTaken: "No automated action taken.",
    followUpRequired: true
  }));
  const decisionLogReport = createLaunchDecisionLogReport(log);
  const rollbackReport = createRollbackReadinessReport(createRollbackReadinessRecord({
    previousStableDeploymentIdentified: true,
    lastKnownStableCommitIdentified: true,
    rollbackMethodUnderstood: true,
    releaseOwnerCanPauseRelease: true,
    releaseOwnerCanCommunicatePauseManually: true,
    criticalIssueCriteriaReviewed: true,
    secretPrivateDataExposureRollbackRuleReviewed: true,
    rollbackDecisionCanBeLogged: true,
    noAutomatedRollbackIntroduced: true
  }));
  const unsafeFix = createSafeFixApprovalReport(createSafeFixApprovalRequest({
    ownerApproved: true,
    scriptureAnchorsPreserved: false,
    proposedFix: "Unsafe example fix for smoke validation only."
  }));
  const phase103Package = createPhase103ReleasePackage();
  const phase103PackageReport = createPhase103ReleasePackageReport(phase103Package);
  const audit = runPhase103Audit();

  const results = [
    result("execution_checklist", executionChecklist.length >= 20, "Controlled release execution checklist can be created."),
    result("first_hour_checklist", firstHourChecklist.length >= 16, "First-hour monitoring checklist can be created."),
    result("severity_1", severity1.severity === "severity_1_critical" && (severity1.decision === "rollback" || severity1.decision === "pause"), "Severity 1 issue pauses or rolls back."),
    result("severity_2", severity2.severity === "severity_2_high" && severity2.decision === "fix_before_continue", "Severity 2 issue requires fix before continuing."),
    result("severity_3", severity3.severity === "severity_3_medium" && severity3.decision === "defer_to_stabilization", "Severity 3 issue goes to stabilization."),
    result("severity_4", severity4.severity === "severity_4_low" && severity4.decision === "defer_to_stabilization", "Severity 4 issue goes to backlog/stabilization."),
    result("decision_log", decisionLogReport.valid && Boolean(decisionLogReport.latestDecision), "Launch decision log can record decisions."),
    result("rollback_readiness", rollbackReport.valid && rollbackReport.noRollbackPerformed, "Rollback readiness can be validated without performing rollback."),
    result("unsafe_fix_blocked", !unsafeFix.valid && unsafeFix.blockers.length > 0, "Safe fix approval blocks unsafe fixes."),
    result("phase_10_3_package", phase103PackageReport.decision === "blocked_by_build_or_release_precheck", "Phase 10.3 package surfaces the current build/runtime precheck blocker."),
    result("phase_10_3_audit", audit.complete && audit.completionPercentage === 100, "Phase 10.3 audit returns structured structural completion."),
    result("no_public_url_fetching", phase103Package.noPublicUrlsFetchedAutomatically, "No public URL fetching is required."),
    result("no_external_services", phase103Package.noExternalServicesRequired, "No external service connection is required.")
  ];
  const blockers = results.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  return {
    valid: blockers.length === 0,
    results,
    blockers,
    warnings: phase103PackageReport.warnings,
    nextAction: "Fix build/runtime blockers before Phase 10.4.",
    noPublicLaunchPerformedByCode: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
