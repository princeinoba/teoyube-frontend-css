export type TeoyubePhase51OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase51OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase51OwnerReviewChecklistItem[];
  acceptedNextStep: boolean;
  notes: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase51OwnerReviewDecision =
  | "owner_review_ready"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase51OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase51OwnerReviewDecision;
  record: TeoyubePhase51OwnerReviewRecord;
  blockers: string[];
  warnings: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase51OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase51OwnerReviewChecklist(accepted = false): TeoyubePhase51OwnerReviewChecklistItem[] {
  return [
    item("controlled_beta_scope", "Controlled beta scope reviewed", "Owner reviews limited scope and participant boundaries.", accepted),
    item("manual_qa_execution_plan", "Manual QA execution plan reviewed", "Owner reviews scenarios, exit, pause, and rollback criteria.", accepted),
    item("service_gate_review", "Service gate review reviewed", "Owner accepts services remain disabled or plan-only.", accepted),
    item("privacy_security_readiness", "Privacy/security readiness reviewed", "Owner reviews sensitive-data and consent boundaries.", accepted),
    item("issue_intake_plan", "Issue intake plan reviewed", "Owner reviews manual triage and escalation rules.", accepted),
    item("feedback_readiness_plan", "Feedback readiness plan reviewed", "Owner reviews manual feedback and redaction boundaries.", accepted),
    item("operational_readiness", "Operational readiness reviewed", "Owner reviews beta pause, rollback, documentation, and support boundaries.", accepted),
    item("disabled_service_decisions", "Disabled service decisions accepted", "Owner accepts no database, analytics, monitoring provider, live AI, admin auth, CMS, email, or user accounts are connected.", accepted),
    item("next_phase_5_step", "Next Phase 5 step accepted or blocked", "Owner accepts or blocks Phase 5.2 manual beta QA execution.", accepted)
  ];
}

export function createPhase51OwnerReviewRecord(input: {
  reviewed?: boolean;
  acceptedNextStep?: boolean;
  notes?: string[];
} = {}): TeoyubePhase51OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_5_1_owner_review",
    reviewed,
    checklist: createPhase51OwnerReviewChecklist(reviewed),
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

export function getPhase51OwnerReviewBlockers(record: TeoyubePhase51OwnerReviewRecord): string[] {
  return record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.inMemoryOnly
    ? []
    : ["Owner review record must remain preparation-only and in-memory."];
}

export function getPhase51OwnerReviewWarnings(record: TeoyubePhase51OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 5.1 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.acceptedNextStep ? ["Phase 5.2 has not been manually accepted yet."] : [])
  ];
}

export function createPhase51OwnerReviewDecision(record: TeoyubePhase51OwnerReviewRecord): TeoyubePhase51OwnerReviewDecision {
  const blockers = getPhase51OwnerReviewBlockers(record);
  if (blockers.length) return "blocked";
  return getPhase51OwnerReviewWarnings(record).length ? "owner_review_pending" : "owner_review_ready";
}

export function validatePhase51OwnerReview(record: TeoyubePhase51OwnerReviewRecord): TeoyubePhase51OwnerReviewReport {
  return createPhase51OwnerReviewReport(record);
}

export function createPhase51OwnerReviewReport(record: TeoyubePhase51OwnerReviewRecord): TeoyubePhase51OwnerReviewReport {
  const blockers = getPhase51OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase51OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase51OwnerReviewWarnings(record),
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
