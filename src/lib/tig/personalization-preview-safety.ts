import type {
  TeoyubePersonalizationPreviewInput,
  TeoyubePersonalizationPreviewResponse,
  TeoyubePersonalizationPreviewSafetyStatus
} from "./personalization-preview-contracts";
import { validateSignalStoreConsent } from "./personalization-signal-store-safety";
import type { TigProductionResponse } from "./production-response-contracts";

const PREVIEW_GUARDRAILS = [
  "Personalized preview must be consent-aware.",
  "Baseline production response must remain available.",
  "Preference hints are soft hints and must not override Scripture anchoring.",
  "Scripture anchor and explanation path must remain present.",
  "Preview must not claim divine certainty.",
  "Preview must not persist data or call external APIs."
];

function containsRiskyText(value?: string): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return ["god told me", "thus says", "guaranteed", "diagnose", "medical", "legal", "financial"].some(
    (pattern) => normalized.includes(pattern)
  );
}

function hasScriptureAnchor(response?: TigProductionResponse): boolean {
  return Boolean(response?.selection.scriptureAnchor);
}

function hasExplanationPath(response?: TigProductionResponse): boolean {
  return Boolean(response?.explanation.reasonPath.length);
}

function redactProductionInput(response: TigProductionResponse): TigProductionResponse {
  return {
    ...response,
    input: {
      ...response.input,
      input: response.input.input ? "[redacted for preview safety]" : undefined,
      userState: response.input.userState ? "[redacted for preview safety]" : undefined
    }
  };
}

export function validatePersonalizationPreviewConsent(
  input: TeoyubePersonalizationPreviewInput
): ReturnType<typeof validateSignalStoreConsent> {
  return validateSignalStoreConsent(input.consent);
}

export function createSafeDisabledPreview(
  reason: string
): TeoyubePersonalizationPreviewSafetyStatus {
  return {
    safe: false,
    blocked: true,
    status: "disabled",
    reasons: [reason],
    warnings: [],
    guardrails: PREVIEW_GUARDRAILS
  };
}

export function getPersonalizationPreviewSafetyStatus(
  preview: TeoyubePersonalizationPreviewResponse
): TeoyubePersonalizationPreviewSafetyStatus {
  const reasons: string[] = [];
  const warnings = [...preview.warnings];

  if (!preview.baseline) {
    reasons.push("Baseline production response is missing.");
  }

  if (!hasScriptureAnchor(preview.baseline)) {
    reasons.push("Baseline response is missing a Scripture anchor.");
  }

  if (!hasExplanationPath(preview.baseline)) {
    reasons.push("Baseline response is missing an explanation path.");
  }

  if (preview.personalized) {
    if (!hasScriptureAnchor(preview.personalized)) {
      reasons.push("Personalized preview is missing a Scripture anchor.");
    }
    if (!hasExplanationPath(preview.personalized)) {
      reasons.push("Personalized preview is missing an explanation path.");
    }
  }

  if (!preview.consent.personalizationEnabled || !preview.consent.allowedScopes.includes("signals")) {
    warnings.push("Personalized preview is disabled by consent and should use baseline only.");
  }

  if (containsRiskyText(preview.explanation.summary) || preview.explanation.whatChanged.some(containsRiskyText)) {
    reasons.push("Preview explanation contains unsafe or overclaiming language.");
  }

  return {
    safe: reasons.length === 0,
    blocked: reasons.length > 0,
    status: reasons.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "safe",
    reasons,
    warnings,
    guardrails: PREVIEW_GUARDRAILS
  };
}

export function validatePersonalizationPreviewSafety(
  preview: TeoyubePersonalizationPreviewResponse
): TeoyubePersonalizationPreviewSafetyStatus {
  return getPersonalizationPreviewSafetyStatus(preview);
}

export function shouldBlockPersonalizedPreview(
  preview: TeoyubePersonalizationPreviewResponse
): boolean {
  return getPersonalizationPreviewSafetyStatus(preview).blocked;
}

export function sanitizePersonalizationPreview(
  preview: TeoyubePersonalizationPreviewResponse
): TeoyubePersonalizationPreviewResponse {
  const baseline = redactProductionInput(preview.baseline);
  const personalized = preview.personalized
    ? redactProductionInput(preview.personalized)
    : undefined;

  return {
    ...preview,
    baseline,
    personalized,
    event: {
      ...preview.event,
      metadata: {
        ...preview.event.metadata,
        rawInputRedacted: true
      }
    }
  };
}
