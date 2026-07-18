export type TeoyubePhase45OwnerReviewChecklistItem = {
  id: string;
  label: string;
  reviewed: boolean;
  required: boolean;
  notes: string;
};

export type TeoyubePhase45OwnerReviewRecord = {
  id: string;
  checklist: TeoyubePhase45OwnerReviewChecklistItem[];
  nextPhase4StepAccepted: boolean;
  ownerReviewNotes: string[];
  structuredManualApprovalOnly: true;
  noSignatureRequired: true;
  createdAt: string;
};

export type TeoyubePhase45OwnerReviewDecision =
  | "owner_review_ready"
  | "owner_review_ready_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase45OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase45OwnerReviewDecision;
  reviewedCount: number;
  requiredCount: number;
  blockers: string[];
  warnings: string[];
  record: TeoyubePhase45OwnerReviewRecord;
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

function item(id: string, label: string, reviewed = false, notes = ""): TeoyubePhase45OwnerReviewChecklistItem {
  return { id, label, reviewed, required: true, notes };
}

export function createPhase45OwnerReviewChecklist(reviewed = false): TeoyubePhase45OwnerReviewChecklistItem[] {
  return [
    item("controlled_admin_prototype_reviewed", "Controlled admin prototype reviewed", reviewed),
    item("admin_workflow_simulator_reviewed", "Admin workflow simulator reviewed", reviewed),
    item("service_readiness_review_reviewed", "Service readiness review reviewed", reviewed),
    item("disabled_service_states_accepted", "Disabled-service states accepted", reviewed),
    item("beta_qa_plan_reviewed", "Beta QA plan reviewed", reviewed),
    item("beta_qa_runbook_reviewed", "Beta QA runbook reviewed", reviewed),
    item("beta_issue_triage_reviewed", "Beta issue triage reviewed", reviewed),
    item("beta_readiness_package_reviewed", "Beta readiness package reviewed", reviewed),
    item("phase_4_5_package_reviewed", "Phase 4.5 package reviewed", reviewed),
    item("next_phase_4_step_reviewed", "Next Phase 4 step accepted or blocked", reviewed)
  ];
}

export function createPhase45OwnerReviewRecord(input: {
  reviewed?: boolean;
  nextPhase4StepAccepted?: boolean;
  checklist?: TeoyubePhase45OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase45OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_4_5_owner_review_record",
    checklist: input.checklist || createPhase45OwnerReviewChecklist(reviewed),
    nextPhase4StepAccepted: input.nextPhase4StepAccepted ?? reviewed,
    ownerReviewNotes: input.notes || ["Structured manual Phase 4.5 owner review is prepared; no signature or external storage is required."],
    structuredManualApprovalOnly: true,
    noSignatureRequired: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase45OwnerReviewBlockers(record: TeoyubePhase45OwnerReviewRecord): string[] {
  return record.checklist
    .filter((entry) => entry.required && !entry.reviewed)
    .map((entry) => `${entry.label} still needs owner review.`);
}

export function getPhase45OwnerReviewWarnings(record: TeoyubePhase45OwnerReviewRecord): string[] {
  return [
    ...(!record.nextPhase4StepAccepted ? ["Phase 4.6 has not been manually accepted yet."] : []),
    ...record.ownerReviewNotes
  ];
}

export function createPhase45OwnerReviewDecision(record: TeoyubePhase45OwnerReviewRecord): TeoyubePhase45OwnerReviewDecision {
  const blockers = getPhase45OwnerReviewBlockers(record);
  const warnings = getPhase45OwnerReviewWarnings(record);
  if (blockers.length) return "needs_owner_review";
  return warnings.length ? "owner_review_ready_with_warnings" : "owner_review_ready";
}

export function validatePhase45OwnerReview(record: TeoyubePhase45OwnerReviewRecord): TeoyubePhase45OwnerReviewReport {
  return createPhase45OwnerReviewReport(record);
}

export function createPhase45OwnerReviewReport(record: TeoyubePhase45OwnerReviewRecord): TeoyubePhase45OwnerReviewReport {
  const blockers = getPhase45OwnerReviewBlockers(record);
  const warnings = getPhase45OwnerReviewWarnings(record);
  const requiredCount = record.checklist.filter((entry) => entry.required).length;
  const reviewedCount = record.checklist.filter((entry) => entry.required && entry.reviewed).length;

  return {
    valid: blockers.length === 0,
    decision: createPhase45OwnerReviewDecision(record),
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
