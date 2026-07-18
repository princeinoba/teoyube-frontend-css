import { createDefaultTeoyubeConsentControlState, runPromiseClusterTigProduction } from "../../tig";
import { createOfflineReadonlyResponseFallback } from "../mobile-scale/offline-readonly-strategy";
import { getSafeDefaultRuntimeConfig } from "../mobile-scale/runtime-config-readiness";
import { getProductionCandidateFeatureFlags } from "./launch-feature-flags";
import type {
  TeoyubeFinalSoftLaunchReadinessCheck,
  TeoyubeFinalSoftLaunchReadinessWarning
} from "./final-soft-launch-readiness-contracts";

export type TeoyubeFinalSoftLaunchSafetyCertificationReport = {
  valid: boolean;
  status: "ready" | "blocked";
  checks: TeoyubeFinalSoftLaunchReadinessCheck[];
  warnings: TeoyubeFinalSoftLaunchReadinessWarning[];
  scriptureAnchoringRequired: boolean;
  explanationPathsRequired: boolean;
  fallbackPathEnabled: boolean;
  safetyGuardrailsEnabled: boolean;
  consentControlsEnabled: boolean;
  personalizationConsentAware: boolean;
  rawTextStorageDisabled: boolean;
  hiddenPersonalizationDisabled: boolean;
  externalAnalyticsDisabled: boolean;
  productionPersistenceDisabled: boolean;
  liveAiOrchestrationDisabled: boolean;
  debugUiHidden: boolean;
  offlineFallbackScriptureAnchored: boolean;
  noDivineCertaintyClaims: boolean;
  generatedAt: string;
};

function check(id: string, label: string, complete: boolean, details: string): TeoyubeFinalSoftLaunchReadinessCheck {
  return {
    id,
    label,
    category: "safety",
    required: true,
    complete,
    status: complete ? "ready" : "blocked",
    riskLevel: complete ? "low" : "critical",
    details,
    nextAction: complete ? undefined : "Resolve this final soft launch safety item before limited launch execution."
  };
}

function hasDivineCertaintyClaim(text: string): boolean {
  const normalized = text.toLowerCase();

  return [
    "god guarantees that you are",
    "god told me you are",
    "this proves your calling is",
    "this certainly means god will",
    "god revealed that you must"
  ].some((phrase) => normalized.includes(phrase));
}

export function validateFinalSoftLaunchScriptureAnchoring(): TeoyubeFinalSoftLaunchReadinessCheck {
  const flags = getProductionCandidateFeatureFlags();
  const response = runPromiseClusterTigProduction();

  return check(
    "final_soft_launch_scripture_anchoring",
    "Scripture anchoring is required",
    flags.scriptureAnchoringRequired && Boolean(response.selection.scriptureAnchor),
    "Every usable final soft launch response must remain anchored in Scripture."
  );
}

export function validateFinalSoftLaunchExplanationPaths(): TeoyubeFinalSoftLaunchReadinessCheck {
  const flags = getProductionCandidateFeatureFlags();
  const response = runPromiseClusterTigProduction();

  return check(
    "final_soft_launch_explanation_paths",
    "Explanation paths are required",
    flags.explanationPathRequired && response.explanation.reasonPath.length > 0,
    "Users must be able to understand why Scripture, promise, prayer, reflection, action, or journey was selected."
  );
}

export function validateFinalSoftLaunchFallbackSafety(): TeoyubeFinalSoftLaunchReadinessCheck {
  const flags = getProductionCandidateFeatureFlags();
  const response = runPromiseClusterTigProduction({
    input: "Final soft launch fallback safety request.",
    emotion: "unknown",
    selectedWordId: "missing_word"
  });
  const offline = createOfflineReadonlyResponseFallback("daily_word");

  return check(
    "final_soft_launch_fallback_safety",
    "Fallback path is enabled and Scripture-aware",
    flags.fallbackPathEnabled &&
      Boolean(response.fallback.message.trim()) &&
      Boolean(offline.scriptureReference) &&
      offline.explanationPath.length > 0,
    "Fallback and offline paths remain non-empty, visible, and Scripture-aware."
  );
}

export function validateFinalSoftLaunchConsentSafety(): TeoyubeFinalSoftLaunchReadinessCheck {
  const flags = getProductionCandidateFeatureFlags();
  const consent = createDefaultTeoyubeConsentControlState();

  return check(
    "final_soft_launch_consent_safety",
    "Consent controls are available",
    flags.consentControlsEnabled && consent.settings.length > 0,
    "Consent controls remain visible, reversible, and user-controlled."
  );
}

export function validateFinalSoftLaunchPrivacyBoundaries(): TeoyubeFinalSoftLaunchReadinessCheck {
  const flags = getProductionCandidateFeatureFlags();
  const consent = createDefaultTeoyubeConsentControlState();

  return check(
    "final_soft_launch_privacy_boundaries",
    "Privacy boundaries remain safe",
    !flags.rawTextStorageEnabled &&
      !flags.hiddenPersonalizationEnabled &&
      !consent.rawTextStorageEnabled &&
      !consent.personalizationEnabled,
    "Raw sensitive text storage and hidden personalization remain disabled by default."
  );
}

