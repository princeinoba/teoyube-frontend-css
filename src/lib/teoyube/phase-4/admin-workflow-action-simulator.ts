import {
  createControlledAdminWorkspaceReport,
  updateAdminWorkspaceReviewItem
} from "./controlled-admin-workspace";
import type {
  TeoyubeControlledAdminReviewAction,
  TeoyubeControlledAdminReviewDecision,
  TeoyubeControlledAdminWorkspace
} from "./controlled-admin-prototype-contracts";

export type TeoyubeAdminWorkflowActionSimulationReport = {
  valid: boolean;
  workspace: TeoyubeControlledAdminWorkspace;
  actionCount: number;
  blockers: string[];
  warnings: string[];
  simulatedOnly: true;
  noProductionDataModified: true;
  noAutomaticPublishing: true;
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

function now(): string {
  return new Date().toISOString();
}

function action(itemId: string, decision: TeoyubeControlledAdminReviewDecision, reason: string): TeoyubeControlledAdminReviewAction {
  return {
    id: `simulated_${decision}_${itemId}_${Date.now()}`,
    itemId,
    decision,
    actorRole: "system",
    reason,
    simulatedOnly: true,
    createdAt: now()
  };
}

function addCompletedReview(values: string[], review: string): string[] {
  return [...new Set([...values, review])];
}

export function simulateAdminReviewAction(
  workspace: TeoyubeControlledAdminWorkspace,
  reviewAction: TeoyubeControlledAdminReviewAction
): TeoyubeControlledAdminWorkspace {
  const item = workspace.items.find((entry) => entry.id === reviewAction.itemId);
  if (!item) {
    return { ...workspace, actions: [...workspace.actions, reviewAction], updatedAt: now() };
  }

  let update = {};
  if (reviewAction.decision === "request_scripture_review") {
    update = { status: "needs_review" as const, requiredReviews: addCompletedReview(item.requiredReviews, "scripture_review") };
  } else if (reviewAction.decision === "request_theology_review") {
    update = { status: "needs_review" as const, requiredReviews: addCompletedReview(item.requiredReviews, "theology_review") };
  } else if (reviewAction.decision === "request_copy_review") {
    update = { status: "needs_review" as const, requiredReviews: addCompletedReview(item.requiredReviews, "copy_review") };
  } else if (reviewAction.decision === "block") {
    update = { status: "blocked" as const, blockers: [...item.blockers, reviewAction.reason || "Blocked by simulated admin review."] };
  } else if (reviewAction.decision === "defer") {
    update = { status: "needs_review" as const, warnings: [...item.warnings, reviewAction.reason || "Deferred by simulated admin review."] };
  } else if (reviewAction.decision === "approve_for_future_release") {
    const missingReviews = item.requiredReviews.filter((review) => !item.completedReviews.includes(review));
    update = item.productionEligible && missingReviews.length === 0 && item.blockers.length === 0
      ? { status: "ready_for_future_release" as const }
      : {
          status: "needs_review" as const,
          warnings: [
            ...item.warnings,
            "Approval simulation did not bypass production eligibility, blockers, or required reviews."
          ]
        };
  }

  const updated = updateAdminWorkspaceReviewItem(workspace, item.id, update);
  return { ...updated, actions: [...updated.actions, reviewAction], updatedAt: now() };
}

export function simulateApproveForFutureRelease(workspace: TeoyubeControlledAdminWorkspace, itemId: string) {
  return simulateAdminReviewAction(workspace, action(itemId, "approve_for_future_release", "Simulated approval for future release only."));
}

export function simulateRequestScriptureReview(workspace: TeoyubeControlledAdminWorkspace, itemId: string) {
  return simulateAdminReviewAction(workspace, action(itemId, "request_scripture_review", "Simulated request for Scripture review."));
}

export function simulateRequestTheologyReview(workspace: TeoyubeControlledAdminWorkspace, itemId: string) {
  return simulateAdminReviewAction(workspace, action(itemId, "request_theology_review", "Simulated request for theology review."));
}

export function simulateRequestCopyReview(workspace: TeoyubeControlledAdminWorkspace, itemId: string) {
  return simulateAdminReviewAction(workspace, action(itemId, "request_copy_review", "Simulated request for copy review."));
}

export function simulateBlockContentItem(workspace: TeoyubeControlledAdminWorkspace, itemId: string, reason: string) {
  return simulateAdminReviewAction(workspace, action(itemId, "block", reason));
}

export function simulateDeferContentItem(workspace: TeoyubeControlledAdminWorkspace, itemId: string, reason: string) {
  return simulateAdminReviewAction(workspace, action(itemId, "defer", reason));
}

export function createAdminWorkflowActionSimulationReport(
  workspace: TeoyubeControlledAdminWorkspace
): TeoyubeAdminWorkflowActionSimulationReport {
  const workspaceReport = createControlledAdminWorkspaceReport(workspace);
  return {
    valid: workspaceReport.valid && workspace.inMemoryOnly && workspace.noProductionDataModified,
    workspace,
    actionCount: workspace.actions.length,
    blockers: workspaceReport.blockers.map((entry) => entry.message),
    warnings: workspaceReport.warnings.map((entry) => entry.message),
    simulatedOnly: true,
    noProductionDataModified: true,
    noAutomaticPublishing: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}
