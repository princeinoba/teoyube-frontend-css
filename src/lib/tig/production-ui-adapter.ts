import type {
  TigProductionResponse,
  TigProductionSelection
} from "./production-response-contracts";

export type TigProductionSelectionRow = {
  label: string;
  value: string;
  nodeId?: string;
  reason: string;
};

export type TigProductionResponsePanelProps = {
  title: string;
  subtitle: string;
  selectionRows: TigProductionSelectionRow[];
  confidence: {
    score: number;
    label: string;
    explanation: string;
  };
  fallback: {
    used: boolean;
    message: string;
    reasons: string[];
  };
  safety: {
    status: string;
    warnings: string[];
    violations: string[];
  };
};

export type TigProductionGraphPanelProps = {
  visualization: TigProductionResponse["visualization"];
  layout: "hierarchy";
  statistics: TigProductionResponse["visualization"]["statistics"];
  highlightedNodeIds: string[];
};

export type TigProductionExplanationPanelProps = {
  title: string;
  summary: string;
  items: TigProductionSelectionRow[];
  scriptureEvidence: string[];
  confidenceLabel: string;
  confidenceScore: number;
};

function getReason(response: TigProductionResponse, value: string): string {
  return (
    response.explanation.reasonPath.find((reason) =>
      reason.toLowerCase().includes(value.toLowerCase())
    ) || "Selected through the Teoyube Intelligence Graph path."
  );
}

function row(params: {
  response: TigProductionResponse;
  label: string;
  node?: TigProductionSelection[keyof Omit<TigProductionSelection, "nodes" | "edges">];
}): TigProductionSelectionRow | undefined {
  if (!params.node) return undefined;

  return {
    label: params.label,
    value: params.node.label,
    nodeId: params.node.id,
    reason: getReason(params.response, params.node.label)
  };
}

function getSelectionRows(response: TigProductionResponse): TigProductionSelectionRow[] {
  return [
    row({ response, label: "Teoyube Word", node: response.selection.teoyubeWord }),
    row({ response, label: "Promise", node: response.selection.promiseCluster }),
    row({ response, label: "Scripture", node: response.selection.scriptureAnchor }),
    row({ response, label: "Prayer", node: response.selection.prayerSequence }),
    row({ response, label: "Action", node: response.selection.actionStep }),
    row({ response, label: "Calling", node: response.selection.callingArchetype }),
    row({ response, label: "Journey", node: response.selection.kingdomJourney })
  ].filter((item): item is TigProductionSelectionRow => Boolean(item));
}

export function toTigResponsePanelProps(
  response: TigProductionResponse
): TigProductionResponsePanelProps {
  return {
    title: "Teoyube Production Intelligence",
    subtitle: response.explanation.summary,
    selectionRows: getSelectionRows(response),
    confidence: {
      score: response.confidence.score,
      label: response.confidence.label,
      explanation: response.confidence.breakdown.explanation
    },
    fallback: {
      used: response.fallback.used,
      message: response.fallback.message,
      reasons: response.fallback.reasons
    },
    safety: {
      status: response.safety.status,
      warnings: response.safety.warnings,
      violations: response.safety.violations
    }
  };
}

export function toTigGraphPanelProps(
  response: TigProductionResponse
): TigProductionGraphPanelProps {
  return {
    visualization: response.visualization,
    layout: "hierarchy",
    statistics: response.visualization.statistics,
    highlightedNodeIds: response.explanation.selectedNodeIds
  };
}

export function toTigExplanationPanelProps(
  response: TigProductionResponse
): TigProductionExplanationPanelProps {
  return {
    title: "Why Teoyube Chose This",
    summary: response.explanation.summary,
    items: getSelectionRows(response),
    scriptureEvidence: response.explanation.scriptureEvidence,
    confidenceLabel: response.confidence.label,
    confidenceScore: response.confidence.score
  };
}
