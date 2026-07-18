export type TeoyubePreviewDeploymentExecutionStatus =
  | "ready"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "not_started"
  | "in_progress"
  | "complete"
  | "failed"
  | "unknown";

export type TeoyubePreviewDeploymentGoNoGoDecision =
  | "go_for_preview_deployment"
  | "go_after_manual_review"
  | "no_go_blocked"
  | "needs_build_fix"
  | "needs_environment_fix"
  | "needs_qa_fix"
  | "unknown";

export type TeoyubePreviewDeploymentExecutionStep = {
  id: string;
  label: string;
  phase: "preflight" | "manual_deployment" | "post_check" | "rollback";
  required: boolean;
  status: TeoyubePreviewDeploymentExecutionStatus;
  details: string;
  manualOnly: boolean;
  command?: string;
};

export type TeoyubePreviewDeploymentExecutionChecklist = {
  id: string;
  label: string;
  target: string;
  steps: TeoyubePreviewDeploymentExecutionStep[];
  generatedAt: string;
};

export type TeoyubePreviewDeploymentExecutionResult = {
  stepId: string;
  status: TeoyubePreviewDeploymentExecutionStatus;
  summary: string;
  checkedAt?: string;
};

export type TeoyubePreviewDeploymentPreflightCheck = TeoyubePreviewDeploymentExecutionStep & {
  category: "git" | "dependencies" | "build" | "environment" | "safety" | "qa";
};

export type TeoyubePreviewDeploymentPostCheck = TeoyubePreviewDeploymentExecutionStep & {
  surface?: string;
  category: "route" | "mobile" | "scripture" | "explanation" | "fallback" | "consent" | "security";
};

export type TeoyubePreviewDeploymentVerificationItem = {
  id: string;
  label: string;
  required: boolean;
  verified: boolean;
  details: string;
};

export type TeoyubePreviewDeploymentIssue = {
  id: string;
  category:
    | "build"
    | "environment"
    | "mobile_ui"
    | "accessibility"
    | "tig_response"
    | "scripture_anchor"
    | "explanation_path"
    | "fallback"
    | "consent"
    | "personalization"
    | "offline"
    | "security"
    | "unknown";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  details: string;
  status: "open" | "in_review" | "resolved" | "wont_fix";
  recommendedAction: string;
  createdAt: string;
  updatedAt: string;
};

export type TeoyubePreviewDeploymentRollbackItem = {
  id: string;
  label: string;
  trigger: string;
  requiredAction: string;
  required: boolean;
  complete: boolean;
};

export type TeoyubePreviewDeploymentExecutionReport = {
  status: TeoyubePreviewDeploymentExecutionStatus;
  decision: TeoyubePreviewDeploymentGoNoGoDecision;
  ready: boolean;
  checklist: TeoyubePreviewDeploymentExecutionChecklist;
  results: TeoyubePreviewDeploymentExecutionResult[];
  blockers: string[];
  warnings: string[];
  generatedAt: string;
};

