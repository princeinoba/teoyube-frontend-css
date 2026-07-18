import type {
  TeoyubeLimitedSoftLaunchDryRunPhase,
  TeoyubeLimitedSoftLaunchDryRunScenario
} from "./limited-soft-launch-dry-run-contracts";

export type TeoyubeLimitedSoftLaunchDryRunScenarioMatrixReport = {
  valid: boolean;
  scenarioCount: number;
  criticalScenarioCount: number;
  phases: TeoyubeLimitedSoftLaunchDryRunPhase[];
  scenarios: TeoyubeLimitedSoftLaunchDryRunScenario[];
  warnings: string[];
  generatedAt: string;
};

function scenario(
  id: string,
  label: string,
  phase: TeoyubeLimitedSoftLaunchDryRunPhase,
  description: string,
  expectedEvidence: string,
  critical = true,
  safetyCritical = false
): TeoyubeLimitedSoftLaunchDryRunScenario {
  return {
    id,
    label,
    phase,
    description,
    expectedEvidence,
    critical,
    safetyCritical,
    manualOnly: true
  };
}

export function getLimitedSoftLaunchDryRunScenarios(): TeoyubeLimitedSoftLaunchDryRunScenario[] {
  return [
    scenario("owner_confirms_scope", "Owner confirms soft launch scope", "preflight_rehearsal", "Owner reviews limited participant and surface boundaries.", "Owner scope review is marked complete."),
    scenario("owner_confirms_no_external_analytics", "Owner confirms no external analytics", "preflight_rehearsal", "External analytics remains disabled.", "External analytics disabled state is confirmed.", true, true),
    scenario("owner_confirms_no_production_persistence", "Owner confirms no production persistence", "preflight_rehearsal", "Production persistence remains disconnected.", "Production persistence disabled state is confirmed.", true, true),
    scenario("owner_confirms_no_live_ai", "Owner confirms no live AI orchestration", "preflight_rehearsal", "Live AI orchestration remains disabled.", "Live AI disabled state is confirmed.", true, true),
    scenario("owner_confirms_scripture_anchoring", "Owner confirms Scripture anchoring required", "preflight_rehearsal", "Scripture anchoring remains required.", "Scripture anchors are visible in sample response review.", true, true),
    scenario("owner_confirms_explanation_path", "Owner confirms explanation path required", "preflight_rehearsal", "Explanation paths remain visible.", "Decision trace or explanation path is visible.", true, true),
    scenario("owner_confirms_fallback_enabled", "Owner confirms fallback path enabled", "preflight_rehearsal", "Fallback paths remain safe.", "Fallback behavior is visible and safe.", true, true),
    scenario("owner_confirms_consent_controls", "Owner confirms consent controls enabled", "preflight_rehearsal", "Consent controls are visible and understandable.", "Consent controls are confirmed.", true, true),
    scenario("preview_url_manually_opened", "Preview URL manually opened", "launch_day_rehearsal", "Owner or reviewer opens preview manually.", "Manual-only preview URL review is documented."),
    scenario("canon_surface_checked", "Canon surface manually checked", "surface_review_rehearsal", "Canon surface is reviewed manually.", "Canon surface passes manual smoke review."),
    scenario("daily_word_surface_checked", "Daily Word surface manually checked", "surface_review_rehearsal", "Daily Word surface is reviewed manually.", "Daily Word surface passes manual smoke review."),
    scenario("prayer_surface_checked", "Prayer surface manually checked", "surface_review_rehearsal", "Prayer surface is reviewed manually.", "Prayer surface passes manual smoke review."),
    scenario("calling_compass_surface_checked", "Calling Compass surface manually checked", "surface_review_rehearsal", "Calling Compass surface is reviewed manually.", "Calling Compass surface passes manual smoke review."),
    scenario("promise_cluster_surface_checked", "Promise Cluster surface manually checked", "surface_review_rehearsal", "Promise Cluster surface is reviewed manually.", "Promise Cluster surface passes manual smoke review."),
    scenario("ai_companion_surface_checked", "AI Companion surface manually checked", "surface_review_rehearsal", "AI Companion surface is reviewed with safe local behavior.", "AI Companion stays Scripture-anchored and fallback-safe.", true, true),
    scenario("onboarding_surface_checked", "Onboarding surface manually checked", "surface_review_rehearsal", "Onboarding surface is reviewed manually.", "Onboarding surface passes manual smoke review."),
    scenario("positive_feedback_received", "Positive feedback received", "feedback_intake_rehearsal", "Sample positive feedback is processed.", "Sanitized positive sample is summarized.", false),
    scenario("mobile_issue_reported", "Mobile issue reported", "feedback_intake_rehearsal", "Sample mobile issue is processed.", "Mobile issue routes to triage."),
    scenario("scripture_anchor_missing_report", "Scripture anchor missing report", "feedback_intake_rehearsal", "Sample Scripture anchor issue is processed.", "Scripture anchor issue routes as launch-critical.", true, true),
    scenario("explanation_path_missing_report", "Explanation path missing report", "feedback_intake_rehearsal", "Sample explanation path issue is processed.", "Explanation path issue routes as launch-critical.", true, true),
    scenario("fallback_issue_report", "Fallback issue report", "feedback_intake_rehearsal", "Sample fallback issue is processed.", "Fallback issue routes to safety review.", true, true),
    scenario("consent_issue_report", "Consent issue report", "feedback_intake_rehearsal", "Sample consent issue is processed.", "Consent issue routes to safety review.", true, true),
    scenario("privacy_concern_report", "Privacy concern report", "feedback_intake_rehearsal", "Sample privacy concern is processed.", "Privacy concern routes to owner review.", true, true),
    scenario("triage_low_issue", "Triage low issue", "issue_triage_rehearsal", "Low-severity issue receives normal review.", "Low issue is not launch-critical.", false),
    scenario("triage_high_issue", "Triage high issue", "issue_triage_rehearsal", "High-severity issue receives owner review.", "High issue is escalated."),
    scenario("triage_launch_critical_issue", "Triage launch-critical issue", "issue_triage_rehearsal", "Launch-critical issue is classified as a blocker.", "Launch-critical blocker is identified.", true, true),
    scenario("decide_pause", "Decide pause", "rollback_rehearsal", "Owner can manually pause sharing.", "Pause criteria are visible.", true, true),
    scenario("decide_rollback", "Decide rollback", "rollback_rehearsal", "Owner can manually decide rollback.", "Rollback criteria are visible.", true, true),
    scenario("document_known_limitation", "Document known limitation", "daily_review_rehearsal", "Known limitation is documented without sensitive text.", "Known limitation note is redacted.", false)
  ];
}

