import { createTeoyubeLearningSummary } from "../ai-learning-architecture";
import {
  applyPersonalizationToProductionInput,
  createPersonalizationContext,
  getPersonalizedTigRecommendationHints,
  runTeoyubePersonalizationPreview
} from "../personalization-engine";
import {
  canUsePersonalizationSignal,
  sanitizePersonalizationSignal,
  shouldDisablePersonalization,
  validatePersonalizationConsent
} from "../personalization-safety";
import {
  createSignalFromProductionInput,
  createSignalFromProductionResponse,
  mergeTeoyubePersonalizationSignals,
  normalizeTeoyubePersonalizationSignal
} from "../personalization-signals";
import { createPersonalizedProductionExplanation } from "../personalized-production-bridge";
import { runPromiseClusterTigProduction } from "../production-surface-runner";

export type Phase6PersonalizationSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type Phase6PersonalizationSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: Phase6PersonalizationSmokeCheckResult[];
};

function result(name: string, errors: string[]): Phase6PersonalizationSmokeCheckResult {
  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

export function runPhase6PersonalizationArchitectureSmokeCheck(): Phase6PersonalizationSmokeCheckReport {
  const productionInput = {
    input: "I feel stuck and need a Scripture-backed promise.",
    userState: "discouragement",
    emotion: "discouragement",
    intent: "promise_search",
    surface: "promise_cluster" as const,
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting"
  };
  const productionResponse = runPromiseClusterTigProduction(productionInput);
  const consent = validatePersonalizationConsent({
    personalizationEnabled: true,
    learningEnabled: true,
    allowRawTextStorage: false,
    allowedScopes: ["signals", "preferences", "journey_progress", "feedback"],
    source: "user"
  });
  const disabledConsent = validatePersonalizationConsent({
    personalizationEnabled: false,
    learningEnabled: false,
    allowRawTextStorage: false,
    allowedScopes: []
  });
  const normalized = normalizeTeoyubePersonalizationSignal({
    source: "manual_feedback",
    surface: "promise_cluster",
    emotionTag: "discouragement",
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting",
    storesRawText: true,
    rawTextPreview: "This should be removed unless consent explicitly allows it."
  });
  const inputSignal = createSignalFromProductionInput(productionInput);
  const responseSignal = createSignalFromProductionResponse(productionResponse);
  const sanitized = sanitizePersonalizationSignal(normalized);
  const mergedSignals = mergeTeoyubePersonalizationSignals([
    inputSignal,
    responseSignal,
    sanitized
  ]);
  const context = createPersonalizationContext({
    input: productionInput,
    consent,
    signals: mergedSignals
  });
  const disabledContext = createPersonalizationContext({
    input: productionInput,
    consent: disabledConsent,
    signals: mergedSignals
  });
  const enhancedInput = applyPersonalizationToProductionInput(productionInput, context);
  const preview = runTeoyubePersonalizationPreview(productionInput, context);
  const disabledPreview = runTeoyubePersonalizationPreview(productionInput, disabledContext);
  const hints = getPersonalizedTigRecommendationHints(context);
  const explanation = createPersonalizedProductionExplanation(
    productionResponse,
    preview.decision
  );
  const learningSummary = createTeoyubeLearningSummary(mergedSignals);

  const results = [
    result("contracts and consent compile", [
      consent.personalizationEnabled ? "" : "Consent should be enabled."
    ].filter(Boolean)),
    result("signals normalize", [
      normalized.id ? "" : "Normalized signal is missing an id.",
      normalized.storesRawText ? "" : "Raw text flag should remain visible before sanitization."
    ].filter(Boolean)),
    result("signals sanitize", [
      sanitized.storesRawText ? "Sanitized signal still stores raw text." : "",
      sanitized.rawTextPreview ? "Sanitized signal still includes raw text preview." : ""
    ].filter(Boolean)),
    result("consent rules enforce signal use", [
      canUsePersonalizationSignal(sanitized, consent)
        ? ""
        : "Sanitized signal should be usable with consent.",
      canUsePersonalizationSignal(normalized, disabledConsent)
        ? "Signal should not be usable without consent."
        : ""
    ].filter(Boolean)),
    result("personalization can be disabled", [
      shouldDisablePersonalization(disabledContext)
        ? ""
        : "Disabled context should disable personalization.",
      disabledPreview.decision.enabled
        ? "Disabled preview should not enable personalization."
        : ""
    ].filter(Boolean)),
    result("context can be created", [
      context.signals.length ? "" : "Context is missing signals.",
      context.generatedAt ? "" : "Context is missing generatedAt."
    ].filter(Boolean)),
    result("production input can receive safe hints", [
      enhancedInput.context?.personalizationPreview ? "" : "Enhanced input is missing preview context."
    ].filter(Boolean)),
    result("personalization explanation can be generated", [
      explanation.explanation ? "" : "Explanation is empty.",
      explanation.hints.length ? "" : "Explanation is missing hints."
    ].filter(Boolean)),
    result("no raw sensitive text stored by default", [
      inputSignal.storesRawText ? "Input signal stored raw text by default." : "",
      responseSignal.storesRawText ? "Response signal stored raw text by default." : ""
    ].filter(Boolean)),
    result("no database or external API required", [
      learningSummary.explanation.includes("preview-only")
        ? ""
        : "Learning summary should state preview-only behavior.",
      hints.length ? "" : "Hints should be available."
    ].filter(Boolean))
  ];

  const errors = results.flatMap((item) =>
    item.errors.map((error) => `${item.name}: ${error}`)
  );

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length,
    results
  };
}
