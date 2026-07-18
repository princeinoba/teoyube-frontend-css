export type TeoyubePublicFeedbackNoticeCopy = {
  id: string;
  label: string;
  feedbackUse: string;
  manualFeedback: string;
  feedbackPrivacy: string;
  notPersonalizationByDefault: string;
  feedbackReview: string;
  analyticsConnected: false;
  databasePersistenceConnected: false;
  hiddenPersonalizationByDefault: false;
  generatedAt: string;
};

export function getFeedbackUseCopy(): string {
  return "Feedback may help improve clarity, safety, layout, Scripture visibility, explanation paths, and fallback behavior.";
}

export function getManualFeedbackCopy(): string {
  return "Feedback may be reviewed manually and is not collected automatically by this 5.2 preparation layer.";
}

export function getFeedbackPrivacyCopy(): string {
  return "Feedback should not include sensitive personal information.";
}

export function getFeedbackNotPersonalizationByDefaultCopy(): string {
  return "Feedback is not automatically used for hidden personalization by default.";
}

export function getFeedbackReviewCopy(): string {
  return "Feedback review should preserve Scripture anchors, explanation paths, consent controls, privacy boundaries, and fallback safety.";
}

export function createPublicFeedbackNoticeCopy(): TeoyubePublicFeedbackNoticeCopy {
  return {
    id: "public_launch_feedback_notice_copy_5_2",
    label: "Public Launch Feedback Notice Copy",
    feedbackUse: getFeedbackUseCopy(),
    manualFeedback: getManualFeedbackCopy(),
    feedbackPrivacy: getFeedbackPrivacyCopy(),
    notPersonalizationByDefault: getFeedbackNotPersonalizationByDefaultCopy(),
    feedbackReview: getFeedbackReviewCopy(),
    analyticsConnected: false,
    databasePersistenceConnected: false,
    hiddenPersonalizationByDefault: false,
    generatedAt: new Date().toISOString()
  };
}

export function createFeedbackNoticeReviewChecklist() {
  return [
    { id: "feedback_use", label: "Feedback use described", required: true, complete: true },
    { id: "feedback_manual_review", label: "Manual feedback review described", required: true, complete: true },
    { id: "feedback_privacy", label: "Feedback privacy warning exists", required: true, complete: true },
    { id: "feedback_not_hidden_personalization", label: "No hidden personalization by default", required: true, complete: true },
    { id: "feedback_disabled_services", label: "Analytics and persistence disabled states described", required: true, complete: true }
  ];
}

export function createFeedbackNoticeCopyReport(copy: TeoyubePublicFeedbackNoticeCopy = createPublicFeedbackNoticeCopy()) {
  const blockers = [
    copy.analyticsConnected ? { id: "feedback_notice_analytics_connected", label: copy.label, reason: "Feedback notice must not imply analytics are connected.", requiredAction: "Keep analytics disabled copy accurate.", riskLevel: "critical" as const } : undefined,
    copy.databasePersistenceConnected ? { id: "feedback_notice_persistence_connected", label: copy.label, reason: "Feedback notice must not imply persistence is connected.", requiredAction: "Keep persistence disabled copy accurate.", riskLevel: "critical" as const } : undefined,
    copy.hiddenPersonalizationByDefault ? { id: "feedback_notice_hidden_personalization", label: copy.label, reason: "Feedback notice must not imply hidden personalization.", requiredAction: "Keep feedback separate from hidden personalization.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    copy,
    checklist: createFeedbackNoticeReviewChecklist(),
    blockers,
    warnings: [],
    noFeedbackCollectedAutomatically: true,
    noHiddenPersonalization: true,
    noExternalAnalyticsConnected: true,
    noProductionPersistenceConnected: true,
    noPublicLaunchPerformed: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
