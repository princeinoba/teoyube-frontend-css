import type { TeoyubeControlledLaunchActivationBlocker, TeoyubeControlledLaunchActivationCheck, TeoyubeControlledLaunchActivationWarning, TeoyubeControlledLaunchCommunicationStatus } from "./controlled-launch-activation-contracts";

function item(id: string, label: string): TeoyubeControlledLaunchActivationCheck {
  return { id, label, phase: "communication_readiness", required: true, complete: true, launchCritical: true, details: label };
}

function blocker(id: string, reason: string): TeoyubeControlledLaunchActivationBlocker {
  return { id, label: id.replace(/_/g, " "), phase: "communication_readiness", severity: "critical", reason, requiredAction: "Fix communication readiness before manual activation." };
}

export function getControlledLaunchCommunicationChecklist(): TeoyubeControlledLaunchActivationCheck[] {
  return [
    item("participant_notice_draft_exists", "Participant notice draft exists"),
    item("privacy_notice_draft_exists", "Privacy notice draft exists"),
    item("safety_notice_draft_exists", "Safety notice draft exists"),
    item("known_limitations_notice_exists", "Known limitations notice exists"),
    item("feedback_instructions_exist", "Feedback instructions exist"),
    item("no_messages_sent_by_code", "No messages sent by code"),
    item("sensitive_information_warning_included", "Sensitive information warning included"),
    item("preview_safe_personalization_notice_included", "Preview-safe personalization notice included"),
    item("external_analytics_disconnected_notice_included", "External analytics disconnected notice included"),
    item("database_persistence_disconnected_notice_included", "Database persistence disconnected notice included"),
    item("live_ai_disabled_notice_included", "Live AI disabled notice included")
  ];
}

export function createControlledLaunchCommunicationReadinessPlan(input: Partial<TeoyubeControlledLaunchCommunicationStatus> = {}): TeoyubeControlledLaunchCommunicationStatus {
  return {
    id: input.id || "controlled_launch_communication_4_1",
    label: input.label || "Controlled Launch Communication Readiness",
    participantNoticeDraftExists: input.participantNoticeDraftExists ?? true,
    privacyNoticeDraftExists: input.privacyNoticeDraftExists ?? true,
    safetyNoticeDraftExists: input.safetyNoticeDraftExists ?? true,
    knownLimitationsNoticeExists: input.knownLimitationsNoticeExists ?? true,
    feedbackInstructionsExist: input.feedbackInstructionsExist ?? true,
    messagesSentByCode: false,
    sensitivePersonalInformationWarningIncluded: input.sensitivePersonalInformationWarningIncluded ?? true,
    previewSafePersonalizationNoticeIncluded: input.previewSafePersonalizationNoticeIncluded ?? true,
    externalAnalyticsDisconnectedNoticeIncluded: input.externalAnalyticsDisconnectedNoticeIncluded ?? true,
    databasePersistenceDisconnectedNoticeIncluded: input.databasePersistenceDisconnectedNoticeIncluded ?? true,
    liveAiDisabledNoticeIncluded: input.liveAiDisabledNoticeIncluded ?? true,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getControlledLaunchCommunicationBlockers(plan: TeoyubeControlledLaunchCommunicationStatus): TeoyubeControlledLaunchActivationBlocker[] {
  return [
    !plan.participantNoticeDraftExists ? blocker("controlled_launch_participant_notice_missing", "Participant notice draft must exist.") : undefined,
    !plan.privacyNoticeDraftExists ? blocker("controlled_launch_privacy_notice_missing", "Privacy notice draft must exist.") : undefined,
    !plan.safetyNoticeDraftExists ? blocker("controlled_launch_safety_notice_missing", "Safety notice draft must exist.") : undefined,
    !plan.knownLimitationsNoticeExists ? blocker("controlled_launch_limitations_notice_missing", "Known limitations notice must exist.") : undefined,
    !plan.feedbackInstructionsExist ? blocker("controlled_launch_feedback_instructions_missing", "Feedback instructions must exist.") : undefined,
    plan.messagesSentByCode ? blocker("controlled_launch_messages_sent_by_code", "Code must not send communications.") : undefined,
    !plan.sensitivePersonalInformationWarningIncluded ? blocker("controlled_launch_sensitive_warning_missing", "Users must be told not to submit sensitive personal information.") : undefined,
    !plan.previewSafePersonalizationNoticeIncluded ? blocker("controlled_launch_personalization_notice_missing", "Users must be told personalization is preview-safe and consent-aware.") : undefined,
    !plan.externalAnalyticsDisconnectedNoticeIncluded ? blocker("controlled_launch_analytics_notice_missing", "Users must be told external analytics are not connected.") : undefined,
    !plan.databasePersistenceDisconnectedNoticeIncluded ? blocker("controlled_launch_persistence_notice_missing", "Users must be told database persistence is not connected.") : undefined,
    !plan.liveAiDisabledNoticeIncluded ? blocker("controlled_launch_live_ai_notice_missing", "Users must be told live AI orchestration is not enabled.") : undefined
  ].filter(Boolean) as TeoyubeControlledLaunchActivationBlocker[];
}

export function getControlledLaunchCommunicationWarnings(): TeoyubeControlledLaunchActivationWarning[] {
  return [{ id: "controlled_launch_communication_draft_only", label: "Communication is draft only", phase: "communication_readiness", severity: "medium", message: "Communication readiness prepares notices but sends nothing.", recommendedAction: "Send any participant messages manually outside code after approval." }];
}

export function validateControlledLaunchCommunicationReadiness(plan: TeoyubeControlledLaunchCommunicationStatus) {
  const blockers = getControlledLaunchCommunicationBlockers(plan);
  return { valid: blockers.length === 0, blockers, warnings: getControlledLaunchCommunicationWarnings() };
}

export function createControlledLaunchCommunicationReadinessReport(plan: TeoyubeControlledLaunchCommunicationStatus = createControlledLaunchCommunicationReadinessPlan()) {
  const validation = validateControlledLaunchCommunicationReadiness(plan);
  return { valid: validation.valid, ready: validation.valid, plan, blockers: validation.blockers, warnings: validation.warnings, noMessagesSent: true, noUsersContacted: true, generatedAt: new Date().toISOString() };
}
