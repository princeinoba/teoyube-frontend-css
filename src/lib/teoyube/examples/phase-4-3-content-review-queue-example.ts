import {
  addContentReviewQueueItem,
  createActionStepDraftReviewItem,
  createBacklogToReviewQueueReport,
  createCallingDraftReviewItem,
  createContentDraftSafetyReport,
  createContentReviewQueue,
  createContentReviewQueueItem,
  createContentReviewQueueReport,
  createPhase43OwnerReviewRecord,
  createPhase43OwnerReviewReport,
  createPhase43Package,
  createPhase43PackageReport,
  createPrayerCallingActionDraftReviewReport,
  createPrayerDraftReviewItem,
  createPromiseClusterExpansionDraftReport,
  createPromiseClusterExpansionDrafts,
  createScriptureAnchorDraftReviewItem,
  createScriptureAnchorDraftReviewReport,
  createSurfaceUxRefinementPlan,
  createSurfaceUxRefinementPlanReport,
  createSurfaceUxRefinementQaReport,
  createTigRelationshipDraftReviewItem,
  createTigRelationshipDraftReviewReport,
  runPhase43Audit
} from "../phase-4";

export function runPhase43ContentReviewQueueExample() {
  const manualQueue = createContentReviewQueue();
  const manualQueueItem = createContentReviewQueueItem({
    id: "example_promise_cluster_review_item",
    type: "promise_cluster",
    title: "Example Promise Cluster review item",
    priority: "high",
    sourceIds: ["example_cluster"],
    summary: "Manual review-only item demonstrating the Phase 4.3 queue API."
  });
  const queueWithManualItem = addContentReviewQueueItem(manualQueue, manualQueueItem);
  const manualQueueReport = createContentReviewQueueReport(queueWithManualItem);

  const backlogToReviewQueue = createBacklogToReviewQueueReport();
  const promiseClusterDrafts = createPromiseClusterExpansionDrafts({ limit: 8 });
  const promiseClusterDraftReport = createPromiseClusterExpansionDraftReport(promiseClusterDrafts);
  const scriptureAnchorDraftReview = createScriptureAnchorDraftReviewReport([
    createScriptureAnchorDraftReviewItem({
      id: "example_scripture_anchor_review",
      reference: "Romans 8:28",
      proposedUse: "Review existing Scripture support before future Promise Cluster expansion."
    })
  ]);
  const prayerCallingActionDraftReview = createPrayerCallingActionDraftReviewReport([
    createPrayerDraftReviewItem({
      id: "example_prayer_draft_review",
      title: "Example PrayerCompanion review draft",
      scriptureAnchors: ["Romans 8:28"]
    }),
    createCallingDraftReviewItem({
      id: "example_calling_draft_review",
      title: "Example Calling Compass review draft",
      scriptureAnchors: ["Romans 8:28"]
    }),
    createActionStepDraftReviewItem({
      id: "example_action_step_draft_review",
      title: "Example action step review draft",
      scriptureAnchors: ["Romans 8:28"]
    })
  ]);
  const tigRelationshipDraftReview = createTigRelationshipDraftReviewReport([
    createTigRelationshipDraftReviewItem({
      id: "example_tig_relationship_review",
      type: "word_to_promise",
      sourceId: "Benor",
      targetId: "promise_cluster_review",
      label: "Review-only relationship between a word and Promise Cluster",
      scriptureAnchors: ["Romans 8:28"]
    })
  ]);
  const contentDraftSafety = createContentDraftSafetyReport([
    ...promiseClusterDraftReport.drafts,
    ...prayerCallingActionDraftReview.items,
    ...tigRelationshipDraftReview.items
  ]);
  const surfaceUxRefinementPlan = createSurfaceUxRefinementPlan();
  const surfaceUxRefinementPlanReport = createSurfaceUxRefinementPlanReport(surfaceUxRefinementPlan);
  const surfaceUxRefinementQaReport = createSurfaceUxRefinementQaReport(surfaceUxRefinementPlan);
  const ownerReview = createPhase43OwnerReviewRecord();
  const ownerReviewReport = createPhase43OwnerReviewReport(ownerReview);
  const phase43Package = createPhase43Package({ ownerReview });
  const phase43PackageReport = createPhase43PackageReport(phase43Package);
  const phase43Audit = runPhase43Audit();

  return {
    manualQueue,
    manualQueueItem,
    queueWithManualItem,
    manualQueueReport,
    backlogToReviewQueue,
    promiseClusterDrafts,
    promiseClusterDraftReport,
    scriptureAnchorDraftReview,
    prayerCallingActionDraftReview,
    tigRelationshipDraftReview,
    contentDraftSafety,
    surfaceUxRefinementPlan,
    surfaceUxRefinementPlanReport,
    surfaceUxRefinementQaReport,
    ownerReview,
    ownerReviewReport,
    phase43Package,
    phase43PackageReport,
    phase43Audit
  };
}
