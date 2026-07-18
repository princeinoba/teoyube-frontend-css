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

export type TigEventReadinessSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type TigEventReadinessSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: TigEventReadinessSmokeCheckResult[];
};

function cloneWithWeakConfidence(response: TigProductionResponse): TigProductionResponse {
  return {
    ...response,
    confidence: {
      ...response.confidence,
      score: 0.2,
      label: "weak",
      breakdown: {
        ...response.confidence.breakdown,
        overall: 0.2,
        label: "weak"
      }
    }
  };
}

function cloneAsBlocked(response: TigProductionResponse): TigProductionResponse {
  return {
    ...response,
    fallback: {
      ...response.fallback,
      used: true,
      reasons: ["blocked_response", ...response.fallback.reasons]
    },
    safety: {
      ...response.safety,
      safe: false,
      blocked: true,
      status: "blocked",
      violations: ["Example blocked response for smoke-check event readiness."]
    }
  };
}

function validateEvent(event: TigProductionEvent): string[] {
  const errors: string[] = [];

  if (!event.eventName) errors.push("Event is missing an event name.");
  if (!event.eventName.startsWith("tig.production.")) {
    errors.push(`Event name is not production-scoped: ${event.eventName}`);
  }
  if (!event.timestamp) errors.push("Event is missing a timestamp.");
  if (!event.surface) errors.push("Event is missing a surface.");
  if (typeof event.confidenceScore !== "number") {
    errors.push("Event is missing confidence score.");
  }
  if (!event.confidenceLabel) errors.push("Event is missing confidence label.");
  if (typeof event.fallbackUsed !== "boolean") {
    errors.push("Event is missing fallback status.");
  }
  if (!Array.isArray(event.fallbackReasons)) {
    errors.push("Event is missing fallback reasons.");
  }
  if (!event.safetyStatus) errors.push("Event is missing safety status.");
  if (typeof event.blocked !== "boolean") errors.push("Event is missing blocked status.");
  if (typeof event.explanationPathLength !== "number") {
    errors.push("Event is missing explanation path length.");
  }
  if (typeof event.graphNodeCount !== "number") errors.push("Event is missing graph node count.");
  if (typeof event.graphEdgeCount !== "number") errors.push("Event is missing graph edge count.");
  if (event.metadata?.externalAnalyticsSent !== false) {
    errors.push("Event does not explicitly mark external analytics as unsent.");
  }

  try {
    JSON.stringify(event);
  } catch {
    errors.push("Event is not safely JSON serializable.");
  }

  return errors;
}

function result(name: string, events: TigProductionEvent[]): TigEventReadinessSmokeCheckResult {
  const errors = events.flatMap((event, index) =>
    validateEvent(event).map((error) => `${name} event ${index + 1}: ${error}`)
  );

  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

export function runPhase5B3EventReadinessSmokeCheck(): TigEventReadinessSmokeCheckReport {
  const normalResponse = runCanonTigProduction({
    input: "Create an event-ready production response.",
    userState: "waiting for Scripture-grounded direction",
    emotion: "waiting",
    selectedWordId: "word_hope",
    selectedClusterId: "cluster_strength_in_waiting"
  });
  const fallbackResponse = runAiCompanionTigProduction({
    input: "I need help, but the selected graph IDs are missing.",
    userState: "unclear need",
    selectedWordId: "word_not_real",
    selectedClusterId: "cluster_not_real"
  });
  const weakResponse = cloneWithWeakConfidence(normalResponse);
  const blockedResponse = cloneAsBlocked(normalResponse);

  const batch = createTigProductionEventBatch(normalResponse.input, normalResponse);
  const results = [
    result("normal production response", [
      createTigProductionEvent(normalResponse.input, normalResponse),
      createTigRecommendationSelectedEvent(normalResponse)
    ]),
    result("fallback response", [createTigFallbackUsedEvent(fallbackResponse)]),
    result("low confidence response", [createTigLowConfidenceEvent(weakResponse)]),
    result("blocked response", [createTigBlockedResponseEvent(blockedResponse)]),
    result("surface viewed", [createTigSurfaceViewedEvent("canon", normalResponse)]),
    result("event batch", batch)
  ];

  if (!fallbackResponse.fallback.used) {
    results.push({
      name: "fallback response expected fallback",
      valid: false,
      errors: ["Fallback response did not use fallback support."]
    });
  }

  if (!batch.length) {
    results.push({
      name: "event batch not empty",
      valid: false,
      errors: ["Event batch was empty."]
    });
  }

  const errors = results.flatMap((item) => item.errors);

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length,
    results
  };
}
