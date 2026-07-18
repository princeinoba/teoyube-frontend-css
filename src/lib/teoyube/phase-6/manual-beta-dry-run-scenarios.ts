import type {
  TeoyubeManualBetaDryRunArea,
  TeoyubeManualBetaDryRunScenario,
  TeoyubeManualBetaDryRunStep
} from "./manual-beta-dry-run-contracts";

type ScenarioInput = Partial<{
  id: string;
  label: string;
  area: TeoyubeManualBetaDryRunArea;
}>;

function step(id: string, area: TeoyubeManualBetaDryRunArea, label: string, order: number, details: string): TeoyubeManualBetaDryRunStep {
  return { id, area, label, order, details, manualOnly: true };
}

function scenario(id: string, area: TeoyubeManualBetaDryRunArea, label: string, steps: TeoyubeManualBetaDryRunStep[]): TeoyubeManualBetaDryRunScenario {
  return { id, area, label, steps, noUserContact: true, noUrlFetch: true, simulatedOnly: true };
}

export function createDryRunScenarioForWordJourney(input: ScenarioInput = {}): TeoyubeManualBetaDryRunScenario {
  return scenario(input.id || "dry_run_word_journey", input.area || "scripture_anchor", input.label || "Owner manually walks through WordCard", [
    step("word_card_open", "execution_plan", "Open WordCard manually", 1, "Owner uses local UI or reviewed mock scenario without contacting users."),
    step("word_card_scripture", "scripture_anchor", "Confirm Scripture anchor", 2, "Visible Scripture anchor is checked manually."),
    step("word_card_confidence", "confidence_label", "Confirm confidence label", 3, "Confidence language remains humble and visible."),
    step("word_card_fallback", "fallback", "Confirm fallback state", 4, "Fallback remains safe, non-empty, and does not invent promises.")
  ]);
}

export function createDryRunScenarioForPrayerJourney(input: ScenarioInput = {}): TeoyubeManualBetaDryRunScenario {
  return scenario(input.id || "dry_run_prayer_journey", input.area || "explanation_trace", input.label || "Owner manually walks through PrayerCompanion", [
    step("prayer_open", "execution_plan", "Open PrayerCompanion manually", 1, "Owner rehearses a non-sensitive sample prayer journey."),
    step("prayer_privacy", "privacy_consent", "Confirm privacy reminder", 2, "Privacy reminder warns against sensitive information."),
    step("prayer_explanation", "explanation_trace", "Confirm explanation trace", 3, "Prayer support keeps devotional explanation boundaries."),
    step("prayer_no_advice", "fallback", "Confirm no professional advice", 4, "Prayer support does not provide medical, legal, financial, or emergency advice.")
  ]);
}

export function createDryRunScenarioForCallingJourney(input: ScenarioInput = {}): TeoyubeManualBetaDryRunScenario {
  return scenario(input.id || "dry_run_calling_journey", input.area || "explanation_trace", input.label || "Owner manually walks through CompassExperience", [
    step("calling_open", "execution_plan", "Open CompassExperience manually", 1, "Owner rehearses a calling path without claiming certainty."),
    step("calling_scripture", "scripture_anchor", "Confirm Scripture anchor", 2, "Calling path keeps Scripture support where available."),
    step("calling_explanation", "explanation_trace", "Confirm explanation path", 3, "Calling recommendation remains explainable."),
    step("calling_humble_language", "confidence_label", "Confirm humble language", 4, "No divine-certainty language is present.")
  ]);
}

export function createDryRunScenarioForTigTrace(input: ScenarioInput = {}): TeoyubeManualBetaDryRunScenario {
  return scenario(input.id || "dry_run_tig_trace", input.area || "explanation_trace", input.label || "Owner manually walks through TIG response and graph", [
    step("tig_response_panel", "explanation_trace", "Review TIGResponsePanel", 1, "Selected word, promise, Scripture anchor, confidence, and fallback reason remain visible."),
    step("tig_graph_explorer", "mobile", "Review TIGGraphExplorer", 2, "Graph remains readable or has list fallback."),
    step("tig_trace", "explanation_trace", "Confirm trace", 3, "Explanation trace is visible to normal users."),
    step("tig_confidence", "confidence_label", "Confirm confidence", 4, "Confidence labels are present and humble.")
  ]);
}

