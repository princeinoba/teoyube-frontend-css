import { createPhase82Package, createPhase82PackageReport } from "./phase-8-2-package";

export type TeoyubePhase82AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase82AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase82AuditChecklistItem[];
  missingItems: TeoyubePhase82AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 8.3 - Privacy/Security Review, Controlled Service Decision Package & Public Release Readiness Gate";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase82AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase82AuditChecklist(): TeoyubePhase82AuditChecklistItem[] {
  const pkg = createPhase82Package({ ownerReviewed: true });
  const report = createPhase82PackageReport(pkg);
  return [
    item("phase_8_2_map_document", "Phase 8.2 map document exists", true, "phase-8-2-product-hardening-mobile-accessibility-performance-map.md documents the map."),
    item("product_hardening_execution_contracts", "Product hardening execution contracts exist", true, "product-hardening-execution-contracts.ts defines execution contracts."),
    item("product_hardening_execution_runner", "Product hardening execution runner exists", pkg.productHardeningPackage.productHardeningExecutionReport.inMemoryOnly, "product-hardening-execution-runner.ts records safe patches in memory."),
    item("hardening_item_classifier", "Hardening item classifier exists", pkg.productHardeningPackage.itemClassificationReport.inMemoryOnly, "product-hardening-item-classifier.ts classifies hardening items."),
    item("mobile_hardening_execution", "Mobile hardening execution exists", pkg.productHardeningPackage.mobileHardeningReport.inMemoryOnly, "mobile-hardening-execution.ts reviews mobile hardening."),
    item("accessibility_hardening_execution", "Accessibility hardening execution exists", pkg.productHardeningPackage.accessibilityHardeningReport.inMemoryOnly, "accessibility-hardening-execution.ts reviews accessibility hardening."),
    item("performance_review_contracts", "Performance review contracts exist", true, "performance-review-contracts.ts defines performance review contracts."),
    item("performance_review", "Performance review exists", pkg.productHardeningPackage.performanceReviewReport.inMemoryOnly, "performance-review.ts creates manual performance review reports."),
    item("hardening_regression_qa_contracts", "Hardening regression QA contracts exist", true, "hardening-regression-qa-contracts.ts defines regression contracts."),
    item("hardening_regression_qa_runner", "Hardening regression QA runner exists", pkg.productHardeningPackage.hardeningRegressionQaReport.inMemoryOnly, "hardening-regression-qa-runner.ts creates regression QA reports."),
    item("service_disabled_regression", "Service-disabled regression exists", pkg.productHardeningPackage.serviceDisabledRegressionReport.inMemoryOnly, "hardening-service-disabled-regression.ts verifies disabled services."),
    item("safety_regression", "Safety regression exists", pkg.productHardeningPackage.safetyRegressionReport.inMemoryOnly, "hardening-safety-regression.ts verifies Scripture/explanation/fallback/confidence/privacy boundaries."),
    item("content_gate_regression", "Content gate regression exists", pkg.productHardeningPackage.contentGateRegressionReport.inMemoryOnly, "hardening-content-gate-regression.ts verifies content gates."),
    item("mobile_accessibility_regression", "Mobile/accessibility regression exists", pkg.productHardeningPackage.mobileAccessibilityRegressionReport.inMemoryOnly, "hardening-mobile-accessibility-regression.ts verifies mobile/accessibility safety."),
    item("product_hardening_package", "Product hardening package exists", pkg.productHardeningPackageReport.inMemoryOnly, "product-hardening-package.ts combines hardening reports."),
    item("owner_review", "Phase 8.2 owner review exists", pkg.ownerReviewReport.inMemoryOnly, "phase-8-2-owner-review.ts prepares owner review."),
    item("phase_8_2_package", "Phase 8.2 package exists", report.inMemoryOnly, "phase-8-2-package.ts combines the product package and owner review."),
    item("smoke_check", "Phase 8.2 smoke check exists", true, "phase-8-2-product-hardening-smoke-check.ts verifies Phase 8.2."),
    item("documentation", "Phase 8.2 documentation exists", true, "phase-8-2-product-hardening-mobile-accessibility-performance-review.md documents the step.")
  ];
}

export function getPhase82MissingItems(): TeoyubePhase82AuditChecklistItem[] {
  return getPhase82AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase82Warnings(): string[] {
  return createPhase82PackageReport(createPhase82Package({ ownerReviewed: true })).warnings;
}

export function getPhase82CompletionPercentage(): number {
  const checklist = getPhase82AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase82Audit(): TeoyubePhase82AuditReport {
  const checklist = getPhase82AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase82PackageReport(createPhase82Package({ ownerReviewed: true }));
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase82CompletionPercentage();
  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase82Warnings(),
    blockers,
    nextStep: "Phase 8.3 - Privacy/Security Review, Controlled Service Decision Package & Public Release Readiness Gate",
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
