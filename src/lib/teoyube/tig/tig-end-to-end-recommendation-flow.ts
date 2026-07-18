import {
  buildTigRecommendationCandidates,
  validateTigRecommendationCandidates
} from "./tig-candidate-builder";
import {
  createTigRecommendationContext,
  validateTigRecommendationContext
} from "./tig-recommendation-context";
import type {
  TeoyubeTigExplanationTrace,
  TeoyubeTigRecommendationCandidate,
  TeoyubeTigRecommendationInput,
  TeoyubeTigRecommendationResult
} from "./tig-recommendation-contracts";
import {
  createTigExplanationTrace,
  validateTigExplanationTrace
} from "./tig-explanation-trace";
import {
  createTigFallbackReport
} from "./tig-fallback-decision";
import {
  rankTigRecommendationCandidates,
  scoreTigRecommendationCandidate,
  validateTigConfidenceSafety
} from "./tig-recommendation-scoring";
import { validateTigCandidateScriptureAnchors } from "./tig-scripture-anchor-validation";
import { validateTheologyBoundaries } from "../theology/theology-framework";

function createResultId(): string {
  return `phase34_tig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function placeholderTrace(id: string): TeoyubeTigExplanationTrace {
  return {
    id: `trace_${id}`,
    surface: "unknown",
    summary: "Trace pending.",
    steps: [],
    scriptureAnchors: [],
    fallbackUsed: false,
    confidenceLabel: "insufficient_data",
    safeForNormalUsers: true
  };
}

function selectCandidate(
  candidates: TeoyubeTigRecommendationCandidate[],
  fallbackCandidate?: TeoyubeTigRecommendationCandidate
): TeoyubeTigRecommendationCandidate {
  if (fallbackCandidate) return fallbackCandidate;
  return candidates[0] || {
    id: "fallback:empty_candidate",
    type: "prayer",
    label: "Scripture-grounded fallback",
    description: "Use safe fallback framing because no candidate was available.",
    scriptureAnchors: [],
    relatedWordIds: [],
    relatedPromiseClusterIds: [],
    relatedCallingIds: [],
    relatedPrayerIds: [],
    relatedActionIds: [],
    tigNodeIds: [],
    tigRelationshipIds: [],
    source: "safe_fallback",
    reasons: [],
    explanationPath: ["No candidate was available, so fallback framing is required."],
    warnings: ["No candidate was available."],
    fallbackEligible: false
  };
}

export function runTigEndToEndRecommendation(
  input: TeoyubeTigRecommendationInput = {}
): TeoyubeTigRecommendationResult {
  const context = createTigRecommendationContext(input);
  const contextValidation = validateTigRecommendationContext(context);
  const builtCandidates = buildTigRecommendationCandidates(context);
  const candidateValidation = validateTigRecommendationCandidates(builtCandidates);
  const rankedCandidates = rankTigRecommendationCandidates(builtCandidates, context);
  const fallbackReport = createTigFallbackReport(context, rankedCandidates);
  const selectedCandidate = selectCandidate(rankedCandidates, fallbackReport.candidate);
  const confidence = scoreTigRecommendationCandidate(selectedCandidate, context);
  const confidenceSafety = validateTigConfidenceSafety(selectedCandidate);
  const scriptureAnchorCheck = validateTigCandidateScriptureAnchors(selectedCandidate);
  const theology = validateTheologyBoundaries({
    scriptureReferences: selectedCandidate.scriptureAnchors,
    explanationPath: selectedCandidate.explanationPath,
    text: `${selectedCandidate.label} ${selectedCandidate.description}`
  });
  const id = createResultId();
  const baseResult: TeoyubeTigRecommendationResult = {
    id,
    input,
    surface: context.surface,
    context,
    selectedCandidate,
    candidates: rankedCandidates,
    confidence,
    scriptureAnchorCheck,
    explanationTrace: placeholderTrace(id),
    fallback: fallbackReport.fallback,
    valid: false,
    blockers: [],
    warnings: [],
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
  const explanationTrace = createTigExplanationTrace(baseResult, context);
  const traceValidation = validateTigExplanationTrace(explanationTrace);
  const blockers = [
    ...contextValidation.blockers,
    ...candidateValidation.blockers,
    ...scriptureAnchorCheck.blockers,
    ...confidenceSafety.blockers,
    ...theology.blockers,
    ...fallbackReport.blockers,
    ...traceValidation.blockers
  ];
  const warnings = [
    ...contextValidation.warnings,
    ...candidateValidation.warnings,
    ...scriptureAnchorCheck.warnings,
    ...confidenceSafety.warnings,
    ...theology.warnings,
    ...fallbackReport.warnings,
    ...traceValidation.warnings
  ];

  return {
    ...baseResult,
    explanationTrace,
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function runTigWordRecommendation(input: TeoyubeTigRecommendationInput = {}) {
  return runTigEndToEndRecommendation({
    ...input,
    surface: input.surface || "word_card",
    wordId: input.wordId || input.query
  });
}

export function runTigPromiseRecommendation(input: TeoyubeTigRecommendationInput = {}) {
  return runTigEndToEndRecommendation({
    ...input,
    surface: input.surface || "promise_table",
    clusterId: input.clusterId || input.query
  });
}

export function runTigPrayerRecommendation(input: TeoyubeTigRecommendationInput = {}) {
  return runTigEndToEndRecommendation({
    ...input,
    surface: input.surface || "prayer",
    prayerInput: input.prayerInput || input.query
  });
}

export function runTigCallingRecommendation(input: TeoyubeTigRecommendationInput = {}) {
  return runTigEndToEndRecommendation({
    ...input,
    surface: input.surface || "calling",
    callingInput: input.callingInput || input.query
  });
}

export function runTigActionStepRecommendation(input: TeoyubeTigRecommendationInput = {}) {
  return runTigEndToEndRecommendation({
    ...input,
    surface: input.surface || "calling",
    actionInput: input.actionInput || input.query
  });
}

export function runTigResponsePanelRecommendation(input: TeoyubeTigRecommendationInput = {}) {
  return runTigEndToEndRecommendation({
    ...input,
    surface: input.surface || "tig_response_panel"
  });
}

export function runTigGraphExplorerRecommendation(input: TeoyubeTigRecommendationInput = {}) {
  return runTigEndToEndRecommendation({
    ...input,
    surface: input.surface || "tig_graph_explorer"
  });
}

export function createTigEndToEndRecommendationReport(input: TeoyubeTigRecommendationInput = {}) {
  const result = runTigEndToEndRecommendation(input);
  return {
    valid: result.valid,
    surface: result.surface,
    selectedCandidateId: result.selectedCandidate.id,
    selectedCandidateType: result.selectedCandidate.type,
    confidence: result.confidence,
    scriptureAnchorCount: result.selectedCandidate.scriptureAnchors.length,
    explanationTraceStepCount: result.explanationTrace.steps.length,
    fallbackUsed: result.fallback.used,
    blockers: result.blockers,
    warnings: result.warnings,
    noExternalServicesRequired: true as const,
    noDatabasePersistenceEnabled: true as const,
    noAnalyticsEnabled: true as const,
    noLiveAiOrchestrationEnabled: true as const,
    noBrowserPersistenceRequired: true as const,
    generatedAt: new Date().toISOString()
  };
}
