import type { TeoyubePublicPrivacyReviewItem } from "./public-launch-privacy-consent-contracts";

export type TeoyubePublicLaunchPrivacyNoticeDraft = {
  id: string;
  label: string;
  sections: string[];
  dataUseSummary: string;
  personalizationSummary: string;
  feedbackSummary: string;
  analyticsSummary: string;
  persistenceSummary: string;
  liveAiSummary: string;
  draftOnly: true;
  notLegalAdvice: true;
  legalReviewRequired: true;
  rawSensitiveTextStoredByDefault: false;
  productionPersistenceConnected: false;
  externalAnalyticsConnected: false;
  liveAiOrchestrationEnabled: false;
  generatedAt: string;
};

export function getPrivacyNoticeDataUseSummary(): string {
  return "Teoyube is Scripture-centered and explanation-based. Public launch copy should explain what users see, how recommendations are anchored, and which data flows remain disabled until later explicit review.";
}

export function getPrivacyNoticePersonalizationSummary(): string {
  return "Personalization remains consent-aware, visible, reversible, and preview-safe. Hidden personalization must not be introduced, and raw sensitive text is not stored by default.";
}

export function getPrivacyNoticeFeedbackSummary(): string {
  return "Feedback is manual or explicitly controlled unless future systems are connected. Users should not include sensitive personal information in feedback.";
}

export function getPrivacyNoticeAnalyticsSummary(): string {
  return "External analytics are not connected or sent unless later explicitly enabled after payload, consent, and provider review.";
}

export function getPrivacyNoticePersistenceSummary(): string {
  return "Production database persistence is not connected unless later explicitly enabled after privacy, consent, retention, export, and deletion review.";
}

export function getPrivacyNoticeLiveAiSummary(): string {
  return "Live AI orchestration is not enabled unless later explicitly added with safety, fallback, cost, provider, and consent controls.";
}

export function getPrivacyNoticeSections(): string[] {
  return [
    "Teoyube provides Scripture-centered encouragement with visible Scripture anchors and explanation paths.",
    "Scripture anchors and explanation paths are part of Teoyube's transparency model.",
    "Users should not submit sensitive personal information unless future storage and privacy terms explicitly allow it.",
    getPrivacyNoticePersonalizationSummary(),
    getPrivacyNoticeFeedbackSummary(),
    getPrivacyNoticeAnalyticsSummary(),
    getPrivacyNoticePersistenceSummary(),
    getPrivacyNoticeLiveAiSummary(),
    "This draft is for human and legal review and is not final legal advice."
  ];
}

export function createPublicLaunchPrivacyNoticeDraft(): TeoyubePublicLaunchPrivacyNoticeDraft {
  return {
    id: "public_launch_privacy_notice_draft_5_2",
    label: "Public Launch Privacy Notice Draft",
    sections: getPrivacyNoticeSections(),
    dataUseSummary: getPrivacyNoticeDataUseSummary(),
    personalizationSummary: getPrivacyNoticePersonalizationSummary(),
    feedbackSummary: getPrivacyNoticeFeedbackSummary(),
    analyticsSummary: getPrivacyNoticeAnalyticsSummary(),
    persistenceSummary: getPrivacyNoticePersistenceSummary(),
    liveAiSummary: getPrivacyNoticeLiveAiSummary(),
    draftOnly: true,
    notLegalAdvice: true,
    legalReviewRequired: true,
    rawSensitiveTextStoredByDefault: false,
    productionPersistenceConnected: false,
    externalAnalyticsConnected: false,
    liveAiOrchestrationEnabled: false,
    generatedAt: new Date().toISOString()
  };
}

export function createPrivacyNoticeReviewChecklist(): TeoyubePublicPrivacyReviewItem[] {
  return [
    { id: "privacy_scripture_explanation", noticeType: "privacy_notice", label: "Scripture and explanation transparency described", required: true, complete: true, status: "ready_for_review", requiresLegalReview: false },
    { id: "privacy_sensitive_info_warning", noticeType: "sensitive_information_warning", label: "Sensitive information warning included", required: true, complete: true, status: "ready_for_review", requiresLegalReview: true },
    { id: "privacy_personalization_consent", noticeType: "personalization_notice", label: "Consent-aware personalization described", required: true, complete: true, status: "ready_for_review", requiresLegalReview: true },
    { id: "privacy_disabled_services", noticeType: "public_launch_limitation_notice", label: "Persistence, analytics, and live AI disabled states described", required: true, complete: true, status: "ready_for_review", requiresLegalReview: true },
    { id: "privacy_not_legal_final", noticeType: "privacy_notice", label: "Draft is not final legal advice", required: true, complete: true, status: "ready_for_review", requiresLegalReview: true }
  ];
}

export function createPrivacyNoticeCopyReport(draft: TeoyubePublicLaunchPrivacyNoticeDraft = createPublicLaunchPrivacyNoticeDraft()) {
  const checklist = createPrivacyNoticeReviewChecklist();
  const blockers = checklist
    .filter((entry) => entry.required && !entry.complete)
    .map((entry) => ({ id: entry.id, label: entry.label, reason: "Required privacy notice draft item is incomplete.", requiredAction: "Complete privacy notice draft before public launch.", riskLevel: "critical" as const }));
  return {
    valid: blockers.length === 0 && draft.draftOnly && draft.notLegalAdvice,
    ready: blockers.length === 0,
    draft,
    checklist,
    blockers,
    warnings: [{ id: "privacy_notice_legal_review_required", label: draft.label, message: "Privacy notice is draft copy and requires human/legal review.", recommendedAction: "Review during Public Launch Preparation 5.2 and before public launch.", riskLevel: "medium" as const }],
    draftOnly: true,
    notLegalAdvice: true,
    noLegalFinalApprovalClaimed: true,
    noPublicLaunchPerformed: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
