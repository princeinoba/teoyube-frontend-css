import { validateAnalyticsReadinessPlan } from "../analytics-readiness-plan";
import {
  getOfflineSafetyRules,
  getTeoyubeMobileCacheStrategy,
  getTeoyubeOfflineReadOnlyStrategy
} from "../cache-offline-strategy";
import {
  getMobileSurfaceReadinessReport,
  getTeoyubeMobileSurfaceInventory
} from "../mobile-surface-inventory";
import {
  getMobileAccessibilityChecklist,
  getMobileSafetyChecklist
} from "../mobile-safety-accessibility";
import { runPhase7MobileScaleArchitectureAudit } from "../phase-7-mobile-scale-architecture-audit";
import {
  createPhase7PerformanceReadinessReport,
  getDefaultTeoyubePerformanceBudget
} from "../performance-budget";
import { validatePersistenceReadinessPlan } from "../persistence-readiness-plan";
import {
  getRecommendedLayoutMode,
  getTeoyubeResponsiveBreakpoints
} from "../responsive-layout-strategy";
import { runPhase7MobileScaleArchitectureExample } from "./phase-7-mobile-scale-architecture-example";
import type {
  TeoyubeMobileLayoutMode,
  TeoyubeMobileSurface
} from "../mobile-scale-contracts";

export type Phase7ArchitectureSmokeCheckResult = {
  name: string;
  valid: boolean;
  errors: string[];
};

export type Phase7ArchitectureSmokeCheckReport = {
  valid: boolean;
  errors: string[];
  resultCount: number;
  results: Phase7ArchitectureSmokeCheckResult[];
};

function result(name: string, errors: string[]): Phase7ArchitectureSmokeCheckResult {
  return {
    name,
    valid: errors.length === 0,
    errors
  };
}

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runPhase7MobileScaleArchitectureSmokeCheck(): Phase7ArchitectureSmokeCheckReport {
  const supportedSurface: TeoyubeMobileSurface = "promise_cluster";
  const supportedLayout: TeoyubeMobileLayoutMode = getRecommendedLayoutMode(390);
  const inventory = getTeoyubeMobileSurfaceInventory();
  const surfaceReport = getMobileSurfaceReadinessReport();
  const breakpoints = getTeoyubeResponsiveBreakpoints();
  const defaultBudget = getDefaultTeoyubePerformanceBudget();
  const performance = createPhase7PerformanceReadinessReport();
  const cache = getTeoyubeMobileCacheStrategy();
  const offline = getTeoyubeOfflineReadOnlyStrategy();
  const analytics = validateAnalyticsReadinessPlan();
  const persistence = validatePersistenceReadinessPlan();
  const safety = getMobileSafetyChecklist();
  const accessibility = getMobileAccessibilityChecklist();
  const audit = runPhase7MobileScaleArchitectureAudit();
  const example = runPhase7MobileScaleArchitectureExample();

  const results = [
    result("contracts compile", clean([
      supportedSurface === "promise_cluster" ? "" : "Supported surface contract did not compile.",
      supportedLayout === "mobile_compact" ? "" : "Mobile layout mode recommendation should be mobile_compact."
    ])),
    result("mobile surface inventory exists", clean([
      inventory.length >= 12 ? "" : "Inventory should include major Teoyube surfaces.",
      surfaceReport.surfaceCount === inventory.length ? "" : "Surface report count should match inventory."
    ])),
    result("responsive breakpoints exist", clean([
      breakpoints.length >= 6 ? "" : "Responsive breakpoints are incomplete."
    ])),
    result("performance budget exists", clean([
      defaultBudget.initialLoadMs > 0 ? "" : "Default initial load budget should be positive.",
      performance.surfaceCount > 0 ? "" : "Performance readiness report should include surfaces."
    ])),
    result("cache and offline strategy exists", clean([
      cache.cacheTargets.length ? "" : "Cache strategy is missing targets.",
      offline.readOnlySurfaces.length ? "" : "Offline strategy is missing read-only surfaces.",
      getOfflineSafetyRules().length ? "" : "Offline safety rules are missing."
    ])),
    result("analytics readiness does not send externally", clean([
      analytics.valid ? "" : analytics.errors.join("; "),
      analytics.status === "planned" ? "" : "Analytics readiness should be planned.",
      analytics.warnings.some((warning) => warning.toLowerCase().includes("do not send analytics externally"))
        ? ""
        : "Analytics privacy warnings should forbid external sending."
    ])),
    result("persistence readiness has no database dependency", clean([
      persistence.valid ? "" : persistence.errors.join("; "),
      persistence.status === "planned" ? "" : "Persistence readiness should be planned.",
      persistence.warnings.some((warning) => warning.toLowerCase().includes("future work"))
        ? ""
        : "Persistence warnings should keep database work future-only."
    ])),
    result("mobile safety and accessibility checklists exist", clean([
      safety.length ? "" : "Mobile safety checklist is missing.",
      accessibility.length ? "" : "Mobile accessibility checklist is missing."
    ])),
    result("architecture audit returns structured report", clean([
      audit.complete ? "" : "Architecture audit should be complete.",
      audit.completionPercentage === 100 ? "" : "Architecture audit should be 100%.",
      audit.nextStep === "Production Launch Preparation"
        ? ""
        : "Architecture audit should point to Production Launch Preparation after Phase 7 completion."
    ])),
    result("no external APIs databases storage or analytics providers are required", clean([
      cache.implementationNote.includes("does not implement browser storage")
        ? ""
        : "Cache strategy should not implement browser storage.",
      offline.implementationNote.includes("does not add a service worker")
        ? ""
        : "Offline strategy should not add service workers.",
      example.analytics.externalProviderConnected
        ? "Example should not connect external analytics."
        : "",
      example.persistence.forbiddenInPhase71.includes("production database writes")
        ? ""
        : "Example should forbid production database writes."
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
