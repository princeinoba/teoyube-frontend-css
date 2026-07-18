import type {
  GraphVisualization,
  TigProductionResponse,
  TeoyubeConsentControlState,
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationPreviewResponse
} from "../../tig";
import type { TeoyubeCacheReadinessStatus } from "./performance-optimization-contracts";

export type TeoyubeMobileCacheConsent =
  | Partial<TeoyubePersonalizationConsent>
  | Partial<TeoyubeConsentControlState>
  | undefined;

export type TeoyubeMobileCacheBoundaryRule = {
  id: string;
  label: string;
  rule: string;
  required: boolean;
};

export type TeoyubeMobileCachedGraphSummary = {
  type: "graph_summary";
  nodeCount: number;
  edgeCount: number;
  rootNodeIds: string[];
  selectedNodeIds: string[];
  nodesByType: Record<string, number>;
  averageRelationshipStrength: number;
  averageConfidence: number;
};

export type TeoyubeMobileCachedProductionResponse = {
  type: "tig_production_response_summary";
  id: string;
  version: TigProductionResponse["version"];
  surface: string;
  intent?: string;
  selectedWordId?: string;
  selectedPromiseClusterId?: string;
  selectedScriptureReference?: string;
  selectedPrayerSequenceId?: string;
  selectedActionStepId?: string;
  selectionLabels: string[];
  scriptureEvidence: string[];
  explanationSummary: string;
  explanationPath: string[];
  confidence: TigProductionResponse["confidence"];
  fallback: TigProductionResponse["fallback"];
  safety: TigProductionResponse["safety"];
  graphSummary: TeoyubeMobileCachedGraphSummary;
  generatedAt: string;
  cacheNotice: string;
};

export type TeoyubeMobileCachedPersonalizationPreview = {
  type: "personalization_preview_summary";
  id: string;
  status: string;
  mode: string;
  preferenceHintsUsed: string[];
  comparisonSummary: string;
  confidenceComparison: TeoyubePersonalizationPreviewResponse["confidenceComparison"];
  fallbackStatus: TeoyubePersonalizationPreviewResponse["fallbackStatus"];
  safety: TeoyubePersonalizationPreviewResponse["safety"];
  consentEnabled: boolean;
  generatedAt: string;
  cacheNotice: string;
};

export type TeoyubeMobileCacheBoundaryReport = {
  status: TeoyubeCacheReadinessStatus;
  cacheable: boolean;
  sanitized: boolean;
  itemType: string;
  warnings: string[];
  rules: TeoyubeMobileCacheBoundaryRule[];
};

type NormalizedConsent = {
  personalizationEnabled: boolean;
  learningEnabled: boolean;
  allowRawTextStorage: boolean;
  allowedScopes: string[];
  sessionOnlyPersonalization: boolean;
  signalStorageAllowed: boolean;
};

function normalizeConsent(consent: TeoyubeMobileCacheConsent): NormalizedConsent {
  const consentRecord = consent && typeof consent === "object" ? consent as Record<string, unknown> : {};
  const nestedConsent =
    consentRecord.consent && typeof consentRecord.consent === "object"
      ? consentRecord.consent as Partial<TeoyubePersonalizationConsent>
      : consent as Partial<TeoyubePersonalizationConsent> | undefined;

  return {
    personalizationEnabled: Boolean(
      consentRecord.personalizationEnabled ?? nestedConsent?.personalizationEnabled
    ),
    learningEnabled: Boolean(nestedConsent?.learningEnabled),
    allowRawTextStorage: Boolean(nestedConsent?.allowRawTextStorage),
    allowedScopes: Array.isArray(nestedConsent?.allowedScopes) ? nestedConsent.allowedScopes : [],
    sessionOnlyPersonalization: Boolean(consentRecord.sessionOnlyPersonalization),
    signalStorageAllowed: Boolean(consentRecord.signalStorageAllowed)
  };
}

function hasPersonalizationConsent(consent: TeoyubeMobileCacheConsent): boolean {
  const normalized = normalizeConsent(consent);
  return (
    normalized.personalizationEnabled &&
    !normalized.sessionOnlyPersonalization &&
    (normalized.signalStorageAllowed ||
      normalized.allowedScopes.includes("signals") ||
      normalized.allowedScopes.includes("preferences"))
  );
}

function label(value: { label?: string; id?: string } | undefined): string | undefined {
  return value?.label || value?.id;
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))];
}

function isProductionResponse(item: unknown): item is TigProductionResponse {
  return Boolean(
    item &&
      typeof item === "object" &&
      (item as Partial<TigProductionResponse>).version === "5B.3" &&
      (item as Partial<TigProductionResponse>).selection &&
      (item as Partial<TigProductionResponse>).visualization
  );
}

