export type TeoyubeManualOperationsReviewDecision =
  | "operations_review_ready"
  | "operations_review_ready_with_warnings"
  | "continue_review"
  | "blocked";

export type TeoyubeManualOperationsReviewRecord = {
  id: string;
  checks: Array<{ id: string; label: string; passed: boolean; critical: boolean; details: string }>;
  releaseOwner: string;
  notes: string[];
  reviewedAt: string;
};

export type TeoyubeManualOperationsReviewInput = Partial<{
  releaseOwner: string;
  notes: string[];
  appAvailabilityReviewedManually: boolean;
  coreRoutesReviewedManually: boolean;
  manualFeedbackReviewed: boolean;
  issueTriageReviewed: boolean;
  knownIssueRegisterReviewed: boolean;
  safeFixBatchProcessReviewed: boolean;
  rollbackReadinessReviewed: boolean;
  publicTrustRefreshReviewed: boolean;
  documentationUpdatedIfNeeded: boolean;
  ownerNotesRecorded: boolean;
}>;

function item(id: string, label: string, passed: boolean, details: string) {
  return { id, label, passed, critical: true, details };
}

export function createManualOperationsReviewChecklist(input: TeoyubeManualOperationsReviewInput = {}) {
  return [
    item("app_availability", "App availability reviewed manually", input.appAvailabilityReviewedManually === true, "App availability must be reviewed manually."),
    item("core_routes", "Core routes reviewed manually", input.coreRoutesReviewedManually === true, "Core routes must be reviewed manually."),
    item("manual_feedback", "Manual feedback reviewed", input.manualFeedbackReviewed === true, "Manual feedback must be reviewed."),
    item("issue_triage", "Issue triage reviewed", input.issueTriageReviewed === true, "Issue triage must be reviewed."),
    item("known_issues", "Known issue register reviewed", input.knownIssueRegisterReviewed === true, "Known issue register must be reviewed."),
    item("safe_fix_batch", "Safe-fix batch process reviewed", input.safeFixBatchProcessReviewed === true, "Safe-fix batch process must be reviewed."),
    item("rollback", "Rollback readiness reviewed", input.rollbackReadinessReviewed === true, "Rollback readiness must be reviewed."),
    item("public_trust", "Public trust refresh reviewed", input.publicTrustRefreshReviewed === true, "Public trust refresh must be reviewed."),
    item("documentation", "Documentation updated if needed", input.documentationUpdatedIfNeeded === true, "Documentation updates must be reviewed."),
    item("owner_notes", "Owner notes recorded", input.ownerNotesRecorded === true, "Owner notes must be recorded.")
  ];
}

export function createManualOperationsReviewRecord(input: TeoyubeManualOperationsReviewInput = {}): TeoyubeManualOperationsReviewRecord {
  return {
    id: "phase_10_7_manual_operations_review",
    checks: createManualOperationsReviewChecklist(input),
    releaseOwner: input.releaseOwner || "project_owner",
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

export function getManualOperationsReviewBlockers(record: TeoyubeManualOperationsReviewRecord): string[] {
  return record.checks.filter((entry) => entry.critical && !entry.passed).map((entry) => entry.details);
}

export function getManualOperationsReviewWarnings(record: TeoyubeManualOperationsReviewRecord): string[] {
  const warnings: string[] = [];
  if (!record.notes.length) warnings.push("Manual operations review has no owner notes.");
  warnings.push("Manual operations review does not monitor users or fetch public URLs automatically.");
  return warnings;
}

export function validateManualOperationsReview(record: TeoyubeManualOperationsReviewRecord): boolean {
  return getManualOperationsReviewBlockers(record).length === 0;
}

export function createManualOperationsReviewDecision(record: TeoyubeManualOperationsReviewRecord): TeoyubeManualOperationsReviewDecision {
  if (!validateManualOperationsReview(record)) return "continue_review";
  return getManualOperationsReviewWarnings(record).length ? "operations_review_ready_with_warnings" : "operations_review_ready";
}

export function createManualOperationsReviewReport(record: TeoyubeManualOperationsReviewRecord) {
  const blockers = getManualOperationsReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createManualOperationsReviewDecision(record),
    record,
    blockers,
    warnings: getManualOperationsReviewWarnings(record),
    noAutomaticUserMonitoring: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
