import type {
  TeoyubeDeploymentReadinessStatus,
  TeoyubeProductionSafetyRequirement,
  TeoyubeScaleReadinessCheck,
  TeoyubeScaleReadinessReport
} from "./scale-readiness-contracts";
import {
  getSafeDefaultRuntimeConfig,
  type TeoyubeRuntimeConfig
} from "./runtime-config-readiness";

function mergeConfig(config: Partial<TeoyubeRuntimeConfig>): TeoyubeRuntimeConfig {
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

export function getEnvironmentSafetyRequirements(): TeoyubeProductionSafetyRequirement[] {
  return [
    {
      id: "production_guardrails",
      label: "Production guardrails required",
      required: true,
      status: "ready",
      reason: "Production mode requires Scripture anchoring, explanation paths, fallback handling, and safety guardrails."
    },
    {
      id: "external_analytics_explicit",
      label: "External analytics requires explicit provider review",
      required: true,
      status: "planned",
      reason: "No external analytics provider is connected in Phase 7.4."
    },
    {
      id: "persistence_consent_boundaries",
      label: "Persistence requires consent and privacy boundaries",
      required: true,
      status: "planned",
      reason: "Database writes remain future work and must preserve export, delete, and consent downgrade paths."
    },
    {
      id: "live_ai_blocked",
      label: "Live AI orchestration remains blocked",
      required: true,
      status: "ready",
      reason: "Phase 7.4 is deployment preparation, not live AI orchestration."
    }
  ];
}

export function shouldAllowProductionMode(config: Partial<TeoyubeRuntimeConfig>): boolean {
  const merged = mergeConfig(config);
  const flags = merged.featureFlags;

  return Boolean(
    flags.safetyGuardrailsEnabled &&
      flags.scriptureAnchoringRequired &&
      flags.explanationPathRequired &&
      flags.fallbackPathEnabled &&
      !flags.debugModeEnabled &&
      !flags.rawTextStorageEnabled &&
      !flags.hiddenPersonalizationEnabled &&
      !flags.liveAiOrchestrationEnabled
  );
}

export function shouldAllowExternalAnalytics(config: Partial<TeoyubeRuntimeConfig>): boolean {
  const flags = mergeConfig(config).featureFlags;

  return Boolean(
    flags.analyticsEnabled &&
      flags.externalEventSendingEnabled &&
      flags.consentControlsRequired &&
      !flags.rawTextStorageEnabled &&
      !flags.hiddenPersonalizationEnabled
  );
}

export function shouldAllowProductionPersistence(config: Partial<TeoyubeRuntimeConfig>): boolean {
  const flags = mergeConfig(config).featureFlags;

  return Boolean(
    flags.productionPersistenceEnabled &&
      flags.consentControlsRequired &&
      !flags.rawTextStorageEnabled &&
      !flags.hiddenPersonalizationEnabled
  );
}

export function shouldAllowLiveAiOrchestration(
  _config: Partial<TeoyubeRuntimeConfig>
): boolean {
  return false;
}

function check(
  id: string,
  label: string,
  passed: boolean,
  details: string
): TeoyubeScaleReadinessCheck {
  return {
    id,
    label,
    status: passed ? "ready" : "blocked",
    required: true,
    riskLevel: passed ? "low" : "critical",
    details
  };
}

export function validateEnvironmentSafety(config: Partial<TeoyubeRuntimeConfig>) {
  const merged = mergeConfig(config);
  const flags = merged.featureFlags;
  const checks = [
    check(
      "production_mode_guarded",
      "Production mode is guarded",
      merged.deploymentTarget !== "production" || shouldAllowProductionMode(merged),
      "Production mode needs Scripture, explanation, fallback, safety, privacy, and non-debug defaults."
    ),
    check(
      "external_analytics_guarded",
      "External analytics is guarded",
      !flags.externalEventSendingEnabled || shouldAllowExternalAnalytics(merged),
      "External analytics cannot be enabled without explicit consent-safe configuration."
    ),
    check(
      "persistence_guarded",
      "Production persistence is guarded",
      !flags.productionPersistenceEnabled || shouldAllowProductionPersistence(merged),
      "Persistence cannot be enabled without consent and privacy boundaries."
    ),
    check(
      "live_ai_blocked",
      "Live AI orchestration is blocked",
      !flags.liveAiOrchestrationEnabled && !shouldAllowLiveAiOrchestration(merged),
      "Live AI orchestration is intentionally unavailable in Phase 7.4."
    ),
    check(
      "production_debug_disabled",
      "Debug output disabled in production",
      merged.deploymentTarget !== "production" || !flags.debugModeEnabled,
      "Debug payloads should not be user-visible or logged in production by default."
    ),
    check(
      "raw_sensitive_text_blocked",
      "Raw sensitive text storage blocked",
      !flags.rawTextStorageEnabled,
      "Raw sensitive personalization text is not allowed by default."
    )
  ];
  const errors = checks
    .filter((item) => item.required && item.status === "blocked")
    .map((item) => item.details);

  return {
    valid: errors.length === 0,
    status: (errors.length ? "blocked" : "ready") as TeoyubeDeploymentReadinessStatus,
    checks,
    errors,
    warnings: [
      "Phase 7.4 does not connect analytics, persistence, live AI, or production hosting providers."
    ]
  };
}

export function createEnvironmentSafetyReport(
  config: Partial<TeoyubeRuntimeConfig> = getSafeDefaultRuntimeConfig()
): TeoyubeScaleReadinessReport {
  const merged = mergeConfig(config);
  const validation = validateEnvironmentSafety(merged);
  const complete = validation.checks.filter((item) => item.status === "ready");

  return {
    id: "phase_7_4_environment_safety",
    title: "Environment Safety Readiness",
    status: validation.status,
    target: merged.deploymentTarget,
    complete: validation.valid,
    completionPercentage: Math.round(
      (complete.length / Math.max(1, validation.checks.length)) * 100
    ),
    checks: validation.checks,
    warnings: validation.warnings,
    generatedAt: new Date().toISOString()
  };
}
