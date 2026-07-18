import type {
  TeoyubePublicFeedbackTriageCategory,
  TeoyubePublicFeedbackTriageItem
} from "./public-feedback-triage-contracts";
import { createPublicFeedbackTriageItem } from "./public-feedback-daily-review-package";

export type TeoyubePublicLaunchFeedbackSummaryInput = {
  items?: TeoyubePublicFeedbackTriageItem[];
  publicLaunchPerformedByCode?: boolean;
  usersContacted?: boolean;
  feedbackCollectedAutomatically?: boolean;
  publicUrlFetched?: boolean;
};

export type TeoyubePublicLaunchFeedbackSummary = {
  itemCount: number;
  positiveFeedbackCount: number;
  criticalFeedbackCount: number;
  featureRequestCount: number;
  contentClarityCount: number;
  privacyConsentFeedbackCount: number;
  scriptureAnchorFeedbackCount: number;
  explanationPathFeedbackCount: number;
  fallbackFeedbackCount: number;
  consentPrivacyFeedbackCount: number;
  mobileAccessibilityFeedbackCount: number;
  aiCompanionFeedbackCount: number;
  personalizationPreviewFeedbackCount: number;
  manualOnly: true;
  sanitizedOnly: boolean;
};

function defaultFeedbackItems(): TeoyubePublicFeedbackTriageItem[] {
  return [
    createPublicFeedbackTriageItem({
      id: "public_launch_positive_feedback_summary_sample",
      category: "positive_feedback",
      summary: "Manual redacted positive feedback sample for public launch completion review.",
      severity: "low",
      publicLaunchCritical: false,
      publicSafetyCritical: false
    }),
    createPublicFeedbackTriageItem({
      id: "public_launch_content_clarity_feedback_summary_sample",
      category: "content_clarity",
      summary: "Manual redacted public content clarity note for post-launch planning.",
      severity: "medium",
      publicLaunchCritical: false,
      publicSafetyCritical: false
    }),
    createPublicFeedbackTriageItem({
      id: "public_launch_feature_request_summary_sample",
      category: "feature_request",
      summary: "Manual redacted feature request sample for post-launch roadmap planning.",
      severity: "low",
      publicLaunchCritical: false,
      publicSafetyCritical: false
    })
  ];
}

function itemsFrom(input: TeoyubePublicLaunchFeedbackSummaryInput | TeoyubePublicFeedbackTriageItem[] = {}): TeoyubePublicFeedbackTriageItem[] {
  return Array.isArray(input) ? input : input.items || defaultFeedbackItems();
}

function countCategory(items: TeoyubePublicFeedbackTriageItem[], categories: TeoyubePublicFeedbackTriageCategory[]): number {
  return items.filter((item) => categories.includes(item.category)).length;
}

export function summarizePublicLaunchPositiveFeedback(input: TeoyubePublicLaunchFeedbackSummaryInput | TeoyubePublicFeedbackTriageItem[] = {}) {
  return itemsFrom(input).filter((item) => item.category === "positive_feedback");
}

export function summarizePublicLaunchCriticalFeedback(input: TeoyubePublicLaunchFeedbackSummaryInput | TeoyubePublicFeedbackTriageItem[] = {}) {
  return itemsFrom(input).filter((item) => item.publicLaunchCritical || item.publicSafetyCritical || item.severity === "critical" || item.severity === "high");
}

export function summarizePublicLaunchFeatureRequests(input: TeoyubePublicLaunchFeedbackSummaryInput | TeoyubePublicFeedbackTriageItem[] = {}) {
  return itemsFrom(input).filter((item) => item.category === "feature_request");
}

export function summarizePublicLaunchContentClarityFeedback(input: TeoyubePublicLaunchFeedbackSummaryInput | TeoyubePublicFeedbackTriageItem[] = {}) {
  return itemsFrom(input).filter((item) => item.category === "content_clarity" || item.category === "public_copy");
}

export function summarizePublicLaunchPrivacyConsentFeedback(input: TeoyubePublicLaunchFeedbackSummaryInput | TeoyubePublicFeedbackTriageItem[] = {}) {
  return itemsFrom(input).filter((item) => ["privacy", "terms", "consent"].includes(item.category));
}

