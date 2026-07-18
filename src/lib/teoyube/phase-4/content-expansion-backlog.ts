import { getCoreTeoyubeVocabulary, getPromiseClustersData, getScriptureCanonData } from "../data/teoyube-data-access";
import type {
  TeoyubeContentExpansionArea,
  TeoyubeContentExpansionBacklogItem,
  TeoyubeContentExpansionPriority,
  TeoyubeContentExpansionReport,
  TeoyubeContentExpansionReviewStatus
} from "./content-expansion-contracts";
import { createContentDepthMapReport } from "./content-depth-map";
import { createProductSurfaceDepthReport } from "./product-surface-depth-audit";
import { createScripturePromiseCoverageReport } from "./scripture-promise-coverage-audit";

function item(
  id: string,
  area: TeoyubeContentExpansionArea,
  title: string,
  sourceIds: string[],
  priority: TeoyubeContentExpansionPriority,
  status: TeoyubeContentExpansionBacklogItem["status"],
  requiredReviews: TeoyubeContentExpansionReviewStatus[],
  summary: string
): TeoyubeContentExpansionBacklogItem {
  return {
    id,
    area,
    title,
    sourceIds: [...new Set(sourceIds.filter(Boolean))],
    priority,
    status,
    requiredReviews: [...new Set(requiredReviews)],
    summary,
    doesNotCreateProductionContent: true
  };
}

function priorityRank(priority: TeoyubeContentExpansionPriority): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[priority];
}

function sourceIds(sectionId: string): string[] {
  const section = createContentDepthMapReport().sections.find((entry) => entry.id === sectionId);
  return section?.needsOwnerReviewIds || [];
}

export function prioritizeContentExpansionBacklog(
  items: TeoyubeContentExpansionBacklogItem[]
): TeoyubeContentExpansionBacklogItem[] {
  return [...items].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.title.localeCompare(b.title));
}

