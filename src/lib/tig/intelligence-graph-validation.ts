import type { TigRecommendationPath } from "./intelligence-graph-engine";
import {
  buildTeoyubeIntelligenceGraph,
  selectBestTigPath
} from "./intelligence-graph-engine";
import type { TigSeedNodeKind } from "./intelligence-graph-seeds";

export type TigGraphValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    nodeCount: number;
    edgeCount: number;
    nodeCountsByKind: Record<string, number>;
  };
};

export type TigRecommendationPathValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type TigGraphHealthReport = TigGraphValidationResult & {
  recommendationPath: TigRecommendationPathValidationResult;
  status: "healthy" | "needs_attention";
};

const REQUIRED_KINDS: TigSeedNodeKind[] = [
  "scripture",
  "teoyube_word",
  "promise_cluster",
  "emotion_profile",
  "calling_archetype",
  "prayer_sequence",
  "kingdom_journey",
  "action_step",
  "ai_pathway"
];

const CRITICAL_CONNECTED_KINDS: TigSeedNodeKind[] = [
  "scripture",
  "promise_cluster",
  "prayer_sequence",
  "kingdom_journey",
  "action_step",
  "ai_pathway"
];

function countByKind(kindCounts: Record<string, number>, kind: string): Record<string, number> {
  return {
    ...kindCounts,
    [kind]: (kindCounts[kind] || 0) + 1
  };
}

function hasDuplicate(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });

  return [...duplicates];
}

export function validateTigRecommendationPath(
  path: TigRecommendationPath
): TigRecommendationPathValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!path.nodes.length) {
    errors.push("Recommendation path does not include any selected nodes.");
  }

  if (!path.reasonPath.length) {
    errors.push("Recommendation path does not include an explainable reason path.");
  }

  if (!path.selectedNodes.scripture) {
    errors.push("Recommendation path does not include a selected Scripture node.");
  }

  if (!path.scriptureEvidence.length) {
    errors.push("Recommendation path does not include Scripture evidence.");
  }

  if (path.selectedNodes.promiseCluster && !path.reasonPath.length) {
    errors.push("Promise cluster was selected without a reason path.");
  }

  if (path.selectedNodes.prayerSequence && !path.reasonPath.length) {
    errors.push("Prayer sequence was selected without a reason path.");
  }

  if (path.selectedNodes.actionStep && !path.reasonPath.length) {
    errors.push("Action step was selected without a reason path.");
  }

  if (!path.selectedNodes.aiPathway) {
    warnings.push("Recommendation path does not include an AI response pathway seed.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateTigSeedGraph(): TigGraphValidationResult {
  const graph = buildTeoyubeIntelligenceGraph();
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeCountsByKind = graph.nodes.reduce<Record<string, number>>(
    (counts, node) => countByKind(counts, node.kind),
    {}
  );

  if (!graph.nodes.length) {
    errors.push("TIG seed graph has no normalized nodes.");
  }

  if (!graph.edges.length) {
    errors.push("TIG seed graph has no normalized edges.");
  }

  const duplicateNodeIds = hasDuplicate(graph.nodes.map((node) => node.id));
  duplicateNodeIds.forEach((id) => errors.push(`Duplicate TIG seed node id: ${id}`));

  const duplicateEdgeIds = hasDuplicate(graph.edges.map((edge) => edge.id));
  duplicateEdgeIds.forEach((id) => errors.push(`Duplicate TIG seed edge id: ${id}`));

  graph.nodes.forEach((node) => {
    if (!node.id) errors.push("TIG seed node is missing id.");
    if (!node.kind) errors.push(`TIG seed node ${node.id} is missing kind.`);
    if (!node.label) errors.push(`TIG seed node ${node.id} is missing label.`);
    if (node.weight < 0 || node.weight > 1) {
      errors.push(`TIG seed node ${node.id} has weight outside 0-1.`);
    }
  });

  graph.edges.forEach((edge) => {
    if (!edge.id) errors.push("TIG seed edge is missing id.");
    if (!edge.source) errors.push(`TIG seed edge ${edge.id} is missing source.`);
    if (!edge.target) errors.push(`TIG seed edge ${edge.id} is missing target.`);
    if (edge.source && !graph.nodeMap.has(edge.source)) {
      errors.push(`TIG seed edge ${edge.id} references missing source node ${edge.source}.`);
    }
    if (edge.target && !graph.nodeMap.has(edge.target)) {
      errors.push(`TIG seed edge ${edge.id} references missing target node ${edge.target}.`);
    }
    if (edge.weight < 0 || edge.weight > 1) {
      errors.push(`TIG seed edge ${edge.id} has weight outside 0-1.`);
    }
  });

  REQUIRED_KINDS.forEach((kind) => {
    if (!nodeCountsByKind[kind]) {
      errors.push(`TIG seed graph is missing required node kind: ${kind}.`);
    }
  });

  graph.nodes
    .filter((node) => node.kind === "promise_cluster")
    .forEach((node) => {
      const hasScriptureAnchor =
        node.scriptureRefs.length > 0 ||
        (graph.adjacency.get(node.id) || []).some((edge) => {
          const otherNodeId = edge.source === node.id ? edge.target : edge.source;
          return graph.nodeMap.get(otherNodeId)?.kind === "scripture";
        });

      if (!hasScriptureAnchor) {
        errors.push(`Promise cluster ${node.id} does not have a Scripture anchor.`);
      }
    });

  graph.nodes
    .filter((node) => CRITICAL_CONNECTED_KINDS.includes(node.kind))
    .forEach((node) => {
      if (!(graph.adjacency.get(node.id) || []).length) {
        errors.push(`Critical TIG node ${node.id} (${node.kind}) is orphaned.`);
      }
    });

  graph.nodes
    .filter((node) => node.kind === "ai_pathway")
    .forEach((node) => {
      const hasTrace =
        node.scriptureRefs.length > 0 ||
        (graph.adjacency.get(node.id) || []).some((edge) => edge.evidence.length > 0);

      if (!hasTrace) {
        errors.push(`AI response pathway ${node.id} does not include a traceable evidence path.`);
      }
    });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      nodeCountsByKind
    }
  };
}

export function getTigGraphHealthReport(): TigGraphHealthReport {
  const seedValidation = validateTigSeedGraph();
  const recommendationPath = validateTigRecommendationPath(
    selectBestTigPath({
      input: "I feel stuck and need God's promise for this season.",
      mode: "promise_search"
    })
  );
  const valid = seedValidation.valid && recommendationPath.valid;
  const errors = [...seedValidation.errors, ...recommendationPath.errors];
  const warnings = [...seedValidation.warnings, ...recommendationPath.warnings];

  return {
    ...seedValidation,
    valid,
    errors,
    warnings,
    recommendationPath,
    status: valid ? "healthy" : "needs_attention"
  };
}
