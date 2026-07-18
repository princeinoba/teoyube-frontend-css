export type TeoyubePhase63OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: true;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase63OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase63OwnerReviewChecklistItem[];
  phase64MayProceedToOperationsLock: boolean;
  notes: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase63OwnerReviewDecision =
  | "owner_review_complete"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase63OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase63OwnerReviewDecision;
  record: TeoyubePhase63OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase63OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase63OwnerReviewChecklist(accepted = false): TeoyubePhase63OwnerReviewChecklistItem[] {
  return [
    item("dry_run_fix_queue_reviewed", "Dry-run fix queue reviewed", "Owner reviews queued, safe, owner-review, blocked, and deferred dry-run fix items.", accepted),
    item("issue_to_fix_conversion_reviewed", "Issue-to-fix conversion reviewed", "Owner reviews how Phase 6.2 dry-run issues mapped into fix items.", accepted),
    item("stabilization_plan_reviewed", "Stabilization plan reviewed", "Owner reviews safe, owner-review, blocked, and deferred stabilization items.", accepted),
    item("stabilization_safety_validator_reviewed", "Stabilization safety validator reviewed", "Owner verifies stabilization cannot weaken Scripture, explanation, fallback, confidence, privacy, or disabled-service boundaries.", accepted),
    item("safe_patches_reviewed", "Actual safe patches reviewed", "Owner reviews any actual safe local patches and required regressions.", accepted),
    item("blocked_deferred_fixes_reviewed", "Blocked/deferred fixes reviewed", "Owner reviews blocked or deferred items and confirms they are not silently applied.", accepted),
    item("operations_readiness_reviewed", "Operations readiness reviewed", "Owner reviews participant workflow, communication, feedback, issue intake, pause/rollback, known limitations, and service-disabled readiness.", accepted),
    item("regression_qa_reviewed", "Dry-run regression QA reviewed", "Owner reviews regression QA across manual workflow, anchors, traces, fallback, confidence, reviewed content, services, mobile, accessibility, and operations.", accepted),
    item("disabled_service_regression_reviewed", "Disabled service regression reviewed", "Owner verifies services remain disabled or plan-only.", accepted),
    item("safety_regression_reviewed", "Safety regression reviewed", "Owner verifies Scripture, explanation, fallback, confidence, privacy, no divine certainty, and no professional advice boundaries were not weakened.", accepted),
    item("mobile_accessibility_regression_reviewed", "Mobile/accessibility regression reviewed", "Owner verifies mobile/accessibility state is not worse.", accepted),
    item("post_stabilization_score_reviewed", "Post-stabilization readiness score reviewed", "Owner reviews post-stabilization score and band.", accepted),
    item("phase_6_4_next_step_accepted_or_blocked", "Next Phase 6 step accepted or blocked", "Owner accepts or blocks Phase 6.4 operations lock and Phase 7 roadmap.", accepted)
  ];
}

export function createPhase63OwnerReviewRecord(input: {
  reviewed?: boolean;
  acceptedAll?: boolean;
  phase64MayProceedToOperationsLock?: boolean;
  checklist?: TeoyubePhase63OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase63OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  const acceptedAll = input.acceptedAll ?? reviewed;
  return {
    id: "phase_6_3_owner_review",
    reviewed,
    checklist: input.checklist || createPhase63OwnerReviewChecklist(acceptedAll),
    phase64MayProceedToOperationsLock: input.phase64MayProceedToOperationsLock ?? reviewed,
    notes: input.notes || [],
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: now()
  };
}

export function getPhase63OwnerReviewBlockers(record: TeoyubePhase63OwnerReviewRecord): string[] {
  return record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 6.3 owner review must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services."];
}

export function getPhase63OwnerReviewWarnings(record: TeoyubePhase63OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 6.3 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.phase64MayProceedToOperationsLock ? ["Phase 6.4 operations lock has not been manually accepted as the next step."] : [])
  ];
}

export function createPhase63OwnerReviewDecision(record: TeoyubePhase63OwnerReviewRecord): TeoyubePhase63OwnerReviewDecision {
  const blockers = getPhase63OwnerReviewBlockers(record);
  if (blockers.length) return "blocked";
  return getPhase63OwnerReviewWarnings(record).length ? "owner_review_pending" : "owner_review_complete";
}

export function validatePhase63OwnerReview(record: TeoyubePhase63OwnerReviewRecord): TeoyubePhase63OwnerReviewReport {
  return createPhase63OwnerReviewReport(record);
}

export function createPhase63OwnerReviewReport(record: TeoyubePhase63OwnerReviewRecord): TeoyubePhase63OwnerReviewReport {
  const blockers = getPhase63OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase63OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase63OwnerReviewWarnings(record),
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}
