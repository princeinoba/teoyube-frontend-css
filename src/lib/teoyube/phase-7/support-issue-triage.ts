import type {
  TeoyubeSupportIssue,
  TeoyubeSupportIssueCategory,
  TeoyubeSupportIssueRecommendedAction,
  TeoyubeSupportIssueSeverity,
  TeoyubeSupportIssueSource,
  TeoyubeSupportIssueTriageBlocker,
  TeoyubeSupportIssueTriageDecision,
  TeoyubeSupportIssueTriageReport,
  TeoyubeSupportIssueTriageWarning
} from "./support-issue-triage-contracts";

const BLOCKING_CATEGORIES: TeoyubeSupportIssueCategory[] = [
  "app_not_loading",
  "scripture_anchor_missing",
  "explanation_trace_missing",
  "unsafe_fallback",
  "confidence_label_missing",
  "review_only_content_visible",
  "privacy_consent_issue",
  "sensitive_information_submitted",
  "emergency_or_crisis",
  "professional_advice_request",
  "disabled_service_issue",
  "debug_payload_visible",
  "mobile_issue",
  "accessibility_issue",
  "divine_certainty_language"
];

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
const SECRET_PATTERN = /\b(?:api[_-]?key|token|password|secret)\s*[:=]\s*\S+/gi;

function now(): string {
  return new Date().toISOString();
}

function redactText(value: string): string {
  return value.replace(EMAIL_PATTERN, "[redacted-email]").replace(PHONE_PATTERN, "[redacted-phone]").replace(SECRET_PATTERN, "[redacted-secret]");
}

function textFor(issue: Pick<TeoyubeSupportIssue, "title" | "description" | "category">): string {
  return `${issue.category} ${issue.title} ${issue.description}`.toLowerCase();
}

export function classifySupportIssue(issue: Pick<TeoyubeSupportIssue, "title" | "description" | "category">): TeoyubeSupportIssueCategory {
  if (issue.category && issue.category !== "unknown") return issue.category;
  const text = textFor(issue);
  if (/app not loading|blank screen|crash|white screen|cannot open/.test(text)) return "app_not_loading";
  if (/navigation|lost|where do i|confusing/.test(text)) return "navigation_confusion";
  if (/scripture.*missing|anchor.*missing|missing.*verse/.test(text)) return "scripture_anchor_missing";
  if (/scripture|verse|anchor/.test(text)) return "scripture_anchor_question";
  if (/explanation.*missing|trace.*missing|missing.*reason/.test(text)) return "explanation_trace_missing";
  if (/explanation|trace|why|reason/.test(text)) return "explanation_trace_question";
  if (/unsafe fallback|fallback unsafe|harmful fallback/.test(text)) return "unsafe_fallback";
  if (/fallback|empty response|safe response/.test(text)) return "fallback_confusion";
  if (/confidence.*missing|missing.*confidence|label.*missing/.test(text)) return "confidence_label_missing";
  if (/confidence|certainty|label/.test(text)) return "confidence_label_confusion";
  if (/review-only|review only|draft content|unreviewed content/.test(text)) return "review_only_content_visible";
  if (/privacy|consent|terms|tracking/.test(text)) return "privacy_consent_issue";
  if (/sensitive|secret|password|api key|token/.test(text)) return "sensitive_information_submitted";
  if (/self harm|suicide|crisis|danger|abuse|emergency|urgent harm/.test(text)) return "emergency_or_crisis";
  if (/medical|legal|financial|diagnosis|therapy|doctor|lawyer|investment|tax|prescribe|professional advice/.test(text)) return "professional_advice_request";
  if (/mobile|small screen|responsive|overflow|wrapping/.test(text)) return "mobile_issue";
  if (/accessibility|screen reader|keyboard|focus|contrast|aria/.test(text)) return "accessibility_issue";
  if (/database|analytics|monitoring|live ai|external service|service enabled|email|sms|notification/.test(text)) return "disabled_service_issue";
  if (/debug payload|raw json|debug visible/.test(text)) return "debug_payload_visible";
  if (/divine certainty|god told me|guaranteed calling|command from god/.test(text)) return "divine_certainty_language";
  if (/technical|bug|broken|error/.test(text)) return "technical_issue";
  if (/clear|clarity|copy|wording|confusing/.test(text)) return "content_clarity";
  return "unknown";
}

