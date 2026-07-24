import { readServerFeatureAvailability } from "./environment";

export type TeoyubeReadinessPayload = Readonly<{
  status: "ready" | "degraded";
  runtime: "next-canonical-local";
  rollbackRuntime: "static-node";
  deployment: "local/release-candidate";
  gateCPreview: "pass";
  gateCProduction: "closed";
  deterministicFallbackReady: true;
  dependencies: Readonly<{
    scripture: "ready";
    tig: "ready";
    safety: "ready";
    durableMemory: "ready" | "disabled";
    vectorIndex: "ready" | "disabled";
    liveAiProvider: "ready" | "disabled" | "fallback";
  }>;
  safeCodes: readonly string[];
}>;

export function createReadinessPayload(
  environment: NodeJS.ProcessEnv = process.env,
  state: Readonly<{
    durableMemoryReady?: boolean;
    vectorIndexReady?: boolean;
    liveAiProviderReady?: boolean;
  }> = {}
): TeoyubeReadinessPayload {
  const availability = readServerFeatureAvailability(environment);
  const durableMemory = availability.durableMemory
    ? state.durableMemoryReady
      ? "ready"
      : "disabled"
    : "disabled";
  const vectorIndex = availability.vectorRetrieval
    ? state.vectorIndexReady
      ? "ready"
      : "disabled"
    : "disabled";
  const liveAiProvider = availability.liveAi
    ? state.liveAiProviderReady
      ? "ready"
      : "fallback"
    : "disabled";
  const degraded = availability.liveAi && liveAiProvider !== "ready";
  return Object.freeze({
    status: degraded ? "degraded" : "ready",
    runtime: "next-canonical-local",
    rollbackRuntime: "static-node",
    deployment: "local/release-candidate",
    gateCPreview: "pass",
    gateCProduction: "closed",
    deterministicFallbackReady: true,
    dependencies: Object.freeze({
      scripture: "ready",
      tig: "ready",
      safety: "ready",
      durableMemory,
      vectorIndex,
      liveAiProvider
    }),
    safeCodes: Object.freeze(
      degraded ? ["provider_fallback_active"] : ["deterministic_core_ready"]
    )
  });
}
