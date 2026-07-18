import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";
import { buildTigRecommendationCandidates } from "../tig/tig-candidate-builder";
import {
  runTigEndToEndRecommendation,
  createTigEndToEndRecommendationReport
} from "../tig/tig-end-to-end-recommendation-flow";
import {
  createTigContextFromPromiseCluster,
  createTigContextFromWord
} from "../tig/tig-recommendation-context";
import { createTigFallbackReport } from "../tig/tig-fallback-decision";
import { scoreTigRecommendationCandidates } from "../tig/tig-recommendation-scoring";
import { runTigRealDataQa } from "../tig/tig-real-data-qa-runner";
import { createPhase34TigEndToEndValidationReport } from "../integration/phase-3-4-tig-end-to-end-validation";
import { runPhase34IntegrationAudit } from "../integration/phase-3-4-integration-audit";

export function runPhase34TigEndToEndRecommendationExample() {
  const wordContext = createTigContextFromWord("Benor");
  const promiseContext = createTigContextFromPromiseCluster("PC01");
  const candidates = buildTigRecommendationCandidates(wordContext);
  const scoredCandidates = scoreTigRecommendationCandidates(candidates, wordContext);
  const recommendation = runTigEndToEndRecommendation({
    wordId: "Benor",
    clusterId: "PC01",
    query: "calling purpose",
    surface: "tig_response_panel"
  });
  const fallbackReport = createTigFallbackReport(wordContext, candidates);
  const responsePanelProps = createTigResponsePanelAdapterContext({
    query: "calling purpose",
    wordId: "Benor",
    clusterId: "PC01",
    mode: "promise"
  });
  const graphExplorerProps = createTigGraphExplorerAdapterContext({
    searchQuery: "calling purpose"
  });
  const realDataQa = runTigRealDataQa();
  const validation = createPhase34TigEndToEndValidationReport();
  const audit = runPhase34IntegrationAudit();

  return {
    wordContext,
    promiseContext,
    candidates,
    scoredCandidates,
    recommendation,
    explanationTrace: recommendation.explanationTrace,
    fallbackReport,
    responsePanelProps,
    graphExplorerProps,
    realDataQa,
    validation,
    audit,
    report: createTigEndToEndRecommendationReport({
      query: "calling purpose",
      wordId: "Benor",
      clusterId: "PC01",
      surface: "tig_response_panel"
    })
  };
}
