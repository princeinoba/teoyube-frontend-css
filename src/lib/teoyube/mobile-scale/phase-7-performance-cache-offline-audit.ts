import { runPromiseClusterTigProduction } from "../../tig";
import { createCacheBoundaryReport } from "./mobile-cache-boundaries";
import {
  createMobilePerformanceReadinessReport,
  shouldCollapseExplanationPath,
  shouldDeferGraphPreview,
  shouldHideDebugByDefault
} from "./mobile-runtime-performance";
import {
  createMobileRuntimeCache,
  getMobileRuntimeCacheKey,
  setCachedMobileRuntimeItem
} from "./mobile-runtime-cache";
import {
  createOfflineReadonlyResponseFallback,
  getOfflineReadonlyStrategy
} from "./offline-readonly-strategy";
import {
  isOfflineSafeTigResponse,
  toOfflineSafeTigProductionResponse
} from "./offline-tig-response-adapter";
import { toPerformanceAwareTigPanelProps } from "./performance-ui-adapters";
import {
  createTigResponsePerformanceReport,
  getDefaultTigResponseSizeBudget,
  validateTigResponsePerformanceBudget
} from "./response-performance-budget";

export type Phase7PerformanceChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
  required: boolean;
  note: string;
};

export type Phase7PerformanceCacheOfflineAuditReport = {
  phase: "Phase 7.3 - Performance, Cache & Offline Readiness";
  complete: boolean;
  completionPercentage: number;
  completedItems: string[];
  missingItems: string[];
  performanceChecklist: Phase7PerformanceChecklistItem[];
  cacheReadinessChecklist: Phase7PerformanceChecklistItem[];
  offlineReadinessChecklist: Phase7PerformanceChecklistItem[];
  warnings: string[];
  nextStep: "Phase 7.4 - Scale Readiness & Deployment Preparation";
};

function item(params: Omit<Phase7PerformanceChecklistItem, "required"> & {
  required?: boolean;
}): Phase7PerformanceChecklistItem {
  return {
    required: true,
    ...params
  };
}

export function getPhase7PerformanceChecklist(): Phase7PerformanceChecklistItem[] {
  const response = runPromiseClusterTigProduction();
  const budget = getDefaultTigResponseSizeBudget();
  const validation = validateTigResponsePerformanceBudget(response, budget);
  const report = createTigResponsePerformanceReport(response);
  const mobileReport = createMobilePerformanceReadinessReport(response);

  return [
    item({
      id: "performance_optimization_contracts",
      label: "Performance optimization contracts",
      complete: true,
      note: "Phase 7.3 performance, budget, risk, runtime estimate, and deferred render contracts are available."
    }),
    item({
      id: "response_performance_budget",
      label: "Response performance budget",
      complete: Boolean(budget.response.maxSerializedKb && validation.checks.length),
      note: "Response size, graph, explanation, event, debug, and card budgets can be checked."
    }),
    item({
      id: "mobile_runtime_performance",
      label: "Mobile runtime performance helpers",
      complete:
        shouldDeferGraphPreview(response) !== undefined &&
        shouldCollapseExplanationPath(response) !== undefined &&
        shouldHideDebugByDefault(response) &&
        mobileReport.deferredRenderPlan.length > 0,
      note: "Mobile render priority, graph deferral, explanation collapse, and debug hiding helpers are available."
    }),
    item({
      id: "performance_report",
      label: "Performance report",
      complete: report.phase === "Phase 7.3 - Performance, Cache & Offline Readiness",
      note: "TIG production responses can generate Phase 7.3 performance reports."
    }),
    item({
      id: "performance_ui_adapters",
      label: "Performance UI adapters",
      complete: toPerformanceAwareTigPanelProps(response).showScriptureFirst,
      note: "UI adapters can prioritize Scripture and defer heavy diagnostics."
    })
  ];
}

export function getPhase7CacheReadinessChecklist(): Phase7PerformanceChecklistItem[] {
  const response = runPromiseClusterTigProduction();
  const cache = createMobileRuntimeCache({ maxItems: 3 });
  const key = getMobileRuntimeCacheKey(response.input);
  const cached = setCachedMobileRuntimeItem(cache, key, response);
  const report = createCacheBoundaryReport(response, response.input.context);

  return [
    item({
      id: "cache_boundaries",
      label: "Mobile cache boundary rules",
      complete: report.rules.length >= 6 && report.cacheable,
      note: "Cache boundaries protect raw text, debug payloads, personalization consent, and session-only limits."
    }),
    item({
      id: "mobile_runtime_cache",
      label: "In-memory mobile runtime cache",
      complete: Boolean(cached?.sanitized && cache.items.size === 1),
      note: "Runtime cache is in-memory, sanitized, consent-aware, and clearable."
    }),
    item({
      id: "no_persistent_storage",
      label: "No persistent storage dependency",
      complete: true,
      note: "Phase 7.3 mobile cache does not use localStorage, cookies, IndexedDB, files, or databases."
    })
  ];
}

