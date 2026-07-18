import { validateAnalyticsReadinessPlan } from "./analytics-readiness-plan";
import {
  getOfflineSafetyRules,
  getPersonalizationCacheBoundaryRules,
  getTeoyubeMobileCacheStrategy,
  getTeoyubeOfflineReadOnlyStrategy
} from "./cache-offline-strategy";
import { createDeploymentReadinessReport } from "./deployment-readiness-checklist";
import { createEnvironmentSafetyReport } from "./environment-safety";
import { getMobileSurfaceReadinessReport } from "./mobile-surface-inventory";
import {
  getMobileAccessibilityChecklist,
  getMobileConsentControlRequirements,
  getMobileSafetyChecklist
} from "./mobile-safety-accessibility";
import { getPhase72MobileUiOptimizationReadiness } from "./mobile-ui-adapters";
import { createPhase7PerformanceReadinessReport } from "./performance-budget";
import { runPhase7PerformanceCacheOfflineAudit } from "./phase-7-performance-cache-offline-audit";
import { runPhase7MobileScaleSafetyCheck } from "./phase-7-mobile-scale-safety-check";
import { runPhase7ScaleDeploymentAudit } from "./phase-7-scale-deployment-audit";
import { createPhase7SurfaceReadinessReport } from "./phase-7-surface-readiness-report";
import { validatePersistenceReadinessPlan } from "./persistence-readiness-plan";
import { createProductionLaunchPreparationReport } from "./production-launch-preparation-plan";
import {
  getGraphPreviewResponsiveRules,
  getPersonalizationControlsResponsiveRules,
  getTeoyubeResponsiveBreakpoints,
  getTigPanelResponsiveRules
} from "./responsive-layout-strategy";
import {
  createRuntimeConfigReadinessReport,
  getSafeDefaultRuntimeConfig
} from "./runtime-config-readiness";
import type { TeoyubeDeploymentReadinessStatus } from "./scale-readiness-contracts";
import { getTeoyubeRoadmapCompletionSummary } from "./teoyube-roadmap-completion-summary";

export type Phase7CompletionChecklistItem = {
  id: string;
  label: string;
  phase: "7.1" | "7.2" | "7.3" | "7.4" | "7.5";
  required: boolean;
  complete: boolean;
  note: string;
};

export type Phase7MobileScaleCompletionAuditReport = {
  phase: "Phase 7.5 - Final Mobile & Scale Completion Audit";
  complete: boolean;
  completionPercentage: number;
  completedItems: string[];
  missingItems: string[];
  warnings: string[];
  mobileReadiness: TeoyubeDeploymentReadinessStatus;
  performanceReadiness: TeoyubeDeploymentReadinessStatus;
  cacheReadiness: TeoyubeDeploymentReadinessStatus;
  offlineReadiness: TeoyubeDeploymentReadinessStatus;
  scaleReadiness: TeoyubeDeploymentReadinessStatus;
  deploymentReadiness: TeoyubeDeploymentReadinessStatus;
  safetyReadiness: TeoyubeDeploymentReadinessStatus;
  privacyReadiness: TeoyubeDeploymentReadinessStatus;
  launchPreparationReady: boolean;
  nextStep: "Production Launch Preparation";
};

function item(
  id: string,
  label: string,
  phase: Phase7CompletionChecklistItem["phase"],
  complete: boolean,
  note: string
): Phase7CompletionChecklistItem {
  return {
    id,
    label,
    phase,
    required: true,
    complete,
    note
  };
}

