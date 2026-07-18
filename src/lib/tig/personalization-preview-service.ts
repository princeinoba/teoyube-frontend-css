import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationContext,
  TeoyubePersonalizationProfile
} from "./personalization-contracts";
import {
  sanitizePersonalizationFeedback,
  shouldDisablePersonalizationFromFeedback,
  shouldReducePreferenceFromFeedback
} from "./personalization-feedback-engine";
import {
  createPersonalizationContext,
  getPersonalizedTigRecommendationHints
} from "./personalization-engine";
import { createPersonalizationContextFromSignalStore } from "./personalization-context-from-store";
import {
  createPersonalizationPreviewComparison
} from "./personalization-preview-comparison";
import {
  createPersonalizationPreviewDisabledEvent,
  createPersonalizationPreviewEvent
} from "./personalization-preview-events";
import {
  getPersonalizationPreviewSafetyStatus,
  sanitizePersonalizationPreview,
  validatePersonalizationPreviewConsent
} from "./personalization-preview-safety";
import type {
  TeoyubePersonalizationPreviewComparison,
  TeoyubePersonalizationPreviewDecision,
  TeoyubePersonalizationPreviewExplanation,
  TeoyubePersonalizationPreviewInput,
  TeoyubePersonalizationPreviewMode,
  TeoyubePersonalizationPreviewResponse
} from "./personalization-preview-contracts";
import { runPersonalizedTeoyubeProductionPreview } from "./personalized-production-bridge";
import { runTeoyubeProductionIntelligence } from "./production-intelligence-service";
import type {
  TigProductionInput,
  TigProductionResponse
} from "./production-response-contracts";

