export type TeoyubePhase101OwnerReviewChecklistItem = {
  id: string;
  label: string;
  accepted: boolean;
  details: string;
};

export type TeoyubePhase101OwnerReviewRecord = {
  reviewed: boolean;
  controlledPublicReleaseExecutionPlanReviewed: boolean;
  manualLaunchChecklistReviewed: boolean;
  manualMonitoringBoundariesReviewed: boolean;
  supportFeedbackBoundariesReviewed: boolean;
  issueTriageExecutionPlanReviewed: boolean;
  pauseRollbackReadinessReviewed: boolean;
  serviceDisabledConfirmationReviewed: boolean;
  safetyExecutionConfirmationReviewed: boolean;
  realAppVerificationPreparationReviewed: boolean;
  nextPhase10StepAccepted: boolean;
  notes: string[];
  reviewedAt: string;
};

export type TeoyubePhase101OwnerReviewDecision =
  | "owner_review_complete"
  | "needs_owner_review"
  | "blocked";

function item(id: string, label: string, accepted: boolean, details: string): TeoyubePhase101OwnerReviewChecklistItem {
  return { id, label, accepted, details };
}

export function createPhase101OwnerReviewChecklist(accepted = false): TeoyubePhase101OwnerReviewChecklistItem[] {
  return [
    item("execution_plan", "Controlled public release execution plan reviewed", accepted, "Owner reviewed manual execution plan and no-launch boundary."),
    item("manual_launch_checklist", "Manual launch checklist reviewed", accepted, "Owner reviewed build, route, component, data, mobile, accessibility, privacy, and service checks."),
    item("manual_monitoring_boundaries", "Manual monitoring boundaries reviewed", accepted, "Owner reviewed no analytics, no monitoring provider, no tracking, no automatic alerts, and no public URL fetching."),
    item("support_feedback_boundaries", "Support/feedback boundaries reviewed", accepted, "Owner reviewed manual support, manual feedback, no persistence, and no automatic contact."),
    item("issue_triage", "Issue triage execution plan reviewed", accepted, "Owner reviewed blocking categories and manual actions."),
    item("pause_rollback", "Pause/rollback readiness reviewed", accepted, "Owner reviewed decision support criteria only."),
    item("service_disabled", "Service-disabled confirmation reviewed", accepted, "Owner reviewed disabled database, analytics, monitoring, admin, CMS, accounts, live AI, and notifications."),
    item("safety_confirmation", "Safety execution confirmation reviewed", accepted, "Owner reviewed Scripture, explanation, fallback, confidence, privacy, limitations, and safety language boundaries."),
    item("real_app_verification", "Real app verification preparation reviewed", accepted, "Owner reviewed Phase 10.2 build, route, runtime, component, and data verification plan."),
    item("next_phase", "Next Phase 10 step accepted or blocked", accepted, "Owner accepts Phase 10.2 as the next step or explicitly blocks it.")
  ];
}

export function createPhase101OwnerReviewRecord(input: Partial<TeoyubePhase101OwnerReviewRecord> = {}): TeoyubePhase101OwnerReviewRecord {
  const reviewed = input.reviewed ?? false;
  return {
    reviewed,
    controlledPublicReleaseExecutionPlanReviewed: input.controlledPublicReleaseExecutionPlanReviewed ?? reviewed,
    manualLaunchChecklistReviewed: input.manualLaunchChecklistReviewed ?? reviewed,
    manualMonitoringBoundariesReviewed: input.manualMonitoringBoundariesReviewed ?? reviewed,
    supportFeedbackBoundariesReviewed: input.supportFeedbackBoundariesReviewed ?? reviewed,
    issueTriageExecutionPlanReviewed: input.issueTriageExecutionPlanReviewed ?? reviewed,
    pauseRollbackReadinessReviewed: input.pauseRollbackReadinessReviewed ?? reviewed,
    serviceDisabledConfirmationReviewed: input.serviceDisabledConfirmationReviewed ?? reviewed,
    safetyExecutionConfirmationReviewed: input.safetyExecutionConfirmationReviewed ?? reviewed,
    realAppVerificationPreparationReviewed: input.realAppVerificationPreparationReviewed ?? reviewed,
    nextPhase10StepAccepted: input.nextPhase10StepAccepted ?? reviewed,
    notes: input.notes || [],
    reviewedAt: input.reviewedAt || new Date().toISOString()
  };
}

export function getPhase101OwnerReviewBlockers(record: TeoyubePhase101OwnerReviewRecord): string[] {
  const checklist = [
    ["reviewed", record.reviewed],
    ["controlledPublicReleaseExecutionPlanReviewed", record.controlledPublicReleaseExecutionPlanReviewed],
    ["manualLaunchChecklistReviewed", record.manualLaunchChecklistReviewed],
    ["manualMonitoringBoundariesReviewed", record.manualMonitoringBoundariesReviewed],
    ["supportFeedbackBoundariesReviewed", record.supportFeedbackBoundariesReviewed],
    ["issueTriageExecutionPlanReviewed", record.issueTriageExecutionPlanReviewed],
    ["pauseRollbackReadinessReviewed", record.pauseRollbackReadinessReviewed],
    ["serviceDisabledConfirmationReviewed", record.serviceDisabledConfirmationReviewed],
    ["safetyExecutionConfirmationReviewed", record.safetyExecutionConfirmationReviewed],
    ["realAppVerificationPreparationReviewed", record.realAppVerificationPreparationReviewed],
    ["nextPhase10StepAccepted", record.nextPhase10StepAccepted]
  ] as const;
  return checklist.filter(([, accepted]) => !accepted).map(([id]) => `${id} requires owner review.`);
}

export function getPhase101OwnerReviewWarnings(record: TeoyubePhase101OwnerReviewRecord): string[] {
  return record.notes.length ? record.notes : ["Owner review is manual and in-memory; it does not launch, contact users, or connect services."];
}

export function createPhase101OwnerReviewDecision(record: TeoyubePhase101OwnerReviewRecord): TeoyubePhase101OwnerReviewDecision {
  return getPhase101OwnerReviewBlockers(record).length ? "needs_owner_review" : "owner_review_complete";
}

export function validatePhase101OwnerReview(record: TeoyubePhase101OwnerReviewRecord): boolean {
  return getPhase101OwnerReviewBlockers(record).length === 0;
}

export function createPhase101OwnerReviewReport(record: TeoyubePhase101OwnerReviewRecord) {
  const blockers = getPhase101OwnerReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPhase101OwnerReviewDecision(record),
    checklist: createPhase101OwnerReviewChecklist(validatePhase101OwnerReview(record)),
    record,
    blockers,
    warnings: getPhase101OwnerReviewWarnings(record),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
