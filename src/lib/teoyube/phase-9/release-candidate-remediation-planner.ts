import type {
  TeoyubeReleaseCandidateFixQueue,
  TeoyubeReleaseCandidateFixQueueItem
} from "./release-candidate-fix-queue-contracts";
import type {
  TeoyubeReleaseCandidateRemediationAction,
  TeoyubeReleaseCandidateRemediationDecision,
  TeoyubeReleaseCandidateRemediationItem,
  TeoyubeReleaseCandidateRemediationPlan,
  TeoyubeReleaseCandidateRemediationReport,
  TeoyubeReleaseCandidateRemediationRisk,
  TeoyubeReleaseCandidateRemediationStatus
} from "./release-candidate-remediation-contracts";

function action(id: string, label: string, details: string, safeLocalAction = true): TeoyubeReleaseCandidateRemediationAction {
  return { id, label, details, safeLocalAction };
}

function classifyFixItem(item: TeoyubeReleaseCandidateFixQueueItem): TeoyubeReleaseCandidateRemediationStatus {
  if (item.status === "blocked" || item.riskLevel === "blocked") return "blocked";
  if (item.status === "deferred" || item.riskLevel === "defer" || item.priority === "defer") return "deferred";
  if (item.status === "fixed") return "remediated";
  if (item.status === "verified") return "verified";
  if (item.ownerReviewRequired || item.riskLevel === "owner_review" || item.priority === "public_release_blocker") return "owner_review_required";
  if (item.safeLocalFixAllowed && item.riskLevel === "safe_local") return "safe_to_remediate";
  return "unknown";
}

function createRemediationItem(item: TeoyubeReleaseCandidateFixQueueItem): TeoyubeReleaseCandidateRemediationItem {
  const status = classifyFixItem(item);
  const safeLocalRemediation = status === "safe_to_remediate" || status === "remediated" || status === "verified";
  const ownerReviewRequired = status === "owner_review_required";
  const blocked = status === "blocked";
  const deferred = status === "deferred";
  return {
    id: `remediation_${item.id}`,
    fixItem: item,
    status,
    actions: [
      action(`${item.id}_manual_fix`, "Manual local remediation", `Review and remediate ${item.title} without external services, persistence, analytics, publishing, or user contact.`, safeLocalRemediation)
    ],
    risk: {},
    safeLocalRemediation,
    ownerReviewRequired,
    blocked,
    deferred,
    notes: [`${item.title} classified as ${status}.`]
  };
}

export function createReleaseCandidateRemediationPlan(input: {
  id?: string;
  queue?: TeoyubeReleaseCandidateFixQueue;
  items?: TeoyubeReleaseCandidateRemediationItem[];
  safePatchSummary?: TeoyubeReleaseCandidateRemediationPlan["safePatchSummary"];
} = {}): TeoyubeReleaseCandidateRemediationPlan {
  const items = input.items || input.queue?.items.map(createRemediationItem) || [];
  return {
    id: input.id || "phase_9_3_release_candidate_remediation_plan",
    items,
    safePatchSummary: input.safePatchSummary || [],
    manualOnly: true,
    noExternalWrite: true,
    noDatabasePersistence: true,
    noAnalytics: true,
    noExternalServices: true,
    noUserContact: true,
    noPublishing: true,
    noProductionJsonWrite: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getSafeReleaseCandidateRemediationItems(plan: TeoyubeReleaseCandidateRemediationPlan): TeoyubeReleaseCandidateRemediationItem[] {
  return plan.items.filter((item) => item.safeLocalRemediation && !item.blocked && !item.deferred);
}

export function getOwnerReviewReleaseCandidateRemediationItems(plan: TeoyubeReleaseCandidateRemediationPlan): TeoyubeReleaseCandidateRemediationItem[] {
  return plan.items.filter((item) => item.ownerReviewRequired);
}

export function getBlockedReleaseCandidateRemediationItems(plan: TeoyubeReleaseCandidateRemediationPlan): TeoyubeReleaseCandidateRemediationItem[] {
  return plan.items.filter((item) => item.blocked);
}

export function getDeferredReleaseCandidateRemediationItems(plan: TeoyubeReleaseCandidateRemediationPlan): TeoyubeReleaseCandidateRemediationItem[] {
  return plan.items.filter((item) => item.deferred);
}

export function createReleaseCandidateRemediationDecision(plan: TeoyubeReleaseCandidateRemediationPlan): TeoyubeReleaseCandidateRemediationDecision {
  if (getBlockedReleaseCandidateRemediationItems(plan).length) return "remediation_blocked";
  if (getOwnerReviewReleaseCandidateRemediationItems(plan).length) return "owner_review_required";
  return plan.items.length || plan.safePatchSummary.length ? "remediation_ready_with_warnings" : "remediation_ready";
}

export function createReleaseCandidateRemediationPlanReport(plan: TeoyubeReleaseCandidateRemediationPlan): TeoyubeReleaseCandidateRemediationReport {
  const boundaryBlockers = plan.manualOnly && plan.noExternalWrite && plan.noDatabasePersistence && plan.noAnalytics && plan.noExternalServices && plan.noUserContact && plan.noPublishing && plan.noProductionJsonWrite && plan.inMemoryOnly
    ? []
    : [{ id: "remediation_boundary_blocker", message: "Release candidate remediation plan must remain manual, in-memory, no-write, no-contact, no-publishing, no-analytics, no-persistence, and service-disabled.", requiredAction: "Restore remediation plan boundaries." }];
  const blockedItems = getBlockedReleaseCandidateRemediationItems(plan);
  const blockers = [
    ...boundaryBlockers,
    ...blockedItems.map((item) => ({ id: `${item.id}_blocked`, itemId: item.id, message: item.notes.join(" "), requiredAction: "Resolve blocker or defer with owner review before final go/no-go." }))
  ];
  const warnings = [
    { id: "remediation_manual_only", message: "Remediation planning is manual and in-memory only.", recommendedAction: "Review safe patches and owner-review items manually." },
    ...getOwnerReviewReleaseCandidateRemediationItems(plan).map((item) => ({ id: `${item.id}_owner_review`, itemId: item.id, message: `${item.fixItem.title} requires owner review.`, recommendedAction: "Owner must review before Phase 9.4." })),
    ...getDeferredReleaseCandidateRemediationItems(plan).map((item) => ({ id: `${item.id}_deferred`, itemId: item.id, message: `${item.fixItem.title} is deferred.`, recommendedAction: "Document deferred rationale before Phase 9.4." }))
  ];
  return {
    valid: blockers.length === 0,
    decision: createReleaseCandidateRemediationDecision(plan),
    plan,
    blockers,
    warnings,
    summary: {
      totalItems: plan.items.length,
      safeLocalItems: getSafeReleaseCandidateRemediationItems(plan).length,
      ownerReviewItems: getOwnerReviewReleaseCandidateRemediationItems(plan).length,
      blockedItems: blockedItems.length,
      deferredItems: getDeferredReleaseCandidateRemediationItems(plan).length,
      remediatedItems: plan.items.filter((item) => item.status === "remediated").length,
      verifiedItems: plan.items.filter((item) => item.status === "verified").length
    },
    manualOnly: true,
    noExternalWrite: true,
    noExternalServices: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export type TeoyubeReleaseCandidateRemediationPlanInput = {
  queue?: TeoyubeReleaseCandidateFixQueue;
  items?: TeoyubeReleaseCandidateRemediationItem[];
  risk?: TeoyubeReleaseCandidateRemediationRisk;
};
