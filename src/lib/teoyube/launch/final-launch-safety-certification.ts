import {
  createDefaultTeoyubeConsentControlState,
  runPromiseClusterTigProduction
} from "../../tig";
import { createOfflineReadonlyResponseFallback } from "../mobile-scale/offline-readonly-strategy";
import {
  getSafeDefaultRuntimeConfig,
  validateTeoyubeRuntimeConfig
} from "../mobile-scale/runtime-config-readiness";
import type {
  TeoyubeFinalLaunchPreparationCheck,
  TeoyubeFinalLaunchPreparationWarning,
  TeoyubeFinalLaunchSafetyStatus
} from "./final-launch-preparation-contracts";
import { getProductionCandidateFeatureFlags } from "./launch-feature-flags";

export type TeoyubeFinalLaunchSafetyCertificationReport = {
  status: "ready" | "blocked";
  valid: boolean;
  certification: TeoyubeFinalLaunchSafetyStatus;
  checks: TeoyubeFinalLaunchPreparationCheck[];
  warnings: TeoyubeFinalLaunchPreparationWarning[];
  generatedAt: string;
};

function check(id: string, label: string, complete: boolean, details: string): TeoyubeFinalLaunchPreparationCheck {
  return {
    id,
    label,
    stage: "final_safety",
    required: true,
    complete,
    status: complete ? "ready" : "blocked",
    riskLevel: complete ? "low" : "critical",
    details,
    nextAction: complete ? undefined : "Resolve this final launch safety item before manual preview deployment."
  };
}

