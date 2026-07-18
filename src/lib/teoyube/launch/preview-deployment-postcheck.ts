import { REQUIRED_LAUNCH_SURFACES } from "./launch-surface-readiness-report";
import type {
  TeoyubePreviewDeploymentExecutionStatus,
  TeoyubePreviewDeploymentPostCheck
} from "./preview-deployment-execution-contracts";

export type TeoyubePreviewDeploymentPostCheckResult = {
  checkId: string;
  status: TeoyubePreviewDeploymentExecutionStatus;
  summary: string;
};

function check(
  id: string,
  label: string,
  surface: string | undefined,
  category: TeoyubePreviewDeploymentPostCheck["category"],
  details: string
): TeoyubePreviewDeploymentPostCheck {
  return {
    id,
    label,
    surface,
    category,
    phase: "post_check",
    required: true,
    status: "not_started",
    details,
    manualOnly: true
  };
}

export function getPreviewSurfacePostChecks(): TeoyubePreviewDeploymentPostCheck[] {
  return REQUIRED_LAUNCH_SURFACES.flatMap((surface) => [
    check(`${surface}_loads`, "Page or component loads", surface, "route", "Basic render should not require external services."),
    check(`${surface}_mobile`, "Mobile layout usable", surface, "mobile", "Mobile layout should remain readable and usable."),
    check(`${surface}_scripture`, "Scripture anchor appears", surface, "scripture", "Scripture anchors must be visible where applicable."),
    check(`${surface}_explanation`, "Explanation path appears", surface, "explanation", "Explanation path must be visible where applicable."),
    check(`${surface}_fallback`, "Fallback state works", surface, "fallback", "Fallback state should remain safe."),
    check(`${surface}_consent`, "Consent controls appear where applicable", surface, "consent", "Consent controls should appear when personalization appears."),
    check(`${surface}_debug_hidden`, "Debug payload hidden", surface, "security", "Debug payloads must not be visible to normal users."),
    check(`${surface}_no_external_dependency`, "No external service dependency for basic render", surface, "security", "Basic render must not require external analytics, DB, or live AI.")
  ]);
}

export function getPreviewDeploymentPostCheckChecklist(): TeoyubePreviewDeploymentPostCheck[] {
  return [
    ...getPreviewSurfacePostChecks(),
    check("confidence_labels", "Confidence labels appear where applicable", undefined, "scripture", "Confidence context should be visible where applicable."),
    check("feedback_controls", "Feedback controls appear where applicable", undefined, "consent", "Feedback controls should remain visible and safe."),
    check("no_hidden_personalization", "No hidden personalization", undefined, "security", "Personalization must remain visible, consent-aware, and reversible.")
  ];
}

export function getPreviewDeploymentPostCheckBlockers(
  results: TeoyubePreviewDeploymentPostCheckResult[] = []
): string[] {
  return results
    .filter((entry) => entry.status === "failed" || entry.status === "blocked")
    .map((entry) => `${entry.checkId}: ${entry.summary}`);
}

export function getPreviewDeploymentPostCheckWarnings(
  results: TeoyubePreviewDeploymentPostCheckResult[] = []
): string[] {
  return results
    .filter((entry) => entry.status === "needs_review" || entry.status === "ready_with_warnings")
    .map((entry) => `${entry.checkId}: ${entry.summary}`);
}

export function validatePreviewDeploymentPostCheckResults(
  results: TeoyubePreviewDeploymentPostCheckResult[] = []
) {
  const blockers = getPreviewDeploymentPostCheckBlockers(results);
  const warnings = getPreviewDeploymentPostCheckWarnings(results);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    blockers,
    warnings
  };
}

export function createPreviewDeploymentPostCheckReport(
  results: TeoyubePreviewDeploymentPostCheckResult[] = []
) {
  const checklist = getPreviewDeploymentPostCheckChecklist();
  const validation = validatePreviewDeploymentPostCheckResults(results);

  return {
    ...validation,
    checklist,
    checkCount: checklist.length,
    resultCount: results.length,
    generatedAt: new Date().toISOString()
  };
}
