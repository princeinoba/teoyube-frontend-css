export type TeoyubePhase61OwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: true;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase61OwnerReviewRecord = {
  id: string;
  reviewed: boolean;
  checklist: TeoyubePhase61OwnerReviewChecklistItem[];
  phase62MayProceedToDryRunSimulation: boolean;
  notes: string[];
  noBetaLaunchPerformed: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  createdAt: string;
};

export type TeoyubePhase61OwnerReviewDecision =
  | "owner_review_complete"
  | "owner_review_pending"
  | "blocked";

export type TeoyubePhase61OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase61OwnerReviewDecision;
  record: TeoyubePhase61OwnerReviewRecord;
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

function item(id: string, label: string, details: string, accepted = false): TeoyubePhase61OwnerReviewChecklistItem {
  return { id, label, required: true, accepted, details };
}

export function createPhase61OwnerReviewChecklist(accepted = false): TeoyubePhase61OwnerReviewChecklistItem[] {
  return [
    item("execution_plan_reviewed", "Controlled beta execution plan reviewed", "Owner reviews the controlled manual execution plan.", accepted),
    item("participant_workflow_reviewed", "Participant workflow reviewed", "Owner reviews participant workflow and no-contact boundaries.", accepted),
    item("communication_boundaries_reviewed", "Communication boundaries reviewed", "Owner reviews plain-text drafts and confirms code sends nothing.", accepted),
    item("feedback_boundaries_reviewed", "Feedback boundaries reviewed", "Owner reviews manual feedback, redaction, and no-storage boundaries.", accepted),
    item("issue_intake_reviewed", "Issue intake reviewed", "Owner reviews issue categories and blockers.", accepted),
    item("operations_checklist_reviewed", "Operations checklist reviewed", "Owner reviews pre/during/post, pause, and rollback checklists.", accepted),
    item("safety_theology_reviewed", "Safety/theology boundaries reviewed", "Owner reviews Scripture, explanation, fallback, confidence, and advice boundaries.", accepted),
    item("privacy_consent_reviewed", "Privacy/consent boundaries reviewed", "Owner reviews privacy, consent, sensitive-data, and no-hidden-personalization boundaries.", accepted),
    item("service_disabled_reviewed", "Service-disabled boundaries reviewed", "Owner confirms services remain disabled.", accepted),
    item("execution_package_reviewed", "Execution package reviewed", "Owner reviews the combined Phase 6.1 package.", accepted),
    item("phase_6_2_next_step_accepted_or_blocked", "Next Phase 6 step accepted or blocked", "Owner accepts or blocks Phase 6.2 dry-run simulation planning.", accepted)
  ];
}

export function createPhase61OwnerReviewRecord(input: {
  reviewed?: boolean;
  acceptedAll?: boolean;
  phase62MayProceedToDryRunSimulation?: boolean;
  checklist?: TeoyubePhase61OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase61OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  const acceptedAll = input.acceptedAll ?? reviewed;
  return {
    id: "phase_6_1_owner_review",
    reviewed,
    checklist: input.checklist || createPhase61OwnerReviewChecklist(acceptedAll),
    phase62MayProceedToDryRunSimulation: input.phase62MayProceedToDryRunSimulation ?? reviewed,
    notes: input.notes || [],
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: now()
  };
}

export function getPhase61OwnerReviewBlockers(record: TeoyubePhase61OwnerReviewRecord): string[] {
  return record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : ["Phase 6.1 owner review must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services."];
}

export function getPhase61OwnerReviewWarnings(record: TeoyubePhase61OwnerReviewRecord): string[] {
  return [
    ...(!record.reviewed ? ["Phase 6.1 owner review has not been manually completed."] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => `${entry.label} remains pending.`),
    ...(!record.phase62MayProceedToDryRunSimulation ? ["Phase 6.2 dry-run simulation has not been manually accepted as the next step."] : [])
  ];
}

export function createPhase61OwnerReviewDecision(record: TeoyubePhase61OwnerReviewRecord): TeoyubePhase61OwnerReviewDecision {
  const blockers = getPhase61OwnerReviewBlockers(record);
  if (blockers.length) return "blocked";
  return getPhase61OwnerReviewWarnings(record).length ? "owner_review_pending" : "owner_review_complete";
}

export function validatePhase61OwnerReview(record: TeoyubePhase61OwnerReviewRecord): TeoyubePhase61OwnerReviewReport {
  return createPhase61OwnerReviewReport(record);
}

export function createPhase61OwnerReviewReport(record: TeoyubePhase61OwnerReviewRecord): TeoyubePhase61OwnerReviewReport {
  const blockers = getPhase61OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase61OwnerReviewDecision(record),
    record,
    blockers,
    warnings: getPhase61OwnerReviewWarnings(record),
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

