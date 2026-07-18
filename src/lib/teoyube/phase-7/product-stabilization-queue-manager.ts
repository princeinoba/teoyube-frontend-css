import type {
  TeoyubeProductStabilizationCategory,
  TeoyubeProductStabilizationDecision,
  TeoyubeProductStabilizationPriority,
  TeoyubeProductStabilizationQueue,
  TeoyubeProductStabilizationQueueBlocker,
  TeoyubeProductStabilizationQueueItem,
  TeoyubeProductStabilizationQueueItemSource,
  TeoyubeProductStabilizationQueueReport,
  TeoyubeProductStabilizationQueueStatus,
  TeoyubeProductStabilizationQueueWarning,
  TeoyubeProductStabilizationRiskLevel,
  TeoyubeProductStabilizationVerificationRequirement
} from "./product-stabilization-queue-contracts";

function now(): string {
  return new Date().toISOString();
}

function verification(id: string, label: string, details: string): TeoyubeProductStabilizationVerificationRequirement {
  return { id, label, required: true, details };
}

export function getDefaultProductStabilizationVerificationRequirements(category: TeoyubeProductStabilizationCategory): TeoyubeProductStabilizationVerificationRequirement[] {
  const common = [
    verification("scripture_anchor_regression", "Scripture anchors remain protected", "Verify no Scripture anchor was removed, hidden, or invented."),
    verification("explanation_trace_regression", "Explanation traces remain visible", "Verify explanation paths and fallback reasons remain visible."),
    verification("fallback_safety_regression", "Fallback safety remains intact", "Verify fallback states remain safe, non-empty, humble, and bounded."),
    verification("confidence_label_regression", "Confidence labels remain visible", "Verify confidence or uncertainty labels remain visible."),
    verification("privacy_service_regression", "Privacy and disabled-service boundaries remain intact", "Verify no automatic contact, feedback collection, persistence, analytics, live AI, CMS, admin auth, monitoring provider, messaging, or external service dependency was added.")
  ];
  if (["mobile", "accessibility", "promise_table", "tig_graph_explorer"].includes(category)) {
    return [...common, verification("mobile_accessibility_regression", "Mobile/accessibility state is not worse", "Verify wrapping, readable labels, keyboard basics, and list fallback remain usable.")];
  }
  if (category === "reviewed_content_gate") {
    return [...common, verification("reviewed_content_gate_regression", "Reviewed-content gate remains active", "Verify review-only content remains excluded and no automatic publishing exists.")];
  }
  if (category === "service_disabled_state") {
    return [...common, verification("disabled_service_lock", "Disabled services remain disabled", "Verify database, analytics, monitoring, live AI, CMS, admin auth, feedback storage, messaging, URL fetching, and browser persistence remain disabled.")];
  }
  return common;
}

function priorityRank(priority: TeoyubeProductStabilizationPriority): number {
  return {
    beta_operations_blocker: 0,
    high: 1,
    medium: 2,
    low: 3,
    defer: 4,
    unknown: 5
  }[priority];
}

function statusFromItems(items: TeoyubeProductStabilizationQueueItem[]): TeoyubeProductStabilizationQueueStatus {
  if (!items.length) return "new";
  if (items.some((item) => item.status === "blocked")) return "blocked";
  if (items.some((item) => item.status === "owner_review_required")) return "owner_review_required";
  if (items.every((item) => item.status === "verified")) return "verified";
  if (items.every((item) => item.status === "fixed" || item.status === "verified")) return "fixed";
  if (items.some((item) => item.status === "safe_to_fix")) return "safe_to_fix";
  return "queued";
}

function needsOwnerReview(category: TeoyubeProductStabilizationCategory, priority: TeoyubeProductStabilizationPriority): boolean {
  return priority === "beta_operations_blocker" || [
    "scripture_anchor",
    "explanation_trace",
    "fallback",
    "confidence_label",
    "privacy_consent",
    "reviewed_content_gate",
    "service_disabled_state",
    "controlled_admin",
    "support_workflow",
    "feedback_review",
    "issue_triage"
  ].includes(category);
}

