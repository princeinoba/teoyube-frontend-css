import type {
  TeoyubeMobileSurface,
  TeoyubePerformanceBudget,
  TeoyubeScaleReadinessStatus
} from "./mobile-scale-contracts";

const DEFAULT_BUDGET: TeoyubePerformanceBudget = {
  surface: "unknown",
  initialLoadMs: 2500,
  interactionResponseMs: 150,
  maxClientBundleKb: 220,
  maxGraphNodesRendered: 35,
  maxCardsRendered: 18,
  maxEventPayloadKb: 12,
  personalizationPreviewBudgetMs: 600,
  slowNetworkStrategy: "Render primary Scripture response first; defer graph and debug panels.",
  cacheRequired: true,
  offlineReadOnlySupported: true
};

const SURFACE_OVERRIDES: Partial<Record<TeoyubeMobileSurface, Partial<TeoyubePerformanceBudget>>> = {
  daily_word: {
    initialLoadMs: 1800,
    maxCardsRendered: 8,
    maxGraphNodesRendered: 8
  },
  promise_cluster: {
    initialLoadMs: 2400,
    maxGraphNodesRendered: 18,
    maxCardsRendered: 14
  },
  ai_companion: {
    initialLoadMs: 2600,
    personalizationPreviewBudgetMs: 700,
    maxCardsRendered: 12
  },
  tig_graph_preview: {
    initialLoadMs: 3000,
    maxGraphNodesRendered: 24,
    maxCardsRendered: 10,
    slowNetworkStrategy: "Show list summary first; render graph only after the primary response is readable."
  },
  personalization_preview: {
    initialLoadMs: 2600,
    personalizationPreviewBudgetMs: 800,
    maxCardsRendered: 12
  }
};

export function getDefaultTeoyubePerformanceBudget(): TeoyubePerformanceBudget {
  return { ...DEFAULT_BUDGET };
}

export function getSurfacePerformanceBudget(
  surface: TeoyubeMobileSurface
): TeoyubePerformanceBudget {
  return {
    ...DEFAULT_BUDGET,
    ...SURFACE_OVERRIDES[surface],
    surface
  };
}

export function getPerformanceRiskWarnings(surfacePlan: TeoyubePerformanceBudget): string[] {
  const warnings: string[] = [];

  if (surfacePlan.initialLoadMs > 3000) warnings.push("Initial load budget is above mobile target.");
  if (surfacePlan.maxClientBundleKb > 250) warnings.push("Client bundle budget may be high for slow mobile networks.");
  if (surfacePlan.maxGraphNodesRendered > 30) warnings.push("Graph node budget may be too dense for mobile rendering.");
  if (surfacePlan.maxCardsRendered > 20) warnings.push("Card count may cause long mobile scrolling.");
  if (surfacePlan.maxEventPayloadKb > 16) warnings.push("Event payload budget should stay compact before analytics connection.");
  if (!surfacePlan.cacheRequired) warnings.push("Caching should be planned for mobile scale.");
  if (!surfacePlan.offlineReadOnlySupported) warnings.push("Offline read-only fallback should be planned.");

  return warnings;
}

export function validateSurfacePerformancePlan(surfacePlan: TeoyubePerformanceBudget): {
  valid: boolean;
  status: TeoyubeScaleReadinessStatus;
  warnings: string[];
} {
  const warnings = getPerformanceRiskWarnings(surfacePlan);

  return {
    valid: warnings.length === 0,
    status: warnings.length === 0 ? "planned" : "needs_work",
    warnings
  };
}

export function createPhase7PerformanceReadinessReport(): {
  status: TeoyubeScaleReadinessStatus;
  surfaceCount: number;
  budgets: TeoyubePerformanceBudget[];
  warnings: string[];
} {
  const surfaces: TeoyubeMobileSurface[] = [
    "canon",
    "daily_word",
    "prayer",
    "calling_compass",
    "promise_cluster",
    "ai_companion",
    "onboarding",
    "personalization_controls",
    "feedback_controls",
    "tig_response_panel",
    "tig_graph_preview",
    "personalization_preview"
  ];
  const budgets = surfaces.map(getSurfacePerformanceBudget);
  const warnings = budgets.flatMap((budget) =>
    getPerformanceRiskWarnings(budget).map((warning) => `${budget.surface}: ${warning}`)
  );

  return {
    status: warnings.length ? "needs_work" : "planned",
    surfaceCount: surfaces.length,
    budgets,
    warnings
  };
}
