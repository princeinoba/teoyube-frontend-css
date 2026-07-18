import { createProductSurfacePolishPlan } from "./product-surface-polish-planner";
import type {
  TeoyubeSurfaceUxRefinementBlocker,
  TeoyubeSurfaceUxRefinementDecision,
  TeoyubeSurfaceUxRefinementItem,
  TeoyubeSurfaceUxRefinementPatch,
  TeoyubeSurfaceUxRefinementPlan,
  TeoyubeSurfaceUxRefinementPriority,
  TeoyubeSurfaceUxRefinementReport,
  TeoyubeSurfaceUxRefinementStatus,
  TeoyubeSurfaceUxRefinementSurface,
  TeoyubeSurfaceUxRefinementWarning
} from "./surface-ux-refinement-contracts";

function mapSurface(surface: string): TeoyubeSurfaceUxRefinementSurface {
  if (surface === "word_card") return "word_card";
  if (surface === "promise_table" || surface === "promise_cluster") return "promise_table";
  if (surface === "prayer_companion") return "prayer_companion";
  if (surface === "compass_experience" || surface === "calling_compass") return "compass_experience";
  if (surface === "tig_response_panel") return "tig_response_panel";
  if (surface === "tig_graph_explorer") return "tig_graph_explorer";
  if (surface === "canon") return "canon";
  if (surface === "daily_word") return "daily_word";
  if (surface === "fallback_state" || surface === "privacy_notice" || surface === "consent_controls") return "fallback_state";
  return "unknown";
}

function item(
  id: string,
  surface: TeoyubeSurfaceUxRefinementSurface,
  status: TeoyubeSurfaceUxRefinementStatus,
  priority: TeoyubeSurfaceUxRefinementPriority,
  summary: string,
  source: string,
  safetyReason: string,
  blockedBy: string[] = []
): TeoyubeSurfaceUxRefinementItem {
  return { id, surface, status, priority, summary, source, safetyReason, blockedBy };
}

function priorityRank(priority: TeoyubeSurfaceUxRefinementPriority): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[priority];
}

function convertPhase42Patch(patch: ReturnType<typeof createProductSurfacePolishPlan>["safePatches"][number]): TeoyubeSurfaceUxRefinementPatch {
  return {
    id: `phase_4_3_verified_${patch.id}`,
    surface: mapSurface(patch.surface),
    filePath: patch.filePath,
    description: `Verified Phase 4.2 safe patch remains compatible with Phase 4.3 review queue controls: ${patch.description}`,
    applied: patch.applied,
    safetyReason: patch.safetyReason,
    regressionCheck: patch.regressionCheck
  };
}

export function createSurfaceUxRefinementPlan(input: {
  additionalItems?: TeoyubeSurfaceUxRefinementItem[];
  additionalPatches?: TeoyubeSurfaceUxRefinementPatch[];
} = {}): TeoyubeSurfaceUxRefinementPlan {
  const phase42Plan = createProductSurfacePolishPlan();
  const inheritedItems = phase42Plan.deferredItems.map((entry) =>
    item(
      `phase_4_3_deferred_${entry.id}`,
      mapSurface(entry.surface),
      entry.status === "blocked" ? "blocked" : entry.status === "owner_review_required" ? "owner_review_required" : "backlog_item",
      "medium",
      entry.summary,
      `Inherited from Phase 4.2: ${entry.source}`,
      entry.safetyReason,
      entry.blockedBy
    )
  );
  const phase43Items = [
    item(
      "review_queue_surface_label_check",
      "fallback_state",
      "verified",
      "medium",
      "Review queue and draft states keep visible fallback, explanation, and review-only labels.",
      "Phase 4.3 surface scan",
      "Label/readability verification only; no live engine behavior changed."
    ),
    item(
      "promise_table_review_state_readability",
      "promise_table",
      "backlog_item",
      "medium",
      "Promise Table reviewed-content indicators should be polished after owner-approved drafts exist.",
      "Phase 4.3 content queue map",
      "Deferred until reviewed content integration so unreviewed drafts are not presented as production content."
    ),
    item(
      "tig_graph_review_relationship_density",
      "tig_graph_explorer",
      "owner_review_required",
      "high",
      "TIG graph relationship density needs manual mobile review before adding reviewed draft relationships.",
      "Phase 4.3 TIG relationship draft workflow",
      "Manual review preserves graph/list fallback, Scripture labels, confidence boundaries, and explanation traces."
    )
  ];
  const items = [...inheritedItems, ...phase43Items, ...(input.additionalItems || [])].sort(
    (a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.summary.localeCompare(b.summary)
  );
  const safePatches = [
    ...phase42Plan.safePatches.map(convertPhase42Patch),
    ...(input.additionalPatches || [])
  ];

  return {
    id: "phase_4_3_surface_ux_refinement_plan",
    items,
    safePatches,
    deferredItems: items.filter((entry) => entry.status === "owner_review_required" || entry.status === "backlog_item"),
    blockedItems: items.filter((entry) => entry.status === "blocked"),
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

export function getSurfaceUxRefinementItemsBySurface(
  surface: TeoyubeSurfaceUxRefinementSurface
): TeoyubeSurfaceUxRefinementItem[] {
  return createSurfaceUxRefinementPlan().items.filter((entry) => entry.surface === surface);
}

export function getSafeSurfaceUxRefinementPatches(
  plan: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementPatch[] {
  return plan.safePatches.filter((entry) => entry.applied);
}

export function getDeferredSurfaceUxRefinementItems(
  plan: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementItem[] {
  return plan.deferredItems;
}

export function getBlockedSurfaceUxRefinementItems(
  plan: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementItem[] {
  return plan.blockedItems;
}

function blockersForPlan(plan: TeoyubeSurfaceUxRefinementPlan): TeoyubeSurfaceUxRefinementBlocker[] {
  return plan.blockedItems.map((entry) => ({
    id: entry.id,
    surface: entry.surface,
    message: entry.summary,
    requiredAction: entry.blockedBy.join("; ") || "Resolve this blocked UX item before future release."
  }));
}

function warningsForPlan(plan: TeoyubeSurfaceUxRefinementPlan): TeoyubeSurfaceUxRefinementWarning[] {
  return plan.deferredItems.map((entry) => ({
    id: entry.id,
    surface: entry.surface,
    message: entry.summary,
    recommendedAction: "Keep deferred until owner review or Phase 4.4 reviewed content integration."
  }));
}

export function createSurfaceUxRefinementDecision(
  plan: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementDecision {
  if (plan.blockedItems.length) return "blocked";
  if (plan.deferredItems.some((entry) => entry.status === "owner_review_required")) return "needs_owner_review";
  return plan.deferredItems.length ? "phase_4_3_ux_ready_with_warnings" : "phase_4_3_ux_ready";
}

export function createSurfaceUxRefinementPlanReport(
  plan: TeoyubeSurfaceUxRefinementPlan = createSurfaceUxRefinementPlan()
): TeoyubeSurfaceUxRefinementReport {
  const blockers = blockersForPlan(plan);
  const warnings = warningsForPlan(plan);
  return {
    valid: blockers.length === 0,
    decision: createSurfaceUxRefinementDecision(plan),
    items: plan.items,
    safePatches: plan.safePatches,
    deferredItems: plan.deferredItems,
    blockedItems: plan.blockedItems,
    blockers,
    warnings,
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
