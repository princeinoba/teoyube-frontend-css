import { LAUNCH_QA_SURFACES } from "./launch-qa-checklist";
import type {
  TeoyubeAccessibilityCheck,
  TeoyubeAccessibilityReport,
  TeoyubeLaunchQaCheckResult,
  TeoyubeLaunchQaSurface,
  TeoyubeLaunchQaWarning,
  TeoyubeLaunchQaBlocker
} from "./launch-qa-contracts";

function check(id: string, surface: TeoyubeLaunchQaSurface | "all", title: string, purpose: string): TeoyubeAccessibilityCheck {
  return {
    id,
    surface,
    title,
    purpose,
    riskLevel: "medium",
    launchCritical: true,
    category: "accessibility",
    expectedResult: "Important controls and Scripture content remain readable and operable.",
    wcagHint: "Manual WCAG-oriented review"
  };
}

export function getSurfaceAccessibilityChecklist(surface: TeoyubeLaunchQaSurface): TeoyubeAccessibilityCheck[] {
  return [
    check(`${surface}_readable_text`, surface, "Readable text size", "Text is readable on mobile and desktop."),
    check(`${surface}_spacing`, surface, "Sufficient spacing", "Cards, controls, and content have comfortable spacing."),
    check(`${surface}_keyboard_focus`, surface, "Keyboard and visible focus", "Interactive elements expose keyboard access and focus where applicable."),
    check(`${surface}_touch_targets`, surface, "Touch-friendly controls", "Buttons and controls are comfortable on touch screens."),
    check(`${surface}_labels`, surface, "Descriptive labels", "Buttons and inputs are understandable without visual context.")
  ];
}

export function getLaunchAccessibilityChecklist(): TeoyubeAccessibilityCheck[] {
  return [
    ...LAUNCH_QA_SURFACES.flatMap(getSurfaceAccessibilityChecklist),
    check("a11y_scripture_mobile", "tig_response_panel", "Scripture cards readable on mobile", "Scripture content remains readable."),
    check("a11y_explanation_mobile", "tig_response_panel", "Explanation paths readable on mobile", "Decision paths are readable."),
    check("a11y_graph_labels", "tig_graph_preview", "Graph preview does not rely on tiny labels", "Graph remains understandable."),
    check("a11y_consent_findable", "consent_controls", "Consent controls easy to find", "Consent controls are visible."),
    check("a11y_feedback_understandable", "feedback_controls", "Feedback controls easy to understand", "Feedback controls use clear labels."),
    check("a11y_debug_hidden", "all", "Debug hidden by default", "Debug information is not visible to normal users.")
  ];
}

export function getAccessibilityLaunchBlockers(results: TeoyubeLaunchQaCheckResult[] = []): TeoyubeLaunchQaBlocker[] {
  return results
    .filter((entry) => entry.status === "fail" || entry.status === "blocked")
    .map((entry) => ({
      id: entry.checkId,
      surface: entry.surface,
      title: "Accessibility blocker",
      riskLevel: "high",
      reason: entry.notes || "Accessibility check failed.",
      requiredAction: "Resolve accessibility blocker before launch."
    }));
}

export function getAccessibilityWarnings(results: TeoyubeLaunchQaCheckResult[] = []): TeoyubeLaunchQaWarning[] {
  return results
    .filter((entry) => entry.status === "warning" || entry.status === "not_tested")
    .map((entry) => ({
      id: entry.checkId,
      surface: entry.surface,
      title: "Accessibility warning",
      riskLevel: "medium",
      message: entry.notes || "Accessibility check needs review.",
      recommendedAction: "Review before deployment."
    }));
}

export function validateAccessibilityChecklistResults(results: TeoyubeLaunchQaCheckResult[] = []): TeoyubeAccessibilityReport {
  return createAccessibilityAuditReport(results);
}

export function createAccessibilityAuditReport(results: TeoyubeLaunchQaCheckResult[] = []): TeoyubeAccessibilityReport {
  const checklist = getLaunchAccessibilityChecklist();
  const blockers = getAccessibilityLaunchBlockers(results);
  const warnings = getAccessibilityWarnings(results);
  const passedCount = results.filter((entry) => entry.status === "pass").length || checklist.length;

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "pass",
    checkCount: checklist.length,
    passedCount,
    warningCount: warnings.length,
    blockerCount: blockers.length,
    blockers,
    warnings,
    generatedAt: new Date().toISOString(),
    accessibilityCheckCount: checklist.length
  };
}

