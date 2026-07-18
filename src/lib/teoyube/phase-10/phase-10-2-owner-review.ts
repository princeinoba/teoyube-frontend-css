export type TeoyubePhase102OwnerReviewRecord = {
  reviewed: boolean;
  realAppVerificationReviewed: boolean;
  routeQaReviewed: boolean;
  dataLoadingVerificationReviewed: boolean;
  componentRenderingVerificationReviewed: boolean;
  commandResultsReviewed: boolean;
  safePatchesReviewed: boolean;
  remainingBlockersReviewed: boolean;
  nextPhase10StepAccepted: boolean;
  notes: string[];
  reviewedAt: string;
};

export function createPhase102OwnerReviewChecklist(accepted = false) {
  return [
    { id: "real_app_verification", label: "Real app verification reviewed", accepted },
    { id: "route_qa", label: "Route QA reviewed", accepted },
    { id: "data_loading", label: "Data loading verification reviewed", accepted },
    { id: "component_rendering", label: "Component rendering verification reviewed", accepted },
    { id: "command_results", label: "Build/typecheck/lint/test results reviewed", accepted },
    { id: "safe_patches", label: "Safe patches reviewed", accepted },
    { id: "remaining_blockers", label: "Remaining blockers reviewed", accepted },
    { id: "next_phase", label: "Next Phase 10 step accepted or blocked", accepted }
  ];
}

export function createPhase102OwnerReviewRecord(input: Partial<TeoyubePhase102OwnerReviewRecord> = {}): TeoyubePhase102OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    reviewed,
    realAppVerificationReviewed: input.realAppVerificationReviewed ?? reviewed,
    routeQaReviewed: input.routeQaReviewed ?? reviewed,
    dataLoadingVerificationReviewed: input.dataLoadingVerificationReviewed ?? reviewed,
    componentRenderingVerificationReviewed: input.componentRenderingVerificationReviewed ?? reviewed,
    commandResultsReviewed: input.commandResultsReviewed ?? reviewed,
    safePatchesReviewed: input.safePatchesReviewed ?? reviewed,
    remainingBlockersReviewed: input.remainingBlockersReviewed ?? reviewed,
    nextPhase10StepAccepted: input.nextPhase10StepAccepted ?? false,
    notes: input.notes || [],
    reviewedAt: input.reviewedAt || new Date().toISOString()
  };
}

export function getPhase102OwnerReviewBlockers(record: TeoyubePhase102OwnerReviewRecord): string[] {
  return Object.entries({
    reviewed: record.reviewed,
    realAppVerificationReviewed: record.realAppVerificationReviewed,
    routeQaReviewed: record.routeQaReviewed,
    dataLoadingVerificationReviewed: record.dataLoadingVerificationReviewed,
    componentRenderingVerificationReviewed: record.componentRenderingVerificationReviewed,
    commandResultsReviewed: record.commandResultsReviewed,
    safePatchesReviewed: record.safePatchesReviewed,
    remainingBlockersReviewed: record.remainingBlockersReviewed
  }).filter(([, value]) => !value).map(([key]) => `${key} requires owner review.`);
}

export function getPhase102OwnerReviewWarnings(record: TeoyubePhase102OwnerReviewRecord): string[] {
  const warnings = record.notes.length ? [...record.notes] : [];
  if (!record.nextPhase10StepAccepted) warnings.push("Phase 10.3 should not start until build/runtime blockers are fixed.");
  return warnings;
}

export function createPhase102OwnerReviewDecision(record: TeoyubePhase102OwnerReviewRecord): "owner_review_complete" | "needs_owner_review" | "blocked_before_phase_10_3" {
  if (getPhase102OwnerReviewBlockers(record).length) return "needs_owner_review";
  return record.nextPhase10StepAccepted ? "owner_review_complete" : "blocked_before_phase_10_3";
}

export function validatePhase102OwnerReview(record: TeoyubePhase102OwnerReviewRecord): boolean {
  return getPhase102OwnerReviewBlockers(record).length === 0;
}

export function createPhase102OwnerReviewReport(record: TeoyubePhase102OwnerReviewRecord) {
  return {
    valid: validatePhase102OwnerReview(record),
    decision: createPhase102OwnerReviewDecision(record),
    checklist: createPhase102OwnerReviewChecklist(validatePhase102OwnerReview(record)),
    record,
    blockers: getPhase102OwnerReviewBlockers(record),
    warnings: getPhase102OwnerReviewWarnings(record),
    noPublicLaunchPerformed: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
