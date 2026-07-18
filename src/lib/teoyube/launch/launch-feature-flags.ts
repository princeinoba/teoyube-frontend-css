import type {
  TeoyubeEnvironmentValidationIssue,
  TeoyubeEnvironmentValidationResult,
  TeoyubeLaunchFeatureFlags
} from "./launch-environment-contracts";

function issue(
  id: string,
  message: string,
  severity: TeoyubeEnvironmentValidationIssue["severity"],
  recommendedAction: string
): TeoyubeEnvironmentValidationIssue {
  return {
    id,
    message,
    severity,
    riskLevel: severity === "error" ? "critical" : severity === "warning" ? "medium" : "low",
    recommendedAction
  };
}

export function getDefaultLaunchFeatureFlags(): TeoyubeLaunchFeatureFlags {
  return {
    tigProductionIntelligenceEnabled: true,
    scriptureAnchoringRequired: true,
    explanationPathRequired: true,
    fallbackPathEnabled: true,
    safetyGuardrailsEnabled: true,
    mobileUiEnabled: true,
    personalizationPreviewEnabled: true,
    consentControlsEnabled: true,
    feedbackControlsEnabled: true,
    externalAnalyticsSendingEnabled: false,
    productionDatabasePersistenceEnabled: false,
    liveAiOrchestrationEnabled: false,
    rawTextStorageEnabled: false,
    debugOutputVisibleToUsers: false,
    serviceWorkerEnabled: false,
    nativeMobileModeEnabled: false,
    hiddenPersonalizationEnabled: false
  };
}

export function getSafePreviewFeatureFlags(): TeoyubeLaunchFeatureFlags {
  return getDefaultLaunchFeatureFlags();
}

export function getSoftLaunchFeatureFlags(): TeoyubeLaunchFeatureFlags {
  return {
    ...getDefaultLaunchFeatureFlags(),
    personalizationPreviewEnabled: true
  };
}

export function getProductionCandidateFeatureFlags(): TeoyubeLaunchFeatureFlags {
  return {
    ...getDefaultLaunchFeatureFlags(),
    debugOutputVisibleToUsers: false,
    serviceWorkerEnabled: false,
    nativeMobileModeEnabled: false
  };
}

export function validateLaunchFeatureFlags(
  flags: Partial<TeoyubeLaunchFeatureFlags> = getDefaultLaunchFeatureFlags()
): TeoyubeEnvironmentValidationResult {
  const merged = {
    ...getDefaultLaunchFeatureFlags(),
    ...flags
  };
  const issues = [
    !merged.tigProductionIntelligenceEnabled
      ? issue("tig_production_disabled", "TIG production intelligence should stay enabled for launch preparation.", "error", "Enable TIG production intelligence.")
      : undefined,
    !merged.scriptureAnchoringRequired
      ? issue("scripture_anchoring_disabled", "Scripture anchoring must be required.", "error", "Require Scripture anchoring.")
      : undefined,
    !merged.explanationPathRequired
      ? issue("explanation_path_disabled", "Explanation paths must be required.", "error", "Require explanation paths.")
      : undefined,
    !merged.fallbackPathEnabled
      ? issue("fallback_disabled", "Fallback paths must stay enabled.", "error", "Enable fallback paths.")
      : undefined,
    !merged.safetyGuardrailsEnabled
      ? issue("guardrails_disabled", "Safety guardrails must stay enabled.", "error", "Enable safety guardrails.")
      : undefined,
    !merged.consentControlsEnabled
      ? issue("consent_controls_disabled", "Consent controls must stay enabled.", "error", "Enable consent controls.")
      : undefined,
    merged.externalAnalyticsSendingEnabled
      ? issue("external_analytics_enabled", "External analytics sending is not enabled in this stage.", "error", "Disable external analytics sending.")
      : undefined,
    merged.productionDatabasePersistenceEnabled
      ? issue("production_persistence_enabled", "Production database persistence is not enabled in this stage.", "error", "Disable production database persistence.")
      : undefined,
    merged.liveAiOrchestrationEnabled
      ? issue("live_ai_enabled", "Live AI orchestration is not enabled in this stage.", "error", "Disable live AI orchestration.")
      : undefined,
    merged.rawTextStorageEnabled
      ? issue("raw_text_storage_enabled", "Raw sensitive text storage must remain disabled.", "error", "Disable raw text storage.")
      : undefined,
    merged.debugOutputVisibleToUsers
      ? issue("debug_visible", "Debug output must not be visible to normal users.", "error", "Hide debug output.")
      : undefined,
    merged.serviceWorkerEnabled
      ? issue("service_worker_enabled", "Service workers are not enabled in this step.", "warning", "Keep service workers disabled until a later guarded phase.")
      : undefined,
    merged.nativeMobileModeEnabled
      ? issue("native_mobile_enabled", "Native mobile mode is not enabled in this step.", "warning", "Keep native mobile disabled until a later phase.")
      : undefined,
    merged.hiddenPersonalizationEnabled
      ? issue("hidden_personalization_enabled", "Hidden personalization is not allowed.", "error", "Disable hidden personalization.")
      : undefined
  ].filter((entry): entry is TeoyubeEnvironmentValidationIssue => Boolean(entry));
  const errors = issues.filter((entry) => entry.severity === "error");

  return {
    valid: errors.length === 0,
    safetyLevel: errors.length === 0 ? "safe" : "unsafe",
    issues,
    warnings: issues.filter((entry) => entry.severity === "warning"),
    errors
  };
}

export function createLaunchFeatureFlagReport(
  flags: Partial<TeoyubeLaunchFeatureFlags> = getDefaultLaunchFeatureFlags()
) {
  const merged = {
    ...getDefaultLaunchFeatureFlags(),
    ...flags
  };
  const validation = validateLaunchFeatureFlags(merged);

  return {
    flags: merged,
    valid: validation.valid,
    safetyLevel: validation.safetyLevel,
    issueCount: validation.issues.length,
    issues: validation.issues,
    generatedAt: new Date().toISOString()
  };
}

