export type TeoyubeLimitedSoftLaunchCommunicationPacket = {
  id: string;
  label: string;
  participantNotice: string;
  knownLimitationsNotice: string;
  feedbackInstructions: string;
  privacyNotice: string;
  safetyNotice: string;
  messagesSent: false;
  usersContacted: false;
  generatedAt: string;
};

export function getLimitedSoftLaunchParticipantNotice(): string {
  return "Teoyube is preparing for a limited soft launch, not a full public launch. Participation should remain small, manually approved, and focused on Scripture Intelligence review.";
}

export function getLimitedSoftLaunchKnownLimitationsNotice(): string {
  return "Some features remain limited. Production database persistence, external analytics, live AI orchestration, service workers, native mobile builds, and monitoring providers are not connected yet.";
}

export function getLimitedSoftLaunchFeedbackInstructions(): string {
  return "Share feedback manually by surface. Please avoid sensitive personal information. Scripture anchor, explanation path, fallback, consent, mobile, accessibility, and privacy concerns should be marked clearly.";
}

export function getLimitedSoftLaunchPrivacyNotice(): string {
  return "Feedback is manual for this phase. Teoyube should not request sensitive personal information, store raw sensitive text by default, send external analytics, or write feedback to production persistence.";
}

export function getLimitedSoftLaunchSafetyNotice(): string {
  return "Every usable response should remain Scripture-anchored, explainable, confidence-aware, fallback-safe, consent-aware, and free from divine certainty claims about a user's private future.";
}

export function createLimitedSoftLaunchCommunicationPacket(): TeoyubeLimitedSoftLaunchCommunicationPacket {
  return {
    id: "limited_soft_launch_communication_packet",
    label: "Limited Soft Launch Communication Packet Draft",
    participantNotice: getLimitedSoftLaunchParticipantNotice(),
    knownLimitationsNotice: getLimitedSoftLaunchKnownLimitationsNotice(),
    feedbackInstructions: getLimitedSoftLaunchFeedbackInstructions(),
    privacyNotice: getLimitedSoftLaunchPrivacyNotice(),
    safetyNotice: getLimitedSoftLaunchSafetyNotice(),
    messagesSent: false,
    usersContacted: false,
    generatedAt: new Date().toISOString()
  };
}
