import {
  createTigBlockedResponseEvent,
  createTigFallbackUsedEvent,
  createTigLowConfidenceEvent,
  createTigProductionEvent,
  createTigProductionEventBatch,
  createTigRecommendationSelectedEvent,
  createTigSurfaceViewedEvent
} from "../production-events";
import type {
  TigProductionEvent,
  TigProductionResponse
} from "../production-response-contracts";
import {
  runAiCompanionTigProduction,
  runCanonTigProduction
} from "../production-surface-runner";

export type TigEventReadinessExampleItem = {
  label: string;
  event: TigProductionEvent;
  eventName: string;
  surface: string;
  confidenceLabel: string;
  fallbackUsed: boolean;
  safetyStatus: string;
  selectedScriptureReference?: string;
  explanationPathLength: number;
};

function summarizeEvent(label: string, event: TigProductionEvent): TigEventReadinessExampleItem {
  return {
    label,
    event,
    eventName: event.eventName,
    surface: event.surface,
    confidenceLabel: event.confidenceLabel,
    fallbackUsed: event.fallbackUsed,
    safetyStatus: event.safetyStatus,
    selectedScriptureReference: event.selectedScriptureReference,
    explanationPathLength: event.explanationPathLength
  };
}

function createBlockedResponseExample(response: TigProductionResponse): TigProductionResponse {
  return {
    ...response,
    fallback: {
      ...response.fallback,
      used: true,
      reasons: ["blocked_response", ...response.fallback.reasons],
      message:
        "Using a safe fallback path because the original recommendation needed guardrail support."
    },
    safety: {
      ...response.safety,
      safe: false,
      blocked: true,
      status: "blocked",
      violations: [
        ...response.safety.violations,
        "Example blocked response event for production readiness."
      ]
    }
  };
}

export function runPhase5B3EventReadinessExample() {
  const normalResponse = runCanonTigProduction({
    input: "Show a production event-ready canon response.",
    userState: "exploring Scripture Intelligence",
    emotion: "waiting",
    selectedWordId: "word_purpose",
    selectedClusterId: "cluster_purpose_in_delay"
  });
  const fallbackResponse = runAiCompanionTigProduction({
    input: "Connect this to Scripture even if the emotion is unclear.",
    userState: "unclear need",
    selectedWordId: "word_not_real",
    selectedClusterId: "cluster_not_real"
  });
  const lowConfidenceResponse: TigProductionResponse = {
    ...fallbackResponse,
    confidence: {
      ...fallbackResponse.confidence,
      score: 0.2,
      label: "weak",
      breakdown: {
        ...fallbackResponse.confidence.breakdown,
        overall: 0.2,
        label: "weak"
      }
    }
  };
  const blockedResponse = createBlockedResponseExample(normalResponse);

  return {
    normalProductionEvent: summarizeEvent(
      "normal production response event",
      createTigProductionEvent(normalResponse.input, normalResponse)
    ),
    recommendationSelectedEvent: summarizeEvent(
      "recommendation selected event",
      createTigRecommendationSelectedEvent(normalResponse)
    ),
    fallbackUsedEvent: summarizeEvent(
      "fallback used event",
      createTigFallbackUsedEvent(fallbackResponse)
    ),
    lowConfidenceEvent: summarizeEvent(
      "low confidence event",
      createTigLowConfidenceEvent(lowConfidenceResponse)
    ),
    blockedResponseEvent: summarizeEvent(
      "blocked response event",
      createTigBlockedResponseEvent(blockedResponse)
    ),
    surfaceViewedEvent: summarizeEvent(
      "surface viewed event",
      createTigSurfaceViewedEvent("canon", normalResponse)
    ),
    eventBatch: createTigProductionEventBatch(normalResponse.input, normalResponse).map(
      (event) => summarizeEvent("event batch item", event)
    )
  };
}
