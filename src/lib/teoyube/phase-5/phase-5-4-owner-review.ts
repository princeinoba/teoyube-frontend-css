export type TeoyubePhase54OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase54OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase54OwnerReviewChecklistItem[];
  acceptedNextStep: boolean;
  notes: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase54OwnerReviewDecision =
  | "owner_review_ready"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase54OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase54OwnerReviewDecision;
  record: TeoyubePhase54OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase54OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase54OwnerReviewChecklist(accepted = false): TeoyubePhase54OwnerReviewChecklistItem[] {
  return [
    item("controlled_beta_go_no_go_reviewed", "Controlled beta go/no-go reviewed", "Owner reviews go/no-go decision, blockers, warnings, risks, and next actions.", accepted),
    item("readiness_evidence_summary_reviewed", "Readiness evidence summary reviewed", "Owner reviews preparation, manual QA, remediation, regression QA, service, privacy, and owner review evidence.", accepted),
    item("launch_boundary_validator_reviewed", "Launch boundary validator reviewed", "Owner reviews preparation-only constraints and confirms no launch/contact/collection/service action is performed.", accepted),
    item("controlled_beta_owner_approval_reviewed", "Controlled beta owner approval reviewed", "Owner reviews the structured manual approval record.", accepted),
    item("operational_handoff_reviewed", "Operational handoff reviewed", "Owner reviews handoff checklist, remaining risks, issue intake, feedback boundaries, and next actions.", accepted),
    item("pause_rollback_criteria_reviewed", "Pause/rollback criteria reviewed", "Owner reviews pause and rollback decision-support criteria.", accepted),
    item("known_limitations_reviewed", "Known limitations reviewed", "Owner reviews controlled beta limitations, no-sensitive-info copy, no divine certainty, and no professional advice.", accepted),
    item("controlled_beta_readiness_package_reviewed", "Controlled beta readiness package reviewed", "Owner reviews the combined readiness package.", accepted),
    item("next_phase_5_step", "Next Phase 5 step accepted or blocked", "Owner accepts or blocks Phase 5.5 completion review, beta readiness lock, and Phase 6 roadmap.", accepted)
  ];
}

export function createPhase54OwnerReviewRecord(input: {
  reviewed?: boolean;
  acceptedNextStep?: boolean;
  checklist?: TeoyubePhase54OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase54OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_5_4_owner_review",
    reviewed,
    checklist: input.checklist || createPhase54OwnerReviewChecklist(reviewed),
    acceptedNextStep: input.acceptedNextStep ?? reviewed,
    notes: input.notes || [],
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase54OwnerReviewBlockers(record: TeoyubePhase54OwnerReviewRecord): string[] {
  return record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 5.4 owner review must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services."];
}

export function getPhase54OwnerReviewWarnings(record: TeoyubePhase54OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 5.4 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.acceptedNextStep ? ["Phase 5.5 has not been manually accepted yet."] : [])
  ];
}

export function createPhase54OwnerReviewDecision(record: TeoyubePhase54OwnerReviewRecord): TeoyubePhase54OwnerReviewDecision {
  const blockers = getPhase54OwnerReviewBlockers(record);
  if (blockers.length) return "blocked";
  return getPhase54OwnerReviewWarnings(record).length ? "owner_review_pending" : "owner_review_ready";
}

export function validatePhase54OwnerReview(record: TeoyubePhase54OwnerReviewRecord): TeoyubePhase54OwnerReviewReport {
  return createPhase54OwnerReviewReport(record);
}

export function createPhase54OwnerReviewReport(record: TeoyubePhase54OwnerReviewRecord): TeoyubePhase54OwnerReviewReport {
  const blockers = getPhase54OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase54OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase54OwnerReviewWarnings(record),
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
