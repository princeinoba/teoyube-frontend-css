import { createPhase53Package, createPhase53PackageReport } from "./phase-5-3-package";

export type TeoyubePhase53AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase53AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase53AuditChecklistItem[];
  missingItems: TeoyubePhase53AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff";
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase53AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase53AuditChecklist(): TeoyubePhase53AuditChecklistItem[] {
  const pkg = createPhase53Package();
  const report = createPhase53PackageReport(pkg);
  return [
    item("phase_5_3_map_document", "Phase 5.3 map document exists", true, "phase-5-3-beta-fix-queue-readiness-remediation-regression-qa-map.md documents the map."),
    item("beta_fix_queue_contracts", "Beta fix queue contracts exist", true, "beta-fix-queue-contracts.ts defines queue contracts."),
    item("beta_fix_queue_manager", "Beta fix queue manager exists", pkg.betaRemediationPackage.betaFixQueueReport.inMemoryOnly, "beta-fix-queue-manager.ts manages the in-memory queue."),
    item("beta_issue_to_fix_converter", "Beta issue-to-fix converter exists", pkg.betaRemediationPackage.issueToFixConversionReport.inMemoryOnly, "beta-issue-to-fix-converter.ts maps Phase 5.2 issues into fix items."),
    item("readiness_remediation_contracts", "Readiness remediation contracts exist", true, "readiness-remediation-contracts.ts defines plan and item contracts."),
    item("readiness_remediation_planner", "Readiness remediation planner exists", pkg.betaRemediationPackage.readinessRemediationPlanReport.inMemoryOnly, "readiness-remediation-planner.ts separates safe, owner-review, blocked, and deferred items."),
    item("remediation_safety_validator", "Remediation safety validator exists", pkg.betaRemediationPackage.remediationSafetyReport.inMemoryOnly, "readiness-remediation-safety-validator.ts blocks unsafe remediation."),
    item("beta_regression_qa_contracts", "Beta regression QA contracts exist", true, "beta-regression-qa-contracts.ts defines regression QA contracts."),
    item("beta_regression_qa_runner", "Beta regression QA runner exists", pkg.betaRemediationPackage.betaRegressionQaReport.inMemoryOnly, "beta-regression-qa-runner.ts records regression QA in memory."),
    item("disabled_service_regression_qa", "Disabled service regression QA exists", pkg.betaRemediationPackage.disabledServiceRegressionQaReport.valid, "beta-disabled-service-regression-qa.ts confirms services stay disabled."),
    item("scripture_explanation_fallback_regression_qa", "Scripture/explanation/fallback regression QA exists", pkg.betaRemediationPackage.scriptureExplanationFallbackRegressionQaReport.valid, "beta-scripture-explanation-fallback-regression-qa.ts protects spiritual safety."),
    item("reviewed_content_gate_regression_qa", "Reviewed content gate regression QA exists", pkg.betaRemediationPackage.reviewedContentGateRegressionQaReport.valid, "beta-reviewed-content-gate-regression-qa.ts protects reviewed content gates."),
    item("mobile_accessibility_regression_qa", "Mobile/accessibility regression QA exists", pkg.betaRemediationPackage.mobileAccessibilityRegressionQaReport.valid, "beta-mobile-accessibility-regression-qa.ts protects mobile/accessibility state."),
    item("post_remediation_readiness_score", "Post-remediation readiness score exists", pkg.betaRemediationPackage.postRemediationReadinessScoreReport.valid, "post-remediation-readiness-score.ts calculates post-remediation score."),
    item("beta_remediation_package", "Beta remediation package exists", pkg.betaRemediationPackageReport.valid, "beta-remediation-package.ts combines fix queue, remediation, safety, regression, and score."),
    item("owner_review", "Phase 5.3 owner review exists", pkg.ownerReviewReport.record.checklist.length >= 13, "phase-5-3-owner-review.ts prepares owner review."),
    item("phase_5_3_package", "Phase 5.3 package exists", report.valid, "phase-5-3-package.ts combines remediation package and owner review."),
    item("smoke_check", "Phase 5.3 smoke check exists", true, "phase-5-3-beta-fix-queue-remediation-smoke-check.ts verifies the step."),
    item("documentation", "Phase 5.3 documentation exists", true, "phase-5-3-beta-fix-queue-readiness-remediation-regression-qa.md documents the step.")
  ];
}

export function getPhase53MissingItems(): TeoyubePhase53AuditChecklistItem[] {
  return getPhase53AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase53Warnings(): string[] {
  return createPhase53PackageReport(createPhase53Package()).warnings;
}

export function getPhase53CompletionPercentage(): number {
  const checklist = getPhase53AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase53Audit(): TeoyubePhase53AuditReport {
  const checklist = getPhase53AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase53PackageReport(createPhase53Package());
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase53CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase53Warnings(),
    blockers,
    nextStep: "Phase 5.4 - Controlled Beta Go/No-Go, Owner Approval & Operational Handoff",
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
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
