import {
  createDefaultReviewedContentItems,
  isReviewedContentProductionEligible,
  validateReviewedContentItem
} from "./reviewed-content-integration-gate";
import type {
  TeoyubeReviewedContentIntegrationDecision,
  TeoyubeReviewedContentItem
} from "./reviewed-content-integration-contracts";

export type TeoyubeReviewedContentIntegrationPlan = {
  id: string;
  items: TeoyubeReviewedContentItem[];
  readyForIntegration: TeoyubeReviewedContentItem[];
  needingReview: TeoyubeReviewedContentItem[];
  blocked: TeoyubeReviewedContentItem[];
  deferred: TeoyubeReviewedContentItem[];
  noAutomaticIntegration: true;
  noProductionDataModified: true;
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

export type TeoyubeReviewedContentIntegrationPlanReport = {
  valid: boolean;
  decision: TeoyubeReviewedContentIntegrationDecision;
  plan: TeoyubeReviewedContentIntegrationPlan;
  blockers: string[];
  warnings: string[];
  noAutomaticIntegration: true;
  noProductionDataModified: true;
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

export function createReviewedContentIntegrationPlan(input: {
  items?: TeoyubeReviewedContentItem[];
} = {}): TeoyubeReviewedContentIntegrationPlan {
  const items = input.items || createDefaultReviewedContentItems();
  const readyForIntegration = items.filter(isReviewedContentProductionEligible);
  const blocked = items.filter((item) => validateReviewedContentItem(item).blockers.length > 0);
  const deferred = items.filter((item) => item.status === "deferred" || item.reviewState === "deferred");
  const needingReview = items.filter((item) =>
    !readyForIntegration.includes(item) && !blocked.includes(item) && !deferred.includes(item)
  );

  return {
    id: "phase_4_4_reviewed_content_integration_plan",
    items,
    readyForIntegration,
    needingReview,
    blocked,
    deferred,
    noAutomaticIntegration: true,
    noProductionDataModified: true,
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

export function getReviewedContentItemsReadyForIntegration(
  plan: TeoyubeReviewedContentIntegrationPlan
): TeoyubeReviewedContentItem[] {
  return plan.readyForIntegration;
}

export function getReviewedContentItemsNeedingReview(
  plan: TeoyubeReviewedContentIntegrationPlan
): TeoyubeReviewedContentItem[] {
  return plan.needingReview;
}

export function getReviewedContentItemsBlocked(
  plan: TeoyubeReviewedContentIntegrationPlan
): TeoyubeReviewedContentItem[] {
  return plan.blocked;
}

export function getReviewedContentItemsDeferred(
  plan: TeoyubeReviewedContentIntegrationPlan
): TeoyubeReviewedContentItem[] {
  return plan.deferred;
}

export function createReviewedContentIntegrationPlanDecision(
  plan: TeoyubeReviewedContentIntegrationPlan
): TeoyubeReviewedContentIntegrationDecision {
  if (!plan.items.length) return "empty";
  if (plan.blocked.length) return "blocked";
  if (plan.needingReview.length) return "needs_review";
  if (plan.deferred.length) return "ready_with_warnings";
  return "ready_for_future_integration";
}

export function createReviewedContentIntegrationPlanReport(
  plan: TeoyubeReviewedContentIntegrationPlan = createReviewedContentIntegrationPlan()
): TeoyubeReviewedContentIntegrationPlanReport {
  const blockers = plan.blocked.flatMap((item) =>
    validateReviewedContentItem(item).blockers.map((entry) => entry.message)
  );
  const warnings = [
    ...plan.needingReview.map((item) => `${item.title} needs additional review before integration.`),
    ...plan.deferred.map((item) => `${item.title} is deferred.`)
  ];

  return {
    valid: blockers.length === 0,
    decision: createReviewedContentIntegrationPlanDecision(plan),
    plan,
    blockers,
    warnings,
    noAutomaticIntegration: true,
    noProductionDataModified: true,
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
