import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";
import { buildTigRecommendationCandidates } from "../tig/tig-candidate-builder";
import {
  runTigEndToEndRecommendation
} from "../tig/tig-end-to-end-recommendation-flow";
import { createTigContextFromWord } from "../tig/tig-recommendation-context";
import { createTigFallbackReport } from "../tig/tig-fallback-decision";
import { scoreTigRecommendationCandidates } from "../tig/tig-recommendation-scoring";
import { validateTigCandidateScriptureAnchors } from "../tig/tig-scripture-anchor-validation";
import { runTigRealDataQa } from "../tig/tig-real-data-qa-runner";
import { runPhase34IntegrationAudit } from "../integration/phase-3-4-integration-audit";
import { createPhase34TigEndToEndValidationReport } from "../integration/phase-3-4-tig-end-to-end-validation";
import { runPhase34TigEndToEndRecommendationExample } from "./phase-3-4-tig-end-to-end-recommendation-example";

export type TeoyubePhase34SmokeCheckResult = {
  id: string;
  passed: boolean;
  details: string;
};

export type TeoyubePhase34SmokeCheckReport = {
  valid: boolean;
  checks: TeoyubePhase34SmokeCheckResult[];
  blockers: string[];
  generatedAt: string;
};

function check(id: string, passed: boolean, details: string): TeoyubePhase34SmokeCheckResult {
  return { id, passed, details };
}

export function runPhase34TigEndToEndRecommendationSmokeCheck(): TeoyubePhase34SmokeCheckReport {
  const context = createTigContextFromWord("Benor");
  const candidates = buildTigRecommendationCandidates(context);
  const scored = scoreTigRecommendationCandidates(candidates, context);
  const anchoredCandidate = candidates.find((candidate) => candidate.scriptureAnchors.length > 0);
  const scriptureCheck = anchoredCandidate ? validateTigCandidateScriptureAnchors(anchoredCandidate) : undefined;
  const fallbackReport = createTigFallbackReport(context, candidates);
  const recommendation = runTigEndToEndRecommendation({
    query: "calling purpose",
    wordId: "Benor",
    clusterId: "PC01",
    surface: "tig_response_panel"
  });
  const adapters = {
    word: createWordCardAdapterProps("Benor"),
    prayer: createPrayerCompanionAdapterContext({ message: "calling purpose prayer" }),
    compass: createCompassExperienceAdapterContext({ query: "calling purpose builder" }),
    responsePanel: createTigResponsePanelAdapterContext({ query: "calling purpose", wordId: "Benor", clusterId: "PC01" }),
    graphExplorer: createTigGraphExplorerAdapterContext({ searchQuery: "calling purpose" })
  };
  const realDataQa = runTigRealDataQa();
  const validation = createPhase34TigEndToEndValidationReport();
  const audit = runPhase34IntegrationAudit();
  const example = runPhase34TigEndToEndRecommendationExample();
  const checks = [
    check("contracts_compile", Boolean(recommendation.id && recommendation.context.query), "Contracts support structured recommendation result data."),
    check("context_builder_real_data", context.scriptureAnchors.length > 0 && Boolean(context.wordContext?.word.word), "Context builder works with real word data."),
    check("candidate_builder", candidates.length > 0, "Candidate builder returns candidates or safe fallback support."),
    check("scoring_confidence", scored.length > 0 && scored.every((entry) => Boolean(entry.confidence.label)), "Scoring returns bounded confidence labels."),
    check("scripture_validation", Boolean(scriptureCheck && scriptureCheck.valid), "Scripture validation checks anchored candidates."),
    check("explanation_trace", recommendation.explanationTrace.steps.length > 0 && recommendation.explanationTrace.safeForNormalUsers, "Explanation trace returns user-readable steps."),
    check("fallback_decision", Boolean(fallbackReport.fallback.message), "Fallback decision returns safe fallback report."),
    check("end_to_end_result", recommendation.valid && recommendation.selectedCandidate.scriptureAnchors.length > 0, "End-to-end recommendation flow returns structured result."),
    check(
      "ui_adapters_stable",
      Boolean(
        adapters.word.tigRecommendation.explanationTrace.steps.length &&
          adapters.prayer.tigRecommendation.explanationTrace.steps.length &&
          adapters.compass.tigRecommendation.explanationTrace.steps.length &&
          adapters.responsePanel.panelData.explanationTrace.length &&
          adapters.graphExplorer.explanationTrace.length
      ),
      "UI adapters return stable Phase 3.4 props."
    ),
    check("real_data_qa", realDataQa.valid && realDataQa.scenarioCount >= 5, "Real data QA returns structured report."),
    check("phase_3_4_audit", audit.completionPercentage === 100 && audit.nextStep === "Phase 3.5 - User Journey Integration, State Flow & Production UI Polish", "Phase 3.4 audit returns structured report."),
    check(
      "restricted_services_disabled",
      recommendation.noExternalServicesRequired &&
        recommendation.noDatabasePersistenceEnabled &&
        recommendation.noAnalyticsEnabled &&
        recommendation.noLiveAiOrchestrationEnabled &&
        recommendation.noBrowserPersistenceRequired,
      "No external services, database persistence, analytics, live AI orchestration, or browser persistence are required."
    ),
    check("validation_report", validation.valid, "Phase 3.4 validation report passes."),
    check("example_runs", example.audit.completionPercentage === audit.completionPercentage, "Phase 3.4 example runs.")
  ];
  const blockers = checks.filter((entry) => !entry.passed).map((entry) => `${entry.id}: ${entry.details}`);

  return {
    valid: blockers.length === 0,
    checks,
    blockers,
    generatedAt: new Date().toISOString()
  };
}
