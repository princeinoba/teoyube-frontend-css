import type {
  TeoyubeRouteQaArea,
  TeoyubeRouteQaBlocker,
  TeoyubeRouteQaCheck,
  TeoyubeRouteQaDecision,
  TeoyubeRouteQaReport,
  TeoyubeRouteQaResult,
  TeoyubeRouteQaRoute,
  TeoyubeRouteQaWarning
} from "./route-qa-contracts";

function route(id: string, path: string, sourceFile: string, area: TeoyubeRouteQaArea, expectedComponent: string, options: Partial<TeoyubeRouteQaRoute> = {}): TeoyubeRouteQaRoute {
  return {
    id,
    path,
    sourceFile,
    area,
    expectedComponent,
    publicFacing: options.publicFacing ?? true,
    dependsOnRealData: options.dependsOnRealData ?? false,
    shouldShowScriptureAnchors: options.shouldShowScriptureAnchors ?? false,
    shouldShowExplanationTraces: options.shouldShowExplanationTraces ?? false,
    shouldShowConfidenceLabels: options.shouldShowConfidenceLabels ?? false,
    shouldShowPrivacyConsentKnownLimitations: options.shouldShowPrivacyConsentKnownLimitations ?? false,
    hasFallbackBehavior: options.hasFallbackBehavior ?? true
  };
}

export function createRouteQaInventory(input: { runtimeAvailable?: boolean } = {}): TeoyubeRouteQaRoute[] {
  return [
    route("home", "/", "teoyube-app/app/page.tsx", "home", "HomePage", { dependsOnRealData: true, shouldShowScriptureAnchors: true, shouldShowExplanationTraces: true, shouldShowConfidenceLabels: true }),
    route("explore", "/explore", "teoyube-app/app/explore/page.tsx", "canon", "ExplorePage", { dependsOnRealData: true, shouldShowScriptureAnchors: true }),
    route("prayer", "/prayer", "teoyube-app/app/prayer/page.tsx", "prayer", "PrayerPage", { dependsOnRealData: true, shouldShowScriptureAnchors: true, shouldShowExplanationTraces: true, shouldShowConfidenceLabels: true }),
    route("compass", "/compass", "teoyube-app/app/compass/page.tsx", "compass", "CompassPage", { dependsOnRealData: true, shouldShowScriptureAnchors: true, shouldShowExplanationTraces: true, shouldShowConfidenceLabels: true }),
    route("tig", "/tig", "teoyube-app/app/tig/page.tsx", "tig", "TIGPage", { dependsOnRealData: true, shouldShowExplanationTraces: true, shouldShowConfidenceLabels: true, shouldShowPrivacyConsentKnownLimitations: true }),
    route("tig_graph", "/tig/graph", "teoyube-app/app/tig/graph/page.tsx", "graph", "TIGGraphPage", { dependsOnRealData: true, shouldShowScriptureAnchors: true, shouldShowExplanationTraces: true }),
    route("tig_journey", "/tig/journey", "teoyube-app/app/tig/journey/page.tsx", "tig", "TIGJourneyPage", { dependsOnRealData: true, shouldShowExplanationTraces: true }),
    route("privacy", "/privacy", "teoyube-app/app/privacy/page.tsx", "privacy", "PrivacyPage", { shouldShowPrivacyConsentKnownLimitations: true }),
    route("consent", "/consent", "teoyube-app/app/consent/page.tsx", "privacy", "ConsentPage", { shouldShowPrivacyConsentKnownLimitations: true }),
    route("terms", "/terms", "teoyube-app/app/terms/page.tsx", "privacy", "TermsPage", { shouldShowPrivacyConsentKnownLimitations: true }),
    route("journal", "/journal", "teoyube-app/app/journal/page.tsx", "unknown", "JournalPage", { dependsOnRealData: false }),
    route("profile", "/profile", "teoyube-app/app/profile/page.tsx", "unknown", "ProfilePage", { dependsOnRealData: false }),
    route("tig_debug", "/tig/debug", "teoyube-app/app/tig/debug/page.tsx", "unknown", "TIGDebugPage", { publicFacing: false, dependsOnRealData: true, shouldShowScriptureAnchors: true, shouldShowExplanationTraces: true }),
    route("api_daily_word", "/api/daily-word", "teoyube-app/app/api/daily-word/route.ts", "daily_word", "GET", { publicFacing: false, dependsOnRealData: true }),
    route("api_tig", "/api/tig", "teoyube-app/app/api/tig/route.ts", "tig", "POST", { publicFacing: false, dependsOnRealData: true })
  ].map((entry) => input.runtimeAvailable ? entry : { ...entry });
}

export function createRouteQaChecklist(routes: TeoyubeRouteQaRoute[]): TeoyubeRouteQaCheck[] {
  return routes.flatMap((entry) => [
    { id: `${entry.id}_source`, routeId: entry.id, label: "Source file inventoried", passed: Boolean(entry.sourceFile), details: entry.sourceFile },
    { id: `${entry.id}_fallback`, routeId: entry.id, label: "Fallback behavior expected", passed: entry.hasFallbackBehavior, details: "Route has or should have safe fallback behavior." }
  ]);
}

export function recordRouteQaResult(results: TeoyubeRouteQaResult[], result: TeoyubeRouteQaResult): TeoyubeRouteQaResult[] {
  return [...results.filter((entry) => entry.routeId !== result.routeId), result];
}

export function getRouteQaBlockers(results: TeoyubeRouteQaResult[]): TeoyubeRouteQaBlocker[] {
  return results.filter((entry) => entry.status === "blocked").map((entry) => ({ routeId: entry.routeId, message: entry.notes }));
}

export function getRouteQaWarnings(results: TeoyubeRouteQaResult[]): TeoyubeRouteQaWarning[] {
  return results.filter((entry) => entry.status === "warning" || entry.status === "not_run").map((entry) => ({ routeId: entry.routeId, message: entry.notes }));
}

export function createRouteQaDecision(results: TeoyubeRouteQaResult[]): TeoyubeRouteQaDecision {
  if (!results.length || results.every((entry) => entry.status === "not_run")) return "not_run";
  if (getRouteQaBlockers(results).length) return "blocked_by_routes";
  return getRouteQaWarnings(results).length ? "routes_ready_with_warnings" : "routes_ready";
}

export function createRouteQaReport(results: TeoyubeRouteQaResult[] = createRouteQaInventory().map((entry) => ({
  routeId: entry.id,
  status: "not_run" as const,
  notes: "Route source is inventoried, but local rendering was not run because the Next runtime is unavailable."
}))): TeoyubeRouteQaReport {
  return {
    valid: getRouteQaBlockers(results).length === 0,
    decision: createRouteQaDecision(results),
    routes: createRouteQaInventory(),
    results,
    blockers: getRouteQaBlockers(results),
    warnings: getRouteQaWarnings(results),
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
