import type {
  TeoyubeDeploymentDryRunBlocker,
  TeoyubeDeploymentDryRunDecision,
  TeoyubeDeploymentDryRunPlan,
  TeoyubeDeploymentDryRunStep,
  TeoyubeDeploymentDryRunTarget,
  TeoyubeDeploymentDryRunWarning
} from "./deployment-dry-run-contracts";
import type { TeoyubeEnvironmentConfigProfile } from "./launch-environment-contracts";
import { getPreviewLaunchConfigProfile, validateLaunchConfigProfile } from "./launch-config-profiles";

function step(id: string, label: string, complete: boolean, details: string): TeoyubeDeploymentDryRunStep {
  return {
    id,
    label,
    required: true,
    complete,
    details
  };
}

export function getDeploymentDryRunSteps(
  target: TeoyubeDeploymentDryRunTarget,
  config: TeoyubeEnvironmentConfigProfile = getPreviewLaunchConfigProfile()
): TeoyubeDeploymentDryRunStep[] {
  const flags = config.featureFlags;

  return [
    step("confirm_build_command", "Confirm build command", true, "Use npm run build locally; do not deploy from this plan."),
    step("confirm_environment_profile", "Confirm environment profile", validateLaunchConfigProfile(config).valid, "Environment profile validates with safe launch defaults."),
    step("confirm_feature_flags", "Confirm feature flags", flags.scriptureAnchoringRequired && flags.explanationPathRequired && flags.fallbackPathEnabled, "Scripture anchoring, explanation paths, and fallback stay enabled."),
    step("confirm_deployment_target", "Confirm deployment target", target !== "unknown", `Deployment target is ${target}.`),
    step("analytics_disabled", "Confirm no external analytics sending", !flags.externalAnalyticsSendingEnabled, "Analytics sending remains disabled."),
    step("persistence_disabled", "Confirm no production persistence", !flags.productionDatabasePersistenceEnabled, "Production database persistence remains disabled."),
    step("live_ai_disabled", "Confirm live AI disabled", !flags.liveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    step("debug_disabled", "Confirm debug UI disabled", !flags.debugOutputVisibleToUsers, "Debug UI remains hidden from normal users."),
    step("scripture_required", "Confirm Scripture anchoring required", flags.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    step("explanation_required", "Confirm explanation path required", flags.explanationPathRequired, "Explanation paths remain required."),
    step("fallback_enabled", "Confirm fallback enabled", flags.fallbackPathEnabled, "Fallback path remains enabled."),
    step("consent_enabled", "Confirm consent controls enabled", flags.consentControlsEnabled, "Consent controls remain enabled."),
    step("rollback_manual_review", "Confirm rollback/manual review plan", true, "Provider rollback and manual review are follow-up items before preview deployment.")
  ];
}

export function createDeploymentDryRunPlan(
  target: TeoyubeDeploymentDryRunTarget = "vercel",
  config: TeoyubeEnvironmentConfigProfile = getPreviewLaunchConfigProfile()
): TeoyubeDeploymentDryRunPlan {
  return {
    id: `dry_run_${target}_${Date.now()}`,
    target,
    configProfile: config,
    steps: getDeploymentDryRunSteps(target, config),
    generatedAt: new Date().toISOString()
  };
}

export function getDeploymentDryRunBlockers(plan: TeoyubeDeploymentDryRunPlan): TeoyubeDeploymentDryRunBlocker[] {
  return plan.steps
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => ({
      id: entry.id,
      reason: entry.details,
      requiredAction: `Complete dry-run step: ${entry.label}.`
    }));
}

export function getDeploymentDryRunWarnings(plan: TeoyubeDeploymentDryRunPlan): TeoyubeDeploymentDryRunWarning[] {
  const warnings: TeoyubeDeploymentDryRunWarning[] = [
    {
      id: "no_actual_deployment",
      message: "This is a dry-run plan only. No provider CLI or deployment is executed.",
      recommendedAction: "Use this plan to prepare manual preview deployment review."
    }
  ];

  if (plan.target === "undecided" || plan.target === "unknown") {
    warnings.push({
      id: "target_not_final",
      message: "Deployment target is not final.",
      recommendedAction: "Confirm a target before preview deployment."
    });
  }

  return warnings;
}

export function createDeploymentDryRunDecision(plan: TeoyubeDeploymentDryRunPlan): TeoyubeDeploymentDryRunDecision {
  const blockers = getDeploymentDryRunBlockers(plan);

  if (blockers.length > 0) {
    return blockers.some((entry) => entry.id.includes("environment")) ? "needs_environment_update" : "blocked";
  }

  return plan.target === "undecided" || plan.target === "unknown"
    ? "ready_for_manual_review"
    : "ready_for_preview_deployment";
}

export function validateDeploymentDryRunPlan(plan: TeoyubeDeploymentDryRunPlan) {
  const blockers = getDeploymentDryRunBlockers(plan);
  return {
    valid: blockers.length === 0,
    blockers,
    warnings: getDeploymentDryRunWarnings(plan),
    decision: createDeploymentDryRunDecision(plan)
  };
}

export function createDeploymentDryRunReport(plan: TeoyubeDeploymentDryRunPlan) {
  const validation = validateDeploymentDryRunPlan(plan);

  return {
    valid: validation.valid,
    decision: validation.decision,
    target: plan.target,
    stepCount: plan.steps.length,
    completedStepCount: plan.steps.filter((entry) => entry.complete).length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    plan,
    generatedAt: new Date().toISOString()
  };
}

