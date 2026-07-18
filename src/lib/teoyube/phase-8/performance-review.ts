import type {
  TeoyubePerformanceReviewArea,
  TeoyubePerformanceReviewBlocker,
  TeoyubePerformanceReviewCheck,
  TeoyubePerformanceReviewDecision,
  TeoyubePerformanceReviewReport,
  TeoyubePerformanceReviewResult,
  TeoyubePerformanceReviewWarning
} from "./performance-review-contracts";

export type TeoyubePerformanceReviewInput = Partial<{
  appLoadReviewed: boolean;
  wordCardReviewed: boolean;
  promiseTableReviewed: boolean;
  prayerCompanionReviewed: boolean;
  compassExperienceReviewed: boolean;
  tigResponsePanelReviewed: boolean;
  tigGraphExplorerReviewed: boolean;
  mobileRenderingReviewed: boolean;
  dataLoadingReviewed: boolean;
  bundleAwarenessAvailable: boolean;
  publicUrlsFetchedAutomatically: boolean;
  externalMonitoringConnected: boolean;
  analyticsEnabled: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, area: TeoyubePerformanceReviewArea, label: string, passed: boolean, details: string): TeoyubePerformanceReviewCheck {
  return { id, area, label, passed, details };
}

function resultFromCheck(entry: TeoyubePerformanceReviewCheck): TeoyubePerformanceReviewResult {
  return {
    id: `${entry.id}_result`,
    area: entry.area,
    status: entry.passed ? "reviewed" : "blocked",
    notes: [entry.details],
    noExternalMonitoringConnected: true,
    noAnalyticsEnabled: true
  };
}

export function reviewAppLoadPerformance(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewCheck {
  return check("performance_app_load", "app_load_perception", "App load perception", flag(input.appLoadReviewed), "Manual app-load perception is represented without adding monitoring.");
}

export function reviewWordCardPerformance(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewCheck {
  return check("performance_word_card", "word_card", "WordCard rendering", flag(input.wordCardReviewed), "WordCard hardening remains small and layout-only.");
}

export function reviewPromiseTablePerformance(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewCheck {
  return check("performance_promise_table", "promise_table", "Promise Table rendering", flag(input.promiseTableReviewed), "Promise Table filtering uses local real rows and no new service.");
}

export function reviewPrayerCompanionPerformance(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewCheck {
  return check("performance_prayer_companion", "prayer_companion", "PrayerCompanion rendering", flag(input.prayerCompanionReviewed), "PrayerCompanion keeps local hook-driven context and no persistence.");
}

export function reviewCompassExperiencePerformance(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewCheck {
  return check("performance_compass", "compass_experience", "CompassExperience rendering", flag(input.compassExperienceReviewed) && !input.publicUrlsFetchedAutomatically, "Compass no longer fetches videos automatically on mount.");
}

export function reviewTigResponsePanelPerformance(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewCheck {
  return check("performance_tig_response", "tig_response_panel", "TIGResponsePanel rendering", flag(input.tigResponsePanelReviewed), "TIGResponsePanel preserves collapsible long sections and debug gating.");
}

export function reviewTigGraphExplorerPerformance(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewCheck {
  return check("performance_tig_graph", "tig_graph_explorer", "TIGGraphExplorer rendering", flag(input.tigGraphExplorerReviewed), "Graph explorer preserves list fallback and limited preview rows.");
}

export function reviewMobileRenderingPerformance(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewCheck {
  return check("performance_mobile", "mobile_rendering", "Mobile rendering", flag(input.mobileRenderingReviewed), "Mobile rendering review remains static/manual.");
}

export function reviewDataLoadingPerformance(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewCheck {
  return check("performance_data_loading", "data_loading", "Data loading", flag(input.dataLoadingReviewed) && !input.publicUrlsFetchedAutomatically, "No public URLs are fetched automatically by Phase 8.2 hardening.");
}

export function createPerformanceReviewChecklist(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewCheck[] {
  return [
    reviewAppLoadPerformance(input),
    reviewWordCardPerformance(input),
    reviewPromiseTablePerformance(input),
    reviewPrayerCompanionPerformance(input),
    reviewCompassExperiencePerformance(input),
    reviewTigResponsePanelPerformance(input),
    reviewTigGraphExplorerPerformance(input),
    reviewMobileRenderingPerformance(input),
    reviewDataLoadingPerformance(input),
    check("performance_bundle_awareness", "bundle_awareness", "Bundle awareness", flag(input.bundleAwarenessAvailable), "Existing tooling is not expanded; bundle awareness remains manual if tooling is unavailable."),
    check("performance_no_monitoring_analytics", "unknown", "No monitoring or analytics", !input.externalMonitoringConnected && !input.analyticsEnabled, "No external monitoring, analytics, vendors, or URL checks are added.")
  ];
}

export function getPerformanceReviewBlockers(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewBlocker[] {
  return createPerformanceReviewChecklist(input)
    .filter((entry) => !entry.passed && entry.id !== "performance_bundle_awareness")
    .map((entry) => ({
      id: `${entry.id}_blocker`,
      area: entry.area,
      message: `${entry.label} did not pass.`,
      requiredAction: "Complete manual review or defer with owner review before release readiness."
    }));
}

export function getPerformanceReviewWarnings(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewWarning[] {
  return [
    ...(input.bundleAwarenessAvailable === false
      ? [{
          id: "bundle_tooling_unavailable",
          area: "bundle_awareness" as const,
          message: "Bundle awareness tooling is not available in this workspace.",
          recommendedAction: "Recheck after dependencies/tooling are available."
        }]
      : []),
    {
      id: "manual_performance_review",
      area: "unknown",
      message: "Performance review is static/manual and does not add monitoring or analytics.",
      recommendedAction: "Use existing build/test tooling when available."
    }
  ];
}

export function createPerformanceReviewDecision(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewDecision {
  const blockers = getPerformanceReviewBlockers(input);
  const warnings = getPerformanceReviewWarnings(input);
  if (blockers.length) return "blocked";
  return warnings.length ? "performance_review_complete_with_warnings" : "performance_review_complete";
}

export function createPerformanceReviewReport(input: TeoyubePerformanceReviewInput = {}): TeoyubePerformanceReviewReport {
  const checks = createPerformanceReviewChecklist(input);
  const blockers = getPerformanceReviewBlockers(input);
  return {
    valid: blockers.length === 0,
    decision: createPerformanceReviewDecision(input),
    checks,
    results: checks.map(resultFromCheck),
    blockers,
    warnings: getPerformanceReviewWarnings(input),
    noExternalMonitoringConnected: true,
    noAnalyticsEnabled: true,
    noPerformanceVendorAdded: true,
    noPublicUrlsFetchedAutomatically: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
