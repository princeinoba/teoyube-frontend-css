import {
  createDefaultTeoyubeConsentControlState,
  runPromiseClusterTigProduction
} from "../../tig";
import { createAnalyticsProviderReadinessReport } from "../mobile-scale/analytics-provider-readiness";
import { createOfflineReadonlyResponseFallback } from "../mobile-scale/offline-readonly-strategy";
import { createPersistenceAdapterReadinessReport } from "../mobile-scale/persistence-adapter-readiness";
import { createLoggingBoundaryReport } from "../mobile-scale/production-logging-boundaries";
import {
  getSafeDefaultRuntimeConfig,
  validateTeoyubeRuntimeConfig
} from "../mobile-scale/runtime-config-readiness";
import type {
  TeoyubeLaunchQualityGate,
  TeoyubeLaunchSafetyStatus,
  TeoyubeLaunchWarning
} from "./production-launch-contracts";

export type TeoyubeLaunchSafetyReviewReport = {
  valid: boolean;
  completionPercentage: number;
  checks: TeoyubeLaunchQualityGate[];
  safetyStatus: TeoyubeLaunchSafetyStatus;
  errors: string[];
  warnings: TeoyubeLaunchWarning[];
  generatedAt: string;
};

function gate(
  id: string,
  label: string,
  passed: boolean,
  details: string,
  nextAction?: string
): TeoyubeLaunchQualityGate {
  return {
    id,
    label,
    status: passed ? "ready" : "blocked",
    required: true,
    passed,
    riskLevel: passed ? "low" : "critical",
    details,
    nextAction
  };
}

