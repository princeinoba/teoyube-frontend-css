import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationSafetyStatus,
  TeoyubePersonalizationSignal
} from "./personalization-contracts";
import {
  canUsePersonalizationSignal,
  sanitizePersonalizationSignal,
  validatePersonalizationConsent
} from "./personalization-safety";
import { normalizeTeoyubePersonalizationSignal } from "./personalization-signals";
import type { TeoyubeSignalStoreRecord } from "./personalization-signal-store-contracts";

const SENSITIVE_TEXT_PATTERNS = [
  "diagnose",
  "medical",
  "legal",
  "financial",
  "emergency",
  "password",
  "ssn",
  "social security",
  "credit card",
  "god told me",
  "thus says"
];

function hasSensitiveText(value?: string): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return SENSITIVE_TEXT_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function isScore(value: number | undefined): boolean {
  return typeof value !== "number" || (Number.isFinite(value) && value >= 0 && value <= 1);
}

export function validateSignalStoreConsent(
  consent?: Partial<TeoyubePersonalizationConsent>
): {
  consent: TeoyubePersonalizationConsent;
  allowed: boolean;
  reasons: string[];
  warnings: string[];
} {
  const normalized = validatePersonalizationConsent(consent);
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (!normalized.personalizationEnabled) {
    reasons.push("Personalization consent is not enabled.");
  }

  if (!normalized.allowedScopes.includes("signals")) {
    reasons.push("Signal storage is not included in consent scopes.");
  }

  if (!normalized.learningEnabled) {
    warnings.push("Learning consent is not enabled; store signals as preview-safe context only.");
  }

  if (!normalized.allowRawTextStorage) {
    warnings.push("Raw text storage is disabled and will be redacted.");
  }

  return {
    consent: normalized,
    allowed: reasons.length === 0,
    reasons,
    warnings
  };
}

export function redactSensitiveSignalFields(
  signal: TeoyubePersonalizationSignal
): TeoyubePersonalizationSignal {
  return {
    ...signal,
    storesRawText: false,
    rawTextPreview: undefined,
    metadata: {
      ...signal.metadata,
      rawTextRedacted: true
    }
  };
}

export function sanitizeSignalForStore(
  signal: Partial<TeoyubePersonalizationSignal>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePersonalizationSignal {
  const normalizedConsent = validatePersonalizationConsent(consent);
  const normalized = normalizeTeoyubePersonalizationSignal(signal);
  const canKeepRawText =
    normalizedConsent.allowRawTextStorage &&
    normalizedConsent.allowedScopes.includes("raw_text") &&
    !hasSensitiveText(normalized.rawTextPreview);

  if (!canKeepRawText) {
    return sanitizePersonalizationSignal(redactSensitiveSignalFields(normalized));
  }

  return {
    ...normalizeTeoyubePersonalizationSignal(normalized),
    metadata: {
      ...normalized.metadata,
      sanitized: true,
      rawTextAllowedByConsent: true
    }
  };
}

export function canStoreTeoyubeSignal(
  signal: Partial<TeoyubePersonalizationSignal>,
  consent?: Partial<TeoyubePersonalizationConsent>
): boolean {
  const consentStatus = validateSignalStoreConsent(consent);
  if (!consentStatus.allowed) return false;

  const sanitized = sanitizeSignalForStore(signal, consentStatus.consent);
  return canUsePersonalizationSignal(sanitized, consentStatus.consent);
}

export function shouldBlockSignalStorage(
  signal: Partial<TeoyubePersonalizationSignal>,
  consent?: Partial<TeoyubePersonalizationConsent>
): boolean {
  return !canStoreTeoyubeSignal(signal, consent);
}

export function validateSignalStoreRecord(record: TeoyubeSignalStoreRecord): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!record.id) errors.push("Record is missing id.");
  if (!record.signal?.id) errors.push("Record signal is missing id.");
  if (!record.createdAt) errors.push("Record is missing createdAt.");
  if (!record.updatedAt) errors.push("Record is missing updatedAt.");
  if (!isScore(record.signal.confidenceScore)) {
    errors.push("Signal confidenceScore must be between 0 and 1 when present.");
  }
  if (record.signal.storesRawText || record.signal.rawTextPreview) {
    warnings.push("Record still contains raw text fields.");
  }
  if (!record.signal.selectedScriptureReference) {
    warnings.push("Signal does not include a selected Scripture reference.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function getSignalStoreSafetyStatus(
  signal: Partial<TeoyubePersonalizationSignal>,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubePersonalizationSafetyStatus {
  const consentStatus = validateSignalStoreConsent(consent);
  const sanitized = sanitizeSignalForStore(signal, consentStatus.consent);
  const reasons = [...consentStatus.reasons];
  const warnings = [...consentStatus.warnings];

  if (sanitized.storesRawText || sanitized.rawTextPreview) {
    warnings.push("Signal contains raw text after sanitization.");
  }

  if (hasSensitiveText(signal.rawTextPreview)) {
    reasons.push("Signal raw text contains sensitive or unsafe language.");
  }

  return {
    safe: reasons.length === 0,
    disabled: reasons.length > 0,
    status: reasons.length > 0 ? "disabled" : warnings.length > 0 ? "warning" : "safe",
    reasons,
    warnings,
    guardrails: [
      "Signal storage must be consent-aware.",
      "Raw private text is redacted by default.",
      "Structured Scripture anchors and selected graph IDs may be stored.",
      "Signal storage must remain user-controllable and explainable."
    ]
  };
}
