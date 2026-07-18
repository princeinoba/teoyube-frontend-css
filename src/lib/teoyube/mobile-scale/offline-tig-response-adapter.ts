import {
  createAiCompanionTigProductionInput,
  createCallingCompassTigProductionInput,
  createCanonTigProductionInput,
  createDailyWordTigProductionInput,
  createOnboardingTigProductionInput,
  createPrayerTigProductionInput,
  createPromiseClusterTigProductionInput,
  createUnknownSurfaceTigProductionInput,
  runTigProductionForSurface,
  toTigExplanationPanelProps,
  toTigGraphPanelProps,
  toTigResponsePanelProps
} from "../../tig";
import type {
  TigProductionFallbackReason,
  TigProductionInput,
  TigProductionResponse,
  TigProductionSurface
} from "../../tig";
import type { TeoyubeMobileSurface } from "./mobile-scale-contracts";
import {
  createOfflineReadonlyResponseFallback,
  getOfflineReadinessWarnings
} from "./offline-readonly-strategy";

function mapSurface(surface: TeoyubeMobileSurface): TigProductionSurface {
  switch (surface) {
    case "canon":
      return "canon";
    case "daily_word":
      return "daily_word";
    case "prayer":
      return "prayer";
    case "calling_compass":
      return "calling_compass";
    case "promise_cluster":
    case "tig_response_panel":
    case "tig_graph_preview":
      return "promise_cluster";
    case "ai_companion":
      return "ai_companion";
    case "onboarding":
      return "onboarding";
    default:
      return "unknown";
  }
}

function createOfflineInput(surface: TeoyubeMobileSurface): TigProductionInput {
  const fallback = createOfflineReadonlyResponseFallback(surface);
  const params = {
    input: fallback.message,
    userState: "offline read-only Scripture fallback",
    emotion: "waiting",
    intent: "offline_readonly_scripture_fallback",
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting",
    context: {
      offline: true,
      readOnly: true,
      persistentStorage: false,
      surface
    }
  };

  switch (mapSurface(surface)) {
    case "canon":
      return createCanonTigProductionInput(params);
    case "daily_word":
      return createDailyWordTigProductionInput(params);
    case "prayer":
      return createPrayerTigProductionInput(params);
    case "calling_compass":
      return createCallingCompassTigProductionInput(params);
    case "promise_cluster":
      return createPromiseClusterTigProductionInput(params);
    case "ai_companion":
      return createAiCompanionTigProductionInput(params);
    case "onboarding":
      return createOnboardingTigProductionInput(params);
    default:
      return createUnknownSurfaceTigProductionInput(params);
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function uniqueFallbackReasons(
  values: TigProductionFallbackReason[]
): TigProductionFallbackReason[] {
  return [...new Set(values.filter(Boolean))];
}

export function getOfflineFallbackReason(surface: TeoyubeMobileSurface): string {
  return `Teoyube used a read-only Scripture fallback for ${surface} because live production, database, analytics, service worker, and persistent personalization systems are not required in Phase 7.3.`;
}

export function toOfflineSafeTigProductionResponse(
  surface: TeoyubeMobileSurface
): TigProductionResponse {
  const fallback = createOfflineReadonlyResponseFallback(surface);
  const response = runTigProductionForSurface(createOfflineInput(surface));
  const reason = getOfflineFallbackReason(surface);

  return {
    ...response,
    input: {
      ...response.input,
      input: fallback.message,
      userState: "offline read-only Scripture fallback",
      intent: "offline_readonly_scripture_fallback",
      context: {
        ...response.input.context,
        offline: true,
        readOnly: true,
        persistentStorage: false,
        serviceWorkerConnected: false
      }
    },
    explanation: {
      ...response.explanation,
      summary:
        "Teoyube is using an offline-safe Scripture fallback. The response remains Scripture-anchored, read-only, and explainable.",
      reasonPath: unique([
        ...fallback.explanationPath,
        ...response.explanation.reasonPath,
        reason
      ]),
      scriptureEvidence: unique([
        fallback.scriptureReference,
        ...response.explanation.scriptureEvidence
      ]),
      warnings: unique([
        ...response.explanation.warnings,
        ...fallback.warnings
      ])
    },
    fallback: {
      used: true,
      reasons: uniqueFallbackReasons([...response.fallback.reasons, "cache_miss"]),
      message:
        "Offline-safe fallback is active. This response uses local Scripture-grounded guidance and does not require live AI or storage.",
      appliedNodeIds: unique([
        ...response.fallback.appliedNodeIds,
        response.selection.scriptureAnchor?.id || "",
        response.selection.teoyubeWord?.id || "",
        response.selection.promiseCluster?.id || ""
      ])
    },
    safety: {
      ...response.safety,
      safe: true,
      blocked: false,
      status: response.safety.status === "blocked" ? "warning" : response.safety.status,
      warnings: unique([
        ...response.safety.warnings,
        ...getOfflineReadinessWarnings(surface)
      ]),
      violations: []
    },
    event: {
      ...response.event,
      eventName: "tig.offline.readonly.fallback",
      fallbackUsed: true,
      fallbackReason: "cache_miss",
      fallbackReasons: uniqueFallbackReasons([...response.event.fallbackReasons, "cache_miss"]),
      blocked: false,
      safetyStatus: "warning",
      metadata: {
        ...response.event.metadata,
        offlineFallback: true,
        readOnly: true,
        serviceWorkerConnected: false,
        persistentStorageConnected: false,
        externalAnalyticsConnected: false
      }
    },
    cacheKey: undefined
  };
}

export function toOfflineSafeTigResponsePanelProps(surface: TeoyubeMobileSurface) {
  return toTigResponsePanelProps(toOfflineSafeTigProductionResponse(surface));
}

export function toOfflineSafeGraphPreviewProps(surface: TeoyubeMobileSurface) {
  return toTigGraphPanelProps(toOfflineSafeTigProductionResponse(surface));
}

export function toOfflineSafeExplanationPath(surface: TeoyubeMobileSurface) {
  return toTigExplanationPanelProps(toOfflineSafeTigProductionResponse(surface));
}

export function isOfflineSafeTigResponse(response: TigProductionResponse): boolean {
  return Boolean(
    response.selection.scriptureAnchor &&
      response.fallback.used &&
      response.explanation.reasonPath.some((step) => step.toLowerCase().includes("offline")) &&
      response.safety.safe &&
      !response.safety.blocked
  );
}
