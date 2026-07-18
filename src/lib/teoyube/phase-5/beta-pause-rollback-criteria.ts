export type TeoyubeControlledBetaPauseRollbackTrigger =
  | "app_not_loading"
  | "missing_scripture_anchors"
  | "missing_explanation_traces"
  | "unsafe_fallback"
  | "missing_confidence_labels"
  | "review_only_content_visible"
  | "privacy_consent_concern"
  | "disabled_service_enabled"
  | "admin_prototype_persistence_detected"
  | "debug_payload_exposed"
  | "critical_mobile_blocker"
  | "critical_accessibility_blocker"
  | "divine_certainty_language"
  | "professional_advice_language";

export type TeoyubeControlledBetaPauseRollbackCriterion = {
  id: string;
  trigger: TeoyubeControlledBetaPauseRollbackTrigger;
  label: string;
  severity: "high" | "critical";
  recommendedAction: "pause" | "rollback_review";
  details: string;
};

export type TeoyubeControlledBetaPauseRollbackInput = Partial<Record<TeoyubeControlledBetaPauseRollbackTrigger, boolean>>;

export type TeoyubeControlledBetaPauseRollbackReport = {
  pauseCriteria: TeoyubeControlledBetaPauseRollbackCriterion[];
  rollbackCriteria: TeoyubeControlledBetaPauseRollbackCriterion[];
  matchedPauseCriteria: TeoyubeControlledBetaPauseRollbackCriterion[];
  matchedRollbackCriteria: TeoyubeControlledBetaPauseRollbackCriterion[];
  pauseRecommended: boolean;
  rollbackReviewRecommended: boolean;
  noPausePerformed: true;
  noRollbackPerformed: true;
  noUsersContacted: true;
  noNotificationsSent: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function criterion(
  trigger: TeoyubeControlledBetaPauseRollbackTrigger,
  label: string,
  severity: "high" | "critical",
  recommendedAction: "pause" | "rollback_review",
  details: string
): TeoyubeControlledBetaPauseRollbackCriterion {
  return {
    id: `${trigger}_${recommendedAction}`,
    trigger,
    label,
    severity,
    recommendedAction,
    details
  };
}

export function getControlledBetaPauseCriteria(): TeoyubeControlledBetaPauseRollbackCriterion[] {
  return [
    criterion("app_not_loading", "App not loading", "critical", "pause", "Pause controlled beta execution planning if the app cannot load safely."),
    criterion("missing_scripture_anchors", "Missing Scripture anchors", "critical", "pause", "Pause if recommendation surfaces lose required Scripture anchors."),
    criterion("missing_explanation_traces", "Missing explanation traces", "high", "pause", "Pause if recommendation, calling, prayer, or action flows lose explanation paths."),
    criterion("unsafe_fallback", "Unsafe fallback", "critical", "pause", "Pause if fallback state is empty, unsafe, or invents unsupported promises."),
    criterion("missing_confidence_labels", "Missing confidence labels", "high", "pause", "Pause if confidence labels are missing where required."),
    criterion("review_only_content_visible", "Review-only content visible", "critical", "pause", "Pause if review-only draft content appears in live flows."),
    criterion("privacy_consent_concern", "Privacy/consent concern", "critical", "pause", "Pause if consent/privacy notices are hidden or sensitive data handling is unclear."),
    criterion("disabled_service_enabled", "Disabled service enabled", "critical", "pause", "Pause if database, analytics, monitoring, admin auth, CMS, feedback storage, notifications, or live AI become enabled."),
    criterion("debug_payload_exposed", "Debug payload exposed", "critical", "pause", "Pause if technical debug payloads are visible to normal users."),
    criterion("critical_mobile_blocker", "Critical mobile blocker", "high", "pause", "Pause if mobile-safe rendering fails on a critical surface."),
    criterion("critical_accessibility_blocker", "Critical accessibility blocker", "high", "pause", "Pause if keyboard, readable label, or fallback accessibility is critically blocked."),
    criterion("divine_certainty_language", "Divine-certainty language", "critical", "pause", "Pause if the product claims divine certainty."),
    criterion("professional_advice_language", "Professional-advice language", "critical", "pause", "Pause if the product presents medical, legal, financial, emergency, or counseling advice.")
  ];
}

export function getControlledBetaRollbackCriteria(): TeoyubeControlledBetaPauseRollbackCriterion[] {
  return [
    criterion("app_not_loading", "App not loading", "critical", "rollback_review", "Review rollback if a release prevents safe app load."),
    criterion("unsafe_fallback", "Unsafe fallback", "critical", "rollback_review", "Review rollback if fallback safety is broken."),
    criterion("review_only_content_visible", "Review-only content visible", "critical", "rollback_review", "Review rollback if review-only content reaches live flows."),
    criterion("privacy_consent_concern", "Privacy/consent concern", "critical", "rollback_review", "Review rollback if privacy/consent boundaries are broken."),
    criterion("disabled_service_enabled", "Disabled service enabled", "critical", "rollback_review", "Review rollback if unapproved services are enabled."),
    criterion("admin_prototype_persistence_detected", "Admin prototype persistence detected", "critical", "rollback_review", "Review rollback if the admin prototype writes or persists data."),
    criterion("debug_payload_exposed", "Debug payload exposed", "critical", "rollback_review", "Review rollback if debug payloads reach normal users."),
    criterion("divine_certainty_language", "Divine-certainty language", "critical", "rollback_review", "Review rollback if divine-certainty claims appear."),
    criterion("professional_advice_language", "Professional-advice language", "critical", "rollback_review", "Review rollback if professional-advice language appears.")
  ];
}

export function evaluateControlledBetaPauseCriteria(input: TeoyubeControlledBetaPauseRollbackInput = {}): TeoyubeControlledBetaPauseRollbackCriterion[] {
  return getControlledBetaPauseCriteria().filter((entry) => input[entry.trigger] === true);
}

export function evaluateControlledBetaRollbackCriteria(input: TeoyubeControlledBetaPauseRollbackInput = {}): TeoyubeControlledBetaPauseRollbackCriterion[] {
  return getControlledBetaRollbackCriteria().filter((entry) => input[entry.trigger] === true);
}

export function createControlledBetaPauseRollbackReport(input: TeoyubeControlledBetaPauseRollbackInput = {}): TeoyubeControlledBetaPauseRollbackReport {
  const matchedPauseCriteria = evaluateControlledBetaPauseCriteria(input);
  const matchedRollbackCriteria = evaluateControlledBetaRollbackCriteria(input);
  return {
    pauseCriteria: getControlledBetaPauseCriteria(),
    rollbackCriteria: getControlledBetaRollbackCriteria(),
    matchedPauseCriteria,
    matchedRollbackCriteria,
    pauseRecommended: matchedPauseCriteria.length > 0,
    rollbackReviewRecommended: matchedRollbackCriteria.length > 0,
    noPausePerformed: true,
    noRollbackPerformed: true,
    noUsersContacted: true,
    noNotificationsSent: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
