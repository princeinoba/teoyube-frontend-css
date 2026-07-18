export type TeoyubePhase43OwnerReviewChecklistItem = {
  id: string;
  label: string;
  reviewed: boolean;
  required: boolean;
  notes: string;
};

export type TeoyubePhase43OwnerReviewRecord = {
  id: string;
  checklist: TeoyubePhase43OwnerReviewChecklistItem[];
  nextPhase4StepAccepted: boolean;
  ownerReviewNotes: string[];
  structuredManualApprovalOnly: true;
  noSignatureRequired: true;
  createdAt: string;
};

export type TeoyubePhase43OwnerReviewDecision =
  | "owner_review_ready"
  | "owner_review_ready_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase43OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase43OwnerReviewDecision;
  reviewedCount: number;
  requiredCount: number;
  blockers: string[];
  warnings: string[];
  record: TeoyubePhase43OwnerReviewRecord;
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

function item(id: string, label: string, reviewed = false, notes = ""): TeoyubePhase43OwnerReviewChecklistItem {
  return { id, label, reviewed, required: true, notes };
}

export function createPhase43OwnerReviewChecklist(reviewed = false): TeoyubePhase43OwnerReviewChecklistItem[] {
  return [
    item("content_review_queue_reviewed", "Content review queue reviewed", reviewed),
    item("backlog_to_queue_conversion_reviewed", "Backlog-to-review-queue conversion reviewed", reviewed),
    item("promise_cluster_expansion_drafts_reviewed", "Promise Cluster expansion drafts reviewed", reviewed),
    item("scripture_anchor_draft_review_process_reviewed", "Scripture anchor draft review process reviewed", reviewed),
    item("prayer_calling_action_review_process_reviewed", "Prayer/Calling/Action draft review process reviewed", reviewed),
    item("tig_relationship_review_process_reviewed", "TIG relationship draft review process reviewed", reviewed),
    item("content_draft_safety_validator_reviewed", "Content draft safety validator reviewed", reviewed),
    item("surface_ux_refinements_reviewed", "Surface UX refinements reviewed", reviewed),
    item("safe_patches_reviewed", "Safe patches reviewed", reviewed),
    item("next_phase_4_step_reviewed", "Next Phase 4 step accepted or blocked", reviewed)
  ];
}

export function createPhase43OwnerReviewRecord(input: {
  reviewed?: boolean;
  nextPhase4StepAccepted?: boolean;
  checklist?: TeoyubePhase43OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase43OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_4_3_owner_review_record",
    checklist: input.checklist || createPhase43OwnerReviewChecklist(reviewed),
    nextPhase4StepAccepted: input.nextPhase4StepAccepted ?? reviewed,
    ownerReviewNotes: input.notes || ["Structured manual Phase 4.3 owner review is prepared; no signature or external storage is required."],
    structuredManualApprovalOnly: true,
    noSignatureRequired: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase43OwnerReviewBlockers(record: TeoyubePhase43OwnerReviewRecord): string[] {
  return record.checklist
    .filter((entry) => entry.required && !entry.reviewed)
    .map((entry) => `${entry.label} still needs owner review.`);
}

export function getPhase43OwnerReviewWarnings(record: TeoyubePhase43OwnerReviewRecord): string[] {
  return [
    ...(!record.nextPhase4StepAccepted ? ["Phase 4.4 has not been manually accepted yet."] : []),
    ...record.ownerReviewNotes
  ];
}

export function createPhase43OwnerReviewDecision(record: TeoyubePhase43OwnerReviewRecord): TeoyubePhase43OwnerReviewDecision {
  const blockers = getPhase43OwnerReviewBlockers(record);
  const warnings = getPhase43OwnerReviewWarnings(record);
  if (blockers.length) return "needs_owner_review";
  return warnings.length ? "owner_review_ready_with_warnings" : "owner_review_ready";
}

export function validatePhase43OwnerReview(record: TeoyubePhase43OwnerReviewRecord): TeoyubePhase43OwnerReviewReport {
  return createPhase43OwnerReviewReport(record);
}

export function createPhase43OwnerReviewReport(record: TeoyubePhase43OwnerReviewRecord): TeoyubePhase43OwnerReviewReport {
  const blockers = getPhase43OwnerReviewBlockers(record);
  const warnings = getPhase43OwnerReviewWarnings(record);
  const requiredCount = record.checklist.filter((entry) => entry.required).length;
  const reviewedCount = record.checklist.filter((entry) => entry.required && entry.reviewed).length;

  return {
    valid: blockers.length === 0,
    decision: createPhase43OwnerReviewDecision(record),
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
