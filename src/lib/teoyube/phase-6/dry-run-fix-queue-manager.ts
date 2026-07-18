import type {
  TeoyubeDryRunFixQueue,
  TeoyubeDryRunFixQueueBlocker,
  TeoyubeDryRunFixQueueCategory,
  TeoyubeDryRunFixQueueDecision,
  TeoyubeDryRunFixQueueItem,
  TeoyubeDryRunFixQueueItemSource,
  TeoyubeDryRunFixQueuePriority,
  TeoyubeDryRunFixQueueReport,
  TeoyubeDryRunFixQueueRiskLevel,
  TeoyubeDryRunFixQueueStatus,
  TeoyubeDryRunFixQueueWarning,
  TeoyubeDryRunFixVerificationRequirement
} from "./dry-run-fix-queue-contracts";

function now(): string {
  return new Date().toISOString();
}

function verification(id: string, label: string, details: string): TeoyubeDryRunFixVerificationRequirement {
  return { id, label, required: true, details };
}

function defaultVerificationRequirements(category: TeoyubeDryRunFixQueueCategory): TeoyubeDryRunFixVerificationRequirement[] {
  const common = [
    verification("scripture_anchor_regression", "Scripture anchors remain protected", "Verify no Scripture anchor was removed, hidden, or invented."),
    verification("explanation_trace_regression", "Explanation traces remain visible", "Verify explanation paths and fallback reasons remain visible."),
    verification("fallback_safety_regression", "Fallback safety remains intact", "Verify fallback states remain safe, non-empty, humble, and bounded."),
    verification("confidence_label_regression", "Confidence labels remain visible", "Verify confidence or uncertainty labels remain visible."),
    verification("privacy_service_regression", "Privacy and disabled-service boundaries remain intact", "Verify no automatic contact, feedback collection, persistence, analytics, live AI, CMS, admin auth, or external service dependency was added.")
  ];
  if (["mobile", "accessibility", "promise_table", "tig_graph_explorer"].includes(category)) {
    return [...common, verification("mobile_accessibility_regression", "Mobile/accessibility state is not worse", "Verify wrapping, readable labels, keyboard basics, and list fallback remain usable.")];
  }
  if (category === "reviewed_content_gate") {
    return [...common, verification("reviewed_content_gate_regression", "Reviewed-content gate remains active", "Verify review-only content remains excluded and no automatic publishing exists.")];
  }
  if (category === "service_disabled_state") {
    return [...common, verification("disabled_service_lock", "Disabled services remain disabled", "Verify database, analytics, monitoring, live AI, CMS, admin auth, feedback storage, messaging, and URL fetching remain disabled.")];
  }
  return common;
}

function priorityRank(priority: TeoyubeDryRunFixQueuePriority): number {
  return {
    dry_run_blocker: 0,
    high: 1,
    medium: 2,
    low: 3,
    defer: 4,
    unknown: 5
  }[priority];
}

function statusFromItems(items: TeoyubeDryRunFixQueueItem[]): TeoyubeDryRunFixQueueStatus {
  if (!items.length) return "new";
  if (items.some((item) => item.status === "blocked")) return "blocked";
  if (items.some((item) => item.status === "owner_review_required")) return "owner_review_required";
  if (items.every((item) => item.status === "verified")) return "verified";
  if (items.every((item) => item.status === "fixed" || item.status === "verified")) return "fixed";
  return "queued";
}

