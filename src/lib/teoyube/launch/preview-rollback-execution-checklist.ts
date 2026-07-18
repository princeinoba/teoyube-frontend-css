import type { TeoyubePreviewDeploymentRollbackItem } from "./preview-deployment-execution-contracts";

export type TeoyubePreviewRollbackState = {
  triggeredItemIds?: string[];
  completedItemIds?: string[];
};

export function getPreviewRollbackTriggers(): string[] {
  return [
    "preview app does not load",
    "build output is broken",
    "Scripture anchors missing",
    "explanation paths missing",
    "unsafe fallback behavior",
    "consent controls missing",
    "debug info exposed",
    "external analytics unexpectedly sending",
    "persistence unexpectedly enabled",
    "live AI orchestration unexpectedly enabled",
    "launch-critical accessibility blocker",
    "launch-critical mobile blocker"
  ];
}

export function getPreviewRollbackExecutionChecklist(): TeoyubePreviewDeploymentRollbackItem[] {
  return getPreviewRollbackTriggers().map((trigger, index) => ({
    id: `preview_rollback_${index + 1}`,
    label: `Rollback trigger: ${trigger}`,
    trigger,
    requiredAction: "Stop sharing the preview URL, document the issue, disable or revert the affected surface, and rerun checks before retrying.",
    required: true,
    complete: false
  }));
}

export function createPreviewRollbackPlan() {
  return {
    id: "preview_rollback_execution_plan",
    label: "Preview Rollback Execution Checklist",
    checklist: getPreviewRollbackExecutionChecklist(),
    notes: [
      "This module does not perform rollback.",
      "Rollback is a manual provider/repository action after human review."
    ],
    generatedAt: new Date().toISOString()
  };
}

export function createPreviewRollbackDecision(state: TeoyubePreviewRollbackState = {}) {
  const triggered = state.triggeredItemIds || [];

  return {
    decision: triggered.length > 0 ? "rollback_required" : "rollback_not_required",
    triggeredItemIds: triggered,
    completedItemIds: state.completedItemIds || [],
    ready: triggered.length === 0,
    generatedAt: new Date().toISOString()
  };
}

export function createPreviewRollbackReport(state: TeoyubePreviewRollbackState = {}) {
  const plan = createPreviewRollbackPlan();
  const decision = createPreviewRollbackDecision(state);

  return {
    ...decision,
    plan,
    checklistCount: plan.checklist.length,
    completedChecklistCount: plan.checklist.filter((item) => (state.completedItemIds || []).includes(item.id)).length
  };
}

