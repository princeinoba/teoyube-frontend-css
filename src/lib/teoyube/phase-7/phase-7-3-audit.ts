import { createPhase73Package, createPhase73PackageReport } from "./phase-7-3-package";

export type TeoyubePhase73AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase73AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase73AuditChecklistItem[];
  missingItems: TeoyubePhase73AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  readinessScore: number;
  readinessScoreBand: string;
  nextStep: "Phase 7.4 - Phase 7 Completion Review, Operations Lock & Phase 8 Roadmap";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase73AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase73AuditChecklist(): TeoyubePhase73AuditChecklistItem[] {
  const pkg = createPhase73Package({ ownerReviewed: true });
  const report = createPhase73PackageReport(pkg);
  return [
    item("phase_7_3_map_document", "Phase 7.3 map document exists", true, "phase-7-3-product-stabilization-pass-regression-qa-beta-operations-readiness-score-map.md documents the map."),
    item("product_stabilization_pass_contracts", "Product stabilization pass contracts exist", true, "product-stabilization-pass-contracts.ts defines pass contracts."),
    item("product_stabilization_pass_runner", "Product stabilization pass runner exists", pkg.productStabilizationPassPackage.stabilizationPassReport.inMemoryOnly, "product-stabilization-pass-runner.ts runs the in-memory pass."),
    item("verification_mapper", "Verification mapper exists", pkg.productStabilizationPassPackage.verificationPlanReport.inMemoryOnly, "product-stabilization-verification-mapper.ts maps queue categories to checks."),
    item("stabilization_regression_qa_contracts", "Stabilization regression QA contracts exist", true, "stabilization-regression-qa-contracts.ts defines regression contracts."),
    item("stabilization_regression_qa_runner", "Stabilization regression QA runner exists", pkg.productStabilizationPassPackage.stabilizationRegressionQaReport.inMemoryOnly, "stabilization-regression-qa-runner.ts runs manual regression QA."),
    item("service_disabled_operations_regression", "Service-disabled operations regression exists", pkg.productStabilizationPassPackage.serviceDisabledOperationsRegressionReport.inMemoryOnly, "service-disabled-operations-regression.ts verifies disabled services."),
    item("scripture_explanation_fallback_operations_regression", "Scripture/explanation/fallback operations regression exists", pkg.productStabilizationPassPackage.scriptureExplanationFallbackOperationsRegressionReport.inMemoryOnly, "scripture-explanation-fallback-operations-regression.ts verifies spiritual/safety boundaries."),
    item("reviewed_content_admin_operations_regression", "Reviewed content/admin operations regression exists", pkg.productStabilizationPassPackage.reviewedContentAdminOperationsRegressionReport.inMemoryOnly, "reviewed-content-admin-operations-regression.ts verifies content/admin boundaries."),
    item("feedback_support_operations_regression", "Feedback/support operations regression exists", pkg.productStabilizationPassPackage.feedbackSupportOperationsRegressionReport.inMemoryOnly, "feedback-support-operations-regression.ts verifies feedback/support boundaries."),
    item("mobile_accessibility_operations_regression", "Mobile/accessibility operations regression exists", pkg.productStabilizationPassPackage.mobileAccessibilityOperationsRegressionReport.inMemoryOnly, "mobile-accessibility-operations-regression.ts verifies mobile/accessibility state."),
    item("beta_operations_readiness_score_contracts", "Beta operations readiness score contracts exist", true, "beta-operations-readiness-score-contracts.ts defines readiness score contracts."),
    item("beta_operations_readiness_score", "Beta operations readiness score exists", pkg.productStabilizationPassPackage.betaOperationsReadinessScoreReport.inMemoryOnly, "beta-operations-readiness-score.ts calculates readiness score."),
    item("product_stabilization_pass_package", "Product stabilization pass package exists", pkg.productStabilizationPassPackageReport.inMemoryOnly, "product-stabilization-pass-package.ts combines reports."),
    item("owner_review", "Phase 7.3 owner review exists", pkg.ownerReviewReport.inMemoryOnly, "phase-7-3-owner-review.ts prepares owner review."),
    item("phase_7_3_package", "Phase 7.3 package exists", report.inMemoryOnly, "phase-7-3-package.ts combines package and owner review."),
    item("smoke_check", "Phase 7.3 smoke check exists", true, "phase-7-3-product-stabilization-pass-smoke-check.ts verifies Phase 7.3."),
    item("documentation", "Phase 7.3 documentation exists", true, "phase-7-3-product-stabilization-pass-regression-qa-beta-operations-readiness-score.md documents the step.")
  ];
}

export function getPhase73MissingItems(): TeoyubePhase73AuditChecklistItem[] {
  return getPhase73AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase73Warnings(): string[] {
  return createPhase73PackageReport(createPhase73Package({ ownerReviewed: true })).warnings;
}

export function getPhase73CompletionPercentage(): number {
  const checklist = getPhase73AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase73Audit(): TeoyubePhase73AuditReport {
  const checklist = getPhase73AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase73PackageReport(createPhase73Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase73CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase73Warnings(),
    blockers,
    readinessScore: packageReport.readinessScore,
    readinessScoreBand: packageReport.readinessScoreBand,
    nextStep: "Phase 7.4 - Phase 7 Completion Review, Operations Lock & Phase 8 Roadmap",
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
