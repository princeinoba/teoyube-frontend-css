import type {
  GraphVisualization,
  TigProductionExplanation,
  TigProductionResponse
} from "../../tig";
import type {
  TeoyubeGraphRenderBudget,
  TeoyubeMobileRenderBudget,
  TeoyubePerformanceCheck,
  TeoyubePerformanceOptimizationReport,
  TeoyubePerformanceRiskLevel,
  TeoyubeResponseSizeBudget,
  TeoyubeRuntimeCostEstimate
} from "./performance-optimization-contracts";

export type TigResponsePerformanceBudget = {
  response: TeoyubeResponseSizeBudget;
  graph: TeoyubeGraphRenderBudget;
  mobile: TeoyubeMobileRenderBudget;
};

export type TigGraphRenderCostEstimate = {
  nodeCount: number;
  edgeCount: number;
  highlightedNodeCount: number;
  renderedLabelCount: number;
  estimatedRenderUnits: number;
  shouldDefer: boolean;
  riskLevel: TeoyubePerformanceRiskLevel;
  warnings: string[];
};

function byteSizeKb(value: unknown): number {
  const seen = new WeakSet<object>();
  const stack: unknown[] = [value ?? null];
  let estimatedChars = 0;
  let visited = 0;
  const maxVisited = 5000;

  while (stack.length > 0 && visited < maxVisited) {
    const current = stack.pop();
    visited += 1;

    if (current === null || current === undefined) {
      estimatedChars += 4;
      continue;
    }

    const currentType = typeof current;

    if (currentType === "string") {
      estimatedChars += String(current).length + 2;
      continue;
    }

    if (currentType === "number" || currentType === "boolean" || currentType === "bigint") {
      estimatedChars += String(current).length;
      continue;
    }

    if (currentType !== "object") {
      estimatedChars += 8;
      continue;
    }

    const objectValue = current as Record<string, unknown>;

    if (seen.has(objectValue)) {
      estimatedChars += 10;
      continue;
    }

    seen.add(objectValue);

    if (Array.isArray(objectValue)) {
      estimatedChars += 2 + Math.max(0, objectValue.length - 1);
      for (const item of objectValue) {
        stack.push(item);
      }
      continue;
    }

    const entries = Object.entries(objectValue);
    estimatedChars += 2 + Math.max(0, entries.length - 1);

    for (const [key, nestedValue] of entries) {
      estimatedChars += key.length + 3;
      stack.push(nestedValue);
    }
  }

  if (stack.length > 0) {
    estimatedChars += stack.length * 10;
  }

  return Number(((estimatedChars * 2) / 1024).toFixed(2));
}

function riskFromRatio(ratio: number): TeoyubePerformanceRiskLevel {
  if (!Number.isFinite(ratio)) return "unknown";
  if (ratio <= 0.75) return "low";
  if (ratio <= 1) return "medium";
  if (ratio <= 1.4) return "high";
  return "critical";
}

function maxRisk(values: TeoyubePerformanceRiskLevel[]): TeoyubePerformanceRiskLevel {
  const order: TeoyubePerformanceRiskLevel[] = ["low", "medium", "high", "critical", "unknown"];
  return values.reduce<TeoyubePerformanceRiskLevel>((current, value) => {
    if (value === "unknown") return current;
    return order.indexOf(value) > order.indexOf(current) ? value : current;
  }, "low");
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function getSelectedCardCount(response: TigProductionResponse): number {
  return [
    response.selection.teoyubeWord,
    response.selection.promiseCluster,
    response.selection.scriptureAnchor,
    response.selection.prayerSequence,
    response.selection.actionStep,
    response.selection.callingArchetype,
    response.selection.kingdomJourney,
    response.selection.aiPathway
  ].filter(Boolean).length;
}

function check(params: {
  id: string;
  label: string;
  metric: number;
  budget: number;
  unit: string;
  details: string;
  suggestions: string[];
}): TeoyubePerformanceCheck {
  const passed = params.metric <= params.budget;
  const riskLevel = riskFromRatio(params.metric / Math.max(1, params.budget));

  return {
    id: params.id,
    label: params.label,
    status: passed ? "within_budget" : "over_budget",
    riskLevel,
    passed,
    metric: params.metric,
    budget: params.budget,
    unit: params.unit,
    details: params.details,
    warnings: passed ? [] : [`${params.label} is above the Phase 7.3 mobile budget.`],
    suggestions: params.suggestions
  };
}

export function getDefaultTigResponseSizeBudget(): TigResponsePerformanceBudget {
  return {
    response: {
      maxSerializedKb: 96,
      maxEventPayloadKb: 16,
      maxDebugPayloadKb: 48,
      maxRenderedCards: 18,
      maxExplanationSteps: 8,
      maxPersonalizationComparisonItems: 8
    },
    graph: {
      maxNodes: 35,
      maxEdges: 48,
      maxHighlightedNodes: 10,
      maxRenderedLabels: 18,
      deferAboveNodes: 16,
      deferAboveEdges: 24
    },
    mobile: {
      maxCardsBeforeCollapse: 10,
      maxPrimarySections: 5,
      maxDeferredSections: 4,
      minTouchTargetPx: 44,
      debugHiddenByDefault: true,
      graphDeferredByDefault: true
    }
  };
}

export function estimateTigGraphRenderCost(
  graph: GraphVisualization,
  budget: TeoyubeGraphRenderBudget = getDefaultTigResponseSizeBudget().graph
): TigGraphRenderCostEstimate {
  const highlightedNodeCount = graph.nodes.filter((node) => node.selected || node.root).length;
  const renderedLabelCount = Math.min(graph.nodes.length, budget.maxRenderedLabels);
  const estimatedRenderUnits = graph.nodes.length * 2 + graph.edges.length * 3 + renderedLabelCount;
  const warnings = unique([
    graph.nodes.length > budget.maxNodes ? "Graph node count is above the mobile render budget." : "",
    graph.edges.length > budget.maxEdges ? "Graph edge count is above the mobile render budget." : "",
    highlightedNodeCount > budget.maxHighlightedNodes ? "Highlighted graph nodes may crowd mobile labels." : "",
    graph.nodes.length > budget.deferAboveNodes || graph.edges.length > budget.deferAboveEdges
      ? "Graph preview should be deferred or collapsed on mobile."
      : ""
  ]);
  const riskLevel = maxRisk([
    riskFromRatio(graph.nodes.length / Math.max(1, budget.maxNodes)),
    riskFromRatio(graph.edges.length / Math.max(1, budget.maxEdges)),
    warnings.length ? "medium" : "low"
  ]);

  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    highlightedNodeCount,
    renderedLabelCount,
    estimatedRenderUnits,
    shouldDefer: graph.nodes.length > budget.deferAboveNodes || graph.edges.length > budget.deferAboveEdges,
    riskLevel,
    warnings
  };
}

