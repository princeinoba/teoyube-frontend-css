import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";

export type TeoyubeSafeFixQueueItemStatus =
  | "proposed"
  | "owner_review"
  | "approved"
  | "rejected"
  | "implemented"
  | "verified"
  | "deferred"
  | "unknown";

export type TeoyubeSafeFixQueueItem = {
  id: string;
  issueId: string;
  severity: TeoyubeFirstDayIssueSeverity;
  affectedRouteComponentOrDataFile: string;
  proposedFix: string;
  fixRisk: "low" | "medium" | "high" | "unknown";
  rollbackImpact: string;
  ownerApproved: boolean;
  scriptureAnchorsPreserved: boolean;
  explanationTracesPreserved: boolean;
  fallbackSafetyPreserved: boolean;
  confidenceLabelsPreserved: boolean;
  privacyConsentNoticesPreserved: boolean;
  hiddenPersonalizationIntroduced: boolean;
  externalServicesAdded: boolean;
  trackingAnalyticsAdded: boolean;
  databasePersistenceAdded: boolean;
  productionContentChangedWithoutReview: boolean;
  implementationStatus: TeoyubeSafeFixQueueItemStatus;
  verificationStatus: TeoyubeSafeFixQueueItemStatus;
  notes: string[];
};

export type TeoyubeSafeFixQueue = {
  id: string;
  items: TeoyubeSafeFixQueueItem[];
  noAutomaticImplementation: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
  updatedAt: string;
};

export function createSafeFixQueue(input: Partial<TeoyubeSafeFixQueue> = {}): TeoyubeSafeFixQueue {
  const now = new Date().toISOString();
  return {
    id: input.id || "phase_10_4_safe_fix_queue",
    items: input.items || [],
    noAutomaticImplementation: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now
  };
}

export function createSafeFixQueueItem(input: Partial<TeoyubeSafeFixQueueItem> = {}): TeoyubeSafeFixQueueItem {
  return {
    id: input.id || `safe_fix_queue_item_${Date.now()}`,
    issueId: input.issueId || "manual_issue_required",
    severity: input.severity || "severity_4_low",
    affectedRouteComponentOrDataFile: input.affectedRouteComponentOrDataFile || "manual_owner_required",
    proposedFix: input.proposedFix || "Manual safe-fix proposal required.",
    fixRisk: input.fixRisk || "unknown",
    rollbackImpact: input.rollbackImpact || "Owner must assess rollback impact manually.",
    ownerApproved: input.ownerApproved ?? false,
    scriptureAnchorsPreserved: input.scriptureAnchorsPreserved ?? true,
    explanationTracesPreserved: input.explanationTracesPreserved ?? true,
    fallbackSafetyPreserved: input.fallbackSafetyPreserved ?? true,
    confidenceLabelsPreserved: input.confidenceLabelsPreserved ?? true,
    privacyConsentNoticesPreserved: input.privacyConsentNoticesPreserved ?? true,
    hiddenPersonalizationIntroduced: input.hiddenPersonalizationIntroduced ?? false,
    externalServicesAdded: input.externalServicesAdded ?? false,
    trackingAnalyticsAdded: input.trackingAnalyticsAdded ?? false,
    databasePersistenceAdded: input.databasePersistenceAdded ?? false,
    productionContentChangedWithoutReview: input.productionContentChangedWithoutReview ?? false,
    implementationStatus: input.implementationStatus || "proposed",
    verificationStatus: input.verificationStatus || "owner_review",
    notes: input.notes || []
  };
}

export function addSafeFixQueueItem(queue: TeoyubeSafeFixQueue, item: TeoyubeSafeFixQueueItem): TeoyubeSafeFixQueue {
  return { ...queue, items: [...queue.items, item], updatedAt: new Date().toISOString() };
}

export function updateSafeFixQueueItem(queue: TeoyubeSafeFixQueue, item: TeoyubeSafeFixQueueItem): TeoyubeSafeFixQueue {
  return { ...queue, items: [...queue.items.filter((entry) => entry.id !== item.id), item], updatedAt: new Date().toISOString() };
}

function itemBlockers(item: TeoyubeSafeFixQueueItem): string[] {
  const blockers: string[] = [];
  if (!item.ownerApproved) blockers.push("Owner approval is required.");
  if (!item.scriptureAnchorsPreserved) blockers.push("Fix removes Scripture anchors.");
  if (!item.explanationTracesPreserved) blockers.push("Fix removes explanation traces.");
  if (!item.fallbackSafetyPreserved) blockers.push("Fix weakens fallback safety.");
  if (!item.confidenceLabelsPreserved) blockers.push("Fix hides confidence labels.");
  if (!item.privacyConsentNoticesPreserved) blockers.push("Fix bypasses privacy/consent notices.");
  if (item.hiddenPersonalizationIntroduced) blockers.push("Fix creates hidden personalization.");
  if (item.externalServicesAdded) blockers.push("Fix adds external services.");
  if (item.trackingAnalyticsAdded) blockers.push("Fix adds tracking or analytics.");
  if (item.databasePersistenceAdded) blockers.push("Fix adds database persistence.");
  if (item.productionContentChangedWithoutReview) blockers.push("Fix changes production content without review.");
  return blockers;
}

export function getSafeFixQueueBlockers(queue: TeoyubeSafeFixQueue): string[] {
  return queue.items.flatMap((item) => itemBlockers(item).map((message) => `${item.id}: ${message}`));
}

export function getSafeFixQueueWarnings(queue: TeoyubeSafeFixQueue): string[] {
  const warnings: string[] = [];
  if (!queue.items.length) warnings.push("Safe-fix queue is empty.");
  queue.items
    .filter((item) => item.fixRisk === "high" || item.fixRisk === "unknown")
    .forEach((item) => warnings.push(`${item.id}: fix risk needs owner review.`));
  warnings.push("Safe-fix queue is in-memory only and does not implement fixes automatically.");
  return warnings;
}

export function createSafeFixQueueDecision(queue: TeoyubeSafeFixQueue): "queue_ready" | "blocked" | "ready_with_warnings" | "empty" {
  if (getSafeFixQueueBlockers(queue).length) return "blocked";
  if (!queue.items.length) return "empty";
  return getSafeFixQueueWarnings(queue).length ? "ready_with_warnings" : "queue_ready";
}

export function createSafeFixQueueReport(queue: TeoyubeSafeFixQueue) {
  const blockers = getSafeFixQueueBlockers(queue);
  return {
    valid: blockers.length === 0,
    decision: createSafeFixQueueDecision(queue),
    queue,
    blockers,
    warnings: getSafeFixQueueWarnings(queue),
    noAutomaticImplementation: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
