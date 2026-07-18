export type TeoyubeRouteQaStatus = "passed" | "warning" | "blocked" | "not_run" | "unknown";

export type TeoyubeRouteQaArea =
  | "home"
  | "canon"
  | "daily_word"
  | "word"
  | "promise"
  | "prayer"
  | "compass"
  | "tig"
  | "graph"
  | "privacy"
  | "known_limitations"
  | "fallback"
  | "not_found"
  | "unknown";

export type TeoyubeRouteQaRoute = {
  id: string;
  path: string;
  sourceFile: string;
  area: TeoyubeRouteQaArea;
  expectedComponent: string;
  publicFacing: boolean;
  dependsOnRealData: boolean;
  shouldShowScriptureAnchors: boolean;
  shouldShowExplanationTraces: boolean;
  shouldShowConfidenceLabels: boolean;
  shouldShowPrivacyConsentKnownLimitations: boolean;
  hasFallbackBehavior: boolean;
};

export type TeoyubeRouteQaCheck = {
  id: string;
  routeId: string;
  label: string;
  passed: boolean;
  details: string;
};

export type TeoyubeRouteQaResult = {
  routeId: string;
  status: TeoyubeRouteQaStatus;
  notes: string;
};

export type TeoyubeRouteQaBlocker = {
  routeId: string;
  message: string;
};

export type TeoyubeRouteQaWarning = {
  routeId: string;
  message: string;
};

export type TeoyubeRouteQaDecision = "routes_ready" | "routes_ready_with_warnings" | "blocked_by_routes" | "not_run";

export type TeoyubeRouteQaReport = {
  valid: boolean;
  decision: TeoyubeRouteQaDecision;
  routes: TeoyubeRouteQaRoute[];
  results: TeoyubeRouteQaResult[];
  blockers: TeoyubeRouteQaBlocker[];
  warnings: TeoyubeRouteQaWarning[];
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};
