import { createLaunchEnvironmentSafetyReport } from "./launch-environment-safety-audit";
import { getPreviewEnvironmentFeatureFlags } from "./preview-environment-package";
import type {
  TeoyubePreviewDeploymentExecutionStatus,
  TeoyubePreviewDeploymentPreflightCheck
} from "./preview-deployment-execution-contracts";

export type TeoyubePreviewDeploymentPreflightState = {
  packageInstallSucceeded?: boolean;
  typecheckPassed?: boolean;
  lintPassed?: boolean;
  buildPassed?: boolean;
  smokeChecksPassed?: boolean;
  environmentProfileSelected?: boolean;
  workingTreeReady?: boolean;
  branchConfirmed?: boolean;
  launchCriticalQaBlockers?: string[];
  publicEnvEntries?: Array<{ key: string; value: string }>;
};

export type TeoyubePreviewDeploymentPreflightDecision =
  | "ready_for_manual_preview_deployment"
  | "ready_with_warnings"
  | "blocked"
  | "needs_review"
  | "unknown";

function check(
  id: string,
  label: string,
  category: TeoyubePreviewDeploymentPreflightCheck["category"],
  passed: boolean,
  details: string
): TeoyubePreviewDeploymentPreflightCheck {
  return {
    id,
    label,
    category,
    phase: "preflight",
    required: true,
    status: passed ? "ready" : "needs_review",
    details,
    manualOnly: true
  };
}

function looksSecret(value: string): boolean {
  return /(secret|token|private|sk-|key=|password|connection|string)/i.test(value);
}