function warning(id: string, message: string, recommendedAction: string): TeoyubeLaunchWarning {
  return {
    id,
    label: id.replace(/_/g, " "),
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

export function validateLaunchScriptureAnchoring(): TeoyubeLaunchQualityGate {
  const response = runPromiseClusterTigProduction();
  const passed = Boolean(response.selection.scriptureAnchor);

  return gate(
    "launch_scripture_anchoring",
    "Production responses are Scripture anchored",
    passed,
    "The production promise cluster response includes a Scripture anchor.",
    "Ensure every usable production recommendation includes at least one Scripture anchor."
  );
}

export function validateLaunchExplanationPaths(): TeoyubeLaunchQualityGate {
  const response = runPromiseClusterTigProduction();
  const passed =
    response.explanation.reasonPath.length > 0 &&
    response.explanation.selectedNodeIds.length > 0 &&
    response.explanation.scriptureEvidence.length > 0;

  return gate(
    "launch_explanation_paths",
    "Production responses include explanation paths",
    passed,
    "The response exposes selected nodes, Scripture evidence, and ordered explanation reasons.",
    "Keep explanation paths visible in production UI and event-safe contracts."
  );
}

export function validateLaunchFallbackSafety(): TeoyubeLaunchQualityGate {
  const response = runPromiseClusterTigProduction({
    input: "Unclear launch safety request.",
    emotion: "unknown",
    selectedWordId: "missing_word"
  });
  const fallbackText = [
    response.explanation.summary,
    response.fallback.message,
    ...response.explanation.reasonPath
  ].join(" ");
  const offlineFallback = createOfflineReadonlyResponseFallback("daily_word");
  const passed =
    response.fallback.message.trim().length > 0 &&
    response.fallback.reasons.length > 0 &&
    response.confidence.score >= 0 &&
    response.confidence.score <= 1 &&
    Boolean(offlineFallback.scriptureReference) &&
    offlineFallback.explanationPath.length > 0 &&
    !hasDivineCertaintyClaim(fallbackText);

  return gate(
    "launch_fallback_safety",
    "Fallbacks are safe, non-empty, and Scripture grounded",
    passed,
    "Weak or unclear graph matches use bounded confidence and safe Scripture-aware fallback text.",
    "Repair fallback copy if it is empty, overconfident, or missing Scripture context."
  );
}

export function validateLaunchPersonalizationConsentSafety(): TeoyubeLaunchQualityGate {
  const consent = createDefaultTeoyubeConsentControlState();
  const config = getSafeDefaultRuntimeConfig();
  const passed =
    consent.rawTextStorageEnabled === false &&
    config.featureFlags.hiddenPersonalizationEnabled === false &&
    consent.personalizationEnabled === false &&
    consent.settings.length > 0;

  return gate(
    "launch_personalization_consent_safety",
    "Personalization is consent-aware and visible",
    passed,
    "Consent controls remain available and hidden personalization/raw text storage stay disabled.",
    "Keep personalization visible, reversible, and consent gated."
  );
}

export function validateLaunchPrivacySafety(): TeoyubeLaunchQualityGate {
  const config = getSafeDefaultRuntimeConfig();
  const logging = createLoggingBoundaryReport(
    {
      rawInput: "private launch review text",
      journalEntry: "private reflection",
      selectedScriptureReference: "Romans 8:28"
    },
    config
  );
  const passed =
    logging.redactedFields.includes("rawInput") &&
    logging.redactedFields.includes("journalEntry") &&
    !config.featureFlags.rawTextStorageEnabled &&
    !config.featureFlags.hiddenPersonalizationEnabled;

  return gate(
    "launch_privacy_safety",
    "Raw sensitive text is not stored or logged by default",
    passed,
    "Logging boundaries redact private text and safe runtime defaults disable raw text storage.",
    "Do not store raw user text unless a future consented persistence adapter is deliberately connected."
  );
}

export function validateLaunchNoExternalSending(): TeoyubeLaunchQualityGate {
  const config = getSafeDefaultRuntimeConfig();
  const runtime = validateTeoyubeRuntimeConfig(config);
  const analytics = createAnalyticsProviderReadinessReport();
  const persistence = createPersistenceAdapterReadinessReport();
  const passed =
    runtime.valid &&
    analytics.complete &&
    persistence.complete &&
    !config.featureFlags.externalEventSendingEnabled &&
    !config.featureFlags.productionPersistenceEnabled &&
    !config.featureFlags.liveAiOrchestrationEnabled;

  return gate(
    "launch_no_external_sending",
    "No external analytics, database writes, or live AI calls are enabled",
    passed,
    "Safe runtime defaults keep external event sending, persistence, and live AI orchestration disabled.",
    "Keep providers disconnected until an explicit future launch step connects them."
  );
}

export function runLaunchSafetyReview(): TeoyubeLaunchSafetyReviewReport {
  return createLaunchSafetyReviewReport();
}

export function createLaunchSafetyReviewReport(): TeoyubeLaunchSafetyReviewReport {
  const checks = [
    validateLaunchScriptureAnchoring(),
    validateLaunchExplanationPaths(),
    validateLaunchFallbackSafety(),
    validateLaunchPersonalizationConsentSafety(),
    validateLaunchPrivacySafety(),
    validateLaunchNoExternalSending()
  ];
  const response = runPromiseClusterTigProduction();
  const certaintyText = [
    response.explanation.summary,
    ...response.explanation.reasonPath,
    response.fallback.message
  ].join(" ");
  const noDivineCertaintyClaims = !hasDivineCertaintyClaim(certaintyText);
  const passedCount = checks.filter((entry) => entry.passed).length;
  const warnings = [
    warning(
      "manual_theology_review_required_before_public_launch",
      "The safety review confirms structure, but final public launch should still include human theology/content review.",
      "Run a manual content QA pass before soft launch."
    ),
    warning(
      "providers_remain_disconnected",
      "Analytics, persistence, and live AI are intentionally not connected in this step.",
      "Connect providers only in later guarded launch steps after privacy and safety review."
    )
  ];
  const errors = checks
    .filter((entry) => entry.required && !entry.passed)
    .map((entry) => `${entry.label}: ${entry.nextAction || entry.details}`);

  return {
    valid: errors.length === 0 && noDivineCertaintyClaims,
    completionPercentage: Math.round((passedCount / Math.max(1, checks.length)) * 100),
    checks,
    safetyStatus: {
      status: errors.length === 0 && noDivineCertaintyClaims ? "ready" : "blocked",
      scriptureAnchoring: checks[0].passed,
      explanationPaths: checks[1].passed,
      fallbackSafety: checks[2].passed,
      consentSafety: checks[3].passed,
      privacySafety: checks[4].passed,
      noExternalSending: checks[5].passed,
      noDivineCertaintyClaims,
      warnings
    },
    errors,
    warnings,
    generatedAt: new Date().toISOString()
  };
}
