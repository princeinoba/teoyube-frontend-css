import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationContext,
  TeoyubePersonalizationProfile
} from "./personalization-contracts";
import type {
  TeoyubePersonalizationPreviewMode,
  TeoyubePersonalizationPreviewResponse
} from "./personalization-preview-contracts";
import { runTeoyubePersonalizationPreview } from "./personalization-preview-service";
import type { TeoyubeSignalStoreAdapter } from "./personalization-signal-store-contracts";
import {
  createAiCompanionTigProductionInput,
  createCallingCompassTigProductionInput,
  createCanonTigProductionInput,
  createDailyWordTigProductionInput,
  createOnboardingTigProductionInput,
  createPrayerTigProductionInput,
  createPromiseClusterTigProductionInput,
  createUnknownSurfaceTigProductionInput,
  type TigProductionSurfaceAdapterParams
} from "./production-surface-adapters";
import type { TigProductionInput } from "./production-response-contracts";

export type TigPersonalizationPreviewSurfaceRunnerParams =
  TigProductionSurfaceAdapterParams & {
    mode?: TeoyubePersonalizationPreviewMode;
    consent?: Partial<TeoyubePersonalizationConsent>;
    context?: TeoyubePersonalizationContext;
    profile?: TeoyubePersonalizationProfile;
    signalStore?: TeoyubeSignalStoreAdapter;
    preferenceHints?: string[];
  };

function runSurfacePreview(
  productionInput: TigProductionInput,
  params: TigPersonalizationPreviewSurfaceRunnerParams = {}
): TeoyubePersonalizationPreviewResponse {
  return runTeoyubePersonalizationPreview({
    productionInput,
    mode: params.mode || "comparison",
    consent: params.consent,
    context: params.context,
    profile: params.profile,
    signalStore: params.signalStore,
    preferenceHints: params.preferenceHints
  });
}

export function runCanonPersonalizationPreview(
  params: TigPersonalizationPreviewSurfaceRunnerParams = {}
): TeoyubePersonalizationPreviewResponse {
  return runSurfacePreview(createCanonTigProductionInput(params), params);
}

export function runDailyWordPersonalizationPreview(
  params: TigPersonalizationPreviewSurfaceRunnerParams = {}
): TeoyubePersonalizationPreviewResponse {
  return runSurfacePreview(createDailyWordTigProductionInput(params), params);
}

export function runPrayerPersonalizationPreview(
  params: TigPersonalizationPreviewSurfaceRunnerParams = {}
): TeoyubePersonalizationPreviewResponse {
  return runSurfacePreview(createPrayerTigProductionInput(params), params);
}

export function runCallingCompassPersonalizationPreview(
  params: TigPersonalizationPreviewSurfaceRunnerParams = {}
): TeoyubePersonalizationPreviewResponse {
  return runSurfacePreview(createCallingCompassTigProductionInput(params), params);
}

export function runPromiseClusterPersonalizationPreview(
  params: TigPersonalizationPreviewSurfaceRunnerParams = {}
): TeoyubePersonalizationPreviewResponse {
  return runSurfacePreview(createPromiseClusterTigProductionInput(params), params);
}

export function runAiCompanionPersonalizationPreview(
  params: TigPersonalizationPreviewSurfaceRunnerParams = {}
): TeoyubePersonalizationPreviewResponse {
  return runSurfacePreview(createAiCompanionTigProductionInput(params), params);
}

export function runOnboardingPersonalizationPreview(
  params: TigPersonalizationPreviewSurfaceRunnerParams = {}
): TeoyubePersonalizationPreviewResponse {
  return runSurfacePreview(createOnboardingTigProductionInput(params), params);
}

export function runUnknownSurfacePersonalizationPreview(
  params: TigPersonalizationPreviewSurfaceRunnerParams = {}
): TeoyubePersonalizationPreviewResponse {
  return runSurfacePreview(createUnknownSurfaceTigProductionInput(params), params);
}