function isPreview(item: unknown): item is TeoyubePersonalizationPreviewResponse {
  return Boolean(
    item &&
      typeof item === "object" &&
      (item as Partial<TeoyubePersonalizationPreviewResponse>).baseline &&
      (item as Partial<TeoyubePersonalizationPreviewResponse>).comparison
  );
}

function isGraph(item: unknown): item is GraphVisualization {
  return Boolean(
    item &&
      typeof item === "object" &&
      Array.isArray((item as Partial<GraphVisualization>).nodes) &&
      Array.isArray((item as Partial<GraphVisualization>).edges)
  );
}

function containsRawTextKey(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  return Object.keys(value as Record<string, unknown>).some((key) =>
    ["input", "userState", "rawText", "rawTextPreview", "journalEntry", "entry", "requestInput"].includes(key)
  );
}

export function getMobileCacheBoundaryRules(): TeoyubeMobileCacheBoundaryRule[] {
  return [
    {
      id: "scripture_public_seed_cache",
      label: "Scripture and public seed ids",
      rule: "Scripture references, public seed ids, and graph summary counts can be cached after sanitization.",
      required: true
    },
    {
      id: "no_raw_private_text",
      label: "No raw private text",
      rule: "Raw user input, user state, journal text, and debug payloads are not cached by default.",
      required: true
    },
    {
      id: "personalization_requires_consent",
      label: "Personalization requires consent",
      rule: "Personalization preview cache requires enabled non-session-only consent.",
      required: true
    },
    {
      id: "session_only_not_durable",
      label: "Session-only stays session-only",
      rule: "Session-only personalization must not become durable cache or hidden memory.",
      required: true
    },
    {
      id: "debug_not_cached",
      label: "Debug payloads excluded",
      rule: "Event batches, raw debug JSON, and confidence internals are not cached by default.",
      required: true
    },
    {
      id: "fallback_generic_only",
      label: "Fallback cache boundary",
      rule: "Fallback responses can be cached only as safe Scripture-grounded summaries.",
      required: true
    }
  ];
}

export function canCacheGraphSummary(graph: GraphVisualization): boolean {
  return graph.statistics.totalNodes > 0;
}

export function canCacheTigProductionResponse(
  response: TigProductionResponse,
  _consent?: TeoyubeMobileCacheConsent
): boolean {
  return Boolean(
    response.selection.scriptureAnchor &&
      response.safety.safe &&
      !response.safety.blocked &&
      (!response.fallback.used || response.fallback.reasons.length > 0)
  );
}

export function canCachePersonalizationPreview(
  preview: TeoyubePersonalizationPreviewResponse,
  consent?: TeoyubeMobileCacheConsent
): boolean {
  return Boolean(
    hasPersonalizationConsent(consent || preview.consent) &&
      preview.safety.safe &&
      !preview.safety.blocked &&
      preview.status !== "disabled" &&
      preview.status !== "blocked"
  );
}

export function sanitizeGraphSummaryForMobileCache(
  graph: GraphVisualization
): TeoyubeMobileCachedGraphSummary {
  return {
    type: "graph_summary",
    nodeCount: graph.statistics.totalNodes,
    edgeCount: graph.statistics.totalEdges,
    rootNodeIds: graph.nodes.filter((node) => node.root).map((node) => node.id),
    selectedNodeIds: graph.nodes.filter((node) => node.selected).map((node) => node.id),
    nodesByType: { ...graph.statistics.nodesByType },
    averageRelationshipStrength: graph.statistics.averageRelationshipStrength,
    averageConfidence: graph.statistics.averageConfidence
  };
}

export function sanitizeResponseForMobileCache(
  response: TigProductionResponse,
  consent?: TeoyubeMobileCacheConsent
): TeoyubeMobileCachedProductionResponse {
  const normalizedConsent = normalizeConsent(consent);

  return {
    type: "tig_production_response_summary",
    id: response.id,
    version: response.version,
    surface: response.input.surface || "unknown",
    intent: response.input.intent,
    selectedWordId: response.selection.teoyubeWord?.id,
    selectedPromiseClusterId: response.selection.promiseCluster?.id,
    selectedScriptureReference:
      typeof response.selection.scriptureAnchor?.metadata.reference === "string"
        ? response.selection.scriptureAnchor.metadata.reference
        : label(response.selection.scriptureAnchor),
    selectedPrayerSequenceId: response.selection.prayerSequence?.id,
    selectedActionStepId: response.selection.actionStep?.id,
    selectionLabels: unique([
      label(response.selection.teoyubeWord),
      label(response.selection.promiseCluster),
      label(response.selection.scriptureAnchor),
      label(response.selection.prayerSequence),
      label(response.selection.actionStep)
    ]),
    scriptureEvidence: [...response.explanation.scriptureEvidence],
    explanationSummary: response.explanation.summary,
    explanationPath: [...response.explanation.reasonPath],
    confidence: response.confidence,
    fallback: response.fallback,
    safety: response.safety,
    graphSummary: sanitizeGraphSummaryForMobileCache(response.visualization),
    generatedAt: response.generatedAt,
    cacheNotice: normalizedConsent.allowRawTextStorage
      ? "Raw text is still excluded from the Phase 7.3 mobile cache summary."
      : "Sanitized mobile cache summary excludes raw user text and debug payloads."
  };
}

