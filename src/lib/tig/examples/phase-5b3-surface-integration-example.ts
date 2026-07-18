import type {
  TigProductionResponse,
  TigProductionSurface
} from "../production-response-contracts";
import {
  runAiCompanionTigProduction,
  runCallingCompassTigProduction,
  runCanonTigProduction,
  runDailyWordTigProduction,
  runPrayerTigProduction,
  runPromiseClusterTigProduction
} from "../production-surface-runner";

export type TigSurfaceIntegrationExample = {
  surface: TigProductionSurface;
  inputParams: Record<string, unknown>;
  productionResponse: TigProductionResponse;
  fallbackUsed: boolean;
  confidenceLabel: string;
  selectedScripture?: string;
  explanationPathLength: number;
};

function summarizeSurfaceExample(
  surface: TigProductionSurface,
  inputParams: Record<string, unknown>,
  productionResponse: TigProductionResponse
): TigSurfaceIntegrationExample {
  return {
    surface,
    inputParams,
    productionResponse,
    fallbackUsed: productionResponse.fallback.used,
    confidenceLabel: productionResponse.confidence.label,
    selectedScripture: productionResponse.selection.scriptureAnchor?.label,
    explanationPathLength: productionResponse.explanation.reasonPath.length
  };
}

export function runPhase5B3SurfaceIntegrationExample(): TigSurfaceIntegrationExample[] {
  const canonParams = {
    input: "Show me how the Teoyube canon connects purpose to Scripture.",
    userState: "exploring promise language",
    selectedWordId: "word_purpose",
    selectedClusterId: "cluster_purpose_in_delay"
  };
  const dailyWordParams = {
    input: "Give me a daily word for waiting with hope.",
    userState: "daily encouragement",
    emotion: "waiting",
    selectedWordId: "word_hope",
    selectedClusterId: "cluster_strength_in_waiting"
  };
  const prayerParams = {
    input: "Help me pray through discouragement.",
    userState: "discouragement",
    emotion: "discouragement",
    selectedWordId: "word_faithful",
    selectedClusterId: "cluster_hope_in_discouragement"
  };
  const callingParams = {
    input: "I want to know my purpose and calling.",
    userState: "calling discernment",
    selectedWordId: "word_calling",
    selectedClusterId: "cluster_guidance_for_next_step"
  };
  const promiseClusterParams = {
    input: "I feel stuck and need strength from Scripture.",
    userState: "discouragement",
    emotion: "discouragement",
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting"
  };
  const aiCompanionParams = {
    input: "I am afraid to start what God called me to do.",
    userState: "fear",
    emotion: "fear",
    selectedWordId: "word_courage",
    selectedClusterId: "cluster_courage_through_presence"
  };

  return [
    summarizeSurfaceExample("canon", canonParams, runCanonTigProduction(canonParams)),
    summarizeSurfaceExample(
      "daily_word",
      dailyWordParams,
      runDailyWordTigProduction(dailyWordParams)
    ),
    summarizeSurfaceExample("prayer", prayerParams, runPrayerTigProduction(prayerParams)),
    summarizeSurfaceExample(
      "calling_compass",
      callingParams,
      runCallingCompassTigProduction(callingParams)
    ),
    summarizeSurfaceExample(
      "promise_cluster",
      promiseClusterParams,
      runPromiseClusterTigProduction(promiseClusterParams)
    ),
    summarizeSurfaceExample(
      "ai_companion",
      aiCompanionParams,
      runAiCompanionTigProduction(aiCompanionParams)
    )
  ];
}
