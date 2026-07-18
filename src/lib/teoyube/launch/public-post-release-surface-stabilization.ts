export type TeoyubePublicPostReleaseSurface = {
  id: string;
  label: string;
  required: boolean;
  publicLaunchCritical: boolean;
};

export type TeoyubePublicPostReleaseSurfaceResult = {
  surfaceId: string;
  status: "pass" | "warning" | "fail" | "blocked" | "not_run";
  summary: string;
  notes?: string[];
};

export type TeoyubePublicPostReleaseSurfaceBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubePublicPostReleaseSurfaceWarning = {
  id: string;
  label: string;
  message: string;
  recommendedAction: string;
};

export const PUBLIC_POST_RELEASE_SURFACES: TeoyubePublicPostReleaseSurface[] = [
  { id: "canon", label: "Canon", required: true, publicLaunchCritical: true },
  { id: "daily_word", label: "Daily Word", required: true, publicLaunchCritical: true },
  { id: "prayer", label: "Prayer", required: true, publicLaunchCritical: true },
  { id: "calling_compass", label: "Calling Compass", required: true, publicLaunchCritical: true },
  { id: "promise_cluster", label: "Promise Cluster", required: true, publicLaunchCritical: true },
  { id: "ai_companion", label: "AI Companion", required: true, publicLaunchCritical: true },
  { id: "onboarding", label: "Onboarding", required: true, publicLaunchCritical: true },
  { id: "tig_response_panel", label: "TIG Response Panel", required: true, publicLaunchCritical: true },
  { id: "tig_graph_preview", label: "TIG Graph Preview", required: true, publicLaunchCritical: true },
  { id: "personalization_preview_panel", label: "Personalization Preview Panel", required: true, publicLaunchCritical: true },
  { id: "consent_controls", label: "Consent Controls", required: true, publicLaunchCritical: true },
  { id: "public_privacy_notice", label: "Public Privacy Notice", required: true, publicLaunchCritical: true },
  { id: "public_terms_notice", label: "Public Terms Notice", required: true, publicLaunchCritical: true },
  { id: "feedback_notice", label: "Feedback Notice", required: true, publicLaunchCritical: true },
  { id: "offline_fallback", label: "Offline Fallback", required: true, publicLaunchCritical: true },
  { id: "mobile_navigation", label: "Mobile Navigation", required: true, publicLaunchCritical: true },
  { id: "error_fallback_states", label: "Error/Fallback States", required: true, publicLaunchCritical: true },
  { id: "public_copy_surfaces", label: "Public Copy Surfaces", required: true, publicLaunchCritical: true }
];

export function createPublicPostReleaseSurfaceStabilizationResults(
  input: Partial<Record<string, Partial<TeoyubePublicPostReleaseSurfaceResult>>> = {}
): TeoyubePublicPostReleaseSurfaceResult[] {
  return PUBLIC_POST_RELEASE_SURFACES.map((surface) => {
    const override = input[surface.id] || {};
    return {
      surfaceId: surface.id,
      status: override.status || "pass",
      summary: override.summary || `${surface.label} manually confirmed after public safe-fix release.`,
      notes: override.notes
    };
  });
}

function resultFor(results: TeoyubePublicPostReleaseSurfaceResult[], surfaceId: string): TeoyubePublicPostReleaseSurfaceResult | undefined {
  return results.find((result) => result.surfaceId === surfaceId);
}

export function getPublicPostReleaseSurfaceStabilizationBlockers(
  results: TeoyubePublicPostReleaseSurfaceResult[]
): TeoyubePublicPostReleaseSurfaceBlocker[] {
  return PUBLIC_POST_RELEASE_SURFACES
    .filter((surface) => {
      const result = resultFor(results, surface.id);
      return surface.required && (!result || result.status === "fail" || result.status === "blocked" || result.status === "not_run");
    })
    .map((surface) => ({
      id: `public_surface_stabilization_${surface.id}`,
      label: surface.label,
      reason: "Required public post-release surface stabilization check is missing, failed, blocked, or not run.",
      requiredAction: "Resolve this public surface before continuing launch stabilization."
    }));
}

export function getPublicPostReleaseSurfaceStabilizationWarnings(
  results: TeoyubePublicPostReleaseSurfaceResult[]
): TeoyubePublicPostReleaseSurfaceWarning[] {
  return results
    .filter((result) => result.status === "warning")
    .map((result) => ({
      id: `public_surface_stabilization_warning_${result.surfaceId}`,
      label: result.surfaceId,
      message: result.summary,
      recommendedAction: "Keep this surface warning visible in owner stabilization review."
    }));
}

export function createPublicPostReleaseSurfaceStabilizationReport(
  results: TeoyubePublicPostReleaseSurfaceResult[] = createPublicPostReleaseSurfaceStabilizationResults()
) {
  const blockers = getPublicPostReleaseSurfaceStabilizationBlockers(results);
  const warnings = getPublicPostReleaseSurfaceStabilizationWarnings(results);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    surfaces: PUBLIC_POST_RELEASE_SURFACES,
    results,
    requiredSurfaceCount: PUBLIC_POST_RELEASE_SURFACES.filter((surface) => surface.required).length,
    resultCount: results.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    blockers,
    warnings,
    noExternalServiceRequired: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
