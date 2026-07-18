import type {
  TeoyubeMobilePersonalizationControl,
  TeoyubeMobileSafetyRequirement,
  TeoyubeMobileSurface,
  TeoyubeScaleReadinessStatus
} from "./mobile-scale-contracts";

export function getMobileSafetyChecklist(): TeoyubeMobileSafetyRequirement[] {
  return [
    {
      id: "scripture_readability",
      label: "Readable Scripture Cards",
      surface: "all",
      required: true,
      status: "planned",
      requirement: "Scripture text, reference, and translation must be readable on small screens.",
      verificationMethod: "Mobile viewport screenshot and text overflow check."
    },
    {
      id: "safe_fallback_available",
      label: "Safe Fallback Available",
      surface: "all",
      required: true,
      status: "planned",
      requirement: "Every mobile surface must preserve a Scripture-anchored fallback path.",
      verificationMethod: "Run production fallback validation for mobile surfaces."
    },
    {
      id: "no_divine_certainty_claims",
      label: "No Divine Certainty Claims",
      surface: "all",
      required: true,
      status: "planned",
      requirement: "Mobile explanations must avoid claiming certain knowledge of God's will, identity, or calling.",
      verificationMethod: "Copy review and guardrail validation."
    },
    {
      id: "emergency_guardrails",
      label: "Emergency Guardrails",
      surface: "all",
      required: true,
      status: "planned",
      requirement: "Medical, legal, financial, and emergency guardrails must remain visible and enforceable.",
      verificationMethod: "Safety copy and blocked-response review."
    },
    {
      id: "graph_mobile_safety",
      label: "Graph Mobile Safety",
      surface: "tig_graph_preview",
      required: true,
      status: "planned",
      requirement: "Graph labels must not become tiny or misleading on mobile; provide a list fallback.",
      verificationMethod: "Mobile graph render check at common phone widths."
    }
  ];
}

export function getMobileAccessibilityChecklist(): TeoyubeMobileSafetyRequirement[] {
  return [
    {
      id: "touch_targets",
      label: "Touch-Friendly Controls",
      surface: "all",
      required: true,
      status: "planned",
      requirement: "Primary actions, feedback controls, and consent controls should use touch targets of at least 44px.",
      verificationMethod: "Manual mobile UI audit."
    },
    {
      id: "screen_reader_labels",
      label: "Screen Reader Labels",
      surface: "all",
      required: true,
      status: "planned",
      requirement: "Buttons, form controls, graph summaries, and toggles should have accessible names.",
      verificationMethod: "Accessibility tree or screen reader pass."
    },
    {
      id: "keyboard_navigation",
      label: "Keyboard Navigation",
      surface: "all",
      required: true,
      status: "planned",
      requirement: "Important controls should remain keyboard reachable.",
      verificationMethod: "Tab order check."
    },
    {
      id: "collapsible_debug_info",
      label: "Collapsible Debug Info",
      surface: "all",
      required: true,
      status: "planned",
      requirement: "Debug, graph, trace, and raw details should be collapsible on mobile.",
      verificationMethod: "Mobile viewport review."
    },
    {
      id: "consent_controls_visible",
      label: "Visible Consent Controls",
      surface: "personalization_controls",
      required: true,
      status: "planned",
      requirement: "Consent, reset, export, and delete controls must be easy to find and understand.",
      verificationMethod: "Mobile privacy/control flow review."
    }
  ];
}

export function validateMobileSafetyReadiness(surface: TeoyubeMobileSurface): {
  valid: boolean;
  status: TeoyubeScaleReadinessStatus;
  requirements: TeoyubeMobileSafetyRequirement[];
  errors: string[];
} {
  const requirements = getMobileSafetyChecklist().filter(
    (item) => item.surface === "all" || item.surface === surface
  );
  const errors = requirements
    .filter((item) => item.required && item.status === "blocked")
    .map((item) => `${item.label} is blocked.`);

  return {
    valid: errors.length === 0,
    status: errors.length ? "blocked" : "planned",
    requirements,
    errors
  };
}

export function validateMobileAccessibilityReadiness(surface: TeoyubeMobileSurface): {
  valid: boolean;
  status: TeoyubeScaleReadinessStatus;
  requirements: TeoyubeMobileSafetyRequirement[];
  errors: string[];
} {
  const requirements = getMobileAccessibilityChecklist().filter(
    (item) => item.surface === "all" || item.surface === surface
  );
  const errors = requirements
    .filter((item) => item.required && item.status === "blocked")
    .map((item) => `${item.label} is blocked.`);

  return {
    valid: errors.length === 0,
    status: errors.length ? "blocked" : "planned",
    requirements,
    errors
  };
}

export function getMobileConsentControlRequirements(): TeoyubeMobilePersonalizationControl[] {
  return [
    {
      id: "mobile_consent_status",
      label: "Show Personalization Status",
      surface: "personalization_controls",
      required: true,
      mobileRequirement: "Show whether personalization is off, session-only, or profile-preview in plain language.",
      consentBoundary: "Users must understand whether any personalization is active."
    },
    {
      id: "mobile_disable_personalization",
      label: "Disable Personalization",
      surface: "personalization_controls",
      required: true,
      mobileRequirement: "Provide a clear disable action with large touch target.",
      consentBoundary: "Disable must stop preference use and signal storage."
    },
    {
      id: "mobile_reset_export_delete",
      label: "Reset Export Delete",
      surface: "personalization_controls",
      required: true,
      mobileRequirement: "Expose reset, export, and delete controls in a reachable privacy section.",
      consentBoundary: "Controls must remain available before any persistence adapter is connected."
    },
    {
      id: "mobile_feedback_impact",
      label: "Explain Feedback Impact",
      surface: "feedback_controls",
      required: true,
      mobileRequirement: "Explain that feedback softens hints and cannot override Scripture anchoring.",
      consentBoundary: "Feedback must remain explicit user control."
    }
  ];
}
