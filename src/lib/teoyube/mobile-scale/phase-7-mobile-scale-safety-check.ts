import {
  createDefaultTeoyubeConsentControlState,
  runPromiseClusterTigProduction
} from "../../tig";
import { createAnalyticsProviderReadinessReport } from "./analytics-provider-readiness";
import { createCacheBoundaryReport } from "./mobile-cache-boundaries";
import {
  getPhase72MobileUiOptimizationReadiness,
  toMobileExplanationPathLayout,
  toMobileTigResponseLayout
} from "./mobile-ui-adapters";
import { createOfflineReadonlyResponseFallback } from "./offline-readonly-strategy";
import { createPersistenceAdapterReadinessReport } from "./persistence-adapter-readiness";
import { createLoggingBoundaryReport } from "./production-logging-boundaries";
import { createEnvironmentSafetyReport } from "./environment-safety";
import {
  getSafeDefaultRuntimeConfig,
  validateTeoyubeRuntimeConfig
} from "./runtime-config-readiness";

export type Phase7SafetyCheckResult = {
  id: string;
  label: string;
  valid: boolean;
  details: string;
  errors: string[];
};

export type Phase7MobileScaleSafetyCheckReport = {
  phase: "Phase 7.5 - Final Mobile & Scale Completion Audit";
  valid: boolean;
  completionPercentage: number;
  results: Phase7SafetyCheckResult[];
  errors: string[];
  warnings: string[];
};

function result(
  id: string,
  label: string,
  valid: boolean,
  details: string,
  errors: string[] = []
): Phase7SafetyCheckResult {
  return {
    id,
    label,
    valid,
    details,
    errors: errors.filter(Boolean)
  };
}

function hasDivineCertaintyClaim(text: string): boolean {
  const normalized = text.toLowerCase();
  return [
    "god guarantees that you are",
    "god told me you are",
    "this proves your calling is",
    "this certainly means god will"
  ].some((phrase) => normalized.includes(phrase));
}

export function validateMobileScriptureAnchoring(): Phase7SafetyCheckResult {
  const response = runPromiseClusterTigProduction();
  const layout = toMobileTigResponseLayout(response, "mobile_compact");
  const valid = Boolean(response.selection.scriptureAnchor && layout.scriptureAnchorVisible);

  return result(
    "mobile_scripture_anchoring",
    "Scripture anchors remain visible or available on mobile",
    valid,
    "Mobile TIG response layout keeps Scripture anchoring visible.",
    valid ? [] : ["Mobile Scripture anchor is missing or hidden."]
  );
}

export function validateMobileExplanationPathReadiness(): Phase7SafetyCheckResult {
  const response = runPromiseClusterTigProduction();
  const layout = toMobileExplanationPathLayout(response.explanation, "mobile_compact");
  const valid = layout.stepCount > 0 && Boolean(layout.summary);

  return result(
    "mobile_explanation_path",
    "Explanation paths remain available",
    valid,
    "Mobile explanation path exposes ordered graph decision steps.",
    valid ? [] : ["Explanation path is missing from mobile layout."]
  );
}

export function validateMobileFallbackSafety(): Phase7SafetyCheckResult {
  const response = runPromiseClusterTigProduction({
    input: "Unclear request.",
    emotion: "unknown",
    selectedWordId: "missing_word"
  });
  const text = [
    response.explanation.summary,
    ...response.explanation.reasonPath,
    response.fallback.message
  ].join(" ");
  const valid =
    response.fallback.reasons.length > 0 &&
    response.confidence.score <= 1 &&
    !hasDivineCertaintyClaim(text);

  return result(
    "mobile_fallback_safety",
    "Fallback states are clear and safe",
    valid,
    "Fallback responses retain reasons, bounded confidence, and no divine certainty claims.",
    valid ? [] : ["Fallback state is unclear, overconfident, or uses certainty language."]
  );
}

export function validateMobileConsentControlReadiness(): Phase7SafetyCheckResult {
  const readiness = getPhase72MobileUiOptimizationReadiness();
  const consent = createDefaultTeoyubeConsentControlState();
  const valid =
    readiness.complete &&
    consent.settings.length > 0 &&
    consent.rawTextStorageEnabled === false;

  return result(
    "mobile_consent_controls",
    "Consent and feedback controls remain user-accessible",
    valid,
    "Consent controls remain visible, reversible, and raw text storage stays disabled.",
    valid ? [] : ["Consent controls are missing or raw text storage is enabled."]
  );
}

