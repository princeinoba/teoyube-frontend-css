import type {
  ScriptureNode,
  TIGAIRequest,
  TIGAIResponse,
  TIGAIMode
} from "./types";
import { buildAIContext, resolveGraph } from "./graph-engine";
import { runTIGEngineSync } from "./engine";
import { getTIGSeedGraph, getTIGSeedSummary } from "./seed";

type GraphResolutionValidationResult = {
  valid: boolean;
  errors: string[];
  resultCount: number;
};

type EngineResponseValidationResult = {
  valid: boolean;
  errors: string[];
  responseCount: number;
};

function createGraphEngineTestRequest(
  input: string,
  mode: TIGAIMode,
  index: number
): TIGAIRequest {
  return {
    id: `tig_graph_engine_test_request_${index}`,
    input,
    mode,
    context: {
      language: "en",
      audience: "GENERAL"
    },
    requestedAt: new Date().toISOString()
  };
}

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

function getResponseScriptures(response: TIGAIResponse): ScriptureNode[] {
  const runtimeResponse = response as TIGAIResponse & {
    scriptures?: ScriptureNode[];
  };

  return runtimeResponse.scriptures || response.scriptureNodes;
}

function getResponseConfidence(response: TIGAIResponse): TIGAIResponse["confidenceScore"] | undefined {
  const runtimeResponse = response as TIGAIResponse & {
    confidence?: TIGAIResponse["confidenceScore"];
  };

  return runtimeResponse.confidence || response.confidenceScore;
}

export const TIG_GRAPH_ENGINE_TEST_REQUESTS: TIGAIRequest[] = [
  createGraphEngineTestRequest("I feel stuck.", "promise_search", 1),
  createGraphEngineTestRequest(
    "I am afraid to start what God called me to do.",
    "ai_companion",
    2
  ),
  createGraphEngineTestRequest("I want to know my purpose.", "calling_compass", 3),
  createGraphEngineTestRequest("Help me grow through this waiting season.", "growth_journey", 4),
  createGraphEngineTestRequest("Pray for me.", "prayer", 5),
  createGraphEngineTestRequest("Give me a daily word.", "daily_word", 6),
  createGraphEngineTestRequest("Help me journal through discouragement.", "journal", 7)
];

export function validateGraphResolution(): GraphResolutionValidationResult {
  const seedGraph = getTIGSeedGraph();
  const errors: string[] = [];
  const results = TIG_GRAPH_ENGINE_TEST_REQUESTS.map((request) => ({
    request,
    result: resolveGraph(request)
  }));

  if (!seedGraph.nodes.length) errors.push("Seed graph has no nodes.");
  if (!seedGraph.relationships.length) errors.push("Seed graph has no relationships.");

  results.forEach(({ request, result }, index) => {
    const label = `Graph resolution ${index + 1} (${request.mode})`;

    if (!result) errors.push(`${label} did not return a result.`);
    if (!result.request) errors.push(`${label} is missing request.`);
    if (!result.detectedIntent) errors.push(`${label} is missing detectedIntent.`);
    if (!Array.isArray(result.scriptures) || result.scriptures.length < 1) {
      errors.push(`${label} does not include at least one Scripture.`);
    }
    if (!result.confidence) errors.push(`${label} is missing confidence.`);
    if (!result.graphTrace) errors.push(`${label} is missing graphTrace.`);

    const context = buildAIContext(result);
    if (!context) errors.push(`${label} did not build an AI context.`);
    if (!context.primaryScripture) {
      errors.push(`${label} AI context is missing primaryScripture.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length
  };
}

export function validateEngineResponses(): EngineResponseValidationResult {
  const errors: string[] = [];
  const responses = TIG_GRAPH_ENGINE_TEST_REQUESTS.map((request) => ({
    request,
    response: runTIGEngineSync(request)
  }));

  responses.forEach(({ request, response }, index) => {
    const label = `Engine response ${index + 1} (${request.mode})`;
    const scriptures = getResponseScriptures(response);
    const confidence = getResponseConfidence(response);

    if (!response) errors.push(`${label} did not return a response.`);
    if (!Array.isArray(scriptures) || scriptures.length < 1) {
      errors.push(`${label} does not include at least one Scripture.`);
    }
    if (!hasText(response.aiMessage)) errors.push(`${label} is missing aiMessage.`);
    if (!hasText(response.prayer)) errors.push(`${label} is missing prayer.`);
    if (!hasPrompt(response.reflectionPrompt)) {
      errors.push(`${label} is missing reflectionPrompt.`);
    }
    if (!hasAction(response.actionStep)) errors.push(`${label} is missing actionStep.`);
    if (!confidence) errors.push(`${label} is missing confidence.`);
    if (!hasText(response.generatedAt)) errors.push(`${label} is missing generatedAt.`);
  });

  return {
    valid: errors.length === 0,
    errors,
    responseCount: responses.length
  };
}

export function validateGraphEngineArchitecture() {
  const sampleRequest = createGraphEngineTestRequest("I feel stuck.", "promise_search", 999);
  const sampleGraphResult = resolveGraph(sampleRequest);

  return {
    seedSummary: getTIGSeedSummary(),
    graphResolution: validateGraphResolution(),
    engineResponses: validateEngineResponses(),
    sampleGraphContext: buildAIContext(sampleGraphResult),
    sampleResponse: runTIGEngineSync(sampleRequest)
  };
}
