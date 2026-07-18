import { recommendCallingPath } from "../calling/calling-engine";
import { getDataHealthReport } from "../data/teoyube-data-access";
import { createWordCardContext } from "../language/teoyube-language-engine";
import { createPromiseRecommendationContext } from "../promises/promise-engine";
import { validateTheologyBoundaries } from "../theology/theology-framework";
import { runTigEndToEndRecommendation } from "../tig/tig-end-to-end-recommendation-flow";
import type {
  TeoyubeTigRecommendationInput,
  TeoyubeTigRecommendationResult,
  TeoyubeTigRecommendationSurface
} from "../tig/tig-recommendation-contracts";
import {
  attachJourneyFallback,
  attachJourneyExplanationTrace,
  attachJourneyRecommendation,
  clearSensitiveJourneyInput,
  createInitialUserJourneyState,
  createUserJourneyStateReport,
  transitionUserJourneyStage
} from "./user-journey-state";
import {
  createCompassExperienceJourneyPayload,
  createFallbackJourneyPayload,
  createPrayerCompanionJourneyPayload,
  createPromiseTableJourneyPayload,
  createTigGraphExplorerJourneyPayload,
  createTigResponsePanelJourneyPayload,
  createWordCardJourneyPayload
} from "./journey-surface-payloads";
import type {
  TeoyubeUserJourneyFallback,
  TeoyubeUserJourneyInput,
  TeoyubeUserJourneyRecommendation,
  TeoyubeUserJourneyStage,
  TeoyubeUserJourneyState,
  TeoyubeUserJourneySurface
} from "./user-journey-contracts";

function surfaceToTig(surface: TeoyubeUserJourneySurface): TeoyubeTigRecommendationSurface {
  const map: Record<TeoyubeUserJourneySurface, TeoyubeTigRecommendationSurface> = {
    home: "daily_word",
    canon: "canon",
    daily_word: "daily_word",
    word_card: "word_card",
    promise_table: "promise_table",
    prayer_companion: "prayer_companion",
    compass_experience: "compass_experience",
    tig_response_panel: "tig_response_panel",
    tig_graph_explorer: "tig_graph_explorer",
    consent_controls: "unknown",
    privacy_notice: "unknown",
    unknown: "unknown"
  };
  return map[surface] || "unknown";
}

function stageForResult(result: TeoyubeTigRecommendationResult): TeoyubeUserJourneyStage {
  if (result.fallback.used) return "fallback";
  if (result.selectedCandidate.type === "word") return "word_card";
  if (result.selectedCandidate.type === "promise") return "promise_cluster";
  if (result.selectedCandidate.type === "prayer") return "prayer_companion";
  if (result.selectedCandidate.type === "calling") return "calling_compass";
  if (result.selectedCandidate.type === "action_step") return "action_step";
  if (result.surface === "tig_graph_explorer") return "tig_graph";
  if (result.surface === "tig_response_panel") return "tig_response";
  return "review";
}

function first<T>(values: T[]): T | undefined {
  return values[0];
}

function toTigInput(input: TeoyubeUserJourneyInput = {}): TeoyubeTigRecommendationInput {
  return {
    query: input.query || input.safeDisplayLabel || input.wordId || input.clusterId || input.callingInput || input.prayerInput,
    wordId: input.wordId,
    clusterId: input.clusterId,
    callingInput: input.callingInput,
    prayerInput: input.prayerInput,
    actionInput: input.actionInput,
    surface: surfaceToTig(input.surface || "unknown"),
    context: {
      phase35Journey: true,
      sourceSurface: input.surface || "unknown"
    }
  };
}

function toJourneySurface(surface: TeoyubeTigRecommendationResult["surface"]): TeoyubeUserJourneySurface {
  if (surface === "word_card") return "word_card";
  if (surface === "prayer_companion" || surface === "prayer") return "prayer_companion";
  if (surface === "compass_experience" || surface === "calling") return "compass_experience";
  if (surface === "tig_response_panel") return "tig_response_panel";
  if (surface === "tig_graph_explorer") return "tig_graph_explorer";
  if (surface === "promise_table") return "promise_table";
  if (surface === "canon") return "canon";
  if (surface === "daily_word") return "daily_word";
  return "unknown";
}

function toJourneyRecommendation(result: TeoyubeTigRecommendationResult): TeoyubeUserJourneyRecommendation {
  return {
    id: result.id,
    surface: toJourneySurface(result.surface),
    selectedLabel: result.selectedCandidate.label,
    selectedType: result.selectedCandidate.type,
    wordId: first(result.selectedCandidate.relatedWordIds),
    clusterId: first(result.selectedCandidate.relatedPromiseClusterIds),
    scriptureAnchors: result.selectedCandidate.scriptureAnchors,
    explanationTrace: result.explanationTrace,
    explanationSteps: result.explanationTrace.steps,
    confidenceLabel: result.confidence.label,
    fallbackUsed: result.fallback.used,
    fallbackReason: result.fallback.used ? result.fallback.message : undefined,
    actionSteps: result.selectedCandidate.relatedActionIds,
    sourceResult: result
  };
}

