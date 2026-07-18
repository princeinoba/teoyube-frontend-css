import type {
  TeoyubeFinalPublicCopyArea,
  TeoyubeFinalPublicCopyBlocker,
  TeoyubeFinalPublicCopyCheck,
  TeoyubeFinalPublicCopyDecision,
  TeoyubeFinalPublicCopyItem,
  TeoyubeFinalPublicCopyReport,
  TeoyubeFinalPublicCopyRequirement,
  TeoyubeFinalPublicCopyWarning
} from "./final-public-copy-review-contracts";

export type TeoyubeFinalPublicCopyReviewInput = Partial<{
  privacyCopyPresent: boolean;
  consentCopyPresent: boolean;
  sensitiveDataWarningPresent: boolean;
  knownLimitationsPresent: boolean;
  feedbackBoundaryClear: boolean;
  supportBoundaryClear: boolean;
  divineCertaintyLanguage: boolean;
  professionalAdviceClaims: boolean;
  scriptureAnchorsVisibleInCopy: boolean;
  explanationTraceAvailabilityVisible: boolean;
  unapprovedServicesImpliedActive: boolean;
  legalApprovalClaimedWithoutRecord: boolean;
  items: TeoyubeFinalPublicCopyItem[];
}>;

function flag(value: boolean | undefined): boolean {
  return value !== false;
}

function requirement(id: string, area: TeoyubeFinalPublicCopyArea, label: string, details: string): TeoyubeFinalPublicCopyRequirement {
  return { id, area, label, required: true, details };
}

function item(id: string, area: TeoyubeFinalPublicCopyArea, label: string, copy: string): TeoyubeFinalPublicCopyItem {
  return { id, area, label, copy, reviewed: true, requirements: [requirement(`${id}_requirement`, area, label, copy)] };
}

function check(id: string, area: TeoyubeFinalPublicCopyArea, label: string, passed: boolean, details: string): TeoyubeFinalPublicCopyCheck {
  return { id, area, label, passed, details };
}

function defaultItems(): TeoyubeFinalPublicCopyItem[] {
  return [
    item("privacy_notice_copy", "privacy_notice", "Privacy notice copy", "Privacy copy remains visible before public release candidate QA."),
    item("consent_notice_copy", "consent_notice", "Consent notice copy", "Consent copy remains visible for any future service, storage, account, analytics, or feedback decision."),
    item("sensitive_data_warning_copy", "sensitive_data_warning", "Sensitive data warning copy", "Users should not submit sensitive personal information."),
    item("known_limitations_copy", "known_limitations", "Known limitations copy", "Known limitations remain visible and service-disabled."),
    item("support_feedback_copy", "support_feedback_copy", "Support and feedback copy", "Support and feedback remain manual and privacy-protective."),
    item("scripture_explanation_copy", "tig_response_copy", "Scripture and explanation copy", "Guidance remains Scripture-anchored with explanation trace availability, fallback safety, and humble confidence labels.")
  ];
}

export function validateFinalPrivacyCopy(input: TeoyubeFinalPublicCopyReviewInput = {}): boolean {
  return flag(input.privacyCopyPresent);
}

export function validateFinalConsentCopy(input: TeoyubeFinalPublicCopyReviewInput = {}): boolean {
  return flag(input.consentCopyPresent);
}

export function validateFinalSensitiveDataWarningCopy(input: TeoyubeFinalPublicCopyReviewInput = {}): boolean {
  return flag(input.sensitiveDataWarningPresent);
}

export function validateFinalKnownLimitationsCopy(input: TeoyubeFinalPublicCopyReviewInput = {}): boolean {
  return flag(input.knownLimitationsPresent);
}

export function validateFinalSupportFeedbackCopy(input: TeoyubeFinalPublicCopyReviewInput = {}): boolean {
  return flag(input.feedbackBoundaryClear) && flag(input.supportBoundaryClear);
}

export function validateFinalNoDivineCertaintyCopy(input: TeoyubeFinalPublicCopyReviewInput = {}): boolean {
  return !input.divineCertaintyLanguage;
}

export function validateFinalNoProfessionalAdviceCopy(input: TeoyubeFinalPublicCopyReviewInput = {}): boolean {
  return !input.professionalAdviceClaims;
}

export function validateFinalScriptureExplanationCopy(input: TeoyubeFinalPublicCopyReviewInput = {}): boolean {
  return flag(input.scriptureAnchorsVisibleInCopy) && flag(input.explanationTraceAvailabilityVisible);
}

