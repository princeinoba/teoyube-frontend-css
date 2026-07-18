import type { TeoyubeMobileSurface } from "./mobile-scale-contracts";
import type { TeoyubeOfflineReadinessStatus } from "./performance-optimization-contracts";

export type TeoyubeOfflineReadonlyFallback = {
  surface: TeoyubeMobileSurface;
  status: TeoyubeOfflineReadinessStatus;
  title: string;
  message: string;
  scriptureReference: string;
  scriptureText: string;
  teoyubeWord: string;
  promiseSummary: string;
  prayer: string;
  actionStep: string;
  explanationPath: string[];
  warnings: string[];
};

export type TeoyubeOfflineReadonlyStrategy = {
  id: string;
  label: string;
  status: TeoyubeOfflineReadinessStatus;
  safeSurfaces: TeoyubeMobileSurface[];
  contentTypes: string[];
  personalizationBoundaryRules: string[];
  implementationNote: string;
};

const OFFLINE_SAFE_SURFACES: TeoyubeMobileSurface[] = [
  "daily_word",
  "prayer",
  "promise_cluster",
  "tig_response_panel",
  "onboarding",
  "ai_companion"
];

const OFFLINE_SAFE_CONTENT_TYPES = [
  "Scripture references",
  "KJV Scripture text from local seeds",
  "safe Teoyube word labels",
  "promise cluster summaries",
  "read-only prayer text",
  "read-only reflection prompts",
  "gentle action steps",
  "explanation path summaries"
];

function normalizeSurface(surface: TeoyubeMobileSurface): TeoyubeMobileSurface {
  return surface || "unknown";
}

export function getOfflineSafeSurfaces(): TeoyubeMobileSurface[] {
  return [...OFFLINE_SAFE_SURFACES];
}

export function getOfflineSafeDevotionalContentTypes(): string[] {
  return [...OFFLINE_SAFE_CONTENT_TYPES];
}

export function getOfflinePersonalizationBoundaryRules(): string[] {
  return [
    "Offline mode must not create hidden long-term personalization.",
    "Offline mode must not write raw private text to localStorage, cookies, IndexedDB, files, or databases.",
    "Session-only personalization must remain session-only.",
    "Personalized offline content must be read-only unless future consent and persistence controls are connected.",
    "Consent controls should remain visible when the UI surface exists."
  ];
}

export function getOfflineReadonlyStrategy(): TeoyubeOfflineReadonlyStrategy {
  return {
    id: "phase_7_3_offline_readonly_strategy",
    label: "Phase 7.3 Offline Read-Only Scripture Strategy",
    status: "offline_safe",
    safeSurfaces: getOfflineSafeSurfaces(),
    contentTypes: getOfflineSafeDevotionalContentTypes(),
    personalizationBoundaryRules: getOfflinePersonalizationBoundaryRules(),
    implementationNote:
      "Phase 7.3 defines read-only offline-safe structures only. It does not add a service worker, persistent offline cache, database, or background sync."
  };
}

export function getOfflineReadinessWarnings(surface: TeoyubeMobileSurface): string[] {
  const warnings = [
    "Offline response is read-only and does not imply live AI, live pastoral review, or server sync.",
    "Offline mode does not connect a database or external analytics provider.",
    "Raw personal text is not cached for offline use in Phase 7.3."
  ];

  if (!OFFLINE_SAFE_SURFACES.includes(surface)) {
    warnings.push(`${surface} is not a primary offline-safe surface yet and should use a generic fallback.`);
  }

  return warnings;
}

export function createOfflineReadonlyResponseFallback(
  surface: TeoyubeMobileSurface
): TeoyubeOfflineReadonlyFallback {
  const safeSurface = normalizeSurface(surface);

  return {
    surface: safeSurface,
    status: OFFLINE_SAFE_SURFACES.includes(safeSurface) ? "offline_safe" : "fallback_required",
    title: "Offline Scripture Fallback",
    message:
      "Teoyube is using a read-only Scripture fallback. This does not require live AI, database access, or personalized memory.",
    scriptureReference: "Isaiah 40:31",
    scriptureText:
      "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
    teoyubeWord: "strength",
    promiseSummary:
      "God renews strength for those who wait on Him, and this promise can support prayer, reflection, and a gentle next step.",
    prayer:
      "Father, anchor me in Your Word while I wait. Renew my strength, guide my next faithful step, and keep my heart steady in Your presence.",
    actionStep:
      "Read Isaiah 40:31 slowly and write one sentence about where you need renewed strength today.",
    explanationPath: [
      "Offline-safe fallback selected because live services may be unavailable.",
      "The response remains anchored in Scripture.",
      "No raw personal text, database write, or hidden personalization is required.",
      "The action step is gentle, practical, and reversible."
    ],
    warnings: getOfflineReadinessWarnings(safeSurface)
  };
}

export function createOfflineScriptureAnchoredFallback(
  surface: TeoyubeMobileSurface
): TeoyubeOfflineReadonlyFallback {
  return createOfflineReadonlyResponseFallback(surface);
}