export function createProductStabilizationQueueItem(input: {
  id?: string;
  title: string;
  description?: string;
  source?: TeoyubeProductStabilizationQueueItemSource;
  sourceId?: string;
  category?: TeoyubeProductStabilizationCategory;
  priority?: TeoyubeProductStabilizationPriority;
  riskLevel?: TeoyubeProductStabilizationRiskLevel;
  status?: TeoyubeProductStabilizationQueueStatus;
  safeLocalFixAllowed?: boolean;
  ownerReviewRequired?: boolean;
  blockedReason?: string;
  deferredReason?: string;
  proposedFix?: string;
  verificationRequirements?: TeoyubeProductStabilizationVerificationRequirement[];
  preservesScriptureAnchors?: boolean;
  preservesExplanationTraces?: boolean;
  preservesFallbackSafety?: boolean;
  preservesConfidenceLabels?: boolean;
  preservesPrivacyConsent?: boolean;
  noDivineCertaintyClaimed?: boolean;
}): TeoyubeProductStabilizationQueueItem {
  const category = input.category || "unknown";
  const priority = input.priority || "medium";
  const riskLevel = input.riskLevel || (priority === "beta_operations_blocker" ? "high" : "medium");
  const ownerReviewRequired = input.ownerReviewRequired ?? needsOwnerReview(category, priority);
  const safeLocalFixAllowed = input.safeLocalFixAllowed ?? (!ownerReviewRequired && riskLevel !== "blocked" && priority !== "defer" && priority !== "beta_operations_blocker");
  return {
    id: input.id || `product_stabilization_${category}_${Date.now()}`,
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
    proposedFix: input.proposedFix || "Review manually and apply only a small, local, reversible stabilization that preserves Phase 7 safety constraints.",
    verificationRequirements: input.verificationRequirements || getDefaultProductStabilizationVerificationRequirements(category),
    noProductionDataWrite: true,
    noServiceConnection: true,
    noUserContact: true,
    noAutomaticPublishing: true,
    noFeedbackCollection: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    preservesScriptureAnchors: input.preservesScriptureAnchors ?? true,
    preservesExplanationTraces: input.preservesExplanationTraces ?? true,
    preservesFallbackSafety: input.preservesFallbackSafety ?? true,
    preservesConfidenceLabels: input.preservesConfidenceLabels ?? true,
    preservesPrivacyConsent: input.preservesPrivacyConsent ?? true,
    noDivineCertaintyClaimed: input.noDivineCertaintyClaimed ?? true,
    createdAt: now()
  };
}

export function createProductStabilizationQueue(input: { id?: string; items?: TeoyubeProductStabilizationQueueItem[] } = {}): TeoyubeProductStabilizationQueue {
  const createdAt = now();
  const items = input.items || [];
  return {
    id: input.id || "phase_7_2_product_stabilization_queue",
    status: statusFromItems(items),
    items,
    manualOnly: true,
    inMemoryOnly: true,
    noFilesWritten: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noExternalServicesRequired: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noAutomaticPublishing: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    createdAt,
    updatedAt: createdAt
  };
}

