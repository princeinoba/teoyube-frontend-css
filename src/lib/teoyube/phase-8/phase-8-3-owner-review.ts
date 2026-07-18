export type TeoyubePhase83OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase83OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase83OwnerReviewChecklistItem[];
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

export type TeoyubePhase83OwnerReviewDecision =
  | "phase_8_3_owner_approved"
  | "phase_8_3_owner_approved_with_warnings"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase83OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase83OwnerReviewDecision;
  record: TeoyubePhase83OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase83OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase83OwnerReviewChecklist(accepted = false): TeoyubePhase83OwnerReviewChecklistItem[] {
  return [
    item("privacy_security_review_reviewed", "Privacy/security review reviewed", "Owner reviews privacy/security findings and release-gate implications.", accepted),
    item("sensitive_data_boundary_reviewed", "Sensitive data boundary review reviewed", "Owner reviews sensitive data warnings, storage prohibitions, and support limits.", accepted),
    item("consent_public_copy_reviewed", "Consent/public copy review reviewed", "Owner reviews consent, privacy, limitations, no divine-certainty, and no professional-advice copy.", accepted),
    item("controlled_service_decision_package_reviewed", "Controlled service decision package reviewed", "Owner reviews disabled/plan-only/future-review-only service decisions.", accepted),
    item("service_decision_locks_reviewed", "Service decision locks reviewed", "Owner verifies service locks remain active.", accepted),
    item("public_release_readiness_gate_reviewed", "Public release readiness gate reviewed", "Owner reviews readiness gate result.", accepted),
    item("public_release_boundary_validator_reviewed", "Public release boundary validator reviewed", "Owner verifies no launch/contact/feedback/service/public-fetch action is performed.", accepted),
    item("known_limitations_reviewed", "Known limitations reviewed", "Owner reviews public release known limitations.", accepted),
    item("support_feedback_readiness_reviewed", "Support/feedback readiness reviewed", "Owner reviews manual support and feedback boundaries.", accepted),
    item("safety_readiness_reviewed", "Safety readiness reviewed", "Owner reviews Scripture, explanation, fallback, confidence, content gate, and no-advice boundaries.", accepted),
    item("phase_8_4_acceptance_reviewed", "Phase 8.4 acceptance reviewed", "Owner accepts or blocks public release candidate planning.", accepted)
  ];
}

export function createPhase83OwnerReviewRecord(input: {
  reviewed?: boolean;
  nextPhaseAccepted?: boolean;
  checklist?: TeoyubePhase83OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase83OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_8_3_owner_review",
    reviewed,
    checklist: input.checklist || createPhase83OwnerReviewChecklist(reviewed),
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

export function getPhase83OwnerReviewBlockers(record: TeoyubePhase83OwnerReviewRecord): string[] {
  return record.noPublicLaunchPerformed && record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 8.3 owner review must remain in-memory and must not launch, contact users, collect feedback automatically, or require external services."];
}

export function getPhase83OwnerReviewWarnings(record: TeoyubePhase83OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 8.3 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.nextPhaseAccepted ? ["Phase 8.4 has not been accepted by owner review."] : [])
  ];
}

export function createPhase83OwnerReviewDecision(record: TeoyubePhase83OwnerReviewRecord): TeoyubePhase83OwnerReviewDecision {
  const blockers = getPhase83OwnerReviewBlockers(record);
  const warnings = getPhase83OwnerReviewWarnings(record);
  if (blockers.length) return "blocked";
  if (!record.reviewed || !record.nextPhaseAccepted) return "owner_review_pending";
  return warnings.length ? "phase_8_3_owner_approved_with_warnings" : "phase_8_3_owner_approved";
}

export function validatePhase83OwnerReview(record: TeoyubePhase83OwnerReviewRecord): TeoyubePhase83OwnerReviewReport {
  return createPhase83OwnerReviewReport(record);
}

export function createPhase83OwnerReviewReport(record: TeoyubePhase83OwnerReviewRecord): TeoyubePhase83OwnerReviewReport {
  const blockers = getPhase83OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase83OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase83OwnerReviewWarnings(record),
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
