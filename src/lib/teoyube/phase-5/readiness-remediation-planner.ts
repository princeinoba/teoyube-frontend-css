import { createBetaFixQueue } from "./beta-fix-queue-manager";
import type { TeoyubeBetaFixQueueItem } from "./beta-fix-queue-contracts";
import type {
  TeoyubeReadinessRemediationAction,
  TeoyubeReadinessRemediationBlocker,
  TeoyubeReadinessRemediationDecision,
  TeoyubeReadinessRemediationItem,
  TeoyubeReadinessRemediationPlan,
  TeoyubeReadinessRemediationPlanInput,
  TeoyubeReadinessRemediationReport,
  TeoyubeReadinessRemediationRisk,
  TeoyubeReadinessRemediationStatus,
  TeoyubeReadinessRemediationWarning
} from "./readiness-remediation-contracts";

function action(id: string, label: string, details: string, safeLocalOnly = true): TeoyubeReadinessRemediationAction {
  return { id, label, details, safeLocalOnly };
}

function riskFromFixItem(item: TeoyubeBetaFixQueueItem): TeoyubeReadinessRemediationRisk {
  return {
    id: `${item.id}_risk`,
    category: item.category,
    severity: item.riskLevel === "blocked" ? "blocked" : item.riskLevel === "unknown" ? "medium" : item.riskLevel,
    message: `${item.title} has ${item.riskLevel} remediation risk.`,
    mitigation: "Apply only local safe fixes and run Phase 5.3 regression QA before owner review."
  };
}

function statusForFixItem(item: TeoyubeBetaFixQueueItem): TeoyubeReadinessRemediationStatus {
  if (item.status === "verified") return "verified";
  if (item.status === "fixed") return "remediated";
  if (item.status === "blocked" || item.riskLevel === "blocked" || item.blockedReason) return "blocked";
  if (item.status === "deferred" || item.priority === "defer" || item.deferredReason) return "deferred";
  if (item.safeLocalFixAllowed && !item.ownerReviewRequired) return "safe_to_remediate";
  if (item.ownerReviewRequired) return "owner_review_required";
  return "unknown";
}

function remediationItemFromFixItem(item: TeoyubeBetaFixQueueItem): TeoyubeReadinessRemediationItem {
  const status = statusForFixItem(item);
  return {
    id: `remediation_${item.id}`,
    fixQueueItemId: item.id,
    category: item.category,
    title: item.title,
    status,
    actions: [
      action("apply_safe_local_fix", "Apply safe local fix only", item.proposedFix, item.safeLocalFixAllowed),
      action("run_regression_qa", "Run regression QA", "Verify Scripture anchors, explanation traces, fallback safety, confidence labels, reviewed content gates, disabled services, mobile, accessibility, and privacy boundaries.")
    ],
    risks: [riskFromFixItem(item)],
    safetyChecks: {},
    regressionRequirements: item.verificationRequirements.map((entry) => entry.label)
  };
}

export function createReadinessRemediationPlan(input: TeoyubeReadinessRemediationPlanInput = {}): TeoyubeReadinessRemediationPlan {
  const queue = input.queue || createBetaFixQueue({ items: input.fixItems || [] });
  return {
    id: input.id || "phase_5_3_readiness_remediation_plan",
    queue,
    items: queue.items.map(remediationItemFromFixItem),
    manualOnly: true,
    inMemoryOnly: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noUsersContacted: true,
    noAutomaticPublishing: true,
    createdAt: new Date().toISOString()
  };
}

export function getSafeReadinessRemediationItems(plan: TeoyubeReadinessRemediationPlan): TeoyubeReadinessRemediationItem[] {
  return plan.items.filter((item) => item.status === "safe_to_remediate" || item.status === "remediated" || item.status === "verified");
}

export function getOwnerReviewReadinessRemediationItems(plan: TeoyubeReadinessRemediationPlan): TeoyubeReadinessRemediationItem[] {
  return plan.items.filter((item) => item.status === "owner_review_required");
}

export function getBlockedReadinessRemediationItems(plan: TeoyubeReadinessRemediationPlan): TeoyubeReadinessRemediationItem[] {
  return plan.items.filter((item) => item.status === "blocked");
}

export function getDeferredReadinessRemediationItems(plan: TeoyubeReadinessRemediationPlan): TeoyubeReadinessRemediationItem[] {
  return plan.items.filter((item) => item.status === "deferred");
}

function getPlanBlockers(plan: TeoyubeReadinessRemediationPlan): TeoyubeReadinessRemediationBlocker[] {
  return [
    !plan.manualOnly || !plan.inMemoryOnly || !plan.noExternalServicesRequired || !plan.noDatabasePersistenceEnabled || !plan.noAnalyticsEnabled || !plan.noUsersContacted || !plan.noAutomaticPublishing
      ? {
          id: "remediation_plan_boundary_broken",
          category: "unknown" as const,
          message: "Readiness remediation plan must remain manual, in-memory, service-disabled, no-persistence, no-analytics, no-contact, and no-publishing.",
          requiredAction: "Restore Phase 5.3 remediation boundaries."
        }
      : undefined,
    ...getBlockedReadinessRemediationItems(plan).map((item) => ({
      id: `${item.id}_blocked`,
      itemId: item.id,
      category: item.category,
      message: `${item.title} is blocked for remediation.`,
      requiredAction: "Keep item blocked or defer to owner-approved future remediation."
    }))
  ].filter(Boolean) as TeoyubeReadinessRemediationBlocker[];
}

function getPlanWarnings(plan: TeoyubeReadinessRemediationPlan): TeoyubeReadinessRemediationWarning[] {
  return [
    ...getOwnerReviewReadinessRemediationItems(plan).map((item) => ({
      id: `${item.id}_owner_review`,
      itemId: item.id,
      category: item.category,
      message: `${item.title} requires owner review before remediation.`,
      recommendedAction: "Route to Phase 5.3 owner review."
    })),
    ...getDeferredReadinessRemediationItems(plan).map((item) => ({
      id: `${item.id}_deferred`,
      itemId: item.id,
      category: item.category,
      message: `${item.title} is deferred.`,
      recommendedAction: "Keep documented for future owner review."
    }))
  ];
}

export function createReadinessRemediationDecision(plan: TeoyubeReadinessRemediationPlan): TeoyubeReadinessRemediationDecision {
  if (!plan.items.length) return "empty";
  if (getPlanBlockers(plan).length) return "blocked";
  if (getOwnerReviewReadinessRemediationItems(plan).length) return "owner_review_required";
  if (getDeferredReadinessRemediationItems(plan).length && !getSafeReadinessRemediationItems(plan).length) return "deferred";
  if (plan.items.every((item) => item.status === "verified")) return "verified";
  return "ready_for_safe_remediation";
}

export function createReadinessRemediationPlanReport(plan: TeoyubeReadinessRemediationPlan): TeoyubeReadinessRemediationReport {
  const blockers = getPlanBlockers(plan);
  const warnings = getPlanWarnings(plan);
  return {
    valid: blockers.length === 0,
    decision: createReadinessRemediationDecision(plan),
    plan,
    blockers,
    warnings,
    safeItemCount: getSafeReadinessRemediationItems(plan).length,
    ownerReviewItemCount: getOwnerReviewReadinessRemediationItems(plan).length,
    blockedItemCount: getBlockedReadinessRemediationItems(plan).length,
    deferredItemCount: getDeferredReadinessRemediationItems(plan).length,
    manualOnly: true,
    inMemoryOnly: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noUsersContacted: true,
    noAutomaticPublishing: true,
    generatedAt: new Date().toISOString()
  };
}