function createPreviewId(): string {
  return `personalization_preview_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))];
}

function normalizePreviewInput(
  input: TeoyubePersonalizationPreviewInput | TigProductionInput
): TeoyubePersonalizationPreviewInput {
  if ("productionInput" in input) {
    return {
      ...input,
      mode: input.mode || "comparison"
    };
  }

  return {
    productionInput: input,
    mode: "comparison"
  };
}

function getScriptureReference(response: TigProductionResponse): string {
  const scripture = response.selection.scriptureAnchor;
  if (!scripture) return "Scripture anchor unavailable";
  const reference = scripture.metadata.reference;
  return typeof reference === "string" ? reference : scripture.label;
}

function getProfilePreferenceHints(profile?: TeoyubePersonalizationProfile): string[] {
  if (!profile) return [];

  return unique([
    ...profile.preferences.map((preference) => `${preference.key}: ${String(preference.value)}`),
    ...profile.surfacePreferences
      .filter((preference) => preference.preferred)
      .map((preference) => `Preferred surface: ${preference.surface}`)
  ]);
}

function createContext(input: TeoyubePersonalizationPreviewInput): TeoyubePersonalizationContext {
  if (input.context) return input.context;

  if (input.signalStore) {
    return createPersonalizationContextFromSignalStore(
      input.signalStore,
      {
        surfaces: input.productionInput.surface ? [input.productionInput.surface] : undefined,
        sessionId: input.productionInput.sessionId,
        userId: input.productionInput.userId,
        limit: 25
      },
      input.consent
    );
  }

  return createPersonalizationContext({
    input: input.productionInput,
    profile: input.profile,
    consent: input.consent,
    signals: []
  });
}

function collectPreferenceHints(
  context: TeoyubePersonalizationContext,
  profile: TeoyubePersonalizationProfile | undefined,
  providedHints: string[] = [],
  feedbackItems: TeoyubePersonalizationPreviewInput["feedbackItems"] = []
): string[] {
  const hints = unique([
    ...providedHints,
    ...getPersonalizedTigRecommendationHints(context),
    ...getProfilePreferenceHints(profile)
  ]);
  const sanitizedFeedback = feedbackItems.map((feedback) =>
    sanitizePersonalizationFeedback(feedback, context.consent)
  );
  const reducedHintTargets = sanitizedFeedback
    .filter(shouldReducePreferenceFromFeedback)
    .map((feedback) => feedback.target.id || feedback.target.label)
    .filter((value): value is string => Boolean(value));

  if (sanitizedFeedback.some(shouldReducePreferenceFromFeedback) && reducedHintTargets.length === 0) {
    return hints.slice(1);
  }

  return hints.filter((hint) =>
    reducedHintTargets.every((target) => !hint.toLowerCase().includes(target.toLowerCase()))
  );
}

function createDecision(params: {
  mode: TeoyubePersonalizationPreviewMode;
  allowed: boolean;
  reason: string;
  hints: string[];
  warnings?: string[];
}): TeoyubePersonalizationPreviewDecision {
  return {
    enabled: params.allowed,
    allowed: params.allowed,
    blocked: !params.allowed,
    previewOnly: true,
    mode: params.mode,
    reason: params.reason,
    preferenceHintsUsed: params.hints,
    warnings: params.warnings || []
  };
}

export function shouldUsePersonalizedPreview(
  input: TeoyubePersonalizationPreviewInput,
  consent?: Partial<TeoyubePersonalizationConsent>
): boolean {
  const consentStatus = validatePersonalizationPreviewConsent({
    ...input,
    consent: consent || input.consent
  });
  const mode = input.mode || "comparison";

  if (!consentStatus.allowed) return false;
  if (mode === "baseline_only" || mode === "disabled") return false;
  if (input.feedbackItems?.some(shouldDisablePersonalizationFromFeedback)) return false;

  return true;
}

export function disablePersonalizationPreview(
  reason: string
): TeoyubePersonalizationPreviewDecision {
  return createDecision({
    mode: "disabled",
    allowed: false,
    reason,
    hints: [],
    warnings: [reason]
  });
}

export function createBaselineProductionPreview(
  input: TeoyubePersonalizationPreviewInput | TigProductionInput
): TigProductionResponse {
  return runTeoyubeProductionIntelligence(normalizePreviewInput(input).productionInput);
}

export function createPersonalizedProductionPreview(
  input: TeoyubePersonalizationPreviewInput,
  context?: TeoyubePersonalizationContext
): {
  response?: TigProductionResponse;
  decision?: ReturnType<typeof runPersonalizedTeoyubeProductionPreview>["personalizationDecision"];
  warnings: string[];
} {
  const normalized = normalizePreviewInput(input);
  const activeContext = context || createContext(normalized);

  if (!shouldUsePersonalizedPreview(normalized, normalized.consent)) {
    return {
      warnings: ["Personalized preview is disabled by consent or mode."]
    };
  }

  const preview = runPersonalizedTeoyubeProductionPreview(
    normalized.productionInput,
    activeContext
  );

  return {
    response: preview.productionResponse,
    decision: preview.personalizationDecision,
    warnings: preview.personalizationDecision.warnings
  };
}

export function compareBaselineAndPersonalizedResponses(
  baseline: TigProductionResponse,
  personalized: TigProductionResponse,
  preferenceHintsUsed: string[] = []
): TeoyubePersonalizationPreviewComparison {
  return createPersonalizationPreviewComparison(baseline, personalized, preferenceHintsUsed);
}

export function explainPersonalizationPreview(
  preview: TeoyubePersonalizationPreviewResponse
): TeoyubePersonalizationPreviewExplanation {
  const changedItems = preview.comparison.items.filter((item) => item.changed);
  const unchangedItems = preview.comparison.items.filter((item) => !item.changed);
  const whatChanged = changedItems.length
    ? changedItems.map((item) => `${item.label}: ${item.baselineValue || "none"} -> ${item.personalizedValue || "none"}`)
    : ["The personalized preview kept the same core recommendation path."];
  const whyChanged = preview.preferenceHintsUsed.length
    ? preview.preferenceHintsUsed.map((hint) => `Soft preference hint considered: ${hint}`)
    : ["No strong preference hints were available, so the baseline path remained primary."];

  return {
    summary:
      preview.personalized && changedItems.length
        ? "Personalization preview considered safe preference hints while keeping Scripture anchoring available."
        : "Personalization preview did not change the baseline Scripture-anchored response.",
    whatChanged,
    whyChanged: [
      ...whyChanged,
      ...unchangedItems.map((item) => `${item.label} stayed stable.`)
    ],
    scriptureAnchor: getScriptureReference(preview.personalized || preview.baseline),
    confidenceSummary: `Baseline confidence ${Math.round(
      preview.confidenceComparison.baselineScore * 100
    )}%, personalized preview ${
      preview.confidenceComparison.personalizedScore !== undefined
        ? `${Math.round(preview.confidenceComparison.personalizedScore * 100)}%`
        : "not run"
    }.`,
    fallbackSummary: preview.fallbackStatus.fallbackAvoided
      ? "The personalized preview avoided a fallback path."
      : "Fallback state did not improve in the personalized preview.",
    warnings: preview.warnings
  };
}

function createBaselineOnlyResponse(params: {
  input: TeoyubePersonalizationPreviewInput;
  baseline: TigProductionResponse;
  reason: string;
  consentStatus: ReturnType<typeof validatePersonalizationPreviewConsent>;
}): TeoyubePersonalizationPreviewResponse {
  const comparison = createPersonalizationPreviewComparison(params.baseline, params.baseline, []);
  const decision = createDecision({
    mode: params.input.mode || "baseline_only",
    allowed: false,
    reason: params.reason,
    hints: [],
    warnings: [...params.consentStatus.reasons, ...params.consentStatus.warnings]
  });
  const preview: TeoyubePersonalizationPreviewResponse = {
    id: createPreviewId(),
    status: params.input.mode === "disabled" ? "disabled" : "baseline_only",
    mode: params.input.mode || "baseline_only",
    baseline: params.baseline,
    preferenceHintsUsed: [],
    personalizationDecision: decision,
    comparison,
    explanation: {
      summary: params.reason,
      whatChanged: ["Personalized preview was not run."],
      whyChanged: ["The baseline production response remains available."],
      scriptureAnchor: getScriptureReference(params.baseline),
      confidenceSummary: `Baseline confidence ${Math.round(params.baseline.confidence.score * 100)}%.`,
      fallbackSummary: params.baseline.fallback.used
        ? "Baseline used a safe fallback."
        : "Baseline did not use fallback.",
      warnings: decision.warnings
    },
    safety: {
      safe: true,
      blocked: false,
      status: "warning",
      reasons: [],
      warnings: decision.warnings,
      guardrails: []
    },
    consent: params.consentStatus.consent,
    fallbackStatus: {
      baselineFallbackUsed: params.baseline.fallback.used,
      fallbackAvoided: false,
      reasons: params.baseline.fallback.reasons
    },
    confidenceComparison: {
      baselineScore: params.baseline.confidence.score,
      delta: 0,
      improved: false
    },
    event: createPersonalizationPreviewDisabledEvent(params.reason) as TeoyubePersonalizationPreviewResponse["event"],
    warnings: decision.warnings,
    generatedAt: new Date().toISOString()
  };
  const safety = getPersonalizationPreviewSafetyStatus(preview);
  const withSafety = { ...preview, safety };

  return sanitizePersonalizationPreview({
    ...withSafety,
    event: createPersonalizationPreviewEvent(params.input, withSafety)
  });
}

export function runTeoyubePersonalizationPreview(
  input: TeoyubePersonalizationPreviewInput | TigProductionInput
): TeoyubePersonalizationPreviewResponse {
  const normalized = normalizePreviewInput(input);
  const baseline = createBaselineProductionPreview(normalized);
  const consentStatus = validatePersonalizationPreviewConsent(normalized);
  const mode = normalized.mode || "comparison";

  if (mode === "baseline_only" || mode === "disabled" || !consentStatus.allowed) {
    return createBaselineOnlyResponse({
      input: normalized,
      baseline,
      reason: consentStatus.allowed
        ? "Personalized preview was not requested for this mode."
        : "Personalized preview is disabled until consent allows signal-based personalization.",
      consentStatus
    });
  }

  if (normalized.feedbackItems?.some(shouldDisablePersonalizationFromFeedback)) {
    return createBaselineOnlyResponse({
      input: normalized,
      baseline,
      reason: "Personalized preview was disabled by explicit user feedback.",
      consentStatus
    });
  }

  const context = createContext(normalized);
  const preferenceHintsUsed = collectPreferenceHints(
    context,
    normalized.profile,
    normalized.preferenceHints,
    normalized.feedbackItems
  );
  const personalizedResult = createPersonalizedProductionPreview(normalized, context);
  const personalized = personalizedResult.response;

  if (!personalized) {
    return createBaselineOnlyResponse({
      input: normalized,
      baseline,
      reason: "Personalized preview could not be created safely; baseline is returned.",
      consentStatus
    });
  }

  const comparison = createPersonalizationPreviewComparison(
    baseline,
    personalized,
    preferenceHintsUsed
  );
  const decision = createDecision({
    mode,
    allowed: true,
    reason:
      "Personalized preview used consented, structured preference hints without replacing the baseline response.",
    hints: preferenceHintsUsed,
    warnings: personalizedResult.warnings
  });
  const fallbackStatus = {
    baselineFallbackUsed: baseline.fallback.used,
    personalizedFallbackUsed: personalized.fallback.used,
    fallbackAvoided: comparison.fallbackAvoided,
    reasons: unique([...baseline.fallback.reasons, ...personalized.fallback.reasons])
  };
  const confidenceComparison = {
    baselineScore: baseline.confidence.score,
    personalizedScore: personalized.confidence.score,
    delta: comparison.confidenceDelta,
    improved: comparison.confidenceImproved
  };
  const draft: TeoyubePersonalizationPreviewResponse = {
    id: createPreviewId(),
    status: mode === "comparison" ? "comparison_ready" : "personalized",
    mode,
    baseline,
    personalized,
    preferenceHintsUsed,
    personalizationDecision: decision,
    personalizationEngineDecision: personalizedResult.decision,
    comparison,
    explanation: {
      summary: "",
      whatChanged: [],
    whyChanged: normalized.feedbackItems?.length
      ? ["Recent feedback was considered as a soft user-control signal."]
      : [],
      scriptureAnchor: getScriptureReference(personalized),
      confidenceSummary: "",
      fallbackSummary: "",
      warnings: decision.warnings
    },
    safety: {
      safe: true,
      blocked: false,
      status: "safe",
      reasons: [],
      warnings: [],
      guardrails: []
    },
    consent: consentStatus.consent,
    fallbackStatus,
    confidenceComparison,
    event: createPersonalizationPreviewDisabledEvent("draft") as TeoyubePersonalizationPreviewResponse["event"],
    warnings: decision.warnings,
    generatedAt: new Date().toISOString()
  };
  const explained = {
    ...draft,
    explanation: {
      ...explainPersonalizationPreview(draft),
      whyChanged: unique([
        ...explainPersonalizationPreview(draft).whyChanged,
        ...(normalized.feedbackItems?.length
          ? ["Feedback can reduce or disable preference hints, but it cannot override Scripture anchoring."]
          : [])
      ])
    }
  };
  const safety = getPersonalizationPreviewSafetyStatus(explained);
  const safePreview = safety.blocked
    ? {
        ...explained,
        status: "blocked" as const,
        personalized: undefined,
        safety,
        warnings: unique([...explained.warnings, ...safety.reasons, ...safety.warnings])
      }
    : {
        ...explained,
        safety,
        warnings: unique([...explained.warnings, ...safety.warnings])
      };

  return sanitizePersonalizationPreview({
    ...safePreview,
    event: createPersonalizationPreviewEvent(normalized, safePreview)
  });
}

export function runTeoyubePersonalizationComparison(
  input: TeoyubePersonalizationPreviewInput | TigProductionInput
): TeoyubePersonalizationPreviewResponse {
  return runTeoyubePersonalizationPreview({
    ...normalizePreviewInput(input),
    mode: "comparison"
  });
}
