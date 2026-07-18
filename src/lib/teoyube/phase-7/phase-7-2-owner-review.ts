export type TeoyubePhase72OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase72OwnerReviewRecord = {
  id: string;
  checklist: TeoyubePhase72OwnerReviewChecklistItem[];
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

export type TeoyubePhase72OwnerReviewDecision =
  | "phase_7_2_owner_approved"
  | "phase_7_2_owner_approved_with_warnings"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase72OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase72OwnerReviewDecision;
  record: TeoyubePhase72OwnerReviewRecord;
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

function item(id: string, label: string, details: string, accepted: boolean): TeoyubePhase72OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase72OwnerReviewChecklist(accepted = false): TeoyubePhase72OwnerReviewChecklistItem[] {
  return [
    item("feedback_review_simulation_reviewed", "Feedback review simulation reviewed", "Owner reviews sanitized simulated feedback handling.", accepted),
    item("support_issue_triage_reviewed", "Support issue triage reviewed", "Owner reviews support issue categories, severities, and blockers.", accepted),
    item("feedback_to_support_conversion_reviewed", "Feedback-to-support issue conversion reviewed", "Owner reviews how simulated feedback becomes support issues.", accepted),
    item("product_stabilization_queue_reviewed", "Product stabilization queue reviewed", "Owner reviews queue item priority, source, and status.", accepted),
    item("support_to_stabilization_conversion_reviewed", "Support issue-to-stabilization conversion reviewed", "Owner reviews how support issues become queue items.", accepted),
    item("stabilization_safety_validator_reviewed", "Stabilization safety validator reviewed", "Owner confirms unsafe fixes are blocked.", accepted),
    item("stabilization_planner_reviewed", "Stabilization planner reviewed", "Owner reviews safe, owner-review, blocked, and deferred classifications.", accepted),
    item("safe_patch_summary_reviewed", "Actual safe patches reviewed", "Owner confirms any safe local patches are documented.", accepted),
    item("feedback_review_qa_reviewed", "Feedback review QA reviewed", "Owner reviews feedback simulation QA boundaries.", accepted),
    item("support_workflow_qa_reviewed", "Support workflow QA reviewed", "Owner reviews support workflow QA boundaries.", accepted),
    item("stabilization_queue_qa_reviewed", "Stabilization queue QA reviewed", "Owner reviews product stabilization queue QA.", accepted),
    item("phase_7_3_acceptance_reviewed", "Phase 7.3 acceptance reviewed", "Owner accepts or blocks the next Phase 7 step.", accepted)
  ];
}

export function createPhase72OwnerReviewRecord(input: {
  reviewed?: boolean;
  checklist?: TeoyubePhase72OwnerReviewChecklistItem[];
  reviewer?: TeoyubePhase72OwnerReviewRecord["reviewer"];
  notes?: string[];
  nextPhaseAccepted?: boolean;
} = {}): TeoyubePhase72OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_7_2_owner_review",
    checklist: input.checklist || createPhase72OwnerReviewChecklist(reviewed),
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

export function getPhase72OwnerReviewBlockers(record: TeoyubePhase72OwnerReviewRecord): string[] {
  return [
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} is not accepted.`),
    ...(!record.manualOnly || !record.inMemoryOnly || !record.noBetaLaunchPerformed || !record.noUsersContacted || !record.noFeedbackCollectedAutomatically || !record.noExternalServicesRequired
      ? ["Phase 7.2 owner review must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services."]
      : [])
  ];
}

export function getPhase72OwnerReviewWarnings(record: TeoyubePhase72OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 7.2 owner review has not been manually completed."] : []),
    ...(!record.nextPhaseAccepted ? ["Phase 7.3 has not been accepted by owner review."] : []),
    ...(!record.notes.length ? ["No owner review notes were recorded."] : [])
  ];
}

export function createPhase72OwnerReviewDecision(record: TeoyubePhase72OwnerReviewRecord): TeoyubePhase72OwnerReviewDecision {
  const blockers = getPhase72OwnerReviewBlockers(record);
  if (blockers.length) return "blocked";
  if (!record.reviewed) return "owner_review_pending";
  return getPhase72OwnerReviewWarnings(record).length ? "phase_7_2_owner_approved_with_warnings" : "phase_7_2_owner_approved";
}

export function validatePhase72OwnerReview(record: TeoyubePhase72OwnerReviewRecord): TeoyubePhase72OwnerReviewReport {
  return createPhase72OwnerReviewReport(record);
}

export function createPhase72OwnerReviewReport(record: TeoyubePhase72OwnerReviewRecord): TeoyubePhase72OwnerReviewReport {
  const blockers = getPhase72OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase72OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase72OwnerReviewWarnings(record),
    manualOnly: true,
    inMemoryOnly: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
