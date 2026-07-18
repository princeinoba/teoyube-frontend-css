import { createAccessibilityHardeningExecutionReport } from "./accessibility-hardening-execution";
import { createHardeningContentGateRegressionReport } from "./hardening-content-gate-regression";
import { createHardeningMobileAccessibilityRegressionReport } from "./hardening-mobile-accessibility-regression";
import { createHardeningRegressionQaReport } from "./hardening-regression-qa-runner";
import { createHardeningSafetyRegressionReport } from "./hardening-safety-regression";
import { createHardeningServiceDisabledRegressionReport } from "./hardening-service-disabled-regression";
import { createMobileHardeningExecutionReport } from "./mobile-hardening-execution";
import { createPerformanceReviewReport } from "./performance-review";
import { createProductHardeningClassificationReport } from "./product-hardening-item-classifier";
import { createSafeHardeningPatchValidationReport } from "./safe-hardening-patch-validator";
import {
  createProductHardeningExecutionReport,
  createProductHardeningExecutionRun
} from "./product-hardening-execution-runner";

export type TeoyubeProductHardeningPackageDecision =
  | "product_hardening_complete"
  | "product_hardening_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubeProductHardeningPackageModel = {
  id: string;
  productHardeningExecutionReport: ReturnType<typeof createProductHardeningExecutionReport>;
  itemClassificationReport: ReturnType<typeof createProductHardeningClassificationReport>;
  safeHardeningPatchValidationReport: ReturnType<typeof createSafeHardeningPatchValidationReport>;
  mobileHardeningReport: ReturnType<typeof createMobileHardeningExecutionReport>;
  accessibilityHardeningReport: ReturnType<typeof createAccessibilityHardeningExecutionReport>;
  performanceReviewReport: ReturnType<typeof createPerformanceReviewReport>;
  hardeningRegressionQaReport: ReturnType<typeof createHardeningRegressionQaReport>;
  serviceDisabledRegressionReport: ReturnType<typeof createHardeningServiceDisabledRegressionReport>;
  safetyRegressionReport: ReturnType<typeof createHardeningSafetyRegressionReport>;
  contentGateRegressionReport: ReturnType<typeof createHardeningContentGateRegressionReport>;
  mobileAccessibilityRegressionReport: ReturnType<typeof createHardeningMobileAccessibilityRegressionReport>;
  safePatchSummary: ReturnType<typeof createProductHardeningExecutionReport>["safePatchSummary"];
  blockers: string[];
  warnings: string[];
  nextActionRecommendation: "Phase 8.3 - Privacy/Security Review, Controlled Service Decision Package & Public Release Readiness Gate";
  noExternalSend: true;
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

