export type TeoyubePhase103OwnerReviewRecord = {
  reviewed: boolean;
  phase101ReleasePlanReviewed: boolean;
  phase102RuntimeBuildVerificationReviewed: boolean;
  controlledReleaseExecutionChecklistReviewed: boolean;
  firstHourMonitoringChecklistReviewed: boolean;
  launchDecisionLogReviewed: boolean;
  rollbackReadinessReviewed: boolean;
  issueClassificationRulesReviewed: boolean;
  safeFixRulesReviewed: boolean;
  ownerDecisionRecorded: boolean;
  nextPhase10StepAccepted: boolean;
  notes: string[];
  reviewedAt: string;
};

export function createPhase103OwnerReviewChecklist(accepted = false) {
  return [
    { id: "phase_10_1_release_plan", label: "Phase 10.1 release plan reviewed", accepted },
    { id: "phase_10_2_runtime_build", label: "Phase 10.2 runtime/build verification reviewed", accepted },
    { id: "controlled_release_execution", label: "Controlled release execution checklist reviewed", accepted },
    { id: "first_hour_monitoring", label: "First-hour monitoring checklist reviewed", accepted },
    { id: "launch_decision_log", label: "Launch decision log reviewed", accepted },
    { id: "rollback_readiness", label: "Rollback readiness reviewed", accepted },
    { id: "issue_classification", label: "Issue classification rules reviewed", accepted },
    { id: "safe_fix_rules", label: "Safe fix rules reviewed", accepted },
    { id: "owner_decision", label: "Owner decision recorded", accepted },
    { id: "next_phase", label: "Next Phase 10 step accepted or blocked", accepted }
  ];
}

export function createPhase103OwnerReviewRecord(input: Partial<TeoyubePhase103OwnerReviewRecord> = {}): TeoyubePhase103OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    reviewed,
    phase101ReleasePlanReviewed: input.phase101ReleasePlanReviewed ?? reviewed,
    phase102RuntimeBuildVerificationReviewed: input.phase102RuntimeBuildVerificationReviewed ?? reviewed,
    controlledReleaseExecutionChecklistReviewed: input.controlledReleaseExecutionChecklistReviewed ?? reviewed,
    firstHourMonitoringChecklistReviewed: input.firstHourMonitoringChecklistReviewed ?? reviewed,
    launchDecisionLogReviewed: input.launchDecisionLogReviewed ?? reviewed,
    rollbackReadinessReviewed: input.rollbackReadinessReviewed ?? reviewed,
    issueClassificationRulesReviewed: input.issueClassificationRulesReviewed ?? reviewed,
    safeFixRulesReviewed: input.safeFixRulesReviewed ?? reviewed,
    ownerDecisionRecorded: input.ownerDecisionRecorded ?? reviewed,
    nextPhase10StepAccepted: input.nextPhase10StepAccepted ?? false,
    notes: input.notes || [],
    reviewedAt: input.reviewedAt || new Date().toISOString()
  };
}

export function getPhase103OwnerReviewBlockers(record: TeoyubePhase103OwnerReviewRecord): string[] {
  return Object.entries({
    reviewed: record.reviewed,
    phase101ReleasePlanReviewed: record.phase101ReleasePlanReviewed,
    phase102RuntimeBuildVerificationReviewed: record.phase102RuntimeBuildVerificationReviewed,
    controlledReleaseExecutionChecklistReviewed: record.controlledReleaseExecutionChecklistReviewed,
    firstHourMonitoringChecklistReviewed: record.firstHourMonitoringChecklistReviewed,
    launchDecisionLogReviewed: record.launchDecisionLogReviewed,
    rollbackReadinessReviewed: record.rollbackReadinessReviewed,
    issueClassificationRulesReviewed: record.issueClassificationRulesReviewed,
    safeFixRulesReviewed: record.safeFixRulesReviewed,
    ownerDecisionRecorded: record.ownerDecisionRecorded
  }).filter(([, value]) => !value).map(([key]) => `${key} requires owner review.`);
}

export function getPhase103OwnerReviewWarnings(record: TeoyubePhase103OwnerReviewRecord): string[] {
  const warnings = record.notes.length ? [...record.notes] : [];
  if (!record.nextPhase10StepAccepted) warnings.push("Phase 10.4 should wait until launch decision and build/runtime blockers are resolved.");
  return warnings;
}

export function validatePhase103OwnerReview(record: TeoyubePhase103OwnerReviewRecord): boolean {
  return getPhase103OwnerReviewBlockers(record).length === 0;
}

export function createPhase103OwnerReviewDecision(record: TeoyubePhase103OwnerReviewRecord): "owner_review_complete" | "needs_owner_review" | "blocked_before_phase_10_4" {
  if (!validatePhase103OwnerReview(record)) return "needs_owner_review";
  return record.nextPhase10StepAccepted ? "owner_review_complete" : "blocked_before_phase_10_4";
}

export function createPhase103OwnerReviewReport(record: TeoyubePhase103OwnerReviewRecord) {
  return {
    valid: validatePhase103OwnerReview(record),
    decision: createPhase103OwnerReviewDecision(record),
    checklist: createPhase103OwnerReviewChecklist(validatePhase103OwnerReview(record)),
    record,
    blockers: getPhase103OwnerReviewBlockers(record),
    warnings: getPhase103OwnerReviewWarnings(record),
    noPublicLaunchPerformedByCode: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
