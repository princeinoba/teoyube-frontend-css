import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import { buildTigRecommendationCandidates } from "../tig/tig-candidate-builder";
import {
  runTigEndToEndRecommendation,
  runTigResponsePanelRecommendation
} from "../tig/tig-end-to-end-recommendation-flow";
import { createTigExplanationTraceReport } from "../tig/tig-explanation-trace";
import { createTigFallbackReport } from "../tig/tig-fallback-decision";
import { createTigRecommendationContext } from "../tig/tig-recommendation-context";
import { scoreTigRecommendationCandidate } from "../tig/tig-recommendation-scoring";
import { createTigScriptureAnchorValidationReport } from "../tig/tig-scripture-anchor-validation";
import { runTigRealDataQa } from "../tig/tig-real-data-qa-runner";

export type TeoyubePhase34ValidationSection = {
  id: string;
  valid: boolean;
  details: string;
  blockers: string[];
  warnings: string[];
};

export type TeoyubePhase34ValidationReport = {
  valid: boolean;
  status: "ready" | "ready_with_warnings" | "blocked";
  sections: TeoyubePhase34ValidationSection[];
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

function section(
  id: string,
  valid: boolean,
  details: string,
  blockers: string[] = [],
  warnings: string[] = []
): TeoyubePhase34ValidationSection {
  return { id, valid, details, blockers, warnings };
}

export function validateTigRecommendationContextBuilder(): TeoyubePhase34ValidationSection {
  const context = createTigRecommendationContext({ wordId: "Benor", query: "Benor", surface: "word_card" });
  const blockers = [
    !context.wordContext?.word.word ? "Context builder did not load word context." : undefined,
    !context.promiseContext.clusters.length ? "Context builder did not load Promise Engine context." : undefined,
    !context.scriptureAnchors.length ? "Context builder did not expose Scripture anchors." : undefined
  ].filter(Boolean) as string[];

  return section("tig_context_builder", blockers.length === 0, `Context builder exposed ${context.scriptureAnchors.length} Scripture anchor(s).`, blockers, context.warnings);
}

export function validateTigCandidateBuilder(): TeoyubePhase34ValidationSection {
  const context = createTigRecommendationContext({ query: "calling purpose", surface: "tig_response_panel" });
  const candidates = buildTigRecommendationCandidates(context);
  const blockers = [
    !candidates.length ? "Candidate builder returned no candidates." : undefined,
    !candidates.some((candidate) => candidate.type === "promise") ? "Candidate builder returned no Promise candidates." : undefined,
    !candidates.some((candidate) => candidate.scriptureAnchors.length) ? "Candidate builder returned no Scripture-anchored candidates." : undefined
  ].filter(Boolean) as string[];

  return section("tig_candidate_builder", blockers.length === 0, `Candidate builder returned ${candidates.length} candidate(s).`, blockers, candidates.flatMap((candidate) => candidate.warnings));
}

export function validateTigScoringAndConfidence(): TeoyubePhase34ValidationSection {
  const context = createTigRecommendationContext({ query: "calling purpose", surface: "tig_response_panel" });
  const candidate = buildTigRecommendationCandidates(context)[0];
  const confidence = candidate ? scoreTigRecommendationCandidate(candidate, context) : undefined;
  const blockers = [
    !candidate ? "No candidate available to score." : undefined,
    !confidence ? "Scoring did not return confidence." : undefined,
    confidence?.label === "insufficient_data" && candidate?.scriptureAnchors.length ? "Confidence label is too low for anchored candidate." : undefined
  ].filter(Boolean) as string[];

  return section("tig_scoring_confidence", blockers.length === 0, `Scoring returned ${confidence?.label || "no label"}.`, blockers);
}

export function validateTigScriptureAnchorValidation(): TeoyubePhase34ValidationSection {
  const result = runTigEndToEndRecommendation({ query: "calling purpose", surface: "tig_response_panel" });
  const report = createTigScriptureAnchorValidationReport([result]);

  return section("tig_scripture_anchor_validation", report.valid, `Scripture validation checked ${report.resultCount} result(s).`, report.blockers, report.warnings);
}

export function validateTigExplanationTrace(): TeoyubePhase34ValidationSection {
  const result = runTigEndToEndRecommendation({ query: "calling purpose", surface: "tig_response_panel" });
  const report = createTigExplanationTraceReport(result.explanationTrace);

  return section("tig_explanation_trace", report.valid, `Trace contains ${report.stepCount} user-visible step(s).`, report.blockers, report.warnings);
}

export function validateTigFallbackDecision(): TeoyubePhase34ValidationSection {
  const context = createTigRecommendationContext({ query: "zzzz unsupported ambiguous request", surface: "unknown" });
  const candidates = buildTigRecommendationCandidates(context);
  const report = createTigFallbackReport(context, candidates);

  return section("tig_fallback_decision", report.valid && Boolean(report.fallback.message), `Fallback used: ${report.used}.`, report.blockers, report.warnings);
}

export function validateTigUiAdapterConnection(): TeoyubePhase34ValidationSection {
  const word = createWordCardAdapterProps("Benor");
  const prayer = createPrayerCompanionAdapterContext({ message: "calling purpose prayer" });
  const compass = createCompassExperienceAdapterContext({ query: "calling purpose builder" });
  const response = createTigResponsePanelAdapterContext({ query: "calling", wordId: "Benor", mode: "promise" });
  const graph = createTigGraphExplorerAdapterContext({ searchQuery: "calling" });
  const blockers = [
    !word.tigRecommendation.explanationTrace.steps.length ? "WordCard adapter lacks TIG trace." : undefined,
    !prayer.tigRecommendation.explanationTrace.steps.length ? "Prayer adapter lacks TIG trace." : undefined,
    !compass.tigRecommendation.explanationTrace.steps.length ? "Compass adapter lacks TIG trace." : undefined,
    !response.panelData.explanationTrace.length ? "TIGResponsePanel adapter lacks TIG trace." : undefined,
    !graph.explanationTrace.length ? "TIGGraphExplorer adapter lacks TIG trace." : undefined
  ].filter(Boolean) as string[];

  return section("tig_ui_adapter_connection", blockers.length === 0, "All Phase 3 UI adapters expose Phase 3.4 TIG trace data.", blockers);
}

export function validateTigRealDataQa(): TeoyubePhase34ValidationSection {
  const report = runTigRealDataQa();
  return section("tig_real_data_qa", report.valid, `Real data QA ran ${report.scenarioCount} scenario(s).`, report.blockers, report.warnings);
}

export function validatePhase34TigEndToEndFlow(): TeoyubePhase34ValidationSection {
  const result = runTigResponsePanelRecommendation({ query: "calling purpose", wordId: "Benor" });
  const blockers = [
    !result.selectedCandidate ? "End-to-end flow did not select a candidate." : undefined,
    !result.explanationTrace.steps.length ? "End-to-end flow did not create explanation trace." : undefined,
    !result.confidence.label ? "End-to-end flow did not return confidence label." : undefined,
    result.noExternalServicesRequired !== true ? "End-to-end flow should not require external services." : undefined
  ].filter(Boolean) as string[];

  return section("phase_3_4_tig_end_to_end_flow", blockers.length === 0 && result.valid, `Selected ${result.selectedCandidate.label} with ${result.confidence.label}.`, [...blockers, ...result.blockers], result.warnings);
}

export function createPhase34TigEndToEndValidationReport(): TeoyubePhase34ValidationReport {
  const sections = [
    validateTigRecommendationContextBuilder(),
    validateTigCandidateBuilder(),
    validateTigScoringAndConfidence(),
    validateTigScriptureAnchorValidation(),
    validateTigExplanationTrace(),
    validateTigFallbackDecision(),
    validatePhase34TigEndToEndFlow(),
    validateTigUiAdapterConnection(),
    validateTigRealDataQa()
  ];
  const blockers = sections.flatMap((entry) => entry.blockers);
  const warnings = sections.flatMap((entry) => entry.warnings);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    sections,
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
