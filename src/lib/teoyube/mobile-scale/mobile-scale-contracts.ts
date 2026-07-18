export type TeoyubeMobileSurface =
  | "canon"
  | "daily_word"
  | "prayer"
  | "calling_compass"
  | "promise_cluster"
  | "ai_companion"
  | "onboarding"
  | "personalization_controls"
  | "feedback_controls"
  | "tig_response_panel"
  | "tig_graph_preview"
  | "personalization_preview"
  | "unknown";

export type TeoyubeResponsiveBreakpoint =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl";

export type TeoyubeMobileLayoutMode =
  | "mobile_compact"
  | "mobile_expanded"
  | "tablet"
  | "desktop"
  | "unknown";

export type TeoyubeScaleReadinessStatus =
  | "ready"
  | "planned"
  | "needs_work"
  | "blocked";

export type TeoyubeMobileRiskLevel = "low" | "medium" | "high";
export type TeoyubeMobilePriority = "critical" | "high" | "medium" | "low";

export type TeoyubePerformanceBudget = {
  surface: TeoyubeMobileSurface;
  initialLoadMs: number;
  interactionResponseMs: number;
  maxClientBundleKb: number;
  maxGraphNodesRendered: number;
  maxCardsRendered: number;
  maxEventPayloadKb: number;
  personalizationPreviewBudgetMs: number;
  slowNetworkStrategy: string;
  cacheRequired: boolean;
  offlineReadOnlySupported: boolean;
};

export type TeoyubeOfflineStrategy = {
  id: string;
  label: string;
  status: TeoyubeScaleReadinessStatus;
  readOnlySurfaces: TeoyubeMobileSurface[];
  cacheableData: string[];
  blockedWhenOffline: string[];
  fallbackBehavior: string;
  safetyRules: string[];
  implementationNote: string;
};

export type TeoyubeCacheStrategy = {
  id: string;
  label: string;
  status: TeoyubeScaleReadinessStatus;
  cacheTargets: string[];
  invalidationRules: string[];
  consentBoundaries: string[];
  privacyRules: string[];
  implementationNote: string;
};

export type TeoyubeAnalyticsConnectionPlan = {
  id: string;
  label: string;
  status: TeoyubeScaleReadinessStatus;
  eventSources: string[];
  plannedEvents: string[];
  privacyRules: string[];
  externalProviderConnected: false;
  implementationNote: string;
};

export type TeoyubePersistenceReadinessPlan = {
  id: string;
  label: string;
  status: TeoyubeScaleReadinessStatus;
  futureEntities: string[];
  consentRequiredEntities: string[];
  forbiddenInPhase71: string[];
  safetyRules: string[];
  implementationNote: string;
};

export type TeoyubeDeploymentReadinessPlan = {
  id: string;
  label: string;
  status: TeoyubeScaleReadinessStatus;
  plannedChecks: string[];
  blockedUntil: string[];
  implementationNote: string;
};

export type TeoyubeMobilePersonalizationControl = {
  id: string;
  label: string;
  surface: TeoyubeMobileSurface;
  required: boolean;
  mobileRequirement: string;
  consentBoundary: string;
};

export type TeoyubeMobileSafetyRequirement = {
  id: string;
  label: string;
  surface: TeoyubeMobileSurface | "all";
  required: boolean;
  status: TeoyubeScaleReadinessStatus;
  requirement: string;
  verificationMethod: string;
};

export type TeoyubeMobileSurfaceInventoryItem = {
  id: TeoyubeMobileSurface;
  label: string;
  route?: string;
  primaryComponent?: string;
  currentMobileReadinessEstimate: number;
  mobileRiskLevel: TeoyubeMobileRiskLevel;
  priority: TeoyubeMobilePriority;
  requiredImprovements: string[];
  productionDependency: string;
  personalizationDependency: string;
};

export type TeoyubeResponsiveRule = {
  id: string;
  surface: TeoyubeMobileSurface | "all";
  layoutMode: TeoyubeMobileLayoutMode;
  rule: string;
  rationale: string;
};

export type TeoyubePhase7ReadinessReport = {
  phase:
    | "Phase 7.1 - Mobile & Scale Architecture Planning"
    | "Phase 7.2 - Mobile UI Optimization"
    | "Phase 7.3 - Performance, Cache & Offline Readiness"
    | "Phase 7.4 - Scale Readiness & Deployment Preparation"
    | "Phase 7.5 - Final Mobile & Scale Completion Audit";
  complete: boolean;
  completionPercentage: number;
  completedItems: string[];
  missingItems: string[];
  warnings: string[];
  mobileReadiness: TeoyubeScaleReadinessStatus;
  scaleReadiness: TeoyubeScaleReadinessStatus;
  safetyReadiness: TeoyubeScaleReadinessStatus;
  nextStep:
    | "Phase 7.2 - Mobile UI Optimization"
    | "Phase 7.3 - Performance, Cache & Offline Readiness"
    | "Phase 7.4 - Scale Readiness & Deployment Preparation"
    | "Phase 7.5 - Final Mobile & Scale Completion Audit"
    | "Production Launch Preparation";
};
