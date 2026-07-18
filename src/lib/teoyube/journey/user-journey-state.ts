import type {
  TeoyubeUserJourneyFallback,
  TeoyubeUserJourneyInput,
  TeoyubeUserJourneyRecommendation,
  TeoyubeUserJourneyStage,
  TeoyubeUserJourneyState,
  TeoyubeUserJourneyStep,
  TeoyubeUserJourneySurface,
  TeoyubeUserJourneyTransition,
  TeoyubeUserJourneyWarning,
  TeoyubeUserJourneyBlocker,
  TeoyubeUserJourneyReport
} from "./user-journey-contracts";
import type { TeoyubeTigExplanationTrace } from "../tig/tig-recommendation-contracts";

function now(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())).map((value) => value.trim()))];
}

function summarizeInput(input: TeoyubeUserJourneyInput = {}): string {
  if (input.safeDisplayLabel) return input.safeDisplayLabel;
  if (input.wordId) return `Word journey for ${input.wordId}`;
  if (input.clusterId) return `Promise Cluster journey for ${input.clusterId}`;
  if (input.retainInputForDisplay && input.query) return input.query.slice(0, 120);
  if (input.query || input.prayerInput || input.callingInput || input.actionInput) {
    return `Local ${input.surface || "Teoyube"} input received for Scripture-grounded guidance`;
  }
  return "Default Teoyube journey";
}

function sanitizeInput(input: TeoyubeUserJourneyInput = {}): TeoyubeUserJourneyInput {
  return {
    wordId: input.wordId,
    clusterId: input.clusterId,
    stage: input.stage,
    surface: input.surface,
    safeDisplayLabel: input.safeDisplayLabel,
    retainInputForDisplay: false,
    context: input.context ? { phase35Context: true } : undefined
  };
}

function warning(message: string, surface: TeoyubeUserJourneySurface): TeoyubeUserJourneyWarning {
  return { id: id("journey_warning"), surface, message };
}

function blocker(message: string, surface: TeoyubeUserJourneySurface): TeoyubeUserJourneyBlocker {
  return { id: id("journey_blocker"), surface, message };
}

function initialStep(state: TeoyubeUserJourneyState): TeoyubeUserJourneyStep {
  return {
    id: id("journey_step"),
    stage: state.stage,
    surface: state.surface,
    label: "Journey started",
    summary: state.inputSummary,
    scriptureAnchors: [],
    explanationPath: ["Journey state initialized in memory only."],
    fallbackUsed: false,
    visibleToUser: true
  };
}

export function createInitialUserJourneyState(
  input: TeoyubeUserJourneyInput = {}
): TeoyubeUserJourneyState {
  const createdAt = now();
  const state: TeoyubeUserJourneyState = {
    id: id("teoyube_journey"),
    stage: input.stage || "entry",
    surface: input.surface || "unknown",
    input: sanitizeInput(input),
    inputSummary: summarizeInput(input),
    sensitiveInputCleared: true,
    steps: [],
    transitions: [],
    scriptureAnchors: [],
    warnings: [],
    blockers: [],
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    createdAt,
    updatedAt: createdAt
  };

  return {
    ...state,
    steps: [initialStep(state)]
  };
}

export function updateUserJourneyState(
  state: TeoyubeUserJourneyState,
  update: Partial<TeoyubeUserJourneyState>
): TeoyubeUserJourneyState {
  return {
    ...state,
    ...update,
    input: update.input ? sanitizeInput(update.input) : state.input,
    scriptureAnchors: unique([...(state.scriptureAnchors || []), ...((update.scriptureAnchors || []) as string[])]),
    warnings: update.warnings || state.warnings,
    blockers: update.blockers || state.blockers,
    sensitiveInputCleared: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    updatedAt: now()
  };
}

export function transitionUserJourneyStage(
  state: TeoyubeUserJourneyState,
  nextStage: TeoyubeUserJourneyStage
): TeoyubeUserJourneyState {
  const transition: TeoyubeUserJourneyTransition = {
    id: id("journey_transition"),
    from: state.stage,
    to: nextStage,
    reason: `Moved from ${state.stage} to ${nextStage}.`,
    createdAt: now()
  };

  return updateUserJourneyState(state, {
    stage: nextStage,
    transitions: [...state.transitions, transition]
  });
}

