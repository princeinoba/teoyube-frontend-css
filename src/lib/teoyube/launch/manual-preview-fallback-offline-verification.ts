import type { TeoyubePostDeploymentQaSurface } from "./manual-preview-postdeployment-qa-contracts";

export type TeoyubePreviewFallbackOfflineResult = {
  id: string;
  surface: TeoyubePostDeploymentQaSurface;
  fallbackResponseNonEmpty?: boolean;
  fallbackScriptureAnchored?: boolean;
  fallbackIncludesExplanationPath?: boolean;
  fallbackConfidenceNotOverstated?: boolean;
  offlineSafeFallbackAvailable?: boolean;
  noLiveAiRequired?: boolean;
  noDatabaseRequired?: boolean;
  noExternalAnalyticsRequired?: boolean;
  notes?: string;
};

function blockersFor(result: TeoyubePreviewFallbackOfflineResult): string[] {
  return [
    result.fallbackResponseNonEmpty === false ? `${result.surface}: fallback response is empty.` : "",
    result.fallbackScriptureAnchored === false ? `${result.surface}: fallback is not Scripture-anchored.` : "",
    result.fallbackIncludesExplanationPath === false ? `${result.surface}: fallback lacks explanation path.` : "",
    result.fallbackConfidenceNotOverstated === false ? `${result.surface}: fallback overstates confidence.` : "",
    result.offlineSafeFallbackAvailable === false ? `${result.surface}: offline-safe fallback is unavailable.` : "",
    result.noLiveAiRequired === false ? `${result.surface}: fallback requires live AI.` : "",
    result.noDatabaseRequired === false ? `${result.surface}: fallback requires database persistence.` : "",
    result.noExternalAnalyticsRequired === false ? `${result.surface}: fallback requires external analytics.` : ""
  ].filter(Boolean);
}

export function getPreviewFallbackOfflineChecklist(): string[] {
  return [
    "Fallback response is never empty.",
    "Fallback remains Scripture-anchored.",
    "Fallback includes explanation path.",
    "Fallback does not overstate confidence.",
    "Offline-safe fallback is available as a safe path.",
    "No live AI is required for safe fallback.",
    "No database is required for safe fallback.",
    "No external analytics is required for safe fallback."
  ];
}

export function validatePreviewFallbackResult(result: TeoyubePreviewFallbackOfflineResult): boolean {
  return result.fallbackResponseNonEmpty !== false &&
    result.fallbackScriptureAnchored !== false &&
    result.fallbackIncludesExplanationPath !== false &&
    result.fallbackConfidenceNotOverstated !== false;
}

export function validatePreviewOfflineFallbackResult(result: TeoyubePreviewFallbackOfflineResult): boolean {
  return result.offlineSafeFallbackAvailable !== false &&
    result.noLiveAiRequired !== false &&
    result.noDatabaseRequired !== false &&
    result.noExternalAnalyticsRequired !== false;
}

export function getPreviewFallbackOfflineBlockers(
  results: TeoyubePreviewFallbackOfflineResult[] = []
): string[] {
  return results.flatMap(blockersFor);
}

export function getPreviewFallbackOfflineWarnings(
  results: TeoyubePreviewFallbackOfflineResult[] = []
): string[] {
  return [
    results.length === 0 ? "Fallback/offline verification results have not been recorded yet." : "",
    ...results
      .filter((result) => !result.notes)
      .map((result) => `${result.surface}: add brief fallback/offline manual QA notes before preview review.`)
  ].filter(Boolean);
}

export function createPreviewFallbackOfflineReport(
  results: TeoyubePreviewFallbackOfflineResult[] = []
) {
  const blockers = getPreviewFallbackOfflineBlockers(results);
  const warnings = getPreviewFallbackOfflineWarnings(results);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "needs_review" : "ready",
    checklist: getPreviewFallbackOfflineChecklist(),
    resultCount: results.length,
    blockers,
    warnings,
    results,
    noLiveAiRequired: results.every((result) => result.noLiveAiRequired !== false),
    noDatabaseRequired: results.every((result) => result.noDatabaseRequired !== false),
    noExternalAnalyticsRequired: results.every((result) => result.noExternalAnalyticsRequired !== false),
    generatedAt: new Date().toISOString()
  };
}
