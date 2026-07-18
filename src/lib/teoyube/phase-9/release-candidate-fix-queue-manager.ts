import type {
  TeoyubeReleaseCandidateFixCategory,
  TeoyubeReleaseCandidateFixDecision,
  TeoyubeReleaseCandidateFixPriority,
  TeoyubeReleaseCandidateFixQueue,
  TeoyubeReleaseCandidateFixQueueBlocker,
  TeoyubeReleaseCandidateFixQueueItem,
  TeoyubeReleaseCandidateFixQueueItemSource,
  TeoyubeReleaseCandidateFixQueueReport,
  TeoyubeReleaseCandidateFixQueueStatus,
  TeoyubeReleaseCandidateFixQueueWarning,
  TeoyubeReleaseCandidateFixRiskLevel,
  TeoyubeReleaseCandidateFixVerificationRequirement
} from "./release-candidate-fix-queue-contracts";

const PRIORITY_ORDER: Record<TeoyubeReleaseCandidateFixPriority, number> = {
  public_release_blocker: 0,
  high: 1,
  medium: 2,
  low: 3,
  defer: 4,
  unknown: 5
};

function verification(id: string, label: string, details: string): TeoyubeReleaseCandidateFixVerificationRequirement {
  return { id, label, required: true, details };
}

export function createReleaseCandidateFixQueueItem(input: Partial<TeoyubeReleaseCandidateFixQueueItem> & { title?: string } = {}): TeoyubeReleaseCandidateFixQueueItem {
  const category = input.category || "unknown";
  const priority = input.priority || "medium";
  const riskLevel = input.riskLevel || (priority === "public_release_blocker" ? "owner_review" : "safe_local");
  return {
    id: input.id || `release_candidate_fix_${category}`,
    title: input.title || "Release candidate fix item",
    category,
    priority,
    status: input.status || "queued",
    riskLevel,
    source: input.source || "unknown",
    details: input.details || "Manual release candidate fix queue item.",
    safeLocalFixAllowed: input.safeLocalFixAllowed ?? riskLevel === "safe_local",
    ownerReviewRequired: input.ownerReviewRequired ?? riskLevel !== "safe_local",
    verificationRequirements: input.verificationRequirements || [
      verification(`${category}_regression`, "Regression check", "Run final regression QA for this category."),
      verification(`${category}_safety`, "Safety boundary check", "Confirm Scripture, explanation, fallback, confidence, privacy, and service-disabled boundaries are unchanged.")
    ],
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function createReleaseCandidateFixQueue(input: Partial<TeoyubeReleaseCandidateFixQueue> = {}): TeoyubeReleaseCandidateFixQueue {
  return {
    id: input.id || "phase_9_3_release_candidate_fix_queue",
    items: input.items || [],
    manualOnly: true,
    noExternalWrite: true,
    noDatabasePersistence: true,
    noAnalytics: true,
    noExternalServices: true,
    noUserContact: true,
    noPublishing: true,
    noProductionJsonWrite: true,
    inMemoryOnly: true,
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function addReleaseCandidateFixQueueItem(queue: TeoyubeReleaseCandidateFixQueue, item: TeoyubeReleaseCandidateFixQueueItem): TeoyubeReleaseCandidateFixQueue {
  return { ...queue, items: [...queue.items, item] };
}

export function addReleaseCandidateFixQueueItems(queue: TeoyubeReleaseCandidateFixQueue, items: TeoyubeReleaseCandidateFixQueueItem[]): TeoyubeReleaseCandidateFixQueue {
  return { ...queue, items: [...queue.items, ...items] };
}

export function updateReleaseCandidateFixQueueItem(queue: TeoyubeReleaseCandidateFixQueue, itemId: string, update: Partial<TeoyubeReleaseCandidateFixQueueItem>): TeoyubeReleaseCandidateFixQueue {
  return { ...queue, items: queue.items.map((item) => item.id === itemId ? { ...item, ...update } : item) };
}

export function prioritizeReleaseCandidateFixQueue(queue: TeoyubeReleaseCandidateFixQueue): TeoyubeReleaseCandidateFixQueue {
  return { ...queue, items: [...queue.items].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) };
}

export function getReleaseCandidateFixItemsByCategory(queue: TeoyubeReleaseCandidateFixQueue, category: TeoyubeReleaseCandidateFixCategory): TeoyubeReleaseCandidateFixQueueItem[] {
  return queue.items.filter((item) => item.category === category);
}

export function getReleaseCandidateFixItemsByPriority(queue: TeoyubeReleaseCandidateFixQueue, priority: TeoyubeReleaseCandidateFixPriority): TeoyubeReleaseCandidateFixQueueItem[] {
  return queue.items.filter((item) => item.priority === priority);
}

export function getReleaseCandidateBlockingFixItems(queue: TeoyubeReleaseCandidateFixQueue): TeoyubeReleaseCandidateFixQueueItem[] {
  return queue.items.filter((item) => item.priority === "public_release_blocker" || item.status === "blocked");
}

export function getReleaseCandidateFixQueueBlockers(queue: TeoyubeReleaseCandidateFixQueue): TeoyubeReleaseCandidateFixQueueBlocker[] {
  const boundaryBlockers = queue.manualOnly && queue.noExternalWrite && queue.noDatabasePersistence && queue.noAnalytics && queue.noExternalServices && queue.noUserContact && queue.noPublishing && queue.noProductionJsonWrite && queue.inMemoryOnly
    ? []
    : [{ id: "fix_queue_boundary_blocker", category: "unknown" as const, message: "Release candidate fix queue must remain manual, in-memory, no-write, no-contact, no-publishing, no-analytics, no-persistence, and service-disabled.", requiredAction: "Restore fix queue boundaries." }];
  return [
    ...boundaryBlockers,
    ...queue.items.filter((item) => item.status === "blocked").map((item) => ({ id: `${item.id}_blocked`, itemId: item.id, category: item.category, message: item.details, requiredAction: "Resolve or defer with owner review before final go/no-go." }))
  ];
}

export function getReleaseCandidateFixQueueWarnings(queue: TeoyubeReleaseCandidateFixQueue): TeoyubeReleaseCandidateFixQueueWarning[] {
  return [
    { id: "fix_queue_manual_only", category: "unknown", message: "Release candidate fix queue is manual and in-memory only.", recommendedAction: "Review queue before Phase 9.4." },
    ...getReleaseCandidateBlockingFixItems(queue)
      .filter((item) => item.status !== "verified" && item.status !== "fixed" && item.status !== "blocked")
      .map((item) => ({ id: `${item.id}_public_blocker_pending`, itemId: item.id, category: item.category, message: `${item.title} remains a public release blocker until fixed or explicitly deferred.`, recommendedAction: "Move to safe remediation, owner review, or deferred decision." })),
    ...queue.items.filter((item) => item.ownerReviewRequired).map((item) => ({ id: `${item.id}_owner_review`, itemId: item.id, category: item.category, message: `${item.title} requires owner review.`, recommendedAction: "Review manually before final go/no-go." }))
  ];
}

export function createReleaseCandidateFixQueueDecision(queue: TeoyubeReleaseCandidateFixQueue): TeoyubeReleaseCandidateFixDecision {
  if (getReleaseCandidateFixQueueBlockers(queue).length) return "fix_queue_blocked";
  if (getReleaseCandidateBlockingFixItems(queue).some((item) => item.status !== "fixed" && item.status !== "verified" && item.status !== "deferred")) return "fix_queue_has_blockers";
  return getReleaseCandidateFixQueueWarnings(queue).length ? "fix_queue_ready_with_warnings" : "fix_queue_ready";
}

export function createReleaseCandidateFixQueueReport(queue: TeoyubeReleaseCandidateFixQueue): TeoyubeReleaseCandidateFixQueueReport {
  const blockers = getReleaseCandidateFixQueueBlockers(queue);
  const warnings = getReleaseCandidateFixQueueWarnings(queue);
  return {
    valid: blockers.length === 0,
    decision: createReleaseCandidateFixQueueDecision(queue),
    queue,
    blockers,
    warnings,
    summary: {
      totalItems: queue.items.length,
      blockingItems: getReleaseCandidateBlockingFixItems(queue).length,
      safeLocalItems: queue.items.filter((item) => item.safeLocalFixAllowed).length,
      ownerReviewItems: queue.items.filter((item) => item.ownerReviewRequired).length,
      blockedItems: queue.items.filter((item) => item.status === "blocked").length,
      deferredItems: queue.items.filter((item) => item.status === "deferred").length,
      verifiedItems: queue.items.filter((item) => item.status === "verified").length
    },
    manualOnly: true,
    noExternalWrite: true,
    noExternalServices: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export type TeoyubeReleaseCandidateFixQueueItemInput = Partial<TeoyubeReleaseCandidateFixQueueItem> & {
  category?: TeoyubeReleaseCandidateFixCategory;
  priority?: TeoyubeReleaseCandidateFixPriority;
  source?: TeoyubeReleaseCandidateFixQueueItemSource;
  status?: TeoyubeReleaseCandidateFixQueueStatus;
  riskLevel?: TeoyubeReleaseCandidateFixRiskLevel;
};
