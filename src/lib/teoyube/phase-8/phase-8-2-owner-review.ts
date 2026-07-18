export type TeoyubePhase82OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase82OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase82OwnerReviewChecklistItem[];
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

export type TeoyubePhase82OwnerReviewDecision =
  | "phase_8_2_owner_approved"
  | "phase_8_2_owner_approved_with_warnings"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase82OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase82OwnerReviewDecision;
  record: TeoyubePhase82OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase82OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase82OwnerReviewChecklist(accepted = false): TeoyubePhase82OwnerReviewChecklistItem[] {
  return [
    item("product_hardening_execution_reviewed", "Product hardening execution reviewed", "Owner reviews safe patches, skipped items, and execution boundaries.", accepted),
    item("safe_patches_reviewed", "Safe patches reviewed", "Owner reviews files changed, safety reasons, and regression checks.", accepted),
    item("blocked_deferred_items_reviewed", "Blocked/deferred items reviewed", "Owner reviews hardening items deferred to later gates.", accepted),
    item("mobile_hardening_reviewed", "Mobile hardening reviewed", "Owner reviews mobile hardening report.", accepted),
    item("accessibility_hardening_reviewed", "Accessibility hardening reviewed", "Owner reviews accessibility hardening report.", accepted),
    item("performance_review_reviewed", "Performance review reviewed", "Owner reviews manual/static performance review.", accepted),
    item("regression_qa_reviewed", "Regression QA reviewed", "Owner reviews hardening regression QA.", accepted),
    item("service_disabled_regression_reviewed", "Service-disabled regression reviewed", "Owner verifies no service was enabled.", accepted),
    item("safety_regression_reviewed", "Safety regression reviewed", "Owner verifies Scripture, explanation, fallback, confidence, theology, and privacy boundaries.", accepted),
    item("content_gate_regression_reviewed", "Content gate regression reviewed", "Owner verifies review-only content stayed gated.", accepted),
    item("product_hardening_package_reviewed", "Product hardening package reviewed", "Owner reviews the combined package.", accepted),
    item("phase_8_3_acceptance_reviewed", "Phase 8.3 acceptance reviewed", "Owner accepts or blocks the next Phase 8 step.", accepted)
  ];
}

export function createPhase82OwnerReviewRecord(input: {
  reviewed?: boolean;
  nextPhaseAccepted?: boolean;
  checklist?: TeoyubePhase82OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase82OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_8_2_owner_review",
    reviewed,
    checklist: input.checklist || createPhase82OwnerReviewChecklist(reviewed),
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

export function getPhase82OwnerReviewBlockers(record: TeoyubePhase82OwnerReviewRecord): string[] {
  return record.noPublicLaunchPerformed && record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 8.2 owner review must remain in-memory and must not launch, contact users, collect feedback automatically, or require external services."];
}

export function getPhase82OwnerReviewWarnings(record: TeoyubePhase82OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 8.2 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.nextPhaseAccepted ? ["Phase 8.3 has not been accepted by owner review."] : [])
  ];
}

export function createPhase82OwnerReviewDecision(record: TeoyubePhase82OwnerReviewRecord): TeoyubePhase82OwnerReviewDecision {
  const blockers = getPhase82OwnerReviewBlockers(record);
  const warnings = getPhase82OwnerReviewWarnings(record);
  if (blockers.length) return "blocked";
  if (!record.reviewed || !record.nextPhaseAccepted) return "owner_review_pending";
  return warnings.length ? "phase_8_2_owner_approved_with_warnings" : "phase_8_2_owner_approved";
}

export function validatePhase82OwnerReview(record: TeoyubePhase82OwnerReviewRecord): TeoyubePhase82OwnerReviewReport {
  return createPhase82OwnerReviewReport(record);
}

export function createPhase82OwnerReviewReport(record: TeoyubePhase82OwnerReviewRecord): TeoyubePhase82OwnerReviewReport {
  const blockers = getPhase82OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase82OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase82OwnerReviewWarnings(record),
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
