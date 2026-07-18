import {
  createDefaultTeoyubeConsentControlState,
  disableTeoyubePersonalization,
  enableSessionOnlyPersonalization,
  runPromiseClusterTigProduction,
  runTeoyubePersonalizationProductionPreview
} from "../../../tig";
import {
  canCachePersonalizationPreview,
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
import {
  isOfflineSafeTigResponse,
  toOfflineSafeTigProductionResponse
} from "../offline-tig-response-adapter";
import { getOfflineReadonlyStrategy } from "../offline-readonly-strategy";
import {
  toPerformanceAwareExplanationPathProps,
  toPerformanceAwareTigPanelProps
} from "../performance-ui-adapters";
import { runPhase7PerformanceCacheOfflineAudit } from "../phase-7-performance-cache-offline-audit";
import {
  estimateTigProductionResponseSize,
  getDefaultTigResponseSizeBudget,
  validateTigResponsePerformanceBudget
} from "../response-performance-budget";
import { runPhase7PerformanceCacheOfflineExample } from "./phase-7-performance-cache-offline-example";

export type Phase7PerformanceCacheOfflineSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type Phase7PerformanceCacheOfflineSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: Phase7PerformanceCacheOfflineSmokeCheckResult[];
};

function result(
  name: string,
  errors: string[]
): Phase7PerformanceCacheOfflineSmokeCheckResult {
  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

function containsRawInput(value: unknown): boolean {
  const serialized = JSON.stringify(value ?? {});
  return serialized.includes("I feel stuck and need Scripture-grounded help.");
}

export function runPhase7PerformanceCacheOfflineSmokeCheck(): Phase7PerformanceCacheOfflineSmokeCheckReport {
  const response = runPromiseClusterTigProduction({
    input: "I feel stuck and need Scripture-grounded help.",
    emotion: "discouragement",
    userState: "feeling stuck",
    selectedWordId: "word_strength",
    selectedClusterId: "cluster_strength_in_waiting"
  });
  const budget = getDefaultTigResponseSizeBudget();
  const estimate = estimateTigProductionResponseSize(response);
  const validation = validateTigResponsePerformanceBudget(response, budget);
  const deferredPlan = createDeferredTigRenderPlan(response);
  const mobileReport = createMobilePerformanceReadinessReport(response);
  const cache = createMobileRuntimeCache({ maxItems: 4 });
  const cacheKey = getMobileRuntimeCacheKey(response.input);
  const cached = setCachedMobileRuntimeItem(
    cache,
    cacheKey,
    response,
    createDefaultTeoyubeConsentControlState()
  );
  const cachedLookup = getCachedMobileRuntimeItem(cache, cacheKey);
  const disabledConsent = disableTeoyubePersonalization(
    createDefaultTeoyubeConsentControlState()
  ).state;
  const sessionConsent = enableSessionOnlyPersonalization(
    createDefaultTeoyubeConsentControlState()
  ).state;
  const preview = runTeoyubePersonalizationProductionPreview({
    productionInput: response.input,
    mode: "comparison",
    consent: disabledConsent.consent
  });
  const sanitized = sanitizeResponseForMobileCache(response, disabledConsent);
  const offlineFallback = toOfflineSafeTigProductionResponse("daily_word");
  const offlineStrategy = getOfflineReadonlyStrategy();
  const panelProps = toPerformanceAwareTigPanelProps(response, { mobile: true });
  const explanationProps = toPerformanceAwareExplanationPathProps(response.explanation, {
    mobile: true
  });
  const audit = runPhase7PerformanceCacheOfflineAudit();
  const example = runPhase7PerformanceCacheOfflineExample();
  const warningText = audit.warnings.join(" ").toLowerCase();

  const results = [
    result("response performance budget can be created", clean([
      budget.response.maxSerializedKb > 0 ? "" : "Response size budget should be positive.",
      validation.checks.length >= 7 ? "" : "Performance budget should create detailed checks."
    ])),
    result("runtime cost can be estimated", clean([
      estimate.estimatedSerializedKb > 0 ? "" : "Estimated response size should be positive.",
      estimate.graphNodeCount > 0 ? "" : "Graph node count should be estimated.",
      mobileReport.phase === "Phase 7.3 - Performance, Cache & Offline Readiness"
        ? ""
        : "Mobile performance report should be Phase 7.3."
    ])),
    result("graph preview can be deferred", clean([
      typeof shouldDeferGraphPreview(response) === "boolean" ? "" : "Graph deferral should return a boolean.",
      deferredPlan.some((item) => item.section === "graph_preview")
        ? ""
        : "Deferred render plan should include graph preview."
    ])),
    result("mobile cache can be created", clean([
      cached ? "" : "Sanitized response should be stored in mobile runtime cache.",
      cachedLookup ? "" : "Cached item should be retrievable.",
      getMobileRuntimeCacheSummary(cache).itemCount === 1 ? "" : "Cache summary should show one item."
    ])),
    result("cache blocks unsafe personalization when consent is disabled", clean([
      canCachePersonalizationPreview(preview, disabledConsent)
        ? "Disabled personalization preview should not be cacheable."
        : "",
      canCachePersonalizationPreview(preview, sessionConsent)
        ? "Session-only personalization preview should not become durable cache."
        : ""
    ])),
    result("sanitized cache item excludes raw private text", clean([
      containsRawInput(sanitized) ? "Sanitized response should not include raw user input." : "",
      containsRawInput(cached?.data) ? "Cached data should not include raw user input." : ""
    ])),
    result("offline-safe fallback includes Scripture anchor", clean([
      offlineFallback.selection.scriptureAnchor ? "" : "Offline fallback should include Scripture anchor.",
      offlineFallback.explanation.scriptureEvidence.length ? "" : "Offline fallback should include Scripture evidence."
    ])),
    result("offline-safe fallback includes explanation path", clean([
      isOfflineSafeTigResponse(offlineFallback) ? "" : "Offline fallback should be marked offline safe.",
      offlineFallback.explanation.reasonPath.some((step) => step.toLowerCase().includes("offline"))
        ? ""
        : "Offline fallback explanation should mention offline-safe behavior."
    ])),
    result("performance UI adapter returns usable props", clean([
      panelProps.showScriptureFirst ? "" : "Performance panel props should prioritize Scripture.",
      typeof panelProps.deferGraphPreview === "boolean" ? "" : "Panel props should include graph defer flag.",
      typeof explanationProps.collapseByDefault === "boolean" ? "" : "Explanation props should include collapse flag."
    ])),
    result("audit returns structured report", clean([
      audit.complete ? "" : "Phase 7.3 audit should be complete.",
      audit.completionPercentage === 100 ? "" : "Phase 7.3 audit should be 100%.",
      audit.nextStep === "Phase 7.4 - Scale Readiness & Deployment Preparation"
        ? ""
        : "Phase 7.3 audit should point to Phase 7.4."
    ])),
    result("no prohibited dependencies are required", clean([
      warningText.includes("does not add production database persistence")
        ? ""
        : "Audit should prohibit production database persistence.",
      warningText.includes("does not send external analytics")
        ? ""
        : "Audit should prohibit external analytics sending.",
      warningText.includes("does not add live ai orchestration")
        ? ""
        : "Audit should prohibit live AI orchestration.",
      warningText.includes("does not implement a service worker")
        ? ""
        : "Audit should prohibit service workers.",
      offlineStrategy.implementationNote.toLowerCase().includes("does not add a service worker")
        ? ""
        : "Offline strategy should not add a service worker."
    ])),
    result("example demonstrates complete flow", clean([
      example.audit.complete ? "" : "Example should include completed Phase 7.3 audit.",
      example.cachedLookup ? "" : "Example should retrieve a cached runtime item.",
      example.offlineFallback.selection.scriptureAnchor ? "" : "Example offline fallback should include Scripture."
    ]))
  ];
  const errors = results.flatMap((item) =>
    item.errors.map((error) => `${item.name}: ${error}`)
  );

  return {
    valid: errors.length === 0,
    errors,
    resultCount: results.length,
    results
  };
}
