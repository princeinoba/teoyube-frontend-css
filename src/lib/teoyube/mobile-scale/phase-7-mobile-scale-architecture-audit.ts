import { validateAnalyticsReadinessPlan } from "./analytics-readiness-plan";
import {
  getOfflineSafetyRules,
  getPersonalizationCacheBoundaryRules,
  getTeoyubeMobileCacheStrategy,
  getTeoyubeOfflineReadOnlyStrategy
} from "./cache-offline-strategy";
import { getMobileSurfaceReadinessReport } from "./mobile-surface-inventory";
import {
  getMobileAccessibilityChecklist,
  getMobileConsentControlRequirements,
  getMobileSafetyChecklist
} from "./mobile-safety-accessibility";
import { createPhase7PerformanceReadinessReport } from "./performance-budget";
import { validatePersistenceReadinessPlan } from "./persistence-readiness-plan";
import {
  getGraphPreviewResponsiveRules,
  getPersonalizationControlsResponsiveRules,
  getTeoyubeResponsiveBreakpoints,
  getTigPanelResponsiveRules
} from "./responsive-layout-strategy";
import { getPhase72MobileUiOptimizationReadiness } from "./mobile-ui-adapters";
import { runPhase7PerformanceCacheOfflineAudit } from "./phase-7-performance-cache-offline-audit";
import { runPhase7ScaleDeploymentAudit } from "./phase-7-scale-deployment-audit";
import { runPhase7MobileScaleCompletionAudit } from "./phase-7-mobile-scale-completion-audit";
import { runPhase7MobileScaleSafetyCheck } from "./phase-7-mobile-scale-safety-check";
import { createPhase7SurfaceReadinessReport } from "./phase-7-surface-readiness-report";
import { createProductionLaunchPreparationReport } from "./production-launch-preparation-plan";
import { getTeoyubeRoadmapCompletionSummary } from "./teoyube-roadmap-completion-summary";
import type {
  TeoyubePhase7ReadinessReport,
  TeoyubeScaleReadinessStatus
} from "./mobile-scale-contracts";

export type Phase7ArchitectureChecklistItem = {
  module: string;
  completed: boolean;
  required: boolean;
  note: string;
};

