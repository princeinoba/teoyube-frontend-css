import {
  getCachedTigProductionResponse,
  getTigProductionCacheKey
} from "../production-cache";
import { createTigProductionEvent } from "../production-events";
import { applyTigProductionFallback } from "../production-fallbacks";
import {
  getTigProductionSafetyStatus,
  sanitizeTigProductionResponse,
  shouldBlockTigProductionResponse
} from "../production-guardrails";
import { runTeoyubeProductionIntelligence } from "../production-intelligence-service";
import type { TigProductionResponse } from "../production-response-contracts";
import {
  validateTigProductionResponseShape
} from "../production-response-validation";
import {
  toTigExplanationPanelProps,
  toTigGraphPanelProps,
  toTigResponsePanelProps
} from "../production-ui-adapter";
import {
  TIG_PHASE_5B3_RUNTIME_TEST_FIXTURES,
  type TigProductionRuntimeTestFixture
} from "./phase-5b3-runtime-test-fixtures";

export type TigRuntimeSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
  fallbackUsed: boolean;
  blockedBeforeRepair: boolean;
  finalSafetyStatus: string;
  confidenceLabel: string;
  cacheKeyStable: boolean;
};

export type TigRuntimeSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: TigRuntimeSmokeCheckResult[];
};

const CONFIDENCE_ORDER = {
  weak: 0,
  partial: 1,
  good: 2,
  strong: 3
};

function cloneResponse(response: TigProductionResponse): TigProductionResponse {
  return {
    ...response,
    selection: {
      ...response.selection,
      nodes: [...response.selection.nodes],
      edges: [...response.selection.edges]
    },
    confidence: {
      ...response.confidence,
      breakdown: { ...response.confidence.breakdown }
    },
    explanation: {
      ...response.explanation,
      reasonPath: [...response.explanation.reasonPath],
      scriptureEvidence: [...response.explanation.scriptureEvidence],
      selectedNodeIds: [...response.explanation.selectedNodeIds],
      selectedEdgeIds: [...response.explanation.selectedEdgeIds],
      warnings: [...response.explanation.warnings]
    },
    fallback: {
      ...response.fallback,
      reasons: [...response.fallback.reasons],
      appliedNodeIds: [...response.fallback.appliedNodeIds]
    },
    safety: {
      ...response.safety,
      warnings: [...response.safety.warnings],
      violations: [...response.safety.violations],
      guardrails: [...response.safety.guardrails]
    },
    event: {
      ...response.event,
      metadata: response.event.metadata ? { ...response.event.metadata } : undefined
    },
    visualization: {
      ...response.visualization,
      nodes: response.visualization.nodes.map((node) => ({ ...node, metadata: { ...node.metadata } })),
      edges: response.visualization.edges.map((edge) => ({ ...edge })),
      statistics: {
        ...response.visualization.statistics,
        nodesByType: { ...response.visualization.statistics.nodesByType }
      }
    }
  };
}

function mutateResponseForFixture(
  response: TigProductionResponse,
  fixture: TigProductionRuntimeTestFixture
): TigProductionResponse {
  const mutated = cloneResponse(response);

  if (fixture.mutation === "weak_confidence") {
    mutated.confidence = {
      ...mutated.confidence,
      score: 0.2,
      label: "weak",
      breakdown: {
        ...mutated.confidence.breakdown,
        overall: 0.2,
        label: "weak"
      }
    };
  }

  if (fixture.mutation === "missing_scripture_anchor") {
    mutated.selection = {
      ...mutated.selection,
      scriptureAnchor: undefined
    };
    mutated.explanation = {
      ...mutated.explanation,
      scriptureEvidence: []
    };
  }

  if (fixture.mutation === "missing_explanation_path") {
    mutated.explanation = {
      ...mutated.explanation,
      reasonPath: []
    };
  }

  if (fixture.mutation === "unsafe_action_step" && mutated.selection.actionStep) {
    mutated.selection = {
      ...mutated.selection,
      actionStep: {
        ...mutated.selection.actionStep,
        label: "Hurt yourself",
        description: "Hurt yourself to prove the guardrail catches unsafe action text."
      }
    };
  }

  return mutated;
}

