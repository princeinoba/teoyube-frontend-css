import type {
  AnyTIGNode,
  TIGID,
  TIGRelationshipType,
  TIGTraversalPath,
  TIGTraversalResult
} from "./types";
import { getTIGSeedGraph } from "./seed";
import { traverseTIGGraph } from "./traverse";

type TIGTraversalDemoParams = {
  startNodeIds?: TIGID[];
  maxDepth?: number;
  allowedRelationshipTypes?: TIGRelationshipType[];
  minStrength?: number;
  minConfidence?: number;
  limit?: number;
};

type TIGTraversalPathWithMetrics = TIGTraversalPath & {
  totalStrength?: number;
  averageConfidence?: number;
};

type TIGRankedTraversalNode = TIGTraversalResult<AnyTIGNode>["rankedNodes"][number] & {
  score?: number;
};

type TIGTraversalRuntimeOptions = {
  startNodeIds: TIGID[];
  maxDepth: number;
  allowedRelationshipTypes?: TIGRelationshipType[];
  minStrength: number;
  minConfidence: number;
  limit: number;
  direction: "both";
  includeStartNodes: true;
};

export const TIG_TRAVERSAL_DEMO_START_NODES: TIGID[] = [
  "emotion_fear",
  "emotion_discouragement",
  "emotion_waiting",
  "promise_strength",
  "promise_purpose",
  "cluster_courage_through_presence",
  "scripture_joshua_1_9",
  "journey_waiting_to_renewal",
  "calling_builder"
];

export function runTIGTraversalDemo(
  params: TIGTraversalDemoParams = {}
): TIGTraversalResult<AnyTIGNode> {
  const graph = getTIGSeedGraph();
  const options: TIGTraversalRuntimeOptions = {
    startNodeIds: params.startNodeIds || ["emotion_fear"],
    maxDepth: params.maxDepth ?? 3,
    allowedRelationshipTypes: params.allowedRelationshipTypes,
    minStrength: params.minStrength ?? 0.75,
    minConfidence: params.minConfidence ?? 0.75,
    limit: params.limit ?? 30,
    direction: "both",
    includeStartNodes: true
  };

  return traverseTIGGraph({
    nodes: graph.nodes,
    relationships: graph.relationships,
    options
  });
}

export function runFearToCourageTraversalDemo(): TIGTraversalResult<AnyTIGNode> {
  return runTIGTraversalDemo({
    startNodeIds: ["emotion_fear"],
    maxDepth: 4,
    minStrength: 0.75,
    minConfidence: 0.75,
    limit: 40
  });
}

export function runWaitingToRenewalTraversalDemo(): TIGTraversalResult<AnyTIGNode> {
  return runTIGTraversalDemo({
    startNodeIds: ["emotion_waiting"],
    maxDepth: 4,
    minStrength: 0.75,
    minConfidence: 0.75,
    limit: 40
  });
}

export function runPurposeToCallingTraversalDemo(): TIGTraversalResult<AnyTIGNode> {
  return runTIGTraversalDemo({
    startNodeIds: ["promise_purpose"],
    maxDepth: 4,
    minStrength: 0.72,
    minConfidence: 0.72,
    limit: 40
  });
}

export function summarizeTraversalResult(result: TIGTraversalResult<AnyTIGNode>) {
  const paths = result.paths as TIGTraversalPathWithMetrics[];
  const relationshipIds = new Set(paths.flatMap((path) => path.relationships));

  return {
    startNodeIds: result.startNodeIds,
    resultCount: result.rankedNodes.length,
    relationshipCount: relationshipIds.size,
    topNodes: result.rankedNodes.map((rankedNode) => {
      const rankedTraversalNode = rankedNode as TIGRankedTraversalNode;

      return {
        id: rankedNode.node.id,
        title: rankedNode.node.title,
        type: rankedNode.node.type,
        score: rankedTraversalNode.score ?? 0,
        rank: rankedNode.rank
      };
    }),
    paths: paths.map((path) => ({
      depth: path.depth,
      nodeIds: path.nodes,
      relationshipIds: path.relationships,
      totalStrength: path.totalStrength ?? 0,
      averageConfidence: path.averageConfidence ?? 0
    }))
  };
}