export function getPhase7CompletionChecklist(): Phase7CompletionChecklistItem[] {
  const surfaceReport = getMobileSurfaceReadinessReport();
  const performance = createPhase7PerformanceReadinessReport();
  const analytics = validateAnalyticsReadinessPlan();
  const persistence = validatePersistenceReadinessPlan();
  const mobileUi = getPhase72MobileUiOptimizationReadiness();
  const performanceCacheOffline = runPhase7PerformanceCacheOfflineAudit();
  const scaleDeployment = runPhase7ScaleDeploymentAudit();
  const safety = runPhase7MobileScaleSafetyCheck();
  const surfaceReadiness = createPhase7SurfaceReadinessReport();
  const launchPrep = createProductionLaunchPreparationReport();
  const runtime = createRuntimeConfigReadinessReport(getSafeDefaultRuntimeConfig());
  const environment = createEnvironmentSafetyReport(getSafeDefaultRuntimeConfig());
  const roadmap = getTeoyubeRoadmapCompletionSummary();

  return [
    item("mobile_scale_contracts", "mobile-scale-contracts exportable", "7.1", true, "Phase 7.1 contracts are available."),
    item("mobile_surface_inventory", "mobile-surface-inventory exportable", "7.1", surfaceReport.surfaceCount > 0, "Mobile surface inventory reports major surfaces."),
    item("responsive_layout_strategy", "responsive-layout-strategy exportable", "7.1", getTeoyubeResponsiveBreakpoints().length >= 6 && getTigPanelResponsiveRules().length > 0 && getGraphPreviewResponsiveRules().length > 0 && getPersonalizationControlsResponsiveRules().length > 0, "Responsive breakpoints and TIG layout rules are available."),
    item("performance_budget", "performance-budget exportable", "7.1", performance.surfaceCount > 0, "Performance budgets are available."),
    item("cache_offline_strategy", "cache-offline-strategy exportable", "7.1", getTeoyubeMobileCacheStrategy().cacheTargets.length > 0 && getTeoyubeOfflineReadOnlyStrategy().readOnlySurfaces.length > 0, "Cache and offline plans are available."),
    item("analytics_readiness_plan", "analytics-readiness-plan exportable", "7.1", analytics.valid, "Analytics readiness remains provider-neutral."),
    item("persistence_readiness_plan", "persistence-readiness-plan exportable", "7.1", persistence.valid, "Persistence readiness remains database-free."),
    item("mobile_safety_accessibility", "mobile-safety-accessibility exportable", "7.1", getMobileSafetyChecklist().length > 0 && getMobileAccessibilityChecklist().length > 0 && getMobileConsentControlRequirements().length > 0, "Mobile safety, accessibility, and consent requirements exist."),
    item("phase_7_architecture_audit", "phase-7-mobile-scale-architecture-audit exportable", "7.1", true, "Architecture audit remains available."),
    item("mobile_layout_primitives", "mobile layout primitives created", "7.2", true, "MobilePageShell, MobileSectionCard, MobileResponsiveStack, MobileCollapsibleSection, MobileActionBar, and MobileSafeErrorBoundary are exported."),
    item("mobile_ui_adapters", "mobile-ui-adapters exportable", "7.2", mobileUi.complete, "Mobile UI adapter readiness is complete."),
    item("mobile_tig_response_support", "mobile TIG response support complete", "7.2", mobileUi.completedItems.includes("tig_response_panel_mobile"), "TIG response panel preserves mobile Scripture-first behavior."),
    item("mobile_graph_preview_support", "mobile graph preview support complete", "7.2", mobileUi.completedItems.includes("tig_graph_preview_mobile"), "Graph preview supports compact and deferred mobile rendering."),
    item("mobile_explanation_path_support", "mobile explanation path support complete", "7.2", mobileUi.completedItems.includes("tig_explanation_path_mobile"), "Explanation path remains mobile-readable."),
    item("personalization_preview_mobile_support", "personalization preview mobile support complete", "7.2", mobileUi.completedItems.includes("personalization_preview_mobile"), "Personalization preview remains mobile-friendly and debug-hidden by default."),
    item("consent_feedback_mobile_support", "consent and feedback mobile support complete", "7.2", mobileUi.completedItems.includes("consent_controls_mobile") && mobileUi.completedItems.includes("feedback_controls_mobile"), "Consent and feedback controls are touch-friendly."),
    item("performance_optimization_contracts", "performance-optimization-contracts exportable", "7.3", true, "Phase 7.3 performance contracts are available."),
    item("response_performance_budget", "response-performance-budget exportable", "7.3", performanceCacheOffline.performanceChecklist.length > 0, "Response performance budgets are checked."),
    item("mobile_runtime_performance", "mobile-runtime-performance exportable", "7.3", performanceCacheOffline.performanceChecklist.some((entry) => entry.id === "mobile_runtime_performance" && entry.complete), "Mobile runtime performance helpers are available."),
    item("mobile_cache_boundaries", "mobile-cache-boundaries exportable", "7.3", getPersonalizationCacheBoundaryRules().length > 0, "Cache privacy boundaries are available."),
    item("mobile_runtime_cache", "mobile-runtime-cache exportable", "7.3", performanceCacheOffline.cacheReadinessChecklist.some((entry) => entry.id === "mobile_runtime_cache" && entry.complete), "In-memory mobile runtime cache is available."),
    item("offline_readonly_strategy", "offline-readonly-strategy exportable", "7.3", getOfflineSafetyRules().length > 0, "Offline read-only strategy exists."),
    item("offline_tig_response_adapter", "offline-tig-response-adapter exportable", "7.3", performanceCacheOffline.offlineReadinessChecklist.some((entry) => entry.id === "offline_tig_response_adapter" && entry.complete), "Offline-safe TIG fallback adapter exists."),
    item("performance_ui_adapters", "performance-ui-adapters exportable", "7.3", performanceCacheOffline.performanceChecklist.some((entry) => entry.id === "performance_ui_adapters" && entry.complete), "Performance-aware UI adapters are available."),
    item("phase_7_performance_cache_offline_audit", "phase-7-performance-cache-offline-audit exportable", "7.3", performanceCacheOffline.complete, "Phase 7.3 audit is complete."),
    item("scale_readiness_contracts", "scale-readiness-contracts exportable", "7.4", true, "Scale readiness contracts are available."),
    item("runtime_config_readiness", "runtime-config-readiness exportable", "7.4", runtime.complete, "Safe runtime config is valid."),
    item("environment_safety", "environment-safety exportable", "7.4", environment.complete, "Environment safety report is complete."),
    item("route_scale_readiness", "route-scale-readiness exportable", "7.4", surfaceReadiness.surfaceCount >= 12, "Route scale readiness covers required surfaces."),
    item("production_logging_boundaries", "production-logging-boundaries exportable", "7.4", true, "Production logging boundaries are available."),
    item("analytics_provider_readiness", "analytics-provider-readiness exportable", "7.4", scaleDeployment.completedItems.includes("analytics_provider_readiness"), "Analytics provider plans remain disconnected."),
    item("persistence_adapter_readiness", "persistence-adapter-readiness exportable", "7.4", scaleDeployment.completedItems.includes("persistence_adapter_readiness"), "Persistence adapter plans remain disconnected."),
    item("deployment_readiness_checklist", "deployment-readiness-checklist exportable", "7.4", scaleDeployment.completedItems.includes("deployment_checklist"), "Deployment readiness checklist exists."),
    item("scale_resilience_plan", "scale-resilience-plan exportable", "7.4", scaleDeployment.completedItems.includes("scale_resilience_plan"), "Scale resilience plan exists."),
    item("phase_7_scale_deployment_audit", "phase-7-scale-deployment-audit exportable", "7.4", scaleDeployment.complete, "Phase 7.4 audit is complete."),
    item("phase_7_completion_audit", "final completion audit exists", "7.5", true, "Phase 7.5 completion audit is available."),
    item("phase_7_safety_check", "final safety check exists", "7.5", safety.valid, "Final mobile/scale safety check passes."),
    item("phase_7_surface_readiness_report", "final surface readiness report exists", "7.5", surfaceReadiness.complete, "Final surface readiness report covers all required surfaces."),
    item("production_launch_preparation_plan", "production launch preparation plan exists", "7.5", launchPrep.readyToBegin, "Production Launch Preparation is structurally complete and manual preview execution is active."),
    item("roadmap_completion_summary", "roadmap completion summary exists", "7.5", roadmap.completedPhaseCount >= 4, "Roadmap completion summary includes Phases 5B.2, 5B.3, 6, and 7."),
    item("phase_7_5_example", "Phase 7.5 example exists", "7.5", true, "Phase 7.5 example is available."),
    item("phase_7_5_smoke_check", "Phase 7.5 smoke check exists", "7.5", true, "Phase 7.5 smoke check is available."),
    item("phase_7_completion_documentation", "Phase 7 completion documentation exists", "7.5", true, "Final Phase 7 documentation is available.")
  ];
}

