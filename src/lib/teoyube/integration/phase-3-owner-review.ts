export type TeoyubePhase3OwnerReviewChecklistItem = {
  id: string;
  label: string;
  reviewed: boolean;
  required: boolean;
  notes: string;
};

export type TeoyubePhase3OwnerReviewRecord = {
  id: string;
  checklist: TeoyubePhase3OwnerReviewChecklistItem[];
  phase4RoadmapAccepted: boolean;
  ownerReviewNotes: string[];
  structuredManualApprovalOnly: true;
  noSignatureRequired: true;
  createdAt: string;
};

export type TeoyubePhase3OwnerReviewDecision =
  | "owner_review_ready"
  | "owner_review_ready_with_warnings"
  | "needs_owner_review"
  | "blocked";

export type TeoyubePhase3OwnerReviewReport = {
  valid: boolean;
  decision: TeoyubePhase3OwnerReviewDecision;
  reviewedCount: number;
  requiredCount: number;
  blockers: string[];
  warnings: string[];
  record: TeoyubePhase3OwnerReviewRecord;
  noExternalServicesRequired: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noLiveAiOrchestrationEnabled: true;
  noBrowserPersistenceRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function item(id: string, label: string, reviewed = false, notes = ""): TeoyubePhase3OwnerReviewChecklistItem {
  return { id, label, reviewed, required: true, notes };
}

export function createPhase3OwnerReviewChecklist(reviewed = false): TeoyubePhase3OwnerReviewChecklistItem[] {
  return [
    item("data_integration_reviewed", "Data integration reviewed", reviewed),
    item("theology_framework_reviewed", "Theology Framework reviewed", reviewed),
    item("promise_engine_reviewed", "Promise Engine reviewed", reviewed),
    item("calling_engine_reviewed", "Calling Engine reviewed", reviewed),
    item("teoyube_language_engine_reviewed", "Teoyube Language Engine reviewed", reviewed),
    item("promise_table_reviewed", "Promise Table reviewed", reviewed),
    item("tig_recommendation_flow_reviewed", "TIG recommendation flow reviewed", reviewed),
    item("explanation_trace_reviewed", "Explanation trace reviewed", reviewed),
    item("fallback_safety_reviewed", "Fallback safety reviewed", reviewed),
    item("ui_adapter_layer_reviewed", "UI adapter layer reviewed", reviewed),
    item("live_ui_connections_reviewed", "Live UI connections reviewed", reviewed),
    item("user_journey_reviewed", "User journey reviewed", reviewed),
    item("real_user_journey_qa_reviewed", "Real user journey QA reviewed", reviewed),
    item("accessibility_mobile_qa_reviewed", "Accessibility/mobile QA reviewed", reviewed),
    item("remaining_risks_reviewed", "Remaining risks reviewed", reviewed),
    item("phase_4_roadmap_accepted", "Phase 4 roadmap accepted or blocked", reviewed)
  ];
}

export function createPhase3OwnerReviewRecord(input: {
  reviewed?: boolean;
  phase4RoadmapAccepted?: boolean;
  checklist?: TeoyubePhase3OwnerReviewChecklistItem[];
  notes?: string[];
} = {}): TeoyubePhase3OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_3_owner_review_record",
    checklist: input.checklist || createPhase3OwnerReviewChecklist(reviewed),
    phase4RoadmapAccepted: input.phase4RoadmapAccepted ?? reviewed,
    ownerReviewNotes: input.notes || [
      "Structured manual owner review is prepared; no signature or external storage is required."
    ],
    structuredManualApprovalOnly: true,
    noSignatureRequired: true,
    createdAt: new Date().toISOString()
  };
}

export function getPhase3OwnerReviewBlockers(record: TeoyubePhase3OwnerReviewRecord): string[] {
  return record.checklist
    .filter((entry) => entry.required && entry.reviewed === false)
    .map((entry) => `${entry.label} still needs owner review.`);
}

export function getPhase3OwnerReviewWarnings(record: TeoyubePhase3OwnerReviewRecord): string[] {
  return [
    ...(!record.phase4RoadmapAccepted ? ["Phase 4 roadmap has not been manually accepted yet."] : []),
    ...record.ownerReviewNotes
  ];
}

export function createPhase3OwnerReviewDecision(record: TeoyubePhase3OwnerReviewRecord): TeoyubePhase3OwnerReviewDecision {
  const blockers = getPhase3OwnerReviewBlockers(record);
  const warnings = getPhase3OwnerReviewWarnings(record);
  if (blockers.length) return "needs_owner_review";
  return warnings.length ? "owner_review_ready_with_warnings" : "owner_review_ready";
}

export function validatePhase3OwnerReview(record: TeoyubePhase3OwnerReviewRecord): TeoyubePhase3OwnerReviewReport {
  return createPhase3OwnerReviewReport(record);
}

export function createPhase3OwnerReviewReport(record: TeoyubePhase3OwnerReviewRecord): TeoyubePhase3OwnerReviewReport {
  const blockers = getPhase3OwnerReviewBlockers(record);
  const warnings = getPhase3OwnerReviewWarnings(record);
  const requiredCount = record.checklist.filter((entry) => entry.required).length;
  const reviewedCount = record.checklist.filter((entry) => entry.required && entry.reviewed).length;

  return {
    valid: blockers.length === 0,
    decision: createPhase3OwnerReviewDecision(record),
    reviewedCount,
    requiredCount,
    blockers,
    warnings,
    record,
    noExternalServicesRequired: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noBrowserPersistenceRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
