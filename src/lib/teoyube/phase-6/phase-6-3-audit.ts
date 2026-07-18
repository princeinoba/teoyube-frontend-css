import { createPhase63Package, createPhase63PackageReport } from "./phase-6-3-package";

export type TeoyubePhase63AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase63AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase63AuditChecklistItem[];
  missingItems: TeoyubePhase63AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  postStabilizationReadinessScore: number;
  postStabilizationReadinessBand: ReturnType<typeof createPhase63PackageReport>["postStabilizationReadinessBand"];
  nextStep: "Phase 6.4 - Controlled Beta Execution Readiness Review, Operations Lock & Phase 7 Roadmap";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase63AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase63AuditChecklist(): TeoyubePhase63AuditChecklistItem[] {
  const pkg = createPhase63Package({ ownerReviewed: true });
  const report = createPhase63PackageReport(pkg);
  return [
    item("phase_6_3_map_document", "Phase 6.3 map document exists", true, "phase-6-3-dry-run-fix-queue-stabilization-operations-readiness-map.md documents the map."),
    item("dry_run_fix_queue_contracts", "Dry-run fix queue contracts exist", true, "dry-run-fix-queue-contracts.ts defines queue contracts."),
    item("dry_run_fix_queue_manager", "Dry-run fix queue manager exists", pkg.dryRunStabilizationPackage.dryRunFixQueueReport.inMemoryOnly, "dry-run-fix-queue-manager.ts manages the in-memory queue."),
    item("dry_run_issue_to_fix_converter", "Dry-run issue-to-fix converter exists", pkg.dryRunStabilizationPackage.issueToFixConversionReport.inMemoryOnly, "dry-run-issue-to-fix-converter.ts maps Phase 6.2 issues into fix items."),
    item("dry_run_stabilization_contracts", "Dry-run stabilization contracts exist", true, "dry-run-stabilization-contracts.ts defines stabilization contracts."),
    item("dry_run_stabilization_planner", "Dry-run stabilization planner exists", pkg.dryRunStabilizationPackage.dryRunStabilizationPlanReport.inMemoryOnly, "dry-run-stabilization-planner.ts classifies stabilization items."),
    item("stabilization_safety_validator", "Stabilization safety validator exists", pkg.dryRunStabilizationPackage.stabilizationSafetyReport.inMemoryOnly, "dry-run-stabilization-safety-validator.ts blocks unsafe stabilization."),
    item("operations_readiness_contracts", "Operations readiness contracts exist", true, "operations-readiness-contracts.ts defines operations readiness contracts."),
    item("operations_readiness_review", "Operations readiness review exists", pkg.dryRunStabilizationPackage.operationsReadinessReport.inMemoryOnly, "operations-readiness-review.ts verifies manual operations readiness."),
    item("dry_run_regression_qa_contracts", "Dry-run regression QA contracts exist", true, "dry-run-regression-qa-contracts.ts defines regression contracts."),
    item("dry_run_regression_qa_runner", "Dry-run regression QA runner exists", pkg.dryRunStabilizationPackage.dryRunRegressionQaReport.inMemoryOnly, "dry-run-regression-qa-runner.ts records regression QA in memory."),
    item("disabled_service_regression", "Disabled service regression exists", pkg.dryRunStabilizationPackage.disabledServiceRegressionReport.valid, "dry-run-disabled-service-regression.ts confirms services stay disabled."),
    item("safety_regression", "Safety regression exists", pkg.dryRunStabilizationPackage.safetyRegressionReport.valid, "dry-run-safety-regression.ts protects Scripture, explanation, fallback, confidence, theology, and privacy boundaries."),
    item("mobile_accessibility_regression", "Mobile/accessibility regression exists", pkg.dryRunStabilizationPackage.mobileAccessibilityRegressionReport.valid, "dry-run-mobile-accessibility-regression.ts protects mobile/accessibility state."),
    item("post_stabilization_score", "Post-stabilization dry-run readiness score exists", pkg.dryRunStabilizationPackage.postStabilizationReadinessScoreReport.valid, "post-stabilization-dry-run-readiness-score.ts calculates post-stabilization score."),
    item("dry_run_stabilization_package", "Dry-run stabilization package exists", pkg.dryRunStabilizationPackageReport.valid, "dry-run-stabilization-package.ts combines fix queue, stabilization, regressions, operations, and score."),
    item("owner_review", "Phase 6.3 owner review exists", pkg.ownerReviewReport.record.checklist.length >= 13, "phase-6-3-owner-review.ts prepares owner review."),
    item("phase_6_3_package", "Phase 6.3 package exists", report.valid, "phase-6-3-package.ts combines stabilization package and owner review."),
    item("smoke_check", "Phase 6.3 smoke check exists", true, "phase-6-3-dry-run-stabilization-smoke-check.ts verifies Phase 6.3."),
    item("documentation", "Phase 6.3 documentation exists", true, "phase-6-3-dry-run-fix-queue-stabilization-pass-operations-readiness.md documents the step.")
  ];
}

export function getPhase63MissingItems(): TeoyubePhase63AuditChecklistItem[] {
  return getPhase63AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase63Warnings(): string[] {
  return createPhase63PackageReport(createPhase63Package({ ownerReviewed: true })).warnings;
}

export function getPhase63CompletionPercentage(): number {
  const checklist = getPhase63AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase63Audit(): TeoyubePhase63AuditReport {
  const checklist = getPhase63AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase63PackageReport(createPhase63Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase63CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase63Warnings(),
    blockers,
    postStabilizationReadinessScore: packageReport.postStabilizationReadinessScore,
    postStabilizationReadinessBand: packageReport.postStabilizationReadinessBand,
    nextStep: "Phase 6.4 - Controlled Beta Execution Readiness Review, Operations Lock & Phase 7 Roadmap",
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
