import type {
  TeoyubePublicTrustReviewArea,
  TeoyubePublicTrustReviewBlocker,
  TeoyubePublicTrustReviewCheck,
  TeoyubePublicTrustReviewDecision,
  TeoyubePublicTrustReviewRecord,
  TeoyubePublicTrustReviewReport,
  TeoyubePublicTrustReviewStatus,
  TeoyubePublicTrustReviewWarning
} from "./public-trust-review-contracts";

export type TeoyubePublicTrustReviewInput = Partial<{
  status: TeoyubePublicTrustReviewStatus;
  releaseOwner: string;
  conditions: string[];
  notes: string[];
  noDivineCertaintyClaim: boolean;
  noGuaranteedProphecyClaim: boolean;
  noProfessionalAdviceReplacement: boolean;
  knownLimitationsVisibleOrDocumented: boolean;
  privacyNoticeVisibleWhereRequired: boolean;
  consentNoticeVisibleWhereRequired: boolean;
  confidenceLabelsVisibleWhereRequired: boolean;
  explanationTracesAvailableWhereRequired: boolean;
  scriptureAnchorsPreserved: boolean;
  fallbackStatesSafeAndClear: boolean;
  disabledServicesClearlyExplained: boolean;
  controlledReleaseStatusClear: boolean;
  supportFeedbackExpectationsClear: boolean;
  noHiddenPersonalizationIntroduced: boolean;
}>;

function check(id: string, area: TeoyubePublicTrustReviewArea, label: string, passed: boolean, details: string, critical = true): TeoyubePublicTrustReviewCheck {
  return { id, area, label, passed, critical, details };
}

export function createPublicTrustReviewChecklist(input: TeoyubePublicTrustReviewInput = {}): TeoyubePublicTrustReviewCheck[] {
  return [
    check("no_divine_certainty", "spiritual_guidance_boundary", "No divine certainty claim", input.noDivineCertaintyClaim === true, "Teoyube must not claim divine certainty."),
    check("no_guaranteed_prophecy", "spiritual_guidance_boundary", "No guaranteed prophecy claim", input.noGuaranteedProphecyClaim === true, "Spiritual guidance must not be presented as guaranteed prophecy."),
    check("no_professional_replacement", "spiritual_guidance_boundary", "No professional support replacement", input.noProfessionalAdviceReplacement === true, "Teoyube must not replace pastoral, medical, legal, financial, emergency, or professional counseling support."),
    check("known_limitations", "known_limitations", "Known limitations visible or documented", input.knownLimitationsVisibleOrDocumented === true, "Known limitations must not be hidden."),
    check("privacy_notice", "privacy_notice", "Privacy notice visible where required", input.privacyNoticeVisibleWhereRequired === true, "Privacy notice must be visible where required."),
    check("consent_notice", "consent_notice", "Consent notice visible where required", input.consentNoticeVisibleWhereRequired === true, "Consent notice must be visible where required."),
    check("confidence_labels", "confidence_labels", "Confidence labels visible where required", input.confidenceLabelsVisibleWhereRequired === true, "Confidence labels must remain visible."),
    check("explanation_traces", "explanation_trace", "Explanation traces available where required", input.explanationTracesAvailableWhereRequired === true, "Explanation traces must remain available."),
    check("scripture_anchors", "scripture_anchor", "Scripture anchors preserved", input.scriptureAnchorsPreserved === true, "Scripture anchors must be preserved."),
    check("fallback_states", "fallback", "Fallback states safe and clear", input.fallbackStatesSafeAndClear === true, "Fallback states must be safe and clear."),
    check("disabled_services", "service_disabled_state", "Disabled services clearly explained", input.disabledServicesClearlyExplained === true, "Disabled services must be clearly explained."),
    check("controlled_release_status", "content_clarity", "Controlled release status clear", input.controlledReleaseStatusClear === true, "Users should not be misled into thinking controlled release is fully mature."),
    check("support_feedback_expectations", "support_expectations", "Support and feedback expectations clear", input.supportFeedbackExpectationsClear === true, "Support and feedback expectations must be clear."),
    check("no_hidden_personalization", "user_confusion_risk", "No hidden personalization introduced", input.noHiddenPersonalizationIntroduced === true, "Hidden personalization must not be introduced.")
  ];
}

export function createPublicTrustReviewRecord(input: TeoyubePublicTrustReviewInput = {}): TeoyubePublicTrustReviewRecord {
  return {
    id: "phase_10_6_public_trust_review",
    status: input.status || "reviewing",
    checks: createPublicTrustReviewChecklist(input),
    releaseOwner: input.releaseOwner || "project_owner",
    conditions: input.conditions || [],
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

export function getPublicTrustReviewBlockers(record: TeoyubePublicTrustReviewRecord): TeoyubePublicTrustReviewBlocker[] {
  const blockers = record.checks
    .filter((entry) => entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.details }));
  if (record.status === "blocked") blockers.push({ id: "public_trust_blocked", area: "unknown", message: "Public trust review is blocked." });
  return blockers;
}

export function getPublicTrustReviewWarnings(record: TeoyubePublicTrustReviewRecord): TeoyubePublicTrustReviewWarning[] {
  const warnings = record.checks
    .filter((entry) => !entry.critical && !entry.passed)
    .map((entry) => ({ id: `${entry.id}_warning`, area: entry.area, message: entry.details }));
  if (record.status === "trusted_with_conditions" && !record.conditions.length) warnings.push({ id: "conditions_missing", area: "content_clarity", message: "Conditional public trust readiness should include written conditions." });
  return warnings;
}

export function validatePublicTrustReviewRecord(record: TeoyubePublicTrustReviewRecord): boolean {
  return getPublicTrustReviewBlockers(record).length === 0;
}

export function createPublicTrustReviewDecision(record: TeoyubePublicTrustReviewRecord): TeoyubePublicTrustReviewDecision {
  if (!validatePublicTrustReviewRecord(record)) return record.status === "needs_revision" ? "revise_before_expansion" : "block_expansion";
  if (record.status === "trusted_with_conditions" || record.conditions.length) return "public_trust_ready_with_conditions";
  if (record.status === "trusted_for_limited_release") return "public_trust_ready";
  return getPublicTrustReviewWarnings(record).length ? "public_trust_ready_with_conditions" : "public_trust_ready";
}

export function createPublicTrustReviewReport(record: TeoyubePublicTrustReviewRecord): TeoyubePublicTrustReviewReport {
  const blockers = getPublicTrustReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createPublicTrustReviewDecision(record),
    record,
    blockers,
    warnings: getPublicTrustReviewWarnings(record),
    noAutomaticUserMonitoring: true,
    noAutomaticFeedbackCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