export function getPreviewDeploymentPreflightChecklist(
  state: TeoyubePreviewDeploymentPreflightState = {}
): TeoyubePreviewDeploymentPreflightCheck[] {
  const flags = getPreviewEnvironmentFeatureFlags();
  const qaBlockers = state.launchCriticalQaBlockers || [];
  const publicEnvEntries = state.publicEnvEntries || [];

  return [
    check("branch_confirmed", "Branch is confirmed", "git", state.branchConfirmed !== false, "Confirm the deployment branch manually."),
    check("working_tree_ready", "Working tree ready", "git", state.workingTreeReady !== false, "Working tree should be clean or intentionally included."),
    check("package_install", "Package install succeeds", "dependencies", state.packageInstallSucceeded !== false, "Install dependencies if needed."),
    check("typecheck", "Typecheck passes or issue documented", "build", state.typecheckPassed !== false, "Run typecheck when available."),
    check("lint", "Lint passes or issue documented", "build", state.lintPassed !== false, "Run lint when available."),
    check("build", "Build passes", "build", state.buildPassed !== false, "Run production build before preview deployment."),
    check("smoke_checks", "Tests or smoke checks pass", "qa", state.smokeChecksPassed !== false, "Run available tests and launch smoke checks."),
    check("environment_profile", "Environment profile selected", "environment", state.environmentProfileSelected !== false, "Use the safe preview environment profile."),
    check("safe_feature_flags", "Safe feature flags active", "safety", flags.scriptureAnchoringRequired && flags.explanationPathRequired && flags.fallbackPathEnabled && flags.consentControlsEnabled, "Safe feature flags remain active."),
    check("no_public_secret_values", "No secret-looking public env values", "environment", publicEnvEntries.every((entry) => !looksSecret(`${entry.key}=${entry.value}`)), "Public environment values must not look like secrets."),
    check("analytics_disabled", "External analytics disabled", "safety", !flags.externalAnalyticsSendingEnabled, "External analytics sending remains disabled."),
    check("persistence_disabled", "Production persistence disabled", "safety", !flags.productionDatabasePersistenceEnabled, "Production database persistence remains disabled."),
    check("live_ai_disabled", "Live AI disabled", "safety", !flags.liveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    check("scripture_required", "Scripture anchoring required", "safety", flags.scriptureAnchoringRequired, "Scripture anchoring remains required."),
    check("explanation_required", "Explanation path required", "safety", flags.explanationPathRequired, "Explanation path remains required."),
    check("fallback_enabled", "Fallback path enabled", "safety", flags.fallbackPathEnabled, "Fallback path remains enabled."),
    check("consent_enabled", "Consent controls enabled", "safety", flags.consentControlsEnabled, "Consent controls remain enabled."),
    check("qa_blockers_clear", "No launch-critical QA blockers", "qa", qaBlockers.length === 0, "Launch-critical QA blockers must be resolved.")
  ];
}

export function getPreviewDeploymentPreflightBlockers(
  state: TeoyubePreviewDeploymentPreflightState = {}
): string[] {
  const flags = getPreviewEnvironmentFeatureFlags();
  const publicEnvEntries = state.publicEnvEntries || [];
  const blockers = [
    flags.productionDatabasePersistenceEnabled ? "Production persistence is enabled accidentally." : "",
    flags.externalAnalyticsSendingEnabled ? "External analytics sending is enabled accidentally." : "",
    flags.liveAiOrchestrationEnabled ? "Live AI orchestration is enabled accidentally." : "",
    !flags.scriptureAnchoringRequired ? "Scripture anchoring is disabled." : "",
    !flags.explanationPathRequired ? "Explanation path is disabled." : "",
    !flags.fallbackPathEnabled ? "Fallback path is disabled." : "",
    !flags.consentControlsEnabled ? "Consent controls are disabled." : "",
    publicEnvEntries.some((entry) => looksSecret(`${entry.key}=${entry.value}`)) ? "Public env config contains secret-looking values." : "",
    state.buildPassed === false ? "Build is known failed." : "",
    ...(state.launchCriticalQaBlockers || [])
  ].filter(Boolean);

  return blockers;
}

export function getPreviewDeploymentPreflightWarnings(
  state: TeoyubePreviewDeploymentPreflightState = {}
): string[] {
  return [
    state.typecheckPassed === undefined ? "Typecheck status should be recorded before manual preview deployment." : "",
    state.lintPassed === undefined ? "Lint status should be recorded before manual preview deployment." : "",
    state.buildPassed === undefined ? "Build status should be recorded before manual preview deployment." : "",
    ...createLaunchEnvironmentSafetyReport().warnings.map((entry) => entry.message)
  ].filter(Boolean);
}

export function createPreviewDeploymentPreflightDecision(
  state: TeoyubePreviewDeploymentPreflightState = {}
): TeoyubePreviewDeploymentPreflightDecision {
  const blockers = getPreviewDeploymentPreflightBlockers(state);
  const warnings = getPreviewDeploymentPreflightWarnings(state);

  if (blockers.length > 0) {
    return "blocked";
  }

  return warnings.length > 0 ? "ready_with_warnings" : "ready_for_manual_preview_deployment";
}

export function validatePreviewDeploymentPreflight(state: TeoyubePreviewDeploymentPreflightState = {}) {
  const blockers = getPreviewDeploymentPreflightBlockers(state);
  const warnings = getPreviewDeploymentPreflightWarnings(state);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" as TeoyubePreviewDeploymentExecutionStatus : warnings.length ? "ready_with_warnings" as TeoyubePreviewDeploymentExecutionStatus : "ready" as TeoyubePreviewDeploymentExecutionStatus,
    decision: createPreviewDeploymentPreflightDecision(state),
    blockers,
    warnings
  };
}

export function createPreviewDeploymentPreflightReport(state: TeoyubePreviewDeploymentPreflightState = {}) {
  const checklist = getPreviewDeploymentPreflightChecklist(state);
  const validation = validatePreviewDeploymentPreflight(state);

  return {
    ...validation,
    checklist,
    checkCount: checklist.length,
    readyCheckCount: checklist.filter((entry) => entry.status === "ready").length,
    generatedAt: new Date().toISOString()
  };
}

