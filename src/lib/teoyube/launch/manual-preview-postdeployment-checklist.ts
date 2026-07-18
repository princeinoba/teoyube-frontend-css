import type { TeoyubeManualPreviewDeploymentStatus } from "./manual-preview-deployment-contracts";

export type TeoyubeManualPreviewPostDeploymentCheck = {
  id: string;
  label: string;
  category: "surface" | "scripture" | "explanation" | "fallback" | "confidence" | "consent" | "feedback" | "mobile" | "accessibility" | "privacy" | "provider";
  required: boolean;
  status: TeoyubeManualPreviewDeploymentStatus;
  details: string;
};

export type TeoyubeManualPreviewPostDeploymentResult = {
  checkId: string;
  status: TeoyubeManualPreviewDeploymentStatus;
  summary: string;
  checkedAt?: string;
};

function check(
  id: string,
  label: string,
  category: TeoyubeManualPreviewPostDeploymentCheck["category"],
  details: string
): TeoyubeManualPreviewPostDeploymentCheck {
  return {
    id,
    label,
    category,
    required: true,
    status: "not_started",
    details
  };
}

export function getManualPreviewSurfacePostDeploymentChecks(): TeoyubeManualPreviewPostDeploymentCheck[] {
  return [
    check("canon_loads", "Canon loads", "surface", "Verify the Canon surface loads on the preview URL."),
    check("daily_word_loads", "Daily Word loads", "surface", "Verify Daily Word loads and remains Scripture-anchored."),
    check("prayer_loads", "Prayer loads", "surface", "Verify Prayer surface loads and keeps safe wording."),
    check("calling_compass_loads", "Calling Compass loads", "surface", "Verify Calling Compass loads and includes Scripture anchors."),
    check("promise_cluster_loads", "Promise Cluster loads", "surface", "Verify Promise Cluster surface loads."),
    check("ai_companion_loads", "AI Companion loads", "surface", "Verify AI Companion surface loads without live AI orchestration."),
    check("tig_response_panel_works", "TIG Response Panel works", "surface", "Verify TIG response panel renders Scripture, explanation, prayer, reflection, and action.")
  ];
}

export function getManualPreviewPostDeploymentChecklist(): TeoyubeManualPreviewPostDeploymentCheck[] {
  return [
    check("preview_app_loads", "Preview app loads", "provider", "Verify the preview URL loads manually."),
    ...getManualPreviewSurfacePostDeploymentChecks(),
    check("scripture_anchors_visible", "Scripture anchors visible", "scripture", "Verify Scripture references and text remain visible."),
    check("explanation_paths_visible", "Explanation paths visible", "explanation", "Verify decision/explanation paths are visible where expected."),
    check("fallback_behavior_safe", "Fallback behavior safe", "fallback", "Verify empty or failed states remain safe and Scripture-anchored."),
    check("confidence_labels_visible", "Confidence labels visible", "confidence", "Verify confidence labels are visible and not overstated."),
    check("consent_controls_available", "Consent controls available", "consent", "Verify consent controls are available where personalization appears."),
    check("feedback_controls_available", "Feedback controls available", "feedback", "Verify feedback controls are visible where expected."),
    check("mobile_layout_usable", "Mobile layout usable", "mobile", "Verify mobile layout with narrow viewport."),
    check("accessibility_basics_reviewed", "Accessibility basics reviewed", "accessibility", "Verify keyboard, contrast, labels, and focus basics."),
    check("debug_ui_hidden", "Debug UI hidden", "privacy", "Verify debug-only UI is not exposed to public preview users."),
    check("no_external_analytics_confirmed", "No external analytics confirmed", "privacy", "Verify external analytics sending is not enabled."),
    check("no_database_persistence_confirmed", "No database persistence confirmed", "privacy", "Verify production persistence is not enabled."),
    check("no_live_ai_confirmed", "No live AI orchestration confirmed", "privacy", "Verify live AI orchestration remains disabled.")
  ];
}

function resultMap(results: TeoyubeManualPreviewPostDeploymentResult[] = []) {
  return new Map(results.map((result) => [result.checkId, result]));
}

export function getManualPreviewPostDeploymentBlockers(
  results: TeoyubeManualPreviewPostDeploymentResult[] = []
): string[] {
  const map = resultMap(results);

  return getManualPreviewPostDeploymentChecklist()
    .map((item) => {
      const result = map.get(item.id);
      if (!result) return "";
      return result.status === "failed" || result.status === "blocked"
        ? `${item.label} failed: ${result.summary}`
        : "";
    })
    .filter(Boolean);
}

export function getManualPreviewPostDeploymentWarnings(
  results: TeoyubeManualPreviewPostDeploymentResult[] = []
): string[] {
  const map = resultMap(results);
  if (results.length === 0) return ["Postdeployment checks are pending until a preview URL exists."];

  return getManualPreviewPostDeploymentChecklist()
    .map((item) => (map.has(item.id) ? "" : `${item.label} has not been reviewed yet.`))
    .filter(Boolean);
}

export function createManualPreviewPostDeploymentReport(
  results: TeoyubeManualPreviewPostDeploymentResult[] = []
) {
  const checklist = getManualPreviewPostDeploymentChecklist();
  const blockers = getManualPreviewPostDeploymentBlockers(results);
  const warnings = getManualPreviewPostDeploymentWarnings(results);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "needs_review" : "ready",
    ready: blockers.length === 0 && warnings.length === 0,
    checklist,
    checkCount: checklist.length,
    resultCount: results.length,
    blockers,
    warnings,
    results,
    generatedAt: new Date().toISOString()
  };
}
