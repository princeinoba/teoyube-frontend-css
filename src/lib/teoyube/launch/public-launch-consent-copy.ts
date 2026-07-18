import type { TeoyubePublicConsentReviewItem } from "./public-launch-privacy-consent-contracts";

export type TeoyubePublicLaunchConsentCopy = {
  id: string;
  label: string;
  personalizationConsent: string;
  sessionOnlyConsent: string;
  feedbackConsent: string;
  analyticsConsentPlaceholder: string;
  persistenceConsentPlaceholder: string;
  liveAiConsentPlaceholder: string;
  disablePersonalization: string;
  resetExportDelete: string;
  productionPersistenceConnected: false;
  externalAnalyticsConnected: false;
  liveAiOrchestrationEnabled: false;
  hiddenPersonalizationAllowed: false;
  generatedAt: string;
};

export function getPersonalizationConsentCopy(): string {
  return "Personalization preview means Teoyube may use visible, consent-aware signals to adjust recommendations while keeping Scripture anchors and explanation paths available.";
}

export function getSessionOnlyConsentCopy(): string {
  return "Session-only personalization means preferences may shape the current experience without production persistence unless a later reviewed persistence strategy is enabled.";
}

export function getFeedbackConsentCopy(): string {
  return "Feedback should not include sensitive personal information and may be reviewed manually for clarity, safety, layout, Scripture visibility, explanation paths, and fallback behavior.";
}

export function getAnalyticsConsentPlaceholderCopy(): string {
  return "External analytics are not connected yet. Any future analytics connection requires explicit payload, consent, privacy, and provider review.";
}

export function getPersistenceConsentPlaceholderCopy(): string {
  return "Production database persistence is not connected yet. Any future persistence requires explicit privacy, consent, retention, export, and deletion review.";
}

export function getLiveAiConsentPlaceholderCopy(): string {
  return "Live AI orchestration is not enabled yet. Any future live AI use requires explicit safety, fallback, cost, provider, and consent review.";
}

export function getDisablePersonalizationCopy(): string {
  return "Users should be able to disable personalization and continue using Scripture-anchored, fallback-safe Teoyube surfaces.";
}

export function getResetExportDeleteCopy(): string {
  return "Reset, export, and delete controls are simulated or local until production persistence is explicitly connected and reviewed.";
}

export function createPublicLaunchConsentCopy(): TeoyubePublicLaunchConsentCopy {
  return {
    id: "public_launch_consent_copy_5_2",
    label: "Public Launch Consent Copy",
    personalizationConsent: getPersonalizationConsentCopy(),
    sessionOnlyConsent: getSessionOnlyConsentCopy(),
    feedbackConsent: getFeedbackConsentCopy(),
    analyticsConsentPlaceholder: getAnalyticsConsentPlaceholderCopy(),
    persistenceConsentPlaceholder: getPersistenceConsentPlaceholderCopy(),
    liveAiConsentPlaceholder: getLiveAiConsentPlaceholderCopy(),
    disablePersonalization: getDisablePersonalizationCopy(),
    resetExportDelete: getResetExportDeleteCopy(),
    productionPersistenceConnected: false,
    externalAnalyticsConnected: false,
    liveAiOrchestrationEnabled: false,
    hiddenPersonalizationAllowed: false,
    generatedAt: new Date().toISOString()
  };
}

export function createConsentCopyReviewChecklist(): TeoyubePublicConsentReviewItem[] {
  return [
    { id: "consent_personalization_preview", noticeType: "personalization_notice", surface: "personalization_preview", label: "Personalization preview consent copy exists", required: true, complete: true, status: "ready_for_review" },
    { id: "consent_session_only", noticeType: "consent_notice", surface: "consent_controls", label: "Session-only personalization copy exists", required: true, complete: true, status: "ready_for_review" },
    { id: "consent_feedback", noticeType: "feedback_notice", surface: "feedback_controls", label: "Feedback consent copy exists", required: true, complete: true, status: "ready_for_review" },
    { id: "consent_disabled_services", noticeType: "public_launch_limitation_notice", surface: "privacy_terms_surface", label: "Disabled analytics, persistence, and live AI placeholders exist", required: true, complete: true, status: "ready_for_review" },
    { id: "consent_disable_reset", noticeType: "consent_notice", surface: "consent_controls", label: "Disable/reset/export/delete copy exists", required: true, complete: true, status: "ready_for_review" }
  ];
}

export function createConsentCopyReport(copy: TeoyubePublicLaunchConsentCopy = createPublicLaunchConsentCopy()) {
  const checklist = createConsentCopyReviewChecklist();
  const blockers = [
    ...checklist.filter((entry) => entry.required && !entry.complete).map((entry) => ({ id: entry.id, label: entry.label, reason: "Required consent copy item is incomplete.", requiredAction: "Complete consent copy before public launch.", riskLevel: "critical" as const })),
    copy.hiddenPersonalizationAllowed ? { id: "consent_hidden_personalization", label: copy.label, reason: "Consent copy must not allow hidden personalization.", requiredAction: "Keep personalization visible and consent-aware.", riskLevel: "critical" as const } : undefined,
    copy.productionPersistenceConnected ? { id: "consent_persistence_connected", label: copy.label, reason: "Consent copy must not imply persistence is connected.", requiredAction: "Keep persistence placeholder accurate.", riskLevel: "critical" as const } : undefined,
    copy.externalAnalyticsConnected ? { id: "consent_analytics_connected", label: copy.label, reason: "Consent copy must not imply analytics are connected.", requiredAction: "Keep analytics placeholder accurate.", riskLevel: "critical" as const } : undefined,
    copy.liveAiOrchestrationEnabled ? { id: "consent_live_ai_enabled", label: copy.label, reason: "Consent copy must not imply live AI is enabled.", requiredAction: "Keep live AI placeholder accurate.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    copy,
    checklist,
    blockers,
    warnings: [{ id: "consent_future_changes_review", label: copy.label, message: "Future persistence, analytics, or live AI changes require explicit review and consent strategy.", recommendedAction: "Review again before provider connection.", riskLevel: "medium" as const }],
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
