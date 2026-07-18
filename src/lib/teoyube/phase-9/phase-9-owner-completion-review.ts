export type TeoyubePhase9OwnerCompletionReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase9OwnerCompletionReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase9OwnerCompletionReviewChecklistItem[];
  phase9MayBeMarkedComplete: boolean;
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

export type TeoyubePhase9OwnerCompletionReviewDecision =
  | "phase_9_owner_completion_approved"
  | "phase_9_owner_completion_approved_with_warnings"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase9OwnerCompletionReviewReport = {
  valid: boolean;
  decision: TeoyubePhase9OwnerCompletionReviewDecision;
  record: TeoyubePhase9OwnerCompletionReviewRecord;
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase9OwnerCompletionReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase9OwnerCompletionReviewChecklist(accepted = false): TeoyubePhase9OwnerCompletionReviewChecklistItem[] {
  return [
    item("phase_9_1_reviewed", "Phase 9.1 reviewed", "Owner reviews controlled public release preparation.", accepted),
    item("phase_9_2_reviewed", "Phase 9.2 reviewed", "Owner reviews release candidate QA, monitoring, and support readiness.", accepted),
    item("phase_9_3_reviewed", "Phase 9.3 reviewed", "Owner reviews fix queue, regression QA, and readiness score.", accepted),
    item("phase_9_4_reviewed", "Phase 9.4 reviewed", "Owner reviews go/no-go, final owner approval, and handoff.", accepted),
    item("public_readiness_lock_reviewed", "Public readiness lock reviewed", "Owner reviews readiness locks.", accepted),
    item("final_service_disabled_lock_reviewed", "Final service-disabled lock reviewed", "Owner confirms disabled services remain disabled.", accepted),
    item("evidence_archive_reviewed", "Evidence archive reviewed", "Owner reviews Phase 9 evidence archive.", accepted),
    item("feature_inventory_reviewed", "Feature inventory reviewed", "Owner reviews Phase 9 feature inventory.", accepted),
    item("remaining_risks_reviewed", "Remaining risks reviewed", "Owner reviews remaining risks.", accepted),
    item("phase_10_roadmap_reviewed", "Phase 10 roadmap reviewed", "Owner reviews Phase 10 roadmap.", accepted),
    item("phase_9_completion_decision", "Phase 9 may be marked complete or blocked", "Owner accepts or blocks Phase 9 completion.", accepted)
  ];
}

export function createPhase9OwnerCompletionReviewRecord(input: {
  reviewed?: boolean;
  checklist?: TeoyubePhase9OwnerCompletionReviewChecklistItem[];
  phase9MayBeMarkedComplete?: boolean;
  notes?: string[];
} = {}): TeoyubePhase9OwnerCompletionReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_9_owner_completion_review",
    reviewed,
    checklist: input.checklist || createPhase9OwnerCompletionReviewChecklist(reviewed),
    phase9MayBeMarkedComplete: input.phase9MayBeMarkedComplete ?? reviewed,
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

export function getPhase9OwnerCompletionReviewBlockers(record: TeoyubePhase9OwnerCompletionReviewRecord): string[] {
  return record.noPublicLaunchPerformed && record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noPublicUrlsFetchedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 9 owner completion review must remain manual and must not launch, contact users, collect feedback automatically, fetch public URLs, or require external services."];
}

export function getPhase9OwnerCompletionReviewWarnings(record: TeoyubePhase9OwnerCompletionReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 9 owner completion review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.phase9MayBeMarkedComplete ? ["Phase 9 has not been accepted as complete by owner review."] : [])
  ];
}

export function createPhase9OwnerCompletionReviewDecision(record: TeoyubePhase9OwnerCompletionReviewRecord): TeoyubePhase9OwnerCompletionReviewDecision {
  const blockers = getPhase9OwnerCompletionReviewBlockers(record);
  const warnings = getPhase9OwnerCompletionReviewWarnings(record);
  if (blockers.length) return "blocked";
  if (!record.reviewed || !record.phase9MayBeMarkedComplete) return "owner_review_pending";
  return warnings.length ? "phase_9_owner_completion_approved_with_warnings" : "phase_9_owner_completion_approved";
}

export function validatePhase9OwnerCompletionReview(record: TeoyubePhase9OwnerCompletionReviewRecord): TeoyubePhase9OwnerCompletionReviewReport {
  return createPhase9OwnerCompletionReviewReport(record);
}

export function createPhase9OwnerCompletionReviewReport(record: TeoyubePhase9OwnerCompletionReviewRecord): TeoyubePhase9OwnerCompletionReviewReport {
  const blockers = getPhase9OwnerCompletionReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase9OwnerCompletionReviewDecision(record),
    record,
    blockers,
    warnings: getPhase9OwnerCompletionReviewWarnings(record),
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
