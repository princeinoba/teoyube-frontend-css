import { LAUNCH_QA_SURFACES } from "./launch-qa-checklist";
import type {
  TeoyubeLaunchQaBlocker,
  TeoyubeLaunchQaCheckResult,
  TeoyubeLaunchQaSurface,
  TeoyubeLaunchQaWarning,
  TeoyubeMobileQaCheck
} from "./launch-qa-contracts";

function mobileCheck(id: string, surface: TeoyubeLaunchQaSurface | "all", title: string, purpose: string): TeoyubeMobileQaCheck {
  return {
    id,
    surface,
    title,
    purpose,
    riskLevel: "medium",
    launchCritical: true,
    category: "mobile",
    expectedResult: "Mobile layout is readable, touch-friendly, and does not overflow.",
    viewport: "all"
  };
}

export function getMobileViewportTestPlan() {
  return [
    { id: "small_mobile", width: 360, label: "Small mobile" },
    { id: "large_mobile", width: 430, label: "Large mobile" },
    { id: "tablet", width: 768, label: "Tablet" },
    { id: "desktop", width: 1280, label: "Desktop" }
  ];
}

export function getSurfaceMobileQaChecklist(surface: TeoyubeLaunchQaSurface): TeoyubeMobileQaCheck[] {
  return [
    mobileCheck(`${surface}_no_horizontal_overflow`, surface, "No horizontal overflow", "Main content stays within viewport."),
    mobileCheck(`${surface}_cards_stack`, surface, "Cards stack correctly", "Cards and panels stack naturally."),
    mobileCheck(`${surface}_touch_friendly`, surface, "Buttons are touch-friendly", "Primary actions are easy to tap."),
    mobileCheck(`${surface}_long_text_wraps`, surface, "Long text wraps", "Scripture, prayer, and prompts wrap properly."),
    mobileCheck(`${surface}_fallback_readable`, surface, "Fallback readable", "Fallback messages remain readable on mobile."),
    mobileCheck(`${surface}_debug_hidden`, surface, "Debug hidden", "Debug information is hidden by default.")
  ];
}

export function getMobileLaunchQaChecklist(): TeoyubeMobileQaCheck[] {
  return [
    ...LAUNCH_QA_SURFACES.flatMap(getSurfaceMobileQaChecklist),
    mobileCheck("mobile_graph_simplifies", "tig_graph_preview", "Graph preview collapses or simplifies", "Graph preview avoids tiny unreadable labels."),
    mobileCheck("mobile_explanation_readable", "tig_response_panel", "Explanation path readable", "Decision trace remains readable."),
    mobileCheck("mobile_consent_feedback_usable", "consent_controls", "Consent and feedback controls usable", "Consent and feedback controls are touch-friendly.")
  ];
}

export function getMobileQaBlockers(results: TeoyubeLaunchQaCheckResult[] = []): TeoyubeLaunchQaBlocker[] {
  return results
    .filter((entry) => entry.status === "fail" || entry.status === "blocked")
    .map((entry) => ({
      id: entry.checkId,
      surface: entry.surface,
      title: "Mobile QA blocker",
      riskLevel: "high",
      reason: entry.notes || "Mobile QA failed.",
      requiredAction: "Resolve mobile blocker before launch."
    }));
}

export function getMobileQaWarnings(results: TeoyubeLaunchQaCheckResult[] = []): TeoyubeLaunchQaWarning[] {
  return results
    .filter((entry) => entry.status === "warning" || entry.status === "not_tested")
    .map((entry) => ({
      id: entry.checkId,
      surface: entry.surface,
      title: "Mobile QA warning",
      riskLevel: "medium",
      message: entry.notes || "Mobile QA needs review.",
      recommendedAction: "Review on target viewports before deployment."
    }));
}

export function createMobileQaReport(results: TeoyubeLaunchQaCheckResult[] = []) {
  const checklist = getMobileLaunchQaChecklist();
  const blockers = getMobileQaBlockers(results);
  const warnings = getMobileQaWarnings(results);

  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "warning" : "pass",
    checkCount: checklist.length,
    passedCount: results.filter((entry) => entry.status === "pass").length || checklist.length,
    warningCount: warnings.length,
    blockerCount: blockers.length,
    blockers,
    warnings,
    viewportPlan: getMobileViewportTestPlan(),
    generatedAt: new Date().toISOString()
  };
}

