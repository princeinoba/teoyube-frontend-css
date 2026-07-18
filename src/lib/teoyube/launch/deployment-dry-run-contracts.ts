import type { TeoyubeDeploymentTarget, TeoyubeEnvironmentConfigProfile } from "./launch-environment-contracts";

export type TeoyubeDeploymentDryRunTarget = TeoyubeDeploymentTarget;

export type TeoyubeDeploymentDryRunStep = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  details: string;
};

export type TeoyubeDeploymentDryRunPlan = {
  id: string;
  target: TeoyubeDeploymentDryRunTarget;
  configProfile: TeoyubeEnvironmentConfigProfile;
  steps: TeoyubeDeploymentDryRunStep[];
  generatedAt: string;
};

export type TeoyubeDeploymentDryRunResult = {
  stepId: string;
  status: "pass" | "warning" | "fail" | "blocked" | "not_run";
  notes?: string;
};

export type TeoyubeDeploymentDryRunBlocker = {
  id: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubeDeploymentDryRunWarning = {
  id: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeDeploymentDryRunDecision =
  | "ready_for_preview_deployment"
  | "ready_for_manual_review"
  | "blocked"
  | "needs_environment_update"
  | "unknown";

export type TeoyubeDeploymentDryRunReport = {
  valid: boolean;
  decision: TeoyubeDeploymentDryRunDecision;
  target: TeoyubeDeploymentDryRunTarget;
  stepCount: number;
  completedStepCount: number;
  blockers: TeoyubeDeploymentDryRunBlocker[];
  warnings: TeoyubeDeploymentDryRunWarning[];
  plan: TeoyubeDeploymentDryRunPlan;
  generatedAt: string;
};

