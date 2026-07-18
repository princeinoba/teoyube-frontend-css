export type TeoyubeBetaOperationsChecklistItem = {
  id: string;
  section: "pre_beta" | "during_beta" | "post_session" | "pause" | "rollback";
  label: string;
  required: true;
  complete: boolean;
  details: string;
};

export type TeoyubeBetaOperationsChecklistReport = {
  valid: boolean;
  checklist: TeoyubeBetaOperationsChecklistItem[];
  blockers: string[];
  warnings: string[];
  noAutomaticUserContact: true;
  noAutomaticFeedbackCollection: true;
  noExternalServiceDependency: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(section: TeoyubeBetaOperationsChecklistItem["section"], id: string, label: string, details: string, complete = true): TeoyubeBetaOperationsChecklistItem {
  return { id, section, label, required: true, complete, details };
}

function now(): string {
  return new Date().toISOString();
}

export function getPreBetaManualChecklist(): TeoyubeBetaOperationsChecklistItem[] {
  return [
    item("pre_beta", "owner_approval_confirmed", "Owner approval confirmed", "Owner approval is required before any real beta execution."),
    item("pre_beta", "beta_scope_confirmed", "Beta scope confirmed", "Controlled, limited, manual scope is confirmed."),
    item("pre_beta", "service_disabled_state_confirmed", "Service-disabled state confirmed", "Database, analytics, monitoring, auth, CMS, email, user accounts, and live AI remain disabled."),
    item("pre_beta", "known_limitations_available", "Known limitations available", "Known limitations are ready for manual participant review."),
    item("pre_beta", "privacy_consent_reminder_available", "Privacy/consent reminder available", "Privacy and consent reminders are visible before participation."),
    item("pre_beta", "manual_feedback_boundary_confirmed", "Manual feedback boundary confirmed", "Feedback remains manual, redacted, and not automatically stored."),
    item("pre_beta", "manual_issue_intake_ready", "Manual issue intake ready", "Issue categories and escalation rules are ready.")
  ];
}

export function getDuringBetaManualChecklist(): TeoyubeBetaOperationsChecklistItem[] {
  return [
    item("during_beta", "scripture_explanation_fallback_checks", "Scripture/explanation/fallback checks ready", "Scripture anchors, explanation traces, fallback states, and confidence labels are observed."),
    item("during_beta", "mobile_accessibility_checks", "Mobile/accessibility checks ready", "Mobile and accessibility checks stay part of manual observation."),
    item("during_beta", "no_automatic_user_contact", "No automatic user contact", "No code contacts users."),
    item("during_beta", "no_automatic_feedback_collection", "No automatic feedback collection", "No code collects feedback."),
    item("during_beta", "no_external_service_dependency", "No external service dependency", "The beta can be planned without external services.")
  ];
}

export function getPostSessionManualChecklist(): TeoyubeBetaOperationsChecklistItem[] {
  return [
    item("post_session", "manual_feedback_review", "Manual feedback review", "Owner reviews redacted feedback manually."),
    item("post_session", "manual_issue_triage", "Manual issue triage", "Owner triages blockers and warnings manually."),
    item("post_session", "known_limitations_update", "Known limitations update", "Known limitations are updated manually if needed.")
  ];
}

export function getPauseCriteriaChecklist(): TeoyubeBetaOperationsChecklistItem[] {
  return [
    item("pause", "pause_app_load_failure", "Pause for app load failure", "Pause if the app does not load for participants."),
    item("pause", "pause_missing_scripture_or_explanation", "Pause for missing Scripture/explanation", "Pause if Scripture anchors or explanation traces disappear."),
    item("pause", "pause_unsafe_fallback_or_confidence", "Pause for unsafe fallback/confidence", "Pause if fallback safety or confidence labels are compromised."),
    item("pause", "pause_privacy_or_service_issue", "Pause for privacy/service issue", "Pause if privacy notices fail or disabled services appear enabled.")
  ];
}

export function getRollbackCriteriaChecklist(): TeoyubeBetaOperationsChecklistItem[] {
  return [
    item("rollback", "rollback_review_only_content_visible", "Rollback review for review-only content", "Rollback review is required if review-only content appears live."),
    item("rollback", "rollback_persistence_or_analytics", "Rollback review for persistence/analytics", "Rollback review is required if persistence or analytics are detected."),
    item("rollback", "rollback_divine_certainty_or_advice", "Rollback review for divine-certainty/professional-advice language", "Rollback review is required for unsafe spiritual or professional-advice claims.")
  ];
}

export function createBetaOperationsChecklist(): TeoyubeBetaOperationsChecklistItem[] {
  return [
    ...getPreBetaManualChecklist(),
    ...getDuringBetaManualChecklist(),
    ...getPostSessionManualChecklist(),
    ...getPauseCriteriaChecklist(),
    ...getRollbackCriteriaChecklist()
  ];
}

export function createBetaOperationsChecklistReport(input: { checklist?: TeoyubeBetaOperationsChecklistItem[] } = {}): TeoyubeBetaOperationsChecklistReport {
  const checklist = input.checklist || createBetaOperationsChecklist();
  const incomplete = checklist.filter((entry) => entry.required && !entry.complete);
  return {
    valid: incomplete.length === 0,
    checklist,
    blockers: incomplete.map((entry) => `${entry.label} is incomplete.`),
    warnings: ["Checklist is planning support only and does not start a beta session."],
    noAutomaticUserContact: true,
    noAutomaticFeedbackCollection: true,
    noExternalServiceDependency: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