export function createDryRunScenarioForPromiseTable(input: ScenarioInput = {}): TeoyubeManualBetaDryRunScenario {
  return scenario(input.id || "dry_run_promise_table", input.area || "mobile", input.label || "Owner manually walks through Promise Table", [
    step("promise_table_open", "execution_plan", "Open Promise Table manually", 1, "Rows come from reviewed local data."),
    step("promise_table_scripture", "scripture_anchor", "Confirm Scripture anchors", 2, "Promise rows keep Scripture anchors where available."),
    step("promise_table_mobile", "mobile", "Confirm mobile view", 3, "Table remains readable in mobile-safe view."),
    step("promise_table_review_gate", "reviewed_content_gate", "Confirm reviewed content gate", 4, "Review-only content remains excluded.")
  ]);
}

export function createDryRunScenarioForFeedbackBoundary(input: ScenarioInput = {}): TeoyubeManualBetaDryRunScenario {
  return scenario(input.id || "dry_run_feedback_boundary", input.area || "feedback_boundary", input.label || "Owner records simulated feedback", [
    step("feedback_create", "feedback_boundary", "Create simulated feedback", 1, "Feedback is simulated only and manually entered."),
    step("feedback_redact", "privacy_consent", "Redact sensitive text", 2, "Sensitive text is redacted before review."),
    step("feedback_no_storage", "service_disabled_state", "Confirm no storage", 3, "Feedback is not persisted or used for hidden personalization.")
  ]);
}

export function createDryRunScenarioForIssueIntake(input: ScenarioInput = {}): TeoyubeManualBetaDryRunScenario {
  return scenario(input.id || "dry_run_issue_intake", input.area || "issue_intake", input.label || "Owner triages simulated issue", [
    step("issue_create", "issue_intake", "Create simulated issue", 1, "Issue is created from simulation or manual observation only."),
    step("issue_classify", "issue_intake", "Classify issue", 2, "Safety-critical issue categories are recognized."),
    step("issue_escalate", "pause_rollback", "Check escalation", 3, "Blocking issue maps to manual pause or rollback review.")
  ]);
}

export function createDryRunScenarioForDisabledServices(input: ScenarioInput = {}): TeoyubeManualBetaDryRunScenario {
  return scenario(input.id || "dry_run_disabled_services", input.area || "service_disabled_state", input.label || "Owner confirms disabled services", [
    step("services_database", "service_disabled_state", "Confirm database disabled", 1, "No database persistence is enabled."),
    step("services_analytics", "service_disabled_state", "Confirm analytics disabled", 2, "No analytics are enabled."),
    step("services_ai_auth_cms", "service_disabled_state", "Confirm AI/auth/CMS disabled", 3, "No live AI, admin auth, CMS, email, or user accounts are enabled."),
    step("services_external", "service_disabled_state", "Confirm no external service required", 4, "Dry run has no external service dependency.")
  ]);
}

export function getManualBetaDryRunScenarios(): TeoyubeManualBetaDryRunScenario[] {
  return [
    scenario("dry_run_start", "execution_plan", "Owner starts controlled beta dry run", [
      step("start_review_phase_6_1", "execution_plan", "Review Phase 6.1 package", 1, "Owner reviews Phase 6.1 boundaries before simulation."),
      step("start_no_launch", "execution_plan", "Confirm no launch", 2, "Dry run does not launch beta or activate participant access.")
    ]),
    scenario("dry_run_participant_instructions", "participant_workflow", "Owner reviews participant instructions", [
      step("participant_instruction", "participant_workflow", "Review manual instruction", 1, "Instruction remains manual and does not contact anyone."),
      step("participant_known_limitations", "participant_workflow", "Review known limitations", 2, "Known limitations are visible before dry-run simulation."),
      step("participant_privacy", "privacy_consent", "Review privacy/consent reminder", 3, "Privacy reminder warns against sensitive information.")
    ]),
    createDryRunScenarioForWordJourney(),
    createDryRunScenarioForPromiseTable(),
    createDryRunScenarioForPrayerJourney(),
    createDryRunScenarioForCallingJourney(),
    createDryRunScenarioForTigTrace(),
    createDryRunScenarioForFeedbackBoundary(),
    createDryRunScenarioForIssueIntake(),
    scenario("dry_run_pause_rollback", "pause_rollback", "Owner checks pause/rollback criteria", [
      step("pause_check", "pause_rollback", "Simulate pause criteria", 1, "Pause is recommended only as decision support."),
      step("rollback_check", "pause_rollback", "Simulate rollback criteria", 2, "Rollback is not performed by code.")
    ]),
    createDryRunScenarioForDisabledServices()
  ];
}

