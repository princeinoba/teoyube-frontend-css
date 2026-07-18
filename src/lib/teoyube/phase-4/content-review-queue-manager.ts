import type {
  TeoyubeContentReviewNote,
  TeoyubeContentReviewQueue,
  TeoyubeContentReviewQueueBlocker,
  TeoyubeContentReviewQueueDecision,
  TeoyubeContentReviewQueueItem,
  TeoyubeContentReviewQueueItemType,
  TeoyubeContentReviewQueuePriority,
  TeoyubeContentReviewQueueReport,
  TeoyubeContentReviewQueueReviewState,
  TeoyubeContentReviewQueueStatus,
  TeoyubeContentReviewQueueWarning,
  TeoyubeContentReviewRequirement
} from "./content-review-queue-contracts";

export type TeoyubeContentReviewQueueInput = {
  id?: string;
  items?: TeoyubeContentReviewQueueItem[];
};

type QueueItemInput = Partial<
  Omit<
    TeoyubeContentReviewQueueItem,
    | "reviewOnly"
    | "productionExcluded"
    | "productionEligible"
    | "excludedFromLiveRecommendations"
    | "inMemoryOnly"
    | "createdAt"
  >
> & {
  id: string;
  title: string;
};

const CONTENT_REVIEW_TYPES: TeoyubeContentReviewQueueItemType[] = [
  "teoyube_word",
  "promise_cluster",
  "scripture_anchor",
  "prayer_prompt",
  "calling_path",
  "action_step",
  "tig_relationship"
];

const PRIORITY_RANK: Record<TeoyubeContentReviewQueuePriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

function requirement(
  id: string,
  label: string,
  reviewState: TeoyubeContentReviewQueueReviewState,
  description: string,
  complete = false
): TeoyubeContentReviewRequirement {
  return { id, label, reviewState, required: true, complete, description };
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values.filter(Boolean))];
}

function createNote(message: string): TeoyubeContentReviewNote {
  return {
    id: `note_${message.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "content_review"}`,
    authorRole: "system",
    message,
    createdAt: new Date().toISOString()
  };
}

export function getDefaultContentReviewRequirements(
  type: TeoyubeContentReviewQueueItemType
): TeoyubeContentReviewRequirement[] {
  const requirements: TeoyubeContentReviewRequirement[] = [
    requirement("owner_review_required", "Owner/content review", "owner_review_required", "Owner review is required before any future production use.")
  ];

  if (CONTENT_REVIEW_TYPES.includes(type)) {
    requirements.unshift(
      requirement("theology_review_required", "Theology review", "theology_review_required", "Theology boundaries must be checked before future release.")
    );
  }

  if (["teoyube_word", "promise_cluster", "scripture_anchor", "prayer_prompt", "calling_path", "tig_relationship"].includes(type)) {
    requirements.unshift(
      requirement("scripture_review_required", "Scripture review", "scripture_review_required", "Scripture anchors must be verified against existing canon or manual review.")
    );
  }

  if (
    [
      "word_card_copy",
      "promise_table_copy",
      "prayer_companion_copy",
      "calling_compass_copy",
      "tig_response_copy",
      "fallback_copy",
      "surface_ux",
      "prayer_prompt",
      "calling_path",
      "action_step"
    ].includes(type)
  ) {
    requirements.push(
      requirement("copy_review_required", "Copy review", "copy_review_required", "Visible copy must preserve fallback safety, humility, and confidence boundaries.")
    );
  }

  return unique(requirements);
}

function firstIncompleteState(requirements: TeoyubeContentReviewRequirement[]): TeoyubeContentReviewQueueReviewState {
  return requirements.find((entry) => entry.required && !entry.complete)?.reviewState || "approved_for_future_release";
}

function statusForItems(items: TeoyubeContentReviewQueueItem[]): TeoyubeContentReviewQueueStatus {
  if (!items.length) return "empty";
  if (items.some((entry) => entry.reviewState === "blocked")) return "blocked";
  if (items.some((entry) => entry.reviewState === "owner_review_required")) return "ready_for_owner_review";
  if (items.some((entry) => entry.reviewState !== "approved_for_future_release")) return "needs_review";
  return "complete";
}

export function createContentReviewQueueItem(input: QueueItemInput): TeoyubeContentReviewQueueItem {
  const type = input.type || "unknown";
  const reviewRequirements = input.reviewRequirements?.length
    ? input.reviewRequirements
    : getDefaultContentReviewRequirements(type);

  return {
    id: input.id,
    type,
    title: input.title,
    priority: input.priority || "medium",
    reviewState: input.reviewState || firstIncompleteState(reviewRequirements),
    sourceIds: unique(input.sourceIds || []),
    sourceSurface: input.sourceSurface,
    contentArea: input.contentArea,
    summary: input.summary || "Review-only content queue item prepared from Phase 4.2 backlog.",
    reviewRequirements,
    notes: input.notes?.length ? input.notes : [createNote("Review-only item; excluded from live recommendation flows.")],
    reviewOnly: true,
    productionExcluded: true,
    productionEligible: false,
    excludedFromLiveRecommendations: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString(),
    updatedAt: input.updatedAt
  };
}

export function prioritizeContentReviewQueue(queue: TeoyubeContentReviewQueue): TeoyubeContentReviewQueue {
  const items = [...queue.items].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.title.localeCompare(b.title)
  );
  return { ...queue, items, status: statusForItems(items), updatedAt: new Date().toISOString() };
}

export function createContentReviewQueue(input: TeoyubeContentReviewQueueInput = {}): TeoyubeContentReviewQueue {
  const items = input.items || [];
  return prioritizeContentReviewQueue({
    id: input.id || "phase_4_3_content_review_queue",
    status: statusForItems(items),
    items,
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
    createdAt: new Date().toISOString()
  });
}