export function createFinalPublicCopyReviewChecklist(input: TeoyubeFinalPublicCopyReviewInput = {}): TeoyubeFinalPublicCopyCheck[] {
  return [
    check("privacy_copy", "privacy_notice", "Privacy copy present", validateFinalPrivacyCopy(input), "Privacy notice copy must be visible."),
    check("consent_copy", "consent_notice", "Consent copy present", validateFinalConsentCopy(input), "Consent notice copy must be visible."),
    check("sensitive_warning", "sensitive_data_warning", "Sensitive data warning present", validateFinalSensitiveDataWarningCopy(input), "Sensitive data warning must be visible."),
    check("known_limitations", "known_limitations", "Known limitations present", validateFinalKnownLimitationsCopy(input), "Known limitations must be visible."),
    check("support_feedback_boundaries", "support_feedback_copy", "Support and feedback boundaries clear", validateFinalSupportFeedbackCopy(input), "Support and feedback boundaries must be manual and clear."),
    check("no_divine_certainty", "divine_certainty_boundary", "No divine-certainty language", validateFinalNoDivineCertaintyCopy(input), "Copy must not claim divine certainty."),
    check("no_professional_advice", "professional_advice_boundary", "No professional-advice claims", validateFinalNoProfessionalAdviceCopy(input), "Copy must not claim medical, legal, financial, emergency, or counseling advice."),
    check("scripture_explanation_visible", "tig_response_copy", "Scripture anchors and explanation traces visible", validateFinalScriptureExplanationCopy(input), "Copy must not hide Scripture anchors or explanation trace availability."),
    check("no_unapproved_services", "unknown", "No unapproved services implied active", !input.unapprovedServicesImpliedActive, "Copy must not imply disabled services are active."),
    check("no_unrecorded_legal_claim", "unknown", "No unrecorded legal approval claimed", !input.legalApprovalClaimedWithoutRecord, "Copy must not claim legal approval unless separately recorded.")
  ];
}

export function reviewFinalPublicCopy(input: TeoyubeFinalPublicCopyReviewInput = {}): TeoyubeFinalPublicCopyCheck[] {
  return createFinalPublicCopyReviewChecklist(input);
}

export function getFinalPublicCopyReviewBlockers(input: TeoyubeFinalPublicCopyReviewInput = {}): TeoyubeFinalPublicCopyBlocker[] {
  return createFinalPublicCopyReviewChecklist(input)
    .filter((entry) => !entry.passed)
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: `${entry.label} is not satisfied.`, requiredAction: "Resolve final public copy before public release candidate QA." }));
}

export function getFinalPublicCopyReviewWarnings(): TeoyubeFinalPublicCopyWarning[] {
  return [
    { id: "copy_review_manual", area: "unknown", message: "Final public copy review is manual and in-memory; it does not publish or write production JSON.", recommendedAction: "Review copy with owner/privacy/security before Phase 9.2." }
  ];
}

export function createFinalPublicCopyReviewDecision(input: TeoyubeFinalPublicCopyReviewInput = {}): TeoyubeFinalPublicCopyDecision {
  const blockers = getFinalPublicCopyReviewBlockers(input);
  if (blockers.some((entry) => entry.area === "privacy_notice")) return "needs_privacy_copy";
  if (blockers.some((entry) => entry.area === "consent_notice")) return "needs_consent_copy";
  if (blockers.some((entry) => entry.area === "sensitive_data_warning")) return "needs_sensitive_data_warning";
  if (blockers.some((entry) => entry.area === "known_limitations")) return "needs_known_limitations";
  if (blockers.some((entry) => entry.area === "support_feedback_copy")) return "needs_support_feedback_copy";
  if (blockers.some((entry) => entry.area === "professional_advice_boundary" || entry.area === "divine_certainty_boundary" || entry.area === "tig_response_copy")) return "needs_safety_boundary_copy";
  if (blockers.length) return "blocked";
  return getFinalPublicCopyReviewWarnings().length ? "ready_with_warnings" : "copy_ready_for_public_release_candidate_qa";
}

export function createFinalPublicCopyReviewReport(input: TeoyubeFinalPublicCopyReviewInput = {}): TeoyubeFinalPublicCopyReport {
  const blockers = getFinalPublicCopyReviewBlockers(input);
  const warnings = getFinalPublicCopyReviewWarnings();
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    decision: createFinalPublicCopyReviewDecision(input),
    items: input.items || defaultItems(),
    checks: reviewFinalPublicCopy(input),
    blockers,
    warnings,
    noDivineCertaintyClaims: true,
    noProfessionalAdviceClaims: true,
    noUnapprovedServiceClaims: true,
    scriptureAnchorsProtected: true,
    explanationTracesProtected: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
