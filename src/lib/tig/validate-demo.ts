import type { AnyTIGNode, ScriptureNode, TIGNodeType, TIGRelationship } from "./types";
import { runTIGDemoRequests, runSingleTIGDemo } from "./demo";
import { createSeedTIGQueryClient } from "./query";
import { getTIGSeedGraph, getTIGSeedSummary } from "./seed";

type TIGSeedGraphValidationResult = {
  valid: boolean;
  errors: string[];
  summary: {
    nodeCount: number;
    relationshipCount: number;
    scriptureCount: number;
    nodeCountsByType: Record<string, number>;
  };
};

type TIGDemoResponsesValidationResult = {
  valid: boolean;
  errors: string[];
  responseCount: number;
};

const REQUIRED_NODE_TYPES: TIGNodeType[] = [
  "SCRIPTURE",
  "TEOYUBE_WORD",
  "PROMISE_CATEGORY",
  "PROMISE_CLUSTER",
  "EMOTION_PROFILE",
  "CALLING_PROFILE",
  "JOURNEY",
  "PRAYER_SEQUENCE",
  "REFLECTION_PROMPT",
  "ACTION_STEP",
  "GROWTH_MILESTONE",
  "AI_RESPONSE_PATTERN"
];

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasPrompt(value: unknown): boolean {
  if (typeof value === "string") return hasText(value);
  if (value && typeof value === "object" && "prompt" in value) {
    return hasText(value.prompt);
  }
  return false;
}

function hasAction(value: unknown): boolean {
  if (typeof value === "string") return hasText(value);
  if (value && typeof value === "object" && "action" in value) {
    return hasText(value.action);
  }
  return false;
}

function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isScriptureNode(node: AnyTIGNode): node is ScriptureNode {
  return node.type === "SCRIPTURE";
}

function findDuplicateIds(items: Array<{ id: string }>): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) duplicates.add(item.id);
    seen.add(item.id);
  }

  return [...duplicates];
}

function buildNodeCountsByType(nodes: AnyTIGNode[]): Record<string, number> {
  return nodes.reduce<Record<string, number>>((counts, node) => {
    counts[node.type] = (counts[node.type] || 0) + 1;
    return counts;
  }, {});
}

function validateRelationshipIntegrity(params: {
  relationship: TIGRelationship;
  nodeIds: Set<string>;
  errors: string[];
}): void {
  const { relationship, nodeIds, errors } = params;

  if (!relationship.sourceNodeId) {
    errors.push(`Relationship ${relationship.id} is missing sourceNodeId.`);
  } else if (!nodeIds.has(relationship.sourceNodeId)) {
    errors.push(
      `Relationship ${relationship.id} references missing sourceNodeId ${relationship.sourceNodeId}.`
    );
  }

  if (!relationship.targetNodeId) {
    errors.push(`Relationship ${relationship.id} is missing targetNodeId.`);
  } else if (!nodeIds.has(relationship.targetNodeId)) {
    errors.push(
      `Relationship ${relationship.id} references missing targetNodeId ${relationship.targetNodeId}.`
    );
  }

  if (!isScore(relationship.strength)) {
    errors.push(`Relationship ${relationship.id} has strength outside 0-1.`);
  }
  if (!isScore(relationship.confidenceScore)) {
    errors.push(`Relationship ${relationship.id} has confidenceScore outside 0-1.`);
  }
}

function validateNodeScoreIntegrity(node: AnyTIGNode, errors: string[]): void {
  if (!isScore(node.theologicalWeight)) {
    errors.push(`Node ${node.id} has theologicalWeight outside 0-1.`);
  }
  if (!isScore(node.pastoralSensitivity)) {
    errors.push(`Node ${node.id} has pastoralSensitivity outside 0-1.`);
  }
  if (!isScore(node.confidenceScore)) {
    errors.push(`Node ${node.id} has confidenceScore outside 0-1.`);
  }
}

