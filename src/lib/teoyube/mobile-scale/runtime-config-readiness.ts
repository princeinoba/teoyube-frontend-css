import type {
  TeoyubeDeploymentReadinessStatus,
  TeoyubeDeploymentTarget,
  TeoyubeEnvironmentVariableRequirement,
  TeoyubeProductionSafetyRequirement,
  TeoyubeRuntimeEnvironment,
  TeoyubeScaleReadinessCheck,
  TeoyubeScaleReadinessReport
} from "./scale-readiness-contracts";

export type TeoyubeRuntimeFeatureFlags = {
  analyticsEnabled: boolean;
  externalEventSendingEnabled: boolean;
  personalizationPreviewEnabled: boolean;
  productionPersistenceEnabled: boolean;
  liveAiOrchestrationEnabled: boolean;
  debugModeEnabled: boolean;
  offlineFallbackEnabled: boolean;
  rawTextStorageEnabled: boolean;
  hiddenPersonalizationEnabled: boolean;
  scriptureAnchoringRequired: boolean;
  explanationPathRequired: boolean;
  consentControlsRequired: boolean;
  safetyGuardrailsEnabled: boolean;
  fallbackPathEnabled: boolean;
};

export type TeoyubeRuntimeConfig = {
  appEnvironment: TeoyubeRuntimeEnvironment;
  deploymentTarget: TeoyubeDeploymentTarget;
  featureFlags: TeoyubeRuntimeFeatureFlags;
  environmentVariables?: Record<string, string | undefined>;
  appVersion?: string;
  buildId?: string;
};

export type TeoyubeRuntimeConfigValidation = {
  valid: boolean;
  status: TeoyubeDeploymentReadinessStatus;
  checks: TeoyubeScaleReadinessCheck[];
  errors: string[];
  warnings: string[];
};

export function getSafeDefaultRuntimeConfig(): TeoyubeRuntimeConfig {
  return {
    appEnvironment: "development",
    deploymentTarget: "local",
    featureFlags: {
      analyticsEnabled: false,
      externalEventSendingEnabled: false,
      personalizationPreviewEnabled: false,
      productionPersistenceEnabled: false,
      liveAiOrchestrationEnabled: false,
      debugModeEnabled: false,
      offlineFallbackEnabled: true,
      rawTextStorageEnabled: false,
      hiddenPersonalizationEnabled: false,
      scriptureAnchoringRequired: true,
      explanationPathRequired: true,
      consentControlsRequired: true,
      safetyGuardrailsEnabled: true,
      fallbackPathEnabled: true
    }
  };
}

export function getTeoyubeRuntimeConfigRequirements(): {
  environmentVariables: TeoyubeEnvironmentVariableRequirement[];
  safetyRequirements: TeoyubeProductionSafetyRequirement[];
} {
  return {
    environmentVariables: [
      {
        key: "YOUTUBE_API_KEY",
        requiredFor: ["production"],
        requiredInPhase74: false,
        sensitive: true,
        description: "Existing YouTube API key placeholder. Phase 7.4 does not expose or validate secret values."
      },
      {
        key: "TEOYUBE_DEPLOYMENT_TARGET",
        requiredFor: ["preview", "production"],
        requiredInPhase74: false,
        sensitive: false,
        description: "Future explicit deployment target flag.",
        safeDefault: "local"
      }
    ],
    safetyRequirements: [
      {
        id: "scripture_anchor_required",
        label: "Scripture anchoring required",
        required: true,
        status: "ready",
        reason: "Every usable TIG response must remain Scripture anchored."
      },
      {
        id: "explanation_path_required",
        label: "Explanation path required",
        required: true,
        status: "ready",
        reason: "Scale-readiness cannot hide why a response was selected."
      },
      {
        id: "live_ai_disabled",
        label: "Live AI orchestration disabled",
        required: true,
        status: "ready",
        reason: "Phase 7.4 prepares deployment structure without live AI orchestration."
      },
      {
        id: "production_persistence_disabled",
        label: "Production persistence disabled",
        required: true,
        status: "ready",
        reason: "Database persistence remains a future adapter connection."
      }
    ]
  };
}

function check(
  id: string,
  label: string,
  passed: boolean,
  details: string,
  remediation?: string
): TeoyubeScaleReadinessCheck {
  return {
    id,
    label,
    status: passed ? "ready" : "blocked",
    required: true,
    riskLevel: passed ? "low" : "high",
    details,
    remediation
  };
}