export function addProductStabilizationQueueItem(queue: TeoyubeProductStabilizationQueue, item: TeoyubeProductStabilizationQueueItem): TeoyubeProductStabilizationQueue {
  const items = [...queue.items, item];
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function addProductStabilizationQueueItems(queue: TeoyubeProductStabilizationQueue, itemsToAdd: TeoyubeProductStabilizationQueueItem[]): TeoyubeProductStabilizationQueue {
  const items = [...queue.items, ...itemsToAdd];
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function updateProductStabilizationQueueItem(
  queue: TeoyubeProductStabilizationQueue,
  itemId: string,
  update: Partial<Omit<TeoyubeProductStabilizationQueueItem, "id" | "createdAt">>
): TeoyubeProductStabilizationQueue {
  const items = queue.items.map((item) => item.id === itemId ? { ...item, ...update, updatedAt: now() } : item);
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function prioritizeProductStabilizationQueue(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationQueue {
  const items = [...queue.items].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.createdAt.localeCompare(b.createdAt));
  return { ...queue, items, status: statusFromItems(items), updatedAt: now() };
}

export function getProductStabilizationItemsByCategory(queue: TeoyubeProductStabilizationQueue, category: TeoyubeProductStabilizationCategory): TeoyubeProductStabilizationQueueItem[] {
  return queue.items.filter((item) => item.category === category);
}

export function getProductStabilizationItemsByPriority(queue: TeoyubeProductStabilizationQueue, priority: TeoyubeProductStabilizationPriority): TeoyubeProductStabilizationQueueItem[] {
  return queue.items.filter((item) => item.priority === priority);
}

export function getProductStabilizationBlockingItems(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationQueueItem[] {
  return queue.items.filter((item) => item.priority === "beta_operations_blocker" && !["verified", "fixed", "deferred"].includes(item.status));
}

export function getProductStabilizationQueueBlockers(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationQueueBlocker[] {
  return [
    !queue.manualOnly || !queue.inMemoryOnly || !queue.noFilesWritten || !queue.noDatabasePersistenceEnabled || !queue.noAnalyticsEnabled || !queue.noMonitoringProviderConnected || !queue.noExternalServicesRequired || !queue.noUsersContacted || !queue.noFeedbackCollectedAutomatically || !queue.noAutomaticPublishing || !queue.noLiveAiOrchestrationEnabled || !queue.noAdminAuthAdded || !queue.noCmsConnected || !queue.noBrowserPersistenceRequired
      ? {
          id: "product_stabilization_queue_boundary_broken",
          category: "unknown" as const,
          message: "Product stabilization queue must remain manual, in-memory, no-file-write, no-persistence, no-analytics, no-monitoring-provider, no-service, no-contact, no-feedback-collection, no-publishing, no-live-AI, no-admin-auth, no-CMS, and no-browser-persistence.",
          requiredAction: "Restore Phase 7.2 queue boundaries before stabilization."
        }
      : undefined,
    ...getProductStabilizationBlockingItems(queue).map((item) => ({
      id: `${item.id}_beta_operations_blocker`,
      itemId: item.id,
      category: item.category,
      message: `${item.title} remains a beta operations blocker.`,
      requiredAction: "Resolve, verify, defer with owner approval, or keep controlled beta operations blocked."
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
  ].filter(Boolean) as TeoyubeProductStabilizationQueueBlocker[];
}

export function getProductStabilizationQueueWarnings(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationQueueWarning[] {
  return [
    ...queue.items
      .filter((item) => item.ownerReviewRequired && item.status !== "verified" && item.priority !== "beta_operations_blocker")
      .map((item) => ({
        id: `${item.id}_owner_review`,
        itemId: item.id,
        category: item.category,
        message: `${item.title} requires owner review before stabilization.`,
        recommendedAction: "Keep item out of automatic remediation and route to Phase 7.2 owner review."
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

export function createProductStabilizationQueueDecision(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationDecision {
  const blockers = getProductStabilizationQueueBlockers(queue);
  const warnings = getProductStabilizationQueueWarnings(queue);
  if (!queue.items.length) return "empty";
  if (blockers.length) return "blocked";
  if (warnings.some((warning) => warning.id.endsWith("_owner_review"))) return "owner_review_required";
  return warnings.length ? "ready_with_warnings" : "ready_for_safe_stabilization";
}

export function createProductStabilizationQueueReport(queue: TeoyubeProductStabilizationQueue = createProductStabilizationQueue()): TeoyubeProductStabilizationQueueReport {
  const blockers = getProductStabilizationQueueBlockers(queue);
  return {
    valid: blockers.length === 0,
    decision: createProductStabilizationQueueDecision(queue),
    queue,
    blockers,
    warnings: getProductStabilizationQueueWarnings(queue),
    itemCount: queue.items.length,
    betaOperationsBlockerCount: getProductStabilizationBlockingItems(queue).length,
    ownerReviewRequiredCount: queue.items.filter((item) => item.ownerReviewRequired).length,
    deferredCount: queue.items.filter((item) => item.status === "deferred" || item.priority === "defer").length,
    safeToFixCount: queue.items.filter((item) => item.safeLocalFixAllowed && item.status !== "blocked").length,
    manualOnly: true,
    inMemoryOnly: true,
    noFilesWritten: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noExternalServicesRequired: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noAutomaticPublishing: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    generatedAt: now()
  };
}
