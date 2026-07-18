import type {
  TeoyubeAnalyticsConnectionPlan,
  TeoyubeScaleReadinessStatus
} from "./mobile-scale-contracts";

export function getPhase5B3EventConnectionMap(): Record<string, string[]> {
  return {
    production_intelligence: [
      "production response created",
      "surface viewed",
      "decision path selected"
    ],
    fallback_events: [
      "fallback used",
      "fallback avoided",
      "fallback reason captured"
    ],
    guardrail_events: [
      "blocked response",
      "low confidence",
      "unsafe output replaced"
    ],
    surface_events: [
      "canon surface viewed",
      "daily word surface viewed",
      "prayer surface viewed",
      "calling compass surface viewed",
      "promise cluster surface viewed",
      "ai companion surface viewed"
    ]
  };
}

export function getPhase6PersonalizationEventConnectionMap(): Record<string, string[]> {
  return {
    personalization_preview: [
      "baseline preview created",
      "personalized preview compared",
      "preview disabled by consent"
    ],
    feedback: [
      "more like this",
      "less like this",
      "not relevant",
      "disable personalization",
      "reset preferences"
    ],
    consent: [
      "session personalization enabled",
      "profile preview enabled",
      "preference hints disabled",
      "export requested",
      "delete requested"
    ]
  };
}

export function getTeoyubeAnalyticsReadinessPlan(): TeoyubeAnalyticsConnectionPlan {
  return {
    id: "phase_7_analytics_readiness",
    label: "Phase 7 Analytics Connection Readiness",
    status: "planned",
    eventSources: [
      "Phase 5B.3 production intelligence events",
      "Phase 5B.3 fallback and guardrail events",
      "Phase 5B.3 surface events",
      "Phase 6 personalization preview events",
      "Phase 6 feedback events",
      "Phase 6 consent updated events"
    ],
    plannedEvents: [
      ...Object.values(getPhase5B3EventConnectionMap()).flat(),
      ...Object.values(getPhase6PersonalizationEventConnectionMap()).flat()
    ],
    privacyRules: [
      "No external analytics provider is connected in Phase 7.4.",
      "No raw sensitive user text should be sent.",
      "Personalization events require consent-aware boundaries.",
      "Export and delete requests must be honored before analytics connection.",
      "Event payloads should stay structured, minimal, and Scripture-safe."
    ],
    externalProviderConnected: false,
    implementationNote:
      "This is a provider-neutral connection map. It does not send events to Segment, PostHog, Google Analytics, Mixpanel, or any external provider."
  };
}

export function getAnalyticsPrivacyWarnings(): string[] {
  return [
    "Do not send analytics externally until privacy review is complete.",
    "Do not include raw user input, journal entries, prayer text, or sensitive context by default.",
    "Do not use analytics to create hidden personalization.",
    "Do not track divine certainty or spiritual identity claims."
  ];
}

export function validateAnalyticsReadinessPlan(): {
  valid: boolean;
  status: TeoyubeScaleReadinessStatus;
  errors: string[];
  warnings: string[];
} {
  const plan = getTeoyubeAnalyticsReadinessPlan();
  const errors = [
      plan.externalProviderConnected ? "External analytics provider must not be connected in Phase 7.4." : "",
    plan.plannedEvents.length ? "" : "Analytics plan should include planned event names."
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    status: errors.length === 0 ? "planned" : "blocked",
    errors,
    warnings: getAnalyticsPrivacyWarnings()
  };
}