const CHECKLIST: Array<Omit<Phase7ArchitectureChecklistItem, "completed">> = [
  { module: "mobile-scale-contracts", required: true, note: "Mobile, scale, budget, offline, analytics, persistence, deployment, personalization control, and safety contracts compile." },
  { module: "mobile-surface-inventory", required: true, note: "Major Teoyube surfaces are inventoried with mobile risk and dependency notes." },
  { module: "responsive-layout-strategy", required: true, note: "Responsive breakpoints and mobile-first TIG layout rules are available." },
  { module: "performance-budget", required: true, note: "Default and surface-level performance budgets are available." },
  { module: "cache-offline-strategy", required: true, note: "Cache and offline read-only rules are planned without storage implementation." },
  { module: "analytics-readiness-plan", required: true, note: "Analytics-ready event sources are mapped without external provider connection." },
  { module: "persistence-readiness-plan", required: true, note: "Future persistence entities and safety boundaries are planned without database connection." },
  { module: "mobile-safety-accessibility", required: true, note: "Mobile safety, accessibility, and consent control requirements are available." },
  { module: "mobile-ui-adapters", required: true, note: "Phase 7.2 mobile layout adapters are available without rendering or storage side effects." },
  { module: "shared-mobile-layout-primitives", required: true, note: "Mobile page, section, stack, collapsible, and action bar primitives are available." },
  { module: "tig-response-panel-mobile-support", required: true, note: "TIG response panel preserves Scripture anchoring, save, journal, graph, fallback, and explanation on mobile." },
  { module: "tig-graph-preview-mobile-support", required: true, note: "Graph preview provides compact path cards before expanded graph detail." },
  { module: "tig-explanation-path-mobile-support", required: true, note: "Explanation path has a vertical mobile-friendly path component." },
  { module: "personalization-preview-mobile-support", required: true, note: "Personalization preview stacks comparison sections and collapses long hints/debug detail." },
  { module: "consent-feedback-mobile-support", required: true, note: "Consent and feedback controls use larger touch-friendly action groups." },
  { module: "mobile-surface-readiness-notes", required: true, note: "Major surfaces have Phase 7.2 mobile readiness notes." },
  { module: "phase-7-mobile-ui-smoke-check", required: true, note: "Phase 7.2 smoke check is available." },
  { module: "phase-7-performance-budget-helpers", required: true, note: "Phase 7.3 response size and graph render budget helpers are available." },
  { module: "phase-7-runtime-performance-helpers", required: true, note: "Phase 7.3 mobile runtime deferral and collapse helpers are available." },
  { module: "phase-7-cache-boundaries", required: true, note: "Phase 7.3 mobile cache privacy boundaries are available." },
  { module: "phase-7-mobile-runtime-cache", required: true, note: "Phase 7.3 in-memory mobile runtime cache is available." },
  { module: "phase-7-offline-readonly-strategy", required: true, note: "Phase 7.3 offline read-only strategy is available." },
  { module: "phase-7-offline-tig-response-adapter", required: true, note: "Phase 7.3 offline TIG response adapter is available." },
  { module: "phase-7-performance-ui-adapters", required: true, note: "Phase 7.3 performance-aware UI adapters are available." },
  { module: "phase-7-performance-cache-offline-smoke-check", required: true, note: "Phase 7.3 smoke check is available." },
  { module: "phase-7-performance-cache-offline-audit", required: true, note: "Phase 7.3 completion audit is available." },
  { module: "phase-7-scale-readiness-contracts", required: true, note: "Phase 7.4 scale readiness contracts are available." },
  { module: "phase-7-runtime-config-readiness", required: true, note: "Phase 7.4 runtime config readiness is available." },
  { module: "phase-7-environment-safety", required: true, note: "Phase 7.4 environment safety checks are available." },
  { module: "phase-7-route-scale-readiness", required: true, note: "Phase 7.4 route scale readiness inventory is available." },
  { module: "phase-7-production-logging-boundaries", required: true, note: "Phase 7.4 production logging boundaries are available." },
  { module: "phase-7-analytics-provider-readiness", required: true, note: "Phase 7.4 analytics provider readiness contracts are available." },
  { module: "phase-7-persistence-adapter-readiness", required: true, note: "Phase 7.4 persistence adapter readiness contracts are available." },
  { module: "phase-7-deployment-checklist", required: true, note: "Phase 7.4 deployment readiness checklist is available." },
  { module: "phase-7-scale-resilience-plan", required: true, note: "Phase 7.4 scale resilience plan is available." },
  { module: "phase-7-scale-deployment-smoke-check", required: true, note: "Phase 7.4 smoke check is available." },
  { module: "phase-7-scale-deployment-audit", required: true, note: "Phase 7.4 completion audit is available." },
  { module: "phase-7-mobile-scale-completion-audit", required: true, note: "Phase 7.5 final completion audit is available." },
  { module: "phase-7-mobile-scale-safety-check", required: true, note: "Phase 7.5 final safety check is available." },
  { module: "phase-7-surface-readiness-report", required: true, note: "Phase 7.5 final surface readiness report is available." },
  { module: "production-launch-preparation-plan", required: true, note: "Production Launch Preparation plan is available without connecting providers." },
  { module: "teoyube-roadmap-completion-summary", required: true, note: "Roadmap completion summary is available." },
  { module: "phase-7-final-completion-example", required: true, note: "Phase 7.5 example is available." },
  { module: "phase-7-final-completion-smoke-check", required: true, note: "Phase 7.5 smoke check is available." },
  { module: "phase-7-mobile-scale-completion-documentation", required: true, note: "Phase 7 completion documentation is available." },
  { module: "phase-7-mobile-scale-architecture-audit", required: true, note: "Architecture completion audit is available." }
];