export function addContentReviewQueueItem(
  queue: TeoyubeContentReviewQueue,
  item: TeoyubeContentReviewQueueItem
): TeoyubeContentReviewQueue {
  return prioritizeContentReviewQueue({ ...queue, items: [...queue.items, item], updatedAt: new Date().toISOString() });
}

export function addContentReviewQueueItems(
  queue: TeoyubeContentReviewQueue,
  items: TeoyubeContentReviewQueueItem[]
): TeoyubeContentReviewQueue {
  return prioritizeContentReviewQueue({ ...queue, items: [...queue.items, ...items], updatedAt: new Date().toISOString() });
}

export function updateContentReviewQueueItem(
  queue: TeoyubeContentReviewQueue,
  itemId: string,
  update: Partial<Omit<TeoyubeContentReviewQueueItem, "id" | "reviewOnly" | "productionEligible" | "inMemoryOnly">>
): TeoyubeContentReviewQueue {
  const items = queue.items.map((item) =>
    item.id === itemId
      ? {
          ...item,
          ...update,
          reviewOnly: true as const,
          productionExcluded: true as const,
          productionEligible: false as const,
          excludedFromLiveRecommendations: true as const,
          inMemoryOnly: true as const,
          updatedAt: new Date().toISOString()
        }
      : item
  );
  return prioritizeContentReviewQueue({ ...queue, items, updatedAt: new Date().toISOString() });
}

export function getContentReviewQueueItemsByType(
  queue: TeoyubeContentReviewQueue,
  type: TeoyubeContentReviewQueueItemType
): TeoyubeContentReviewQueueItem[] {
  return queue.items.filter((entry) => entry.type === type);
}

export function getContentReviewQueueItemsByReviewState(
  queue: TeoyubeContentReviewQueue,
  state: TeoyubeContentReviewQueueReviewState
): TeoyubeContentReviewQueueItem[] {
  return queue.items.filter((entry) => entry.reviewState === state || entry.reviewRequirements.some((requirement) => requirement.reviewState === state && !requirement.complete));
}

export function getHighPriorityContentReviewQueueItems(queue: TeoyubeContentReviewQueue): TeoyubeContentReviewQueueItem[] {
  return queue.items.filter((entry) => entry.priority === "critical" || entry.priority === "high");
}

export function getContentReviewQueueBlockers(queue: TeoyubeContentReviewQueue): TeoyubeContentReviewQueueBlocker[] {
  return queue.items.flatMap((item) => {
    const blockers: TeoyubeContentReviewQueueBlocker[] = [];
    if (!item.id || !item.title) {
      blockers.push({
        id: `${item.id || "unknown"}_missing_identity`,
        itemId: item.id,
        type: item.type,
        message: "Content review queue item is missing an id or title.",
        requiredAction: "Add a stable id and title before review."
      });
    }
    if (item.reviewState === "blocked") {
      blockers.push({
        id: `${item.id}_blocked`,
        itemId: item.id,
        type: item.type,
        message: `${item.title} is blocked.`,
        requiredAction: "Resolve the blocked review state before future production use."
      });
    }
    if (CONTENT_REVIEW_TYPES.includes(item.type) && item.reviewRequirements.length === 0) {
      blockers.push({
        id: `${item.id}_missing_review_requirements`,
        itemId: item.id,
        type: item.type,
        message: `${item.title} lacks required review gates.`,
        requiredAction: "Add Scripture, theology, copy, and/or owner review requirements."
      });
    }
    return blockers;
  });
}

export function getContentReviewQueueWarnings(queue: TeoyubeContentReviewQueue): TeoyubeContentReviewQueueWarning[] {
  const queueWarnings: TeoyubeContentReviewQueueWarning[] = queue.items.length
    ? []
    : [
        {
          id: "content_review_queue_empty",
          type: "queue",
          message: "Content review queue is empty.",
          recommendedAction: "Convert Phase 4.2 backlog items before Phase 4.4 reviewed content integration."
        }
      ];

  return [
    ...queueWarnings,
    ...queue.items.flatMap((item) =>
      item.reviewRequirements
        .filter((requirement) => requirement.required && !requirement.complete)
        .map((requirement) => ({
          id: `${item.id}_${requirement.id}`,
          itemId: item.id,
          type: item.type,
          message: `${item.title} still needs ${requirement.label.toLowerCase()}.`,
          recommendedAction: requirement.description
        }))
    )
  ];
}

export function createContentReviewQueueDecision(queue: TeoyubeContentReviewQueue): TeoyubeContentReviewQueueDecision {
  const blockers = getContentReviewQueueBlockers(queue);
  const warnings = getContentReviewQueueWarnings(queue);
  if (!queue.items.length) return "empty";
  if (blockers.length) return "blocked";
  if (queue.items.some((entry) => entry.reviewState === "owner_review_required")) return "needs_owner_review";
  return warnings.length ? "queue_ready_with_warnings" : "queue_ready_for_review";
}

export function createContentReviewQueueReport(queue: TeoyubeContentReviewQueue): TeoyubeContentReviewQueueReport {
  const prioritized = prioritizeContentReviewQueue(queue);
  const blockers = getContentReviewQueueBlockers(prioritized);
  const warnings = getContentReviewQueueWarnings(prioritized);
  return {
    valid: blockers.length === 0,
    status: prioritized.status,
    decision: createContentReviewQueueDecision(prioritized),
    items: prioritized.items,
    highPriorityItems: getHighPriorityContentReviewQueueItems(prioritized),
    reviewRequiredItems: prioritized.items.filter((entry) => entry.reviewRequirements.some((requirement) => requirement.required && !requirement.complete)),
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
