import type {
  TeoyubePublicLaunchDayDecision,
  TeoyubePublicLaunchDayFeedbackCategory,
  TeoyubePublicLaunchDayFeedbackItem,
  TeoyubePublicLaunchDayTriageResult
} from "./public-launch-day-monitoring-feedback-contracts";

export function triagePublicLaunchDayFeedbackItem(item: TeoyubePublicLaunchDayFeedbackItem): TeoyubePublicLaunchDayTriageResult {
  const critical = item.privacySensitive || item.scriptureConcern || item.explanationPathConcern || item.fallbackConcern || item.unsafeSpiritualGuidanceConcern;
  const high = item.mobileAccessibilityConcern || item.serviceStatusConcern;
  const severity = critical ? "critical" : high ? "high" : item.category === "public_copy" ? "medium" : "low";
  const recommendedAction: TeoyubePublicLaunchDayDecision = critical
    ? "pause_public_promotion"
    : high
      ? "needs_owner_review"
      : severity === "medium"
        ? "continue_with_warnings"
        : "continue_controlled_public_launch";

  return {
    id: `public_launch_day_triage_${item.id}`,
    feedbackId: item.id,
    phase: "public_feedback_triage",
    severity,
    category: determinePublicLaunchDayTriageCategory(item),
    recommendedAction,
    rationale: `${item.surface} feedback maps to ${determinePublicLaunchDayTriageCategory(item)} with ${severity} severity.`,
    ownerReviewRequired: severity === "critical" || severity === "high",
    generatedAt: new Date().toISOString()
  };
}

export function triagePublicLaunchDayFeedback(items: TeoyubePublicLaunchDayFeedbackItem[]): TeoyubePublicLaunchDayTriageResult[] {
  return items.map(triagePublicLaunchDayFeedbackItem);
}

function determinePublicLaunchDayTriageCategory(item: TeoyubePublicLaunchDayFeedbackItem): TeoyubePublicLaunchDayFeedbackCategory {
  if (item.privacySensitive) return "privacy";
  if (item.unsafeSpiritualGuidanceConcern) return "unsafe_spiritual_guidance";
  if (item.scriptureConcern) return "scripture_anchor";
  if (item.explanationPathConcern) return "explanation_path";
  if (item.fallbackConcern) return "fallback_safety";
  if (item.mobileAccessibilityConcern) return "mobile_accessibility";
  if (item.serviceStatusConcern) return "production_service_status";
  return item.category;
}
