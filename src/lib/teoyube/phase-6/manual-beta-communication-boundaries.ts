export type TeoyubeManualBetaCommunicationBoundaryRule = {
  id: string;
  label: string;
  required: true;
  satisfied: boolean;
  details: string;
};

export type TeoyubeManualBetaCommunicationBoundaryReport = {
  valid: boolean;
  rules: TeoyubeManualBetaCommunicationBoundaryRule[];
  noticeDraft: string;
  participantInstructionDraft: string;
  knownLimitationsDraft: string;
  blockers: string[];
  warnings: string[];
  draftsArePlainTextOnly: true;
  draftsAreNotSentByCode: true;
  noAutomaticUserContact: true;
  noMassEmail: true;
  noSms: true;
  noNotificationSending: true;
  noAnalyticsTracking: true;
  noSensitiveInformationCollection: true;
  inMemoryOnly: true;
  generatedAt: string;
};

export type TeoyubeManualBetaCommunicationBoundaryInput = Partial<{
  automaticUserContactEnabled: boolean;
  massEmailEnabled: boolean;
  smsEnabled: boolean;
  notificationSendingEnabled: boolean;
  analyticsTrackingEnabled: boolean;
  sensitiveInformationCollectionEnabled: boolean;
  privacyConsentReminderIncluded: boolean;
  knownLimitationsIncluded: boolean;
  professionalAdviceBoundaryIncluded: boolean;
  divineCertaintyBoundaryIncluded: boolean;
  manualFeedbackRouteIncluded: boolean;
}>;

function now(): string {
  return new Date().toISOString();
}

function rule(id: string, label: string, satisfied: boolean, details: string): TeoyubeManualBetaCommunicationBoundaryRule {
  return { id, label, required: true, satisfied, details };
}

export function createManualBetaCommunicationBoundaryRules(input: TeoyubeManualBetaCommunicationBoundaryInput = {}): TeoyubeManualBetaCommunicationBoundaryRule[] {
  return [
    rule("no_automatic_user_contact", "No automatic user contact", !input.automaticUserContactEnabled, "Communication is drafted only and must be sent manually outside code."),
    rule("no_mass_email", "No mass email", !input.massEmailEnabled, "No mass email tooling is used."),
    rule("no_sms", "No SMS", !input.smsEnabled, "No SMS is sent by code."),
    rule("no_notification_sending", "No notification sending", !input.notificationSendingEnabled, "No notification provider is connected."),
    rule("no_analytics_tracking", "No analytics tracking", !input.analyticsTrackingEnabled, "No analytics events are sent."),
    rule("no_sensitive_information_collection", "No sensitive information collection", !input.sensitiveInformationCollectionEnabled, "Drafts warn participants not to submit sensitive personal information."),
    rule("privacy_consent_reminder", "Privacy/consent reminder included", input.privacyConsentReminderIncluded !== false, "Drafts include a privacy and consent reminder."),
    rule("known_limitations", "Known limitations included", input.knownLimitationsIncluded !== false, "Drafts include known limitations."),
    rule("not_professional_advice", "Professional advice boundary included", input.professionalAdviceBoundaryIncluded !== false, "Drafts state that Teoyube is not professional advice."),
    rule("no_divine_certainty", "No divine-certainty boundary included", input.divineCertaintyBoundaryIncluded !== false, "Drafts state that Teoyube does not claim divine certainty."),
    rule("manual_feedback_route", "Manual feedback route included", input.manualFeedbackRouteIncluded !== false, "Drafts point to an owner-approved manual feedback route.")
  ];
}

export function validateManualBetaCommunicationBoundaries(input: TeoyubeManualBetaCommunicationBoundaryInput = {}): string[] {
  return createManualBetaCommunicationBoundaryRules(input)
    .filter((entry) => entry.required && !entry.satisfied)
    .map((entry) => `${entry.label}: ${entry.details}`);
}

export function createManualBetaCommunicationNoticeDraft(_input: TeoyubeManualBetaCommunicationBoundaryInput = {}): string {
  return [
    "Teoyube controlled beta planning notice:",
    "Participation is manual and limited. The app will not invite, contact, track, or collect feedback from you automatically.",
    "Please do not share sensitive personal, emergency, medical, legal, financial, or crisis information.",
    "Teoyube offers devotional encouragement and reflection support. It is not professional advice and does not claim divine certainty.",
    "Use only the owner-approved manual feedback route, and stop participation at any time if something feels unsafe or unclear."
  ].join("\n");
}

export function createManualBetaParticipantInstructionDraft(_input: TeoyubeManualBetaCommunicationBoundaryInput = {}): string {
  return [
    "Manual participant instruction draft:",
    "Review the beta scope, privacy/consent reminder, known limitations, and scenario list before starting.",
    "Watch for Scripture anchors, explanation traces, fallback states, confidence labels, mobile behavior, and privacy notices.",
    "Report issues manually through the approved route. Do not include sensitive personal information in feedback."
  ].join("\n");
}

export function createManualBetaKnownLimitationsDraft(_input: TeoyubeManualBetaCommunicationBoundaryInput = {}): string {
  return [
    "Known limitations draft:",
    "This is controlled beta planning only. Some surfaces may be incomplete, fallback-driven, or pending manual review.",
    "External services, analytics, user accounts, live AI orchestration, production CMS, email, SMS, and automated feedback collection remain disabled.",
    "Pause or stop if Scripture anchors, explanation traces, fallback safety, confidence labels, or privacy notices appear missing."
  ].join("\n");
}

export function createManualBetaCommunicationBoundaryReport(input: TeoyubeManualBetaCommunicationBoundaryInput = {}): TeoyubeManualBetaCommunicationBoundaryReport {
  const rules = createManualBetaCommunicationBoundaryRules(input);
  const blockers = validateManualBetaCommunicationBoundaries(input);
  return {
    valid: blockers.length === 0,
    rules,
    noticeDraft: createManualBetaCommunicationNoticeDraft(input),
    participantInstructionDraft: createManualBetaParticipantInstructionDraft(input),
    knownLimitationsDraft: createManualBetaKnownLimitationsDraft(input),
    blockers,
    warnings: ["Drafts are plain text planning artifacts and must be reviewed manually before any future use."],
    draftsArePlainTextOnly: true,
    draftsAreNotSentByCode: true,
    noAutomaticUserContact: true,
    noMassEmail: true,
    noSms: true,
    noNotificationSending: true,
    noAnalyticsTracking: true,
    noSensitiveInformationCollection: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

