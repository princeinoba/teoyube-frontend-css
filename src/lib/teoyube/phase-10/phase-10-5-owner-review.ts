export type TeoyubePhase105OwnerReviewRecord = {
  reviewed: boolean;
  phase104FirstDayReviewReviewed: boolean;
  firstWeekStabilizationReviewed: boolean;
  manualFeedbackLoopReviewed: boolean;
  repeatedIssuePatternsReviewed: boolean;
  knownIssueRegisterReviewed: boolean;
  safeFixBatchReviewed: boolean;
  rollbackReadinessReviewed: boolean;
  controlledReleaseExpansionDecisionReviewed: boolean;
  finalOwnerDecisionRecorded: boolean;
  nextPhase10StepAccepted: boolean;
  notes: string[];
  reviewedAt: string;
};

export function createPhase105OwnerReviewChecklist(accepted = false) {
  return [
    { id: "phase_10_4_first_day_review", label: "Phase 10.4 first-day review reviewed", accepted },
    { id: "first_week_stabilization", label: "First-week stabilization reviewed", accepted },
    { id: "manual_feedback_loop", label: "Manual feedback loop reviewed", accepted },
    { id: "repeated_issue_patterns", label: "Repeated issue patterns reviewed", accepted },
    { id: "known_issue_register", label: "Known issue register reviewed", accepted },
    { id: "safe_fix_batch", label: "Safe-fix batch reviewed", accepted },
    { id: "rollback_readiness", label: "Rollback readiness reviewed", accepted },
    { id: "controlled_expansion_decision", label: "Controlled release expansion decision reviewed", accepted },
    { id: "final_owner_decision", label: "Final owner decision recorded", accepted },
    { id: "next_phase", label: "Next Phase 10 step accepted or blocked", accepted }
  ];
}

export function createPhase105OwnerReviewRecord(input: Partial<TeoyubePhase105OwnerReviewRecord> = {}): TeoyubePhase105OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    reviewed,
    phase104FirstDayReviewReviewed: input.phase104FirstDayReviewReviewed ?? reviewed,
    firstWeekStabilizationReviewed: input.firstWeekStabilizationReviewed ?? reviewed,
    manualFeedbackLoopReviewed: input.manualFeedbackLoopReviewed ?? reviewed,
    repeatedIssuePatternsReviewed: input.repeatedIssuePatternsReviewed ?? reviewed,
    knownIssueRegisterReviewed: input.knownIssueRegisterReviewed ?? reviewed,
    safeFixBatchReviewed: input.safeFixBatchReviewed ?? reviewed,
    rollbackReadinessReviewed: input.rollbackReadinessReviewed ?? reviewed,
    controlledReleaseExpansionDecisionReviewed: input.controlledReleaseExpansionDecisionReviewed ?? reviewed,
    finalOwnerDecisionRecorded: input.finalOwnerDecisionRecorded ?? reviewed,
    nextPhase10StepAccepted: input.nextPhase10StepAccepted ?? false,
    notes: input.notes || [],
    reviewedAt: input.reviewedAt || new Date().toISOString()
  };
}

export function getPhase105OwnerReviewBlockers(record: TeoyubePhase105OwnerReviewRecord): string[] {
  return Object.entries({
    reviewed: record.reviewed,
    phase104FirstDayReviewReviewed: record.phase104FirstDayReviewReviewed,
    firstWeekStabilizationReviewed: record.firstWeekStabilizationReviewed,
    manualFeedbackLoopReviewed: record.manualFeedbackLoopReviewed,
    repeatedIssuePatternsReviewed: record.repeatedIssuePatternsReviewed,
    knownIssueRegisterReviewed: record.knownIssueRegisterReviewed,
    safeFixBatchReviewed: record.safeFixBatchReviewed,
    rollbackReadinessReviewed: record.rollbackReadinessReviewed,
    controlledReleaseExpansionDecisionReviewed: record.controlledReleaseExpansionDecisionReviewed,
    finalOwnerDecisionRecorded: record.finalOwnerDecisionRecorded
  }).filter(([, value]) => !value).map(([key]) => `${key} requires owner review.`);
}

export function getPhase105OwnerReviewWarnings(record: TeoyubePhase105OwnerReviewRecord): string[] {
  const warnings = record.notes.length ? [...record.notes] : [];
  if (!record.nextPhase10StepAccepted) warnings.push("Phase 10.6 should wait until build/typecheck/local verification and owner expansion decision blockers are resolved.");
  return warnings;
}

export function validatePhase105OwnerReview(record: TeoyubePhase105OwnerReviewRecord): boolean {
  return getPhase105OwnerReviewBlockers(record).length === 0;
}

export function createPhase105OwnerReviewDecision(record: TeoyubePhase105OwnerReviewRecord): "owner_review_complete" | "needs_owner_review" | "blocked_before_phase_10_6" {
  if (!validatePhase105OwnerReview(record)) return "needs_owner_review";
  return record.nextPhase10StepAccepted ? "owner_review_complete" : "blocked_before_phase_10_6";
}

export function createPhase105OwnerReviewReport(record: TeoyubePhase105OwnerReviewRecord) {
  return {
    valid: validatePhase105OwnerReview(record),
    decision: createPhase105OwnerReviewDecision(record),
    checklist: createPhase105OwnerReviewChecklist(validatePhase105OwnerReview(record)),
    record,
    blockers: getPhase105OwnerReviewBlockers(record),
    warnings: getPhase105OwnerReviewWarnings(record),
    noPublicExpansionPerformedByCode: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
