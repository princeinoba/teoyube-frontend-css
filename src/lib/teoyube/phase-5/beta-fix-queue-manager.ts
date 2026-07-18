import type {
  TeoyubeBetaFixQueue,
  TeoyubeBetaFixQueueBlocker,
  TeoyubeBetaFixQueueCategory,
  TeoyubeBetaFixQueueDecision,
  TeoyubeBetaFixQueueItem,
  TeoyubeBetaFixQueueItemSource,
  TeoyubeBetaFixQueuePriority,
  TeoyubeBetaFixQueueReport,
  TeoyubeBetaFixQueueRiskLevel,
  TeoyubeBetaFixQueueStatus,
  TeoyubeBetaFixQueueWarning,
  TeoyubeBetaFixVerificationRequirement
} from "./beta-fix-queue-contracts";

function now(): string {
  return new Date().toISOString();
}

function verification(id: string, label: string, details: string): TeoyubeBetaFixVerificationRequirement {
  return { id, label, required: true, details };
}

function defaultVerificationRequirements(category: TeoyubeBetaFixQueueCategory): TeoyubeBetaFixVerificationRequirement[] {
  const common = [
    verification("scripture_anchor_regression", "Scripture anchors remain protected", "Verify no Scripture anchor was removed or invented."),
    verification("explanation_trace_regression", "Explanation traces remain visible", "Verify explanation paths or fallback reasons remain visible."),
    verification("fallback_safety_regression", "Fallback safety remains intact", "Verify fallback states remain safe and non-empty."),
    verification("disabled_service_regression", "Disabled services remain disabled", "Verify no database, analytics, monitoring provider, live AI, admin auth, CMS, or automatic contact was added.")
  ];
  if (category === "mobile" || category === "accessibility" || category === "promise_table" || category === "tig_graph_explorer") {
    return [...common, verification("mobile_accessibility_regression", "Mobile/accessibility state is not worse", "Verify labels, wrapping, keyboard basics, and list fallback remain usable.")];
  }
  if (category === "reviewed_content_gate") {
    return [...common, verification("reviewed_content_gate_regression", "Reviewed content gate remains active", "Verify review-only content is not live and release candidates are not auto-published.")];
  }
  return common;
}

function priorityRank(priority: TeoyubeBetaFixQueuePriority): number {
  return {
    beta_blocker: 0,
    high: 1,
    medium: 2,
    low: 3,
    defer: 4,
    unknown: 5
  }[priority];
}

function statusFromItems(items: TeoyubeBetaFixQueueItem[]): TeoyubeBetaFixQueueStatus {
  if (!items.length) return "new";
  if (items.some((item) => item.status === "blocked")) return "blocked";
  if (items.some((item) => item.status === "owner_review_required")) return "owner_review_required";
  if (items.every((item) => item.status === "verified")) return "verified";
  if (items.every((item) => item.status === "fixed" || item.status === "verified")) return "fixed";
  return "queued";
}

export function createBetaFixQueueItem(input: {
  id?: string;
  title: string;
  description?: string;
  source?: TeoyubeBetaFixQueueItemSource;
  sourceId?: string;
  category?: TeoyubeBetaFixQueueCategory;
  priority?: TeoyubeBetaFixQueuePriority;
  riskLevel?: TeoyubeBetaFixQueueRiskLevel;
  status?: TeoyubeBetaFixQueueStatus;
  safeLocalFixAllowed?: boolean;
  ownerReviewRequired?: boolean;
  blockedReason?: string;
  deferredReason?: string;
  proposedFix?: string;
  verificationRequirements?: TeoyubeBetaFixVerificationRequirement[];
}): TeoyubeBetaFixQueueItem {
  const category = input.category || "unknown";
  const riskLevel = input.riskLevel || (input.priority === "beta_blocker" ? "high" : "medium");
  const ownerReviewRequired = input.ownerReviewRequired ?? ["scripture_anchor", "explanation_trace", "reviewed_content_gate", "disabled_service", "privacy_consent", "controlled_admin", "real_data"].includes(category);
  return {
    id: input.id || `beta_fix_${category}_${Date.now()}`,
    title: input.title,
    description: input.description || "",
    source: input.source || "unknown",
    sourceId: input.sourceId,
    category,
    priority: input.priority || "medium",
    riskLevel,
    status: input.status || (input.blockedReason ? "blocked" : ownerReviewRequired ? "owner_review_required" : "queued"),
    safeLocalFixAllowed: input.safeLocalFixAllowed ?? (!ownerReviewRequired && riskLevel !== "blocked" && input.priority !== "defer"),
    ownerReviewRequired,
    blockedReason: input.blockedReason,
    deferredReason: input.deferredReason,
    proposedFix: input.proposedFix || "Review manually and apply only a safe local remediation if it preserves Phase 5 safety constraints.",
    verificationRequirements: input.verificationRequirements || defaultVerificationRequirements(category),
    noProductionDataWrite: true,
    noServiceConnection: true,
    noUserContact: true,
    noAutomaticPublishing: true,
    createdAt: now()
  };
}

