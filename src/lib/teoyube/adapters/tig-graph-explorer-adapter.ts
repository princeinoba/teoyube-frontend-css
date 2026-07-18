import { getTIGSeedGraph, getTIGSeedSummary } from "../../tig";
import { createPromiseTable } from "../promises/promise-table";
import { runTigGraphExplorerRecommendation } from "../tig/tig-end-to-end-recommendation-flow";

export function createTigGraphExplorerAdapterContext(input: {
  selectedNodeId?: string;
  searchQuery?: string;
} = {}) {
  const graph = getTIGSeedGraph();
  const summary = getTIGSeedSummary();
  const promiseTable = createPromiseTable();
  const selectedNode = input.selectedNodeId
    ? graph.nodes.find((node) => node.id === input.selectedNodeId)
    : graph.nodes[0];
  const tigRecommendation = runTigGraphExplorerRecommendation({
    query: input.searchQuery || selectedNode?.title || selectedNode?.id || "TIG graph explorer",
    surface: "tig_graph_explorer"
  });

  return {
    component: "TIGGraphExplorer" as const,
    graphSummary: summary,
    selectedNode,
    searchQuery: input.searchQuery || "",
    promiseTablePreviewRows: promiseTable.rows.slice(0, 12),
    tigRecommendation,
    explanationTrace: tigRecommendation.explanationTrace.steps,
    traceRelationships: tigRecommendation.selectedCandidate.tigRelationshipIds,
    fallbackListMode: tigRecommendation.fallback.used || !selectedNode,
    safeForClientProps: true,
    noGraphMutation: true,
    noExternalFetch: true
  };
}
