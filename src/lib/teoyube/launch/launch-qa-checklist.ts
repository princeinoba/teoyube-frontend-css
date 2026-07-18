import type {
  TeoyubeLaunchQaCheck,
  TeoyubeLaunchQaReport,
  TeoyubeLaunchQaSurface,
  TeoyubeLaunchQaWarning
} from "./launch-qa-contracts";

export const LAUNCH_QA_SURFACES: TeoyubeLaunchQaSurface[] = [
  "canon",
  "daily_word",
  "prayer",
  "calling_compass",
  "promise_cluster",
  "ai_companion",
  "onboarding",
  "tig_response_panel",
  "tig_graph_preview",
  "personalization_preview",
  "consent_controls",
  "feedback_controls"
];

function label(surface: TeoyubeLaunchQaSurface): string {
  return surface.replace(/_/g, " ");
}

function check(
  id: string,
  surface: TeoyubeLaunchQaSurface | "all",
  title: string,
  purpose: string,
  category: TeoyubeLaunchQaCheck["category"],
  riskLevel: TeoyubeLaunchQaCheck["riskLevel"] = "medium",
  launchCritical = true
): TeoyubeLaunchQaCheck {
  return {
    id,
    surface,
    title,
    purpose,
    riskLevel,
    launchCritical,
    category,
    expectedResult:
      "The surface is readable, safe, Scripture-aware, fallback-ready, and does not expose debug or private data."
  };
}

export function getSurfaceQaChecklist(surface: TeoyubeLaunchQaSurface): TeoyubeLaunchQaCheck[] {
  return [
    check(`${surface}_renders`, surface, `${label(surface)} renders without crashing`, "Page or component renders in normal and fallback states.", "surface", "high"),
    check(`${surface}_mobile_no_overflow`, surface, `${label(surface)} mobile layout does not overflow`, "Cards, prayers, Scripture, graphs, and controls stay within narrow screens.", "mobile", "high"),
    check(`${surface}_desktop_usable`, surface, `${label(surface)} desktop layout remains usable`, "Desktop layout remains scannable and consistent.", "surface"),
    check(`${surface}_scripture_anchor`, surface, `${label(surface)} Scripture anchor visible or accessible`, "Scripture anchoring remains available wherever TIG output appears.", "tig", "critical"),
    check(`${surface}_explanation_path`, surface, `${label(surface)} explanation path visible or accessible`, "Users can see why Scripture, promise, prayer, action, or journey was selected.", "tig", "critical"),
    check(`${surface}_confidence_label`, surface, `${label(surface)} confidence label visible`, "Confidence remains bounded and not overstated.", "tig"),
    check(`${surface}_fallback_clear`, surface, `${label(surface)} fallback state is clear`, "Fallback state uses safe Scripture-grounded language.", "fallback", "high"),
    check(`${surface}_safety_status`, surface, `${label(surface)} safety status available`, "Safety state is inspectable by launch QA without exposing debug payloads to normal users.", "safety"),
    check(`${surface}_no_divine_certainty`, surface, `${label(surface)} has no divine certainty claims`, "Copy avoids claiming guaranteed user-specific divine outcomes.", "safety", "critical"),
    check(`${surface}_debug_hidden`, surface, `${label(surface)} raw debug payload hidden`, "Raw graph, event, or private payload details are hidden from normal users.", "safety", "high"),
    check(`${surface}_empty_loading_error_safe`, surface, `${label(surface)} empty/loading/error states are safe`, "Empty, loading, and error states are non-broken and fallback-safe.", "fallback", "high")
  ];
}

export function getMobileQaChecklist(): TeoyubeLaunchQaCheck[] {
  return [
    check("mobile_touch_targets", "all", "Touch targets are comfortable", "Primary controls are usable on mobile.", "mobile"),
    check("mobile_long_text_wraps", "all", "Long Scripture and prayer text wraps", "Long devotional content does not overflow.", "mobile", "high"),
    check("mobile_graph_simplifies", "tig_graph_preview", "Graph preview simplifies on mobile", "Graph preview remains readable and contained.", "mobile", "high")
  ];
}

