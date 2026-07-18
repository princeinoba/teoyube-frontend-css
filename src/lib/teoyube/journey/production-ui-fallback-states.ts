import { getScriptureCanonData } from "../data/teoyube-data-access";
import type {
  TeoyubeUserJourneyFallback,
  TeoyubeUserJourneyInput,
  TeoyubeUserJourneyStage,
  TeoyubeUserJourneySurface
} from "./user-journey-contracts";

export type TeoyubeProductionUiFallbackState = TeoyubeUserJourneyFallback & {
  id: string;
  label: string;
  action: string;
  mobileSummary: string;
  confidenceLabel: "fallback" | "needs_review";
};

export type TeoyubeProductionUiFallbackReport = {
  valid: boolean;
  fallbacks: TeoyubeProductionUiFallbackState[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

function firstAnchor(): string[] {
  return getScriptureCanonData().find((entry) => entry.scriptureReferences.length)?.scriptureReferences.slice(0, 1) || [];
}

function fallbackState(
  id: string,
  label: string,
  stage: TeoyubeUserJourneyStage,
  surface: TeoyubeUserJourneySurface,
  reason: string,
  message: string,
  action: string,
  anchors: string[] = firstAnchor()
): TeoyubeProductionUiFallbackState {
  return {
    id,
    used: true,
    stage,
    surface,
    reason,
    message,
    scriptureAnchors: anchors,
    safe: true,
    label,
    action,
    mobileSummary: `${label}: ${message}`,
    confidenceLabel: "fallback"
  };
}

export function createMissingWordFallbackState(): TeoyubeProductionUiFallbackState {
  return fallbackState(
    "missing_word",
    "Word needs review",
    "word_card",
    "word_card",
    "The requested Teoyube word was not found directly.",
    "Use the closest Scripture-grounded word context and keep the missing-word warning visible.",
    "Choose another word or review the Canon before treating this as guidance."
  );
}

export function createMissingPromiseFallbackState(): TeoyubeProductionUiFallbackState {
  return fallbackState(
    "missing_promise",
    "Promise support needs review",
    "promise_cluster",
    "promise_table",
    "No direct Promise Cluster was available.",
    "Show a Scripture-grounded fallback and avoid unsupported promise language.",
    "Review real Promise Cluster data before continuing."
  );
}

export function createMissingScriptureFallbackState(): TeoyubeProductionUiFallbackState {
  return fallbackState(
    "missing_scripture",
    "Scripture anchor needs review",
    "review",
    "canon",
    "No Scripture anchor was found for this surface.",
    "Pause recommendation language and show a review-safe Scripture-aware fallback.",
    "Restore a real Scripture anchor before public recommendation use.",
    []
  );
}

export function createMissingCallingFallbackState(): TeoyubeProductionUiFallbackState {
  return fallbackState(
    "missing_calling",
    "Calling path needs review",
    "calling_compass",
    "compass_experience",
    "No calling path matched with enough support.",
    "Frame calling guidance as reflection only and avoid certainty claims.",
    "Invite the user to review Scripture, gifts, burdens, and one faithful action."
  );
}

export function createMissingPrayerFallbackState(): TeoyubeProductionUiFallbackState {
  return fallbackState(
    "missing_prayer",
    "Prayer support needs review",
    "prayer_companion",
    "prayer_companion",
    "No prayer context matched with enough support.",
    "Use a humble Scripture-grounded prayer fallback without storing the user's need.",
    "Ask the user to continue with a broad Scripture reflection."
  );
}

export function createTigIncompleteTraceFallbackState(): TeoyubeProductionUiFallbackState {
  return fallbackState(
    "tig_incomplete_trace",
    "Explanation trace incomplete",
    "tig_response",
    "tig_response_panel",
    "The recommendation trace is incomplete.",
    "Show a visible explanation warning and use safe fallback framing.",
    "Review trace steps before presenting this as a connected recommendation."
  );
}

export function createLowConfidenceFallbackState(): TeoyubeProductionUiFallbackState {
  return fallbackState(
    "low_confidence",
    "Confidence is limited",
    "fallback",
    "unknown",
    "Confidence is too low for a strong recommendation.",
    "Present the result as reflective support rather than direction.",
    "Use a Scripture anchor and invite review."
  );
}

export function createProductionUiFallbackReport(
  input: TeoyubeUserJourneyInput = {}
): TeoyubeProductionUiFallbackReport {
  const fallbacks = [
    createMissingWordFallbackState(),
    createMissingPromiseFallbackState(),
    createMissingScriptureFallbackState(),
    createMissingCallingFallbackState(),
    createMissingPrayerFallbackState(),
    createTigIncompleteTraceFallbackState(),
    createLowConfidenceFallbackState()
  ];
  const blockers = fallbacks
    .filter((entry) => !entry.message || !entry.safe)
    .map((entry) => `${entry.id} is not safe for public fallback display.`);
  const warnings = [
    input.surface ? `Fallback report scoped for ${input.surface}.` : "Fallback report generated for all production UI surfaces.",
    ...fallbacks
      .filter((entry) => entry.scriptureAnchors.length === 0)
      .map((entry) => `${entry.id} has no direct Scripture anchor and must remain a review state.`)
  ];

  return {
    valid: blockers.length === 0,
    fallbacks,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}
