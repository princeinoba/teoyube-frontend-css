import type {
  TeoyubePublicFeedbackTriageCategory,
  TeoyubePublicFeedbackTriageItem,
  TeoyubePublicFeedbackTriageSeverity,
  TeoyubePublicFixQueueItem
} from "./public-feedback-triage-contracts";
import { getPublicFeedbackTriageSeverity, isPublicLaunchCriticalFeedback, isPublicSafetyCriticalFeedback } from "./public-feedback-triage-engine";

const ISSUE_CATEGORIES: TeoyubePublicFeedbackTriageCategory[] = [
  "privacy",
  "terms",
  "consent",
  "scripture_anchor",
  "explanation_path",
  "fallback",
  "confidence",
  "mobile_ui",
  "accessibility",
  "debug_safety",
  "content_clarity",
  "ai_companion",
  "personalization_preview",
  "public_copy"
];

export function shouldConvertPublicFeedbackToIssue(item: TeoyubePublicFeedbackTriageItem): boolean {
  return isPublicLaunchCriticalFeedback(item) || isPublicSafetyCriticalFeedback(item) || ISSUE_CATEGORIES.includes(item.category);
}

export function getPublicFeedbackIssueCategory(item: TeoyubePublicFeedbackTriageItem): TeoyubePublicFeedbackTriageCategory {
  return ISSUE_CATEGORIES.includes(item.category) ? item.category : "content_clarity";
}

export function getPublicFeedbackIssueSeverity(item: TeoyubePublicFeedbackTriageItem): TeoyubePublicFeedbackTriageSeverity {
  return getPublicFeedbackTriageSeverity(item);
}

export function createIssueFromPublicFeedback(item: TeoyubePublicFeedbackTriageItem): TeoyubePublicFixQueueItem {
  const severity = getPublicFeedbackIssueSeverity(item);
  const publicLaunchCritical = isPublicLaunchCriticalFeedback(item);
  return {
    id: `public_issue_${item.id}`,
    sourceFeedbackId: item.id,
    title: item.summary,
    category: getPublicFeedbackIssueCategory(item),
    severity,
    priority: severity === "critical" ? "public_launch_blocker" : severity === "high" ? "high" : "medium",
    publicLaunchCritical,
    publicSafetyCritical: isPublicSafetyCriticalFeedback(item),
    proposedFix: "Prepare a manual public safe fix plan preserving Scripture anchors, explanation paths, fallback safety, confidence labels, public privacy/terms/consent notices, consent controls, and disabled providers.",
    verificationRequired: ["owner_review", "public_safety_review"],
    status: "new",
    manualOnly: true
  };
}

export function createIssuesFromPublicFeedback(items: TeoyubePublicFeedbackTriageItem[]): TeoyubePublicFixQueueItem[] {
  return items.filter(shouldConvertPublicFeedbackToIssue).map(createIssueFromPublicFeedback);
}

export function createPublicFeedbackIssueConversionReport(items: TeoyubePublicFeedbackTriageItem[] = []) {
  const issues = createIssuesFromPublicFeedback(items);
  return {
    valid: true,
    feedbackCount: items.length,
    issueCount: issues.length,
    issues,
    inMemoryOnly: true,
    manualOnly: true,
    noExternalWrite: true,
    noAnalyticsSent: true,
    noDatabaseWrites: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    generatedAt: new Date().toISOString()
  };
}
