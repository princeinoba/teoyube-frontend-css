import {
  createContentExpansionBacklog,
  createContentExpansionBacklogReport
} from "./content-expansion-backlog";
import type {
  TeoyubeContentExpansionBacklogItem,
  TeoyubeContentExpansionPriority,
  TeoyubeContentExpansionReviewStatus
} from "./content-expansion-contracts";
import type {
  TeoyubeContentReviewQueue,
  TeoyubeContentReviewQueueItem,
  TeoyubeContentReviewQueueItemType,
  TeoyubeContentReviewQueuePriority,
  TeoyubeContentReviewQueueReport,
  TeoyubeContentReviewRequirement
} from "./content-review-queue-contracts";
import {
  createContentReviewQueue,
  createContentReviewQueueItem,
  createContentReviewQueueReport
} from "./content-review-queue-manager";

export type TeoyubeBacklogToReviewQueueReport = {
  valid: boolean;
  backlogItemCount: number;
  queueItemCount: number;
  queue: TeoyubeContentReviewQueue;
  queueReport: TeoyubeContentReviewQueueReport;
  blockers: string[];
  warnings: string[];
  reviewOnly: true;
  productionExcluded: true;
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

function mapPriority(priority: TeoyubeContentExpansionPriority): TeoyubeContentReviewQueuePriority {
  return priority;
}

function mapAreaToQueueType(area: TeoyubeContentExpansionBacklogItem["area"]): TeoyubeContentReviewQueueItemType {
  const map: Record<string, TeoyubeContentReviewQueueItemType> = {
    teoyube_vocabulary: "teoyube_word",
    promise_cluster: "promise_cluster",
    scripture_anchor: "scripture_anchor",
    prayer_prompt: "prayer_prompt",
    calling_path: "calling_path",
    action_step: "action_step",
    tig_relationship: "tig_relationship",
    word_card_copy: "word_card_copy",
    promise_table_copy: "promise_table_copy",
    prayer_companion_copy: "prayer_companion_copy",
    calling_compass_copy: "calling_compass_copy",
    canon_copy: "surface_ux",
    daily_word_copy: "surface_ux"
  };
  return map[area] || "unknown";
}

function reviewRequirementFromStatus(status: TeoyubeContentExpansionReviewStatus): TeoyubeContentReviewRequirement {
  const label = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
  return {
    id: status,
    label,
    reviewState: status === "ready_for_future_phase" ? "owner_review_required" : status,
    required: status !== "ready_for_future_phase" && status !== "unknown",
    complete: false,
    description: "Inherited from Phase 4.2 content expansion backlog; keep draft-only until reviewed."
  };
}

export function getReviewRequirementsForBacklogItem(
  item: TeoyubeContentExpansionBacklogItem
): TeoyubeContentReviewRequirement[] {
  const inherited = item.requiredReviews.map(reviewRequirementFromStatus);
  const ids = new Set(inherited.map((entry) => entry.id));
  const add = (status: TeoyubeContentExpansionReviewStatus) => {
    if (!ids.has(status)) {
      inherited.push(reviewRequirementFromStatus(status));
      ids.add(status);
    }
  };

  if (["teoyube_vocabulary", "promise_cluster", "scripture_anchor", "prayer_prompt", "calling_path", "tig_relationship"].includes(item.area)) {
    add("scripture_review_required");
  }
  if (["teoyube_vocabulary", "promise_cluster", "prayer_prompt", "calling_path", "action_step", "tig_relationship"].includes(item.area)) {
    add("theology_review_required");
  }
  add("owner_review_required");

  return inherited;
}

export function createReviewQueueItemFromBacklogItem(
  item: TeoyubeContentExpansionBacklogItem
): TeoyubeContentReviewQueueItem {
  const reviewRequirements = getReviewRequirementsForBacklogItem(item);
  return createContentReviewQueueItem({
    id: `queue_${item.id}`,
    type: mapAreaToQueueType(item.area),
    title: item.title,
    priority: mapPriority(item.priority),
    reviewState: item.status === "blocked" ? "blocked" : reviewRequirements.find((entry) => entry.required)?.reviewState || "owner_review_required",
    sourceIds: item.sourceIds,
    sourceSurface: mapAreaToQueueType(item.area),
    contentArea: item.area,
    summary: item.summary,
    reviewRequirements
  });
}

export function convertContentExpansionBacklogToReviewQueue(
  backlog: TeoyubeContentExpansionBacklogItem[] = createContentExpansionBacklog()
): TeoyubeContentReviewQueue {
  const queueItems = backlog.map(createReviewQueueItemFromBacklogItem);
  return createContentReviewQueue({ id: "phase_4_3_backlog_content_review_queue", items: queueItems });
}

export function createBacklogToReviewQueueReport(
  backlog: TeoyubeContentExpansionBacklogItem[] = createContentExpansionBacklog()
): TeoyubeBacklogToReviewQueueReport {
  const backlogReport = createContentExpansionBacklogReport(backlog);
  const queue = convertContentExpansionBacklogToReviewQueue(backlog);
  const queueReport = createContentReviewQueueReport(queue);
  const blockers = [
    ...backlogReport.blockers.map((entry) => entry.message),
    ...queueReport.blockers.map((entry) => entry.message)
  ];
  const warnings = [
    ...backlogReport.warnings.map((entry) => entry.message),
    ...queueReport.warnings.map((entry) => entry.message)
  ];

  return {
    valid: blockers.length === 0 && queueReport.valid && backlogReport.noProductionContentCreated,
    backlogItemCount: backlog.length,
    queueItemCount: queue.items.length,
    queue,
    queueReport,
    blockers,
    warnings,
    reviewOnly: true,
    productionExcluded: true,
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
