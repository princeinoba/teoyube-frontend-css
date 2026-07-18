import { createAiTigTransparencyCopyReport } from "./public-launch-ai-tig-transparency-copy";
import { createConsentCopyReport } from "./public-launch-consent-copy";
import { createPublicFeedbackNoticeCopy, createFeedbackNoticeCopyReport } from "./public-launch-feedback-notice-copy";
import { createPublicLaunchKnownLimitationsReport } from "./public-launch-known-limitations";
import { createPublicCopyOwnerReviewRecord, createPublicCopyOwnerReviewReport } from "./public-launch-copy-owner-review";
import { createPrivacyNoticeCopyReport } from "./public-launch-privacy-notice-copy";
import { createSensitiveInformationWarningCopy, createSensitiveInfoCopyReport } from "./public-launch-sensitive-info-copy";
import { createTermsCopyReport } from "./public-launch-terms-copy";
import type { TeoyubeFinalPublicGoNoGoCheck, TeoyubeFinalPublicGoNoGoDecision, TeoyubeFinalPublicLaunchBlocker, TeoyubeFinalPublicLaunchWarning } from "./final-public-go-no-go-contracts";

export type TeoyubeFinalPublicPrivacyLegalInput = {
  legalFinalApprovalClaimed?: boolean;
  legalApprovalRecorded?: boolean;
  publicLaunchLimitationsVisible?: boolean;
  sensitiveInfoWarningVisible?: boolean;
  professionalAdviceBoundaryVisible?: boolean;
  divineCertaintyClaimed?: boolean;
};

function check(id: string, label: string, complete: boolean, details: string): TeoyubeFinalPublicGoNoGoCheck {
  return { id, label, category: "privacy", required: true, complete, status: complete ? "ready" : "blocked", launchCritical: true, details };
}

function blocker(id: string, category: "privacy" | "terms" | "consent" | "public_copy", reason: string): TeoyubeFinalPublicLaunchBlocker {
  return { id, label: id.replace(/_/g, " "), category, riskLevel: "critical", reason, requiredAction: "Resolve final public privacy/legal readiness before public launch execution preparation." };
}

export function createFinalPublicPrivacyLegalChecklist(input: TeoyubeFinalPublicPrivacyLegalInput = {}): TeoyubeFinalPublicGoNoGoCheck[] {
  return [
    check("final_privacy_notice_exists", "Privacy notice draft exists", createPrivacyNoticeCopyReport().ready, "Privacy notice draft is available for public review."),
    check("final_terms_draft_exists", "Terms draft exists", createTermsCopyReport().ready, "Terms draft is available and does not claim divine certainty."),
    check("final_consent_copy_exists", "Consent copy exists", createConsentCopyReport().ready, "Consent copy is available for personalization and feedback surfaces."),
    check("final_sensitive_warning_exists", "Sensitive information warning exists", createSensitiveInfoCopyReport().ready && input.sensitiveInfoWarningVisible !== false, "Sensitive information warning remains visible."),
    check("final_ai_tig_copy_exists", "AI/TIG transparency copy exists", createAiTigTransparencyCopyReport().ready, "AI/TIG transparency copy explains Scripture anchors, confidence, and fallback."),
    check("final_feedback_notice_exists", "Feedback notice exists", createFeedbackNoticeCopyReport(createPublicFeedbackNoticeCopy()).ready, "Feedback notice explains manual review and no hidden personalization."),
    check("final_no_false_legal_claim", "No unrecorded legal-final claim", !(input.legalFinalApprovalClaimed && !input.legalApprovalRecorded), "Legal approval is not claimed unless recorded."),
    check("final_limitations_visible", "Public launch limitations visible", input.publicLaunchLimitationsVisible !== false, "Known limitations remain visible."),
    check("final_no_divine_certainty", "No divine certainty claimed", !input.divineCertaintyClaimed, "Public copy does not claim divine certainty."),
    check("final_professional_boundary", "Professional advice boundary present", input.professionalAdviceBoundaryVisible !== false, "Professional-care boundary remains visible.")
  ];
}

