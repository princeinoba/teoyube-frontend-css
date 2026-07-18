import type {
  TeoyubePublicReleaseCandidateQaArea,
  TeoyubePublicReleaseCandidateQaCheck,
  TeoyubePublicReleaseCandidateQaScenario
} from "./public-release-candidate-qa-contracts";

export type TeoyubePublicReleaseCandidateQaScenarioInput = Partial<{
  realDataLoads: boolean;
  rendersSafely: boolean;
  scriptureAnchorsVisible: boolean;
  explanationTracesVisible: boolean;
  confidenceLabelsVisible: boolean;
  fallbackSafeNonEmpty: boolean;
  knownLimitationsAvailable: boolean;
  privacyConsentAvailableOrPlanned: boolean;
  supportFeedbackManual: boolean;
  disabledServicesRemainDisabled: boolean;
  noExternalServicesRequired: boolean;
  noPublicUrlFetching: boolean;
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function check(id: string, area: TeoyubePublicReleaseCandidateQaArea, label: string, passed: boolean, details: string): TeoyubePublicReleaseCandidateQaCheck {
  return { id, area, label, required: true, passed, details };
}

function scenario(area: TeoyubePublicReleaseCandidateQaArea, label: string, input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return {
    id: `phase_9_2_${area}_qa_scenario`,
    area,
    label,
    description: `${label} public release candidate QA scenario.`,
    checks: [
      check(`${area}_real_data`, area, "Real data loads", flag(input.realDataLoads), "Real Teoyube data loads or a safe planned fallback is available."),
      check(`${area}_safe_render`, area, "UI surface renders safely", flag(input.rendersSafely), "Surface renders without external services."),
      check(`${area}_scripture_anchor`, "scripture_anchor", "Scripture anchors visible where available", flag(input.scriptureAnchorsVisible), "Scripture anchors remain visible where available."),
      check(`${area}_explanation_trace`, "explanation_trace", "Explanation traces visible where required", flag(input.explanationTracesVisible), "Explanation paths remain visible where required."),
      check(`${area}_confidence_label`, "confidence_label", "Confidence labels visible where required", flag(input.confidenceLabelsVisible), "Confidence labels remain humble and visible."),
      check(`${area}_fallback`, "fallback_states", "Fallback state safe", flag(input.fallbackSafeNonEmpty), "Fallback is safe and non-empty."),
      check(`${area}_limitations`, "known_limitations", "Known limitations available", flag(input.knownLimitationsAvailable), "Known limitations remain available."),
      check(`${area}_privacy_consent`, "privacy_notice", "Privacy/consent available or planned", flag(input.privacyConsentAvailableOrPlanned), "Privacy and consent notices remain available or explicitly planned."),
      check(`${area}_support_feedback`, "support_feedback", "Support/feedback boundaries manual", flag(input.supportFeedbackManual), "Support and feedback boundaries remain manual."),
      check(`${area}_service_disabled`, "service_disabled_state", "Disabled services remain disabled", flag(input.disabledServicesRemainDisabled), "Disabled services remain disabled."),
      check(`${area}_no_external_service`, "service_disabled_state", "No external service required", flag(input.noExternalServicesRequired), "No external service is required for this scenario."),
      check(`${area}_no_public_url_fetch`, "unknown", "No public URL fetching", flag(input.noPublicUrlFetching), "Scenario performs no public URL fetch.")
    ],
    manualOnly: true,
    noPublicUrlFetch: true,
    noExternalServicesRequired: true
  };
}

export function createPublicHomeQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("home", "Home", input);
}

export function createPublicCanonQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("canon", "Canon", input);
}

export function createPublicDailyWordQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("daily_word", "Daily Word", input);
}

export function createPublicWordCardQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("word_card", "WordCard", input);
}

export function createPublicPromiseTableQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("promise_table", "Promise Table", input);
}

export function createPublicPrayerCompanionQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("prayer_companion", "PrayerCompanion", input);
}

export function createPublicCompassExperienceQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("compass_experience", "CompassExperience", input);
}

export function createPublicTigResponsePanelQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("tig_response_panel", "TIGResponsePanel", input);
}

export function createPublicTigGraphExplorerQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("tig_graph_explorer", "TIGGraphExplorer", input);
}

export function createPublicPrivacyConsentQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("privacy_notice", "Privacy and Consent", input);
}

export function createPublicFallbackQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("fallback_states", "Fallback States", input);
}

export function createPublicServiceDisabledQaScenario(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario {
  return scenario("service_disabled_state", "Service Disabled State", input);
}

export function getPublicReleaseCandidateQaScenarios(input: TeoyubePublicReleaseCandidateQaScenarioInput = {}): TeoyubePublicReleaseCandidateQaScenario[] {
  return [
    createPublicHomeQaScenario(input),
    createPublicCanonQaScenario(input),
    createPublicDailyWordQaScenario(input),
    createPublicWordCardQaScenario(input),
    createPublicPromiseTableQaScenario(input),
    createPublicPrayerCompanionQaScenario(input),
    createPublicCompassExperienceQaScenario(input),
    createPublicTigResponsePanelQaScenario(input),
    createPublicTigGraphExplorerQaScenario(input),
    createPublicPrivacyConsentQaScenario(input),
    createPublicFallbackQaScenario(input),
    createPublicServiceDisabledQaScenario(input)
  ];
}