export type TeoyubeProductHardeningPackageReport = {
  valid: boolean;
  decision: TeoyubeProductHardeningPackageDecision;
  package: TeoyubeProductHardeningPackageModel;
  blockers: string[];
  warnings: string[];
  safePatchSummary: TeoyubeProductHardeningPackageModel["safePatchSummary"];
  noExternalSend: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function collectMessages(entries: Array<{ message?: string; details?: string } | string>): string[] {
  return entries.map((entry) => typeof entry === "string" ? entry : entry.message || entry.details || "Phase 8.2 package item needs attention.");
}

export function createProductHardeningPackage(input: {
  productHardeningExecutionReport?: ReturnType<typeof createProductHardeningExecutionReport>;
} = {}): TeoyubeProductHardeningPackageModel {
  const productHardeningExecutionReport = input.productHardeningExecutionReport || createProductHardeningExecutionReport(createProductHardeningExecutionRun());
  const itemClassificationReport = createProductHardeningClassificationReport();
  const safeHardeningPatchValidationReport = createSafeHardeningPatchValidationReport();
  const mobileHardeningReport = createMobileHardeningExecutionReport();
  const accessibilityHardeningReport = createAccessibilityHardeningExecutionReport();
  const performanceReviewReport = createPerformanceReviewReport({ bundleAwarenessAvailable: false });
  const hardeningRegressionQaReport = createHardeningRegressionQaReport();
  const serviceDisabledRegressionReport = createHardeningServiceDisabledRegressionReport();
  const safetyRegressionReport = createHardeningSafetyRegressionReport();
  const contentGateRegressionReport = createHardeningContentGateRegressionReport();
  const mobileAccessibilityRegressionReport = createHardeningMobileAccessibilityRegressionReport();
  const blockers = [
    ...collectMessages(productHardeningExecutionReport.blockers),
    ...collectMessages(itemClassificationReport.blockedItems.map((entry) => `${entry.itemId}: blocked hardening item.`)),
    ...collectMessages(safeHardeningPatchValidationReport.blockers),
    ...mobileHardeningReport.blockers,
    ...accessibilityHardeningReport.blockers,
    ...collectMessages(performanceReviewReport.blockers),
    ...collectMessages(hardeningRegressionQaReport.blockers),
    ...serviceDisabledRegressionReport.blockers,
    ...safetyRegressionReport.blockers,
    ...contentGateRegressionReport.blockers,
    ...mobileAccessibilityRegressionReport.blockers
  ];
  const warnings = [
    ...collectMessages(productHardeningExecutionReport.warnings),
    ...itemClassificationReport.warnings,
    ...collectMessages(safeHardeningPatchValidationReport.warnings),
    ...mobileHardeningReport.warnings,
    ...accessibilityHardeningReport.warnings,
    ...collectMessages(performanceReviewReport.warnings),
    ...collectMessages(hardeningRegressionQaReport.warnings),
    ...serviceDisabledRegressionReport.warnings,
    ...safetyRegressionReport.warnings,
    ...contentGateRegressionReport.warnings,
    ...mobileAccessibilityRegressionReport.warnings
  ];

  return {
    id: "phase_8_2_product_hardening_package",
    productHardeningExecutionReport,
    itemClassificationReport,
    safeHardeningPatchValidationReport,
    mobileHardeningReport,
    accessibilityHardeningReport,
    performanceReviewReport,
    hardeningRegressionQaReport,
    serviceDisabledRegressionReport,
    safetyRegressionReport,
    contentGateRegressionReport,
    mobileAccessibilityRegressionReport,
    safePatchSummary: productHardeningExecutionReport.safePatchSummary,
    blockers,
    warnings,
    nextActionRecommendation: "Phase 8.3 - Privacy/Security Review, Controlled Service Decision Package & Public Release Readiness Gate",
    noExternalSend: true,
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

export function getProductHardeningPackageBlockers(pkg: TeoyubeProductHardeningPackageModel): string[] {
  return pkg.blockers;
}

export function getProductHardeningPackageWarnings(pkg: TeoyubeProductHardeningPackageModel): string[] {
  return pkg.warnings;
}

export function createProductHardeningPackageDecision(pkg: TeoyubeProductHardeningPackageModel): TeoyubeProductHardeningPackageDecision {
  if (pkg.blockers.length) return "blocked";
  if (pkg.itemClassificationReport.ownerReviewItems.length || pkg.productHardeningExecutionReport.decision === "needs_owner_review") return "needs_owner_review";
  return pkg.warnings.length ? "product_hardening_complete_with_warnings" : "product_hardening_complete";
}

export function validateProductHardeningPackage(pkg: TeoyubeProductHardeningPackageModel): TeoyubeProductHardeningPackageReport {
  return createProductHardeningPackageReport(pkg);
}

export function createProductHardeningPackageReport(pkg: TeoyubeProductHardeningPackageModel): TeoyubeProductHardeningPackageReport {
  const blockers = getProductHardeningPackageBlockers(pkg);
  return {
    valid: blockers.length === 0,
    decision: createProductHardeningPackageDecision(pkg),
    package: pkg,
    blockers,
    warnings: getProductHardeningPackageWarnings(pkg),
    safePatchSummary: pkg.safePatchSummary,
    noExternalSend: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
