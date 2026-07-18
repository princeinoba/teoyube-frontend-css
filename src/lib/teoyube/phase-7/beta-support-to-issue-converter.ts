import {
  classifyBetaSupportRequest,
  getBetaSupportSeverity,
  sanitizeBetaSupportRequest
} from "./beta-support-workflow";
import type {
  TeoyubeBetaSupportCategory,
  TeoyubeBetaSupportRequest,
  TeoyubeBetaSupportSeverity
} from "./beta-support-workflow-contracts";
import type { TeoyubeBetaOperationalIssue } from "./beta-issue-escalation-workflow";

export type TeoyubeBetaSupportIssueCategory =
  | "scripture_anchor"
  | "explanation_trace"
  | "fallback"
  | "confidence_label"
  | "mobile_accessibility"
  | "privacy_consent"
  | "reviewed_content_gate"
  | "service_disabled_state"
  | "technical_blocker"
  | "support_boundary"
  | "unknown";

export type TeoyubeBetaSupportIssue = TeoyubeBetaOperationalIssue & {
  sourceRequestId: string;
  issueCategory: TeoyubeBetaSupportIssueCategory;
  convertedFromSupport: true;
};

export type TeoyubeBetaSupportToIssueConversionReport = {
  valid: boolean;
  sourceRequestCount: number;
  convertedIssueCount: number;
  issues: TeoyubeBetaSupportIssue[];
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noExternalWrite: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noExternalServicesRequired: true;
  generatedAt: string;
};

export function shouldConvertSupportRequestToIssue(request: TeoyubeBetaSupportRequest): boolean {
  const category = classifyBetaSupportRequest(request);
  return [
    "app_not_loading",
    "scripture_anchor_question",
    "explanation_trace_question",
    "fallback_confusion",
    "confidence_label_confusion",
    "privacy_consent_question",
    "sensitive_information_submitted",
    "emergency_or_crisis",
    "professional_advice_request",
    "technical_issue"
  ].includes(category) || getBetaSupportSeverity(request) === "high" || getBetaSupportSeverity(request) === "critical";
}

export function getBetaIssueCategoryFromSupportRequest(request: TeoyubeBetaSupportRequest): TeoyubeBetaSupportIssueCategory {
  const category = classifyBetaSupportRequest(request);
  if (category === "scripture_anchor_question") return "scripture_anchor";
  if (category === "explanation_trace_question") return "explanation_trace";
  if (category === "fallback_confusion") return "fallback";
  if (category === "confidence_label_confusion") return "confidence_label";
  if (["privacy_consent_question", "sensitive_information_submitted"].includes(category)) return "privacy_consent";
  if (["app_not_loading", "technical_issue"].includes(category)) return "technical_blocker";
  if (["emergency_or_crisis", "professional_advice_request"].includes(category)) return "support_boundary";
  if (["navigation_confusion", "prayer_companion_question", "calling_compass_question", "promise_table_question", "tig_graph_question"].includes(category)) return "unknown";
  return "unknown";
}

export function getBetaIssueSeverityFromSupportRequest(request: TeoyubeBetaSupportRequest): TeoyubeBetaSupportSeverity {
  return getBetaSupportSeverity(request);
}

function operationalCategory(issueCategory: TeoyubeBetaSupportIssueCategory, supportCategory: TeoyubeBetaSupportCategory): TeoyubeBetaOperationalIssue["category"] {
  if (issueCategory === "scripture_anchor") return "scripture_anchor_question";
  if (issueCategory === "explanation_trace") return "explanation_trace_question";
  if (issueCategory === "fallback") return "fallback_confusion";
  if (issueCategory === "confidence_label") return "confidence_label_confusion";
  if (issueCategory === "privacy_consent") return "privacy_consent_question";
  if (issueCategory === "service_disabled_state") return "service_disabled_state";
  if (issueCategory === "reviewed_content_gate") return "reviewed_content_gate";
  if (issueCategory === "mobile_accessibility") return supportCategory === "unknown" ? "mobile" : "accessibility";
  if (issueCategory === "support_boundary") return supportCategory === "professional_advice_request" ? "professional_advice" : "professional_advice";
  if (issueCategory === "technical_blocker") return "app_not_loading";
  return supportCategory;
}

export function createBetaIssueFromSupportRequest(request: TeoyubeBetaSupportRequest): TeoyubeBetaSupportIssue {
  const sanitized = sanitizeBetaSupportRequest(request);
  const issueCategory = getBetaIssueCategoryFromSupportRequest(sanitized);
  const supportCategory = classifyBetaSupportRequest(sanitized);
  return {
    id: `beta_issue_from_${sanitized.id}`,
    sourceRequestId: sanitized.id,
    issueCategory,
    category: operationalCategory(issueCategory, supportCategory),
    summary: sanitized.summary,
    notes: sanitized.redactedNotes,
    severity: getBetaIssueSeverityFromSupportRequest(sanitized),
    manualOnly: true,
    convertedFromSupport: true
  };
}

export function convertBetaSupportRequestsToIssues(requests: TeoyubeBetaSupportRequest[]): TeoyubeBetaSupportIssue[] {
  return requests.filter(shouldConvertSupportRequestToIssue).map(createBetaIssueFromSupportRequest);
}

export function createBetaSupportToIssueConversionReport(requests: TeoyubeBetaSupportRequest[] = []): TeoyubeBetaSupportToIssueConversionReport {
  const issues = convertBetaSupportRequestsToIssues(requests);
  return {
    valid: true,
    sourceRequestCount: requests.length,
    convertedIssueCount: issues.length,
    issues,
    blockers: [],
    warnings: issues.length ? issues.map((issue) => `${issue.summary}: converted for manual issue triage.`) : ["No support requests require issue conversion yet."],
    manualOnly: true,
    inMemoryOnly: true,
    noExternalWrite: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
