import { createDryRunFixQueue } from "./dry-run-fix-queue-manager";
import type { TeoyubeDryRunFixQueueItem } from "./dry-run-fix-queue-contracts";
import type {
  TeoyubeDryRunStabilizationAction,
  TeoyubeDryRunStabilizationBlocker,
  TeoyubeDryRunStabilizationDecision,
  TeoyubeDryRunStabilizationItem,
  TeoyubeDryRunStabilizationPlan,
  TeoyubeDryRunStabilizationPlanInput,
  TeoyubeDryRunStabilizationReport,
  TeoyubeDryRunStabilizationRisk,
  TeoyubeDryRunStabilizationStatus,
  TeoyubeDryRunStabilizationWarning
} from "./dry-run-stabilization-contracts";

function action(id: string, label: string, details: string, safeLocalOnly = true): TeoyubeDryRunStabilizationAction {
  return { id, label, details, safeLocalOnly };
}

function riskFromFixItem(item: TeoyubeDryRunFixQueueItem): TeoyubeDryRunStabilizationRisk {
  return {
    id: `${item.id}_risk`,
    category: item.category,
    severity: item.riskLevel === "blocked" ? "blocked" : item.riskLevel === "unknown" ? "medium" : item.riskLevel,
    message: `${item.title} has ${item.riskLevel} stabilization risk.`,
    mitigation: "Apply only local safe fixes and run Phase 6.3 regression QA before owner review."
  };
}

function statusForFixItem(item: TeoyubeDryRunFixQueueItem): TeoyubeDryRunStabilizationStatus {
  if (item.status === "verified") return "verified";
  if (item.status === "fixed") return "stabilized";
  if (item.status === "blocked" || item.riskLevel === "blocked" || item.blockedReason) return "blocked";
  if (item.status === "deferred" || item.priority === "defer" || item.deferredReason) return "deferred";
  if (item.safeLocalFixAllowed && !item.ownerReviewRequired) return "safe_to_stabilize";
  if (item.ownerReviewRequired) return "owner_review_required";
  return "unknown";
}

function stabilizationItemFromFixItem(item: TeoyubeDryRunFixQueueItem): TeoyubeDryRunStabilizationItem {
  const status = statusForFixItem(item);
  return {
    id: `stabilization_${item.id}`,
    fixQueueItemId: item.id,
    category: item.category,
    title: item.title,
    status,
    actions: [
      action("apply_safe_local_stabilization", "Apply safe local stabilization only", item.proposedFix, item.safeLocalFixAllowed),
      action("run_regression_qa", "Run regression QA", "Verify Scripture anchors, explanation traces, fallback safety, confidence labels, reviewed content gates, disabled services, mobile, accessibility, operations readiness, and privacy boundaries.")
    ],
    risks: [riskFromFixItem(item)],
    safetyChecks: {},
    regressionRequirements: item.verificationRequirements.map((entry) => entry.label)
  };
}

export function createDryRunStabilizationPlan(input: TeoyubeDryRunStabilizationPlanInput = {}): TeoyubeDryRunStabilizationPlan {
  const queue = input.queue || createDryRunFixQueue({ items: input.fixItems || [] });
  return {
    id: input.id || "phase_6_3_dry_run_stabilization_plan",
    queue,
    items: queue.items.map(stabilizationItemFromFixItem),
    manualOnly: true,
    inMemoryOnly: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noAutomaticPublishing: true,
    createdAt: new Date().toISOString()
  };
}

export function getSafeDryRunStabilizationItems(plan: TeoyubeDryRunStabilizationPlan): TeoyubeDryRunStabilizationItem[] {
  return plan.items.filter((item) => item.status === "safe_to_stabilize" || item.status === "stabilized" || item.status === "verified");
}

export function getOwnerReviewDryRunStabilizationItems(plan: TeoyubeDryRunStabilizationPlan): TeoyubeDryRunStabilizationItem[] {
  return plan.items.filter((item) => item.status === "owner_review_required");
}