export function createDryRunFixQueueItem(input: {
  id?: string;
  title: string;
  description?: string;
  source?: TeoyubeDryRunFixQueueItemSource;
  sourceId?: string;
  category?: TeoyubeDryRunFixQueueCategory;
  priority?: TeoyubeDryRunFixQueuePriority;
  riskLevel?: TeoyubeDryRunFixQueueRiskLevel;
  status?: TeoyubeDryRunFixQueueStatus;
  safeLocalFixAllowed?: boolean;
  ownerReviewRequired?: boolean;
  blockedReason?: string;
  deferredReason?: string;
  proposedFix?: string;
  verificationRequirements?: TeoyubeDryRunFixVerificationRequirement[];
}): TeoyubeDryRunFixQueueItem {
  const category = input.category || "unknown";
  const priority = input.priority || "medium";
  const riskLevel = input.riskLevel || (priority === "dry_run_blocker" ? "high" : "medium");
  const ownerReviewRequired = input.ownerReviewRequired ?? [
    "scripture_anchor",
    "explanation_trace",
    "fallback",
    "reviewed_content_gate",
    "service_disabled_state",
    "privacy_consent",
    "controlled_admin"
  ].includes(category);
  const safeLocalFixAllowed = input.safeLocalFixAllowed ?? (!ownerReviewRequired && riskLevel !== "blocked" && priority !== "defer" && priority !== "dry_run_blocker");
  return {
    id: input.id || `dry_run_fix_${category}_${Date.now()}`,
    title: input.title,
    description: input.description || "",
    source: input.source || "unknown",
    sourceId: input.sourceId,
    category,
    priority,
    riskLevel,
    status: input.status || (input.blockedReason ? "blocked" : input.deferredReason ? "deferred" : ownerReviewRequired ? "owner_review_required" : safeLocalFixAllowed ? "safe_to_fix" : "queued"),
    safeLocalFixAllowed,
    ownerReviewRequired,
    blockedReason: input.blockedReason,
    deferredReason: input.deferredReason,
    proposedFix: input.proposedFix || "Review manually and apply only a safe local stabilization if it preserves Phase 6 safety constraints.",
    verificationRequirements: input.verificationRequirements || defaultVerificationRequirements(category),
    noProductionDataWrite: true,
    noServiceConnection: true,
    noUserContact: true,
    noAutomaticPublishing: true,
    noFeedbackCollection: true,
    createdAt: now()
  };
}

export function createDryRunFixQueue(input: {
  id?: string;
  items?: TeoyubeDryRunFixQueueItem[];
} = {}): TeoyubeDryRunFixQueue {
  const createdAt = now();
  const items = input.items || [];
  return {
    id: input.id || "phase_6_3_dry_run_fix_queue",
    status: statusFromItems(items),
    items,
    manualOnly: true,
    inMemoryOnly: true,
    noFilesWritten: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noExternalServicesRequired: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noAutomaticPublishing: true,
    createdAt,
    updatedAt: createdAt
  };
}

