export type TeoyubePhase73OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase73OwnerReviewRecord = {
  id: string;
  checklist: TeoyubePhase73OwnerReviewChecklistItem[];
  reviewed: boolean;
  reviewer: "owner" | "manual_delegate" | "unknown";
  notes: string[];
  nextPhaseAccepted: boolean;
  manualOnly: true;
  inMemoryOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};

export type TeoyubePhase73OwnerReviewDecision =
  | "phase_7_3_owner_approved"
  | "phase_7_3_owner_approved_with_warnings"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase73OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase73OwnerReviewDecision;
  record: TeoyubePhase73OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted: boolean): TeoyubePhase73OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase73OwnerReviewChecklist(accepted = false): TeoyubePhase73OwnerReviewChecklistItem[] {
  return [
    item("product_stabilization_queue_reviewed", "Product stabilization queue reviewed", "Owner reviews queue status, priority, and owner-review items.", accepted),
    item("stabilization_pass_reviewed", "Stabilization pass reviewed", "Owner reviews stabilization pass results and skipped/deferred records.", accepted),
    item("safe_patches_reviewed", "Safe patches reviewed", "Owner confirms any safe local patches are documented.", accepted),
    item("blocked_deferred_items_reviewed", "Blocked/deferred items reviewed", "Owner reviews blocked and deferred stabilization items.", accepted),
    item("verification_plan_reviewed", "Verification plan reviewed", "Owner reviews verification requirements and critical checks.", accepted),
    item("regression_qa_reviewed", "Regression QA reviewed", "Owner reviews stabilization regression QA.", accepted),
    item("service_disabled_regression_reviewed", "Service-disabled regression reviewed", "Owner confirms disabled services remain disabled.", accepted),
    item("scripture_explanation_fallback_regression_reviewed", "Scripture/explanation/fallback regression reviewed", "Owner confirms Scripture, explanation, fallback, confidence, theology, and privacy boundaries.", accepted),
    item("reviewed_content_admin_regression_reviewed", "Reviewed content/admin regression reviewed", "Owner confirms content gates and admin prototype boundaries.", accepted),
    item("feedback_support_regression_reviewed", "Feedback/support regression reviewed", "Owner confirms manual feedback and support boundaries.", accepted),
    item("mobile_accessibility_regression_reviewed", "Mobile/accessibility regression reviewed", "Owner confirms mobile/accessibility state is not worse.", accepted),
    item("readiness_score_reviewed", "Beta operations readiness score reviewed", "Owner reviews score band and blockers/warnings.", accepted),
    item("stabilization_package_reviewed", "Product stabilization package reviewed", "Owner reviews product stabilization pass package.", accepted),
    item("phase_7_4_acceptance_reviewed", "Phase 7.4 acceptance reviewed", "Owner accepts or blocks the next Phase 7 step.", accepted)
  ];
}

export function createPhase73OwnerReviewRecord(input: {
  reviewed?: boolean;
  checklist?: TeoyubePhase73OwnerReviewChecklistItem[];
  reviewer?: TeoyubePhase73OwnerReviewRecord["reviewer"];
  notes?: string[];
  nextPhaseAccepted?: boolean;
} = {}): TeoyubePhase73OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_7_3_owner_review",
    checklist: input.checklist || createPhase73OwnerReviewChecklist(reviewed),
    reviewed,
    reviewer: input.reviewer || (reviewed ? "owner" : "unknown"),
    notes: input.notes || [],
    nextPhaseAccepted: input.nextPhaseAccepted ?? reviewed,
    manualOnly: true,
    inMemoryOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}

export function getPhase73OwnerReviewBlockers(record: TeoyubePhase73OwnerReviewRecord): string[] {
  return [
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} is not accepted.`),
    ...(!record.manualOnly || !record.inMemoryOnly || !record.noBetaLaunchPerformed || !record.noUsersContacted || !record.noFeedbackCollectedAutomatically || !record.noExternalServicesRequired
      ? ["Phase 7.3 owner review must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services."]
      : [])
  ];
}

export function getPhase73OwnerReviewWarnings(record: TeoyubePhase73OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 7.3 owner review has not been manually completed."] : []),
    ...(!record.nextPhaseAccepted ? ["Phase 7.4 has not been accepted by owner review."] : []),
    ...(!record.notes.length ? ["No owner review notes were recorded."] : [])
  ];
}

export function createPhase73OwnerReviewDecision(record: TeoyubePhase73OwnerReviewRecord): TeoyubePhase73OwnerReviewDecision {
  const blockers = getPhase73OwnerReviewBlockers(record);
  if (blockers.length) return "blocked";
  if (!record.reviewed) return "owner_review_pending";
  return getPhase73OwnerReviewWarnings(record).length ? "phase_7_3_owner_approved_with_warnings" : "phase_7_3_owner_approved";
}

export function validatePhase73OwnerReview(record: TeoyubePhase73OwnerReviewRecord): TeoyubePhase73OwnerReviewReport {
  return createPhase73OwnerReviewReport(record);
}

export function createPhase73OwnerReviewReport(record: TeoyubePhase73OwnerReviewRecord): TeoyubePhase73OwnerReviewReport {
  const blockers = getPhase73OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase73OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase73OwnerReviewWarnings(record),
    manualOnly: true,
    inMemoryOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
