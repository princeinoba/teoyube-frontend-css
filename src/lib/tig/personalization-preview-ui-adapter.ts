import type {
  TeoyubePersonalizationPreviewResponse
} from "./personalization-preview-contracts";

function percent(value: number | undefined): string {
  return value === undefined ? "Not run" : `${Math.round(value * 100)}%`;
}

export function toPersonalizationPreviewPanelProps(
  preview: TeoyubePersonalizationPreviewResponse
) {
  return {
    id: preview.id,
    status: preview.status,
    mode: preview.mode,
    baseline: preview.baseline,
    personalized: preview.personalized,
    preferenceHintsUsed: preview.preferenceHintsUsed,
    scriptureAnchor: preview.explanation.scriptureAnchor,
    summary: preview.explanation.summary,
    safetyStatus: preview.safety.status,
    consentEnabled: preview.consent.personalizationEnabled,
    fallbackAvoided: preview.fallbackStatus.fallbackAvoided,
    warnings: preview.warnings
  };
}

export function toPersonalizationComparisonPanelProps(
  preview: TeoyubePersonalizationPreviewResponse
) {
  return {
    changed: preview.comparison.changed,
    items: preview.comparison.items,
    confidenceDelta: preview.comparison.confidenceDelta,
    confidenceImproved: preview.comparison.confidenceImproved,
    fallbackAvoided: preview.comparison.fallbackAvoided,
    scriptureAnchorPreserved: preview.comparison.scriptureAnchorPreserved,
    explanationPathPreserved: preview.comparison.explanationPathPreserved,
    summary: preview.comparison.summary
  };
}

export function toPersonalizationPreviewExplanationProps(
  preview: TeoyubePersonalizationPreviewResponse
) {
  return {
    summary: preview.explanation.summary,
    whatChanged: preview.explanation.whatChanged,
    whyChanged: preview.explanation.whyChanged,
    scriptureAnchor: preview.explanation.scriptureAnchor,
    confidenceSummary: preview.explanation.confidenceSummary,
    fallbackSummary: preview.explanation.fallbackSummary,
    warnings: preview.explanation.warnings
  };
}

export function toPersonalizationPreviewDebugProps(
  preview: TeoyubePersonalizationPreviewResponse
) {
  return {
    previewId: preview.id,
    status: preview.status,
    mode: preview.mode,
    decision: preview.personalizationDecision,
    safety: preview.safety,
    event: preview.event,
    confidenceComparison: preview.confidenceComparison,
    fallbackStatus: preview.fallbackStatus,
    generatedAt: preview.generatedAt
  };
}

export function toPersonalizationConsentPreviewProps(
  preview: TeoyubePersonalizationPreviewResponse
) {
  return {
    personalizationEnabled: preview.consent.personalizationEnabled,
    learningEnabled: preview.consent.learningEnabled,
    rawTextStorageAllowed: preview.consent.allowRawTextStorage,
    allowedScopes: preview.consent.allowedScopes,
    status: preview.safety.status,
    message: preview.consent.personalizationEnabled
      ? "Personalized preview can use consented structured hints."
      : "Personalized preview is disabled and baseline-only.",
    confidence: {
      baseline: percent(preview.confidenceComparison.baselineScore),
      personalized: percent(preview.confidenceComparison.personalizedScore),
      delta: preview.confidenceComparison.delta
    }
  };
}