export function validateMobilePrivacyBoundaries(): Phase7SafetyCheckResult {
  const config = getSafeDefaultRuntimeConfig();
  const logging = createLoggingBoundaryReport(
    {
      eventName: "tig.production.response.created",
      rawInput: "private raw text",
      selectedScriptureReference: "Romans 8:28"
    },
    config
  );
  const valid =
    logging.redactedFields.includes("rawInput") &&
    !config.featureFlags.rawTextStorageEnabled &&
    !config.featureFlags.hiddenPersonalizationEnabled;

  return result(
    "mobile_privacy_boundaries",
    "Raw private text is not cached or logged by default",
    valid,
    "Logging boundaries redact raw text and hidden personalization remains disabled.",
    valid ? [] : ["Privacy boundaries did not redact raw text or hidden personalization is enabled."]
  );
}

export function validateOfflineFallbackSafety(): Phase7SafetyCheckResult {
  const fallback = createOfflineReadonlyResponseFallback("daily_word");
  const valid =
    Boolean(fallback.scriptureReference) &&
    fallback.explanationPath.length > 0 &&
    fallback.status === "offline_safe";

  return result(
    "offline_fallback_safety",
    "Offline fallbacks remain Scripture-anchored",
    valid,
    "Offline fallback includes Scripture, explanation path, prayer, and action step.",
    valid ? [] : ["Offline fallback is missing Scripture or explanation path."]
  );
}

export function validateCacheSafetyBoundaries(): Phase7SafetyCheckResult {
  const report = createCacheBoundaryReport({
    rawText: "private text should not be cached",
    scriptureReference: "Isaiah 40:31"
  });
  const valid = !report.cacheable && report.warnings.length > 0;

  return result(
    "cache_safety_boundaries",
    "Cache boundaries block raw private text",
    valid,
    "Cache boundary report marks raw text payloads as unsafe for caching.",
    valid ? [] : ["Raw private text payload was considered cacheable."]
  );
}

export function validateScaleDeploymentSafety(): Phase7SafetyCheckResult {
  const config = getSafeDefaultRuntimeConfig();
  const runtime = validateTeoyubeRuntimeConfig(config);
  const environment = createEnvironmentSafetyReport(config);
  const analytics = createAnalyticsProviderReadinessReport();
  const persistence = createPersistenceAdapterReadinessReport();
  const valid =
    runtime.valid &&
    environment.complete &&
    analytics.complete &&
    persistence.complete &&
    !config.featureFlags.externalEventSendingEnabled &&
    !config.featureFlags.productionPersistenceEnabled &&
    !config.featureFlags.liveAiOrchestrationEnabled &&
    !config.featureFlags.debugModeEnabled;

  return result(
    "scale_deployment_safety",
    "Scale and deployment defaults remain safe",
    valid,
    "Analytics sending, persistence, live AI orchestration, and production debug output remain disabled by default.",
    valid ? [] : ["One or more scale/deployment safety defaults is unsafe."]
  );
}

export function runPhase7MobileScaleSafetyCheck(): Phase7MobileScaleSafetyCheckReport {
  const results = [
    validateMobileScriptureAnchoring(),
    validateMobileExplanationPathReadiness(),
    validateMobileFallbackSafety(),
    validateMobileConsentControlReadiness(),
    validateMobilePrivacyBoundaries(),
    validateOfflineFallbackSafety(),
    validateCacheSafetyBoundaries(),
    validateScaleDeploymentSafety()
  ];
  const errors = results.flatMap((entry) =>
    entry.errors.map((error) => `${entry.label}: ${error}`)
  );
  const validCount = results.filter((entry) => entry.valid).length;

  return {
    phase: "Phase 7.5 - Final Mobile & Scale Completion Audit",
    valid: errors.length === 0,
    completionPercentage: Math.round((validCount / Math.max(1, results.length)) * 100),
    results,
    errors,
    warnings: [
      "Phase 7 safety remains readiness-only; it does not connect providers, databases, service workers, live AI, or analytics sending."
    ]
  };
}

