import type {
  TeoyubeLimitedSoftLaunchOwnerReviewChecklistItem,
  TeoyubeLimitedSoftLaunchOwnerReviewRecord,
  TeoyubeLimitedSoftLaunchOwnerReviewReport
} from "./limited-soft-launch-dry-run-contracts";

export type TeoyubeLimitedSoftLaunchOwnerReviewInput = Partial<
  Pick<
    TeoyubeLimitedSoftLaunchOwnerReviewRecord,
    | "id"
    | "label"
    | "status"
    | "checklist"
    | "decisionAccepted"
    | "decisionBlocked"
    | "ownerNotes"
  >
>;

function item(id: string, label: string, details: string): TeoyubeLimitedSoftLaunchOwnerReviewChecklistItem {
  return { id, label, required: true, complete: true, details };
}

export function createLimitedSoftLaunchOwnerReviewChecklist(): TeoyubeLimitedSoftLaunchOwnerReviewChecklistItem[] {
  return [
    item("dry_run_completed", "Dry run completed", "Dry run report has been reviewed."),
    item("runbook_reviewed", "Runbook reviewed", "Launch day runbook has been reviewed."),
    item("participant_scope_reviewed", "Participant scope reviewed", "Limited participant scope is understood."),
    item("surface_scope_reviewed", "Surface scope reviewed", "Included and excluded surfaces are understood."),
    item("scripture_anchoring_reviewed", "Scripture anchoring reviewed", "Scripture anchoring remains required."),
    item("explanation_path_reviewed", "Explanation path reviewed", "Explanation paths remain visible."),
    item("fallback_safety_reviewed", "Fallback safety reviewed", "Fallback behavior remains safe."),
    item("consent_privacy_reviewed", "Consent and privacy reviewed", "Consent/privacy boundaries remain visible."),
    item("feedback_workflow_reviewed", "Feedback workflow reviewed", "Feedback remains manual and redacted."),
    item("issue_triage_reviewed", "Issue triage workflow reviewed", "Launch-critical issues route to blockers."),
    item("rollback_criteria_reviewed", "Rollback criteria reviewed", "Pause and rollback criteria are visible."),
    item("known_limitations_reviewed", "Known limitations reviewed", "Known limitations remain documented."),
    item("no_external_analytics_confirmed", "No external analytics confirmed", "External analytics remains disabled."),
    item("no_production_persistence_confirmed", "No production persistence confirmed", "Production persistence remains disabled."),
    item("no_live_ai_confirmed", "No live AI orchestration confirmed", "Live AI orchestration remains disabled."),
    item("decision_accepted_or_blocked", "Decision accepted or blocked", "Owner decision is structured as accepted or blocked.")
  ];
}

export function createLimitedSoftLaunchOwnerReviewRecord(
  input: TeoyubeLimitedSoftLaunchOwnerReviewInput = {}
): TeoyubeLimitedSoftLaunchOwnerReviewRecord {
  const decisionAccepted = input.decisionAccepted ?? true;
  const decisionBlocked = input.decisionBlocked ?? false;

  return {
    id: input.id || "limited_soft_launch_owner_review_3_2",
    label: input.label || "Limited Soft Launch Dry Run Owner Review",
    status: input.status || (decisionAccepted && !decisionBlocked ? "accepted" : decisionBlocked ? "blocked" : "needs_review"),
    checklist: input.checklist || createLimitedSoftLaunchOwnerReviewChecklist(),
    decisionAccepted,
    decisionBlocked,
    ownerNotes: input.ownerNotes || [
      "Owner review is represented as structured manual approval only.",
      "No signature, user contact, deployment, feedback collection, or provider action is performed by code."
    ],
    manualApprovalOnly: true,
    signatureRequired: false,
    messagesSent: false,
    usersContacted: false,
    generatedAt: new Date().toISOString()
  };
}

export function getLimitedSoftLaunchOwnerReviewBlockers(record: TeoyubeLimitedSoftLaunchOwnerReviewRecord): string[] {
  return [
    record.checklist.every((entry) => !entry.required || entry.complete) ? "" : "All owner review checklist items must be complete.",
    record.decisionBlocked ? "Owner review is blocked." : "",
    record.decisionAccepted ? "" : "Owner review must be accepted before final readiness package preparation.",
    record.messagesSent ? "Owner review must not send messages." : "",
    record.usersContacted ? "Owner review must not contact users." : ""
  ].filter(Boolean);
}

export function getLimitedSoftLaunchOwnerReviewWarnings(record: TeoyubeLimitedSoftLaunchOwnerReviewRecord): string[] {
  return [
    record.ownerNotes.length ? "" : "Owner review notes should be included.",
    "Owner review is structured manual approval only; no signature is required by code."
  ].filter(Boolean);
}

export function validateLimitedSoftLaunchOwnerReview(record: TeoyubeLimitedSoftLaunchOwnerReviewRecord) {
  const blockers = getLimitedSoftLaunchOwnerReviewBlockers(record);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings: getLimitedSoftLaunchOwnerReviewWarnings(record)
  };
}

export function createLimitedSoftLaunchOwnerReviewReport(
  record: TeoyubeLimitedSoftLaunchOwnerReviewRecord = createLimitedSoftLaunchOwnerReviewRecord()
): TeoyubeLimitedSoftLaunchOwnerReviewReport {
  const validation = validateLimitedSoftLaunchOwnerReview(record);

  return {
    valid: validation.valid,
    ready: validation.valid && record.status === "accepted",
    status: record.status,
    record,
    checklistCount: record.checklist.length,
    completedChecklistCount: record.checklist.filter((entry) => entry.complete).length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noMessagesSent: true,
    noUsersContacted: true,
    generatedAt: new Date().toISOString()
  };
}