export function getDryRunScenarioById(id: string): TeoyubeLimitedSoftLaunchDryRunScenario | undefined {
  return getLimitedSoftLaunchDryRunScenarios().find((entry) => entry.id === id);
}

export function getDryRunScenariosByPhase(phase: TeoyubeLimitedSoftLaunchDryRunPhase): TeoyubeLimitedSoftLaunchDryRunScenario[] {
  return getLimitedSoftLaunchDryRunScenarios().filter((entry) => entry.phase === phase);
}

export function getCriticalDryRunScenarios(): TeoyubeLimitedSoftLaunchDryRunScenario[] {
  return getLimitedSoftLaunchDryRunScenarios().filter((entry) => entry.critical);
}

export function createDryRunScenarioMatrixReport(): TeoyubeLimitedSoftLaunchDryRunScenarioMatrixReport {
  const scenarios = getLimitedSoftLaunchDryRunScenarios();
  const phases = scenarios.map((entry) => entry.phase).filter((phase, index, values) => values.indexOf(phase) === index);

  return {
    valid: scenarios.length >= 25 && getCriticalDryRunScenarios().length > 0,
    scenarioCount: scenarios.length,
    criticalScenarioCount: getCriticalDryRunScenarios().length,
    phases,
    scenarios,
    warnings: ["Scenario matrix is rehearsal-only; it contacts no users and collects no real feedback."],
    generatedAt: new Date().toISOString()
  };
}