export function createPublicLaunchFeedbackSummary(
  input: TeoyubePublicLaunchFeedbackSummaryInput | TeoyubePublicFeedbackTriageItem[] = {}
): TeoyubePublicLaunchFeedbackSummary {
  const items = itemsFrom(input);
  return {
    itemCount: items.length,
    positiveFeedbackCount: summarizePublicLaunchPositiveFeedback(items).length,
    criticalFeedbackCount: summarizePublicLaunchCriticalFeedback(items).length,
    featureRequestCount: summarizePublicLaunchFeatureRequests(items).length,
    contentClarityCount: summarizePublicLaunchContentClarityFeedback(items).length,
    privacyConsentFeedbackCount: summarizePublicLaunchPrivacyConsentFeedback(items).length,
    scriptureAnchorFeedbackCount: countCategory(items, ["scripture_anchor"]),
    explanationPathFeedbackCount: countCategory(items, ["explanation_path"]),
    fallbackFeedbackCount: countCategory(items, ["fallback", "offline_fallback"]),
    consentPrivacyFeedbackCount: countCategory(items, ["consent", "privacy", "terms"]),
    mobileAccessibilityFeedbackCount: countCategory(items, ["mobile_ui", "accessibility"]),
    aiCompanionFeedbackCount: countCategory(items, ["ai_companion"]),
    personalizationPreviewFeedbackCount: countCategory(items, ["personalization_preview"]),
    manualOnly: true,
    sanitizedOnly: items.every((item) => item.manuallyEntered && !item.rawSensitiveTextStored)
  };
}

export function getPublicLaunchFeedbackSummaryBlockers(
  input: TeoyubePublicLaunchFeedbackSummaryInput | TeoyubePublicFeedbackTriageItem[] = {}
) {
  const items = itemsFrom(input);
  const flags: TeoyubePublicLaunchFeedbackSummaryInput = Array.isArray(input) ? {} : input;
  return [
    ...items
      .filter((item) => item.rawSensitiveTextStored || item.analyticsSent || item.databaseWritten || item.externalServicesCalled || item.hiddenPersonalizationCreated || item.liveAiOrchestrationEnabled || item.publicUrlFetched || item.usersContacted)
      .map((item) => ({
        id: `public_launch_feedback_summary_privacy_${item.id}`,
        label: item.summary,
        reason: "Public launch feedback summary must use sanitized, manual, redacted notes only.",
        requiredAction: "Remove raw sensitive text, persistence, analytics, external calls, live AI, public URL fetches, user contact, or hidden personalization.",
        riskLevel: "critical" as const
      })),
    flags.publicLaunchPerformedByCode ? { id: "public_launch_feedback_summary_launch_performed", label: "Public launch performed by code", reason: "Feedback summary must not perform a public launch.", requiredAction: "Keep this as a review-only summary.", riskLevel: "critical" as const } : undefined,
    flags.usersContacted ? { id: "public_launch_feedback_summary_users_contacted", label: "Users contacted", reason: "Feedback summary must not contact users.", requiredAction: "Keep contact manual and outside code.", riskLevel: "critical" as const } : undefined,
    flags.feedbackCollectedAutomatically ? { id: "public_launch_feedback_summary_auto_collection", label: "Automatic feedback collection", reason: "Feedback summary must not collect feedback automatically.", requiredAction: "Use manually entered sanitized items only.", riskLevel: "critical" as const } : undefined,
    flags.publicUrlFetched ? { id: "public_launch_feedback_summary_public_url_fetched", label: "Public URL fetched", reason: "Feedback summary must not fetch public URLs.", requiredAction: "Keep URL checks manual.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
}

export function getPublicLaunchFeedbackSummaryWarnings(
  input: TeoyubePublicLaunchFeedbackSummaryInput | TeoyubePublicFeedbackTriageItem[] = {}
) {
  const critical = summarizePublicLaunchCriticalFeedback(input);
  return [
    ...critical.map((item) => ({
      id: `public_launch_feedback_summary_critical_${item.id}`,
      label: item.summary,
      message: "Critical public feedback is included in the completion summary and must remain visible for owner review.",
      recommendedAction: "Confirm issue closure or documented limitation before post-launch readiness.",
      riskLevel: "high" as const
    }))
  ];
}

export function createPublicLaunchFeedbackSummaryReport(
  input: TeoyubePublicLaunchFeedbackSummaryInput | TeoyubePublicFeedbackTriageItem[] = {}
) {
  const items = itemsFrom(input);
  const blockers = getPublicLaunchFeedbackSummaryBlockers(input);
  const warnings = getPublicLaunchFeedbackSummaryWarnings(input);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    summary: createPublicLaunchFeedbackSummary(items),
    items,
    positiveFeedback: summarizePublicLaunchPositiveFeedback(items),
    criticalFeedback: summarizePublicLaunchCriticalFeedback(items),
    featureRequests: summarizePublicLaunchFeatureRequests(items),
    contentClarityFeedback: summarizePublicLaunchContentClarityFeedback(items),
    privacyConsentFeedback: summarizePublicLaunchPrivacyConsentFeedback(items),
    blockers,
    warnings,
    manualOnly: true,
    sanitizedOnly: items.every((item) => item.manuallyEntered && !item.rawSensitiveTextStored),
    noPublicLaunchPerformedByCode: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
