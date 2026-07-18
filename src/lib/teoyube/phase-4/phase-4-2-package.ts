import { createAdminContentWorkflowDesignReport } from "./admin-content-workflow-design";
import { createAdminWorkflowServiceRequirementsReport } from "./admin-workflow-service-requirements";
import { createContentExpansionBacklogReport } from "./content-expansion-backlog";
import { createPhase42OwnerReviewRecord, createPhase42OwnerReviewReport, type TeoyubePhase42OwnerReviewRecord } from "./phase-4-2-owner-review";
import { createPrayerCallingContentReviewReport } from "./prayer-calling-content-review-workflow";
import { createProductSurfacePolishPlan, createProductSurfacePolishPlanReport } from "./product-surface-polish-planner";
import { createScripturePromiseReviewReport } from "./scripture-promise-content-review-workflow";

export type TeoyubePhase42PackageDecision =
  | "phase_4_2_complete"
  | "phase_4_2_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase42Package = {
  id: string;
  productSurfacePolishPlan: ReturnType<typeof createProductSurfacePolishPlanReport>;
  safeUiPatchRecord: ReturnType<typeof createProductSurfacePolishPlan>["safePatches"];
  contentExpansionBacklog: ReturnType<typeof createContentExpansionBacklogReport>;
  scripturePromiseReviewWorkflow: ReturnType<typeof createScripturePromiseReviewReport>;
  prayerCallingReviewWorkflow: ReturnType<typeof createPrayerCallingContentReviewReport>;
  adminContentWorkflowDesign: ReturnType<typeof createAdminContentWorkflowDesignReport>;
  adminWorkflowServiceRequirements: ReturnType<typeof createAdminWorkflowServiceRequirementsReport>;
  ownerReview: TeoyubePhase42OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase42OwnerReviewReport>;
  recommendedNextAction: "Phase 4.3 - Content Review Queue, Promise Cluster Expansion Drafts & Surface UX Refinement";
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

export type TeoyubePhase42PackageReport = {
  valid: boolean;
  decision: TeoyubePhase42PackageDecision;
  blockers: string[];
  warnings: string[];
  phase42Package: TeoyubePhase42Package;
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

export function createPhase42Package(input: {
  ownerReview?: TeoyubePhase42OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase42Package {
  const polishPlan = createProductSurfacePolishPlan();
  const ownerReview = input.ownerReview || createPhase42OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });

  return {
    id: "phase_4_2_package",
    productSurfacePolishPlan: createProductSurfacePolishPlanReport(polishPlan),
    safeUiPatchRecord: polishPlan.safePatches,
    contentExpansionBacklog: createContentExpansionBacklogReport(),
    scripturePromiseReviewWorkflow: createScripturePromiseReviewReport(),
    prayerCallingReviewWorkflow: createPrayerCallingContentReviewReport(),
    adminContentWorkflowDesign: createAdminContentWorkflowDesignReport(),
    adminWorkflowServiceRequirements: createAdminWorkflowServiceRequirementsReport(),
    ownerReview,
    ownerReviewReport: createPhase42OwnerReviewReport(ownerReview),
    recommendedNextAction: "Phase 4.3 - Content Review Queue, Promise Cluster Expansion Drafts & Surface UX Refinement",
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

export function getPhase42PackageBlockers(phase42Package: TeoyubePhase42Package): string[] {
  return [
    ...phase42Package.contentExpansionBacklog.blockers.map((entry) => entry.message),
    ...phase42Package.scripturePromiseReviewWorkflow.blockers,
    ...phase42Package.prayerCallingReviewWorkflow.blockers,
    ...phase42Package.adminContentWorkflowDesign.blockers.map((entry) => entry.message),
    ...phase42Package.adminWorkflowServiceRequirements.blockers
  ];
}

export function getPhase42PackageWarnings(phase42Package: TeoyubePhase42Package): string[] {
  return [
    ...phase42Package.productSurfacePolishPlan.blockers.map((entry) => `Product polish blocker carried into backlog: ${entry.message}`),
    ...phase42Package.productSurfacePolishPlan.warnings.map((entry) => entry.message),
    ...phase42Package.contentExpansionBacklog.warnings.map((entry) => entry.message),
    ...phase42Package.scripturePromiseReviewWorkflow.warnings,
    ...phase42Package.prayerCallingReviewWorkflow.warnings,
    ...phase42Package.adminContentWorkflowDesign.warnings.map((entry) => entry.message),
    ...phase42Package.adminWorkflowServiceRequirements.warnings,
    ...phase42Package.ownerReviewReport.warnings
  ];
}

export function createPhase42PackageDecision(phase42Package: TeoyubePhase42Package): TeoyubePhase42PackageDecision {
  const blockers = getPhase42PackageBlockers(phase42Package);
  const warnings = getPhase42PackageWarnings(phase42Package);
  if (blockers.length) return "blocked";
  if (phase42Package.ownerReviewReport.blockers.length) return "needs_owner_review";
  return warnings.length ? "phase_4_2_complete_with_warnings" : "phase_4_2_complete";
}

export function validatePhase42Package(phase42Package: TeoyubePhase42Package): TeoyubePhase42PackageReport {
  return createPhase42PackageReport(phase42Package);
}

export function createPhase42PackageReport(phase42Package: TeoyubePhase42Package): TeoyubePhase42PackageReport {
  const blockers = getPhase42PackageBlockers(phase42Package);
  const warnings = getPhase42PackageWarnings(phase42Package);
  return {
    valid: blockers.length === 0,
    decision: createPhase42PackageDecision(phase42Package),
    blockers,
    warnings,
    phase42Package,
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