export function getSupportIssueSeverity(issue: Pick<TeoyubeSupportIssue, "category" | "severity">): TeoyubeSupportIssueSeverity {
  if (issue.severity && issue.severity !== "unknown") return issue.severity;
  if (["app_not_loading", "unsafe_fallback", "privacy_consent_issue", "sensitive_information_submitted", "emergency_or_crisis", "disabled_service_issue", "debug_payload_visible", "divine_certainty_language"].includes(issue.category)) return "critical";
  if (["scripture_anchor_missing", "explanation_trace_missing", "confidence_label_missing", "review_only_content_visible", "professional_advice_request", "mobile_issue", "accessibility_issue"].includes(issue.category)) return "high";
  if (["scripture_anchor_question", "explanation_trace_question", "fallback_confusion", "confidence_label_confusion", "technical_issue", "content_clarity", "navigation_confusion"].includes(issue.category)) return "medium";
  return "low";
}

export function createSupportIssue(input: {
  id?: string;
  title: string;
  description?: string;
  category?: TeoyubeSupportIssueCategory;
  severity?: TeoyubeSupportIssueSeverity;
  source?: TeoyubeSupportIssueSource;
  sourceId?: string;
  status?: TeoyubeSupportIssue["status"];
  rawSensitiveTextStored?: boolean;
  usersContacted?: boolean;
  feedbackCollectedAutomatically?: boolean;
  publicUrlFetched?: boolean;
  databaseWritten?: boolean;
  analyticsSent?: boolean;
  externalServicesCalled?: boolean;
  monitoringProviderConnected?: boolean;
  liveAiOrchestrationEnabled?: boolean;
  adminAuthAdded?: boolean;
  cmsConnected?: boolean;
  browserPersistenceRequired?: boolean;
  noDivineCertaintyClaimed?: boolean;
}): TeoyubeSupportIssue {
  const category = classifySupportIssue({ title: input.title, description: input.description || "", category: input.category || "unknown" });
  const severity = getSupportIssueSeverity({ category, severity: input.severity || "unknown" });
  const initialBlocking = severity === "critical" || BLOCKING_CATEGORIES.includes(category);
  return {
    id: input.id || `support_issue_${category}_${Date.now()}`,
    title: redactText(input.title),
    description: redactText(input.description || ""),
    category,
    severity,
    source: input.source || "manual_feedback_simulation",
    sourceId: input.sourceId,
    status: input.status || (initialBlocking ? "blocked" : "triaged"),
    sanitized: true,
    manualOnly: true,
    inMemoryOnly: true,
    rawSensitiveTextStored: Boolean(input.rawSensitiveTextStored),
    usersContacted: Boolean(input.usersContacted),
    feedbackCollectedAutomatically: Boolean(input.feedbackCollectedAutomatically),
    publicUrlFetched: Boolean(input.publicUrlFetched),
    databaseWritten: Boolean(input.databaseWritten),
    analyticsSent: Boolean(input.analyticsSent),
    externalServicesCalled: Boolean(input.externalServicesCalled),
    monitoringProviderConnected: Boolean(input.monitoringProviderConnected),
    liveAiOrchestrationEnabled: Boolean(input.liveAiOrchestrationEnabled),
    adminAuthAdded: Boolean(input.adminAuthAdded),
    cmsConnected: Boolean(input.cmsConnected),
    browserPersistenceRequired: Boolean(input.browserPersistenceRequired),
    noDivineCertaintyClaimed: input.noDivineCertaintyClaimed ?? true,
    createdAt: now()
  };
}

export function isSupportBlockingIssue(issue: TeoyubeSupportIssue): boolean {
  const category = classifySupportIssue(issue);
  const severity = getSupportIssueSeverity({ category, severity: issue.severity });
  const sideEffect = issue.rawSensitiveTextStored || issue.usersContacted || issue.feedbackCollectedAutomatically || issue.publicUrlFetched || issue.databaseWritten || issue.analyticsSent || issue.externalServicesCalled || issue.monitoringProviderConnected || issue.liveAiOrchestrationEnabled || issue.adminAuthAdded || issue.cmsConnected || issue.browserPersistenceRequired || !issue.noDivineCertaintyClaimed;
  return issue.status !== "resolved" && (sideEffect || severity === "critical" || BLOCKING_CATEGORIES.includes(category));
}

export function getSupportIssueRecommendedAction(issue: TeoyubeSupportIssue): TeoyubeSupportIssueRecommendedAction {
  if (isSupportBlockingIssue(issue)) {
    return {
      id: `${issue.id}_block`,
      issueId: issue.id,
      decision: "beta_operations_blocked",
      label: "Block beta operations until reviewed",
      details: "Route this issue to manual owner review and product stabilization before continuing controlled beta operations.",
      nextStep: "Phase 7.2 - Product stabilization queue"
    };
  }
  if (["high", "medium"].includes(issue.severity)) {
    return {
      id: `${issue.id}_queue`,
      issueId: issue.id,
      decision: "queue_for_product_stabilization",
      label: "Queue for product stabilization",
      details: "Convert to a stabilization queue item and verify Scripture, explanation, fallback, confidence, privacy, and service-disabled boundaries.",
      nextStep: "Phase 7.2 - Product stabilization queue"
    };
  }
  return {
    id: `${issue.id}_monitor`,
    issueId: issue.id,
    decision: issue.status === "resolved" ? "resolved" : "monitor_manually",
    label: issue.status === "resolved" ? "Resolved" : "Monitor manually",
    details: "Document for manual review; do not send analytics, contact users, or store externally.",
    nextStep: "Manual owner review"
  };
}

