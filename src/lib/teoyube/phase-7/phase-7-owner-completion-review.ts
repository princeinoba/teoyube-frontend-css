export type TeoyubePhase7OwnerCompletionReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase7OwnerCompletionReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase7OwnerCompletionReviewChecklistItem[];
  phase7MayBeMarkedComplete: boolean;
  notes: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase7OwnerCompletionReviewDecision =
  | "owner_completion_ready"
  | "owner_completion_pending"
  | "blocked";

export type TeoyubePhase7OwnerCompletionReviewReport = {
  valid: boolean;
  decision: TeoyubePhase7OwnerCompletionReviewDecision;
  record: TeoyubePhase7OwnerCompletionReviewRecord;
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase7OwnerCompletionReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase7OwnerCompletionReviewChecklist(accepted = false): TeoyubePhase7OwnerCompletionReviewChecklistItem[] {
  return [
    item("phase_7_1_reviewed", "Phase 7.1 reviewed", "Owner reviews operations runbook, manual feedback review, support workflow, manual monitoring, issue escalation, pause/rollback, known limitations, package, and audit.", accepted),
    item("phase_7_2_reviewed", "Phase 7.2 reviewed", "Owner reviews feedback simulation, support issue triage, product stabilization queue, safety validator, planner, QA reports, package, and audit.", accepted),
    item("phase_7_3_reviewed", "Phase 7.3 reviewed", "Owner reviews product stabilization pass, verification mapping, regression QA, readiness score, package, and audit.", accepted),
    item("final_operations_lock_reviewed", "Final operations lock reviewed", "Owner reviews the final manual/service-disabled operations lock.", accepted),
    item("final_service_disabled_lock_reviewed", "Final service-disabled lock reviewed", "Owner reviews database, analytics, monitoring, admin auth, CMS, feedback storage, live AI, notifications, and accounts disabled.", accepted),
    item("evidence_archive_reviewed", "Evidence archive reviewed", "Owner reviews the in-memory Phase 7 evidence archive.", accepted),
    item("feature_inventory_reviewed", "Feature inventory reviewed", "Owner reviews Phase 7 feature inventory.", accepted),
    item("remaining_risks_reviewed", "Remaining risks reviewed", "Owner reviews accepted/open remaining risks.", accepted),
    item("phase_8_roadmap_reviewed", "Phase 8 roadmap reviewed", "Owner reviews Phase 8 roadmap and Phase 8.1 next step.", accepted),
    item("phase_7_complete_or_blocked", "Phase 7 may be marked complete or blocked", "Owner marks Phase 7 complete or blocks completion.", accepted)
  ];
}

export function createPhase7OwnerCompletionReviewRecord(input: {
  reviewed?: boolean;
  phase7MayBeMarkedComplete?: boolean;
  checklist?: TeoyubePhase7OwnerCompletionReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase7OwnerCompletionReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_7_owner_completion_review",
    reviewed,
    checklist: input.checklist || createPhase7OwnerCompletionReviewChecklist(reviewed),
    phase7MayBeMarkedComplete: input.phase7MayBeMarkedComplete ?? reviewed,
    notes: input.notes || [],
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase7OwnerCompletionReviewBlockers(record: TeoyubePhase7OwnerCompletionReviewRecord): string[] {
  return record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 7 owner completion review must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services."];
}

export function getPhase7OwnerCompletionReviewWarnings(record: TeoyubePhase7OwnerCompletionReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 7 owner completion review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.phase7MayBeMarkedComplete ? ["Phase 7 has not been manually accepted as complete."] : [])
  ];
}

export function createPhase7OwnerCompletionReviewDecision(record: TeoyubePhase7OwnerCompletionReviewRecord): TeoyubePhase7OwnerCompletionReviewDecision {
  const blockers = getPhase7OwnerCompletionReviewBlockers(record);
  if (blockers.length) return "blocked";
  return getPhase7OwnerCompletionReviewWarnings(record).length ? "owner_completion_pending" : "owner_completion_ready";
}

export function validatePhase7OwnerCompletionReview(record: TeoyubePhase7OwnerCompletionReviewRecord): TeoyubePhase7OwnerCompletionReviewReport {
  return createPhase7OwnerCompletionReviewReport(record);
}

export function createPhase7OwnerCompletionReviewReport(record: TeoyubePhase7OwnerCompletionReviewRecord): TeoyubePhase7OwnerCompletionReviewReport {
  const blockers = getPhase7OwnerCompletionReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase7OwnerCompletionReviewDecision(record),
    record,
    blockers,
    warnings: getPhase7OwnerCompletionReviewWarnings(record),
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
