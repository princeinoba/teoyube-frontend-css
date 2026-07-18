import type { TIGAIRequest, TIGAIResponse } from "./types";
import { runTIGEngineSync } from "./engine";

function createDemoRequest(
  input: string,
  mode: TIGAIRequest["mode"],
  index: number
): TIGAIRequest {
  return {
    id: `tig_demo_request_${index}`,
    mode,
    input,
    context: {
      language: "en",
      audience: "GENERAL"
    },
    requestedAt: new Date().toISOString()
  };
}

export const TIG_DEMO_REQUESTS: TIGAIRequest[] = [
  createDemoRequest("I feel stuck.", "promise_search", 1),
  createDemoRequest("I am afraid to start what God called me to do.", "ai_companion", 2),
  createDemoRequest("I want to know my purpose.", "calling_compass", 3),
  createDemoRequest("Help me grow through this waiting season.", "growth_journey", 4),
  createDemoRequest("Pray for me.", "prayer", 5)
];

export function runTIGDemoRequests(): TIGAIResponse[] {
  return TIG_DEMO_REQUESTS.map((request) => runTIGEngineSync(request));
}

export function runSingleTIGDemo(
  input: string,
  mode: TIGAIRequest["mode"]
): TIGAIResponse {
  return runTIGEngineSync(createDemoRequest(input, mode, Date.now()));
}
