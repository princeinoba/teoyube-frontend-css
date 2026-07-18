import type { TeoyubePublicTermsReviewItem } from "./public-launch-privacy-consent-contracts";

export type TeoyubePublicLaunchTermsDraft = {
  id: string;
  label: string;
  sections: string[];
  draftOnly: true;
  notLegalAdvice: true;
  legalReviewRequired: true;
  claimsDivineCertainty: false;
  providesProfessionalAdvice: false;
  legalFinalApprovalClaimed: false;
  generatedAt: string;
};

export function getSpiritualGuidanceTermsSection(): string {
  return "Teoyube provides Scripture-centered encouragement and educational/devotional support. Users should review recommendations thoughtfully.";
}

export function getNoDivineCertaintyTermsSection(): string {
  return "Teoyube does not claim divine certainty. Confidence labels, Scripture anchors, and explanation paths are transparency tools, not claims that a response is a direct divine instruction.";
}

export function getNoProfessionalAdviceTermsSection(): string {
  return "Teoyube does not provide medical, legal, financial, emergency, or professional counseling advice. Users should seek appropriate professional or emergency help where needed.";
}

export function getUserResponsibilityTermsSection(): string {
  return "Users are responsible for how they interpret and act on Teoyube content. Spiritual encouragement should not replace professional care where professional help is needed.";
}

export function getPublicLaunchLimitationsTermsSection(): string {
  return "Public launch may still have limitations. Personalization, where available, is consent-aware and user-controlled; production persistence, external analytics, and live AI are not active unless later explicitly enabled.";
}

export function getTermsOfUseSections(): string[] {
  return [
    getSpiritualGuidanceTermsSection(),
    getNoDivineCertaintyTermsSection(),
    getNoProfessionalAdviceTermsSection(),
    "Scripture anchors and explanation paths are provided for transparency.",
    "Personalization, where available, is consent-aware and should be user-controlled.",
    getUserResponsibilityTermsSection(),
    getPublicLaunchLimitationsTermsSection(),
    "Final terms require human/legal review. This draft is not final legal advice."
  ];
}

export function createPublicLaunchTermsDraft(): TeoyubePublicLaunchTermsDraft {
  return {
    id: "public_launch_terms_draft_5_2",
    label: "Public Launch Terms of Use Draft",
    sections: getTermsOfUseSections(),
    draftOnly: true,
    notLegalAdvice: true,
    legalReviewRequired: true,
    claimsDivineCertainty: false,
    providesProfessionalAdvice: false,
    legalFinalApprovalClaimed: false,
    generatedAt: new Date().toISOString()
  };
}

export function createTermsCopyReviewChecklist(): TeoyubePublicTermsReviewItem[] {
  return [
    { id: "terms_scripture_centered_support", noticeType: "terms_of_use", label: "Scripture-centered support described", required: true, complete: true, status: "ready_for_review", requiresLegalReview: true },
    { id: "terms_no_divine_certainty", noticeType: "terms_of_use", label: "No divine certainty claim", required: true, complete: true, status: "ready_for_review", requiresLegalReview: true },
    { id: "terms_no_professional_advice", noticeType: "terms_of_use", label: "No professional advice disclaimer", required: true, complete: true, status: "ready_for_review", requiresLegalReview: true },
    { id: "terms_user_responsibility", noticeType: "terms_of_use", label: "User responsibility described", required: true, complete: true, status: "ready_for_review", requiresLegalReview: true },
    { id: "terms_public_limitations", noticeType: "public_launch_limitation_notice", label: "Public launch limitations described", required: true, complete: true, status: "ready_for_review", requiresLegalReview: true }
  ];
}

export function createTermsCopyReport(draft: TeoyubePublicLaunchTermsDraft = createPublicLaunchTermsDraft()) {
  const checklist = createTermsCopyReviewChecklist();
  const blockers = [
    ...checklist.filter((entry) => entry.required && !entry.complete).map((entry) => ({ id: entry.id, label: entry.label, reason: "Required terms draft item is incomplete.", requiredAction: "Complete terms draft before public launch.", riskLevel: "critical" as const })),
    draft.claimsDivineCertainty ? { id: "terms_claims_divine_certainty", label: draft.label, reason: "Terms draft must not claim divine certainty.", requiredAction: "Remove divine certainty claim.", riskLevel: "critical" as const } : undefined,
    draft.providesProfessionalAdvice ? { id: "terms_professional_advice", label: draft.label, reason: "Terms draft must not present Teoyube as professional advice.", requiredAction: "Restore professional advice disclaimer.", riskLevel: "critical" as const } : undefined,
    draft.legalFinalApprovalClaimed ? { id: "terms_legal_final_claimed", label: draft.label, reason: "Legal final approval must not be claimed unless manually recorded.", requiredAction: "Remove legal-final approval claim.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    draft,
    checklist,
    blockers,
    warnings: [{ id: "terms_legal_review_required", label: draft.label, message: "Terms are draft copy and require human/legal review.", recommendedAction: "Review before public launch.", riskLevel: "medium" as const }],
    draftOnly: true,
    notLegalAdvice: true,
    noLegalFinalApprovalClaimed: !draft.legalFinalApprovalClaimed,
    noPublicLaunchPerformed: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
