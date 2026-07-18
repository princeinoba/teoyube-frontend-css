import type { TeoyubeSupportIssue, TeoyubeSupportIssueCategory } from "./support-issue-triage-contracts";
import {
  createProductStabilizationQueueItem,
  getDefaultProductStabilizationVerificationRequirements
} from "./product-stabilization-queue-manager";
import type {
  TeoyubeProductStabilizationCategory,
  TeoyubeProductStabilizationPriority,
  TeoyubeProductStabilizationQueueItem,
  TeoyubeProductStabilizationVerificationRequirement
} from "./product-stabilization-queue-contracts";

export type TeoyubeSupportIssueToStabilizationConversionReport = {
  valid: boolean;
  sourceIssueCount: number;
  convertedItemCount: number;
  items: TeoyubeProductStabilizationQueueItem[];
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

export function shouldCreateStabilizationItem(issue: TeoyubeSupportIssue): boolean {
  return issue.status !== "resolved" && issue.category !== "unknown";
}

export function getStabilizationCategoryFromSupportIssue(issue: TeoyubeSupportIssue): TeoyubeProductStabilizationCategory {
  const map: Record<TeoyubeSupportIssueCategory, TeoyubeProductStabilizationCategory> = {
    app_not_loading: "unknown",
    navigation_confusion: "content_clarity",
    scripture_anchor_missing: "scripture_anchor",
    scripture_anchor_question: "scripture_anchor",
    explanation_trace_missing: "explanation_trace",
    explanation_trace_question: "explanation_trace",
    unsafe_fallback: "fallback",
    fallback_confusion: "fallback",
    confidence_label_missing: "confidence_label",
    confidence_label_confusion: "confidence_label",
    review_only_content_visible: "reviewed_content_gate",
    privacy_consent_issue: "privacy_consent",
    sensitive_information_submitted: "privacy_consent",
    emergency_or_crisis: "support_workflow",
    professional_advice_request: "support_workflow",
    mobile_issue: "mobile",
    accessibility_issue: "accessibility",
    technical_issue: "unknown",
    disabled_service_issue: "service_disabled_state",
    debug_payload_visible: "controlled_admin",
    divine_certainty_language: "support_workflow",
    content_clarity: "content_clarity",
    unknown: "unknown"
  };
  return map[issue.category] || "unknown";
}

export function getStabilizationPriorityFromSupportIssue(issue: TeoyubeSupportIssue): TeoyubeProductStabilizationPriority {
  if (issue.severity === "critical" || issue.status === "blocked") return "beta_operations_blocker";
  if (issue.severity === "high") return "high";
  if (issue.severity === "medium") return "medium";
  if (issue.severity === "low" || issue.severity === "informational") return "low";
  return "unknown";
}

export function getStabilizationVerificationRequirements(issue: TeoyubeSupportIssue): TeoyubeProductStabilizationVerificationRequirement[] {
  const category = getStabilizationCategoryFromSupportIssue(issue);
  return getDefaultProductStabilizationVerificationRequirements(category);
}

export function createStabilizationItemFromSupportIssue(issue: TeoyubeSupportIssue): TeoyubeProductStabilizationQueueItem {
  const category = getStabilizationCategoryFromSupportIssue(issue);
  const priority = getStabilizationPriorityFromSupportIssue(issue);
  return createProductStabilizationQueueItem({
    id: `stabilization_from_${issue.id}`,
    title: issue.title,
    description: issue.description,
    source: "support_issue",
    sourceId: issue.id,
    category,
    priority,
    riskLevel: priority === "beta_operations_blocker" ? "high" : priority === "high" ? "high" : "medium",
    proposedFix: "Review the support issue manually and apply only a safe local stabilization that preserves Scripture anchors, explanation traces, fallback safety, confidence labels, privacy/consent, and disabled-service boundaries.",
    verificationRequirements: getStabilizationVerificationRequirements(issue),
    ownerReviewRequired: priority === "beta_operations_blocker" || ["scripture_anchor", "explanation_trace", "fallback", "confidence_label", "privacy_consent", "reviewed_content_gate", "service_disabled_state", "controlled_admin", "support_workflow"].includes(category),
    safeLocalFixAllowed: priority !== "beta_operations_blocker" && !["scripture_anchor", "explanation_trace", "fallback", "confidence_label", "privacy_consent", "reviewed_content_gate", "service_disabled_state", "controlled_admin", "support_workflow"].includes(category)
  });
}

export function convertSupportIssuesToStabilizationItems(issues: TeoyubeSupportIssue[]): TeoyubeProductStabilizationQueueItem[] {
  return issues.filter(shouldCreateStabilizationItem).map(createStabilizationItemFromSupportIssue);
}

export function createSupportIssueToStabilizationConversionReport(issues: TeoyubeSupportIssue[] = []): TeoyubeSupportIssueToStabilizationConversionReport {
  const items = convertSupportIssuesToStabilizationItems(issues);
  return {
    valid: true,
    sourceIssueCount: issues.length,
    convertedItemCount: items.length,
    items,
    blockers: [],
    warnings: items.length ? items.map((item) => `${item.title}: converted to product stabilization queue item.`) : ["No support issues require stabilization conversion yet."],
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
