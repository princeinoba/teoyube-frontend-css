export type TeoyubePhase44OwnerReviewChecklistItem = {
  id: string;
  label: string;
  reviewed: boolean;
  required: boolean;
  notes: string;
};

export type TeoyubePhase44OwnerReviewRecord = {
  id: string;
  checklist: TeoyubePhase44OwnerReviewChecklistItem[];
  nextPhase4StepAccepted: boolean;
  ownerReviewNotes: string[];
  structuredManualApprovalOnly: true;
  noSignatureRequired: true;
  createdAt: string;
};

export type TeoyubePhase44OwnerReviewDecision =
  | "owner_review_ready"
  | "owner_review_ready_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase44OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase44OwnerReviewDecision;
  reviewedCount: number;
  requiredCount: number;
  blockers: string[];
  warnings: string[];
  record: TeoyubePhase44OwnerReviewRecord;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, reviewed = false, notes = ""): TeoyubePhase44OwnerReviewChecklistItem {
  return { id, label, reviewed, required: true, notes };
}

export function createPhase44OwnerReviewChecklist(reviewed = false): TeoyubePhase44OwnerReviewChecklistItem[] {
  return [
    item("reviewed_content_gate_reviewed", "Reviewed content integration gate reviewed", reviewed),
    item("release_candidate_builder_reviewed", "Release candidate builder reviewed", reviewed),
    item("integration_planner_reviewed", "Reviewed content integration planner reviewed", reviewed),
    item("promise_table_ux_reviewed", "Promise Table UX changes reviewed", reviewed),
    item("tig_graph_experience_reviewed", "TIG Graph experience changes reviewed", reviewed),
    item("tig_response_explanation_reviewed", "TIGResponsePanel explanation changes reviewed", reviewed),
    item("reviewed_content_qa_reviewed", "Reviewed content QA reviewed", reviewed),
    item("promise_table_ux_qa_reviewed", "Promise Table UX QA reviewed", reviewed),
    item("tig_graph_qa_reviewed", "TIG Graph QA reviewed", reviewed),
    item("next_phase_4_step_reviewed", "Next Phase 4 step accepted or blocked", reviewed)
  ];
}

export function createPhase44OwnerReviewRecord(input: {
  reviewed?: boolean;
  nextPhase4StepAccepted?: boolean;
  checklist?: TeoyubePhase44OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase44OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_4_4_owner_review_record",
    checklist: input.checklist || createPhase44OwnerReviewChecklist(reviewed),
    nextPhase4StepAccepted: input.nextPhase4StepAccepted ?? reviewed,
    ownerReviewNotes: input.notes || ["Structured manual Phase 4.4 owner review is prepared; no signature or external storage is required."],
    structuredManualApprovalOnly: true,
    noSignatureRequired: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase44OwnerReviewBlockers(record: TeoyubePhase44OwnerReviewRecord): string[] {
  return record.checklist
    .filter((entry) => entry.required && !entry.reviewed)
    .map((entry) => `${entry.label} still needs owner review.`);
}

export function getPhase44OwnerReviewWarnings(record: TeoyubePhase44OwnerReviewRecord): string[] {
  return [
    ...(!record.nextPhase4StepAccepted ? ["Phase 4.5 has not been manually accepted yet."] : []),
    ...record.ownerReviewNotes
  ];
}

export function createPhase44OwnerReviewDecision(record: TeoyubePhase44OwnerReviewRecord): TeoyubePhase44OwnerReviewDecision {
  const blockers = getPhase44OwnerReviewBlockers(record);
  const warnings = getPhase44OwnerReviewWarnings(record);
  if (blockers.length) return "needs_owner_review";
  return warnings.length ? "owner_review_ready_with_warnings" : "owner_review_ready";
}

export function validatePhase44OwnerReview(record: TeoyubePhase44OwnerReviewRecord): TeoyubePhase44OwnerReviewReport {
  return createPhase44OwnerReviewReport(record);
}

export function createPhase44OwnerReviewReport(record: TeoyubePhase44OwnerReviewRecord): TeoyubePhase44OwnerReviewReport {
  const blockers = getPhase44OwnerReviewBlockers(record);
  const warnings = getPhase44OwnerReviewWarnings(record);
  const requiredCount = record.checklist.filter((entry) => entry.required).length;
  const reviewedCount = record.checklist.filter((entry) => entry.required && entry.reviewed).length;

  return {
    valid: blockers.length === 0,
    decision: createPhase44OwnerReviewDecision(record),
    reviewedCount,
    requiredCount,
    blockers,
    warnings,
    record,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
