export type TeoyubePublicTrustRefreshReviewDecision =
  | "public_trust_refresh_ready"
  | "ready_with_warnings"
  | "revise_before_completion"
  | "completion_blocked";

export type TeoyubePublicTrustRefreshReviewRecord = {
  id: string;
  checks: Array<{ id: string; label: string; passed: boolean; critical: boolean; details: string }>;
  releaseOwner: string;
  notes: string[];
  reviewedAt: string;
};

export type TeoyubePublicTrustRefreshReviewInput = Partial<{
  releaseOwner: string;
  notes: string[];
  noDivineCertaintyClaim: boolean;
  noGuaranteedProphecyClaim: boolean;
  knownLimitationsVisibleOrDocumented: boolean;
  privacyConsentVisibleWhereRequired: boolean;
  confidenceLabelsVisibleWhereRequired: boolean;
  explanationTracesAvailableWhereRequired: boolean;
  scriptureAnchorsPreserved: boolean;
  fallbackStatesSafeAndClear: boolean;
  disabledServicesClearlyExplained: boolean;
  supportFeedbackExpectationsClear: boolean;
  noHiddenPersonalizationIntroduced: boolean;
}>;

function trustItem(id: string, label: string, passed: boolean, details: string) {
  return { id, label, passed, critical: true, details };
}

export function createPublicTrustRefreshReviewChecklist(input: TeoyubePublicTrustRefreshReviewInput = {}) {
  return [
    trustItem("no_divine_certainty", "No divine certainty claim", input.noDivineCertaintyClaim === true, "Teoyube must still not claim divine certainty."),
    trustItem("no_guaranteed_prophecy", "No guaranteed prophecy claim", input.noGuaranteedProphecyClaim === true, "Guidance must still not be presented as guaranteed prophecy."),
    trustItem("known_limitations", "Known limitations visible or documented", input.knownLimitationsVisibleOrDocumented === true, "Known limitations must remain visible or documented."),
    trustItem("privacy_consent", "Privacy and consent visible where required", input.privacyConsentVisibleWhereRequired === true, "Privacy and consent notices must remain visible where required."),
    trustItem("confidence_labels", "Confidence labels visible where required", input.confidenceLabelsVisibleWhereRequired === true, "Confidence labels must remain visible."),
    trustItem("explanation_traces", "Explanation traces available where required", input.explanationTracesAvailableWhereRequired === true, "Explanation traces must remain available."),
    trustItem("scripture_anchors", "Scripture anchors preserved", input.scriptureAnchorsPreserved === true, "Scripture anchors must remain preserved."),
    trustItem("fallback_states", "Fallback states safe and clear", input.fallbackStatesSafeAndClear === true, "Fallback states must remain safe and clear."),
    trustItem("disabled_services", "Disabled services clearly explained", input.disabledServicesClearlyExplained === true, "Disabled services must remain clearly explained."),
    trustItem("support_expectations", "Support and feedback expectations clear", input.supportFeedbackExpectationsClear === true, "Support and feedback expectations must remain clear."),
    trustItem("no_hidden_personalization", "No hidden personalization", input.noHiddenPersonalizationIntroduced === true, "Hidden personalization must not be introduced.")
  ];
}

export function createPublicTrustRefreshReviewRecord(input: TeoyubePublicTrustRefreshReviewInput = {}): TeoyubePublicTrustRefreshReviewRecord {
  return {
    id: "phase_10_7_public_trust_refresh_review",
    checks: createPublicTrustRefreshReviewChecklist(input),
    releaseOwner: input.releaseOwner || "project_owner",
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

export function getPublicTrustRefreshReviewBlockers(record: TeoyubePublicTrustRefreshReviewRecord): string[] {
  return record.checks.filter((entry) => entry.critical && !entry.passed).map((entry) => entry.details);
}

export function getPublicTrustRefreshReviewWarnings(record: TeoyubePublicTrustRefreshReviewRecord): string[] {
  const warnings: string[] = [];
  if (!record.notes.length) warnings.push("Public trust refresh has no owner notes.");
  return warnings;
}

export function validatePublicTrustRefreshReview(record: TeoyubePublicTrustRefreshReviewRecord): boolean {
  return getPublicTrustRefreshReviewBlockers(record).length === 0;
}

export function createPublicTrustRefreshReviewDecision(record: TeoyubePublicTrustRefreshReviewRecord): TeoyubePublicTrustRefreshReviewDecision {
  if (!validatePublicTrustRefreshReview(record)) return "completion_blocked";
  return getPublicTrustRefreshReviewWarnings(record).length ? "ready_with_warnings" : "public_trust_refresh_ready";
}

export function createPublicTrustRefreshReviewReport(record: TeoyubePublicTrustRefreshReviewRecord) {
  const blockers = getPublicTrustRefreshReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPublicTrustRefreshReviewDecision(record),
    record,
    blockers,
    warnings: getPublicTrustRefreshReviewWarnings(record),
    noAutomaticUserMonitoring: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