export function getBlockedDryRunStabilizationItems(plan: TeoyubeDryRunStabilizationPlan): TeoyubeDryRunStabilizationItem[] {
  return plan.items.filter((item) => item.status === "blocked");
}

export function getDeferredDryRunStabilizationItems(plan: TeoyubeDryRunStabilizationPlan): TeoyubeDryRunStabilizationItem[] {
  return plan.items.filter((item) => item.status === "deferred");
}

function getPlanBlockers(plan: TeoyubeDryRunStabilizationPlan): TeoyubeDryRunStabilizationBlocker[] {
  return [
    !plan.manualOnly || !plan.inMemoryOnly || !plan.noExternalServicesRequired || !plan.noDatabasePersistenceEnabled || !plan.noAnalyticsEnabled || !plan.noUsersContacted || !plan.noFeedbackCollectedAutomatically || !plan.noAutomaticPublishing
      ? {
          id: "dry_run_stabilization_plan_boundary_broken",
          category: "unknown" as const,
          message: "Dry-run stabilization plan must remain manual, in-memory, service-disabled, no-persistence, no-analytics, no-contact, no-feedback-collection, and no-publishing.",
          requiredAction: "Restore Phase 6.3 stabilization boundaries."
        }
      : undefined,
    ...getBlockedDryRunStabilizationItems(plan).map((item) => ({
      id: `${item.id}_blocked`,
      itemId: item.id,
      category: item.category,
      message: `${item.title} is blocked for stabilization.`,
      requiredAction: "Keep item blocked or defer to owner-approved future stabilization."
    }))
  ].filter(Boolean) as TeoyubeDryRunStabilizationBlocker[];
}

function getPlanWarnings(plan: TeoyubeDryRunStabilizationPlan): TeoyubeDryRunStabilizationWarning[] {
  return [
    ...getOwnerReviewDryRunStabilizationItems(plan).map((item) => ({
      id: `${item.id}_owner_review`,
      itemId: item.id,
      category: item.category,
      message: `${item.title} requires owner review before stabilization.`,
      recommendedAction: "Route to Phase 6.3 owner review."
    })),
    ...getDeferredDryRunStabilizationItems(plan).map((item) => ({
      id: `${item.id}_deferred`,
      itemId: item.id,
      category: item.category,
      message: `${item.title} is deferred.`,
      recommendedAction: "Keep documented for future owner review."
    }))
  ];
}

export function createDryRunStabilizationDecision(plan: TeoyubeDryRunStabilizationPlan): TeoyubeDryRunStabilizationDecision {
  if (!plan.items.length) return "empty";
  if (getPlanBlockers(plan).length) return "blocked";
  if (getOwnerReviewDryRunStabilizationItems(plan).length) return "owner_review_required";
  if (getDeferredDryRunStabilizationItems(plan).length && !getSafeDryRunStabilizationItems(plan).length) return "deferred";
  if (plan.items.every((item) => item.status === "verified")) return "verified";
  return "ready_for_safe_stabilization";
}

export function createDryRunStabilizationPlanReport(plan: TeoyubeDryRunStabilizationPlan): TeoyubeDryRunStabilizationReport {
  const blockers = getPlanBlockers(plan);
  return {
    valid: blockers.length === 0,
    decision: createDryRunStabilizationDecision(plan),
    plan,
    blockers,
    warnings: getPlanWarnings(plan),
    safeItemCount: getSafeDryRunStabilizationItems(plan).length,
    ownerReviewItemCount: getOwnerReviewDryRunStabilizationItems(plan).length,
    blockedItemCount: getBlockedDryRunStabilizationItems(plan).length,
    deferredItemCount: getDeferredDryRunStabilizationItems(plan).length,
    manualOnly: true,
    inMemoryOnly: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noAutomaticPublishing: true,
    generatedAt: new Date().toISOString()
  };
}
