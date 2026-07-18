import type { TeoyubeLaunchDayMonitoringBlocker, TeoyubeLaunchDayMonitoringCheck, TeoyubeLaunchDayMonitoringWarning, TeoyubeLaunchDaySurfaceHealthStatus } from "./launch-day-monitoring-contracts";

export type TeoyubeSurfaceHealthMonitoringRun = {
  id: string;
  label: string;
  surfaces: string[];
  results: TeoyubeLaunchDaySurfaceHealthStatus[];
  manualOnly: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export const LAUNCH_DAY_REQUIRED_SURFACES = [
  "Canon",
  "Daily Word",
  "Prayer",
  "Calling Compass",
  "Promise Cluster",
  "AI Companion",
  "Onboarding",
  "TIG Response Panel",
  "TIG Graph Preview",
  "Personalization Preview Panel",
  "Consent Controls",
  "Feedback Controls",
  "Offline Fallback",
  "Mobile Navigation",
  "Error/Fallback States"
];

function item(id: string, label: string): TeoyubeLaunchDayMonitoringCheck {
  return { id, label, phase: "surface_health_review", required: true, launchCritical: true, details: label };
}

export function getLaunchDaySurfaceHealthChecklist(): TeoyubeLaunchDayMonitoringCheck[] {
  return LAUNCH_DAY_REQUIRED_SURFACES.map((surface) => item(`surface_${surface.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`, `${surface} health reviewed`));
}

export function createSurfaceHealthMonitoringRun(input: Partial<TeoyubeSurfaceHealthMonitoringRun> = {}): TeoyubeSurfaceHealthMonitoringRun {
  return {
    id: input.id || "launch_day_surface_health_4_2",
    label: input.label || "Launch Day Surface Health Monitoring",
    surfaces: input.surfaces || LAUNCH_DAY_REQUIRED_SURFACES,
    results: input.results || [],
    manualOnly: true,
    inMemoryOnly: true,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function recordSurfaceHealthResult(
  run: TeoyubeSurfaceHealthMonitoringRun,
  surface: string,
  result: Partial<TeoyubeLaunchDaySurfaceHealthStatus> = {}
): TeoyubeSurfaceHealthMonitoringRun {
  const normalized: TeoyubeLaunchDaySurfaceHealthStatus = {
    surface,
    loadStatus: result.loadStatus || "ready",
    mobileStatus: result.mobileStatus || "ready",
    accessibilityStatus: result.accessibilityStatus || "ready",
    scriptureAnchorStatus: result.scriptureAnchorStatus || "ready",
    explanationPathStatus: result.explanationPathStatus || "ready",
    fallbackStatus: result.fallbackStatus || "ready",
    confidenceLabelStatus: result.confidenceLabelStatus || "ready",
    consentStatus: result.consentStatus || "ready",
    feedbackStatus: result.feedbackStatus || "ready",
    debugSafetyStatus: result.debugSafetyStatus || "ready",
    privacyStatus: result.privacyStatus || "ready",
    notes: (result.notes || []).map((note) => note.replace(/\b[\w.+-]+@[\w.-]+\.\w+\b/g, "[redacted-email]")),
    blocker: result.blocker ?? false,
    warning: result.warning ?? false,
    recordedManually: true
  };

  return { ...run, results: [...run.results.filter((entry) => entry.surface !== surface), normalized] };
}

export function summarizeSurfaceHealthMonitoring(run: TeoyubeSurfaceHealthMonitoringRun) {
  return {
    surfaceCount: run.surfaces.length,
    recordedSurfaceCount: run.results.length,
    blockerCount: run.results.filter((entry) => entry.blocker).length,
    warningCount: run.results.filter((entry) => entry.warning).length,
    missingSurfaceCount: run.surfaces.filter((surface) => !run.results.some((entry) => entry.surface === surface)).length,
    manualOnly: run.manualOnly,
    inMemoryOnly: run.inMemoryOnly
  };
}

function isBlocked(status: string): boolean {
  return status === "blocked" || status === "needs_review";
}

export function getSurfaceHealthBlockers(run: TeoyubeSurfaceHealthMonitoringRun): TeoyubeLaunchDayMonitoringBlocker[] {
  return run.results
    .filter((entry) =>
      entry.blocker ||
      isBlocked(entry.loadStatus) ||
      isBlocked(entry.scriptureAnchorStatus) ||
      isBlocked(entry.explanationPathStatus) ||
      isBlocked(entry.fallbackStatus) ||
      isBlocked(entry.consentStatus) ||
      isBlocked(entry.debugSafetyStatus) ||
      isBlocked(entry.privacyStatus)
    )
    .map((entry) => ({
      id: `surface_health_${entry.surface.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      label: `${entry.surface} surface blocker`,
      phase: "surface_health_review",
      severity: "critical",
      reason: entry.notes.join(" ") || "Surface health result contains a launch-critical status.",
      requiredAction: "Pause for owner review and resolve the surface health blocker."
    }));
}

export function getSurfaceHealthWarnings(run: TeoyubeSurfaceHealthMonitoringRun): TeoyubeLaunchDayMonitoringWarning[] {
  const missing = run.surfaces.filter((surface) => !run.results.some((entry) => entry.surface === surface));

  return [
    ...missing.map((surface) => ({
      id: `surface_health_missing_${surface.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
      label: `${surface} not recorded`,
      phase: "surface_health_review" as const,
      severity: "medium" as const,
      message: `${surface} has not been manually reviewed yet.`,
      recommendedAction: "Record manual surface health before daily review."
    })),
    ...run.results
      .filter((entry) => entry.warning)
      .map((entry) => ({
        id: `surface_health_warning_${entry.surface.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
        label: `${entry.surface} warning`,
        phase: "surface_health_review" as const,
        severity: "medium" as const,
        message: entry.notes.join(" ") || "Surface health warning recorded.",
        recommendedAction: "Document warning and review during daily launch review."
      }))
  ];
}

export function createSurfaceHealthMonitoringReport(run: TeoyubeSurfaceHealthMonitoringRun = createSurfaceHealthMonitoringRun()) {
  const blockers = getSurfaceHealthBlockers(run);
  const warnings = getSurfaceHealthWarnings(run);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    run,
    summary: summarizeSurfaceHealthMonitoring(run),
    blockers,
    warnings,
    requiredSurfaces: LAUNCH_DAY_REQUIRED_SURFACES,
    noAutomatedMonitoringPerformed: true,
    generatedAt: new Date().toISOString()
  };
}
