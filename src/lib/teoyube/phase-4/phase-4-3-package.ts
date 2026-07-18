import { createBacklogToReviewQueueReport } from "./content-backlog-to-review-queue";
import { createContentDraftSafetyReport } from "./content-draft-safety-validator";
import { createContentReviewQueueReport } from "./content-review-queue-manager";
import type { TeoyubeContentReviewQueue } from "./content-review-queue-contracts";
import {
  createPhase43OwnerReviewRecord,
  createPhase43OwnerReviewReport,
  type TeoyubePhase43OwnerReviewRecord
} from "./phase-4-3-owner-review";
import {
  createPromiseClusterExpansionDraftReport,
  createPromiseClusterExpansionDrafts
} from "./promise-cluster-expansion-draft-builder";
import { createPrayerCallingActionDraftReviewReport } from "./prayer-calling-action-draft-review";
import {
  createScriptureAnchorDraftReviewItem,
  createScriptureAnchorDraftReviewReport
} from "./scripture-anchor-draft-review";
import {
  createSurfaceUxRefinementPlan,
  createSurfaceUxRefinementPlanReport
} from "./surface-ux-refinement-planner";
import { createSurfaceUxRefinementQaReport } from "./surface-ux-refinement-qa";
import { createTigRelationshipDraftReviewReport } from "./tig-relationship-draft-review";

export type TeoyubePhase43PackageDecision =
  | "phase_4_3_complete"
  | "phase_4_3_complete_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase43Package = {
  id: string;
  contentReviewQueue: ReturnType<typeof createContentReviewQueueReport>;
  backlogToReviewQueue: ReturnType<typeof createBacklogToReviewQueueReport>;
  promiseClusterExpansionDrafts: ReturnType<typeof createPromiseClusterExpansionDraftReport>;
  scriptureAnchorDraftReview: ReturnType<typeof createScriptureAnchorDraftReviewReport>;
  prayerCallingActionDraftReview: ReturnType<typeof createPrayerCallingActionDraftReviewReport>;
  tigRelationshipDraftReview: ReturnType<typeof createTigRelationshipDraftReviewReport>;
  contentDraftSafety: ReturnType<typeof createContentDraftSafetyReport>;
  surfaceUxRefinementPlan: ReturnType<typeof createSurfaceUxRefinementPlanReport>;
  surfaceUxRefinementQa: ReturnType<typeof createSurfaceUxRefinementQaReport>;
  ownerReview: TeoyubePhase43OwnerReviewRecord;
  ownerReviewReport: ReturnType<typeof createPhase43OwnerReviewReport>;
  recommendedNextAction: "Phase 4.4 - Reviewed Content Integration, Promise Table UX & TIG Graph Experience Polish";
  reviewOnly: true;
  productionEligible: false;
  excludedFromLiveRecommendations: true;
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

