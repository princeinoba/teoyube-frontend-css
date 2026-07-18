import type { TeoyubeManualFeedbackReviewSimulationItem } from "./manual-feedback-review-simulation-contracts";
import {
  createSupportIssue
} from "./support-issue-triage";
import type {
  TeoyubeSupportIssue,
  TeoyubeSupportIssueCategory,
  TeoyubeSupportIssueSeverity
} from "./support-issue-triage-contracts";

export type TeoyubeFeedbackToSupportIssueConversionReport = {
  valid: boolean;
  sourceFeedbackCount: number;
  convertedIssueCount: number;
  issues: TeoyubeSupportIssue[];
  warnings: string[];
  blockers: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalWrite: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};

export function shouldConvertFeedbackToSupportIssue(item: TeoyubeManualFeedbackReviewSimulationItem): boolean {
  return [
    "scripture_anchor",
    "explanation_trace",
    "fallback",
    "confidence_label",
    "mobile",
    "accessibility",
    "privacy_consent",
    "sensitive_content",
    "support_request",
    "content_clarity",
    "word_card",
    "promise_table",
    "prayer_companion",
    "compass_experience",
    "tig_response_panel",
    "tig_graph_explorer"
  ].includes(item.category) || item.severity === "high" || item.severity === "critical";
}

export function getSupportIssueCategoryFromFeedback(item: TeoyubeManualFeedbackReviewSimulationItem): TeoyubeSupportIssueCategory {
  if (item.category === "scripture_anchor") return "scripture_anchor_missing";
  if (item.category === "explanation_trace") return "explanation_trace_missing";
  if (item.category === "fallback") return "unsafe_fallback";
  if (item.category === "confidence_label") return "confidence_label_confusion";
  if (item.category === "mobile") return "mobile_issue";
  if (item.category === "accessibility") return "accessibility_issue";
  if (item.category === "privacy_consent") return "privacy_consent_issue";
  if (item.category === "sensitive_content") {
    if (item.privacyFlags.includes("emergency_or_crisis")) return "emergency_or_crisis";
    if (item.privacyFlags.includes("professional_advice") || item.privacyFlags.includes("medical_legal_financial")) return "professional_advice_request";
    return "sensitive_information_submitted";
  }
  if (item.category === "support_request") return "technical_issue";
  if (item.category === "content_clarity") return "content_clarity";
  if (["word_card", "promise_table", "prayer_companion", "compass_experience", "tig_response_panel", "tig_graph_explorer"].includes(item.category)) return "technical_issue";
  return "unknown";
}

export function getSupportIssueSeverityFromFeedback(item: TeoyubeManualFeedbackReviewSimulationItem): TeoyubeSupportIssueSeverity {
  if (item.severity === "critical" || item.privacyFlags.includes("emergency_or_crisis") || item.privacyFlags.includes("contains_secret")) return "critical";
  if (item.severity === "high" || item.privacyFlags.includes("professional_advice") || item.privacyFlags.includes("medical_legal_financial")) return "high";
  if (["scripture_anchor", "explanation_trace", "fallback", "confidence_label", "mobile", "accessibility", "privacy_consent"].includes(item.category)) return "medium";
  if (item.category === "positive_feedback") return "informational";
  return "low";
}

export function createSupportIssueFromManualFeedback(item: TeoyubeManualFeedbackReviewSimulationItem): TeoyubeSupportIssue {
  return createSupportIssue({
    id: `support_issue_from_${item.id}`,
    title: item.summary,
    description: item.redactedNotes.join(" "),
    category: getSupportIssueCategoryFromFeedback(item),
    severity: getSupportIssueSeverityFromFeedback(item),
    source: "manual_feedback_simulation",
    sourceId: item.id,
    rawSensitiveTextStored: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    publicUrlFetched: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    monitoringProviderConnected: false,
    liveAiOrchestrationEnabled: false,
    adminAuthAdded: false,
    cmsConnected: false,
    browserPersistenceRequired: false,
    noDivineCertaintyClaimed: true
  });
}

export function convertManualFeedbackToSupportIssues(feedbackItems: TeoyubeManualFeedbackReviewSimulationItem[]): TeoyubeSupportIssue[] {
  return feedbackItems.filter(shouldConvertFeedbackToSupportIssue).map(createSupportIssueFromManualFeedback);
}

export function createFeedbackToSupportIssueConversionReport(feedbackItems: TeoyubeManualFeedbackReviewSimulationItem[] = []): TeoyubeFeedbackToSupportIssueConversionReport {
  const issues = convertManualFeedbackToSupportIssues(feedbackItems);
  return {
    valid: true,
    sourceFeedbackCount: feedbackItems.length,
    convertedIssueCount: issues.length,
    issues,
    blockers: [],
    warnings: issues.length ? issues.map((issue) => `${issue.title}: converted for manual support issue triage.`) : ["No simulated feedback requires support issue conversion yet."],
    manualOnly: true,
    inMemoryOnly: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
