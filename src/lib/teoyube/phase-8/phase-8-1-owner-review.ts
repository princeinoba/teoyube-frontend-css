export type TeoyubePhase81OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase81OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase81OwnerReviewChecklistItem[];
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

export type TeoyubePhase81OwnerReviewDecision =
  | "phase_8_1_owner_approved"
  | "phase_8_1_owner_approved_with_warnings"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase81OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase81OwnerReviewDecision;
  record: TeoyubePhase81OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase81OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase81OwnerReviewChecklist(accepted = false): TeoyubePhase81OwnerReviewChecklistItem[] {
  return [
    item("post_beta_readiness_audit_reviewed", "Post-beta readiness audit reviewed", "Owner reviews that Phase 8.1 is readiness planning only unless external beta evidence is supplied.", accepted),
    item("product_hardening_plan_reviewed", "Product hardening plan reviewed", "Owner reviews planned product hardening items and priorities.", accepted),
    item("safe_hardening_patches_reviewed", "Safe hardening patches reviewed", "Owner reviews that no product patches were applied unless explicitly safe and recorded.", accepted),
    item("service_reassessment_gate_reviewed", "Controlled service reassessment gate reviewed", "Owner reviews service decisions remain disabled or plan-only.", accepted),
    item("service_enforcement_qa_reviewed", "Service enforcement QA reviewed", "Owner reviews that reassessment did not enable services.", accepted),
    item("privacy_security_follow_up_reviewed", "Privacy/security follow-up reviewed", "Owner reviews privacy, consent, security, sensitive data, and future service requirements.", accepted),
    item("performance_hardening_reviewed", "Performance hardening reviewed", "Owner reviews performance hardening plan and no-monitoring/no-analytics boundary.", accepted),
    item("mobile_accessibility_hardening_reviewed", "Mobile/accessibility hardening reviewed", "Owner reviews mobile/accessibility hardening plan.", accepted),
    item("content_review_follow_up_reviewed", "Content review follow-up reviewed", "Owner reviews content gates and Scripture/theology review requirements.", accepted),
    item("public_release_preparation_reviewed", "Public release preparation reviewed", "Owner reviews that Phase 8.1 does not launch publicly.", accepted),
    item("phase_8_2_acceptance_reviewed", "Phase 8.2 acceptance reviewed", "Owner accepts or blocks the next Phase 8 step.", accepted)
  ];
}

export function createPhase81OwnerReviewRecord(input: {
  reviewed?: boolean;
  nextPhaseAccepted?: boolean;
  checklist?: TeoyubePhase81OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase81OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_8_1_owner_review",
    reviewed,
    checklist: input.checklist || createPhase81OwnerReviewChecklist(reviewed),
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

export function getPhase81OwnerReviewBlockers(record: TeoyubePhase81OwnerReviewRecord): string[] {
  return record.noPublicLaunchPerformed && record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 8.1 owner review must remain in-memory and must not launch, contact users, collect feedback automatically, or require external services."];
}

export function getPhase81OwnerReviewWarnings(record: TeoyubePhase81OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 8.1 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.nextPhaseAccepted ? ["Phase 8.2 has not been accepted by owner review."] : [])
  ];
}

export function createPhase81OwnerReviewDecision(record: TeoyubePhase81OwnerReviewRecord): TeoyubePhase81OwnerReviewDecision {
  const blockers = getPhase81OwnerReviewBlockers(record);
  const warnings = getPhase81OwnerReviewWarnings(record);
  if (blockers.length) return "blocked";
  if (!record.reviewed || !record.nextPhaseAccepted) return "owner_review_pending";
  return warnings.length ? "phase_8_1_owner_approved_with_warnings" : "phase_8_1_owner_approved";
}

export function validatePhase81OwnerReview(record: TeoyubePhase81OwnerReviewRecord): TeoyubePhase81OwnerReviewReport {
  return createPhase81OwnerReviewReport(record);
}

export function createPhase81OwnerReviewReport(record: TeoyubePhase81OwnerReviewRecord): TeoyubePhase81OwnerReviewReport {
  const blockers = getPhase81OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase81OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase81OwnerReviewWarnings(record),
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
