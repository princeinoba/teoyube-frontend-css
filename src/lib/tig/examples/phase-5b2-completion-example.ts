import type {
  GraphVisualization,
  GraphVisualizationEdge,
  GraphVisualizationGroup,
  GraphVisualizationNode
} from "../graph-visualization";
import type { TigRecommendationPath } from "../intelligence-graph-engine";
import {
  buildTeoyubeIntelligenceGraph,
  explainTigSelection,
  selectBestTigPath
} from "../intelligence-graph-engine";
import { getTigGraphHealthReport } from "../intelligence-graph-validation";

function groupFromKind(kind: string): GraphVisualizationGroup {
  if (kind === "scripture") return "SCRIPTURE";
  if (kind === "promise_category") return "PROMISE";
  if (kind === "promise_cluster") return "PROMISE_CLUSTER";
  if (kind === "teoyube_word") return "WORD";
  if (kind === "emotion_profile") return "EMOTION";
  if (kind === "calling_archetype") return "CALLING";
  if (kind === "kingdom_journey" || kind === "kingdom_path") return "JOURNEY";
  if (kind === "prayer_sequence") return "PRAYER";
  if (kind === "reflection_prompt") return "REFLECTION";
  if (kind === "action_step") return "ACTION";
  if (kind === "growth_milestone") return "MILESTONE";
  if (kind === "ai_pathway") return "AI_PATTERN";
  return "UNKNOWN";
}

function buildVisualizationFromPath(path: TigRecommendationPath): GraphVisualization {
  const nodes: GraphVisualizationNode[] = path.nodes.map((node) => ({
    id: node.id,
    label: node.label,
    subtitle: node.kind,
    type: "UNKNOWN",
    group: groupFromKind(node.kind),
    importance: node.weight,
    selected: true,
    root: node.id === path.selectedNodes.emotion?.id || node.id === path.selectedNodes.scripture?.id,
    metadata: {
      kind: node.kind,
      scriptureRefs: node.scriptureRefs
    }
  }));

  const edges: GraphVisualizationEdge[] = path.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    relationshipType: edge.kind,
    strength: edge.weight,
    confidence: typeof edge.metadata.confidenceScore === "number" ? edge.metadata.confidenceScore : edge.weight,
    label: edge.label,
    highlighted: true
  }));

  const average = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

  return {
    nodes,
    edges,
    statistics: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodesByType: nodes.reduce<Record<string, number>>((counts, node) => {
        counts[node.group] = (counts[node.group] || 0) + 1;
        return counts;
      }, {}),
      averageRelationshipStrength: average(edges.map((edge) => edge.strength)),
      averageConfidence: average(edges.map((edge) => edge.confidence))
    }
  };
}

export function runPhase5B2CompletionExample() {
  const input = "I feel stuck and need God's promise for this season.";
  const graph = buildTeoyubeIntelligenceGraph();
  const health = getTigGraphHealthReport();
  const path = selectBestTigPath({
    input,
    mode: "promise_search",
    userState: "discouragement",
    emotionTags: ["discouragement", "waiting"]
  });
  const explanation = explainTigSelection({
    input,
    mode: "promise_search",
    userState: "discouragement",
    emotionTags: ["discouragement", "waiting"]
  });

  return {
    status: "Phase 5B.2 completion example",
    graphSummary: {
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length
    },
    health,
    recommendation: {
      input,
      word: path.selectedNodes.word,
      promiseCluster: path.selectedNodes.promiseCluster,
      scripture: path.selectedNodes.scripture,
      prayerSequence: path.selectedNodes.prayerSequence,
      actionStep: path.selectedNodes.actionStep,
      callingArchetype: path.selectedNodes.callingArchetype,
      kingdomJourney: path.selectedNodes.kingdomJourney,
      aiPathway: path.selectedNodes.aiPathway,
      scriptureEvidence: path.scriptureEvidence,
      reasonPath: path.reasonPath
    },
    confidence: path.confidenceBreakdown,
    explanation,
    visualization: buildVisualizationFromPath(path)
  };
}
