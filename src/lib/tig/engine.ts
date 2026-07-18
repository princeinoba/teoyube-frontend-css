import type { ScriptureNode, TIGAIRequest, TIGAIResponse } from "./types";
import { createScriptureAnchoredFallbackResponse, validateTIGAIResponse } from "./ai-interface";
import { resolveGraph } from "./graph-engine";
import { createSeedTIGQueryClient } from "./query";
import {
  buildCallingCompassResponse,
  buildDailyWordResponse,
  buildJournalResponse,
  buildJourneyResponse,
  buildPrayerResponse,
  buildPromiseSearchResponse,
  buildTIGResponseFromGraph
} from "./response-builder";

function isScriptureNode(node: unknown): node is ScriptureNode {
  return Boolean(node && typeof node === "object" && "type" in node && node.type === "SCRIPTURE");
}

export function getFallbackScripture(): ScriptureNode {
  const queryClient = createSeedTIGQueryClient();
  const scripture = queryClient.getNodesByType("SCRIPTURE").find(isScriptureNode);

  if (!scripture) {
    throw new Error("TIG fallback Scripture is unavailable because no Scripture seed exists.");
  }

  return scripture;
}

export function buildPrayerModeResponse(request: TIGAIRequest): TIGAIResponse {
  const result = resolveGraph(request);
  return buildPrayerResponse(request, result);
}

export function buildFallbackModeResponse(request: TIGAIRequest): TIGAIResponse {
  return validateTIGAIResponse(
    createScriptureAnchoredFallbackResponse({
      request,
      scripture: getFallbackScripture()
    })
  );
}

function runTIGEngineByMode(request: TIGAIRequest): TIGAIResponse {
  switch (request.mode) {
    case "promise_search":
      return buildPromiseSearchResponse(request, resolveGraph(request));
    case "calling_compass":
      return buildCallingCompassResponse(request, resolveGraph(request));
    case "growth_journey":
      return buildJourneyResponse(request, resolveGraph(request));
    case "prayer":
      return buildPrayerResponse(request, resolveGraph(request));
    case "ai_companion":
      return buildTIGResponseFromGraph({
        request,
        result: resolveGraph(request)
      });
    case "daily_word":
      return buildDailyWordResponse(request, resolveGraph(request));
    case "journal":
      return buildJournalResponse(request, resolveGraph(request));
    default:
      return buildTIGResponseFromGraph({
        request,
        result: resolveGraph(request)
      });
  }
}

export async function runTIGEngine(request: TIGAIRequest): Promise<TIGAIResponse> {
  return validateTIGAIResponse(runTIGEngineByMode(request));
}

export function runTIGEngineSync(request: TIGAIRequest): TIGAIResponse {
  return validateTIGAIResponse(runTIGEngineByMode(request));
}