function warning(id: string, message: string, recommendedAction: string): TeoyubeFinalLaunchPreparationWarning {
  return {
    id,
    label: id.replace(/_/g, " "),
    category: "final_safety",
    riskLevel: "medium",
    message,
    recommendedAction
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

export function validateFinalScriptureAnchoring(): TeoyubeFinalLaunchPreparationCheck {
  const flags = getProductionCandidateFeatureFlags();
  const response = runPromiseClusterTigProduction();

  return check(
    "final_scripture_anchoring",
    "Scripture anchoring is required and present",
    flags.scriptureAnchoringRequired && Boolean(response.selection.scriptureAnchor),
    "Every usable final launch response must remain anchored in Scripture."
  );
}

export function validateFinalExplanationPathRequirement(): TeoyubeFinalLaunchPreparationCheck {
  const flags = getProductionCandidateFeatureFlags();
  const response = runPromiseClusterTigProduction();

  return check(
    "final_explanation_path",
    "Explanation paths are required and present",
    flags.explanationPathRequired && response.explanation.reasonPath.length > 0,
    "Users must be able to see why Scripture, promise, prayer, reflection, action, or journey was selected."
  );
}

export function validateFinalFallbackSafety(): TeoyubeFinalLaunchPreparationCheck {
  const flags = getProductionCandidateFeatureFlags();
  const response = runPromiseClusterTigProduction({
    input: "Final launch fallback safety request.",
    emotion: "unknown",
    selectedWordId: "missing_word"
  });
  const offline = createOfflineReadonlyResponseFallback("daily_word");

  return check(
    "final_fallback_safety",
    "Fallback paths are enabled and non-empty",
    flags.fallbackPathEnabled &&
      Boolean(response.fallback.message.trim()) &&
      Boolean(offline.scriptureReference) &&
      offline.explanationPath.length > 0,
    "Fallback and offline paths remain Scripture-aware, visible, and non-empty."
  );
}

export function validateFinalConfidenceSafety(): TeoyubeFinalLaunchPreparationCheck {
  const response = runPromiseClusterTigProduction();

  return check(
    "final_confidence_safety",
    "Confidence is bounded and not overstated",
    response.confidence.score >= 0 && response.confidence.score <= 1,
    "Confidence labels must remain bounded and avoid divine certainty language."
  );
}

export function validateFinalConsentSafety(): TeoyubeFinalLaunchPreparationCheck {
  const flags = getProductionCandidateFeatureFlags();
  const consent = createDefaultTeoyubeConsentControlState();

  return check(
    "final_consent_safety",
    "Consent controls are available",
    flags.consentControlsEnabled && consent.settings.length > 0,
    "Consent controls remain visible, reversible, and user-controlled."
  );
}

export function validateFinalPersonalizationSafety(): TeoyubeFinalLaunchPreparationCheck {
  const flags = getProductionCandidateFeatureFlags();
  const consent = createDefaultTeoyubeConsentControlState();

  return check(
    "final_personalization_safety",
    "Personalization remains preview-safe and consent-aware",
    flags.personalizationPreviewEnabled &&
      !flags.hiddenPersonalizationEnabled &&
      !consent.personalizationEnabled &&
      !consent.rawTextStorageEnabled,
    "Personalization remains preview-only, visible, and disabled unless user consent allows it later."
  );
}

export function validateFinalPrivacyBoundaries(): TeoyubeFinalLaunchPreparationCheck {
  const flags = getProductionCandidateFeatureFlags();

  return check(
    "final_privacy_boundaries",
    "Raw sensitive text is not stored by default",
    !flags.rawTextStorageEnabled && !flags.hiddenPersonalizationEnabled,
    "Raw private text storage and hidden personalization stay disabled."
  );
}

export function validateFinalNoExternalSending(): TeoyubeFinalLaunchPreparationCheck {
  const config = getSafeDefaultRuntimeConfig();
  const runtime = validateTeoyubeRuntimeConfig(config);

  return check(
    "final_no_external_sending",
    "External analytics sending is disabled",
    runtime.valid && !config.featureFlags.externalEventSendingEnabled,
    "No analytics provider is connected or sending externally."
  );
}

export function validateFinalNoPersistence(): TeoyubeFinalLaunchPreparationCheck {
  const config = getSafeDefaultRuntimeConfig();

  return check(
    "final_no_persistence",
    "Production persistence is disabled",
    !config.featureFlags.productionPersistenceEnabled,
    "No production database persistence is connected."
  );
}

export function validateFinalNoLiveAiOrchestration(): TeoyubeFinalLaunchPreparationCheck {
  const config = getSafeDefaultRuntimeConfig();

  return check(
    "final_no_live_ai",
    "Live AI orchestration is disabled",
    !config.featureFlags.liveAiOrchestrationEnabled,
    "Live AI orchestration is not enabled for manual preview deployment readiness."
  );
}

export function createFinalLaunchSafetyCertificationReport(): TeoyubeFinalLaunchSafetyCertificationReport {
  const flags = getProductionCandidateFeatureFlags();
  const config = getSafeDefaultRuntimeConfig();
  const response = runPromiseClusterTigProduction();
  const fallbackResponse = runPromiseClusterTigProduction({
    input: "Final launch fallback safety request.",
    emotion: "unknown",
    selectedWordId: "missing_word"
  });
  const offline = createOfflineReadonlyResponseFallback("daily_word");
  const responseText = [
    response.explanation.summary,
    fallbackResponse.fallback.message,
    ...response.explanation.reasonPath
  ].join(" ");
  const checks = [
    validateFinalScriptureAnchoring(),
    validateFinalExplanationPathRequirement(),
    validateFinalFallbackSafety(),
    validateFinalConfidenceSafety(),
    validateFinalConsentSafety(),
    validateFinalPersonalizationSafety(),
    validateFinalPrivacyBoundaries(),
    validateFinalNoExternalSending(),
    validateFinalNoPersistence(),
    validateFinalNoLiveAiOrchestration(),
    check("final_debug_hidden", "Debug UI is hidden from normal users", !flags.debugOutputVisibleToUsers && !config.featureFlags.debugModeEnabled, "Debug output remains disabled."),
    check("final_no_divine_certainty", "No divine certainty claims are introduced", !hasDivineCertaintyClaim(responseText), "Final launch response text avoids user-specific divine certainty claims."),
    check("final_guardrails_enabled", "Safety guardrails are enabled", flags.safetyGuardrailsEnabled, "Safety guardrails remain enabled."),
    check("final_offline_fallback_scripture", "Offline fallback remains Scripture anchored", Boolean(offline.scriptureReference), "Offline fallback keeps Scripture context.")
  ];
  const certification: TeoyubeFinalLaunchSafetyStatus = {
    status: checks.every((item) => item.complete) ? "ready" : "blocked",
    scriptureAnchoringRequired: checks[0].complete,
    explanationPathRequired: checks[1].complete,
    fallbackPathEnabled: checks[2].complete,
    fallbackResponsesNonEmpty: checks[2].complete,
    confidenceNotOverstated: checks[3].complete,
    noDivineCertaintyClaims: checks[11].complete,
    safetyGuardrailsEnabled: checks[12].complete,
    consentControlsAvailable: checks[4].complete,
    personalizationPreviewSafe: checks[5].complete,
    rawSensitiveTextNotStored: checks[6].complete,
    hiddenPersonalizationDisabled: checks[6].complete,
    externalAnalyticsDisabled: checks[7].complete,
    productionPersistenceDisabled: checks[8].complete,
    liveAiOrchestrationDisabled: checks[9].complete,
    debugUiHidden: checks[10].complete,
    offlineFallbackScriptureAnchored: checks[13].complete
  };

  return {
    status: certification.status === "ready" ? "ready" : "blocked",
    valid: certification.status === "ready",
    certification,
    checks,
    warnings: [
      warning(
        "manual_content_review_still_required",
        "Final safety certification is structural and should be paired with owner theology/content review before real users are invited.",
        "Complete owner review before any soft launch."
      )
    ],
    generatedAt: new Date().toISOString()
  };
}

export function runFinalLaunchSafetyCertification(): TeoyubeFinalLaunchSafetyCertificationReport {
  return createFinalLaunchSafetyCertificationReport();
}