export type TeoyubePhase43PackageReport = {
  valid: boolean;
  decision: TeoyubePhase43PackageDecision;
  blockers: string[];
  warnings: string[];
  phase43Package: TeoyubePhase43Package;
  reviewOnly: true;
  productionEligible: false;
  excludedFromLiveRecommendations: true;
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

function scriptureReviewItemsFromDrafts(
  draftReport: ReturnType<typeof createPromiseClusterExpansionDraftReport>
) {
  const items = draftReport.drafts.flatMap((draft) =>
    draft.scriptureAnchors.slice(0, 2).map((anchor) =>
      createScriptureAnchorDraftReviewItem({
        id: `scripture_review_${draft.id}_${anchor.reference.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
        reference: anchor.reference,
        proposedUse: `Review anchor for ${draft.title}.`,
        relatedPromiseClusterId: draft.sourceClusterId,
        relatedWordId: draft.sourceWordId,
        manualVerificationRequired: anchor.manualVerificationRequired,
        explanationPath: draft.explanationPath
      })
    )
  );

  return items.length ? items : undefined;
}

export function createPhase43Package(input: {
  ownerReview?: TeoyubePhase43OwnerReviewRecord;
  ownerReviewed?: boolean;
  queue?: TeoyubeContentReviewQueue;
} = {}): TeoyubePhase43Package {
  const backlogToReviewQueue = createBacklogToReviewQueueReport();
  const contentReviewQueue = createContentReviewQueueReport(input.queue || backlogToReviewQueue.queue);
  const drafts = createPromiseClusterExpansionDrafts();
  const promiseClusterExpansionDrafts = createPromiseClusterExpansionDraftReport(drafts);
  const scriptureAnchorDraftReview = createScriptureAnchorDraftReviewReport(scriptureReviewItemsFromDrafts(promiseClusterExpansionDrafts));
  const prayerCallingActionDraftReview = createPrayerCallingActionDraftReviewReport();
  const tigRelationshipDraftReview = createTigRelationshipDraftReviewReport();
  const contentDraftSafety = createContentDraftSafetyReport([
    ...promiseClusterExpansionDrafts.drafts,
    ...prayerCallingActionDraftReview.items,
    ...tigRelationshipDraftReview.items
  ]);
  const surfacePlan = createSurfaceUxRefinementPlan();
  const surfaceUxRefinementPlan = createSurfaceUxRefinementPlanReport(surfacePlan);
  const surfaceUxRefinementQa = createSurfaceUxRefinementQaReport(surfacePlan);
  const ownerReview = input.ownerReview || createPhase43OwnerReviewRecord({ reviewed: input.ownerReviewed ?? false });

  return {
    id: "phase_4_3_package",
    contentReviewQueue,
    backlogToReviewQueue,
    promiseClusterExpansionDrafts,
    scriptureAnchorDraftReview,
    prayerCallingActionDraftReview,
    tigRelationshipDraftReview,
    contentDraftSafety,
    surfaceUxRefinementPlan,
    surfaceUxRefinementQa,
    ownerReview,
    ownerReviewReport: createPhase43OwnerReviewReport(ownerReview),
    recommendedNextAction: "Phase 4.4 - Reviewed Content Integration, Promise Table UX & TIG Graph Experience Polish",
    reviewOnly: true,
    productionEligible: false,
    excludedFromLiveRecommendations: true,
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

export function getPhase43PackageBlockers(phase43Package: TeoyubePhase43Package): string[] {
  return [
    ...phase43Package.contentReviewQueue.blockers.map((entry) => entry.message),
    ...phase43Package.backlogToReviewQueue.blockers,
    ...phase43Package.promiseClusterExpansionDrafts.blockers.map((entry) => entry.message),
    ...phase43Package.scriptureAnchorDraftReview.blockers,
    ...phase43Package.prayerCallingActionDraftReview.blockers,
    ...phase43Package.tigRelationshipDraftReview.blockers,
    ...phase43Package.contentDraftSafety.blockers,
    ...phase43Package.surfaceUxRefinementPlan.blockers.map((entry) => entry.message),
    ...phase43Package.surfaceUxRefinementQa.blockers
  ];
}

export function getPhase43PackageWarnings(phase43Package: TeoyubePhase43Package): string[] {
  return [
    ...phase43Package.contentReviewQueue.warnings.map((entry) => entry.message),
    ...phase43Package.backlogToReviewQueue.warnings,
    ...phase43Package.promiseClusterExpansionDrafts.warnings.map((entry) => entry.message),
    ...phase43Package.scriptureAnchorDraftReview.warnings,
    ...phase43Package.prayerCallingActionDraftReview.warnings,
    ...phase43Package.tigRelationshipDraftReview.warnings,
    ...phase43Package.contentDraftSafety.warnings,
    ...phase43Package.surfaceUxRefinementPlan.warnings.map((entry) => entry.message),
    ...phase43Package.surfaceUxRefinementQa.warnings,
    ...phase43Package.ownerReviewReport.warnings
  ];
}

export function createPhase43PackageDecision(phase43Package: TeoyubePhase43Package): TeoyubePhase43PackageDecision {
  const blockers = getPhase43PackageBlockers(phase43Package);
  const warnings = getPhase43PackageWarnings(phase43Package);
  if (blockers.length) return "blocked";
  if (phase43Package.ownerReviewReport.blockers.length) return "needs_owner_review";
  return warnings.length ? "phase_4_3_complete_with_warnings" : "phase_4_3_complete";
}

export function validatePhase43Package(phase43Package: TeoyubePhase43Package): TeoyubePhase43PackageReport {
  return createPhase43PackageReport(phase43Package);
}

export function createPhase43PackageReport(phase43Package: TeoyubePhase43Package): TeoyubePhase43PackageReport {
  const blockers = getPhase43PackageBlockers(phase43Package);
  const warnings = getPhase43PackageWarnings(phase43Package);
  return {
    valid: blockers.length === 0,
    decision: createPhase43PackageDecision(phase43Package),
    blockers,
    warnings,
    phase43Package,
    reviewOnly: true,
    productionEligible: false,
    excludedFromLiveRecommendations: true,
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
