import type {
  TeoyubeSoftLaunchFeedbackTriageCategory,
  TeoyubeSoftLaunchFeedbackTriageItem
} from "./soft-launch-feedback-triage-contracts";
import { createSoftLaunchFeedbackTriageItem } from "./soft-launch-feedback-daily-review-package";

export type TeoyubeSoftLaunchFeedbackSummaryInput = {
  items?: TeoyubeSoftLaunchFeedbackTriageItem[];
  publicLaunchPerformed?: boolean;
  usersContacted?: boolean;
  feedbackCollectedAutomatically?: boolean;
};

export type TeoyubeSoftLaunchFeedbackSummary = {
  itemCount: number;
  positiveFeedbackCount: number;
  criticalFeedbackCount: number;
  featureRequestCount: number;
  contentClarityCount: number;
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

function defaultFeedbackItems(): TeoyubeSoftLaunchFeedbackTriageItem[] {
  return [
    createSoftLaunchFeedbackTriageItem({
      id: "soft_launch_positive_feedback_summary_sample",
      category: "positive_feedback",
      summary: "Manual redacted positive feedback sample for completion review.",
      severity: "low",
      launchCritical: false,
      safetyCritical: false
    }),
    createSoftLaunchFeedbackTriageItem({
      id: "soft_launch_content_clarity_feedback_summary_sample",
      category: "content_clarity",
      summary: "Manual redacted content clarity note for public launch preparation.",
      severity: "medium",
      launchCritical: false,
      safetyCritical: false
    }),
    createSoftLaunchFeedbackTriageItem({
      id: "soft_launch_feature_request_summary_sample",
      category: "feature_request",
      summary: "Manual redacted feature request sample for future planning.",
      severity: "low",
      launchCritical: false,
      safetyCritical: false
    })
  ];
}

function itemsFrom(input: TeoyubeSoftLaunchFeedbackSummaryInput | TeoyubeSoftLaunchFeedbackTriageItem[] = {}): TeoyubeSoftLaunchFeedbackTriageItem[] {
  return Array.isArray(input) ? input : input.items || defaultFeedbackItems();
}

function countCategory(items: TeoyubeSoftLaunchFeedbackTriageItem[], categories: TeoyubeSoftLaunchFeedbackTriageCategory[]): number {
  return items.filter((item) => categories.includes(item.category)).length;
}

export function summarizeSoftLaunchPositiveFeedback(input: TeoyubeSoftLaunchFeedbackSummaryInput | TeoyubeSoftLaunchFeedbackTriageItem[] = {}) {
  return itemsFrom(input).filter((item) => item.category === "positive_feedback");
}

export function summarizeSoftLaunchCriticalFeedback(input: TeoyubeSoftLaunchFeedbackSummaryInput | TeoyubeSoftLaunchFeedbackTriageItem[] = {}) {
  return itemsFrom(input).filter((item) => item.launchCritical || item.safetyCritical || item.severity === "critical" || item.severity === "high");
}

export function summarizeSoftLaunchFeatureRequests(input: TeoyubeSoftLaunchFeedbackSummaryInput | TeoyubeSoftLaunchFeedbackTriageItem[] = {}) {
  return itemsFrom(input).filter((item) => item.category === "feature_request");
}

export function summarizeSoftLaunchContentClarityFeedback(input: TeoyubeSoftLaunchFeedbackSummaryInput | TeoyubeSoftLaunchFeedbackTriageItem[] = {}) {
  return itemsFrom(input).filter((item) => item.category === "content_clarity");
}

export function createSoftLaunchFeedbackSummary(
  input: TeoyubeSoftLaunchFeedbackSummaryInput | TeoyubeSoftLaunchFeedbackTriageItem[] = {}
): TeoyubeSoftLaunchFeedbackSummary {
  const items = itemsFrom(input);
  return {
    itemCount: items.length,
    positiveFeedbackCount: summarizeSoftLaunchPositiveFeedback(items).length,
    criticalFeedbackCount: summarizeSoftLaunchCriticalFeedback(items).length,
    featureRequestCount: summarizeSoftLaunchFeatureRequests(items).length,
    contentClarityCount: summarizeSoftLaunchContentClarityFeedback(items).length,
    scriptureAnchorFeedbackCount: countCategory(items, ["scripture_anchor"]),
    explanationPathFeedbackCount: countCategory(items, ["explanation_path"]),
    fallbackFeedbackCount: countCategory(items, ["fallback", "offline_fallback"]),
    consentPrivacyFeedbackCount: countCategory(items, ["consent", "privacy"]),
    mobileAccessibilityFeedbackCount: countCategory(items, ["mobile_ui", "accessibility"]),
    aiCompanionFeedbackCount: countCategory(items, ["ai_companion"]),
    personalizationPreviewFeedbackCount: countCategory(items, ["personalization_preview"]),
    manualOnly: true,
    sanitizedOnly: items.every((item) => item.manuallyEntered && !item.rawSensitiveTextStored)
  };
}

export function getSoftLaunchFeedbackSummaryBlockers(
  input: TeoyubeSoftLaunchFeedbackSummaryInput | TeoyubeSoftLaunchFeedbackTriageItem[] = {}
) {
  const items = itemsFrom(input);
  const flags = Array.isArray(input) ? {} : input;
  return [
    ...items
      .filter((item) => item.rawSensitiveTextStored || item.analyticsSent || item.databaseWritten || item.externalServicesCalled || item.hiddenPersonalizationCreated)
      .map((item) => ({
        id: `soft_launch_feedback_summary_privacy_${item.id}`,
        label: item.summary,
        reason: "Feedback summary must use sanitized, manual, redacted notes only.",
        requiredAction: "Remove raw sensitive text, persistence, analytics, external calls, or hidden personalization.",
        riskLevel: "critical" as const
      })),
    flags.publicLaunchPerformed ? { id: "soft_launch_feedback_summary_public_launch_performed", label: "Public launch performed", reason: "Feedback summary must not perform a public launch.", requiredAction: "Keep this as a review-only summary.", riskLevel: "critical" as const } : undefined,
    flags.usersContacted ? { id: "soft_launch_feedback_summary_users_contacted", label: "Users contacted", reason: "Feedback summary must not contact users.", requiredAction: "Keep contact manual and outside code.", riskLevel: "critical" as const } : undefined,
    flags.feedbackCollectedAutomatically ? { id: "soft_launch_feedback_summary_auto_collection", label: "Automatic feedback collection", reason: "Feedback summary must not collect feedback automatically.", requiredAction: "Use manually entered sanitized items only.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
}

export function getSoftLaunchFeedbackSummaryWarnings(
  input: TeoyubeSoftLaunchFeedbackSummaryInput | TeoyubeSoftLaunchFeedbackTriageItem[] = {}
) {
  const critical = summarizeSoftLaunchCriticalFeedback(input);
  return [
    ...critical.map((item) => ({
      id: `soft_launch_feedback_summary_critical_${item.id}`,
      label: item.summary,
      message: "Critical feedback is included in the completion summary and must remain visible for owner review.",
      recommendedAction: "Confirm issue closure or documented limitation before public launch preparation.",
      riskLevel: "high" as const
    }))
  ];
}

export function createSoftLaunchFeedbackSummaryReport(
  input: TeoyubeSoftLaunchFeedbackSummaryInput | TeoyubeSoftLaunchFeedbackTriageItem[] = {}
) {
  const items = itemsFrom(input);
  const blockers = getSoftLaunchFeedbackSummaryBlockers(input);
  const warnings = getSoftLaunchFeedbackSummaryWarnings(input);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    summary: createSoftLaunchFeedbackSummary(items),
    items,
    positiveFeedback: summarizeSoftLaunchPositiveFeedback(items),
    criticalFeedback: summarizeSoftLaunchCriticalFeedback(items),
    featureRequests: summarizeSoftLaunchFeatureRequests(items),
    contentClarityFeedback: summarizeSoftLaunchContentClarityFeedback(items),
    blockers,
    warnings,
    manualOnly: true,
    sanitizedOnly: items.every((item) => item.manuallyEntered && !item.rawSensitiveTextStored),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