export function createContentExpansionBacklog(_input: Record<string, unknown> = {}): TeoyubeContentExpansionBacklogItem[] {
  const coverage = createScripturePromiseCoverageReport();
  const surfaceDepth = createProductSurfaceDepthReport({ surface: "home", wordId: "Benor" });
  const vocabulary = getCoreTeoyubeVocabulary();
  const clusters = getPromiseClustersData();
  const canon = getScriptureCanonData();
  const vocabularyWithoutScripture = coverage.vocabularyWithoutScriptureSupport;
  const promiseClustersWithoutStrongAnchors = coverage.promiseClustersWithoutStrongAnchors;
  const unusedCanon = coverage.scriptureCanonUnusedEntries;

  return prioritizeContentExpansionBacklog([
    item(
      "vocabulary_scripture_support",
      "teoyube_vocabulary",
      "Vocabulary Scripture support review",
      vocabularyWithoutScripture,
      vocabularyWithoutScripture.length ? "high" : "low",
      vocabularyWithoutScripture.length ? "scripture_review_required" : "ready_for_future_phase",
      ["scripture_review_required", "theology_review_required", "owner_review_required"],
      `Review ${vocabularyWithoutScripture.length} vocabulary item(s) without direct Scripture support out of ${vocabulary.length} total word(s).`
    ),
    item(
      "promise_cluster_anchor_depth",
      "promise_cluster",
      "Promise Cluster anchor depth review",
      promiseClustersWithoutStrongAnchors,
      promiseClustersWithoutStrongAnchors.length ? "high" : "medium",
      promiseClustersWithoutStrongAnchors.length ? "scripture_review_required" : "ready_for_future_phase",
      ["scripture_review_required", "theology_review_required", "copy_review_required", "owner_review_required"],
      `Review ${promiseClustersWithoutStrongAnchors.length} Promise Cluster(s) with fewer than two Scripture anchors out of ${clusters.length} total cluster(s).`
    ),
    item(
      "scripture_canon_usage_review",
      "scripture_anchor",
      "Scripture Canon usage review",
      unusedCanon,
      unusedCanon.length ? "medium" : "low",
      unusedCanon.length ? "owner_review_required" : "ready_for_future_phase",
      ["scripture_review_required", "owner_review_required"],
      `Review ${unusedCanon.length} Scripture Canon entrie(s) not directly used by current vocabulary or Promise Clusters out of ${canon.length} canon entrie(s).`
    ),
    item(
      "prayer_sequence_depth",
      "prayer_prompt",
      "PrayerCompanion prompt depth",
      sourceIds("prayer_depth"),
      sourceIds("prayer_depth").length ? "medium" : "low",
      sourceIds("prayer_depth").length ? "copy_review_required" : "ready_for_future_phase",
      ["scripture_review_required", "theology_review_required", "copy_review_required", "owner_review_required"],
      "Expand prayer prompts only after existing Promise Cluster prayer sequence gaps receive review."
    ),
    item(
      "calling_path_depth",
      "calling_path",
      "Calling Compass path depth",
      sourceIds("calling_depth"),
      sourceIds("calling_depth").length ? "medium" : "low",
      sourceIds("calling_depth").length ? "theology_review_required" : "ready_for_future_phase",
      ["scripture_review_required", "theology_review_required", "copy_review_required", "owner_review_required"],
      "Review calling paths for Scripture support, humble guidance language, and explanation path availability."
    ),
    item(
      "action_step_depth",
      "action_step",
      "Action step depth",
      sourceIds("action_step_depth"),
      sourceIds("action_step_depth").length ? "medium" : "low",
      sourceIds("action_step_depth").length ? "copy_review_required" : "ready_for_future_phase",
      ["theology_review_required", "copy_review_required", "owner_review_required"],
      "Review action suggestions so they remain gentle, non-professional, and fallback-safe."
    ),
    item(
      "tig_relationship_depth",
      "tig_relationship",
      "TIG relationship depth",
      sourceIds("tig_relationship_depth"),
      sourceIds("tig_relationship_depth").length ? "high" : "medium",
      sourceIds("tig_relationship_depth").length ? "owner_review_required" : "ready_for_future_phase",
      ["scripture_review_required", "theology_review_required", "owner_review_required"],
      "Review weak or missing TIG relationships before expanding graph UX or recommendation paths."
    ),
    item(
      "word_card_copy_polish",
      "word_card_copy",
      "WordCard copy polish",
      surfaceDepth.warnings.filter((entry) => entry.area === "word_card").map((entry) => entry.id),
      "medium",
      "copy_review_required",
      ["copy_review_required", "owner_review_required"],
      "Polish visible word, anchor, related-promise, explanation, and missing-anchor copy after content review."
    ),
    item(
      "promise_table_copy_polish",
      "promise_table_copy",
      "Promise Table copy polish",
      surfaceDepth.warnings.filter((entry) => entry.area === "promise_table").map((entry) => entry.id),
      "medium",
      "copy_review_required",
      ["copy_review_required", "owner_review_required"],
      "Polish Promise Table filters, empty states, Scripture labels, and review messages."
    ),
    item(
      "prayer_companion_copy_polish",
      "prayer_companion_copy",
      "PrayerCompanion copy polish",
      surfaceDepth.warnings.filter((entry) => entry.area === "prayer_companion").map((entry) => entry.id),
      "medium",
      "copy_review_required",
      ["theology_review_required", "copy_review_required", "owner_review_required"],
      "Polish devotional boundaries, prayer text, confidence labels, fallback messages, and explanation labels."
    ),
    item(
      "calling_compass_copy_polish",
      "calling_compass_copy",
      "Calling Compass copy polish",
      surfaceDepth.warnings.filter((entry) => entry.area === "calling_compass").map((entry) => entry.id),
      "medium",
      "copy_review_required",
      ["theology_review_required", "copy_review_required", "owner_review_required"],
      "Polish calling copy so it stays reflective, Scripture-anchored, and non-certain."
    ),
    item(
      "canon_daily_word_copy_polish",
      "canon_copy",
      "Canon and Daily Word copy polish",
      [...sourceIds("scripture_canon_depth"), ...surfaceDepth.warnings.filter((entry) => entry.area === "canon").map((entry) => entry.id)],
      "medium",
      "copy_review_required",
      ["scripture_review_required", "copy_review_required", "owner_review_required"],
      "Polish Canon and Daily Word browsing copy after Scripture usage review."
    )
  ]);
}

