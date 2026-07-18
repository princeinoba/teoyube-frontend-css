import type { TigProductionEvent } from "../../tig";
import type { TeoyubeLoggingBoundary } from "./scale-readiness-contracts";
import {
  getSafeDefaultRuntimeConfig,
  type TeoyubeRuntimeConfig
} from "./runtime-config-readiness";

const SENSITIVE_FIELD_PATTERNS = [
  "input",
  "raw",
  "text",
  "journal",
  "prayertext",
  "personalnote",
  "secret",
  "token",
  "password",
  "email",
  "debug",
  "stack",
  "private"
];

const SAFE_EVENT_FIELDS = new Set([
  "eventName",
  "timestamp",
  "surface",
  "intent",
  "sessionId",
  "selectedWordId",
  "selectedPromiseClusterId",
  "selectedScriptureReference",
  "selectedPrayerSequenceId",
  "selectedActionStepId",
  "confidenceScore",
  "confidenceLabel",
  "fallbackUsed",
  "fallbackReason",
  "fallbackReasons",
  "safetyStatus",
  "blocked",
  "explanationPathLength",
  "graphNodeCount",
  "graphEdgeCount"
]);

export type TeoyubeLoggingBoundaryReport = {
  allowed: boolean;
  sanitizedPayload: Record<string, unknown>;
  redactedFields: string[];
  warnings: string[];
  boundaries: TeoyubeLoggingBoundary[];
};

export function getProductionLoggingBoundaries(): TeoyubeLoggingBoundary[] {
  return [
    {
      id: "no_raw_private_text",
      label: "No raw private user text",
      allowedFields: ["scriptureReferences", "publicNodeIds", "confidenceLabel", "fallbackStatus"],
      redactedFields: ["input", "rawText", "journalEntry", "prayerText"],
      blockedFields: ["password", "token", "secret"],
      requiresConsent: false,
      productionDefault: "block",
      reason: "Production logs should summarize graph decisions without storing raw private text."
    },
    {
      id: "no_hidden_personalization",
      label: "No hidden personalization payloads",
      allowedFields: ["consentStatus", "preferenceHintCount"],
      redactedFields: ["personalizationSignal", "personalNote"],
      blockedFields: ["hiddenProfile", "rawPreferenceText"],
      requiresConsent: true,
      productionDefault: "block",
      reason: "Personalization logging must be consent-aware, visible, and reversible."
    },
    {
      id: "safe_response_summary",
      label: "Safe production response summary",
      allowedFields: [
        "scriptureReference",
        "selectedNodeIds",
        "confidenceLabel",
        "fallbackUsed",
        "safetyStatus"
      ],
      redactedFields: ["aiMessage", "prayer", "reflectionPrompt"],
      blockedFields: ["debugPayload", "stackTrace"],
      requiresConsent: false,
      productionDefault: "allow_sanitized",
      reason: "Scripture refs, public ids, confidence labels, fallback, and safety status are safe to summarize."
    }
  ];
}

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[_\-\s]/g, "");
  return SENSITIVE_FIELD_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function sanitizeValue(value: unknown, path: string[], redacted: Set<string>): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) => sanitizeValue(item, [...path, String(index)], redacted));
  }

  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const fieldPath = [...path, key].join(".");
      if (isSensitiveKey(key)) {
        redacted.add(fieldPath);
        next[key] = "[redacted]";
      } else {
        next[key] = sanitizeValue(child, [...path, key], redacted);
      }
    }
    return next;
  }

  return value;
}

export function redactSensitiveLoggingFields(payload: Record<string, unknown>): {
  payload: Record<string, unknown>;
  redactedFields: string[];
} {
  const redacted = new Set<string>();
  const sanitized = sanitizeValue(payload, [], redacted) as Record<string, unknown>;

  return {
    payload: sanitized,
    redactedFields: Array.from(redacted)
  };
}

export function sanitizeProductionLogPayload(
  payload: Record<string, unknown>
): Record<string, unknown> {
  return redactSensitiveLoggingFields(payload).payload;
}

export function canLogProductionEvent(
  event: Partial<TigProductionEvent> | Record<string, unknown>,
  config: Partial<TeoyubeRuntimeConfig> = getSafeDefaultRuntimeConfig()
): boolean {
  const defaults = getSafeDefaultRuntimeConfig();
  const merged = {
    ...defaults,
    ...config,
    featureFlags: {
      ...defaults.featureFlags,
      ...(config.featureFlags || {})
    }
  };

  if (merged.deploymentTarget === "production" && merged.featureFlags.debugModeEnabled) {
    return false;
  }

  if (merged.featureFlags.rawTextStorageEnabled || merged.featureFlags.hiddenPersonalizationEnabled) {
    return false;
  }

  const keys = Object.keys(event);
  return keys.every((key) => SAFE_EVENT_FIELDS.has(key) || key === "metadata");
}

export function createLoggingBoundaryReport(
  payload: Record<string, unknown>,
  config: Partial<TeoyubeRuntimeConfig> = getSafeDefaultRuntimeConfig()
): TeoyubeLoggingBoundaryReport {
  const { payload: sanitizedPayload, redactedFields } =
    redactSensitiveLoggingFields(payload);
  const allowed = canLogProductionEvent(sanitizedPayload, config);

  return {
    allowed,
    sanitizedPayload,
    redactedFields,
    warnings: [
      "Phase 7.4 does not connect an external logging provider.",
      redactedFields.length
        ? "Sensitive logging fields were redacted before the payload could be logged."
        : "Payload is already minimal and structured."
    ],
    boundaries: getProductionLoggingBoundaries()
  };
}

