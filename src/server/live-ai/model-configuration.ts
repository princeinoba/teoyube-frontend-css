import { z } from "zod";
import type { ModelRoute } from "../../domain/live-ai/model-gateway";
import type { TeoGuideIntent } from "../../domain/teo-guide/orchestration-contracts";

export const LIVE_AI_MODEL_CONFIGURATION_VERSION = "teoyube-openai-routing-2026-07-22.1";
export const LIVE_AI_PRICING_VERSION = "openai-public-pricing-2026-07-22";

export const LIVE_AI_MODELS = Object.freeze({
  light: Object.freeze({ id: "gpt-5.4-mini-2026-03-17", snapshotId: "gpt-5.4-mini-2026-03-17", inputUsdPerMillion: 0.75, cachedInputUsdPerMillion: 0.075, outputUsdPerMillion: 4.5 }),
  standard: Object.freeze({ id: "gpt-5.4-2026-03-05", snapshotId: "gpt-5.4-2026-03-05", inputUsdPerMillion: 2.5, cachedInputUsdPerMillion: 0.25, outputUsdPerMillion: 15 }),
  advanced: Object.freeze({ id: "disabled", snapshotId: "disabled", inputUsdPerMillion: 0, cachedInputUsdPerMillion: 0, outputUsdPerMillion: 0 })
});

export const LIVE_AI_OWNER_LIMITS = Object.freeze({
  maximumInputTokens: 6_000,
  maximumOutputTokens: 1_200,
  maximumToolRounds: 2,
  maximumToolsPerTurn: 5,
  requestTimeoutMs: 20_000,
  providerTimeoutMs: 15_000,
  perUserRequestsPerMinute: 6,
  globalRequestsPerMinute: 30,
  maximumPerRequestEstimatedUsd: 0.05,
  dailyDevelopmentBudgetUsd: 2,
  maximumEvaluationTaskUsd: 2,
  concurrency: 2,
  circuitFailureThreshold: 3,
  circuitCooldownMs: 60_000,
  maximumRetries: 1
});

const configurationSchema = z.object({
  OPENAI_API_KEY: z.string().trim().min(1).optional().catch(undefined),
  TEOYUBE_ENABLE_LIVE_AI: z.enum(["true", "false"]).default("false").catch("false"),
  TEOYUBE_ENABLE_EXTERNAL_TEO_GUIDE_PROVIDER: z.enum(["true", "false"]).default("false").catch("false"),
  TEOYUBE_LIVE_AI_ENABLED: z.enum(["true", "false"]).default("false").catch("false")
}).passthrough();

export type LiveAiRuntimeConfiguration = Readonly<{
  enabled: boolean;
  keyPresent: boolean;
  provider: "openai";
  modelConfigurationVersion: string;
  models: typeof LIVE_AI_MODELS;
  advancedEnabled: false;
  zeroDataRetentionVerified: false;
}>;

export function readLiveAiRuntimeConfiguration(environment: NodeJS.ProcessEnv = process.env): LiveAiRuntimeConfiguration {
  const parsed = configurationSchema.parse(environment);
  const keyPresent = Boolean(parsed.OPENAI_API_KEY);
  return Object.freeze({
    enabled: parsed.TEOYUBE_ENABLE_LIVE_AI === "true"
      && parsed.TEOYUBE_ENABLE_EXTERNAL_TEO_GUIDE_PROVIDER === "true"
      && parsed.TEOYUBE_LIVE_AI_ENABLED === "true"
      && keyPresent,
    keyPresent,
    provider: "openai",
    modelConfigurationVersion: LIVE_AI_MODEL_CONFIGURATION_VERSION,
    models: LIVE_AI_MODELS,
    advancedEnabled: false,
    zeroDataRetentionVerified: false
  });
}

export function openAiApiKey(environment: NodeJS.ProcessEnv = process.env): string | undefined {
  return configurationSchema.parse(environment).OPENAI_API_KEY;
}

const LIGHT_INTENTS: readonly TeoGuideIntent[] = Object.freeze(["product_help", "unknown_or_ambiguous"]);

export function selectLiveModelRoute(intent: TeoGuideIntent, safetyMode: "ordinary" | "sensitive" | "critical"): ModelRoute | "deterministic_only" {
  if (safetyMode === "critical" || intent === "crisis_support") return "deterministic_only";
  return LIGHT_INTENTS.includes(intent) ? "light" : "standard";
}

export function modelForRoute(route: ModelRoute) {
  return LIVE_AI_MODELS[route];
}