export function getContentExpansionBacklogByArea(area: TeoyubeContentExpansionArea): TeoyubeContentExpansionBacklogItem[] {
  return createContentExpansionBacklog().filter((entry) => entry.area === area);
}

export function getHighPriorityContentExpansionItems(): TeoyubeContentExpansionBacklogItem[] {
  return createContentExpansionBacklog().filter((entry) => entry.priority === "critical" || entry.priority === "high");
}

export function getScriptureAnchorExpansionItems(): TeoyubeContentExpansionBacklogItem[] {
  return createContentExpansionBacklog().filter((entry) => entry.area === "scripture_anchor" || entry.requiredReviews.includes("scripture_review_required"));
}

export function getPromiseClusterExpansionItems(): TeoyubeContentExpansionBacklogItem[] {
  return getContentExpansionBacklogByArea("promise_cluster");
}

export function getPrayerExpansionItems(): TeoyubeContentExpansionBacklogItem[] {
  return createContentExpansionBacklog().filter((entry) => entry.area === "prayer_prompt" || entry.area === "prayer_companion_copy");
}

export function getCallingExpansionItems(): TeoyubeContentExpansionBacklogItem[] {
  return createContentExpansionBacklog().filter((entry) => entry.area === "calling_path" || entry.area === "calling_compass_copy");
}

export function getTigRelationshipExpansionItems(): TeoyubeContentExpansionBacklogItem[] {
  return getContentExpansionBacklogByArea("tig_relationship");
}

export function createContentExpansionBacklogReport(
  items: TeoyubeContentExpansionBacklogItem[] = createContentExpansionBacklog()
): TeoyubeContentExpansionReport {
  const prioritized = prioritizeContentExpansionBacklog(items);
  const blockers = prioritized
    .filter((entry) => entry.status === "blocked")
    .map((entry) => ({
      id: entry.id,
      area: entry.area,
      message: entry.summary,
      requiredAction: "Resolve blocked content review before future production use."
    }));
  const warnings = prioritized
    .filter((entry) => entry.status !== "ready_for_future_phase")
    .map((entry) => ({
      id: entry.id,
      area: entry.area,
      message: entry.summary,
      recommendedAction: "Keep this as reviewed backlog; do not publish unreviewed content."
    }));

  return {
    valid: blockers.length === 0 && prioritized.every((entry) => entry.doesNotCreateProductionContent),
    items: prioritized,
    highPriorityItems: prioritized.filter((entry) => entry.priority === "critical" || entry.priority === "high"),
    scriptureAnchorItems: prioritized.filter((entry) => entry.area === "scripture_anchor" || entry.requiredReviews.includes("scripture_review_required")),
    promiseClusterItems: prioritized.filter((entry) => entry.area === "promise_cluster"),
    prayerItems: prioritized.filter((entry) => entry.area === "prayer_prompt" || entry.area === "prayer_companion_copy"),
    callingItems: prioritized.filter((entry) => entry.area === "calling_path" || entry.area === "calling_compass_copy"),
    tigRelationshipItems: prioritized.filter((entry) => entry.area === "tig_relationship"),
    blockers,
    warnings,
    noProductionContentCreated: true,
    noUnsupportedScriptureInvented: true,
    noUnsupportedPromisesInvented: true,
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
