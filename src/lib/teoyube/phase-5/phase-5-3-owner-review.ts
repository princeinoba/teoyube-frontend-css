export type TeoyubePhase53OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase53OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase53OwnerReviewChecklistItem[];
  acceptedNextStep: boolean;
  notes: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase53OwnerReviewDecision =
  | "owner_review_ready"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase53OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase53OwnerReviewDecision;
  record: TeoyubePhase53OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase53OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase53OwnerReviewChecklist(accepted = false): TeoyubePhase53OwnerReviewChecklistItem[] {
  return [
    item("beta_fix_queue_reviewed", "Beta fix queue reviewed", "Owner reviews queued, safe, owner-review, blocked, and deferred remediation items.", accepted),
    item("issue_to_fix_conversion_reviewed", "Issue-to-fix conversion reviewed", "Owner reviews how Phase 5.2 issues mapped into the fix queue.", accepted),
    item("remediation_plan_reviewed", "Remediation plan reviewed", "Owner reviews safe, owner-review, blocked, and deferred remediation classification.", accepted),
    item("safety_validator_reviewed", "Safety validator reviewed", "Owner reviews remediation safety blockers and warnings.", accepted),
    item("actual_safe_patches_reviewed", "Actual safe patches reviewed", "Owner reviews applied documentation/export/status patches and confirms no runtime/service changes were made.", accepted),
    item("blocked_deferred_fixes_reviewed", "Blocked/deferred fixes reviewed", "Owner reviews anything not safe for local remediation.", accepted),
    item("regression_qa_reviewed", "Regression QA reviewed", "Owner reviews regression QA across data, journey, anchors, traces, fallback, confidence, reviewed content, admin, services, mobile, accessibility, Promise Table, TIG graph, TIG response, and privacy.", accepted),
    item("disabled_service_regression_reviewed", "Disabled service regression reviewed", "Owner verifies services remain disabled or plan-only.", accepted),
    item("scripture_explanation_fallback_regression_reviewed", "Scripture/explanation/fallback regression reviewed", "Owner verifies spiritual safety, explanation visibility, and confidence boundaries were not weakened.", accepted),
    item("reviewed_content_gate_regression_reviewed", "Reviewed content gate regression reviewed", "Owner verifies review-only content remains excluded and no automatic publishing exists.", accepted),
    item("mobile_accessibility_regression_reviewed", "Mobile/accessibility regression reviewed", "Owner verifies mobile/accessibility state is not worse.", accepted),
    item("post_remediation_score_reviewed", "Post-remediation readiness score reviewed", "Owner reviews post-remediation score and band.", accepted),
    item("next_phase_5_step", "Next Phase 5 step accepted or blocked", "Owner accepts or blocks Phase 5.4 controlled beta go/no-go and operational handoff.", accepted)
  ];
}

export function createPhase53OwnerReviewRecord(input: {
  reviewed?: boolean;
  acceptedNextStep?: boolean;
  notes?: string[];
} = {}): TeoyubePhase53OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_5_3_owner_review",
    reviewed,
    checklist: createPhase53OwnerReviewChecklist(reviewed),
    acceptedNextStep: input.acceptedNextStep ?? reviewed,
    notes: input.notes || [],
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase53OwnerReviewBlockers(record: TeoyubePhase53OwnerReviewRecord): string[] {
  return record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 5.3 owner review must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services."];
}

export function getPhase53OwnerReviewWarnings(record: TeoyubePhase53OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 5.3 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.acceptedNextStep ? ["Phase 5.4 has not been manually accepted yet."] : [])
  ];
}

export function createPhase53OwnerReviewDecision(record: TeoyubePhase53OwnerReviewRecord): TeoyubePhase53OwnerReviewDecision {
  const blockers = getPhase53OwnerReviewBlockers(record);
  if (blockers.length) return "blocked";
  return getPhase53OwnerReviewWarnings(record).length ? "owner_review_pending" : "owner_review_ready";
}

export function validatePhase53OwnerReview(record: TeoyubePhase53OwnerReviewRecord): TeoyubePhase53OwnerReviewReport {
  return createPhase53OwnerReviewReport(record);
}

export function createPhase53OwnerReviewReport(record: TeoyubePhase53OwnerReviewRecord): TeoyubePhase53OwnerReviewReport {
  const blockers = getPhase53OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase53OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase53OwnerReviewWarnings(record),
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
