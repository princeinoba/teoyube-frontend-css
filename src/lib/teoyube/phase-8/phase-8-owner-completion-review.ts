export type TeoyubePhase8OwnerCompletionReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase8OwnerCompletionReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase8OwnerCompletionReviewChecklistItem[];
  phase8MayBeMarkedComplete: boolean;
  phase8Blocked: boolean;
  notes: string[];
  noPublicLaunchPerformed: true;
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase8OwnerCompletionReviewDecision =
  | "phase_8_owner_completion_approved"
  | "phase_8_owner_completion_approved_with_warnings"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase8OwnerCompletionReviewReport = {
  valid: boolean;
  decision: TeoyubePhase8OwnerCompletionReviewDecision;
  record: TeoyubePhase8OwnerCompletionReviewRecord;
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase8OwnerCompletionReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase8OwnerCompletionReviewChecklist(accepted = false): TeoyubePhase8OwnerCompletionReviewChecklistItem[] {
  return [
    item("phase_8_1_reviewed", "Phase 8.1 reviewed", "Owner reviews post-beta readiness, hardening plan, and service reassessment gate.", accepted),
    item("phase_8_2_reviewed", "Phase 8.2 reviewed", "Owner reviews product hardening execution, mobile/accessibility pass, and performance review.", accepted),
    item("phase_8_3_reviewed", "Phase 8.3 reviewed", "Owner reviews privacy/security, service decisions, and public release readiness gate.", accepted),
    item("phase_8_4_reviewed", "Phase 8.4 reviewed", "Owner reviews public release candidate planning and final readiness package.", accepted),
    item("public_release_candidate_plan_reviewed", "Public release candidate plan reviewed", "Owner reviews release candidate planning boundaries.", accepted),
    item("final_readiness_review_reviewed", "Final readiness review reviewed", "Owner reviews final readiness decision.", accepted),
    item("final_privacy_security_lock_reviewed", "Final privacy/security lock reviewed", "Owner reviews privacy and sensitive-data locks.", accepted),
    item("final_service_decision_lock_reviewed", "Final service decision lock reviewed", "Owner reviews disabled and future-review-only service decisions.", accepted),
    item("final_public_release_boundary_lock_reviewed", "Final public release boundary lock reviewed", "Owner verifies no launch/contact/feedback/fetch/service/publish side effects.", accepted),
    item("evidence_archive_reviewed", "Evidence archive reviewed", "Owner reviews manual evidence archive.", accepted),
    item("feature_inventory_reviewed", "Feature inventory reviewed", "Owner reviews Phase 8 feature inventory.", accepted),
    item("remaining_risks_reviewed", "Remaining risks reviewed", "Owner reviews remaining risks and mitigations.", accepted),
    item("phase_9_roadmap_reviewed", "Phase 9 roadmap reviewed", "Owner reviews Phase 9 controlled public release preparation roadmap.", accepted)
  ];
}

export function createPhase8OwnerCompletionReviewRecord(input: {
  reviewed?: boolean;
  checklist?: TeoyubePhase8OwnerCompletionReviewChecklistItem[];
  phase8MayBeMarkedComplete?: boolean;
  phase8Blocked?: boolean;
  notes?: string[];
} = {}): TeoyubePhase8OwnerCompletionReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_8_owner_completion_review",
    reviewed,
    checklist: input.checklist || createPhase8OwnerCompletionReviewChecklist(reviewed),
    phase8MayBeMarkedComplete: input.phase8MayBeMarkedComplete ?? reviewed,
    phase8Blocked: input.phase8Blocked ?? false,
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

export function getPhase8OwnerCompletionReviewBlockers(record: TeoyubePhase8OwnerCompletionReviewRecord): string[] {
  const safetyBlockers = record.noPublicLaunchPerformed && record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 8 owner completion review must remain in-memory and must not launch, contact users, collect feedback automatically, or require external services."];
  return [
    ...safetyBlockers,
    ...(record.phase8Blocked ? ["Owner review marked Phase 8 blocked."] : [])
  ];
}

export function getPhase8OwnerCompletionReviewWarnings(record: TeoyubePhase8OwnerCompletionReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 8 owner completion review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.phase8MayBeMarkedComplete ? ["Owner review has not marked Phase 8 complete."] : [])
  ];
}

export function createPhase8OwnerCompletionReviewDecision(record: TeoyubePhase8OwnerCompletionReviewRecord): TeoyubePhase8OwnerCompletionReviewDecision {
  const blockers = getPhase8OwnerCompletionReviewBlockers(record);
  const warnings = getPhase8OwnerCompletionReviewWarnings(record);
  if (blockers.length) return "blocked";
  if (!record.reviewed || !record.phase8MayBeMarkedComplete) return "owner_review_pending";
  return warnings.length ? "phase_8_owner_completion_approved_with_warnings" : "phase_8_owner_completion_approved";
}

export function validatePhase8OwnerCompletionReview(record: TeoyubePhase8OwnerCompletionReviewRecord): TeoyubePhase8OwnerCompletionReviewReport {
  return createPhase8OwnerCompletionReviewReport(record);
}

export function createPhase8OwnerCompletionReviewReport(record: TeoyubePhase8OwnerCompletionReviewRecord): TeoyubePhase8OwnerCompletionReviewReport {
  const blockers = getPhase8OwnerCompletionReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase8OwnerCompletionReviewDecision(record),
    record,
    blockers,
    warnings: getPhase8OwnerCompletionReviewWarnings(record),
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