export function getFinalPublicPrivacyLegalBlockers(input: TeoyubeFinalPublicPrivacyLegalInput = {}): TeoyubeFinalPublicLaunchBlocker[] {
  const privacy = createPrivacyNoticeCopyReport();
  const terms = createTermsCopyReport();
  const consent = createConsentCopyReport();
  const ai = createAiTigTransparencyCopyReport();
  const sensitive = createSensitiveInfoCopyReport(createSensitiveInformationWarningCopy());
  const feedback = createFeedbackNoticeCopyReport(createPublicFeedbackNoticeCopy());
  const owner = createPublicCopyOwnerReviewReport(createPublicCopyOwnerReviewRecord({ legalFinalApprovalClaimed: Boolean(input.legalFinalApprovalClaimed), legalApprovalRecorded: Boolean(input.legalApprovalRecorded) }));
  return [
    ...privacy.blockers.map((entry) => blocker(entry.id, "privacy", entry.reason)),
    ...terms.blockers.map((entry) => blocker(entry.id, "terms", entry.reason)),
    ...consent.blockers.map((entry) => blocker(entry.id, "consent", entry.reason)),
    ...ai.blockers.map((entry) => blocker(entry.id, "public_copy", entry.reason)),
    ...sensitive.blockers.map((entry) => blocker(entry.id, "privacy", entry.reason)),
    ...feedback.blockers.map((entry) => blocker(entry.id, "feedback" as "public_copy", entry.reason)),
    ...owner.blockers.map((entry) => blocker(entry.id, "public_copy", entry.reason)),
    input.legalFinalApprovalClaimed && !input.legalApprovalRecorded ? blocker("final_privacy_legal_false_approval", "terms", "Legal final approval is claimed without recorded approval.") : undefined,
    input.publicLaunchLimitationsVisible === false ? blocker("final_privacy_limitations_hidden", "public_copy", "Public launch limitations are hidden.") : undefined,
    input.sensitiveInfoWarningVisible === false ? blocker("final_privacy_sensitive_warning_hidden", "privacy", "Sensitive information warning is hidden.") : undefined,
    input.divineCertaintyClaimed ? blocker("final_privacy_divine_certainty_claim", "terms", "Public copy claims divine certainty.") : undefined,
    input.professionalAdviceBoundaryVisible === false ? blocker("final_privacy_professional_boundary_missing", "terms", "Professional advice boundary is missing.") : undefined
  ].filter(Boolean) as TeoyubeFinalPublicLaunchBlocker[];
}

export function getFinalPublicPrivacyLegalWarnings(input: TeoyubeFinalPublicPrivacyLegalInput = {}): TeoyubeFinalPublicLaunchWarning[] {
  const owner = createPublicCopyOwnerReviewReport(createPublicCopyOwnerReviewRecord({ legalFinalApprovalClaimed: Boolean(input.legalFinalApprovalClaimed), legalApprovalRecorded: Boolean(input.legalApprovalRecorded) }));
  return [
    ...createPrivacyNoticeCopyReport().warnings.map((entry) => ({ id: entry.id, label: entry.label, category: "privacy" as const, riskLevel: entry.riskLevel, message: entry.message, recommendedAction: entry.recommendedAction })),
    ...createTermsCopyReport().warnings.map((entry) => ({ id: entry.id, label: entry.label, category: "terms" as const, riskLevel: entry.riskLevel, message: entry.message, recommendedAction: entry.recommendedAction })),
    ...owner.warnings.map((entry) => ({ id: entry.id, label: entry.label, category: "terms" as const, riskLevel: entry.riskLevel, message: entry.message, recommendedAction: entry.recommendedAction }))
  ];
}

export function createFinalPublicPrivacyLegalDecision(input: TeoyubeFinalPublicPrivacyLegalInput = {}): TeoyubeFinalPublicGoNoGoDecision {
  const blockers = getFinalPublicPrivacyLegalBlockers(input);
  if (blockers.length > 0) return "needs_privacy_review";
  return "go_for_public_launch_execution_preparation";
}

export function evaluateFinalPublicPrivacyLegalReadiness(input: TeoyubeFinalPublicPrivacyLegalInput = {}) {
  const blockers = getFinalPublicPrivacyLegalBlockers(input);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createFinalPublicPrivacyLegalDecision(input),
    checklist: createFinalPublicPrivacyLegalChecklist(input),
    blockers,
    warnings: getFinalPublicPrivacyLegalWarnings(input)
  };
}

export function createFinalPublicPrivacyLegalReport(input: TeoyubeFinalPublicPrivacyLegalInput = {}) {
  const evaluation = evaluateFinalPublicPrivacyLegalReadiness(input);
  return {
    ...evaluation,
    knownLimitationsReport: createPublicLaunchKnownLimitationsReport(),
    noLegalFinalApprovalClaimedWithoutRecord: !(input.legalFinalApprovalClaimed && !input.legalApprovalRecorded),
    publicLaunchLimitationsVisible: input.publicLaunchLimitationsVisible !== false,
    sensitiveInformationWarningVisible: input.sensitiveInfoWarningVisible !== false,
    noDivineCertaintyClaimed: !input.divineCertaintyClaimed,
    professionalAdviceBoundaryVisible: input.professionalAdviceBoundaryVisible !== false,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
