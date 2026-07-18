import { runTeoyubeProductionIntelligence } from "./production-intelligence-service";
import type {
  TigProductionInput,
  TigProductionResponse
} from "./production-response-contracts";
import {
  createAiCompanionTigProductionInput,
  createCallingCompassTigProductionInput,
  createCanonTigProductionInput,
  createDailyWordTigProductionInput,
  createPrayerTigProductionInput,
  createPromiseClusterTigProductionInput,
  type TigProductionSurfaceAdapterParams
} from "./production-surface-adapters";

export function runTigProductionForSurface(
  input: TigProductionInput
): TigProductionResponse {
  return runTeoyubeProductionIntelligence(input);
}

export function runCanonTigProduction(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionResponse {
  return runTigProductionForSurface(createCanonTigProductionInput(params));
}

export function runDailyWordTigProduction(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionResponse {
  return runTigProductionForSurface(createDailyWordTigProductionInput(params));
}

export function runPrayerTigProduction(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionResponse {
  return runTigProductionForSurface(createPrayerTigProductionInput(params));
}

export function runCallingCompassTigProduction(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionResponse {
  return runTigProductionForSurface(createCallingCompassTigProductionInput(params));
}

export function runPromiseClusterTigProduction(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionResponse {
  return runTigProductionForSurface(createPromiseClusterTigProductionInput(params));
}

export function runAiCompanionTigProduction(
  params: TigProductionSurfaceAdapterParams = {}
): TigProductionResponse {
  return runTigProductionForSurface(createAiCompanionTigProductionInput(params));
}
