export type TeoyubePhase5OwnerCompletionReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase5OwnerCompletionReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase5OwnerCompletionReviewChecklistItem[];
  phase5MayBeMarkedComplete: boolean;
  notes: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase5OwnerCompletionReviewDecision =
  | "owner_completion_ready"
  | "owner_completion_pending"
  | "blocked";

export type TeoyubePhase5OwnerCompletionReviewReport = {
  valid: boolean;
  decision: TeoyubePhase5OwnerCompletionReviewDecision;
  record: TeoyubePhase5OwnerCompletionReviewRecord;
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase5OwnerCompletionReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase5OwnerCompletionReviewChecklist(accepted = false): TeoyubePhase5OwnerCompletionReviewChecklistItem[] {
  return [
    item("phase_5_1_reviewed", "Phase 5.1 reviewed", "Owner reviews controlled beta preparation, QA plan, and service gate review.", accepted),
    item("phase_5_2_reviewed", "Phase 5.2 reviewed", "Owner reviews manual QA execution, issue triage, and readiness score.", accepted),
    item("phase_5_3_reviewed", "Phase 5.3 reviewed", "Owner reviews fix queue, remediation, regression QA, and post-remediation score.", accepted),
    item("phase_5_4_reviewed", "Phase 5.4 reviewed", "Owner reviews go/no-go, launch boundaries, owner approval, handoff, and known limitations.", accepted),
    item("beta_readiness_lock_reviewed", "Beta readiness lock reviewed", "Owner reviews final beta readiness lock.", accepted),
    item("final_disabled_service_lock_reviewed", "Final disabled service lock reviewed", "Owner reviews disabled service decisions.", accepted),
    item("evidence_archive_reviewed", "Evidence archive reviewed", "Owner reviews the in-memory evidence archive.", accepted),
    item("feature_inventory_reviewed", "Feature inventory reviewed", "Owner reviews Phase 5 feature inventory.", accepted),
    item("remaining_risks_reviewed", "Remaining risks reviewed", "Owner reviews accepted/open remaining risks.", accepted),
    item("phase_6_roadmap_reviewed", "Phase 6 roadmap reviewed", "Owner reviews Phase 6 roadmap and Phase 6.1 next step.", accepted),
    item("phase_5_complete_or_blocked", "Phase 5 may be marked complete or blocked", "Owner marks Phase 5 complete or blocks completion.", accepted)
  ];
}

export function createPhase5OwnerCompletionReviewRecord(input: {
  reviewed?: boolean;
  phase5MayBeMarkedComplete?: boolean;
  checklist?: TeoyubePhase5OwnerCompletionReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase5OwnerCompletionReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_5_owner_completion_review",
    reviewed,
    checklist: input.checklist || createPhase5OwnerCompletionReviewChecklist(reviewed),
    phase5MayBeMarkedComplete: input.phase5MayBeMarkedComplete ?? reviewed,
    notes: input.notes || [],
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase5OwnerCompletionReviewBlockers(record: TeoyubePhase5OwnerCompletionReviewRecord): string[] {
  return record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 5 owner completion review must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services."];
}

export function getPhase5OwnerCompletionReviewWarnings(record: TeoyubePhase5OwnerCompletionReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 5 owner completion review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.phase5MayBeMarkedComplete ? ["Phase 5 has not been manually accepted as complete."] : [])
  ];
}

export function createPhase5OwnerCompletionReviewDecision(record: TeoyubePhase5OwnerCompletionReviewRecord): TeoyubePhase5OwnerCompletionReviewDecision {
  const blockers = getPhase5OwnerCompletionReviewBlockers(record);
  if (blockers.length) return "blocked";
  return getPhase5OwnerCompletionReviewWarnings(record).length ? "owner_completion_pending" : "owner_completion_ready";
}

export function validatePhase5OwnerCompletionReview(record: TeoyubePhase5OwnerCompletionReviewRecord): TeoyubePhase5OwnerCompletionReviewReport {
  return createPhase5OwnerCompletionReviewReport(record);
}

export function createPhase5OwnerCompletionReviewReport(record: TeoyubePhase5OwnerCompletionReviewRecord): TeoyubePhase5OwnerCompletionReviewReport {
  const blockers = getPhase5OwnerCompletionReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase5OwnerCompletionReviewDecision(record),
    record,
    blockers,
    warnings: getPhase5OwnerCompletionReviewWarnings(record),
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
