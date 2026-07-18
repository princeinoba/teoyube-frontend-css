import type { TeoyubePublicLaunchQaCheck, TeoyubePublicLaunchQaSurface } from "./public-launch-qa-contracts";

export const PUBLIC_LAUNCH_QA_SURFACES: TeoyubePublicLaunchQaSurface[] = [
  "canon",
  "daily_word",
  "prayer",
  "calling_compass",
  "promise_cluster",
  "ai_companion",
  "onboarding",
  "tig_response_panel",
  "tig_graph_preview",
  "personalization_preview_panel",
  "consent_controls",
  "feedback_controls",
  "privacy_terms",
  "sensitive_information_warnings",
  "error_fallback_states",
  "mobile_navigation",
  "offline_fallback"
];

function check(surface: TeoyubePublicLaunchQaSurface, id: string, label: string, category: TeoyubePublicLaunchQaCheck["category"], expectedResult: string): TeoyubePublicLaunchQaCheck {
  return {
    id: `${surface}_${id}`,
    surface,
    label,
    category,
    required: true,
    launchCritical: ["privacy", "consent", "safety", "fallback"].includes(category),
    expectedResult
  };
}

export function getPublicLaunchSurfaceQaChecklist(surface: TeoyubePublicLaunchQaSurface): TeoyubePublicLaunchQaCheck[] {
  return [
    check(surface, "mobile_layout", "Mobile layout works", "mobile", "Surface fits mobile without overlap."),
    check(surface, "accessibility_basics", "Accessibility basics pass", "accessibility", "Keyboard, labels, focus, contrast, and readable text are acceptable."),
    check(surface, "scripture_anchor_visible", "Scripture anchor visible", "safety", "Scripture anchors remain visible where recommendations appear."),
    check(surface, "explanation_path_visible", "Explanation path visible", "safety", "Explanation paths remain visible where TIG recommendations appear."),
    check(surface, "fallback_ready", "Fallback ready", "fallback", "Fallback renders safely without external service dependency."),
    check(surface, "confidence_label_clear", "Confidence label clear", "safety", "Confidence labels do not claim divine certainty."),
    check(surface, "consent_visible", "Consent visible where applicable", "consent", "Consent controls or copy are visible where personalization/feedback appears."),
    check(surface, "privacy_copy_available", "Privacy copy available where applicable", "privacy", "Privacy/terms or placeholder copy is available where needed."),
    check(surface, "sensitive_warning_available", "Sensitive information warning available", "privacy", "Free-text or feedback surfaces warn users not to submit sensitive information."),
    check(surface, "debug_payload_hidden", "No debug payload visible to normal users", "surface", "Normal users do not see raw debug payloads."),
    check(surface, "no_external_service_dependency", "No external service dependency for safe render", "surface", "Safe render does not require database, analytics, live AI, or external provider calls.")
  ];
}

export function getPublicLaunchPrivacyQaChecklist(): TeoyubePublicLaunchQaCheck[] {
  return [
    check("privacy_terms", "privacy_notice_available", "Privacy notice draft available", "privacy", "Draft privacy notice is available for review."),
    check("privacy_terms", "terms_available", "Terms draft available", "copy", "Draft terms are available for review."),
    check("sensitive_information_warnings", "sensitive_warning_visible", "Sensitive information warning visible", "privacy", "Sensitive information warning is visible before free text.")
  ];
}

export function getPublicLaunchConsentQaChecklist(): TeoyubePublicLaunchQaCheck[] {
  return [
    check("consent_controls", "personalization_consent", "Personalization consent copy visible", "consent", "Personalization consent copy is visible where personalization appears."),
    check("consent_controls", "disable_reset_copy", "Disable/reset/export/delete copy visible", "consent", "Users can understand disable/reset/export/delete behavior."),
    check("feedback_controls", "feedback_consent", "Feedback consent copy visible", "consent", "Feedback copy warns against sensitive information.")
  ];
}

export function getPublicLaunchAccessibilityQaChecklist(): TeoyubePublicLaunchQaCheck[] {
  return PUBLIC_LAUNCH_QA_SURFACES.map((surface) => check(surface, "accessibility_public", "Public accessibility check", "accessibility", "Public surface meets accessibility basics."));
}

export function getPublicLaunchSafetyQaChecklist(): TeoyubePublicLaunchQaCheck[] {
  return [
    check("tig_response_panel", "no_divine_certainty", "No divine certainty claim", "safety", "Copy and labels do not claim divine certainty."),
    check("error_fallback_states", "fallback_scripture_anchored", "Fallback Scripture anchored", "fallback", "Fallback remains non-empty and Scripture-anchored."),
    check("ai_companion", "professional_advice_boundary", "Professional advice boundary visible", "safety", "Medical, legal, financial, emergency, and counseling boundaries are clear.")
  ];
}

export function getPublicLaunchMobileQaChecklist(): TeoyubePublicLaunchQaCheck[] {
  return PUBLIC_LAUNCH_QA_SURFACES.map((surface) => check(surface, "mobile_public", "Public mobile check", "mobile", "Public surface is readable and usable on mobile."));
}

export function getPublicLaunchQaChecklist(): TeoyubePublicLaunchQaCheck[] {
  const checks = [
    ...PUBLIC_LAUNCH_QA_SURFACES.flatMap(getPublicLaunchSurfaceQaChecklist),
    ...getPublicLaunchPrivacyQaChecklist(),
    ...getPublicLaunchConsentQaChecklist(),
    ...getPublicLaunchSafetyQaChecklist()
  ];
  const seen = new Set<string>();
  return checks.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

export function createPublicLaunchQaChecklistReport() {
  const checklist = getPublicLaunchQaChecklist();
  return {
    valid: checklist.length >= PUBLIC_LAUNCH_QA_SURFACES.length * 10,
    ready: checklist.length >= PUBLIC_LAUNCH_QA_SURFACES.length * 10,
    checklist,
    surfaceCount: PUBLIC_LAUNCH_QA_SURFACES.length,
    checkCount: checklist.length,
    requiredSurfaceCount: PUBLIC_LAUNCH_QA_SURFACES.length,
    blockers: [],
    warnings: [{ id: "public_qa_manual_execution_required", label: "Public QA manual execution", message: "Checklist exists; manual QA still needs execution before public launch.", recommendedAction: "Use this checklist in the 5.3 final QA dry run.", riskLevel: "medium" as const }],
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