export function estimateExplanationPathRenderCost(
  explanationPath: TigProductionExplanation | string[]
): {
  stepCount: number;
  estimatedRenderUnits: number;
  shouldCollapse: boolean;
  warnings: string[];
} {
  const path = Array.isArray(explanationPath)
    ? explanationPath
    : explanationPath.reasonPath;
  const maxSteps = getDefaultTigResponseSizeBudget().response.maxExplanationSteps;

  return {
    stepCount: path.length,
    estimatedRenderUnits: path.length * 2,
    shouldCollapse: path.length > 4,
    warnings: path.length > maxSteps
      ? ["Explanation path is long and should be collapsed by default on mobile."]
      : []
  };
}

export function estimateTigProductionResponseSize(
  response: TigProductionResponse
): TeoyubeRuntimeCostEstimate {
  const budget = getDefaultTigResponseSizeBudget();
  const graphCost = estimateTigGraphRenderCost(response.visualization, budget.graph);
  const explanationCost = estimateExplanationPathRenderCost(response.explanation);
  const renderedCardCount =
    getSelectedCardCount(response) +
    Math.min(response.explanation.reasonPath.length, 4) +
    (response.fallback.used ? 1 : 0) +
    (response.safety.warnings.length || response.safety.violations.length ? 1 : 0);
  const eventPayloadKb = byteSizeKb({
    event: response.event,
    eventBatch: response.eventBatch || []
  });
  const debugPayloadKb = byteSizeKb({
    confidence: response.confidence,
    event: response.event,
    eventBatch: response.eventBatch || [],
    selectedNodeIds: response.explanation.selectedNodeIds,
    selectedEdgeIds: response.explanation.selectedEdgeIds
  });
  const estimatedSerializedKb = byteSizeKb(response);
  const personalizationComparisonItemCount = Array.isArray(response.event.metadata?.comparisonItems)
    ? response.event.metadata.comparisonItems.length
    : 0;
  const warnings = unique([
    estimatedSerializedKb > budget.response.maxSerializedKb ? "Production response payload is above the mobile size budget." : "",
    eventPayloadKb > budget.response.maxEventPayloadKb ? "Event payload should stay debug-only or compact before analytics connection." : "",
    debugPayloadKb > budget.response.maxDebugPayloadKb ? "Debug payload should stay hidden by default." : "",
    renderedCardCount > budget.response.maxRenderedCards ? "Rendered card count may create long mobile scroll." : "",
    ...graphCost.warnings,
    ...explanationCost.warnings
  ]);
  const mobileRenderRisk = maxRisk([
    riskFromRatio(estimatedSerializedKb / budget.response.maxSerializedKb),
    riskFromRatio(eventPayloadKb / budget.response.maxEventPayloadKb),
    riskFromRatio(debugPayloadKb / budget.response.maxDebugPayloadKb),
    riskFromRatio(renderedCardCount / budget.response.maxRenderedCards),
    graphCost.riskLevel
  ]);

  return {
    responseId: response.id,
    estimatedSerializedKb,
    eventPayloadKb,
    debugPayloadKb,
    graphNodeCount: response.visualization.statistics.totalNodes,
    graphEdgeCount: response.visualization.statistics.totalEdges,
    explanationPathLength: response.explanation.reasonPath.length,
    renderedCardCount,
    personalizationComparisonItemCount,
    estimatedRenderUnits:
      graphCost.estimatedRenderUnits + explanationCost.estimatedRenderUnits + renderedCardCount,
    mobileRenderRisk,
    warnings
  };
}

