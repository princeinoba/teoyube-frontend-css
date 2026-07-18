export type TeoyubePhase93OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase93OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase93OwnerReviewChecklistItem[];
  nextPhaseAccepted: boolean;
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

export type TeoyubePhase93OwnerReviewDecision =
  | "phase_9_3_owner_approved"
  | "phase_9_3_owner_approved_with_warnings"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase93OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase93OwnerReviewDecision;
  record: TeoyubePhase93OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase93OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase93OwnerReviewChecklist(accepted = false): TeoyubePhase93OwnerReviewChecklistItem[] {
  return [
    item("release_candidate_fix_queue_reviewed", "Release candidate fix queue reviewed", "Owner reviews fix queue items, priorities, blockers, and warnings.", accepted),
    item("public_issue_to_fix_conversion_reviewed", "Public issue-to-fix conversion reviewed", "Owner reviews conversion from public issues into fix items.", accepted),
    item("remediation_plan_reviewed", "Remediation plan reviewed", "Owner reviews safe, owner-review, blocked, and deferred remediation items.", accepted),
    item("remediation_safety_validator_reviewed", "Remediation safety validator reviewed", "Owner reviews safety validation and blocked unsafe remediation risks.", accepted),
    item("actual_safe_patches_reviewed", "Actual safe patches reviewed", "Owner reviews safe patch summary, if any.", accepted),
    item("blocked_deferred_fixes_reviewed", "Blocked/deferred fixes reviewed", "Owner reviews blocked and deferred fixes.", accepted),
    item("final_regression_qa_reviewed", "Final regression QA reviewed", "Owner reviews final regression QA.", accepted),
    item("service_disabled_regression_reviewed", "Service-disabled regression reviewed", "Owner confirms disabled services remain disabled.", accepted),
    item("public_safety_regression_reviewed", "Public safety regression reviewed", "Owner reviews Scripture, explanation, fallback, confidence, content gate, no-divine-certainty, and no-advice boundaries.", accepted),
    item("privacy_consent_regression_reviewed", "Privacy/consent regression reviewed", "Owner reviews privacy, consent, sensitive data, no-storage, and manual feedback/support boundaries.", accepted),
    item("mobile_accessibility_regression_reviewed", "Mobile/accessibility regression reviewed", "Owner reviews mobile/accessibility regression.", accepted),
    item("public_go_no_go_score_reviewed", "Public go/no-go readiness score reviewed", "Owner reviews public go/no-go score and band.", accepted),
    item("remediation_package_reviewed", "Release candidate remediation package reviewed", "Owner reviews combined Phase 9.3 package.", accepted),
    item("phase_9_4_acceptance_reviewed", "Next Phase 9 step accepted or blocked", "Owner accepts or blocks Phase 9.4 controlled public go/no-go and operational handoff.", accepted)
  ];
}

export function createPhase93OwnerReviewRecord(input: {
  reviewed?: boolean;
  checklist?: TeoyubePhase93OwnerReviewChecklistItem[];
  nextPhaseAccepted?: boolean;
  notes?: string[];
} = {}): TeoyubePhase93OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_9_3_owner_review",
    reviewed,
    checklist: input.checklist || createPhase93OwnerReviewChecklist(reviewed),
    nextPhaseAccepted: input.nextPhaseAccepted ?? reviewed,
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

export function getPhase93OwnerReviewBlockers(record: TeoyubePhase93OwnerReviewRecord): string[] {
  return record.noPublicLaunchPerformed && record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noPublicUrlsFetchedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 9.3 owner review must remain manual and must not launch, contact users, collect feedback automatically, fetch public URLs, or require external services."];
}

export function getPhase93OwnerReviewWarnings(record: TeoyubePhase93OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 9.3 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.nextPhaseAccepted ? ["Phase 9.4 has not been accepted by owner review."] : [])
  ];
}

export function createPhase93OwnerReviewDecision(record: TeoyubePhase93OwnerReviewRecord): TeoyubePhase93OwnerReviewDecision {
  const blockers = getPhase93OwnerReviewBlockers(record);
  const warnings = getPhase93OwnerReviewWarnings(record);
  if (blockers.length) return "blocked";
  if (!record.reviewed || !record.nextPhaseAccepted) return "owner_review_pending";
  return warnings.length ? "phase_9_3_owner_approved_with_warnings" : "phase_9_3_owner_approved";
}

export function validatePhase93OwnerReview(record: TeoyubePhase93OwnerReviewRecord): TeoyubePhase93OwnerReviewReport {
  return createPhase93OwnerReviewReport(record);
}

export function createPhase93OwnerReviewReport(record: TeoyubePhase93OwnerReviewRecord): TeoyubePhase93OwnerReviewReport {
  const blockers = getPhase93OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase93OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase93OwnerReviewWarnings(record),
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
