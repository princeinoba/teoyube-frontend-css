export type TeoyubePhase94OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase94OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase94OwnerReviewChecklistItem[];
  nextPhaseAccepted: boolean;
  notes: string[];
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noPublicUrlsFetchedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase94OwnerReviewDecision =
  | "phase_9_4_owner_approved"
  | "phase_9_4_owner_approved_with_warnings"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase94OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase94OwnerReviewDecision;
  record: TeoyubePhase94OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase94OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase94OwnerReviewChecklist(accepted = false): TeoyubePhase94OwnerReviewChecklistItem[] {
  return [
    item("controlled_public_go_no_go_reviewed", "Controlled public go/no-go reviewed", "Owner reviews the controlled public go/no-go decision layer.", accepted),
    item("readiness_evidence_reviewed", "Readiness evidence summary reviewed", "Owner reviews the readiness evidence summary.", accepted),
    item("boundary_confirmation_reviewed", "Public release boundary final confirmation reviewed", "Owner confirms no launch/contact/feedback/fetch/service boundary changes.", accepted),
    item("final_public_owner_approval_reviewed", "Final public owner approval reviewed", "Owner reviews final public owner approval record.", accepted),
    item("operational_handoff_reviewed", "Operational handoff reviewed", "Owner reviews operational handoff package.", accepted),
    item("pause_rollback_reviewed", "Pause/rollback criteria reviewed", "Owner reviews pause and rollback criteria.", accepted),
    item("known_limitations_reviewed", "Final known limitations reviewed", "Owner reviews final known limitations.", accepted),
    item("service_disabled_confirmation_reviewed", "Final service-disabled confirmation reviewed", "Owner confirms disabled services remain disabled.", accepted),
    item("public_go_no_go_package_reviewed", "Public go/no-go readiness package reviewed", "Owner reviews the combined Phase 9.4 readiness package.", accepted),
    item("phase_9_5_acceptance_reviewed", "Next Phase 9 step accepted or blocked", "Owner accepts or blocks Phase 9.5 completion review.", accepted)
  ];
}

export function createPhase94OwnerReviewRecord(input: {
  reviewed?: boolean;
  checklist?: TeoyubePhase94OwnerReviewChecklistItem[];
  nextPhaseAccepted?: boolean;
  notes?: string[];
} = {}): TeoyubePhase94OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_9_4_owner_review",
    reviewed,
    checklist: input.checklist || createPhase94OwnerReviewChecklist(reviewed),
    nextPhaseAccepted: input.nextPhaseAccepted ?? reviewed,
    notes: input.notes || [],
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase94OwnerReviewBlockers(record: TeoyubePhase94OwnerReviewRecord): string[] {
  return record.noPublicLaunchPerformed && record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noPublicUrlsFetchedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 9.4 owner review must remain manual and must not launch, contact users, collect feedback automatically, fetch public URLs, or require external services."];
}

export function getPhase94OwnerReviewWarnings(record: TeoyubePhase94OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 9.4 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.nextPhaseAccepted ? ["Phase 9.5 has not been accepted by owner review."] : [])
  ];
}

export function createPhase94OwnerReviewDecision(record: TeoyubePhase94OwnerReviewRecord): TeoyubePhase94OwnerReviewDecision {
  const blockers = getPhase94OwnerReviewBlockers(record);
  const warnings = getPhase94OwnerReviewWarnings(record);
  if (blockers.length) return "blocked";
  if (!record.reviewed || !record.nextPhaseAccepted) return "owner_review_pending";
  return warnings.length ? "phase_9_4_owner_approved_with_warnings" : "phase_9_4_owner_approved";
}

export function validatePhase94OwnerReview(record: TeoyubePhase94OwnerReviewRecord): TeoyubePhase94OwnerReviewReport {
  return createPhase94OwnerReviewReport(record);
}

export function createPhase94OwnerReviewReport(record: TeoyubePhase94OwnerReviewRecord): TeoyubePhase94OwnerReviewReport {
  const blockers = getPhase94OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase94OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase94OwnerReviewWarnings(record),
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
