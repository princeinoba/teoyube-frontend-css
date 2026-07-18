import {
  createDefaultTeoyubeConsentControlState,
  runPromiseClusterTigProduction
} from "../../../tig";
import {
  createCacheBoundaryReport,
  sanitizeResponseForMobileCache
} from "../mobile-cache-boundaries";
import {
  createDeferredTigRenderPlan,
  createMobilePerformanceReadinessReport,
  shouldDeferGraphPreview
} from "../mobile-runtime-performance";
import {
  createMobileRuntimeCache,
  getCachedMobileRuntimeItem,
  getMobileRuntimeCacheKey,
  getMobileRuntimeCacheSummary,
  setCachedMobileRuntimeItem
} from "../mobile-runtime-cache";
import { toOfflineSafeTigProductionResponse } from "../offline-tig-response-adapter";
import {
  toPerformanceAwareGraphPreviewProps,
  toPerformanceAwareTigPanelProps
} from "../performance-ui-adapters";
import { runPhase7PerformanceCacheOfflineAudit } from "../phase-7-performance-cache-offline-audit";
import {
  estimateTigGraphRenderCost,
  estimateTigProductionResponseSize,
  getDefaultTigResponseSizeBudget
} from "../response-performance-budget";

export function runPhase7PerformanceCacheOfflineExample() {
  const response = runPromiseClusterTigProduction({
    input: "I feel stuck and need Scripture-grounded help.",
    emotion: "discouragement",
    userState: "feeling stuck",
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting"
  });
  const consentState = createDefaultTeoyubeConsentControlState();
  const budget = getDefaultTigResponseSizeBudget();
  const sizeEstimate = estimateTigProductionResponseSize(response);
  const graphCost = estimateTigGraphRenderCost(response.visualization);
  const deferredRenderPlan = createDeferredTigRenderPlan(response);
  const sanitizedResponse = sanitizeResponseForMobileCache(response, consentState);
  const cache = createMobileRuntimeCache({ namespace: "phase-7-3-example", maxItems: 5 });
  const cacheKey = getMobileRuntimeCacheKey(response.input);
  const cachedItem = setCachedMobileRuntimeItem(cache, cacheKey, response, consentState);
  const cachedLookup = cachedItem ? getCachedMobileRuntimeItem(cache, cacheKey) : undefined;
  const offlineFallback = toOfflineSafeTigProductionResponse("daily_word");
  const panelProps = toPerformanceAwareTigPanelProps(response, { mobile: true });
  const graphProps = toPerformanceAwareGraphPreviewProps(response.visualization, { mobile: true });
  const audit = runPhase7PerformanceCacheOfflineAudit();

  return {
    budget,
    sizeEstimate,
    graphCost,
    shouldDeferGraph: shouldDeferGraphPreview(response),
    deferredRenderPlan,
    cacheBoundaryReport: createCacheBoundaryReport(response, consentState),
    sanitizedResponse,
    cacheSummary: getMobileRuntimeCacheSummary(cache),
    cachedItem,
    cachedLookup,
    offlineFallback,
    mobilePerformanceReport: createMobilePerformanceReadinessReport(response),
    performanceAwareUi: {
      panelProps,
      graphProps
    },
    audit
  };
}
