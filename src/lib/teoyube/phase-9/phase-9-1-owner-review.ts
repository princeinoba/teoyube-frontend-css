export type TeoyubePhase91OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase91OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase91OwnerReviewChecklistItem[];
  nextPhaseAccepted: boolean;
  notes: string[];
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase91OwnerReviewDecision =
  | "phase_9_1_owner_approved"
  | "phase_9_1_owner_approved_with_warnings"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase91OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase91OwnerReviewDecision;
  record: TeoyubePhase91OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase91OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase91OwnerReviewChecklist(accepted = false): TeoyubePhase91OwnerReviewChecklistItem[] {
  return [
    item("controlled_public_release_preparation_reviewed", "Controlled public release preparation reviewed", "Owner reviews controlled release preparation and no-launch boundaries.", accepted),
    item("final_public_copy_review_reviewed", "Final public copy review reviewed", "Owner reviews final copy safety, privacy, consent, support, and limitations.", accepted),
    item("known_limitations_reviewed", "Known limitations reviewed", "Owner reviews known limitations final review.", accepted),
    item("service_lock_confirmation_reviewed", "Service lock confirmation reviewed", "Owner reviews service-disabled confirmation.", accepted),
    item("privacy_security_confirmation_reviewed", "Privacy/security confirmation reviewed", "Owner reviews privacy/security confirmation.", accepted),
    item("safety_confirmation_reviewed", "Safety confirmation reviewed", "Owner reviews Scripture, explanation, fallback, confidence, content gate, and no-advice boundaries.", accepted),
    item("support_feedback_readiness_reviewed", "Support/feedback readiness reviewed", "Owner reviews manual support and feedback readiness.", accepted),
    item("operational_readiness_reviewed", "Operational readiness reviewed", "Owner reviews manual monitoring, triage, pause/rollback, limitations, and no external actions.", accepted),
    item("final_owner_approval_gate_reviewed", "Final owner approval gate reviewed", "Owner reviews final approval gate.", accepted),
    item("public_release_preparation_package_reviewed", "Public release preparation package reviewed", "Owner reviews combined package.", accepted),
    item("phase_9_2_acceptance_reviewed", "Next Phase 9 step accepted or blocked", "Owner accepts or blocks Phase 9.2 public release candidate QA.", accepted)
  ];
}

export function createPhase91OwnerReviewRecord(input: {
  reviewed?: boolean;
  checklist?: TeoyubePhase91OwnerReviewChecklistItem[];
  nextPhaseAccepted?: boolean;
  notes?: string[];
} = {}): TeoyubePhase91OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_9_1_owner_review",
    reviewed,
    checklist: input.checklist || createPhase91OwnerReviewChecklist(reviewed),
    nextPhaseAccepted: input.nextPhaseAccepted ?? reviewed,
    notes: input.notes || [],
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase91OwnerReviewBlockers(record: TeoyubePhase91OwnerReviewRecord): string[] {
  return record.noPublicLaunchPerformed && record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 9.1 owner review must remain manual and must not launch, contact users, collect feedback automatically, or require external services."];
}

export function getPhase91OwnerReviewWarnings(record: TeoyubePhase91OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 9.1 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.nextPhaseAccepted ? ["Phase 9.2 has not been accepted by owner review."] : [])
  ];
}

export function createPhase91OwnerReviewDecision(record: TeoyubePhase91OwnerReviewRecord): TeoyubePhase91OwnerReviewDecision {
  const blockers = getPhase91OwnerReviewBlockers(record);
  const warnings = getPhase91OwnerReviewWarnings(record);
  if (blockers.length) return "blocked";
  if (!record.reviewed || !record.nextPhaseAccepted) return "owner_review_pending";
  return warnings.length ? "phase_9_1_owner_approved_with_warnings" : "phase_9_1_owner_approved";
}

export function validatePhase91OwnerReview(record: TeoyubePhase91OwnerReviewRecord): TeoyubePhase91OwnerReviewReport {
  return createPhase91OwnerReviewReport(record);
}

export function createPhase91OwnerReviewReport(record: TeoyubePhase91OwnerReviewRecord): TeoyubePhase91OwnerReviewReport {
  const blockers = getPhase91OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase91OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase91OwnerReviewWarnings(record),
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