export function validateFinalSoftLaunchNoExternalAnalytics(): TeoyubeFinalSoftLaunchReadinessCheck {
  const config = getSafeDefaultRuntimeConfig();

  return check(
    "final_soft_launch_no_external_analytics",
    "External analytics are disabled",
    !config.featureFlags.externalEventSendingEnabled,
    "No analytics provider is connected or sending externally."
  );
}

export function validateFinalSoftLaunchNoProductionPersistence(): TeoyubeFinalSoftLaunchReadinessCheck {
  const config = getSafeDefaultRuntimeConfig();

  return check(
    "final_soft_launch_no_production_persistence",
    "Production persistence is disabled",
    !config.featureFlags.productionPersistenceEnabled,
    "No production database persistence is connected."
  );
}

export function validateFinalSoftLaunchNoLiveAiOrchestration(): TeoyubeFinalSoftLaunchReadinessCheck {
  const config = getSafeDefaultRuntimeConfig();

  return check(
    "final_soft_launch_no_live_ai",
    "Live AI orchestration is disabled",
    !config.featureFlags.liveAiOrchestrationEnabled,
    "Live AI orchestration remains disabled for final soft launch readiness."
  );
}

export function validateFinalSoftLaunchDebugSafety(): TeoyubeFinalSoftLaunchReadinessCheck {
  const flags = getProductionCandidateFeatureFlags();
  const config = getSafeDefaultRuntimeConfig();

  return check(
    "final_soft_launch_debug_safety",
    "Debug UI is hidden from normal users",
    !flags.debugOutputVisibleToUsers && !config.featureFlags.debugModeEnabled,
    "Debug output remains hidden from normal users."
  );
}

export function runFinalSoftLaunchSafetyCertification(): TeoyubeFinalSoftLaunchSafetyCertificationReport {
  return createFinalSoftLaunchSafetyCertificationReport();
}

export function createFinalSoftLaunchSafetyCertificationReport(): TeoyubeFinalSoftLaunchSafetyCertificationReport {
  const flags = getProductionCandidateFeatureFlags();
  const config = getSafeDefaultRuntimeConfig();
  const consent = createDefaultTeoyubeConsentControlState();
  const response = runPromiseClusterTigProduction();
  const fallback = runPromiseClusterTigProduction({
    input: "Final soft launch fallback safety request.",
    emotion: "unknown",
    selectedWordId: "missing_word"
  });
  const offline = createOfflineReadonlyResponseFallback("daily_word");
  const responseText = [
    response.explanation.summary,
    fallback.fallback.message,
    ...response.explanation.reasonPath
  ].join(" ");
  const noDivineCertaintyClaims = !hasDivineCertaintyClaim(responseText);
  const checks = [
    validateFinalSoftLaunchScriptureAnchoring(),
    validateFinalSoftLaunchExplanationPaths(),
    validateFinalSoftLaunchFallbackSafety(),
    check("final_soft_launch_guardrails", "Safety guardrails are enabled", flags.safetyGuardrailsEnabled, "Safety guardrails remain enabled."),
    validateFinalSoftLaunchConsentSafety(),
    check("final_soft_launch_personalization_consent_aware", "Personalization remains consent-aware", !flags.hiddenPersonalizationEnabled && !consent.personalizationEnabled, "Personalization remains visible, preview-safe, and consent-aware."),
    validateFinalSoftLaunchPrivacyBoundaries(),
    validateFinalSoftLaunchNoExternalAnalytics(),
    validateFinalSoftLaunchNoProductionPersistence(),
    validateFinalSoftLaunchNoLiveAiOrchestration(),
    validateFinalSoftLaunchDebugSafety(),
    check("final_soft_launch_offline_fallback_scripture", "Offline fallback remains Scripture anchored", Boolean(offline.scriptureReference), "Offline fallback keeps Scripture context."),
    check("final_soft_launch_no_divine_certainty", "No divine certainty claims are introduced", noDivineCertaintyClaims, "Response text avoids user-specific divine certainty claims.")
  ];

  return {
    valid: checks.every((entry) => entry.complete),
    status: checks.every((entry) => entry.complete) ? "ready" : "blocked",
    checks,
    warnings: [
      {
        id: "final_soft_launch_manual_theology_review",
        label: "Manual theology review still required",
        category: "safety",
        severity: "medium",
        message: "Safety certification is structural and should be paired with owner theology/content review before inviting users.",
        recommendedAction: "Complete final owner go/no-go review before limited soft launch execution."
      }
    ],
    scriptureAnchoringRequired: checks[0].complete,
    explanationPathsRequired: checks[1].complete,
    fallbackPathEnabled: checks[2].complete,
    safetyGuardrailsEnabled: checks[3].complete,
    consentControlsEnabled: checks[4].complete,
    personalizationConsentAware: checks[5].complete,
    rawTextStorageDisabled: !flags.rawTextStorageEnabled,
    hiddenPersonalizationDisabled: !flags.hiddenPersonalizationEnabled,
    externalAnalyticsDisabled: !config.featureFlags.externalEventSendingEnabled,
    productionPersistenceDisabled: !config.featureFlags.productionPersistenceEnabled,
    liveAiOrchestrationDisabled: !config.featureFlags.liveAiOrchestrationEnabled,
    debugUiHidden: checks[10].complete,
    offlineFallbackScriptureAnchored: checks[11].complete,
    noDivineCertaintyClaims,
    generatedAt: new Date().toISOString()
  };
}
