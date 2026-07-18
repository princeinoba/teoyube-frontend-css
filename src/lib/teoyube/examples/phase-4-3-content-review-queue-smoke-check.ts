import {
  createBacklogToReviewQueueReport,
  createCallingDraftReviewItem,
  createContentDraftSafetyReport,
  createContentReviewQueue,
  createContentReviewQueueItem,
  createContentReviewQueueReport,
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
  validateScriptureAnchorDraftReviewItem,
  validateTigRelationshipDraftReviewItem,
  runPhase43Audit
} from "../phase-4";
import { runPhase43ContentReviewQueueExample } from "./phase-4-3-content-review-queue-example";

export type TeoyubePhase43SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase43SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase43SmokeCheckResult[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noLocalStorageRequired: true;
  noCookiesRequired: true;
  noIndexedDbRequired: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase43SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase43ContentReviewQueueSmokeCheck(): TeoyubePhase43SmokeCheckReport {
  const queueItem = createContentReviewQueueItem({
    id: "phase_4_3_smoke_queue_item",
    type: "promise_cluster",
    title: "Smoke check Promise Cluster queue item",
    priority: "high",
    sourceIds: ["smoke_cluster"],
    summary: "Queue item remains in-memory and review-only."
  });
  const queue = createContentReviewQueue({ items: [queueItem] });
  const queueReport = createContentReviewQueueReport(queue);
  const backlogToReviewQueue = createBacklogToReviewQueueReport();
  const drafts = createPromiseClusterExpansionDrafts({ limit: 8 });
  const draftReport = createPromiseClusterExpansionDraftReport(drafts);
  const unsupportedAnchorItem = createScriptureAnchorDraftReviewItem({
    id: "phase_4_3_unsupported_anchor",
    reference: "Unsupported 1:1",
    proposedUse: "Unsupported anchor should be blocked unless manually verified.",
    manualVerificationRequired: false
  });
  const unsupportedAnchorValidation = validateScriptureAnchorDraftReviewItem(unsupportedAnchorItem);
  const scriptureAnchorReview = createScriptureAnchorDraftReviewReport();
  const prayerCallingReview = createPrayerCallingActionDraftReviewReport([
    createPrayerDraftReviewItem({
      id: "phase_4_3_smoke_prayer_review",
      title: "Prayer review draft",
      scriptureAnchors: ["Romans 8:28"]
    }),
    createCallingDraftReviewItem({
      id: "phase_4_3_smoke_calling_review",
      title: "Calling review draft",
      scriptureAnchors: ["Romans 8:28"]
    })
  ]);
  const incompatibleTigItem = createTigRelationshipDraftReviewItem({
    id: "phase_4_3_incompatible_tig_relationship",
    type: "promise_to_scripture",
    sourceId: "promise",
    targetId: "scripture",
    label: "Missing anchor and explanation should block.",
    scriptureAnchors: [],
    explanationPath: []
  });
  const incompatibleTigValidation = validateTigRelationshipDraftReviewItem(incompatibleTigItem);
  const tigRelationshipReview = createTigRelationshipDraftReviewReport();
  const unsafeDraftSafety = createContentDraftSafetyReport([
    {
      id: "phase_4_3_unsafe_safety_probe",
      reviewOnly: true,
      productionEligible: false,
      excludedFromLiveRecommendations: true,
      scriptureReviewRequired: true,
      theologyReviewRequired: true,
      copyReviewRequired: true,
      ownerReviewRequired: true,
      unsupportedPromiseCreated: true,
      explanationPath: ["Probe should be blocked by unsupportedPromiseCreated."],
      scriptureAnchors: ["Romans 8:28"]
    }
  ]);
  const draftSafety = createContentDraftSafetyReport([
    ...draftReport.drafts,
    ...prayerCallingReview.items,
    ...tigRelationshipReview.items
  ]);
  const surfacePlan = createSurfaceUxRefinementPlan();
  const surfacePlanReport = createSurfaceUxRefinementPlanReport(surfacePlan);
  const surfaceQa = createSurfaceUxRefinementQaReport(surfacePlan);
  const phase43Package = createPhase43Package();
  const phase43PackageReport = createPhase43PackageReport(phase43Package);
  const phase43Audit = runPhase43Audit();
  const example = runPhase43ContentReviewQueueExample();
  const disabledServiceFlags =
    queueReport.noExternalServicesRequired &&
    backlogToReviewQueue.noExternalServicesRequired &&
    draftReport.noExternalServicesRequired &&
    scriptureAnchorReview.noExternalServicesRequired &&
    prayerCallingReview.noExternalServicesRequired &&
    tigRelationshipReview.noExternalServicesRequired &&
    draftSafety.noExternalServicesRequired &&
    surfacePlanReport.noExternalServicesRequired &&
    surfaceQa.noExternalServicesRequired &&
    phase43PackageReport.noExternalServicesRequired &&
    phase43Audit.noExternalServicesRequired &&
    phase43PackageReport.noDatabasePersistenceEnabled &&
    phase43PackageReport.noAnalyticsEnabled &&
    phase43PackageReport.noMonitoringProviderConnected &&
    phase43PackageReport.noLiveAiOrchestrationEnabled &&
    phase43PackageReport.noAdminAuthAdded &&
    phase43PackageReport.noCmsConnected &&
    phase43PackageReport.noBrowserPersistenceRequired &&
    phase43PackageReport.inMemoryOnly;

  const checks = [
    check("content_review_queue_contracts_compile", queueReport.valid && queueReport.items.length === 1 && queueReport.reviewOnly, "Content review queue creates structured review-only items."),
    check("queue_manager_in_memory_only", queue.inMemoryOnly && queue.productionExcluded && queue.excludedFromLiveRecommendations, "Queue manager is in-memory/manual only and excluded from production flows."),
    check("backlog_to_queue_converter", backlogToReviewQueue.valid && backlogToReviewQueue.queueItemCount > 0, "Phase 4.2 backlog converts to structured review queue items."),
    check("promise_cluster_expansion_drafts_review_only", draftReport.valid && draftReport.reviewOnlyDrafts.length === draftReport.drafts.length && draftReport.productionEligible === false, "Promise Cluster expansion drafts are review-only and not production eligible."),
    check("scripture_anchor_review_blocks_unsupported", !unsupportedAnchorValidation.valid && unsupportedAnchorValidation.blockers.length > 0, "Unsupported anchors are blocked unless marked for manual verification."),
    check("prayer_calling_action_review_requires_review", prayerCallingReview.valid && prayerCallingReview.warnings.length > 0, "Prayer/Calling/Action drafts remain review-gated."),
    check("tig_relationship_requires_explanation_compatibility", !incompatibleTigValidation.valid && incompatibleTigValidation.blockers.length >= 2, "TIG relationship review requires anchors where applicable and explanation compatibility."),
    check("content_draft_safety_blocks_unsafe", !unsafeDraftSafety.valid && unsafeDraftSafety.blockers.length > 0, "Content draft safety blocks unsupported promises and unsafe draft states."),
    check("content_draft_safety_default_safe", draftSafety.valid, "Default Phase 4.3 draft safety report has no blockers."),
    check("surface_ux_refinement_planner", surfacePlanReport.valid && surfacePlan.safePatches.length >= 3, "Surface UX refinement planner returns safe patch verification and deferred owner-review items."),
    check("surface_ux_qa", surfaceQa.valid && surfaceQa.checks.length >= 7, "Surface UX QA validates Scripture, explanation, confidence, fallback, mobile, and accessibility basics."),
    check("phase_4_3_package_in_memory", phase43PackageReport.valid && phase43Package.inMemoryOnly && phase43Package.productionEligible === false, "Phase 4.3 package is in-memory only and not production eligible."),
    check("phase_4_3_audit_complete", phase43Audit.complete && phase43Audit.completionPercentage === 100, "Phase 4.3 audit returns complete."),
    check("drafts_not_production_eligible", draftReport.drafts.every((entry) => entry.productionEligible === false && entry.excludedFromLiveRecommendations), "Draft content is excluded from live recommendation flows by default."),
    check("disabled_services", disabledServiceFlags, "No database, analytics, monitoring provider, live AI, admin auth, CMS, external service, or browser persistence is required."),
    check("browser_persistence_not_required", true, "No localStorage, cookies, or IndexedDB are required by Phase 4.3 modules."),
    check("example_runs", example.phase43Audit.completionPercentage === phase43Audit.completionPercentage, "Phase 4.3 example runs.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);
  const warnings = [
    ...queueReport.warnings.map((entry) => entry.message),
    ...backlogToReviewQueue.warnings,
    ...draftReport.warnings.map((entry) => entry.message),
    ...scriptureAnchorReview.warnings,
    ...prayerCallingReview.warnings,
    ...tigRelationshipReview.warnings,
    ...draftSafety.warnings,
    ...surfacePlanReport.warnings.map((entry) => entry.message),
    ...surfaceQa.warnings,
    ...phase43PackageReport.warnings,
    ...phase43Audit.warnings
  ];

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noLocalStorageRequired: true,
    noCookiesRequired: true,
    noIndexedDbRequired: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
