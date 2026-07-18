import {
  getSafeDefaultRuntimeConfig,
  validateTeoyubeRuntimeConfig,
  type TeoyubeRuntimeConfig
} from "../mobile-scale/runtime-config-readiness";
import type {
  TeoyubeLaunchChecklistItem,
  TeoyubeLaunchEnvironmentStatus,
  TeoyubeLaunchReadinessStatus,
  TeoyubeLaunchWarning
} from "./production-launch-contracts";

function item(
  id: string,
  label: string,
  complete: boolean,
  details: string,
  nextAction?: string
): TeoyubeLaunchChecklistItem {
  return {
    id,
    label,
    stage: "environment_preparation",
    status: complete ? "ready" : "needs_configuration",
    required: true,
    complete,
    riskLevel: complete ? "low" : "high",
    details,
    nextAction
  };
}

function warning(
  id: string,
  message: string,
  recommendedAction: string
): TeoyubeLaunchWarning {
  return {
    id,
    label: id.replace(/_/g, " "),
    riskLevel: "medium",
    message,
    recommendedAction
  };
}

function mergeConfig(config: Partial<TeoyubeRuntimeConfig> = {}): TeoyubeRuntimeConfig {
  const defaults = getSafeDefaultRuntimeConfig();

  return {
    ...defaults,
    ...config,
    featureFlags: {
      ...defaults.featureFlags,
      ...(config.featureFlags || {})
    }
  };
}

export function getRequiredEnvironmentVariablesForLaunch(): string[] {
  return [
    "NODE_ENV",
    "TEOYUBE_DEPLOYMENT_TARGET"
  ];
}

export function getOptionalEnvironmentVariablesForLaunch(): string[] {
  return [
    "NEXT_PUBLIC_TEOYUBE_APP_VERSION",
    "NEXT_PUBLIC_TEOYUBE_BUILD_ID",
    "YOUTUBE_API_KEY"
  ];
}

export function getLaunchEnvironmentChecklist(
  config: Partial<TeoyubeRuntimeConfig> = getSafeDefaultRuntimeConfig()
): TeoyubeLaunchChecklistItem[] {
  const merged = mergeConfig(config);
  const flags = merged.featureFlags;

  return [
    item(
      "app_environment_declared",
      "App environment can be declared",
      Boolean(merged.appEnvironment),
      "The runtime config has an appEnvironment value.",
      "Set NODE_ENV and the deployment environment deliberately before deployment."
    ),
    item(
      "deployment_target_declared",
      "Deployment target can be declared",
      Boolean(merged.deploymentTarget),
      "The runtime config has a deploymentTarget value.",
      "Choose preview or production target during Production Launch Preparation 1.2."
    ),
    item(
      "debug_disabled_for_launch",
      "Debug output disabled for production launch",
      !flags.debugModeEnabled,
      "Debug mode is disabled in the safe default runtime config.",
      "Keep debugModeEnabled false for preview and production."
    ),
    item(
      "offline_fallback_enabled",
      "Offline fallback enabled",
      flags.offlineFallbackEnabled && flags.fallbackPathEnabled,
      "Offline and fallback paths remain available for safe Scripture-grounded responses.",
      "Enable fallbackPathEnabled and offlineFallbackEnabled."
    ),
    item(
      "scripture_anchoring_required",
      "Scripture anchoring required",
      flags.scriptureAnchoringRequired,
      "Every usable production response must include a Scripture anchor.",
      "Set scriptureAnchoringRequired true."
    ),
    item(
      "explanation_path_required",
      "Explanation path required",
      flags.explanationPathRequired,
      "Users must be able to understand why Scripture, promise, prayer, reflection, and action were selected.",
      "Set explanationPathRequired true."
    ),
    item(
      "guardrails_enabled",
      "Safety guardrails enabled",
      flags.safetyGuardrailsEnabled,
      "Production launch preparation keeps guardrails enabled by default.",
      "Set safetyGuardrailsEnabled true."
    ),
    item(
      "analytics_not_externally_sent",
      "Analytics not externally sent unless intentionally configured",
      !flags.externalEventSendingEnabled,
      "Analytics event payloads may be prepared locally, but no external provider is called.",
      "Keep externalEventSendingEnabled false until a provider, privacy review, and consent rules are connected."
    ),
    item(
      "persistence_not_connected",
      "Production persistence disabled until intentionally configured",
      !flags.productionPersistenceEnabled,
      "Database writes remain disabled during this launch readiness step.",
      "Keep productionPersistenceEnabled false until a database adapter is reviewed and connected."
    ),
    item(
      "live_ai_not_connected",
      "Live AI orchestration disabled",
      !flags.liveAiOrchestrationEnabled,
      "The app uses local graph logic and safe fallbacks only in this step.",
      "Keep liveAiOrchestrationEnabled false until a later guarded phase."
    ),
    item(
      "raw_text_not_stored",
      "Raw sensitive text storage disabled",
      !flags.rawTextStorageEnabled,
      "Raw private text is not stored by default.",
      "Keep rawTextStorageEnabled false."
    ),
    item(
      "hidden_personalization_disabled",
      "Hidden personalization disabled",
      !flags.hiddenPersonalizationEnabled,
      "Personalization remains visible, consent-aware, and reversible.",
      "Keep hiddenPersonalizationEnabled false."
    )
  ];
}

export function validateLaunchEnvironmentReadiness(
  config: Partial<TeoyubeRuntimeConfig> = getSafeDefaultRuntimeConfig()
): TeoyubeLaunchEnvironmentStatus {
  const merged = mergeConfig(config);
  const runtimeValidation = validateTeoyubeRuntimeConfig(merged);
  const checks = getLaunchEnvironmentChecklist(merged);
  const criticalFailures = checks.filter((entry) => entry.required && !entry.complete);
  const runtimeWarnings = runtimeValidation.warnings.map((message, index) =>
    warning(
      `runtime_warning_${index + 1}`,
      message,
      "Review this warning during Production Launch Preparation 1.2."
    )
  );
  const warnings = [
    warning(
      "provider_selection_pending",
      "Deployment target and environment values are checklist-ready, but provider selection is intentionally pending.",
      "Choose the deployment target in Production Launch Preparation 1.2."
    ),
    ...runtimeWarnings
  ];
  const status: TeoyubeLaunchReadinessStatus =
    criticalFailures.length === 0 && runtimeValidation.valid ? "ready" : "blocked";

  return {
    status,
    target: merged.deploymentTarget,
    appEnvironment: merged.appEnvironment,
    checks,
    requiredVariables: getRequiredEnvironmentVariablesForLaunch(),
    optionalVariables: getOptionalEnvironmentVariablesForLaunch(),
    warnings
  };
}

export function createLaunchEnvironmentReport(
  config: Partial<TeoyubeRuntimeConfig> = getSafeDefaultRuntimeConfig()
): TeoyubeLaunchEnvironmentStatus {
  return validateLaunchEnvironmentReadiness(config);
}

