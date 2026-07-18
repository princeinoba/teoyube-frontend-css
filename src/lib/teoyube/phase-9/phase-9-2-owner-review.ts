export type TeoyubePhase92OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase92OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase92OwnerReviewChecklistItem[];
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

export type TeoyubePhase92OwnerReviewDecision =
  | "phase_9_2_owner_approved"
  | "phase_9_2_owner_approved_with_warnings"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase92OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase92OwnerReviewDecision;
  record: TeoyubePhase92OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase92OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase92OwnerReviewChecklist(accepted = false): TeoyubePhase92OwnerReviewChecklistItem[] {
  return [
    item("public_release_candidate_qa_reviewed", "Public release candidate QA reviewed", "Owner reviews public release candidate QA scenarios and runner.", accepted),
    item("manual_monitoring_plan_reviewed", "Manual monitoring plan reviewed", "Owner reviews manual public monitoring plan.", accepted),
    item("public_support_readiness_reviewed", "Public support readiness reviewed", "Owner reviews manual support boundaries and recommended responses.", accepted),
    item("public_issue_triage_reviewed", "Public issue triage reviewed", "Owner reviews public issue triage and blocking categories.", accepted),
    item("public_feedback_readiness_reviewed", "Public feedback readiness reviewed", "Owner reviews manual feedback readiness and no automatic collection.", accepted),
    item("safety_qa_reviewed", "Safety QA reviewed", "Owner reviews Scripture, explanation, fallback, confidence, gate, no-divine-certainty, and no-advice checks.", accepted),
    item("service_disabled_qa_reviewed", "Service-disabled QA reviewed", "Owner confirms disabled service checks remain locked.", accepted),
    item("mobile_accessibility_qa_reviewed", "Mobile/accessibility QA reviewed", "Owner reviews mobile and accessibility QA.", accepted),
    item("readiness_score_reviewed", "Readiness score reviewed", "Owner reviews release candidate readiness score and band.", accepted),
    item("public_release_candidate_qa_package_reviewed", "Public release candidate QA package reviewed", "Owner reviews the combined Phase 9.2 package.", accepted),
    item("phase_9_3_acceptance_reviewed", "Next Phase 9 step accepted or blocked", "Owner accepts or blocks Phase 9.3 release candidate fix queue and final regression QA.", accepted)
  ];
}

export function createPhase92OwnerReviewRecord(input: {
  reviewed?: boolean;
  checklist?: TeoyubePhase92OwnerReviewChecklistItem[];
  nextPhaseAccepted?: boolean;
  notes?: string[];
} = {}): TeoyubePhase92OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_9_2_owner_review",
    reviewed,
    checklist: input.checklist || createPhase92OwnerReviewChecklist(reviewed),
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

export function getPhase92OwnerReviewBlockers(record: TeoyubePhase92OwnerReviewRecord): string[] {
  return record.noPublicLaunchPerformed && record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noPublicUrlsFetchedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 9.2 owner review must remain manual and must not launch, contact users, collect feedback automatically, fetch public URLs, or require external services."];
}

export function getPhase92OwnerReviewWarnings(record: TeoyubePhase92OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 9.2 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.nextPhaseAccepted ? ["Phase 9.3 has not been accepted by owner review."] : [])
  ];
}

export function createPhase92OwnerReviewDecision(record: TeoyubePhase92OwnerReviewRecord): TeoyubePhase92OwnerReviewDecision {
  const blockers = getPhase92OwnerReviewBlockers(record);
  const warnings = getPhase92OwnerReviewWarnings(record);
  if (blockers.length) return "blocked";
  if (!record.reviewed || !record.nextPhaseAccepted) return "owner_review_pending";
  return warnings.length ? "phase_9_2_owner_approved_with_warnings" : "phase_9_2_owner_approved";
}

export function validatePhase92OwnerReview(record: TeoyubePhase92OwnerReviewRecord): TeoyubePhase92OwnerReviewReport {
  return createPhase92OwnerReviewReport(record);
}

export function createPhase92OwnerReviewReport(record: TeoyubePhase92OwnerReviewRecord): TeoyubePhase92OwnerReviewReport {
  const blockers = getPhase92OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase92OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase92OwnerReviewWarnings(record),
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
