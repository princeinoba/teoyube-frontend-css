import type {
  TeoyubePersonalizationPreviewEvent,
  TeoyubePersonalizationPreviewInput,
  TeoyubePersonalizationPreviewResponse
} from "./personalization-preview-contracts";
import type { TigProductionEvent, TigProductionSurface } from "./production-response-contracts";

function scriptureReference(preview: TeoyubePersonalizationPreviewResponse): string | undefined {
  const scripture =
    preview.personalized?.selection.scriptureAnchor || preview.baseline.selection.scriptureAnchor;
  if (!scripture) return undefined;
  const reference = scripture.metadata.reference;
  return typeof reference === "string" ? reference : scripture.label;
}

function baseEvent(params: {
  eventName: string;
  surface?: TigProductionSurface;
  preview?: TeoyubePersonalizationPreviewResponse;
  reason?: string;
}): TigProductionEvent {
  const preview = params.preview;

  return {
    eventName: params.eventName,
    timestamp: new Date().toISOString(),
    surface: params.surface || preview?.baseline.input.surface || "unknown",
    intent: preview?.baseline.input.intent,
    sessionId: preview?.baseline.input.sessionId,
    userId: preview?.baseline.input.userId,
    selectedWordId:
      preview?.personalized?.selection.teoyubeWord?.id ||
      preview?.baseline.selection.teoyubeWord?.id,
    selectedPromiseClusterId:
      preview?.personalized?.selection.promiseCluster?.id ||
      preview?.baseline.selection.promiseCluster?.id,
    selectedScriptureReference: preview ? scriptureReference(preview) : undefined,
    selectedPrayerSequenceId:
      preview?.personalized?.selection.prayerSequence?.id ||
      preview?.baseline.selection.prayerSequence?.id,
    selectedActionStepId:
      preview?.personalized?.selection.actionStep?.id ||
      preview?.baseline.selection.actionStep?.id,
    confidenceScore:
      preview?.personalized?.confidence.score ||
      preview?.baseline.confidence.score ||
      0,
    confidenceLabel:
      preview?.personalized?.confidence.label ||
      preview?.baseline.confidence.label ||
      "weak",
    fallbackUsed:
      preview?.personalized?.fallback.used ||
      preview?.baseline.fallback.used ||
      false,
    fallbackReason:
      preview?.personalized?.fallback.reasons[0] ||
      preview?.baseline.fallback.reasons[0],
    fallbackReasons:
      preview?.personalized?.fallback.reasons ||
      preview?.baseline.fallback.reasons ||
      [],
    safetyStatus: preview?.safety.status === "blocked" ? "blocked" : preview?.baseline.safety.status || "safe",
    blocked: preview?.safety.blocked || false,
    explanationPathLength:
      preview?.personalized?.explanation.reasonPath.length ||
      preview?.baseline.explanation.reasonPath.length ||
      0,
    graphNodeCount:
      preview?.personalized?.visualization.statistics.totalNodes ||
      preview?.baseline.visualization.statistics.totalNodes ||
      0,
    graphEdgeCount:
      preview?.personalized?.visualization.statistics.totalEdges ||
      preview?.baseline.visualization.statistics.totalEdges ||
      0,
    metadata: {
      externalAnalyticsSent: false,
      previewEvent: true,
      reason: params.reason
    }
  };
}

function augmentEvent(
  event: TigProductionEvent,
  preview: TeoyubePersonalizationPreviewResponse
): TeoyubePersonalizationPreviewEvent {
  return {
    ...event,
    previewMode: preview.mode,
    consentEnabled: preview.consent.personalizationEnabled,
    baselineWordId: preview.baseline.selection.teoyubeWord?.id,
    personalizedWordId: preview.personalized?.selection.teoyubeWord?.id,
    baselineClusterId: preview.baseline.selection.promiseCluster?.id,
    personalizedClusterId: preview.personalized?.selection.promiseCluster?.id,
    scriptureReference: scriptureReference(preview),
    confidenceDelta: preview.comparison.confidenceDelta,
    fallbackAvoided: preview.comparison.fallbackAvoided,
    preferenceHintsUsed: preview.preferenceHintsUsed,
    previewSafetyStatus: preview.safety.status,
    previewBlocked: preview.safety.blocked,
    metadata: {
      ...event.metadata,
      previewStatus: preview.status,
      comparisonChanged: preview.comparison.changed,
      warnings: preview.warnings
    }
  };
}

export function createPersonalizationPreviewEvent(
  input: TeoyubePersonalizationPreviewInput,
  preview: TeoyubePersonalizationPreviewResponse
): TeoyubePersonalizationPreviewEvent {
  return augmentEvent(
    baseEvent({
      eventName: "tig.personalization.preview.created",
      surface: input.productionInput.surface,
      preview
    }),
    preview
  );
}

export function createPersonalizationPreviewComparedEvent(
  preview: TeoyubePersonalizationPreviewResponse
): TeoyubePersonalizationPreviewEvent {
  return augmentEvent(
    baseEvent({
      eventName: "tig.personalization.preview.compared",
      preview
    }),
    preview
  );
}

export function createPersonalizationPreviewDisabledEvent(
  reason: string
): TigProductionEvent {
  return baseEvent({
    eventName: "tig.personalization.preview.disabled",
    reason
  });
}

export function createPersonalizationPreviewBlockedEvent(
  preview: TeoyubePersonalizationPreviewResponse
): TeoyubePersonalizationPreviewEvent {
  return augmentEvent(
    baseEvent({
      eventName: "tig.personalization.preview.blocked",
      preview
    }),
    preview
  );
}

export function createPersonalizationPreviewPreferenceUsedEvent(
  preview: TeoyubePersonalizationPreviewResponse
): TeoyubePersonalizationPreviewEvent {
  return augmentEvent(
    baseEvent({
      eventName: "tig.personalization.preview.preference_used",
      preview
    }),
    preview
  );
}