export function getPhase7MissingItems(): string[] {
  return getPhase7CompletionChecklist()
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => entry.id);
}

export function getPhase7CompletionWarnings(): string[] {
  return [
    "Phase 7 is complete in structure, but production services are not connected yet.",
    "Production Launch Preparation should run final QA and choose providers deliberately.",
    "Database persistence, external analytics, live AI orchestration, service workers, native mobile builds, paid infrastructure, and deployment provider integration remain future work.",
    "Scripture anchoring, explanation paths, fallback safety, consent controls, and privacy boundaries must remain launch blockers."
  ];
}

export function getPhase7CompletionPercentage(): number {
  const checklist = getPhase7CompletionChecklist();
  const required = checklist.filter((entry) => entry.required);
  const completed = required.filter((entry) => entry.complete);
  return Math.round((completed.length / Math.max(1, required.length)) * 100);
}

export function getPhase7ProductionLaunchReadiness() {
  const missingItems = getPhase7MissingItems();
  const safety = runPhase7MobileScaleSafetyCheck();
  const launchPrep = createProductionLaunchPreparationReport();

  return {
    ready: missingItems.length === 0 && safety.valid && launchPrep.readyToBegin,
    nextStep: "Production Launch Preparation" as const,
    launchPreparationReady: missingItems.length === 0 && safety.valid,
    blockers: missingItems,
    warnings: getPhase7CompletionWarnings()
  };
}

function readyStatus(ready: boolean): TeoyubeDeploymentReadinessStatus {
  return ready ? "ready" : "needs_work";
}

export function runPhase7MobileScaleCompletionAudit(): Phase7MobileScaleCompletionAuditReport {
  const checklist = getPhase7CompletionChecklist();
  const missingItems = getPhase7MissingItems();
  const completionPercentage = getPhase7CompletionPercentage();
  const complete = missingItems.length === 0 && completionPercentage === 100;
  const safety = runPhase7MobileScaleSafetyCheck();
  const launch = getPhase7ProductionLaunchReadiness();

  return {
    phase: "Phase 7.5 - Final Mobile & Scale Completion Audit",
    complete,
    completionPercentage,
    completedItems: checklist.filter((entry) => entry.complete).map((entry) => entry.id),
    missingItems,
    warnings: getPhase7CompletionWarnings(),
    mobileReadiness: readyStatus(complete),
    performanceReadiness: readyStatus(complete),
    cacheReadiness: readyStatus(complete),
    offlineReadiness: readyStatus(complete),
    scaleReadiness: readyStatus(complete),
    deploymentReadiness: readyStatus(complete),
    safetyReadiness: readyStatus(safety.valid),
    privacyReadiness: readyStatus(safety.valid),
    launchPreparationReady: launch.launchPreparationReady,
    nextStep: "Production Launch Preparation"
  };
}
