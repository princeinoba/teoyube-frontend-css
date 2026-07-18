import {
  createTigFallbackUsedEvent,
  createTigLowConfidenceEvent,
  createTigRecommendationSelectedEvent
} from "../production-events";
import { applyTigProductionFallback } from "../production-fallbacks";
import { getTigProductionSafetyStatus } from "../production-guardrails";
import { runTeoyubeProductionIntelligence } from "../production-intelligence-service";
import {
  toTigExplanationPanelProps,
  toTigGraphPanelProps,
  toTigResponsePanelProps
} from "../production-ui-adapter";

export function runPhase5B3ProductionExample() {
  const input = {
    input: "I feel stuck and need a promise from Scripture.",
    userState: "discouragement",
    emotion: "discouragement",
    intent: "seeking_encouragement",
    surface: "promise_cluster" as const,
    sessionId: "phase-5b3-example-session"
  };

  const productionResponse = runTeoyubeProductionIntelligence(input);
  const fallbackCheckedResponse = applyTigProductionFallback(productionResponse);
  const safetyStatus = getTigProductionSafetyStatus(fallbackCheckedResponse);
  const recommendationSelectedEvent =
    createTigRecommendationSelectedEvent(fallbackCheckedResponse);
  const fallbackEvent = fallbackCheckedResponse.fallback.used
    ? createTigFallbackUsedEvent(fallbackCheckedResponse)
    : undefined;
  const lowConfidenceEvent =
    fallbackCheckedResponse.confidence.score < 0.68
      ? createTigLowConfidenceEvent(fallbackCheckedResponse)
      : undefined;

  return {
    input,
    productionResponse: fallbackCheckedResponse,
    safetyStatus,
    events: {
      recommendationSelectedEvent,
      fallbackEvent,
      lowConfidenceEvent
    },
    ui: {
      responsePanel: toTigResponsePanelProps(fallbackCheckedResponse),
      graphPanel: toTigGraphPanelProps(fallbackCheckedResponse),
      explanationPanel: toTigExplanationPanelProps(fallbackCheckedResponse)
    }
  };
}
