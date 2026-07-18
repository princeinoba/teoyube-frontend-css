import {
  createProductStabilizationQueue,
  createProductStabilizationQueueReport
} from "./product-stabilization-queue-manager";
import type {
  TeoyubeProductStabilizationQueue,
  TeoyubeProductStabilizationQueueItem
} from "./product-stabilization-queue-contracts";
import {
  createProductStabilizationSafetyReport
} from "./product-stabilization-safety-validator";

export type TeoyubeProductStabilizationPlanClassification =
  | "safe_local_stabilization"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "unknown";

export type TeoyubeProductStabilizationPlanDecision =
  | "ready_for_safe_local_stabilization"
  | "owner_review_required"
  | "blocked"
  | "deferred"
  | "empty"
  | "unknown";

export type TeoyubeProductStabilizationPlanItem = TeoyubeProductStabilizationQueueItem & {
  classification: TeoyubeProductStabilizationPlanClassification;
};

export type TeoyubeProductStabilizationPlan = {
  id: string;
  queue: TeoyubeProductStabilizationQueue;
  items: TeoyubeProductStabilizationPlanItem[];
  manualOnly: true;
  inMemoryOnly: true;
  noUnsafeFixes: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

export type TeoyubeProductStabilizationPlanReport = {
  valid: boolean;
  decision: TeoyubeProductStabilizationPlanDecision;
  plan: TeoyubeProductStabilizationPlan;
  safeItems: TeoyubeProductStabilizationPlanItem[];
  ownerReviewItems: TeoyubeProductStabilizationPlanItem[];
  blockedItems: TeoyubeProductStabilizationPlanItem[];
  deferredItems: TeoyubeProductStabilizationPlanItem[];
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noUnsafeFixes: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};

function classifyItem(item: TeoyubeProductStabilizationQueueItem, queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationPlanClassification {
  const safetyReport = createProductStabilizationSafetyReport({ ...queue, items: [item] });
  if (safetyReport.blockers.length || item.status === "blocked" || item.riskLevel === "blocked" || item.priority === "beta_operations_blocker") return "blocked";
  if (item.status === "deferred" || item.priority === "defer") return "deferred";
  if (item.ownerReviewRequired || item.status === "owner_review_required") return "owner_review_required";
  if (item.safeLocalFixAllowed && ["low", "medium"].includes(item.riskLevel)) return "safe_local_stabilization";
  return "unknown";
}

export function createProductStabilizationPlan(input: { id?: string; queue?: TeoyubeProductStabilizationQueue; items?: TeoyubeProductStabilizationQueueItem[] } = {}): TeoyubeProductStabilizationPlan {
  const queue = input.queue || createProductStabilizationQueue({ items: input.items || [] });
  return {
    id: input.id || "phase_7_2_product_stabilization_plan",
    queue,
    items: queue.items.map((item) => ({ ...item, classification: classifyItem(item, queue) })),
    manualOnly: true,
    inMemoryOnly: true,
    noUnsafeFixes: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}

export function getSafeProductStabilizationItems(plan: TeoyubeProductStabilizationPlan): TeoyubeProductStabilizationPlanItem[] {
  return plan.items.filter((item) => item.classification === "safe_local_stabilization");
}

export function getOwnerReviewProductStabilizationItems(plan: TeoyubeProductStabilizationPlan): TeoyubeProductStabilizationPlanItem[] {
  return plan.items.filter((item) => item.classification === "owner_review_required");
}

export function getBlockedProductStabilizationItems(plan: TeoyubeProductStabilizationPlan): TeoyubeProductStabilizationPlanItem[] {
  return plan.items.filter((item) => item.classification === "blocked");
}

export function getDeferredProductStabilizationItems(plan: TeoyubeProductStabilizationPlan): TeoyubeProductStabilizationPlanItem[] {
  return plan.items.filter((item) => item.classification === "deferred");
}

export function createProductStabilizationDecision(plan: TeoyubeProductStabilizationPlan): TeoyubeProductStabilizationPlanDecision {
  if (!plan.items.length) return "empty";
  if (getBlockedProductStabilizationItems(plan).length) return "blocked";
  if (getDeferredProductStabilizationItems(plan).length && !getSafeProductStabilizationItems(plan).length && !getOwnerReviewProductStabilizationItems(plan).length) return "deferred";
  if (getOwnerReviewProductStabilizationItems(plan).length) return "owner_review_required";
  if (getSafeProductStabilizationItems(plan).length) return "ready_for_safe_local_stabilization";
  return "unknown";
}

export function createProductStabilizationPlanReport(plan: TeoyubeProductStabilizationPlan = createProductStabilizationPlan()): TeoyubeProductStabilizationPlanReport {
  const queueReport = createProductStabilizationQueueReport(plan.queue);
  const safetyReport = createProductStabilizationSafetyReport(plan.queue);
  const blockers = [
    ...queueReport.blockers.map((entry) => entry.message),
    ...safetyReport.blockers.map((entry) => entry.message)
  ];
  return {
    valid: blockers.length === 0,
    decision: createProductStabilizationDecision(plan),
    plan,
    safeItems: getSafeProductStabilizationItems(plan),
    ownerReviewItems: getOwnerReviewProductStabilizationItems(plan),
    blockedItems: getBlockedProductStabilizationItems(plan),
    deferredItems: getDeferredProductStabilizationItems(plan),
    blockers,
    warnings: [
      ...queueReport.warnings.map((entry) => entry.message),
      ...safetyReport.warnings.map((entry) => entry.message)
    ],
    manualOnly: true,
    inMemoryOnly: true,
    noUnsafeFixes: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
