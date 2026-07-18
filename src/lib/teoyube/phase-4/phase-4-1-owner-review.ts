export type TeoyubePhase41OwnerReviewChecklistItem = {
  id: string;
  label: string;
  reviewed: boolean;
  required: boolean;
  notes: string;
};

export type TeoyubePhase41OwnerReviewRecord = {
  id: string;
  checklist: TeoyubePhase41OwnerReviewChecklistItem[];
  nextPhase4StepAccepted: boolean;
  ownerReviewNotes: string[];
  structuredManualApprovalOnly: true;
  noSignatureRequired: true;
  createdAt: string;
};

export type TeoyubePhase41OwnerReviewDecision =
  | "owner_review_ready"
  | "owner_review_ready_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase41OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase41OwnerReviewDecision;
  reviewedCount: number;
  requiredCount: number;
  blockers: string[];
  warnings: string[];
  record: TeoyubePhase41OwnerReviewRecord;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, reviewed = false, notes = ""): TeoyubePhase41OwnerReviewChecklistItem {
  return { id, label, reviewed, required: true, notes };
}

export function createPhase41OwnerReviewChecklist(reviewed = false): TeoyubePhase41OwnerReviewChecklistItem[] {
  return [
    item("product_experience_audit_reviewed", "Product experience audit reviewed", reviewed),
    item("content_depth_map_reviewed", "Content depth map reviewed", reviewed),
    item("scripture_promise_coverage_reviewed", "Scripture/Promise coverage reviewed", reviewed),
    item("product_surface_depth_reviewed", "Product surface depth reviewed", reviewed),
    item("phase_4_backlog_reviewed", "Phase 4 backlog reviewed", reviewed),
    item("controlled_service_decision_plan_reviewed", "Controlled service decision plan reviewed", reviewed),
    item("risk_register_reviewed", "Phase 4 risk register reviewed", reviewed),
    item("next_phase_4_step_reviewed", "Next Phase 4 step accepted or blocked", reviewed)
  ];
}

export function createPhase41OwnerReviewRecord(input: {
  reviewed?: boolean;
  nextPhase4StepAccepted?: boolean;
  checklist?: TeoyubePhase41OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase41OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_4_1_owner_review_record",
    checklist: input.checklist || createPhase41OwnerReviewChecklist(reviewed),
    nextPhase4StepAccepted: input.nextPhase4StepAccepted ?? reviewed,
    ownerReviewNotes: input.notes || ["Structured manual Phase 4.1 owner review is prepared; no signature or external storage is required."],
    structuredManualApprovalOnly: true,
    noSignatureRequired: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase41OwnerReviewBlockers(record: TeoyubePhase41OwnerReviewRecord): string[] {
  return record.checklist
    .filter((entry) => entry.required && !entry.reviewed)
    .map((entry) => `${entry.label} still needs owner review.`);
}

export function getPhase41OwnerReviewWarnings(record: TeoyubePhase41OwnerReviewRecord): string[] {
  return [
    ...(!record.nextPhase4StepAccepted ? ["Phase 4.2 has not been manually accepted yet."] : []),
    ...record.ownerReviewNotes
  ];
}

export function createPhase41OwnerReviewDecision(record: TeoyubePhase41OwnerReviewRecord): TeoyubePhase41OwnerReviewDecision {
  const blockers = getPhase41OwnerReviewBlockers(record);
  const warnings = getPhase41OwnerReviewWarnings(record);
  if (blockers.length) return "needs_owner_review";
  return warnings.length ? "owner_review_ready_with_warnings" : "owner_review_ready";
}

export function validatePhase41OwnerReview(record: TeoyubePhase41OwnerReviewRecord): TeoyubePhase41OwnerReviewReport {
  return createPhase41OwnerReviewReport(record);
}

export function createPhase41OwnerReviewReport(record: TeoyubePhase41OwnerReviewRecord): TeoyubePhase41OwnerReviewReport {
  const blockers = getPhase41OwnerReviewBlockers(record);
  const warnings = getPhase41OwnerReviewWarnings(record);
  const requiredCount = record.checklist.filter((entry) => entry.required).length;
  const reviewedCount = record.checklist.filter((entry) => entry.required && entry.reviewed).length;

  return {
    valid: blockers.length === 0,
    decision: createPhase41OwnerReviewDecision(record),
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
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
