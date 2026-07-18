import {
  getSafeDefaultRuntimeConfig,
  type TeoyubeRuntimeConfig
} from "../mobile-scale/runtime-config-readiness";
import type {
  TeoyubeLimitedSoftLaunchBlocker,
  TeoyubeLimitedSoftLaunchChecklistItem,
  TeoyubeLimitedSoftLaunchWarning
} from "./limited-soft-launch-execution-contracts";

export type TeoyubeLimitedSoftLaunchEnvironmentSafetyReport = {
  valid: boolean;
  checklist: TeoyubeLimitedSoftLaunchChecklistItem[];
  blockerCount: number;
  warningCount: number;
  blockers: TeoyubeLimitedSoftLaunchBlocker[];
  warnings: TeoyubeLimitedSoftLaunchWarning[];
  externalAnalyticsDisabled: boolean;
  productionPersistenceDisabled: boolean;
  liveAiOrchestrationDisabled: boolean;
  rawTextStorageDisabled: boolean;
  hiddenPersonalizationDisabled: boolean;
  debugUiHidden: boolean;
  offlineFallbackEnabled: boolean;
  generatedAt: string;
};

function mergedConfig(config: Partial<TeoyubeRuntimeConfig> = {}): TeoyubeRuntimeConfig {
  const base = getSafeDefaultRuntimeConfig();

  return {
    ...base,
    ...config,
    featureFlags: {
      ...base.featureFlags,
      ...(config.featureFlags || {})
    }
  };
}

function item(id: string, label: string, complete: boolean, details: string, launchCritical = true): TeoyubeLimitedSoftLaunchChecklistItem {
  return {
    id,
    label,
    phase: "pre_launch_review",
    required: true,
    complete,
    launchCritical,
    details,
    nextAction: complete ? undefined : "Restore this safety flag before limited soft launch plan review."
  };
}

export function getLimitedSoftLaunchEnvironmentChecklist(
  config: Partial<TeoyubeRuntimeConfig> = {}
): TeoyubeLimitedSoftLaunchChecklistItem[] {
  const flags = mergedConfig(config).featureFlags;

  return [
    item("scripture_anchoring_required", "Scripture anchoring required", flags.scriptureAnchoringRequired, "Every usable TIG response must remain Scripture anchored."),
    item("explanation_path_required", "Explanation path required", flags.explanationPathRequired, "Explanation paths must remain visible."),
    item("fallback_path_enabled", "Fallback path enabled", flags.fallbackPathEnabled, "Fallback path must remain enabled."),
    item("safety_guardrails_enabled", "Safety guardrails enabled", flags.safetyGuardrailsEnabled, "Safety guardrails must remain enabled."),
    item("consent_controls_enabled", "Consent controls enabled", flags.consentControlsRequired, "Consent controls must remain available."),
    item("personalization_consent_aware", "Personalization remains consent-aware", !flags.hiddenPersonalizationEnabled, "Personalization must remain visible and reversible."),
    item("raw_text_storage_disabled", "Raw text storage disabled", !flags.rawTextStorageEnabled, "Raw sensitive personalization text must not be stored by default."),
    item("hidden_personalization_disabled", "Hidden personalization disabled", !flags.hiddenPersonalizationEnabled, "Hidden personalization must remain disabled."),
    item("external_analytics_disabled", "External analytics disabled", !flags.externalEventSendingEnabled, "External analytics sending remains disabled."),
    item("production_persistence_disabled", "Production persistence disabled", !flags.productionPersistenceEnabled, "Production database persistence remains disabled."),
    item("live_ai_orchestration_disabled", "Live AI orchestration disabled", !flags.liveAiOrchestrationEnabled, "Live AI orchestration remains disabled."),
    item("debug_ui_hidden", "Debug UI hidden from normal users", !flags.debugModeEnabled, "Debug UI must remain hidden from normal users."),
    item("offline_fallback_enabled", "Offline fallback enabled", flags.offlineFallbackEnabled, "Offline fallback remains available and Scripture-safe.")
  ];
}

export function getLimitedSoftLaunchEnvironmentBlockers(
  config: Partial<TeoyubeRuntimeConfig> = {}
): TeoyubeLimitedSoftLaunchBlocker[] {
  return getLimitedSoftLaunchEnvironmentChecklist(config)
    .filter((entry) => entry.required && entry.launchCritical && !entry.complete)
    .map((entry) => ({
      id: `limited_soft_launch_env_${entry.id}`,
      label: entry.label,
      phase: "pre_launch_review",
      reason: entry.details,
      requiredAction: entry.nextAction || "Restore this environment safety check.",
      severity: "critical"
    }));
}

export function getLimitedSoftLaunchEnvironmentWarnings(
  config: Partial<TeoyubeRuntimeConfig> = {}
): TeoyubeLimitedSoftLaunchWarning[] {
  const merged = mergedConfig(config);
  const warnings: TeoyubeLimitedSoftLaunchWarning[] = [
    {
      id: "limited_soft_launch_env_manual_secret_review",
      label: "Manual secret review required",
      phase: "pre_launch_review",
      message: "Environment files must contain placeholders only; real secrets should not be written into this repository.",
      recommendedAction: "Review deployment provider secret storage manually before a later launch step."
    }
  ];

  if (merged.appEnvironment === "production") {
    warnings.push({
      id: "limited_soft_launch_env_production_mode",
      label: "Production mode needs owner review",
      phase: "pre_launch_review",
      message: "Limited soft launch preparation should not imply production provider activation.",
      recommendedAction: "Confirm production services remain disabled before inviting users."
    });
  }

  return warnings;
}

export function validateLimitedSoftLaunchFeatureFlags(config: Partial<TeoyubeRuntimeConfig> = {}) {
  const blockers = getLimitedSoftLaunchEnvironmentBlockers(config);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings: getLimitedSoftLaunchEnvironmentWarnings(config)
  };
}

export function validateLimitedSoftLaunchEnvironmentSafety(config: Partial<TeoyubeRuntimeConfig> = {}) {
  return validateLimitedSoftLaunchFeatureFlags(config);
}

export function createLimitedSoftLaunchEnvironmentSafetyReport(
  config: Partial<TeoyubeRuntimeConfig> = getSafeDefaultRuntimeConfig()
): TeoyubeLimitedSoftLaunchEnvironmentSafetyReport {
  const merged = mergedConfig(config);
  const flags = merged.featureFlags;
  const blockers = getLimitedSoftLaunchEnvironmentBlockers(merged);
  const warnings = getLimitedSoftLaunchEnvironmentWarnings(merged);

  return {
    valid: blockers.length === 0,
    checklist: getLimitedSoftLaunchEnvironmentChecklist(merged),
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    externalAnalyticsDisabled: !flags.externalEventSendingEnabled,
    productionPersistenceDisabled: !flags.productionPersistenceEnabled,
    liveAiOrchestrationDisabled: !flags.liveAiOrchestrationEnabled,
    rawTextStorageDisabled: !flags.rawTextStorageEnabled,
    hiddenPersonalizationDisabled: !flags.hiddenPersonalizationEnabled,
    debugUiHidden: !flags.debugModeEnabled,
    offlineFallbackEnabled: flags.offlineFallbackEnabled,
    generatedAt: new Date().toISOString()
  };
}
