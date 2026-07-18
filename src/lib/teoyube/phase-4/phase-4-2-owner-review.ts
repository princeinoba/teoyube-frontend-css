export type TeoyubePhase42OwnerReviewChecklistItem = {
  id: string;
  label: string;
  reviewed: boolean;
  required: boolean;
  notes: string;
};

export type TeoyubePhase42OwnerReviewRecord = {
  id: string;
  checklist: TeoyubePhase42OwnerReviewChecklistItem[];
  nextPhase4StepAccepted: boolean;
  ownerReviewNotes: string[];
  structuredManualApprovalOnly: true;
  noSignatureRequired: true;
  createdAt: string;
};

export type TeoyubePhase42OwnerReviewDecision =
  | "owner_review_ready"
  | "owner_review_ready_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase42OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase42OwnerReviewDecision;
  reviewedCount: number;
  requiredCount: number;
  blockers: string[];
  warnings: string[];
  record: TeoyubePhase42OwnerReviewRecord;
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

function item(id: string, label: string, reviewed = false, notes = ""): TeoyubePhase42OwnerReviewChecklistItem {
  return { id, label, reviewed, required: true, notes };
}

export function createPhase42OwnerReviewChecklist(reviewed = false): TeoyubePhase42OwnerReviewChecklistItem[] {
  return [
    item("product_surface_polish_plan_reviewed", "Product surface polish plan reviewed", reviewed),
    item("safe_ui_patches_reviewed", "Safe UI patches reviewed", reviewed),
    item("content_expansion_backlog_reviewed", "Content expansion backlog reviewed", reviewed),
    item("scripture_promise_review_workflow_reviewed", "Scripture/Promise review workflow reviewed", reviewed),
    item("prayer_calling_review_workflow_reviewed", "Prayer/Calling review workflow reviewed", reviewed),
    item("admin_workflow_design_reviewed", "Admin workflow design reviewed", reviewed),
    item("future_service_requirements_reviewed", "Future service requirements reviewed", reviewed),
    item("next_phase_4_step_reviewed", "Next Phase 4 step accepted or blocked", reviewed)
  ];
}

export function createPhase42OwnerReviewRecord(input: {
  reviewed?: boolean;
  nextPhase4StepAccepted?: boolean;
  checklist?: TeoyubePhase42OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase42OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_4_2_owner_review_record",
    checklist: input.checklist || createPhase42OwnerReviewChecklist(reviewed),
    nextPhase4StepAccepted: input.nextPhase4StepAccepted ?? reviewed,
    ownerReviewNotes: input.notes || ["Structured manual Phase 4.2 owner review is prepared; no signature or external storage is required."],
    structuredManualApprovalOnly: true,
    noSignatureRequired: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase42OwnerReviewBlockers(record: TeoyubePhase42OwnerReviewRecord): string[] {
  return record.checklist
    .filter((entry) => entry.required && !entry.reviewed)
    .map((entry) => `${entry.label} still needs owner review.`);
}

export function getPhase42OwnerReviewWarnings(record: TeoyubePhase42OwnerReviewRecord): string[] {
  return [
    ...(!record.nextPhase4StepAccepted ? ["Phase 4.3 has not been manually accepted yet."] : []),
    ...record.ownerReviewNotes
  ];
}

export function createPhase42OwnerReviewDecision(record: TeoyubePhase42OwnerReviewRecord): TeoyubePhase42OwnerReviewDecision {
  const blockers = getPhase42OwnerReviewBlockers(record);
  const warnings = getPhase42OwnerReviewWarnings(record);
  if (blockers.length) return "needs_owner_review";
  return warnings.length ? "owner_review_ready_with_warnings" : "owner_review_ready";
}

export function validatePhase42OwnerReview(record: TeoyubePhase42OwnerReviewRecord): TeoyubePhase42OwnerReviewReport {
  return createPhase42OwnerReviewReport(record);
}

export function createPhase42OwnerReviewReport(record: TeoyubePhase42OwnerReviewRecord): TeoyubePhase42OwnerReviewReport {
  const blockers = getPhase42OwnerReviewBlockers(record);
  const warnings = getPhase42OwnerReviewWarnings(record);
  const requiredCount = record.checklist.filter((entry) => entry.required).length;
  const reviewedCount = record.checklist.filter((entry) => entry.required && entry.reviewed).length;

  return {
    valid: blockers.length === 0,
    decision: createPhase42OwnerReviewDecision(record),
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