export function addDryRunFixQueueItem(queue: TeoyubeDryRunFixQueue, item: TeoyubeDryRunFixQueueItem): TeoyubeDryRunFixQueue {
  const items = [...queue.items, item];
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function addDryRunFixQueueItems(queue: TeoyubeDryRunFixQueue, itemsToAdd: TeoyubeDryRunFixQueueItem[]): TeoyubeDryRunFixQueue {
  const items = [...queue.items, ...itemsToAdd];
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function updateDryRunFixQueueItem(
  queue: TeoyubeDryRunFixQueue,
  itemId: string,
  update: Partial<Omit<TeoyubeDryRunFixQueueItem, "id" | "createdAt">>
): TeoyubeDryRunFixQueue {
  const items = queue.items.map((item) => item.id === itemId ? { ...item, ...update, updatedAt: now() } : item);
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function prioritizeDryRunFixQueue(queue: TeoyubeDryRunFixQueue): TeoyubeDryRunFixQueue {
  const items = [...queue.items].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.createdAt.localeCompare(b.createdAt));
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function getDryRunFixQueueItemsByCategory(queue: TeoyubeDryRunFixQueue, category: TeoyubeDryRunFixQueueCategory): TeoyubeDryRunFixQueueItem[] {
  return queue.items.filter((item) => item.category === category);
}

export function getDryRunFixQueueItemsByPriority(queue: TeoyubeDryRunFixQueue, priority: TeoyubeDryRunFixQueuePriority): TeoyubeDryRunFixQueueItem[] {
  return queue.items.filter((item) => item.priority === priority);
}

export function getDryRunBlockingFixItems(queue: TeoyubeDryRunFixQueue): TeoyubeDryRunFixQueueItem[] {
  return queue.items.filter((item) => item.priority === "dry_run_blocker" && !["verified", "fixed", "deferred"].includes(item.status));
}

export function getDryRunFixQueueBlockers(queue: TeoyubeDryRunFixQueue): TeoyubeDryRunFixQueueBlocker[] {
  return [
    !queue.manualOnly || !queue.inMemoryOnly || !queue.noFilesWritten || !queue.noDatabasePersistenceEnabled || !queue.noAnalyticsEnabled || !queue.noExternalServicesRequired || !queue.noUsersContacted || !queue.noFeedbackCollectedAutomatically || !queue.noAutomaticPublishing
      ? {
          id: "dry_run_fix_queue_boundary_broken",
          category: "unknown" as const,
          message: "Dry-run fix queue must remain manual, in-memory, no-file-write, no-persistence, no-analytics, no-service, no-contact, no-feedback-collection, and no-publishing.",
          requiredAction: "Restore Phase 6.3 queue boundaries before stabilization."
        }
      : undefined,
    ...getDryRunBlockingFixItems(queue).map((item) => ({
      id: `${item.id}_dry_run_blocker`,
      itemId: item.id,
      category: item.category,
      message: `${item.title} remains a dry-run blocker.`,
      requiredAction: "Resolve, verify, defer with owner approval, or keep controlled beta execution readiness blocked."
    })),
    ...queue.items
      .filter((item) => item.status === "blocked")
      .map((item) => ({
        id: `${item.id}_blocked`,
        itemId: item.id,
        category: item.category,
        message: item.blockedReason || `${item.title} is blocked.`,
        requiredAction: "Do not stabilize until the blocker is removed by owner-approved safe work."
      }))
  ].filter(Boolean) as TeoyubeDryRunFixQueueBlocker[];
}

export function getDryRunFixQueueWarnings(queue: TeoyubeDryRunFixQueue): TeoyubeDryRunFixQueueWarning[] {
  return [
    ...queue.items
      .filter((item) => item.ownerReviewRequired && item.status !== "verified")
      .map((item) => ({
        id: `${item.id}_owner_review`,
        itemId: item.id,
        category: item.category,
        message: `${item.title} requires owner review before stabilization.`,
        recommendedAction: "Keep item out of automatic remediation and route to Phase 6.3 owner review."
      })),
    ...queue.items
      .filter((item) => item.status === "deferred" || item.priority === "defer")
      .map((item) => ({
        id: `${item.id}_deferred`,
        itemId: item.id,
        category: item.category,
        message: item.deferredReason || `${item.title} is deferred.`,
        recommendedAction: "Keep deferred item documented for future owner review."
      }))
  ];
}

export function createDryRunFixQueueDecision(queue: TeoyubeDryRunFixQueue): TeoyubeDryRunFixQueueDecision {
  const blockers = getDryRunFixQueueBlockers(queue);
  const warnings = getDryRunFixQueueWarnings(queue);
  if (!queue.items.length) return "empty";
  if (blockers.length) return "blocked";
  if (warnings.some((warning) => warning.id.endsWith("_owner_review"))) return "owner_review_required";
  return warnings.length ? "ready_with_warnings" : "ready_for_stabilization";
}

export function createDryRunFixQueueReport(queue: TeoyubeDryRunFixQueue = createDryRunFixQueue()): TeoyubeDryRunFixQueueReport {
  const blockers = getDryRunFixQueueBlockers(queue);
  return {
    valid: blockers.length === 0,
    decision: createDryRunFixQueueDecision(queue),
    queue,
    blockers,
    warnings: getDryRunFixQueueWarnings(queue),
    itemCount: queue.items.length,
    dryRunBlockerCount: getDryRunBlockingFixItems(queue).length,
    ownerReviewRequiredCount: queue.items.filter((item) => item.ownerReviewRequired).length,
    deferredCount: queue.items.filter((item) => item.status === "deferred" || item.priority === "defer").length,
    safeToFixCount: queue.items.filter((item) => item.safeLocalFixAllowed && item.status !== "blocked").length,
    manualOnly: true,
    inMemoryOnly: true,
    noFilesWritten: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noExternalServicesRequired: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noAutomaticPublishing: true,
    generatedAt: now()
  };
}
