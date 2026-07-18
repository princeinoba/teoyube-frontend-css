import type { TigProductionResponse } from "./production-response-contracts";

export type TigProductionResponseValidationResult = {
  valid: boolean;
  missingFields: string[];
};

function hasObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function hasNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

function hasString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function hasNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

export function getMissingTigProductionFields(response: unknown): string[] {
  const missingFields: string[] = [];

  if (!hasObject(response)) {
    return ["response"];
  }

  const selection = hasObject(response.selection) ? response.selection : undefined;
  const confidence = hasObject(response.confidence) ? response.confidence : undefined;
  const explanation = hasObject(response.explanation) ? response.explanation : undefined;
  const fallback = hasObject(response.fallback) ? response.fallback : undefined;
  const safety = hasObject(response.safety) ? response.safety : undefined;
  const event = hasObject(response.event) ? response.event : undefined;
  const visualization = hasObject(response.visualization) ? response.visualization : undefined;

  if (!selection) missingFields.push("selection");
  if (!selection?.teoyubeWord) missingFields.push("selection.teoyubeWord");
  if (!selection?.promiseCluster) missingFields.push("selection.promiseCluster");
  if (!selection?.scriptureAnchor) missingFields.push("selection.scriptureAnchor");
  if (!selection?.prayerSequence) missingFields.push("selection.prayerSequence");
  if (!selection?.actionStep) missingFields.push("selection.actionStep");
  if (!hasArray(selection?.nodes)) missingFields.push("selection.nodes");
  if (!hasArray(selection?.edges)) missingFields.push("selection.edges");

  if (!confidence) missingFields.push("confidence");
  if (!hasNumber(confidence?.score)) missingFields.push("confidence.score");
  if (!hasString(confidence?.label)) missingFields.push("confidence.label");
  if (!hasObject(confidence?.breakdown)) missingFields.push("confidence.breakdown");

  if (!explanation) missingFields.push("explanation");
  if (!hasString(explanation?.summary)) missingFields.push("explanation.summary");
  if (!hasNonEmptyArray(explanation?.reasonPath)) missingFields.push("explanation.reasonPath");
  if (!hasNonEmptyArray(explanation?.scriptureEvidence)) {
    missingFields.push("explanation.scriptureEvidence");
  }
  if (!hasArray(explanation?.selectedNodeIds)) missingFields.push("explanation.selectedNodeIds");
  if (!hasArray(explanation?.selectedEdgeIds)) missingFields.push("explanation.selectedEdgeIds");

  if (!fallback) missingFields.push("fallback");
  if (typeof fallback?.used !== "boolean") missingFields.push("fallback.used");
  if (!hasArray(fallback?.reasons)) missingFields.push("fallback.reasons");
  if (!hasString(fallback?.message)) missingFields.push("fallback.message");

  if (!safety) missingFields.push("safety");
  if (typeof safety?.safe !== "boolean") missingFields.push("safety.safe");
  if (typeof safety?.blocked !== "boolean") missingFields.push("safety.blocked");
  if (!hasString(safety?.status)) missingFields.push("safety.status");

  if (!event) missingFields.push("event");
  if (!hasString(event?.eventName)) missingFields.push("event.eventName");
  if (!hasString(event?.timestamp)) missingFields.push("event.timestamp");
  if (!hasString(event?.surface)) missingFields.push("event.surface");
  if (!hasNumber(event?.confidenceScore)) missingFields.push("event.confidenceScore");
  if (!hasString(event?.confidenceLabel)) missingFields.push("event.confidenceLabel");
  if (typeof event?.fallbackUsed !== "boolean") missingFields.push("event.fallbackUsed");
  if (!hasArray(event?.fallbackReasons)) missingFields.push("event.fallbackReasons");
  if (!hasString(event?.safetyStatus)) missingFields.push("event.safetyStatus");
  if (typeof event?.blocked !== "boolean") missingFields.push("event.blocked");
  if (!hasNumber(event?.explanationPathLength)) {
    missingFields.push("event.explanationPathLength");
  }
  if (!hasNumber(event?.graphNodeCount)) missingFields.push("event.graphNodeCount");
  if (!hasNumber(event?.graphEdgeCount)) missingFields.push("event.graphEdgeCount");

  if (!visualization) missingFields.push("visualization");
  if (!hasArray(visualization?.nodes)) missingFields.push("visualization.nodes");
  if (!hasArray(visualization?.edges)) missingFields.push("visualization.edges");
  if (!hasObject(visualization?.statistics)) missingFields.push("visualization.statistics");

  return missingFields;
}

export function validateTigProductionResponseShape(
  response: unknown
): TigProductionResponseValidationResult {
  const missingFields = getMissingTigProductionFields(response);

  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

export function assertTigProductionResponseComplete(
  response: unknown
): asserts response is TigProductionResponse {
  const validation = validateTigProductionResponseShape(response);

  if (!validation.valid) {
    throw new Error(
      `TIG production response is incomplete: ${validation.missingFields.join(", ")}`
    );
  }
}
