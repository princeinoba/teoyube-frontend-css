export type TeoyubePhase71OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: true;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase71OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase71OwnerReviewChecklistItem[];
  phase72MayProceedToSimulation: boolean;
  notes: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase71OwnerReviewDecision =
  | "owner_review_complete"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase71OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase71OwnerReviewDecision;
  record: TeoyubePhase71OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase71OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase71OwnerReviewChecklist(accepted = false): TeoyubePhase71OwnerReviewChecklistItem[] {
  return [
    item("operations_runbook_reviewed", "Controlled beta operations runbook reviewed", "Owner reviews runbook sections, manual checklists, and boundaries.", accepted),
    item("manual_feedback_review_reviewed", "Manual feedback review workflow reviewed", "Owner reviews sanitizer, privacy flags, manual-only review, and no automatic collection.", accepted),
    item("support_workflow_reviewed", "Beta support workflow reviewed", "Owner reviews support categories, boundaries, recommended response guidance, and no automatic messages.", accepted),
    item("manual_monitoring_reviewed", "Manual monitoring workflow reviewed", "Owner reviews manual monitoring checklist and no provider/URL/analytics behavior.", accepted),
    item("issue_escalation_reviewed", "Issue escalation workflow reviewed", "Owner reviews blocking issue categories and escalation paths.", accepted),
    item("support_to_issue_reviewed", "Support-to-issue conversion reviewed", "Owner reviews conversion categories and manual triage output.", accepted),
    item("pause_rollback_reviewed", "Pause/rollback review reviewed", "Owner reviews pause and rollback-review criteria.", accepted),
    item("known_limitations_reviewed", "Known limitations reviewed", "Owner reviews manual/service-disabled/privacy/safety limitations.", accepted),
    item("beta_operations_package_reviewed", "Beta operations package reviewed", "Owner reviews blockers, warnings, reports, and next action recommendation.", accepted),
    item("phase_7_2_next_step_accepted_or_blocked", "Next Phase 7 step accepted or blocked", "Owner accepts or blocks Phase 7.2 manual feedback simulation and stabilization queue.", accepted)
  ];
}

export function createPhase71OwnerReviewRecord(input: {
  reviewed?: boolean;
  acceptedAll?: boolean;
  phase72MayProceedToSimulation?: boolean;
  checklist?: TeoyubePhase71OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase71OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  const acceptedAll = input.acceptedAll ?? reviewed;
  return {
    id: "phase_7_1_owner_review",
    reviewed,
    checklist: input.checklist || createPhase71OwnerReviewChecklist(acceptedAll),
    phase72MayProceedToSimulation: input.phase72MayProceedToSimulation ?? reviewed,
    notes: input.notes || [],
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase71OwnerReviewBlockers(record: TeoyubePhase71OwnerReviewRecord): string[] {
  return record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 7.1 owner review must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services."];
}

export function getPhase71OwnerReviewWarnings(record: TeoyubePhase71OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 7.1 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.phase72MayProceedToSimulation ? ["Phase 7.2 simulation has not been manually accepted as the next step."] : [])
  ];
}

export function createPhase71OwnerReviewDecision(record: TeoyubePhase71OwnerReviewRecord): TeoyubePhase71OwnerReviewDecision {
  const blockers = getPhase71OwnerReviewBlockers(record);
  if (blockers.length) return "blocked";
  return getPhase71OwnerReviewWarnings(record).length ? "owner_review_pending" : "owner_review_complete";
}

export function validatePhase71OwnerReview(record: TeoyubePhase71OwnerReviewRecord): TeoyubePhase71OwnerReviewReport {
  return createPhase71OwnerReviewReport(record);
}

export function createPhase71OwnerReviewReport(record: TeoyubePhase71OwnerReviewRecord): TeoyubePhase71OwnerReviewReport {
  const blockers = getPhase71OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase71OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase71OwnerReviewWarnings(record),
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
