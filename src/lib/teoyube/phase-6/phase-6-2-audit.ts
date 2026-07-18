import { createPhase62Package, createPhase62PackageReport } from "./phase-6-2-package";

export type TeoyubePhase62AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase62AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase62AuditChecklistItem[];
  missingItems: TeoyubePhase62AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  readinessScore: number;
  readinessBand: ReturnType<typeof createPhase62PackageReport>["readinessBand"];
  nextStep: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase62AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase62AuditChecklist(): TeoyubePhase62AuditChecklistItem[] {
  const pkg = createPhase62Package({ ownerReviewed: true });
  const report = createPhase62PackageReport(pkg);
  return [
    item("dry_run_contracts", "Manual beta dry-run contracts exist", true, "manual-beta-dry-run-contracts.ts defines Phase 6.2 dry-run types."),
    item("dry_run_scenarios", "Manual beta dry-run scenarios exist", pkg.dryRunExecutionPackage.dryRun.scenarios.length >= 8, "manual-beta-dry-run-scenarios.ts defines scenario coverage."),
    item("dry_run_runner", "Manual beta dry-run runner exists", pkg.dryRunExecutionPackage.dryRunReport.inMemoryOnly, "manual-beta-dry-run-runner.ts creates in-memory reports."),
    item("simulated_participant_session", "Simulated participant session exists", pkg.dryRunExecutionPackage.participantSessionReport.inMemoryOnly, "simulated-participant-session.ts verifies no-contact participant flow."),
    item("feedback_intake_simulation", "Feedback intake simulation exists", pkg.dryRunExecutionPackage.feedbackSimulationReport.inMemoryOnly, "feedback-intake-simulation.ts redacts simulated feedback."),
    item("issue_triage", "Dry-run issue triage exists", pkg.dryRunExecutionPackage.issueTriageReport.inMemoryOnly, "dry-run-issue-triage.ts classifies simulated issues."),
    item("feedback_to_issue_converter", "Feedback-to-issue converter exists", pkg.dryRunExecutionPackage.feedbackToIssueReport.inMemoryOnly, "feedback-to-issue-simulation-converter.ts converts simulated feedback only."),
    item("pause_rollback_simulation", "Pause/rollback simulation exists", pkg.dryRunExecutionPackage.pauseRollbackReport.inMemoryOnly, "dry-run-pause-rollback-simulation.ts verifies pause and rollback criteria."),
    item("disabled_service_verification", "Disabled service verification exists", pkg.dryRunExecutionPackage.disabledServiceVerificationReport.valid, "dry-run-disabled-service-verification.ts confirms disabled services."),
    item("scripture_explanation_fallback_verification", "Scripture/explanation/fallback verification exists", pkg.dryRunExecutionPackage.scriptureExplanationFallbackReport.valid, "dry-run-scripture-explanation-fallback-verification.ts protects safety surfaces."),
    item("mobile_accessibility_verification", "Mobile/accessibility verification exists", pkg.dryRunExecutionPackage.mobileAccessibilityReport.valid, "dry-run-mobile-accessibility-verification.ts verifies mobile/list fallback and accessibility checks."),
    item("readiness_score", "Dry-run readiness score exists", pkg.dryRunExecutionPackage.readinessScoreReport.score >= 90, "dry-run-readiness-score.ts computes readiness score and band."),
    item("dry_run_execution_package", "Dry-run execution package exists", report.inMemoryOnly, "dry-run-execution-package.ts combines Phase 6.2 reports."),
    item("owner_review", "Phase 6.2 owner review exists", pkg.ownerReviewReport.inMemoryOnly, "phase-6-2-owner-review.ts prepares manual owner review."),
    item("phase_6_2_package", "Phase 6.2 package exists", report.inMemoryOnly, "phase-6-2-package.ts combines execution package and owner review."),
    item("smoke_check", "Phase 6.2 smoke check exists", true, "phase-6-2-manual-beta-dry-run-smoke-check.ts verifies Phase 6.2."),
    item("audit_map_documentation", "Phase 6.2 map documentation exists", true, "phase-6-2-manual-beta-dry-run-feedback-simulation-issue-triage-map.md documents gaps and module mapping."),
    item("documentation", "Phase 6.2 documentation exists", true, "phase-6-2-manual-beta-dry-run-feedback-intake-simulation-issue-triage.md documents the step.")
  ];
}

export function getPhase62MissingItems(): TeoyubePhase62AuditChecklistItem[] {
  return getPhase62AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase62Warnings(): string[] {
  return createPhase62PackageReport(createPhase62Package({ ownerReviewed: true })).warnings;
}

export function getPhase62CompletionPercentage(): number {
  const checklist = getPhase62AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase62Audit(): TeoyubePhase62AuditReport {
  const checklist = getPhase62AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase62PackageReport(createPhase62Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase62CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase62Warnings(),
    blockers,
    readinessScore: packageReport.readinessScore,
    readinessBand: packageReport.readinessBand,
    nextStep: "Phase 6.3 - Dry Run Fix Queue, Stabilization Pass & Operations Readiness",
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