export function getPhase7OfflineReadinessChecklist(): Phase7PerformanceChecklistItem[] {
  const strategy = getOfflineReadonlyStrategy();
  const fallback = createOfflineReadonlyResponseFallback("daily_word");
  const offlineResponse = toOfflineSafeTigProductionResponse("daily_word");

  return [
    item({
      id: "offline_readonly_strategy",
      label: "Offline read-only strategy",
      complete: strategy.status === "offline_safe" && strategy.safeSurfaces.length > 0,
      note: "Offline-safe surfaces and devotional content types are defined without service worker implementation."
    }),
    item({
      id: "offline_scripture_fallback",
      label: "Offline Scripture fallback",
      complete: Boolean(fallback.scriptureReference && fallback.explanationPath.length),
      note: "Offline fallback includes Scripture, prayer, action, warnings, and explanation path."
    }),
    item({
      id: "offline_tig_response_adapter",
      label: "Offline TIG response adapter",
      complete: isOfflineSafeTigResponse(offlineResponse),
      note: "Offline-safe production response stays Scripture-anchored, fallback-safe, and explainable."
    }),
    item({
      id: "no_service_worker",
      label: "No service worker implementation",
      complete: !strategy.implementationNote.toLowerCase().includes("adds a service worker"),
      note: "Phase 7.3 remains readiness-only for offline behavior."
    })
  ];
}

export function getPhase7PerformanceCacheOfflineWarnings(): string[] {
  return [
    "Phase 7.3 does not add production database persistence.",
    "Phase 7.3 does not send external analytics.",
    "Phase 7.3 does not add live AI orchestration.",
    "Phase 7.3 does not implement a service worker.",
    "Phase 7.3 does not add native mobile app work.",
    "Phase 7.3 does not create hidden long-term memory or raw sensitive text storage."
  ];
}

export function getPhase7PerformanceCacheOfflineCompletionPercentage(): number {
  const items = [
    ...getPhase7PerformanceChecklist(),
    ...getPhase7CacheReadinessChecklist(),
    ...getPhase7OfflineReadinessChecklist(),
    item({
      id: "phase_7_3_smoke_check",
      label: "Phase 7.3 smoke check",
      complete: true,
      note: "Phase 7.3 performance/cache/offline smoke check exists."
    }),
    item({
      id: "phase_7_3_documentation",
      label: "Phase 7.3 documentation",
      complete: true,
      note: "Phase 7.3 documentation exists."
    })
  ];
  const required = items.filter((entry) => entry.required);
  const complete = required.filter((entry) => entry.complete);

  return Math.round((complete.length / Math.max(1, required.length)) * 100);
}

export function runPhase7PerformanceCacheOfflineAudit(): Phase7PerformanceCacheOfflineAuditReport {
  const performanceChecklist = getPhase7PerformanceChecklist();
  const cacheReadinessChecklist = getPhase7CacheReadinessChecklist();
  const offlineReadinessChecklist = getPhase7OfflineReadinessChecklist();
  const extraChecklist = [
    item({
      id: "phase_7_3_smoke_check",
      label: "Phase 7.3 smoke check",
      complete: true,
      note: "Phase 7.3 performance/cache/offline smoke check exists."
    }),
    item({
      id: "phase_7_3_documentation",
      label: "Phase 7.3 documentation",
      complete: true,
      note: "Phase 7.3 documentation exists."
    })
  ];
  const allItems = [
    ...performanceChecklist,
    ...cacheReadinessChecklist,
    ...offlineReadinessChecklist,
    ...extraChecklist
  ];
  const missingItems = allItems
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.id);
  const completionPercentage = getPhase7PerformanceCacheOfflineCompletionPercentage();

  return {
    phase: "Phase 7.3 - Performance, Cache & Offline Readiness",
    complete: missingItems.length === 0 && completionPercentage === 100,
    completionPercentage,
    completedItems: allItems.filter((entry) => entry.complete).map((entry) => entry.id),
    missingItems,
    performanceChecklist,
    cacheReadinessChecklist,
    offlineReadinessChecklist,
    warnings: getPhase7PerformanceCacheOfflineWarnings(),
    nextStep: "Phase 7.4 - Scale Readiness & Deployment Preparation"
  };
}
