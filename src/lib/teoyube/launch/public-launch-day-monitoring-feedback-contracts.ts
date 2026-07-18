export type TeoyubePublicLaunchDayStatus =
  | "ready"
  | "ready_with_warnings"
  | "needs_review"
  | "blocked"
  | "not_started"
  | "unknown";

export type TeoyubePublicLaunchDayPhase =
  | "public_launch_observation"
  | "public_surface_monitoring"
  | "public_feedback_intake"
  | "public_feedback_triage"
  | "privacy_consent_review"
  | "public_communication_review"
  | "production_service_review"
  | "pause_rollback_review"
  | "owner_review"
  | "daily_summary"
  | "unknown";

export type TeoyubePublicLaunchDayDecision =
  | "continue_controlled_public_launch"
  | "continue_with_warnings"
  | "pause_public_promotion"
  | "rollback_recommended"
  | "blocked"
  | "needs_owner_review"
  | "unknown";

export type TeoyubePublicLaunchDayFeedbackCategory =
  | "general"
  | "privacy"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback_safety"
  | "mobile_accessibility"
  | "public_copy"
  | "production_service_status"
  | "unsafe_spiritual_guidance";

export type TeoyubePublicLaunchDayMonitoringCheck = {
  id: string;
  label: string;
  phase: TeoyubePublicLaunchDayPhase;
  required: boolean;
  publicLaunchCritical: boolean;
  details: string;
};

export type TeoyubePublicLaunchDayMonitoringResult = {
  id: string;
  checkId: string;
  phase: TeoyubePublicLaunchDayPhase;
  status: "pass" | "warning" | "fail" | "not_observed" | "unknown";
  notes: string[];
  blocker: boolean;
  warning: boolean;
  recordedManually: true;
  generatedAt: string;
};

export type TeoyubePublicLaunchDayFeedbackItem = {
  id: string;
  source: "manual_observation" | "public_feedback" | "owner_review" | "support_note";
  surface: string;
  category: TeoyubePublicLaunchDayFeedbackCategory;
  summary: string;
  reportedImpact: string;
  privacySensitive: boolean;
  scriptureConcern: boolean;
  explanationPathConcern: boolean;
  fallbackConcern: boolean;
  mobileAccessibilityConcern: boolean;
  serviceStatusConcern: boolean;
  unsafeSpiritualGuidanceConcern: boolean;
  ownerResponseNote: string;
  rawSensitiveTextStored: false;
  recordedManually: true;
  generatedAt: string;
};

export type TeoyubePublicLaunchDayTriageResult = {
  id: string;
  feedbackId: string;
  phase: "public_feedback_triage";
  severity: "low" | "medium" | "high" | "critical";
  category: TeoyubePublicLaunchDayFeedbackCategory;
  recommendedAction: TeoyubePublicLaunchDayDecision;
  rationale: string;
  ownerReviewRequired: boolean;
  generatedAt: string;
};

export type TeoyubePublicLaunchDayOwnerReview = {
  id: string;
  firstHourReviewed: boolean;
  sameDayReviewed: boolean;
  endOfDayReviewed: boolean;
  ownerAvailableForPauseRollback: boolean;
  ownerApprovedContinuation: boolean;
  ownerNotes: string[];
  manualDecisionOnly: true;
  generatedAt: string;
};

export type TeoyubePublicLaunchDayCommunicationStatus = {
  id: string;
  launchCopyMatchesServiceStatus: boolean;
  privacyTermsConsentVisible: boolean;
  sensitiveInfoWarningVisible: boolean;
  aiTigTransparencyVisible: boolean;
  knownLimitationsVisible: boolean;
  feedbackInstructionsVisible: boolean;
  noPublicCopyOverpromises: boolean;
  messagesSentByCode: false;
  usersContacted: false;
  generatedAt: string;
};

export type TeoyubePublicLaunchDayBlocker = {
  id: string;
  label: string;
  phase: TeoyubePublicLaunchDayPhase;
  severity: "high" | "critical";
  reason: string;
  requiredAction: string;
};

export type TeoyubePublicLaunchDayWarning = {
  id: string;
  label: string;
  phase: TeoyubePublicLaunchDayPhase;
  severity: "low" | "medium" | "high";
  message: string;
  recommendedAction: string;
};
