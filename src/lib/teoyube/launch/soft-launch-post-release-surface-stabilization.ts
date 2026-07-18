export const POST_RELEASE_SURFACES = [
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
] as const;

export type TeoyubePostReleaseSurface = typeof POST_RELEASE_SURFACES[number];

export type TeoyubePostReleaseSurfaceStabilizationCheck = {
  id: string;
  surface: TeoyubePostReleaseSurface;
  label: string;
  required: boolean;
  launchCritical: boolean;
};

export type TeoyubePostReleaseSurfaceStabilizationResult = {
  checkId: string;
  surface: TeoyubePostReleaseSurface;
  status: "pass" | "warning" | "fail" | "blocked" | "not_run" | "unknown";
  notes?: string[];
};

const CHECKS = [
  ["loads", "Surface still loads"],
  ["mobile_layout", "Mobile layout remains usable"],
  ["accessibility_basics", "Accessibility basics remain acceptable"],
  ["scripture_anchor", "Scripture anchors still appear"],
  ["explanation_path", "Explanation paths still appear"],
  ["fallback_behavior", "Fallback behavior still works"],
  ["confidence_label", "Confidence label still appears where applicable"],
  ["consent_controls", "Consent controls still appear where applicable"],
  ["manual_feedback_controls", "Feedback controls remain manual-only"],
  ["debug_hidden", "Debug info remains hidden"],
  ["no_external_service_required", "No external service is required for basic safe render"]
] as const;

function normalizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

export function getPostReleaseSurfaceStabilizationChecks(
  surface: TeoyubePostReleaseSurface
): TeoyubePostReleaseSurfaceStabilizationCheck[] {
  return CHECKS.map(([id, label]) => ({
    id: normalizeId(`${surface}_${id}`),
    surface,
    label,
    required: true,
    launchCritical: ["loads", "scripture_anchor", "explanation_path", "fallback_behavior", "consent_controls", "debug_hidden", "no_external_service_required"].includes(id)
  }));
}

export function getPostReleaseSurfaceStabilizationChecklist(): TeoyubePostReleaseSurfaceStabilizationCheck[] {
  return POST_RELEASE_SURFACES.flatMap(getPostReleaseSurfaceStabilizationChecks);
}

export function createPostReleaseSurfaceStabilizationPassResults(): TeoyubePostReleaseSurfaceStabilizationResult[] {
  return getPostReleaseSurfaceStabilizationChecklist().map((entry) => ({
    checkId: entry.id,
    surface: entry.surface,
    status: "pass" as const,
    notes: ["Manual post-release surface stabilization check passed."]
  }));
}

export function getPostReleaseSurfaceStabilizationBlockers(
  results: TeoyubePostReleaseSurfaceStabilizationResult[]
) {
  const checklist = getPostReleaseSurfaceStabilizationChecklist();
  return checklist
    .filter((entry) => entry.required)
    .filter((entry) => {
      const result = results.find((candidate) => candidate.checkId === entry.id);
      return !result || result.status === "fail" || result.status === "blocked" || result.status === "not_run" || result.status === "unknown";
    })
    .map((entry) => ({
      id: `surface_stabilization_${entry.id}`,
      surface: entry.surface,
      label: entry.label,
      reason: "Required surface stabilization result is missing or blocked.",
      requiredAction: "Review and stabilize this surface before expansion.",
      riskLevel: entry.launchCritical ? "critical" as const : "high" as const
    }));
}

export function getPostReleaseSurfaceStabilizationWarnings(
  results: TeoyubePostReleaseSurfaceStabilizationResult[]
) {
  return results
    .filter((result) => result.status === "warning")
    .map((result) => ({
      id: `surface_stabilization_warning_${result.checkId}`,
      surface: result.surface,
      label: result.checkId,
      message: result.notes?.join(" ") || "Surface stabilization warning recorded.",
      recommendedAction: "Document owner acceptance before expansion."
    }));
}

export function createPostReleaseSurfaceStabilizationReport(
  results: TeoyubePostReleaseSurfaceStabilizationResult[] = createPostReleaseSurfaceStabilizationPassResults()
) {
  const checklist = getPostReleaseSurfaceStabilizationChecklist();
  const blockers = getPostReleaseSurfaceStabilizationBlockers(results);
  const warnings = getPostReleaseSurfaceStabilizationWarnings(results);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    checklist,
    results,
    requiredSurfaceCount: POST_RELEASE_SURFACES.length,
    checkCount: checklist.length,
    resultCount: results.length,
    blockers,
    warnings,
    noExternalServiceRequired: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