function toJourneyFallback(
  state: TeoyubeUserJourneyState,
  result: TeoyubeTigRecommendationResult
): TeoyubeUserJourneyFallback {
  return {
    used: result.fallback.used,
    stage: result.fallback.used ? "fallback" : state.stage,
    surface: toJourneySurface(result.surface),
    reason: result.fallback.reasons.join("; ") || result.fallback.message,
    message: result.fallback.message,
    scriptureAnchors: result.fallback.scriptureAnchors,
    safe: result.fallback.safe
  };
}

export function runUserJourneyRecommendation(
  input: TeoyubeUserJourneyInput = {}
): TeoyubeTigRecommendationResult {
  const tigInput = toTigInput(input);
  return runTigEndToEndRecommendation(tigInput);
}

export function createUserJourney(input: TeoyubeUserJourneyInput = {}): TeoyubeUserJourneyState {
  const initial = createInitialUserJourneyState(input);
  const result = runUserJourneyRecommendation(input);
  const recommendation = toJourneyRecommendation(result);
  const withRecommendation = attachJourneyRecommendation(initial, recommendation);
  const withTrace = attachJourneyExplanationTrace(withRecommendation, result.explanationTrace);
  const withFallback = attachJourneyFallback(withTrace, toJourneyFallback(withTrace, result));
  const transitioned = transitionUserJourneyStage(withFallback, stageForResult(result));
  const dataHealth = getDataHealthReport();
  const theology = validateTheologyBoundaries({
    scriptureReferences: transitioned.scriptureAnchors,
    explanationPath: result.explanationTrace.steps.map((entry) => entry.summary),
    text: recommendation.selectedLabel
  });

  return clearSensitiveJourneyInput({
    ...transitioned,
    tigInput: toTigInput({ ...input, query: undefined, prayerInput: undefined, callingInput: undefined, actionInput: undefined }),
    warnings: [
      ...transitioned.warnings,
      ...dataHealth.warnings.slice(0, 3).map((message) => ({
        id: `data_health_${message.slice(0, 12).replace(/[^a-z0-9]/gi, "_")}`,
        surface: transitioned.surface,
        message
      })),
      ...theology.warnings.map((message) => ({
        id: `theology_warning_${message.slice(0, 12).replace(/[^a-z0-9]/gi, "_")}`,
        surface: transitioned.surface,
        message
      }))
    ],
    blockers: [
      ...transitioned.blockers,
      ...result.blockers.map((message) => ({
        id: `tig_blocker_${message.slice(0, 12).replace(/[^a-z0-9]/gi, "_")}`,
        surface: transitioned.surface,
        message
      })),
      ...theology.blockers.map((message) => ({
        id: `theology_blocker_${message.slice(0, 12).replace(/[^a-z0-9]/gi, "_")}`,
        surface: transitioned.surface,
        message
      }))
    ]
  });
}

export function createJourneyFromWord(wordId: string): TeoyubeUserJourneyState {
  createWordCardContext(wordId);
  return createUserJourney({ wordId, query: wordId, surface: "word_card", stage: "word_card" });
}

export function createJourneyFromPromiseCluster(clusterId: string): TeoyubeUserJourneyState {
  createPromiseRecommendationContext({ clusterId });
  return createUserJourney({ clusterId, query: clusterId, surface: "promise_table", stage: "promise_cluster" });
}

export function createJourneyFromCallingInput(input: string): TeoyubeUserJourneyState {
  recommendCallingPath({ query: input });
  return createUserJourney({ callingInput: input, query: input, surface: "compass_experience", stage: "calling_compass" });
}

export function createJourneyFromPrayerInput(input: string): TeoyubeUserJourneyState {
  return createUserJourney({ prayerInput: input, query: input, surface: "prayer_companion", stage: "prayer_companion" });
}

export function createJourneySurfacePayload(
  state: TeoyubeUserJourneyState,
  surface: TeoyubeUserJourneySurface
) {
  if (surface === "word_card" || surface === "daily_word") return createWordCardJourneyPayload(state);
  if (surface === "prayer_companion") return createPrayerCompanionJourneyPayload(state);
  if (surface === "compass_experience") return createCompassExperienceJourneyPayload(state);
  if (surface === "tig_response_panel") return createTigResponsePanelJourneyPayload(state);
  if (surface === "tig_graph_explorer") return createTigGraphExplorerJourneyPayload(state);
  if (surface === "promise_table" || surface === "canon") return createPromiseTableJourneyPayload(state);
  return createFallbackJourneyPayload(state);
}

export function createUserJourneyReport(state: TeoyubeUserJourneyState) {
  return createUserJourneyStateReport(state);
}

export function getUserJourneyBlockers(state: TeoyubeUserJourneyState): string[] {
  return createUserJourneyStateReport(state).blockers.map((entry) => entry.message);
}

export function getUserJourneyWarnings(state: TeoyubeUserJourneyState): string[] {
  return createUserJourneyStateReport(state).warnings.map((entry) => entry.message);
}