export function attachJourneyRecommendation(
  state: TeoyubeUserJourneyState,
  recommendation: TeoyubeUserJourneyRecommendation
): TeoyubeUserJourneyState {
  const step: TeoyubeUserJourneyStep = {
    id: id("journey_recommendation_step"),
    stage: state.stage,
    surface: recommendation.surface,
    label: recommendation.selectedLabel,
    summary: `${recommendation.selectedLabel} selected with ${recommendation.confidenceLabel.replace(/_/g, " ")} confidence.`,
    scriptureAnchors: recommendation.scriptureAnchors,
    explanationPath: recommendation.explanationSteps.map((entry) => entry.summary),
    confidenceLabel: recommendation.confidenceLabel,
    fallbackUsed: recommendation.fallbackUsed,
    fallbackReason: recommendation.fallbackReason,
    visibleToUser: true
  };

  return updateUserJourneyState(state, {
    recommendation,
    explanationTrace: recommendation.explanationTrace,
    confidenceLabel: recommendation.confidenceLabel,
    scriptureAnchors: recommendation.scriptureAnchors,
    steps: [...state.steps, step]
  });
}

export function attachJourneyExplanationTrace(
  state: TeoyubeUserJourneyState,
  trace: TeoyubeTigExplanationTrace
): TeoyubeUserJourneyState {
  return updateUserJourneyState(state, {
    explanationTrace: trace,
    scriptureAnchors: unique([...state.scriptureAnchors, ...trace.scriptureAnchors])
  });
}

export function attachJourneyFallback(
  state: TeoyubeUserJourneyState,
  fallback: TeoyubeUserJourneyFallback
): TeoyubeUserJourneyState {
  return updateUserJourneyState(state, {
    fallback,
    stage: fallback.used ? "fallback" : state.stage,
    scriptureAnchors: unique([...state.scriptureAnchors, ...fallback.scriptureAnchors])
  });
}

export function clearSensitiveJourneyInput(state: TeoyubeUserJourneyState): TeoyubeUserJourneyState {
  return updateUserJourneyState(state, {
    input: sanitizeInput(state.input),
    sensitiveInputCleared: true
  });
}

export function validateUserJourneyState(state: TeoyubeUserJourneyState) {
  const blockers = [
    !state.inMemoryOnly ? blocker("Journey state must remain in memory only.", state.surface) : undefined,
    !state.sensitiveInputCleared ? blocker("Journey state still contains raw sensitive input.", state.surface) : undefined,
    state.noBrowserPersistenceRequired !== true ? blocker("Journey state must not require browser persistence.", state.surface) : undefined,
    state.noExternalServicesRequired !== true ? blocker("Journey state must not require external services.", state.surface) : undefined
  ].filter(Boolean) as TeoyubeUserJourneyBlocker[];
  const warnings = [
    state.scriptureAnchors.length === 0 ? warning("Journey state has no Scripture anchors yet.", state.surface) : undefined,
    !state.explanationTrace ? warning("Journey state has no attached explanation trace yet.", state.surface) : undefined,
    !state.confidenceLabel ? warning("Journey state has no confidence label yet.", state.surface) : undefined
  ].filter(Boolean) as TeoyubeUserJourneyWarning[];

  return {
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function createUserJourneyStateReport(state: TeoyubeUserJourneyState): TeoyubeUserJourneyReport {
  const validation = validateUserJourneyState(state);

  return {
    valid: validation.valid,
    stateId: state.id,
    stage: state.stage,
    surface: state.surface,
    stepCount: state.steps.length,
    transitionCount: state.transitions.length,
    scriptureAnchorCount: state.scriptureAnchors.length,
    explanationTraceStepCount: state.explanationTrace?.steps.length || 0,
    fallbackUsed: Boolean(state.fallback?.used || state.recommendation?.fallbackUsed),
    confidenceLabel: state.confidenceLabel,
    warnings: [...state.warnings, ...validation.warnings],
    blockers: [...state.blockers, ...validation.blockers],
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}
