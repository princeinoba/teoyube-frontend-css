import type { TeoyubePreviewDeploymentTarget } from "./preview-deployment-contracts";
import type {
  TeoyubePreviewDeploymentExecutionChecklist,
  TeoyubePreviewDeploymentExecutionReport,
  TeoyubePreviewDeploymentExecutionResult,
  TeoyubePreviewDeploymentExecutionStatus,
  TeoyubePreviewDeploymentExecutionStep
} from "./preview-deployment-execution-contracts";

function step(
  id: string,
  label: string,
  phase: TeoyubePreviewDeploymentExecutionStep["phase"],
  details: string,
  status: TeoyubePreviewDeploymentExecutionStatus = "not_started",
  command?: string
): TeoyubePreviewDeploymentExecutionStep {
  return {
    id,
    label,
    phase,
    required: true,
    status,
    details,
    manualOnly: true,
    command
  };
}

export function getPreviewDeploymentExecutionSteps(
  target: TeoyubePreviewDeploymentTarget = "vercel"
): TeoyubePreviewDeploymentExecutionStep[] {
  return [
    ...getPreviewDeploymentManualSteps(target),
    ...getPreviewDeploymentVerificationSteps(target)
  ];
}

export function getPreviewDeploymentManualSteps(
  target: TeoyubePreviewDeploymentTarget = "vercel"
): TeoyubePreviewDeploymentExecutionStep[] {
  return [
    step("confirm_provider", "Confirm selected provider or undecided state", "manual_deployment", `Target is ${target}; execute deployment manually only.`),
    step("confirm_preview_env_values", "Confirm preview environment values", "manual_deployment", "Use placeholders or safe preview values only; do not expose secrets."),
    step("manual_deployment_command", "Run provider deployment manually later", "manual_deployment", "This module does not execute deployment commands.", "not_started"),
    step("capture_preview_url", "Capture preview URL manually after deployment", "manual_deployment", "Do not hardcode the preview URL into app logic."),
    step("review_deployment_logs", "Review deployment logs manually", "manual_deployment", "Do not write deployment logs to files from this module.")
  ];
}

export function getPreviewDeploymentVerificationSteps(
  target: TeoyubePreviewDeploymentTarget = "vercel"
): TeoyubePreviewDeploymentExecutionStep[] {
  return [
    step("verify_preview_app_loads", "Verify preview app loads", "post_check", `Manual post-check for ${target}.`),
    step("verify_main_surfaces_load", "Verify main surfaces load", "post_check", "Confirm launch-critical surfaces render."),
    step("verify_mobile_layout", "Verify mobile layout", "post_check", "Confirm mobile layout is usable."),
    step("verify_scripture_anchor", "Verify Scripture anchor visibility", "post_check", "Scripture anchors must appear where responses are shown."),
    step("verify_explanation_path", "Verify explanation path visibility", "post_check", "Explanation path must remain visible."),
    step("verify_fallback_behavior", "Verify fallback behavior", "post_check", "Fallback states must remain safe."),
    step("verify_consent_controls", "Verify consent controls", "post_check", "Consent controls must appear where personalization appears."),
    step("verify_debug_hidden", "Verify debug UI hidden", "post_check", "Debug payloads must not be visible to normal users."),
    step("verify_no_external_analytics", "Verify no external analytics sending", "post_check", "External analytics remains disabled."),
    step("verify_no_persistence", "Verify no production persistence", "post_check", "Production database persistence remains disabled."),
    step("verify_no_live_ai", "Verify no live AI orchestration", "post_check", "Live AI orchestration remains disabled."),
    step("verify_safe_errors", "Verify safe error states", "post_check", "Errors must not expose secrets or raw payloads.")
  ];
}

export function getPreviewDeploymentExecutionChecklist(
  target: TeoyubePreviewDeploymentTarget = "vercel"
): TeoyubePreviewDeploymentExecutionChecklist {
  return {
    id: "preview_deployment_execution_checklist",
    label: "Preview Deployment Execution Checklist",
    target,
    steps: [
      step("confirm_branch", "Confirm branch is correct", "preflight", "Review branch manually before deployment."),
      step("confirm_working_tree", "Confirm working tree state", "preflight", "Working tree should be clean or changes intentionally included."),
      step("confirm_install", "Confirm package install succeeds", "preflight", "Run package install only if needed."),
      step("confirm_typecheck", "Confirm typecheck passes or issue documented", "preflight", "Run typecheck if available."),
      step("confirm_lint", "Confirm lint passes or issue documented", "preflight", "Run lint if available."),
      step("confirm_build", "Confirm build passes", "preflight", "Run production build before deployment."),
      step("confirm_tests", "Confirm tests or smoke checks pass", "preflight", "Run tests if available and launch smoke checks."),
      step("confirm_environment_profile", "Confirm environment profile selected", "preflight", "Use safe preview environment profile."),
      step("confirm_safe_flags", "Confirm safe feature flags active", "preflight", "Scripture, explanations, fallback, guardrails, and consent stay enabled."),
      step("confirm_no_secrets", "Confirm no real secrets exposed", "preflight", "Do not commit or display secrets."),
      step("confirm_analytics_disabled", "Confirm external analytics disabled", "preflight", "External analytics sending stays disabled."),
      step("confirm_persistence_disabled", "Confirm production persistence disabled", "preflight", "Production persistence stays disabled."),
      step("confirm_live_ai_disabled", "Confirm live AI disabled", "preflight", "Live AI orchestration stays disabled."),
      step("confirm_scripture_required", "Confirm Scripture anchoring required", "preflight", "Scripture anchoring remains required."),
      step("confirm_explanation_required", "Confirm explanation path required", "preflight", "Explanation path remains required."),
      step("confirm_fallback_enabled", "Confirm fallback path enabled", "preflight", "Fallback path remains enabled."),
      step("confirm_consent_enabled", "Confirm consent controls enabled", "preflight", "Consent controls remain enabled."),
      ...getPreviewDeploymentExecutionSteps(target)
    ],
    generatedAt: new Date().toISOString()
  };
}

export function getPreviewDeploymentExecutionBlockers(
  results: TeoyubePreviewDeploymentExecutionResult[] = []
): string[] {
  return results
    .filter((entry) => entry.status === "failed" || entry.status === "blocked")
    .map((entry) => `${entry.stepId}: ${entry.summary}`);
}

export function getPreviewDeploymentExecutionWarnings(
  results: TeoyubePreviewDeploymentExecutionResult[] = []
): string[] {
  return [
    ...results
      .filter((entry) => entry.status === "needs_review" || entry.status === "ready_with_warnings")
      .map((entry) => `${entry.stepId}: ${entry.summary}`),
    "This checklist does not execute deployment commands or write deployment logs."
  ];
}

export function createPreviewDeploymentExecutionReport(params: {
  target?: TeoyubePreviewDeploymentTarget;
  results?: TeoyubePreviewDeploymentExecutionResult[];
} = {}): TeoyubePreviewDeploymentExecutionReport {
  const results = params.results || [];
  const blockers = getPreviewDeploymentExecutionBlockers(results);
  const warnings = getPreviewDeploymentExecutionWarnings(results);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    decision: blockers.length ? "no_go_blocked" : warnings.length ? "go_after_manual_review" : "go_for_preview_deployment",
    ready: blockers.length === 0,
    checklist: getPreviewDeploymentExecutionChecklist(params.target || "vercel"),
    results,
    blockers,
    warnings,
    generatedAt: new Date().toISOString()
  };
}