export function createBetaFixQueue(input: {
  id?: string;
  items?: TeoyubeBetaFixQueueItem[];
} = {}): TeoyubeBetaFixQueue {
  const createdAt = now();
  const items = input.items || [];
  return {
    id: input.id || "phase_5_3_beta_fix_queue",
    status: statusFromItems(items),
    items,
    manualOnly: true,
    inMemoryOnly: true,
    noFilesWritten: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noExternalServicesRequired: true,
    noUsersContacted: true,
    noAutomaticPublishing: true,
    createdAt,
    updatedAt: createdAt
  };
}

export function addBetaFixQueueItem(queue: TeoyubeBetaFixQueue, item: TeoyubeBetaFixQueueItem): TeoyubeBetaFixQueue {
  const items = [...queue.items, item];
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function addBetaFixQueueItems(queue: TeoyubeBetaFixQueue, itemsToAdd: TeoyubeBetaFixQueueItem[]): TeoyubeBetaFixQueue {
  const items = [...queue.items, ...itemsToAdd];
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function updateBetaFixQueueItem(
  queue: TeoyubeBetaFixQueue,
  itemId: string,
  update: Partial<Omit<TeoyubeBetaFixQueueItem, "id" | "createdAt">>
): TeoyubeBetaFixQueue {
  const items = queue.items.map((item) => item.id === itemId ? { ...item, ...update, updatedAt: now() } : item);
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function prioritizeBetaFixQueue(queue: TeoyubeBetaFixQueue): TeoyubeBetaFixQueue {
  const items = [...queue.items].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.createdAt.localeCompare(b.createdAt));
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function getBetaFixQueueItemsByCategory(queue: TeoyubeBetaFixQueue, category: TeoyubeBetaFixQueueCategory): TeoyubeBetaFixQueueItem[] {
  return queue.items.filter((item) => item.category === category);
}

export function getBetaFixQueueItemsByPriority(queue: TeoyubeBetaFixQueue, priority: TeoyubeBetaFixQueuePriority): TeoyubeBetaFixQueueItem[] {
  return queue.items.filter((item) => item.priority === priority);
}

export function getBetaBlockingFixItems(queue: TeoyubeBetaFixQueue): TeoyubeBetaFixQueueItem[] {
  return queue.items.filter((item) => item.priority === "beta_blocker" && item.status !== "verified" && item.status !== "fixed");
}

export function getBetaFixQueueBlockers(queue: TeoyubeBetaFixQueue): TeoyubeBetaFixQueueBlocker[] {
  return [
    !queue.manualOnly || !queue.inMemoryOnly || !queue.noFilesWritten || !queue.noDatabasePersistenceEnabled || !queue.noAnalyticsEnabled || !queue.noExternalServicesRequired || !queue.noUsersContacted || !queue.noAutomaticPublishing
      ? {
          id: "beta_fix_queue_boundary_broken",
          category: "unknown" as const,
          message: "Beta fix queue must remain manual, in-memory, no-file-write, no-persistence, no-analytics, no-service, no-contact, and no-publishing.",
          requiredAction: "Restore Phase 5.3 queue boundaries before remediation."
        }
      : undefined,
    ...getBetaBlockingFixItems(queue).map((item) => ({
      id: `${item.id}_beta_blocker`,
      itemId: item.id,
      category: item.category,
      message: `${item.title} remains a beta blocker.`,
      requiredAction: "Resolve, verify, defer with owner approval, or keep beta go/no-go blocked."
    })),
    ...queue.items
      .filter((item) => item.status === "blocked")
      .map((item) => ({
        id: `${item.id}_blocked`,
        itemId: item.id,
        category: item.category,
        message: item.blockedReason || `${item.title} is blocked.`,
        requiredAction: "Do not remediate until the blocker is removed by owner-approved safe work."
      }))
  ].filter(Boolean) as TeoyubeBetaFixQueueBlocker[];
}

export function getBetaFixQueueWarnings(queue: TeoyubeBetaFixQueue): TeoyubeBetaFixQueueWarning[] {
  return [
    ...queue.items
      .filter((item) => item.ownerReviewRequired && item.status !== "verified")
      .map((item) => ({
        id: `${item.id}_owner_review`,
        itemId: item.id,
        category: item.category,
        message: `${item.title} requires owner review before remediation.`,
        recommendedAction: "Keep item out of automatic remediation and route to Phase 5.3 owner review."
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

export function createBetaFixQueueDecision(queue: TeoyubeBetaFixQueue): TeoyubeBetaFixQueueDecision {
  const blockers = getBetaFixQueueBlockers(queue);
  const warnings = getBetaFixQueueWarnings(queue);
  if (!queue.items.length) return "empty";
  if (blockers.length) return "blocked";
  if (warnings.some((warning) => warning.id.endsWith("_owner_review"))) return "owner_review_required";
  return warnings.length ? "ready_with_warnings" : "ready_for_remediation";
}

export function createBetaFixQueueReport(queue: TeoyubeBetaFixQueue = createBetaFixQueue()): TeoyubeBetaFixQueueReport {
  const blockers = getBetaFixQueueBlockers(queue);
  const warnings = getBetaFixQueueWarnings(queue);
  return {
    valid: blockers.length === 0,
    decision: createBetaFixQueueDecision(queue),
    queue,
    blockers,
    warnings,
    itemCount: queue.items.length,
    betaBlockerCount: getBetaBlockingFixItems(queue).length,
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
    noAutomaticPublishing: true,
    generatedAt: now()
  };
}
