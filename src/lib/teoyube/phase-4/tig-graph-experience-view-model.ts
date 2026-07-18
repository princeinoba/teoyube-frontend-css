import {
  createSeedTIGQueryClient,
  getTIGSeedGraph,
  getTIGSeedSummary,
  type AnyTIGNode,
  type TIGRelationship
} from "../../tig";
import type {
  TeoyubeTigGraphEdge,
  TeoyubeTigGraphExperienceBlocker,
  TeoyubeTigGraphExperienceDecision,
  TeoyubeTigGraphExperienceReport,
  TeoyubeTigGraphExperienceStatus,
  TeoyubeTigGraphExperienceViewModel,
  TeoyubeTigGraphExperienceWarning,
  TeoyubeTigGraphLegendItem,
  TeoyubeTigGraphNode,
  TeoyubeTigGraphTraceOverlay,
  TeoyubeTigGraphViewMode
} from "./tig-graph-experience-contracts";

function formatPercent(value: number | undefined): string {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return `${Math.round(safeValue * 100)}%`;
}

function nodeLabel(node: AnyTIGNode): string {
  return node.title || node.slug || node.id;
}

function relationshipMeaning(relationship: TIGRelationship): string {
  return relationship.reason || `${relationship.sourceNodeType} ${relationship.type.toLowerCase()} ${relationship.targetNodeType}.`;
}

function nodeToViewModel(node: AnyTIGNode, relationshipCount: number): TeoyubeTigGraphNode {
  return {
    id: node.id,
    type: node.type,
    label: nodeLabel(node),
    summary: node.summary || node.description,
    scriptureReferences: node.scriptureReferences || [],
    confidenceLabel: formatPercent(node.confidenceScore),
    relationshipCount,
    visibleToUser: true
  };
}

function edgeToViewModel(relationship: TIGRelationship): TeoyubeTigGraphEdge {
  return {
    id: relationship.id,
    sourceNodeId: relationship.sourceNodeId,
    targetNodeId: relationship.targetNodeId,
    label: relationship.type.replace(/_/g, " ").toLowerCase(),
    meaning: relationshipMeaning(relationship),
    scriptureBasis: relationship.scriptureBasis || [],
    confidenceLabel: formatPercent(relationship.confidenceScore),
    visibleToUser: true
  };
}

function buildTigGraphLegend(): TeoyubeTigGraphLegendItem[] {
  const summary = getTIGSeedSummary();
  return Object.entries(summary.nodeCountsByType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      id: `legend_${type.toLowerCase()}`,
      label: type.replace(/_/g, " "),
      description: `${count} reviewed seed node(s) available in the local TIG graph.`
    }));
}

function buildTigGraphTraceOverlay(input: {
  nodes?: TeoyubeTigGraphNode[];
  edges?: TeoyubeTigGraphEdge[];
  fallbackReason?: string;
} = {}): TeoyubeTigGraphTraceOverlay {
  const nodes = input.nodes || [];
  const edges = input.edges || [];
  const firstNode = nodes[0];
  const firstEdge = edges[0];
  return {
    id: "phase_4_4_tig_graph_trace_overlay",
    title: "Guided TIG trace",
    steps: [
      firstNode
        ? {
            id: "selected_node",
            label: "Selected node",
            summary: `${firstNode.label} anchors the current graph view.`,
            scriptureAnchors: firstNode.scriptureReferences
          }
        : undefined,
      firstEdge
        ? {
            id: "first_relationship",
            label: "Relationship",
            summary: firstEdge.meaning,
            scriptureAnchors: firstEdge.scriptureBasis
          }
        : undefined,
      {
        id: "fallback_boundary",
        label: "Fallback boundary",
        summary: input.fallbackReason || "Use relationship-list fallback when graph data is incomplete or dense.",
        scriptureAnchors: []
      }
    ].filter(Boolean) as TeoyubeTigGraphTraceOverlay["steps"],
    fallbackReason: input.fallbackReason
  };
}

export function getTigGraphEmptyState(input: { reason?: string } = {}): string {
  return input.reason || "TIG graph data is not available yet. Use the relationship-list fallback without inventing relationships.";
}

