export type TeoyubePhase4OwnerCompletionReviewChecklistItem = {
  id: string;
  label: string;
  reviewed: boolean;
  required: boolean;
  notes: string;
};

export type TeoyubePhase4OwnerCompletionReviewRecord = {
  id: string;
  checklist: TeoyubePhase4OwnerCompletionReviewChecklistItem[];
  phase5RoadmapAccepted: boolean;
  ownerReviewNotes: string[];
  structuredManualApprovalOnly: true;
  noSignatureRequired: true;
  createdAt: string;
};

export type TeoyubePhase4OwnerCompletionReviewDecision =
  | "owner_completion_review_ready"
  | "owner_completion_review_ready_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase4OwnerCompletionReviewReport = {
  valid: boolean;
  decision: TeoyubePhase4OwnerCompletionReviewDecision;
  reviewedCount: number;
  requiredCount: number;
  blockers: string[];
  warnings: string[];
  record: TeoyubePhase4OwnerCompletionReviewRecord;
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

function item(id: string, label: string, reviewed = false, notes = ""): TeoyubePhase4OwnerCompletionReviewChecklistItem {
  return { id, label, reviewed, required: true, notes };
}

export function createPhase4OwnerCompletionReviewChecklist(reviewed = false): TeoyubePhase4OwnerCompletionReviewChecklistItem[] {
  return [
    item("beta_readiness_review_reviewed", "Beta readiness review reviewed", reviewed),
    item("service_decision_lock_reviewed", "Service decision lock reviewed", reviewed),
    item("disabled_service_enforcement_reviewed", "Disabled service enforcement reviewed", reviewed),
    item("admin_prototype_boundaries_reviewed", "Admin prototype boundaries reviewed", reviewed),
    item("reviewed_content_gate_reviewed", "Reviewed content gate reviewed", reviewed),
    item("promise_table_ux_reviewed", "Promise Table UX reviewed", reviewed),
    item("tig_graph_ux_reviewed", "TIG Graph UX reviewed", reviewed),
    item("beta_qa_plan_reviewed", "Beta QA plan reviewed", reviewed),
    item("remaining_risks_reviewed", "Remaining risks reviewed", reviewed),
    item("phase_5_roadmap_reviewed", "Phase 5 roadmap accepted or blocked", reviewed)
  ];
}

export function createPhase4OwnerCompletionReviewRecord(input: {
  reviewed?: boolean;
  phase5RoadmapAccepted?: boolean;
  checklist?: TeoyubePhase4OwnerCompletionReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase4OwnerCompletionReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_4_owner_completion_review_record",
    checklist: input.checklist || createPhase4OwnerCompletionReviewChecklist(reviewed),
    phase5RoadmapAccepted: input.phase5RoadmapAccepted ?? reviewed,
    ownerReviewNotes: input.notes || ["Structured manual Phase 4 completion owner review is prepared; no signature or external storage is required."],
    structuredManualApprovalOnly: true,
    noSignatureRequired: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase4OwnerCompletionReviewBlockers(record: TeoyubePhase4OwnerCompletionReviewRecord): string[] {
  return record.checklist
    .filter((entry) => entry.required && !entry.reviewed)
    .map((entry) => `${entry.label} still needs owner review.`);
}

export function getPhase4OwnerCompletionReviewWarnings(record: TeoyubePhase4OwnerCompletionReviewRecord): string[] {
  return [
    ...(!record.phase5RoadmapAccepted ? ["Phase 5 roadmap has not been manually accepted yet."] : []),
    ...record.ownerReviewNotes
  ];
}

export function createPhase4OwnerCompletionReviewDecision(
  record: TeoyubePhase4OwnerCompletionReviewRecord
): TeoyubePhase4OwnerCompletionReviewDecision {
  const blockers = getPhase4OwnerCompletionReviewBlockers(record);
  const warnings = getPhase4OwnerCompletionReviewWarnings(record);
  if (blockers.length) return "needs_owner_review";
  return warnings.length ? "owner_completion_review_ready_with_warnings" : "owner_completion_review_ready";
}

export function validatePhase4OwnerCompletionReview(record: TeoyubePhase4OwnerCompletionReviewRecord): TeoyubePhase4OwnerCompletionReviewReport {
  return createPhase4OwnerCompletionReviewReport(record);
}

export function createPhase4OwnerCompletionReviewReport(record: TeoyubePhase4OwnerCompletionReviewRecord): TeoyubePhase4OwnerCompletionReviewReport {
  const blockers = getPhase4OwnerCompletionReviewBlockers(record);
  const warnings = getPhase4OwnerCompletionReviewWarnings(record);
  const requiredCount = record.checklist.filter((entry) => entry.required).length;
  const reviewedCount = record.checklist.filter((entry) => entry.required && entry.reviewed).length;

  return {
    valid: blockers.length === 0,
    decision: createPhase4OwnerCompletionReviewDecision(record),
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