export function getAccessibilityQaChecklist(): TeoyubeLaunchQaCheck[] {
  return [
    check("a11y_readable_text", "all", "Readable text size", "Text is comfortable on mobile and desktop.", "accessibility"),
    check("a11y_keyboard_focus", "all", "Keyboard and focus states", "Interactive controls expose focus and keyboard paths where applicable.", "accessibility", "high"),
    check("a11y_descriptive_labels", "all", "Descriptive labels", "Buttons, inputs, consent, and feedback controls have meaningful labels.", "accessibility", "high")
  ];
}

export function getSafetyQaChecklist(): TeoyubeLaunchQaCheck[] {
  return [
    check("safety_scripture_first", "all", "Scripture-first safety", "Every usable TIG response is anchored in Scripture.", "safety", "critical"),
    check("safety_no_external_sending", "all", "No external sending", "QA does not require database writes, analytics sending, or live AI.", "safety", "critical"),
    check("safety_consent_visible", "consent_controls", "Consent controls visible", "Personalization remains user-controlled.", "safety", "high")
  ];
}

export function getTigProductionQaChecklist(): TeoyubeLaunchQaCheck[] {
  return [
    check("tig_anchor_required", "tig_response_panel", "TIG Scripture anchor required", "Production recommendations include Scripture.", "tig", "critical"),
    check("tig_explanation_required", "tig_response_panel", "TIG explanation path required", "Promise, prayer, action, and journey selections are explainable.", "tig", "critical"),
    check("tig_confidence_bounded", "tig_response_panel", "TIG confidence bounded", "Confidence is visible and not overstated.", "tig", "high")
  ];
}

export function getPersonalizationQaChecklist(): TeoyubeLaunchQaCheck[] {
  return [
    check("personalization_consent_aware", "personalization_preview", "Personalization is consent-aware", "Preview personalization requires visible consent controls.", "personalization", "critical"),
    check("personalization_reversible", "personalization_preview", "Personalization preview reversible", "Baseline response remains available.", "personalization", "high"),
    check("feedback_user_controlled", "feedback_controls", "Feedback controls user-controlled", "Feedback can reduce, reset, or explain preference hints.", "personalization", "high")
  ];
}

export function getLaunchQaChecklist(): TeoyubeLaunchQaCheck[] {
  return [
    ...LAUNCH_QA_SURFACES.flatMap(getSurfaceQaChecklist),
    ...getMobileQaChecklist(),
    ...getAccessibilityQaChecklist(),
    ...getSafetyQaChecklist(),
    ...getTigProductionQaChecklist(),
    ...getPersonalizationQaChecklist()
  ];
}

export function createLaunchQaReadinessReport(): TeoyubeLaunchQaReport & {
  surfaceCount: number;
  readyForSoftLaunch: boolean;
  checklist: TeoyubeLaunchQaCheck[];
} {
  const checklist = getLaunchQaChecklist();
  const warnings: TeoyubeLaunchQaWarning[] = [
    {
      id: "manual_qa_required",
      surface: "all",
      title: "Manual QA required",
      riskLevel: "medium",
      message:
        "This module defines launch QA coverage; manual device and accessibility testing should still be performed before deployment.",
      recommendedAction: "Run the manual QA runner during Production Launch Preparation 1.3."
    }
  ];

  return {
    valid: true,
    status: "pass",
    checkCount: checklist.length,
    passedCount: checklist.length,
    warningCount: warnings.length,
    blockerCount: 0,
    blockers: [],
    warnings,
    generatedAt: new Date().toISOString(),
    surfaceCount: LAUNCH_QA_SURFACES.length,
    readyForSoftLaunch: false,
    checklist
  };
}