export function triageSupportIssues(issues: TeoyubeSupportIssue[]): TeoyubeSupportIssue[] {
  return issues.map((issue) => {
    const category = classifySupportIssue(issue);
    const severity = getSupportIssueSeverity({ category, severity: issue.severity });
    const normalized = { ...issue, category, severity, manualOnly: true as const, inMemoryOnly: true as const };
    return {
      ...normalized,
      status: issue.status === "open" ? (isSupportBlockingIssue(normalized) ? "blocked" : "triaged") : issue.status
    };
  });
}

export function getSupportBlockingIssues(issues: TeoyubeSupportIssue[]): TeoyubeSupportIssue[] {
  return triageSupportIssues(issues).filter(isSupportBlockingIssue);
}

export function getSupportIssueTriageWarnings(issues: TeoyubeSupportIssue[]): TeoyubeSupportIssueTriageWarning[] {
  return triageSupportIssues(issues)
    .filter((issue) => !isSupportBlockingIssue(issue) && issue.status !== "resolved")
    .map((issue) => ({
      id: `${issue.id}_warning`,
      issueId: issue.id,
      category: issue.category,
      severity: issue.severity,
      message: `${issue.title} needs manual support follow-up.`,
      recommendedAction: getSupportIssueRecommendedAction(issue).details
    }));
}

export function createSupportIssueTriageDecision(issues: TeoyubeSupportIssue[]): TeoyubeSupportIssueTriageDecision {
  const triaged = triageSupportIssues(issues);
  if (getSupportBlockingIssues(triaged).length) return "beta_operations_blocked";
  if (triaged.some((issue) => ["high", "medium"].includes(issue.severity) && issue.status !== "resolved")) return "queue_for_product_stabilization";
  if (triaged.some((issue) => issue.status !== "resolved")) return "owner_review_required";
  return issues.length ? "resolved" : "monitor_manually";
}

export function createSupportIssueTriageReport(issues: TeoyubeSupportIssue[] = []): TeoyubeSupportIssueTriageReport {
  const triaged = triageSupportIssues(issues);
  const blockingIssues = getSupportBlockingIssues(triaged);
  const boundaryBreakers = triaged.filter((issue) => issue.rawSensitiveTextStored || issue.usersContacted || issue.feedbackCollectedAutomatically || issue.publicUrlFetched || issue.databaseWritten || issue.analyticsSent || issue.externalServicesCalled || issue.monitoringProviderConnected || issue.liveAiOrchestrationEnabled || issue.adminAuthAdded || issue.cmsConnected || issue.browserPersistenceRequired || !issue.noDivineCertaintyClaimed);
  const blockers: TeoyubeSupportIssueTriageBlocker[] = [
    ...blockingIssues.map((issue) => ({
      id: `${issue.id}_blocker`,
      issueId: issue.id,
      category: issue.category,
      severity: issue.severity,
      message: `${issue.title} blocks controlled beta operations review.`,
      requiredAction: getSupportIssueRecommendedAction(issue).details
    })),
    ...boundaryBreakers.map((issue) => ({
      id: `${issue.id}_boundary_broken`,
      issueId: issue.id,
      category: issue.category,
      severity: "critical" as const,
      message: "Support issue triage detected a disabled side effect or unsafe boundary.",
      requiredAction: "Restore no-contact, no-auto-collection, no-URL-fetch, no-persistence, no-analytics, no-monitoring-provider, no-live-AI, no-admin-auth, no-CMS, no-browser-persistence, and no-divine-certainty boundaries."
    }))
  ];
  return {
    valid: blockers.length === 0,
    decision: createSupportIssueTriageDecision(triaged),
    issues: triaged,
    blockingIssues,
    blockers,
    warnings: getSupportIssueTriageWarnings(triaged),
    recommendedActions: triaged.map(getSupportIssueRecommendedAction),
    manualOnly: true,
    inMemoryOnly: true,
    noAutomaticCollection: true,
    noUsersContacted: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalSend: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    noDivineCertaintyClaimed: true,
    generatedAt: now()
  };
}
