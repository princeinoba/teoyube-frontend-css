import type {
  TeoyubeCacheStrategy,
  TeoyubeMobileSurface,
  TeoyubeOfflineStrategy
} from "./mobile-scale-contracts";

export function getTeoyubeMobileCacheStrategy(): TeoyubeCacheStrategy {
  return {
    id: "phase_7_mobile_cache_strategy",
    label: "Phase 7 Mobile Cache Strategy",
    status: "planned",
    cacheTargets: [
      "TIG seed graph snapshots",
      "Scripture-anchored production responses",
      "UI-ready graph summaries",
      "read-only devotional surfaces",
      "safe local export bundles"
    ],
    invalidationRules: [
      "Invalidate personalization preview cache when consent changes.",
      "Invalidate response cache when seed graph version changes.",
      "Clear preference-derived cache on reset or delete requests.",
      "Never cache raw sensitive user text by default."
    ],
    consentBoundaries: [
      "Session-only personalization must not become durable cache.",
      "Preference hints may be cached only as sanitized structured hints when consent allows it.",
      "Reset, export, and delete controls must clear or expose cached personalized data."
    ],
    privacyRules: [
      "No hidden long-term memory.",
      "No raw sensitive text storage.",
      "No service worker implementation in Phase 7.4.",
      "No localStorage, cookies, IndexedDB, files, or database writes are added by this readiness layer."
    ],
    implementationNote:
      "This module defines cache boundaries only. It does not implement browser storage or service workers."
  };
}

export function getTeoyubeOfflineReadOnlyStrategy(): TeoyubeOfflineStrategy {
  return {
    id: "phase_7_offline_read_only_strategy",
    label: "Offline Read-Only Devotional Strategy",
    status: "planned",
    readOnlySurfaces: [
      "daily_word",
      "prayer",
      "promise_cluster",
      "tig_response_panel",
      "onboarding"
    ],
    cacheableData: [
      "Scripture references",
      "safe production response summaries",
      "seed graph metadata",
      "saved local export bundles when user initiates export"
    ],
    blockedWhenOffline: [
      "live AI orchestration",
      "external analytics sending",
      "production database writes",
      "new persistent personalization writes"
    ],
    fallbackBehavior:
      "Show the last safe Scripture-anchored response or a local Scripture fallback with a clear offline notice.",
    safetyRules: getOfflineSafetyRules(),
    implementationNote:
      "Offline mode is a future read-only strategy. Phase 7.4 does not add a service worker or storage implementation."
  };
}

export function getSurfaceCacheRecommendation(surface: TeoyubeMobileSurface): string {
  switch (surface) {
    case "daily_word":
      return "Cache one read-only daily Scripture response and refresh when online.";
    case "promise_cluster":
    case "ai_companion":
      return "Cache only Scripture-anchored production summaries; do not cache raw user input.";
    case "tig_graph_preview":
      return "Cache compact graph summaries rather than full visual state.";
    case "personalization_controls":
    case "feedback_controls":
    case "personalization_preview":
      return "Cache nothing durable unless explicit consent and reset/delete paths are active.";
    default:
      return "Prefer read-only seed and Scripture metadata cache boundaries.";
  }
}

export function getPersonalizationCacheBoundaryRules(): string[] {
  return [
    "Do not persist session-only personalization.",
    "Do not cache raw user text.",
    "Do not cache medical, legal, financial, emergency, or other sensitive free text.",
    "Cache preference hints only as sanitized structured values and only when consent allows it.",
    "Clear personalized cache on disable, reset, delete, or consent downgrade.",
    "Never let cached personalization replace Scripture anchoring."
  ];
}

export function getOfflineSafetyRules(): string[] {
  return [
    "Offline responses must clearly identify read-only or cached state.",
    "Offline fallback must remain Scripture anchored.",
    "Offline mode must not imply live guidance, live AI, or live pastoral review.",
    "Emergency, medical, legal, and financial guardrails must remain visible.",
    "Offline mode must not queue hidden personalization writes."
  ];
}