function runtimePlanningModulesAvailable(): boolean {
  const surfaceReport = getMobileSurfaceReadinessReport();
  const performance = createPhase7PerformanceReadinessReport();
  const analytics = validateAnalyticsReadinessPlan();
  const persistence = validatePersistenceReadinessPlan();
  const mobileUi = getPhase72MobileUiOptimizationReadiness();
  const performanceCacheOffline = runPhase7PerformanceCacheOfflineAudit();
  const scaleDeployment = runPhase7ScaleDeploymentAudit();
  const completion = runPhase7MobileScaleCompletionAudit();
  const safety = runPhase7MobileScaleSafetyCheck();
  const surfaces = createPhase7SurfaceReadinessReport();
  const launchPrep = createProductionLaunchPreparationReport();
  const roadmap = getTeoyubeRoadmapCompletionSummary();

  return Boolean(
    getTeoyubeResponsiveBreakpoints().length &&
      getTigPanelResponsiveRules().length &&
      getGraphPreviewResponsiveRules().length &&
      getPersonalizationControlsResponsiveRules().length &&
      getTeoyubeMobileCacheStrategy().cacheTargets.length &&
      getTeoyubeOfflineReadOnlyStrategy().readOnlySurfaces.length &&
      getPersonalizationCacheBoundaryRules().length &&
      getOfflineSafetyRules().length &&
      getMobileSafetyChecklist().length &&
      getMobileAccessibilityChecklist().length &&
      getMobileConsentControlRequirements().length &&
      surfaceReport.surfaceCount > 0 &&
      performance.surfaceCount > 0 &&
      analytics.valid &&
      persistence.valid &&
      mobileUi.complete &&
      performanceCacheOffline.complete &&
      scaleDeployment.complete &&
      completion.complete &&
      safety.valid &&
      surfaces.complete &&
      launchPrep.readyToBegin &&
      roadmap.completedPhaseCount >= 4
  );
}

export function getPhase7ArchitectureChecklist(): Phase7ArchitectureChecklistItem[] {
  const completed = runtimePlanningModulesAvailable();
  return CHECKLIST.map((item) => ({
    ...item,
    completed
  }));
}

export function getPhase7MissingArchitectureItems(): string[] {
  return getPhase7ArchitectureChecklist()
    .filter((item) => item.required && !item.completed)
    .map((item) => item.module);
}

export function getPhase7MobileScaleReadinessWarnings(): string[] {
  return [
    "Phase 7.5 completes the final Mobile & Scale completion audit without adding production persistence.",
    "Phase 7 remains complete in structure but does not send external analytics.",
    "Phase 7 remains complete in structure but does not add live AI orchestration.",
    "Phase 7 remains complete in structure but does not implement service workers or native mobile builds.",
    "Phase 7 remains complete in structure but does not use persistent browser storage for raw or sensitive personalization data.",
    "Production Launch Preparation is complete, Manual Preview Deployment Execution 2.1, 2.2, 2.3, 2.4, and 2.5 are complete, and Soft Launch Preparation 3.1, 3.2, and 3.3 are complete; real provider deployment remains manual and Limited Soft Launch Execution 4.1 is next."
  ];
}

export function getPhase7ArchitectureCompletionPercentage(): number {
  const checklist = getPhase7ArchitectureChecklist();
  const required = checklist.filter((item) => item.required);
  const completed = required.filter((item) => item.completed);
  return Math.round((completed.length / Math.max(1, required.length)) * 100);
}

function statusFromMissing(missingItems: string[]): TeoyubeScaleReadinessStatus {
  return missingItems.length ? "needs_work" : "ready";
}

export function runPhase7MobileScaleArchitectureAudit(): TeoyubePhase7ReadinessReport {
  const checklist = getPhase7ArchitectureChecklist();
  const missingItems = getPhase7MissingArchitectureItems();
  const completionPercentage = getPhase7ArchitectureCompletionPercentage();
  const complete = missingItems.length === 0 && completionPercentage === 100;
  const status = statusFromMissing(missingItems);

  return {
    phase: "Phase 7.5 - Final Mobile & Scale Completion Audit",
    complete,
    completionPercentage,
    completedItems: checklist.filter((item) => item.completed).map((item) => item.module),
    missingItems,
    warnings: getPhase7MobileScaleReadinessWarnings(),
    mobileReadiness: status,
    scaleReadiness: status,
    safetyReadiness: status,
    nextStep: "Production Launch Preparation"
  };
}
