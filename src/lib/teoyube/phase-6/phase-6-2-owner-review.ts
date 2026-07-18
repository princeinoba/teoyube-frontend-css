export type TeoyubePhase62OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: true;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase62OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase62OwnerReviewChecklistItem[];
  phase63MayProceedToFixQueue: boolean;
  notes: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase62OwnerReviewDecision =
  | "owner_review_complete"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase62OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase62OwnerReviewDecision;
  record: TeoyubePhase62OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase62OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase62OwnerReviewChecklist(accepted = false): TeoyubePhase62OwnerReviewChecklistItem[] {
  return [
    item("manual_dry_run_reviewed", "Manual beta dry run reviewed", "Owner reviews dry-run scenarios and simulated step results.", accepted),
    item("simulated_participant_session_reviewed", "Simulated participant session reviewed", "Owner reviews participant instructions, limitations, privacy reminders, and no-contact boundaries.", accepted),
    item("feedback_intake_simulation_reviewed", "Feedback intake simulation reviewed", "Owner reviews redaction, sensitive-info handling, and no automatic collection.", accepted),
    item("feedback_to_issue_reviewed", "Feedback-to-issue simulation reviewed", "Owner reviews conversion boundaries and confirms only simulated in-memory issues are created.", accepted),
    item("issue_triage_reviewed", "Dry-run issue triage reviewed", "Owner reviews severity, blockers, warnings, and Phase 6.3 queue guidance.", accepted),
    item("pause_rollback_reviewed", "Pause/rollback simulation reviewed", "Owner reviews dry-run pause and rollback criteria.", accepted),
    item("disabled_services_reviewed", "Disabled services reviewed", "Owner confirms database, analytics, monitoring, AI, messaging, URL fetching, and browser persistence remain disabled.", accepted),
    item("scripture_explanation_fallback_reviewed", "Scripture/explanation/fallback review complete", "Owner confirms Scripture anchors, explanation paths, safe fallbacks, confidence labels, and privacy notices remain visible.", accepted),
    item("mobile_accessibility_reviewed", "Mobile/accessibility dry-run review complete", "Owner reviews mobile-safe rendering, list fallback, readability, and keyboard access.", accepted),
    item("readiness_score_reviewed", "Dry-run readiness score reviewed", "Owner reviews readiness score band and warnings.", accepted),
    item("phase_6_3_next_step_accepted_or_blocked", "Next Phase 6 step accepted or blocked", "Owner accepts or blocks Phase 6.3 fix queue and operations readiness.", accepted)
  ];
}

export function createPhase62OwnerReviewRecord(input: {
  reviewed?: boolean;
  acceptedAll?: boolean;
  phase63MayProceedToFixQueue?: boolean;
  checklist?: TeoyubePhase62OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase62OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  const acceptedAll = input.acceptedAll ?? reviewed;
  return {
    id: "phase_6_2_owner_review",
    reviewed,
    checklist: input.checklist || createPhase62OwnerReviewChecklist(acceptedAll),
    phase63MayProceedToFixQueue: input.phase63MayProceedToFixQueue ?? reviewed,
    notes: input.notes || [],
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: now()
  };
}

export function getPhase62OwnerReviewBlockers(record: TeoyubePhase62OwnerReviewRecord): string[] {
  return record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 6.2 owner review must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services."];
}

export function getPhase62OwnerReviewWarnings(record: TeoyubePhase62OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 6.2 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.phase63MayProceedToFixQueue ? ["Phase 6.3 fix queue has not been manually accepted as the next step."] : [])
  ];
}

export function createPhase62OwnerReviewDecision(record: TeoyubePhase62OwnerReviewRecord): TeoyubePhase62OwnerReviewDecision {
  const blockers = getPhase62OwnerReviewBlockers(record);
  if (blockers.length) return "blocked";
  return getPhase62OwnerReviewWarnings(record).length ? "owner_review_pending" : "owner_review_complete";
}

export function validatePhase62OwnerReview(record: TeoyubePhase62OwnerReviewRecord): TeoyubePhase62OwnerReviewReport {
  return createPhase62OwnerReviewReport(record);
}

export function createPhase62OwnerReviewReport(record: TeoyubePhase62OwnerReviewRecord): TeoyubePhase62OwnerReviewReport {
  const blockers = getPhase62OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase62OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase62OwnerReviewWarnings(record),
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}
