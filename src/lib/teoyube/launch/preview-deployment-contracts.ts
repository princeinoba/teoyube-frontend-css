import type { ISODateString } from "../../tig";

export type TeoyubePreviewDeploymentStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "not_ready"
  | "unknown";

export type TeoyubePreviewDeploymentTarget =
  | "vercel"
  | "netlify"
  | "render"
  | "railway"
  | "self_hosted"
  | "undecided"
  | "unknown";

export type TeoyubePreviewDeploymentDecision =
  | "ready_for_preview_deployment"
  | "ready_for_preview_manual_review"
  | "blocked"
  | "needs_environment_update"
  | "needs_build_fix"
  | "needs_qa_fix"
  | "unknown";

export type TeoyubeSoftLaunchCandidateStatus =
  | "ready"
  | "ready_after_manual_review"
  | "blocked"
  | "needs_preview_deployment_first"
  | "needs_qa_fix"
  | "unknown";

export type TeoyubePreviewDeploymentChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  status: TeoyubePreviewDeploymentStatus;
  details: string;
  manualReviewRequired?: boolean;
  nextAction?: string;
};

export type TeoyubePreviewDeploymentBlocker = {
  id: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubePreviewDeploymentWarning = {
  id: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubePreviewManualReviewItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  details: string;
};

export type TeoyubePreviewRollbackPlan = {
  id: string;
  label: string;
  rollbackTriggers: string[];
  rollbackSteps: string[];
  manualReviewOwner: string;
  notes: string[];
};

export type TeoyubePreviewEnvironmentProfile = {
  id: string;
  label: string;
  target: TeoyubePreviewDeploymentTarget;
  runtimeMode: "safe_preview" | "preview_manual_review" | "unknown";
  featureFlags: Record<string, boolean>;
  environmentVariablePlaceholders: string[];
  disabledUntilLater: string[];
  safetyRequirements: string[];
  manualReviewNotes: string[];
  rollbackNotes: string[];
};

export type TeoyubePreviewDeploymentReadiness = {
  status: TeoyubePreviewDeploymentStatus;
  decision: TeoyubePreviewDeploymentDecision;
  ready: boolean;
  checklist: TeoyubePreviewDeploymentChecklistItem[];
  blockers: TeoyubePreviewDeploymentBlocker[];
  warnings: TeoyubePreviewDeploymentWarning[];
};

export type TeoyubePreviewDeploymentReport = TeoyubePreviewDeploymentReadiness & {
  target: TeoyubePreviewDeploymentTarget;
  checklistCount: number;
  completeChecklistCount: number;
  manualReviewItems: TeoyubePreviewManualReviewItem[];
  rollbackPlan: TeoyubePreviewRollbackPlan;
  generatedAt: ISODateString;
};

