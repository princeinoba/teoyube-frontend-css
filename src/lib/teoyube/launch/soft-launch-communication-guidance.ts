export function getSoftLaunchParticipantGuidance(): string[] {
  return [
    "This is a limited Teoyube preview and soft launch readiness review.",
    "Some features may be incomplete or manually reviewed.",
    "Please do not submit sensitive personal information in feedback.",
    "Scripture anchors and explanation paths should be visible in usable responses.",
    "Report missing Scripture, explanation, fallback, consent, or safety issues."
  ];
}

export function getSoftLaunchKnownLimitationsNotice(): string[] {
  return [
    "Feedback is manual for now.",
    "Production database persistence is not connected.",
    "External analytics are not connected.",
    "Live AI orchestration is not enabled.",
    "Personalization is preview-safe and consent-aware.",
    "Service workers and native mobile builds are not included."
  ];
}

export function getSoftLaunchFeedbackInstructions(): string[] {
  return [
    "Describe the surface you reviewed.",
    "Use redacted notes instead of raw private text.",
    "Flag missing Scripture anchors or explanation paths immediately.",
    "Flag unsafe fallback, consent, mobile, accessibility, or privacy concerns immediately.",
    "Positive feedback and feature requests can be summarized manually."
  ];
}

export function getSoftLaunchPrivacyNoticeDraft(): string[] {
  return [
    "This version uses manual feedback review.",
    "Do not include sensitive personal information in feedback.",
    "Feedback should not become hidden personalization.",
    "Database sync is not connected in this step.",
    "External analytics sending is not active."
  ];
}

export function getSoftLaunchSafetyNoticeDraft(): string[] {
  return [
    "Teoyube should remain Scripture-anchored and explanation-aware.",
    "Teoyube does not claim divine certainty.",
    "Fallback responses should remain safe and clear.",
    "Spiritual content feedback should be reviewed carefully and respectfully."
  ];
}

export function createSoftLaunchCommunicationPacket() {
  return {
    id: "soft_launch_communication_packet_1_8",
    participantGuidance: getSoftLaunchParticipantGuidance(),
    knownLimitationsNotice: getSoftLaunchKnownLimitationsNotice(),
    feedbackInstructions: getSoftLaunchFeedbackInstructions(),
    privacyNoticeDraft: getSoftLaunchPrivacyNoticeDraft(),
    safetyNoticeDraft: getSoftLaunchSafetyNoticeDraft(),
    channel: "manual_only",
    messagesSent: false,
    usersContacted: false,
    generatedAt: new Date().toISOString()
  };
}
