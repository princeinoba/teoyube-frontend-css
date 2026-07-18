export type TeoyubePhase104OwnerReviewRecord = {
  reviewed: boolean;
  phase103LaunchDecisionLogReviewed: boolean;
  firstHourMonitoringReviewed: boolean;
  postReleaseStabilizationReviewed: boolean;
  manualFeedbackReviewed: boolean;
  issueTriageReviewed: boolean;
  safeFixQueueReviewed: boolean;
  rollbackReadinessReviewed: boolean;
  firstDayReviewCompleted: boolean;
  nextPhase10StepAccepted: boolean;
  notes: string[];
  reviewedAt: string;
};

export function createPhase104OwnerReviewChecklist(accepted = false) {
  return [
    { id: "phase_10_3_launch_decision_log", label: "Phase 10.3 launch decision log reviewed", accepted },
    { id: "first_hour_monitoring", label: "First-hour monitoring reviewed", accepted },
    { id: "post_release_stabilization", label: "Post-release stabilization reviewed", accepted },
    { id: "manual_feedback", label: "Manual feedback reviewed", accepted },
    { id: "issue_triage", label: "Issue triage reviewed", accepted },
    { id: "safe_fix_queue", label: "Safe-fix queue reviewed", accepted },
    { id: "rollback_readiness", label: "Rollback readiness reviewed", accepted },
    { id: "first_day_review", label: "First-day review completed", accepted },
    { id: "next_phase", label: "Next Phase 10 step accepted or blocked", accepted }
  ];
}

export function createPhase104OwnerReviewRecord(input: Partial<TeoyubePhase104OwnerReviewRecord> = {}): TeoyubePhase104OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    reviewed,
    phase103LaunchDecisionLogReviewed: input.phase103LaunchDecisionLogReviewed ?? reviewed,
    firstHourMonitoringReviewed: input.firstHourMonitoringReviewed ?? reviewed,
    postReleaseStabilizationReviewed: input.postReleaseStabilizationReviewed ?? reviewed,
    manualFeedbackReviewed: input.manualFeedbackReviewed ?? reviewed,
    issueTriageReviewed: input.issueTriageReviewed ?? reviewed,
    safeFixQueueReviewed: input.safeFixQueueReviewed ?? reviewed,
    rollbackReadinessReviewed: input.rollbackReadinessReviewed ?? reviewed,
    firstDayReviewCompleted: input.firstDayReviewCompleted ?? reviewed,
    nextPhase10StepAccepted: input.nextPhase10StepAccepted ?? false,
    notes: input.notes || [],
    reviewedAt: input.reviewedAt || new Date().toISOString()
  };
}

export function getPhase104OwnerReviewBlockers(record: TeoyubePhase104OwnerReviewRecord): string[] {
  return Object.entries({
    reviewed: record.reviewed,
    phase103LaunchDecisionLogReviewed: record.phase103LaunchDecisionLogReviewed,
    firstHourMonitoringReviewed: record.firstHourMonitoringReviewed,
    postReleaseStabilizationReviewed: record.postReleaseStabilizationReviewed,
    manualFeedbackReviewed: record.manualFeedbackReviewed,
    issueTriageReviewed: record.issueTriageReviewed,
    safeFixQueueReviewed: record.safeFixQueueReviewed,
    rollbackReadinessReviewed: record.rollbackReadinessReviewed,
    firstDayReviewCompleted: record.firstDayReviewCompleted
  }).filter(([, value]) => !value).map(([key]) => `${key} requires owner review.`);
}

export function getPhase104OwnerReviewWarnings(record: TeoyubePhase104OwnerReviewRecord): string[] {
  const warnings = record.notes.length ? [...record.notes] : [];
  if (!record.nextPhase10StepAccepted) warnings.push("Phase 10.5 should wait until build/typecheck/local verification and owner first-day decision blockers are resolved.");
  return warnings;
}

export function validatePhase104OwnerReview(record: TeoyubePhase104OwnerReviewRecord): boolean {
  return getPhase104OwnerReviewBlockers(record).length === 0;
}

export function createPhase104OwnerReviewDecision(record: TeoyubePhase104OwnerReviewRecord): "owner_review_complete" | "needs_owner_review" | "blocked_before_phase_10_5" {
  if (!validatePhase104OwnerReview(record)) return "needs_owner_review";
  return record.nextPhase10StepAccepted ? "owner_review_complete" : "blocked_before_phase_10_5";
}

export function createPhase104OwnerReviewReport(record: TeoyubePhase104OwnerReviewRecord) {
  return {
    valid: validatePhase104OwnerReview(record),
    decision: createPhase104OwnerReviewDecision(record),
    checklist: createPhase104OwnerReviewChecklist(validatePhase104OwnerReview(record)),
    record,
    blockers: getPhase104OwnerReviewBlockers(record),
    warnings: getPhase104OwnerReviewWarnings(record),
    noPublicLaunchPerformedByCode: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
