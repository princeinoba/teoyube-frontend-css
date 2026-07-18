import type {
  TeoyubePublicLaunchDayBlocker,
  TeoyubePublicLaunchDayCommunicationStatus,
  TeoyubePublicLaunchDayOwnerReview,
  TeoyubePublicLaunchDayWarning
} from "./public-launch-day-monitoring-feedback-contracts";

export function createPublicLaunchDayOwnerReview(input: Partial<TeoyubePublicLaunchDayOwnerReview> = {}): TeoyubePublicLaunchDayOwnerReview {
  return {
    id: input.id || "public_launch_day_owner_review_6_2",
    firstHourReviewed: input.firstHourReviewed ?? true,
    sameDayReviewed: input.sameDayReviewed ?? true,
    endOfDayReviewed: input.endOfDayReviewed ?? false,
    ownerAvailableForPauseRollback: input.ownerAvailableForPauseRollback ?? true,
    ownerApprovedContinuation: input.ownerApprovedContinuation ?? true,
    ownerNotes: input.ownerNotes || ["Owner review remains manual for public launch day continuation."],
    manualDecisionOnly: true,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function createPublicLaunchDayCommunicationStatus(input: Partial<TeoyubePublicLaunchDayCommunicationStatus> = {}): TeoyubePublicLaunchDayCommunicationStatus {
  return {
    id: input.id || "public_launch_day_communication_status_6_2",
    launchCopyMatchesServiceStatus: input.launchCopyMatchesServiceStatus ?? true,
    privacyTermsConsentVisible: input.privacyTermsConsentVisible ?? true,
    sensitiveInfoWarningVisible: input.sensitiveInfoWarningVisible ?? true,
    aiTigTransparencyVisible: input.aiTigTransparencyVisible ?? true,
    knownLimitationsVisible: input.knownLimitationsVisible ?? true,
    feedbackInstructionsVisible: input.feedbackInstructionsVisible ?? true,
    noPublicCopyOverpromises: input.noPublicCopyOverpromises ?? true,
    messagesSentByCode: false,
    usersContacted: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPublicLaunchDayOwnerCommunicationBlockers(ownerReview: TeoyubePublicLaunchDayOwnerReview, communication: TeoyubePublicLaunchDayCommunicationStatus): TeoyubePublicLaunchDayBlocker[] {
  return [
    !ownerReview.ownerAvailableForPauseRollback ? { id: "public_launch_day_owner_unavailable", label: "Owner unavailable for pause/rollback", phase: "owner_review", severity: "critical", reason: "Owner must be available for public launch day decisions.", requiredAction: "Pause public promotion until owner is available." } : undefined,
    !ownerReview.ownerApprovedContinuation ? { id: "public_launch_day_owner_not_approved", label: "Owner continuation not approved", phase: "owner_review", severity: "high", reason: "Owner has not approved controlled public launch continuation.", requiredAction: "Complete owner review before expansion." } : undefined,
    ...Object.entries(communication).filter(([key, value]) => typeof value === "boolean" && value === false && !["messagesSentByCode", "usersContacted"].includes(key)).map(([key]) => ({
      id: `public_launch_day_communication_${key}`,
      label: key.replace(/([A-Z])/g, " $1").toLowerCase(),
      phase: "public_communication_review" as const,
      severity: "critical" as const,
      reason: "Public launch communication status is incomplete.",
      requiredAction: "Fix public communication copy/status before continuing public promotion."
    }))
  ].filter(Boolean) as TeoyubePublicLaunchDayBlocker[];
}

export function getPublicLaunchDayOwnerCommunicationWarnings(ownerReview: TeoyubePublicLaunchDayOwnerReview): TeoyubePublicLaunchDayWarning[] {
  return ownerReview.endOfDayReviewed
    ? []
    : [{ id: "public_launch_day_end_of_day_review_pending", label: "End-of-day review pending", phase: "owner_review", severity: "medium", message: "End-of-day public launch owner review has not been completed yet.", recommendedAction: "Complete end-of-day review before moving to stabilization." }];
}