export function validateTeoyubeRuntimeConfig(
  config: Partial<TeoyubeRuntimeConfig>
): TeoyubeRuntimeConfigValidation {
  const merged = {
    ...getSafeDefaultRuntimeConfig(),
    ...config,
    featureFlags: {
      ...getSafeDefaultRuntimeConfig().featureFlags,
      ...(config.featureFlags || {})
    }
  };
  const flags = merged.featureFlags;
  const checks = [
    check(
      "analytics_safe_default",
      "Analytics is disabled unless explicitly configured",
      !flags.externalEventSendingEnabled,
      "External event sending remains disabled by default.",
      "Disable externalEventSendingEnabled until a provider and privacy review are connected."
    ),
    check(
      "production_persistence_disabled",
      "Production persistence is disabled",
      !flags.productionPersistenceEnabled,
      "Phase 7.4 does not connect a database provider.",
      "Keep productionPersistenceEnabled false until a future persistence adapter is implemented."
    ),
    check(
      "live_ai_disabled",
      "Live AI orchestration is disabled",
      !flags.liveAiOrchestrationEnabled,
      "Phase 7.4 does not add live AI orchestration.",
      "Keep liveAiOrchestrationEnabled false in this phase."
    ),
    check(
      "raw_text_storage_disabled",
      "Raw text storage is disabled",
      !flags.rawTextStorageEnabled,
      "Raw sensitive personalization text is not persisted by default.",
      "Store only sanitized structured signals in a future consented adapter."
    ),
    check(
      "hidden_personalization_disabled",
      "Hidden personalization is disabled",
      !flags.hiddenPersonalizationEnabled,
      "Personalization must remain visible, consent-aware, and reversible.",
      "Disable hiddenPersonalizationEnabled."
    ),
    check(
      "scripture_anchor_required",
      "Scripture anchoring is required",
      flags.scriptureAnchoringRequired,
      "Every usable response needs at least one Scripture anchor.",
      "Set scriptureAnchoringRequired true."
    ),
    check(
      "explanation_path_required",
      "Explanation paths are required",
      flags.explanationPathRequired,
      "Users should be able to see why Scripture, promises, and actions were selected.",
      "Set explanationPathRequired true."
    ),
    check(
      "fallback_path_enabled",
      "Fallback path is enabled",
      flags.fallbackPathEnabled && flags.offlineFallbackEnabled,
      "Offline and weak-confidence states need a Scripture-safe fallback path.",
      "Enable fallbackPathEnabled and offlineFallbackEnabled."
    )
  ];
  const errors = checks
    .filter((item) => item.required && item.status === "blocked")
    .map((item) => item.remediation || item.details);

  return {
    valid: errors.length === 0,
    status: errors.length === 0 ? "ready" : "blocked",
    checks,
    errors,
    warnings: getRuntimeConfigWarnings(merged)
  };
}

export function getRuntimeConfigWarnings(config: Partial<TeoyubeRuntimeConfig>): string[] {
  const merged = {
    ...getSafeDefaultRuntimeConfig(),
    ...config,
    featureFlags: {
      ...getSafeDefaultRuntimeConfig().featureFlags,
      ...(config.featureFlags || {})
    }
  };
  const warnings = [
    "Phase 7.4 prepares runtime configuration but does not connect providers."
  ];

  if (merged.deploymentTarget === "production" && merged.featureFlags.debugModeEnabled) {
    warnings.push("Debug output should be disabled in production.");
  }

  if (merged.featureFlags.analyticsEnabled && !merged.featureFlags.externalEventSendingEnabled) {
    warnings.push("Analytics may be locally prepared, but external sending is disabled.");
  }

  return warnings;
}

export function createRuntimeConfigReadinessReport(
  config: Partial<TeoyubeRuntimeConfig> = getSafeDefaultRuntimeConfig()
): TeoyubeScaleReadinessReport {
  const merged = {
    ...getSafeDefaultRuntimeConfig(),
    ...config,
    featureFlags: {
      ...getSafeDefaultRuntimeConfig().featureFlags,
      ...(config.featureFlags || {})
    }
  };
  const validation = validateTeoyubeRuntimeConfig(merged);
  const required = validation.checks.filter((item) => item.required);
  const complete = required.filter((item) => item.status === "ready");

  return {
    id: "phase_7_4_runtime_config_readiness",
    title: "Runtime Configuration Readiness",
    status: validation.status,
    target: merged.deploymentTarget,
    complete: validation.valid,
    completionPercentage: Math.round((complete.length / Math.max(1, required.length)) * 100),
    checks: validation.checks,
    warnings: validation.warnings,
    generatedAt: new Date().toISOString()
  };
}