export function sanitizePreviewForMobileCache(
  preview: TeoyubePersonalizationPreviewResponse,
  consent?: TeoyubeMobileCacheConsent
): TeoyubeMobileCachedPersonalizationPreview {
  const normalizedConsent = normalizeConsent(consent || preview.consent);

  return {
    type: "personalization_preview_summary",
    id: preview.id,
    status: preview.status,
    mode: preview.mode,
    preferenceHintsUsed: normalizedConsent.personalizationEnabled
      ? [...preview.preferenceHintsUsed]
      : [],
    comparisonSummary: preview.comparison.summary,
    confidenceComparison: preview.confidenceComparison,
    fallbackStatus: preview.fallbackStatus,
    safety: preview.safety,
    consentEnabled: normalizedConsent.personalizationEnabled,
    generatedAt: preview.generatedAt,
    cacheNotice:
      "Sanitized preview cache excludes raw user text, production input, and debug event payloads."
  };
}

export function getCachePrivacyWarnings(
  item: unknown,
  consent?: TeoyubeMobileCacheConsent
): string[] {
  const normalizedConsent = normalizeConsent(consent);
  const warnings: string[] = [];

  if (containsRawTextKey(item)) {
    warnings.push("Item appears to contain raw text fields and must be sanitized before caching.");
  }

  if (isPreview(item) && !hasPersonalizationConsent(consent || item.consent)) {
    warnings.push("Personalization preview cache is blocked because consent is disabled or session-only.");
  }

  if (normalizedConsent.sessionOnlyPersonalization) {
    warnings.push("Session-only personalization must not become durable cached memory.");
  }

  if (isProductionResponse(item) && item.safety.blocked) {
    warnings.push("Blocked production responses are not cacheable.");
  }

  if (isGraph(item) && !canCacheGraphSummary(item)) {
    warnings.push("Graph summary is empty and should not be cached.");
  }

  return warnings;
}

export function createCacheBoundaryReport(
  item: unknown,
  consent?: TeoyubeMobileCacheConsent
): TeoyubeMobileCacheBoundaryReport {
  const warnings = getCachePrivacyWarnings(item, consent);
  const cacheable = isProductionResponse(item)
    ? canCacheTigProductionResponse(item, consent)
    : isPreview(item)
      ? canCachePersonalizationPreview(item, consent)
      : isGraph(item)
        ? canCacheGraphSummary(item)
        : warnings.length === 0;
  const itemType = isProductionResponse(item)
    ? "tig_production_response"
    : isPreview(item)
      ? "personalization_preview"
      : isGraph(item)
        ? "graph"
        : "unknown";
  const status: TeoyubeCacheReadinessStatus = !cacheable
    ? warnings.some((warning) => warning.toLowerCase().includes("consent"))
      ? "blocked_by_consent"
      : "not_cacheable"
    : warnings.length
      ? "cache_with_sanitization"
      : "cache_safe";

  return {
    status,
    cacheable,
    sanitized: cacheable && itemType !== "unknown",
    itemType,
    warnings,
    rules: getMobileCacheBoundaryRules()
  };
}

export function sanitizeItemForMobileCache(
  item: unknown,
  consent?: TeoyubeMobileCacheConsent
):
  | TeoyubeMobileCachedProductionResponse
  | TeoyubeMobileCachedPersonalizationPreview
  | TeoyubeMobileCachedGraphSummary
  | undefined {
  if (isProductionResponse(item) && canCacheTigProductionResponse(item, consent)) {
    return sanitizeResponseForMobileCache(item, consent);
  }

  if (isPreview(item) && canCachePersonalizationPreview(item, consent)) {
    return sanitizePreviewForMobileCache(item, consent);
  }

  if (isGraph(item) && canCacheGraphSummary(item)) {
    return sanitizeGraphSummaryForMobileCache(item);
  }

  return undefined;
}
