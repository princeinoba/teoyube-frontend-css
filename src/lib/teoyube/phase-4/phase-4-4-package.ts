import {
  createPhase44OwnerReviewRecord,
  createPhase44OwnerReviewReport,
  type TeoyubePhase44OwnerReviewRecord
} from "./phase-4-4-owner-review";
import {
  createPromiseTableUxReport,
  createPromiseTableUxViewModel
} from "./promise-table-ux-view-model";
import { createPromiseTableUxQaReport } from "./promise-table-ux-qa";
import {
  createReviewedContentIntegrationGateReport
} from "./reviewed-content-integration-gate";
import {
  createReviewedContentIntegrationPlan,
  createReviewedContentIntegrationPlanReport
} from "./reviewed-content-integration-planner";
import {
  createReviewedContentReleaseCandidateReport,
  createReviewedContentReleaseCandidates
} from "./reviewed-content-release-candidate-builder";
import { createReviewedContentIntegrationQaReport } from "./reviewed-content-integration-qa";
import { createSurfaceUxRefinementPlan } from "./surface-ux-refinement-planner";
import {
  createTigGraphExperienceReport,
  createTigGraphExperienceViewModel
} from "./tig-graph-experience-view-model";
import { createTigGraphExperienceQaReport } from "./tig-graph-experience-qa";

export type TeoyubePhase44PackageDecision =
  | "phase_4_4_complete"
  | "phase_4_4_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase44Package = {
  id: string;
  reviewedContentGate: ReturnType<typeof createReviewedContentIntegrationGateReport>;
  releaseCandidates: ReturnType<typeof createReviewedContentReleaseCandidateReport>;
  reviewedContentIntegrationPlan: ReturnType<typeof createReviewedContentIntegrationPlanReport>;
  promiseTableUx: ReturnType<typeof createPromiseTableUxReport>;
  tigGraphExperience: ReturnType<typeof createTigGraphExperienceReport>;
  reviewedContentQa: ReturnType<typeof createReviewedContentIntegrationQaReport>;
  promiseTableUxQa: ReturnType<typeof createPromiseTableUxQaReport>;
  tigGraphExperienceQa: ReturnType<typeof createTigGraphExperienceQaReport>;
  safeUiPatchSummary: ReturnType<typeof createSurfaceUxRefinementPlan>["safePatches"];
  ownerReview: TeoyubePhase44OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase44OwnerReviewReport>;
  recommendedNextAction: "Phase 4.5 - Controlled Admin Workflow Prototype, Service Readiness Review & Beta QA Plan";
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  noDraftContentPublished: true;
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

export type TeoyubePhase44PackageReport = {
  valid: boolean;
  decision: TeoyubePhase44PackageDecision;
  blockers: string[];
  warnings: string[];
  phase44Package: TeoyubePhase44Package;
  noAutomaticPublishing: true;
  noProductionDataModified: true;
  noDraftContentPublished: true;
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

export function createPhase44Package(input: {
  ownerReview?: TeoyubePhase44OwnerReviewRecord;
  ownerReviewed?: boolean;
} = {}): TeoyubePhase44Package {
  const reviewedContentGate = createReviewedContentIntegrationGateReport();
  const releaseCandidates = createReviewedContentReleaseCandidateReport(
    createReviewedContentReleaseCandidates({ items: reviewedContentGate.eligibleItems })
  );
  const reviewedContentIntegrationPlan = createReviewedContentIntegrationPlanReport(
    createReviewedContentIntegrationPlan({ items: reviewedContentGate.items })
  );
  const promiseTableUxViewModel = createPromiseTableUxViewModel({ viewMode: "card_grid", maxRows: 12 });
  const promiseTableUx = createPromiseTableUxReport({ viewModel: promiseTableUxViewModel });
  const tigGraphExperienceViewModel = createTigGraphExperienceViewModel({ maxNodes: 40, maxEdges: 40 });
  const tigGraphExperience = createTigGraphExperienceReport({ viewModel: tigGraphExperienceViewModel });
  const reviewedContentQa = createReviewedContentIntegrationQaReport(reviewedContentGate);
  const promiseTableUxQa = createPromiseTableUxQaReport(promiseTableUx);
  const tigGraphExperienceQa = createTigGraphExperienceQaReport(tigGraphExperience);
  const safeUiPatchSummary = createSurfaceUxRefinementPlan().safePatches;
  const ownerReview = input.ownerReview || createPhase44OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });

  return {
    id: "phase_4_4_package",
    reviewedContentGate,
    releaseCandidates,
    reviewedContentIntegrationPlan,
    promiseTableUx,
    tigGraphExperience,
    reviewedContentQa,
    promiseTableUxQa,
    tigGraphExperienceQa,
    safeUiPatchSummary,
    ownerReview,
    ownerReviewReport: createPhase44OwnerReviewReport(ownerReview),
    recommendedNextAction: "Phase 4.5 - Controlled Admin Workflow Prototype, Service Readiness Review & Beta QA Plan",
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noDraftContentPublished: true,
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

export function getPhase44PackageBlockers(phase44Package: TeoyubePhase44Package): string[] {
  return [
    ...phase44Package.reviewedContentGate.blockers.map((entry) => entry.message),
    ...phase44Package.releaseCandidates.blockers,
    ...phase44Package.reviewedContentIntegrationPlan.blockers,
    ...phase44Package.promiseTableUx.blockers.map((entry) => entry.message),
    ...phase44Package.tigGraphExperience.blockers.map((entry) => entry.message),
    ...phase44Package.reviewedContentQa.blockers,
    ...phase44Package.promiseTableUxQa.blockers,
    ...phase44Package.tigGraphExperienceQa.blockers
  ];
}

export function getPhase44PackageWarnings(phase44Package: TeoyubePhase44Package): string[] {
  return [
    ...phase44Package.reviewedContentGate.warnings.map((entry) => entry.message),
    ...phase44Package.releaseCandidates.warnings,
    ...phase44Package.reviewedContentIntegrationPlan.warnings,
    ...phase44Package.promiseTableUx.warnings.map((entry) => entry.message),
    ...phase44Package.tigGraphExperience.warnings.map((entry) => entry.message),
    ...phase44Package.reviewedContentQa.warnings,
    ...phase44Package.promiseTableUxQa.warnings,
    ...phase44Package.tigGraphExperienceQa.warnings,
    ...phase44Package.ownerReviewReport.warnings
  ];
}

export function createPhase44PackageDecision(phase44Package: TeoyubePhase44Package): TeoyubePhase44PackageDecision {
  const blockers = getPhase44PackageBlockers(phase44Package);
  const warnings = getPhase44PackageWarnings(phase44Package);
  if (blockers.length) return "blocked";
  if (phase44Package.ownerReviewReport.blockers.length) return "needs_owner_review";
  return warnings.length ? "phase_4_4_complete_with_warnings" : "phase_4_4_complete";
}

export function validatePhase44Package(phase44Package: TeoyubePhase44Package): TeoyubePhase44PackageReport {
  return createPhase44PackageReport(phase44Package);
}

export function createPhase44PackageReport(phase44Package: TeoyubePhase44Package): TeoyubePhase44PackageReport {
  const blockers = getPhase44PackageBlockers(phase44Package);
  const warnings = getPhase44PackageWarnings(phase44Package);
  return {
    valid: blockers.length === 0,
    decision: createPhase44PackageDecision(phase44Package),
    blockers,
    warnings,
    phase44Package,
    noAutomaticPublishing: true,
    noProductionDataModified: true,
    noDraftContentPublished: true,
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