export function createTigGraphExperienceViewModel(input: {
  viewMode?: TeoyubeTigGraphViewMode;
  selectedNodeId?: string;
  maxNodes?: number;
  maxEdges?: number;
} = {}): TeoyubeTigGraphExperienceViewModel {
  const graph = getTIGSeedGraph();
  const queryClient = createSeedTIGQueryClient();
  const selectedNode = input.selectedNodeId ? queryClient.getNodeById(input.selectedNodeId) : undefined;
  const relationships = selectedNode
    ? queryClient.getRelationshipsForNode(selectedNode.id)
    : graph.relationships.slice(0, input.maxEdges || 40);
  const nodeIds = new Set<string>();
  relationships.forEach((relationship) => {
    nodeIds.add(relationship.sourceNodeId);
    nodeIds.add(relationship.targetNodeId);
  });
  if (selectedNode) nodeIds.add(selectedNode.id);

  const nodes = [...nodeIds]
    .map((id) => queryClient.getNodeById(id))
    .filter((node): node is AnyTIGNode => Boolean(node))
    .slice(0, input.maxNodes || 40)
    .map((node) => nodeToViewModel(node, queryClient.getRelationshipsForNode(node.id).length));
  const edges = relationships.slice(0, input.maxEdges || 40).map(edgeToViewModel);
  const fallbackReason = nodes.length === 0 || edges.length === 0
    ? "Graph relationship data is incomplete; relationship-list fallback is available."
    : undefined;

  return {
    id: "phase_4_4_tig_graph_experience_view_model",
    viewMode: input.viewMode || (fallbackReason ? "relationship_list" : "graph"),
    nodes,
    edges,
    relationshipList: edges,
    mobileList: nodes,
    legend: buildTigGraphLegend(),
    traceOverlay: buildTigGraphTraceOverlay({ nodes, edges, fallbackReason }),
    emptyState: getTigGraphEmptyState({ reason: fallbackReason }),
    fallbackReason,
    generatedFromRealTigRelationships: true,
    noRawDebugPayload: true,
    scriptureAnchorsVisible: true,
    explanationTraceVisible: true,
    mobileFallbackAvailable: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}

export function createTigGraphGuidedTraceViewModel(input: Parameters<typeof createTigGraphExperienceViewModel>[0] = {}) {
  return createTigGraphExperienceViewModel({ ...input, viewMode: "guided_trace" });
}

export function createTigGraphRelationshipListViewModel(input: Parameters<typeof createTigGraphExperienceViewModel>[0] = {}) {
  return createTigGraphExperienceViewModel({ ...input, viewMode: "relationship_list" });
}

export function createTigGraphMobileListViewModel(input: Parameters<typeof createTigGraphExperienceViewModel>[0] = {}) {
  return createTigGraphExperienceViewModel({ ...input, viewMode: "mobile_list" });
}

export function createTigGraphLegend(_input: Record<string, unknown> = {}): TeoyubeTigGraphLegendItem[] {
  return buildTigGraphLegend();
}

export function createTigGraphTraceOverlay(input: Parameters<typeof buildTigGraphTraceOverlay>[0] = {}) {
  return buildTigGraphTraceOverlay(input);
}

function blockersForViewModel(viewModel: TeoyubeTigGraphExperienceViewModel): TeoyubeTigGraphExperienceBlocker[] {
  return [
    !viewModel.noRawDebugPayload
      ? {
          id: "tig_graph_debug_payload",
          message: "TIG graph view model exposes raw debug payload.",
          requiredAction: "Expose readable nodes/edges only."
        }
      : undefined,
    !viewModel.mobileFallbackAvailable
      ? {
          id: "tig_graph_mobile_fallback_missing",
          message: "TIG graph view model lacks mobile/list fallback.",
          requiredAction: "Provide relationship-list and mobile-list fallback."
        }
      : undefined
  ].filter(Boolean) as TeoyubeTigGraphExperienceBlocker[];
}

function warningsForViewModel(viewModel: TeoyubeTigGraphExperienceViewModel): TeoyubeTigGraphExperienceWarning[] {
  return [
    viewModel.nodes.length === 0
      ? {
          id: "tig_graph_nodes_empty",
          message: "TIG graph view model has no nodes.",
          recommendedAction: "Show empty state and relationship-list fallback."
        }
      : undefined,
    viewModel.edges.length === 0
      ? {
          id: "tig_graph_edges_empty",
          message: "TIG graph view model has no edges.",
          recommendedAction: "Show empty state and do not invent relationships."
        }
      : undefined,
    viewModel.edges.some((edge) => edge.scriptureBasis.length === 0)
      ? {
          id: "tig_graph_edges_missing_scripture",
          message: "Some TIG relationships lack visible Scripture basis.",
          recommendedAction: "Keep missing-Scripture relationship warnings visible."
        }
      : undefined
  ].filter(Boolean) as TeoyubeTigGraphExperienceWarning[];
}

export function createTigGraphExperienceReport(input: {
  viewModel?: TeoyubeTigGraphExperienceViewModel;
} = {}): TeoyubeTigGraphExperienceReport {
  const viewModel = input.viewModel || createTigGraphExperienceViewModel();
  const blockers = blockersForViewModel(viewModel);
  const warnings = warningsForViewModel(viewModel);
  const status: TeoyubeTigGraphExperienceStatus = blockers.length
    ? "blocked"
    : viewModel.nodes.length === 0
      ? "empty"
      : viewModel.fallbackReason
        ? "fallback_list"
        : warnings.length
          ? "ready_with_warnings"
          : "ready";
  const decision: TeoyubeTigGraphExperienceDecision = blockers.length
    ? "blocked"
    : status === "empty"
      ? "empty_state"
      : status === "fallback_list"
        ? "fallback_list_ready"
        : warnings.length
          ? "tig_graph_experience_ready_with_warnings"
          : "tig_graph_experience_ready";

  return {
    valid: blockers.length === 0,
    decision,
    status,
    viewModel,
    blockers,
    warnings,
    generatedFromRealTigRelationships: true,
    noRawDebugPayload: true,
    scriptureAnchorsVisible: true,
    explanationTraceVisible: true,
    mobileFallbackAvailable: true,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