function repairResponse(response: TigProductionResponse): TigProductionResponse {
  const withSafety = {
    ...response,
    safety: getTigProductionSafetyStatus(response)
  };
  const withFallback = applyTigProductionFallback(withSafety);
  const sanitized = sanitizeTigProductionResponse(withFallback);
  const finalResponse = {
    ...sanitized,
    safety: getTigProductionSafetyStatus(sanitized)
  };

  return {
    ...finalResponse,
    event: createTigProductionEvent(finalResponse.input, finalResponse)
  };
}

function labelMeetsMinimum(label: string, minimum: string): boolean {
  return (
    (CONFIDENCE_ORDER[label as keyof typeof CONFIDENCE_ORDER] ?? -1) >=
    (CONFIDENCE_ORDER[minimum as keyof typeof CONFIDENCE_ORDER] ?? 0)
  );
}

function runFixture(fixture: TigProductionRuntimeTestFixture): TigRuntimeSmokeCheckResult {
  const errors: string[] = [];
  const productionResponse = runTeoyubeProductionIntelligence(fixture.input);
  const cacheKey = productionResponse.cacheKey || getTigProductionCacheKey(productionResponse.input);
  const secondCacheKey = getTigProductionCacheKey(productionResponse.input);
  const cachedResponse = getCachedTigProductionResponse(cacheKey);
  const mutatedResponse = mutateResponseForFixture(productionResponse, fixture);
  const blockedBeforeRepair = shouldBlockTigProductionResponse(mutatedResponse);
  const finalResponse = fixture.mutation ? repairResponse(mutatedResponse) : productionResponse;
  const validation = validateTigProductionResponseShape(finalResponse);
  const responsePanelProps = toTigResponsePanelProps(finalResponse);
  const graphPanelProps = toTigGraphPanelProps(finalResponse);
  const explanationPanelProps = toTigExplanationPanelProps(finalResponse);

  if (!validation.valid) {
    errors.push(`Missing fields: ${validation.missingFields.join(", ")}`);
  }

  if (!finalResponse.selection.scriptureAnchor || !finalResponse.explanation.scriptureEvidence.length) {
    errors.push("Response is missing Scripture anchor or Scripture evidence.");
  }

  if (!finalResponse.explanation.reasonPath.length) {
    errors.push("Response is missing explanation path.");
  }

  if (!finalResponse.confidence || typeof finalResponse.confidence.score !== "number") {
    errors.push("Response is missing confidence score.");
  }

  if (!finalResponse.confidence.label) {
    errors.push("Response is missing confidence label.");
  }

  if (!finalResponse.event.eventName) {
    errors.push("Response is missing event payload.");
  }

  if (!responsePanelProps.selectionRows.length) {
    errors.push("Response panel adapter did not receive usable selection rows.");
  }

  if (!explanationPanelProps.items.length) {
    errors.push("Explanation panel adapter did not receive usable items.");
  }

  if (!graphPanelProps.visualization.nodes.length) {
    errors.push("Graph panel adapter did not receive graph nodes.");
  }

  if (fixture.fallbackExpected && !finalResponse.fallback.used) {
    errors.push("Fallback was expected but not used.");
  }

  if (fixture.blockedExpected && !blockedBeforeRepair) {
    errors.push("Fixture expected pre-repair blocking, but guardrails did not block.");
  }

  if (finalResponse.safety.blocked) {
    errors.push("Final response remained blocked after fallback/sanitization.");
  }

  if (!labelMeetsMinimum(finalResponse.confidence.label, fixture.minimumExpectedConfidenceLabel)) {
    errors.push(
      `Confidence label ${finalResponse.confidence.label} is below expected ${fixture.minimumExpectedConfidenceLabel}.`
    );
  }

  if (cacheKey !== secondCacheKey) {
    errors.push("Cache key is not stable.");
  }

  if (!cachedResponse) {
    errors.push("Cached response could not be retrieved after service run.");
  }

  return {
    name: fixture.name,
    valid: errors.length === 0,
    errors,
    fallbackUsed: finalResponse.fallback.used,
    blockedBeforeRepair,
    finalSafetyStatus: finalResponse.safety.status,
    confidenceLabel: finalResponse.confidence.label,
    cacheKeyStable: cacheKey === secondCacheKey
  };
}

export function runPhase5B3RuntimeSmokeCheck(): TigRuntimeSmokeCheckReport {
  const results = TIG_PHASE_5B3_RUNTIME_TEST_FIXTURES.map(runFixture);
  const errors = results.flatMap((result) =>
    result.errors.map((error) => `${result.name}: ${error}`)
  );

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length,
    results
  };
}
