export type TeoyubeKnownLimitationsReadinessDecision =
  | "limitations_ready"
  | "limitations_ready_with_conditions"
  | "revise_before_expansion"
  | "blocked";

export type TeoyubeKnownLimitationsReadinessRecord = {
  id: string;
  checks: Array<{ id: string; label: string; passed: boolean; critical: boolean; details: string }>;
  releaseOwner: string;
  notes: string[];
  reviewedAt: string;
};

export type TeoyubeKnownLimitationsReadinessInput = Partial<{
  releaseOwner: string;
  notes: string[];
  controlledReleaseStatusDocumented: boolean;
  unfinishedFeaturesNotPresentedAsComplete: boolean;
  disabledServicesClearlyIdentified: boolean;
  liveAiLimitationsClear: boolean;
  manualFeedbackProcessClear: boolean;
  supportResponseExpectationsRealistic: boolean;
  spiritualGuidanceBoundariesClear: boolean;
  emergencyProfessionalLimitationsClear: boolean;
  knownIssuesNotHiddenFromOwnerReview: boolean;
  noHiddenTrackingDependency: boolean;
}>;

function item(id: string, label: string, passed: boolean, details: string, critical = true) {
  return { id, label, passed, critical, details };
}

export function createKnownLimitationsReadinessChecklist(input: TeoyubeKnownLimitationsReadinessInput = {}) {
  return [
    item("controlled_release_status", "Controlled release status documented", input.controlledReleaseStatusDocumented === true, "Controlled release status must be documented."),
    item("unfinished_features", "Unfinished features not presented as complete", input.unfinishedFeaturesNotPresentedAsComplete === true, "Unfinished features must not be presented as complete."),
    item("disabled_services", "Disabled services clearly identified", input.disabledServicesClearlyIdentified === true, "Disabled services must be clearly identified."),
    item("live_ai_limitations", "Live AI limitations clear", input.liveAiLimitationsClear === true, "Live AI limitations must be clear if AI is disabled or limited."),
    item("manual_feedback", "Manual feedback process clear", input.manualFeedbackProcessClear === true, "Feedback process must be clear if still manual."),
    item("support_expectations", "Support response expectations realistic", input.supportResponseExpectationsRealistic === true, "Support response expectations must be realistic."),
    item("spiritual_boundaries", "Spiritual guidance boundaries clear", input.spiritualGuidanceBoundariesClear === true, "Spiritual guidance boundaries must be clear."),
    item("professional_limitations", "Emergency/professional advice limitations clear", input.emergencyProfessionalLimitationsClear === true, "Emergency and professional advice limitations must be clear."),
    item("known_issues_owner_review", "Known issues not hidden from owner review", input.knownIssuesNotHiddenFromOwnerReview === true, "Known issues must not be hidden from owner review."),
    item("no_hidden_tracking", "Expansion does not depend on hidden tracking", input.noHiddenTrackingDependency === true, "Release expansion must not depend on hidden tracking.")
  ];
}

export function createKnownLimitationsReadinessRecord(input: TeoyubeKnownLimitationsReadinessInput = {}): TeoyubeKnownLimitationsReadinessRecord {
  return {
    id: "phase_10_6_known_limitations_readiness",
    checks: createKnownLimitationsReadinessChecklist(input),
    releaseOwner: input.releaseOwner || "project_owner",
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

export function getKnownLimitationsReadinessBlockers(record: TeoyubeKnownLimitationsReadinessRecord): string[] {
  return record.checks.filter((entry) => entry.critical && !entry.passed).map((entry) => entry.details);
}

export function getKnownLimitationsReadinessWarnings(record: TeoyubeKnownLimitationsReadinessRecord): string[] {
  const warnings = record.checks.filter((entry) => !entry.critical && !entry.passed).map((entry) => entry.details);
  if (!record.notes.length) warnings.push("Known limitations readiness has no owner notes.");
  return warnings;
}

export function validateKnownLimitationsReadiness(record: TeoyubeKnownLimitationsReadinessRecord): boolean {
  return getKnownLimitationsReadinessBlockers(record).length === 0;
}

export function createKnownLimitationsReadinessDecision(record: TeoyubeKnownLimitationsReadinessRecord): TeoyubeKnownLimitationsReadinessDecision {
  if (!validateKnownLimitationsReadiness(record)) return "revise_before_expansion";
  return getKnownLimitationsReadinessWarnings(record).length ? "limitations_ready_with_conditions" : "limitations_ready";
}

export function createKnownLimitationsReadinessReport(record: TeoyubeKnownLimitationsReadinessRecord) {
  const blockers = getKnownLimitationsReadinessBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createKnownLimitationsReadinessDecision(record),
    record,
    blockers,
    warnings: getKnownLimitationsReadinessWarnings(record),
    noHiddenTracking: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