function validateScriptureIntegrity(scripture: ScriptureNode, errors: string[]): void {
  if (!hasText(scripture.reference)) errors.push(`Scripture ${scripture.id} is missing reference.`);
  if (!hasText(scripture.text)) errors.push(`Scripture ${scripture.id} is missing text.`);
  if (!hasText(scripture.translation)) {
    errors.push(`Scripture ${scripture.id} is missing translation.`);
  }
  if (!isScore(scripture.canonicalImportance)) {
    errors.push(`Scripture ${scripture.id} has canonicalImportance outside 0-1.`);
  }
}

export function validateTIGSeedGraph(): TIGSeedGraphValidationResult {
  const graph = getTIGSeedGraph();
  const queryClient = createSeedTIGQueryClient();
  const errors: string[] = [];
  const scriptures = queryClient.getNodesByType("SCRIPTURE").filter(isScriptureNode);
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  const nodeCountsByType = buildNodeCountsByType(graph.nodes);

  if (!graph.nodes.length) errors.push("Seed graph has no nodes.");
  if (!graph.relationships.length) errors.push("Seed graph has no relationships.");
  if (!scriptures.length) errors.push("Seed graph has no Scripture nodes.");

  for (const duplicateNodeId of findDuplicateIds(graph.nodes)) {
    errors.push(`Duplicate node ID found: ${duplicateNodeId}.`);
  }

  for (const duplicateRelationshipId of findDuplicateIds(graph.relationships)) {
    errors.push(`Duplicate relationship ID found: ${duplicateRelationshipId}.`);
  }

  for (const relationship of graph.relationships) {
    validateRelationshipIntegrity({ relationship, nodeIds, errors });
  }

  for (const node of graph.nodes) {
    validateNodeScoreIntegrity(node, errors);
    if (isScriptureNode(node)) validateScriptureIntegrity(node, errors);
  }

  for (const type of REQUIRED_NODE_TYPES) {
    if (!nodeCountsByType[type]) {
      errors.push(`Seed graph is missing required node type ${type}.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    summary: {
      nodeCount: graph.nodes.length,
      relationshipCount: graph.relationships.length,
      scriptureCount: scriptures.length,
      nodeCountsByType
    }
  };
}

export function validateTIGDemoResponses(): TIGDemoResponsesValidationResult {
  const responses = runTIGDemoRequests();
  const errors: string[] = [];

  responses.forEach((response, index) => {
    const label = `Demo response ${index + 1}`;
    const runtimeResponse = response as typeof response & {
      scriptures?: ScriptureNode[];
      confidence?: typeof response.confidenceScore;
    };
    const scriptures = runtimeResponse.scriptures || response.scriptureNodes;
    const confidence = runtimeResponse.confidence || response.confidenceScore;

    if (!Array.isArray(scriptures) || scriptures.length < 1) {
      errors.push(`${label} does not include at least one Scripture.`);
    } else {
      scriptures.forEach((scripture, scriptureIndex) => {
        if (!hasText(scripture.reference)) {
          errors.push(`${label} Scripture ${scriptureIndex + 1} is missing reference.`);
        }
        if (!hasText(scripture.text)) {
          errors.push(`${label} Scripture ${scriptureIndex + 1} is missing text.`);
        }
      });
    }

    if (!hasText(response.aiMessage)) errors.push(`${label} is missing aiMessage.`);
    if (!hasText(response.prayer)) errors.push(`${label} is missing prayer.`);
    if (!hasPrompt(response.reflectionPrompt)) errors.push(`${label} is missing reflectionPrompt.`);
    if (!hasAction(response.actionStep)) errors.push(`${label} is missing actionStep.`);
    if (!confidence) {
      errors.push(`${label} is missing confidence.`);
    } else if (!isScore(confidence.overall)) {
      errors.push(`${label} confidence.overall is outside 0-1.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    responseCount: responses.length
  };
}

export function runTIGValidationDemo() {
  return {
    seedGraph: validateTIGSeedGraph(),
    demoResponses: validateTIGDemoResponses(),
    seedSummary: getTIGSeedSummary(),
    sampleResponse: runSingleTIGDemo("I feel stuck.", "promise_search")
  };
}
