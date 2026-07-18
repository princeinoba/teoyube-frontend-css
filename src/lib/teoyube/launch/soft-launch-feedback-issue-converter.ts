import type {
  TeoyubeSoftLaunchFeedbackTriageCategory,
  TeoyubeSoftLaunchFeedbackTriageItem,
  TeoyubeSoftLaunchFeedbackTriageSeverity,
  TeoyubeSoftLaunchFixQueueItem
} from "./soft-launch-feedback-triage-contracts";
import { getSoftLaunchFeedbackTriageSeverity, isLaunchCriticalSoftLaunchFeedback } from "./soft-launch-feedback-triage-engine";

const ISSUE_CATEGORIES: TeoyubeSoftLaunchFeedbackTriageCategory[] = [
  "scripture_anchor",
  "explanation_path",
  "fallback",
  "consent",
  "privacy",
  "mobile_ui",
  "accessibility",
  "debug_safety",
  "content_clarity",
  "ai_companion",
  "personalization_preview"
];

export function shouldConvertFeedbackToIssue(item: TeoyubeSoftLaunchFeedbackTriageItem): boolean {
  return isLaunchCriticalSoftLaunchFeedback(item) || ISSUE_CATEGORIES.includes(item.category);
}

export function getFeedbackIssueCategory(item: TeoyubeSoftLaunchFeedbackTriageItem): TeoyubeSoftLaunchFeedbackTriageCategory {
  return ISSUE_CATEGORIES.includes(item.category) ? item.category : "content_clarity";
}

export function getFeedbackIssueSeverity(item: TeoyubeSoftLaunchFeedbackTriageItem): TeoyubeSoftLaunchFeedbackTriageSeverity {
  return getSoftLaunchFeedbackTriageSeverity(item);
}

export function createIssueFromSoftLaunchFeedback(item: TeoyubeSoftLaunchFeedbackTriageItem): TeoyubeSoftLaunchFixQueueItem {
  const severity = getFeedbackIssueSeverity(item);
  return {
    id: `issue_${item.id}`,
    sourceFeedbackId: item.id,
    title: item.summary,
    category: getFeedbackIssueCategory(item),
    severity,
    priority: severity === "critical" ? "launch_blocker" : severity === "high" ? "high" : "medium",
    launchCritical: isLaunchCriticalSoftLaunchFeedback(item),
    safetyCritical: item.safetyCritical,
    proposedFix: "Create a manual fix plan preserving Scripture anchors, explanation paths, fallback safety, consent, privacy, and confidence labels.",
    verificationRequired: ["owner_review", "safety_review"],
    status: "new",
    manualOnly: true
  };
}

export function createIssuesFromSoftLaunchFeedback(items: TeoyubeSoftLaunchFeedbackTriageItem[]): TeoyubeSoftLaunchFixQueueItem[] {
  return items.filter(shouldConvertFeedbackToIssue).map(createIssueFromSoftLaunchFeedback);
}

export function createFeedbackIssueConversionReport(items: TeoyubeSoftLaunchFeedbackTriageItem[] = []) {
  const issues = createIssuesFromSoftLaunchFeedback(items);
  return {
    valid: true,
    feedbackCount: items.length,
    issueCount: issues.length,
    issues,
    inMemoryOnly: true,
    noExternalWrite: true,
    noAnalyticsSent: true,
    noDatabaseWrites: true,
    generatedAt: new Date().toISOString()
  };
}
