export type TeoyubePhase106OwnerReviewRecord = {
  reviewed: boolean;
  phase105StabilizationPackageReviewed: boolean;
  controlledReleaseExpansionReadinessReviewed: boolean;
  publicTrustReviewReviewed: boolean;
  knownLimitationsReadinessReviewed: boolean;
  publicSafetyBoundaryReviewReviewed: boolean;
  stabilizedOperationsHandoffReviewed: boolean;
  controlledExpansionGateReviewed: boolean;
  stabilizedOperationsRunbookReviewed: boolean;
  rollbackReadinessReviewed: boolean;
  finalOwnerDecisionRecorded: boolean;
  nextPhase10StepAccepted: boolean;
  notes: string[];
  reviewedAt: string;
};

export function createPhase106OwnerReviewChecklist(accepted = false) {
  return [
    { id: "phase_10_5_package", label: "Phase 10.5 stabilization package reviewed", accepted },
    { id: "expansion_readiness", label: "Controlled release expansion readiness reviewed", accepted },
    { id: "public_trust", label: "Public trust review reviewed", accepted },
    { id: "known_limitations", label: "Known limitations readiness reviewed", accepted },
    { id: "public_safety", label: "Public safety boundary review reviewed", accepted },
    { id: "handoff", label: "Stabilized operations handoff reviewed", accepted },
    { id: "expansion_gate", label: "Controlled expansion gate reviewed", accepted },
    { id: "runbook", label: "Stabilized operations runbook reviewed", accepted },
    { id: "rollback", label: "Rollback readiness reviewed", accepted },
    { id: "final_owner_decision", label: "Final owner decision recorded", accepted },
    { id: "next_phase", label: "Next Phase 10 step accepted or blocked", accepted }
  ];
}

export function createPhase106OwnerReviewRecord(input: Partial<TeoyubePhase106OwnerReviewRecord> = {}): TeoyubePhase106OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    reviewed,
    phase105StabilizationPackageReviewed: input.phase105StabilizationPackageReviewed ?? reviewed,
    controlledReleaseExpansionReadinessReviewed: input.controlledReleaseExpansionReadinessReviewed ?? reviewed,
    publicTrustReviewReviewed: input.publicTrustReviewReviewed ?? reviewed,
    knownLimitationsReadinessReviewed: input.knownLimitationsReadinessReviewed ?? reviewed,
    publicSafetyBoundaryReviewReviewed: input.publicSafetyBoundaryReviewReviewed ?? reviewed,
    stabilizedOperationsHandoffReviewed: input.stabilizedOperationsHandoffReviewed ?? reviewed,
    controlledExpansionGateReviewed: input.controlledExpansionGateReviewed ?? reviewed,
    stabilizedOperationsRunbookReviewed: input.stabilizedOperationsRunbookReviewed ?? reviewed,
    rollbackReadinessReviewed: input.rollbackReadinessReviewed ?? reviewed,
    finalOwnerDecisionRecorded: input.finalOwnerDecisionRecorded ?? reviewed,
    nextPhase10StepAccepted: input.nextPhase10StepAccepted ?? false,
    notes: input.notes || [],
    reviewedAt: input.reviewedAt || new Date().toISOString()
  };
}

export function getPhase106OwnerReviewBlockers(record: TeoyubePhase106OwnerReviewRecord): string[] {
  return Object.entries({
    reviewed: record.reviewed,
    phase105StabilizationPackageReviewed: record.phase105StabilizationPackageReviewed,
    controlledReleaseExpansionReadinessReviewed: record.controlledReleaseExpansionReadinessReviewed,
    publicTrustReviewReviewed: record.publicTrustReviewReviewed,
    knownLimitationsReadinessReviewed: record.knownLimitationsReadinessReviewed,
    publicSafetyBoundaryReviewReviewed: record.publicSafetyBoundaryReviewReviewed,
    stabilizedOperationsHandoffReviewed: record.stabilizedOperationsHandoffReviewed,
    controlledExpansionGateReviewed: record.controlledExpansionGateReviewed,
    stabilizedOperationsRunbookReviewed: record.stabilizedOperationsRunbookReviewed,
    rollbackReadinessReviewed: record.rollbackReadinessReviewed,
    finalOwnerDecisionRecorded: record.finalOwnerDecisionRecorded
  }).filter(([, value]) => !value).map(([key]) => `${key} requires owner review.`);
}

export function getPhase106OwnerReviewWarnings(record: TeoyubePhase106OwnerReviewRecord): string[] {
  const warnings = record.notes.length ? [...record.notes] : [];
  if (!record.nextPhase10StepAccepted) warnings.push("Phase 10.7 should wait until build/typecheck/local verification and owner operations handoff blockers are resolved.");
  return warnings;
}

export function validatePhase106OwnerReview(record: TeoyubePhase106OwnerReviewRecord): boolean {
  return getPhase106OwnerReviewBlockers(record).length === 0;
}

export function createPhase106OwnerReviewDecision(record: TeoyubePhase106OwnerReviewRecord): "owner_review_complete" | "needs_owner_review" | "blocked_before_phase_10_7" {
  if (!validatePhase106OwnerReview(record)) return "needs_owner_review";
  return record.nextPhase10StepAccepted ? "owner_review_complete" : "blocked_before_phase_10_7";
}

export function createPhase106OwnerReviewReport(record: TeoyubePhase106OwnerReviewRecord) {
  return {
    valid: validatePhase106OwnerReview(record),
    decision: createPhase106OwnerReviewDecision(record),
    checklist: createPhase106OwnerReviewChecklist(validatePhase106OwnerReview(record)),
    record,
    blockers: getPhase106OwnerReviewBlockers(record),
    warnings: getPhase106OwnerReviewWarnings(record),
    noPublicExpansionPerformedByCode: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