export function validateTigResponsePerformanceBudget(
  response: TigProductionResponse,
  budget: TigResponsePerformanceBudget = getDefaultTigResponseSizeBudget()
): {
  valid: boolean;
  checks: TeoyubePerformanceCheck[];
} {
  const estimate = estimateTigProductionResponseSize(response);
  const checks = [
    check({
      id: "response_serialized_size",
      label: "Response serialized size",
      metric: estimate.estimatedSerializedKb,
      budget: budget.response.maxSerializedKb,
      unit: "KB",
      details: "Measures the total response object size.",
      suggestions: ["Defer debug payloads.", "Render graph summaries before full graph details."]
    }),
    check({
      id: "graph_node_count",
      label: "Graph node count",
      metric: estimate.graphNodeCount,
      budget: budget.graph.maxNodes,
      unit: "nodes",
      details: "Measures how many graph nodes the mobile UI may render.",
      suggestions: ["Show compact path nodes first.", "Collapse the expanded graph."]
    }),
    check({
      id: "graph_edge_count",
      label: "Graph edge count",
      metric: estimate.graphEdgeCount,
      budget: budget.graph.maxEdges,
      unit: "edges",
      details: "Measures how many graph relationships the mobile UI may render.",
      suggestions: ["Hide edge labels on mobile.", "Use a graph summary for small screens."]
    }),
    check({
      id: "explanation_path_length",
      label: "Explanation path length",
      metric: estimate.explanationPathLength,
      budget: budget.response.maxExplanationSteps,
      unit: "steps",
      details: "Measures how many explanation steps appear in the path.",
      suggestions: ["Collapse longer paths.", "Show a short mobile explanation first."]
    }),
    check({
      id: "event_payload_size",
      label: "Event payload size",
      metric: estimate.eventPayloadKb,
      budget: budget.response.maxEventPayloadKb,
      unit: "KB",
      details: "Measures analytics-ready event payload size without sending it externally.",
      suggestions: ["Keep event details debug-only until analytics connection is reviewed."]
    }),
    check({
      id: "debug_payload_size",
      label: "Debug payload size",
      metric: estimate.debugPayloadKb,
      budget: budget.response.maxDebugPayloadKb,
      unit: "KB",
      details: "Measures debug payload that should stay hidden for normal users.",
      suggestions: ["Hide debug panels by default.", "Avoid rendering raw JSON in normal mobile views."]
    }),
    check({
      id: "rendered_card_count",
      label: "Rendered card count",
      metric: estimate.renderedCardCount,
      budget: budget.response.maxRenderedCards,
      unit: "cards",
      details: "Measures approximate number of cards in the response panel.",
      suggestions: ["Collapse secondary cards.", "Prioritize Scripture, prayer, reflection, and action."]
    })
  ];

  return {
    valid: checks.every((item) => item.passed),
    checks
  };
}

export function getTigResponsePerformanceWarnings(
  response: TigProductionResponse,
  budget: TigResponsePerformanceBudget = getDefaultTigResponseSizeBudget()
): string[] {
  const validation = validateTigResponsePerformanceBudget(response, budget);
  return unique([
    ...estimateTigProductionResponseSize(response).warnings,
    ...validation.checks.flatMap((item) => item.warnings)
  ]);
}

export function createTigResponsePerformanceReport(
  response: TigProductionResponse
): TeoyubePerformanceOptimizationReport {
  const budgets = getDefaultTigResponseSizeBudget();
  const estimate = estimateTigProductionResponseSize(response);
  const validation = validateTigResponsePerformanceBudget(response, budgets);
  const warnings = getTigResponsePerformanceWarnings(response, budgets);
  const complete = response.safety.safe && Boolean(response.selection.scriptureAnchor);

  return {
    phase: "Phase 7.3 - Performance, Cache & Offline Readiness",
    status: validation.valid ? "within_budget" : "warning",
    riskLevel: estimate.mobileRenderRisk,
    responseId: response.id,
    complete,
    checks: validation.checks,
    estimate,
    budgets,
    deferredRenderPlan: [],
    warnings,
    recommendations: unique([
      "Render Scripture, promise, prayer, reflection, and action before graph diagnostics.",
      "Collapse explanation paths when they are long.",
      "Defer graph preview when node or edge count crosses mobile thresholds.",
      "Keep debug and event payloads hidden by default."
    ]),
    generatedAt: new Date().toISOString()
  };
}
