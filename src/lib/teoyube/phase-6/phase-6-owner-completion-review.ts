export type TeoyubePhase6OwnerCompletionReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase6OwnerCompletionReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase6OwnerCompletionReviewChecklistItem[];
  phase6MayBeMarkedComplete: boolean;
  notes: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase6OwnerCompletionReviewDecision =
  | "owner_completion_ready"
  | "owner_completion_pending"
  | "blocked";

export type TeoyubePhase6OwnerCompletionReviewReport = {
  valid: boolean;
  decision: TeoyubePhase6OwnerCompletionReviewDecision;
  record: TeoyubePhase6OwnerCompletionReviewRecord;
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase6OwnerCompletionReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase6OwnerCompletionReviewChecklist(accepted = false): TeoyubePhase6OwnerCompletionReviewChecklistItem[] {
  return [
    item("phase_6_1_reviewed", "Phase 6.1 reviewed", "Owner reviews controlled beta execution plan, manual participant workflow, communication, feedback, issue intake, operations checklist, safety, privacy, and service-disabled boundaries.", accepted),
    item("phase_6_2_reviewed", "Phase 6.2 reviewed", "Owner reviews manual dry run, simulated participant session, feedback simulation, issue triage, pause/rollback, disabled-service, Scripture/fallback, mobile/accessibility, and readiness score.", accepted),
    item("phase_6_3_reviewed", "Phase 6.3 reviewed", "Owner reviews fix queue, issue-to-fix conversion, stabilization planner, safety validator, operations readiness, regression QA, and post-stabilization readiness score.", accepted),
    item("operations_lock_reviewed", "Operations lock reviewed", "Owner reviews controlled beta operations lock and manual/service-disabled boundaries.", accepted),
    item("final_service_disabled_lock_reviewed", "Final service-disabled lock reviewed", "Owner reviews database, analytics, monitoring, admin auth, CMS, feedback storage, live AI, notifications, and accounts disabled.", accepted),
    item("evidence_archive_reviewed", "Evidence archive reviewed", "Owner reviews the in-memory Phase 6 evidence archive.", accepted),
    item("feature_inventory_reviewed", "Feature inventory reviewed", "Owner reviews Phase 6 feature inventory.", accepted),
    item("remaining_risks_reviewed", "Remaining risks reviewed", "Owner reviews accepted/open remaining risks.", accepted),
    item("phase_7_roadmap_reviewed", "Phase 7 roadmap reviewed", "Owner reviews Phase 7 roadmap and Phase 7.1 next step.", accepted),
    item("phase_6_complete_or_blocked", "Phase 6 may be marked complete or blocked", "Owner marks Phase 6 complete or blocks completion.", accepted)
  ];
}

export function createPhase6OwnerCompletionReviewRecord(input: {
  reviewed?: boolean;
  phase6MayBeMarkedComplete?: boolean;
  checklist?: TeoyubePhase6OwnerCompletionReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase6OwnerCompletionReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_6_owner_completion_review",
    reviewed,
    checklist: input.checklist || createPhase6OwnerCompletionReviewChecklist(reviewed),
    phase6MayBeMarkedComplete: input.phase6MayBeMarkedComplete ?? reviewed,
    notes: input.notes || [],
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase6OwnerCompletionReviewBlockers(record: TeoyubePhase6OwnerCompletionReviewRecord): string[] {
  return record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 6 owner completion review must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services."];
}

export function getPhase6OwnerCompletionReviewWarnings(record: TeoyubePhase6OwnerCompletionReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 6 owner completion review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.phase6MayBeMarkedComplete ? ["Phase 6 has not been manually accepted as complete."] : [])
  ];
}

export function createPhase6OwnerCompletionReviewDecision(record: TeoyubePhase6OwnerCompletionReviewRecord): TeoyubePhase6OwnerCompletionReviewDecision {
  const blockers = getPhase6OwnerCompletionReviewBlockers(record);
  if (blockers.length) return "blocked";
  return getPhase6OwnerCompletionReviewWarnings(record).length ? "owner_completion_pending" : "owner_completion_ready";
}

export function validatePhase6OwnerCompletionReview(record: TeoyubePhase6OwnerCompletionReviewRecord): TeoyubePhase6OwnerCompletionReviewReport {
  return createPhase6OwnerCompletionReviewReport(record);
}

export function createPhase6OwnerCompletionReviewReport(record: TeoyubePhase6OwnerCompletionReviewRecord): TeoyubePhase6OwnerCompletionReviewReport {
  const blockers = getPhase6OwnerCompletionReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase6OwnerCompletionReviewDecision(record),
    record,
    blockers,
    warnings: getPhase6OwnerCompletionReviewWarnings(record),
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
