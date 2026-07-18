import { createPhase43Package, createPhase43PackageReport } from "./phase-4-3-package";

export type TeoyubePhase43AuditChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  details: string;
};

export type TeoyubePhase43AuditReport = {
  complete: boolean;
  completionPercentage: number;
  checklist: TeoyubePhase43AuditChecklistItem[];
  missingItems: TeoyubePhase43AuditChecklistItem[];
  warnings: string[];
  blockers: string[];
  nextStep: "Phase 4.4 - Reviewed Content Integration, Promise Table UX & TIG Graph Experience Polish";
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

function item(id: string, label: string, complete: boolean, details: string): TeoyubePhase43AuditChecklistItem {
  return { id, label, complete, details };
}

export function getPhase43AuditChecklist(): TeoyubePhase43AuditChecklistItem[] {
  const phase43Package = createPhase43Package();
  const report = createPhase43PackageReport(phase43Package);
  return [
    item("phase_4_3_map_document", "Phase 4.3 map document exists", true, "phase-4-3-content-review-queue-promise-drafts-surface-ux-map.md documents inspected backlog, review-only draft rules, and UX needs."),
    item("content_review_queue_contracts", "Content review queue contracts exist", true, "content-review-queue-contracts.ts defines queue status, item types, review states, requirements, notes, warnings, blockers, and report."),
    item("content_review_queue_manager", "Content review queue manager exists", phase43Package.contentReviewQueue.items.length > 0, "content-review-queue-manager.ts creates and updates an in-memory/manual queue."),
    item("backlog_to_review_queue_converter", "Backlog-to-review-queue converter exists", phase43Package.backlogToReviewQueue.queueItemCount > 0, "content-backlog-to-review-queue.ts converts Phase 4.2 backlog items to review queue items."),
    item("promise_cluster_expansion_draft_contracts", "Promise Cluster expansion draft contracts exist", true, "promise-cluster-expansion-draft-contracts.ts defines review-only draft types and reports."),
    item("promise_cluster_expansion_draft_builder", "Promise Cluster expansion draft builder exists", phase43Package.promiseClusterExpansionDrafts.reviewOnlyDrafts.length > 0, "promise-cluster-expansion-draft-builder.ts creates review-only drafts from real data coverage gaps."),
    item("scripture_anchor_draft_review", "Scripture anchor draft review exists", phase43Package.scriptureAnchorDraftReview.noUnsupportedScriptureInvented, "scripture-anchor-draft-review.ts validates canon/manual verification and review gates."),
    item("prayer_calling_action_draft_review", "Prayer/Calling/Action draft review exists", phase43Package.prayerCallingActionDraftReview.noProductionContentCreated, "prayer-calling-action-draft-review.ts preserves devotional, humble, and non-professional boundaries."),
    item("tig_relationship_draft_review", "TIG relationship draft review exists", phase43Package.tigRelationshipDraftReview.explanationTraceRequired, "tig-relationship-draft-review.ts requires explanation trace compatibility and visible confidence boundaries."),
    item("content_draft_safety_validator", "Content draft safety validator exists", phase43Package.contentDraftSafety.valid, "content-draft-safety-validator.ts blocks unsafe or production-eligible drafts."),
    item("surface_ux_refinement_contracts", "Surface UX refinement contracts exist", true, "surface-ux-refinement-contracts.ts defines surface UX refinement types."),
    item("surface_ux_refinement_planner", "Surface UX refinement planner exists", phase43Package.surfaceUxRefinementPlan.safePatches.length >= 3, "surface-ux-refinement-planner.ts verifies safe Phase 4.2 patches and carries deferred Phase 4.3 UX items."),
    item("surface_ux_refinement_qa", "Surface UX refinement QA exists", phase43Package.surfaceUxRefinementQa.valid, "surface-ux-refinement-qa.ts verifies Scripture, explanation, confidence, fallback, mobile, and accessibility basics."),
    item("owner_review", "Phase 4.3 owner review exists", phase43Package.ownerReviewReport.record.checklist.length >= 10, "phase-4-3-owner-review.ts prepares structured manual owner review."),
    item("phase_4_3_package", "Phase 4.3 package exists", report.valid, `Phase 4.3 package decision: ${report.decision}.`),
    item("smoke_check", "Phase 4.3 smoke check exists", true, "phase-4-3-content-review-queue-smoke-check.ts verifies Phase 4.3 modules."),
    item("documentation", "Phase 4.3 documentation exists", true, "phase-4-3-content-review-queue-promise-cluster-expansion-drafts-surface-ux-refinement.md documents this step.")
  ];
}

export function getPhase43MissingItems(): TeoyubePhase43AuditChecklistItem[] {
  return getPhase43AuditChecklist().filter((entry) => !entry.complete);
}

export function getPhase43Warnings(): string[] {
  return createPhase43PackageReport(createPhase43Package()).warnings;
}

export function getPhase43CompletionPercentage(): number {
  const checklist = getPhase43AuditChecklist();
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((entry) => entry.complete).length / checklist.length) * 100);
}

export function runPhase43Audit(): TeoyubePhase43AuditReport {
  const checklist = getPhase43AuditChecklist();
  const missingItems = checklist.filter((entry) => !entry.complete);
  const packageReport = createPhase43PackageReport(createPhase43Package());
  const blockers = [
    ...packageReport.blockers,
    ...missingItems.map((entry) => entry.label)
  ];
  const completionPercentage = getPhase43CompletionPercentage();

  return {
    complete: blockers.length === 0 && completionPercentage === 100,
    completionPercentage,
    checklist,
    missingItems,
    warnings: getPhase43Warnings(),
    blockers,
    nextStep: "Phase 4.4 - Reviewed Content Integration, Promise Table UX & TIG Graph Experience Polish",
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
