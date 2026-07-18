import type {
  TeoyubeBetaSupportBoundary,
  TeoyubeBetaSupportCategory,
  TeoyubeBetaSupportRecommendedResponse,
  TeoyubeBetaSupportRequest,
  TeoyubeBetaSupportSeverity,
  TeoyubeBetaSupportWorkflowBlocker,
  TeoyubeBetaSupportWorkflowDecision,
  TeoyubeBetaSupportWorkflowReport,
  TeoyubeBetaSupportWorkflowWarning
} from "./beta-support-workflow-contracts";

export type TeoyubeBetaSupportRequestInput = Partial<Omit<TeoyubeBetaSupportRequest, "manualOnly" | "noDivineCertaintyClaimed" | "generatedAt">> & {
  rawText?: string;
  notes?: string[];
};

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
const SECRET_PATTERN = /\b(?:api[_-]?key|token|password|secret)\s*[:=]\s*\S+/gi;
const CRISIS_PATTERN = /self harm|suicide|crisis|danger|abuse|emergency|urgent harm/i;
const PROFESSIONAL_PATTERN = /medical|legal|financial|diagnosis|therapy|doctor|lawyer|investment|tax|prescribe|professional advice/i;

function supportId(): string {
  return `beta_support_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function redactText(value: string): string {
  return value.replace(EMAIL_PATTERN, "[redacted-email]").replace(PHONE_PATTERN, "[redacted-phone]").replace(SECRET_PATTERN, "[redacted-secret]");
}

function textOf(request: Pick<TeoyubeBetaSupportRequest, "summary" | "redactedNotes" | "category">): string {
  return `${request.category} ${request.summary} ${request.redactedNotes.join(" ")}`;
}

export function createBetaSupportWorkflow() {
  return {
    id: "phase_7_1_beta_support_workflow",
    boundaries: getBetaSupportBoundaries(),
    manualOnly: true,
    inMemoryOnly: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noExternalServicesRequired: true,
    noLiveAiOrchestrationEnabled: true,
    noProfessionalAdviceProvided: true,
    noDivineCertaintyClaimed: true
  };
}

export function classifyBetaSupportRequest(request: Pick<TeoyubeBetaSupportRequest, "summary" | "redactedNotes" | "category">): TeoyubeBetaSupportCategory {
  const value = textOf(request);
  if (/app not loading|blank screen|crash|white screen|cannot open/i.test(value)) return "app_not_loading";
  if (/navigation|lost|where do i|confusing/i.test(value)) return "navigation_confusion";
  if (/scripture|verse|anchor/i.test(value)) return "scripture_anchor_question";
  if (/explanation|reason|trace|why/i.test(value)) return "explanation_trace_question";
  if (/fallback|empty response|safe response/i.test(value)) return "fallback_confusion";
  if (/confidence|certainty|label/i.test(value)) return "confidence_label_confusion";
  if (/prayer/i.test(value)) return "prayer_companion_question";
  if (/calling|compass|purpose/i.test(value)) return "calling_compass_question";
  if (/promise table|promise cluster/i.test(value)) return "promise_table_question";
  if (/tig graph|graph/i.test(value)) return "tig_graph_question";
  if (/privacy|consent|terms|tracking/i.test(value)) return "privacy_consent_question";
  if (/sensitive|secret|password|api key|token/i.test(value)) return "sensitive_information_submitted";
  if (CRISIS_PATTERN.test(value)) return "emergency_or_crisis";
  if (PROFESSIONAL_PATTERN.test(value)) return "professional_advice_request";
  if (/technical|bug|broken|error/i.test(value)) return "technical_issue";
  return request.category || "unknown";
}

export function getBetaSupportSeverity(request: Pick<TeoyubeBetaSupportRequest, "summary" | "redactedNotes" | "category" | "severity"> & Partial<TeoyubeBetaSupportRequest>): TeoyubeBetaSupportSeverity {
  const category = classifyBetaSupportRequest(request as TeoyubeBetaSupportRequest);
  const value = textOf({ ...request, category } as TeoyubeBetaSupportRequest);
  if (category === "emergency_or_crisis" || request.emergencyConcern || CRISIS_PATTERN.test(value) || request.rawSensitiveTextStored || request.databaseWritten || request.analyticsSent || request.externalServicesCalled || request.liveAiOrchestrationEnabled) return "critical";
  if (category === "professional_advice_request" || request.professionalAdviceRequested || PROFESSIONAL_PATTERN.test(value) || category === "privacy_consent_question" || category === "sensitive_information_submitted") return "high";
  if (["app_not_loading", "scripture_anchor_question", "explanation_trace_question", "fallback_confusion", "confidence_label_confusion"].includes(category)) return "high";
  if (request.severity && request.severity !== "unknown") return request.severity;
  if (["navigation_confusion", "prayer_companion_question", "calling_compass_question", "promise_table_question", "tig_graph_question", "technical_issue"].includes(category)) return "medium";
  return "low";
}

export function createBetaSupportRequest(input: TeoyubeBetaSupportRequestInput = {}): TeoyubeBetaSupportRequest {
  const rawText = input.rawText || input.summary || "Manual beta support request pending summary.";
  const summary = redactText(input.summary || rawText);
  const redactedNotes = (input.notes || input.redactedNotes || (input.rawText ? [input.rawText] : [])).map(redactText);
  const base: TeoyubeBetaSupportRequest = {
    id: input.id || supportId(),
    category: input.category || "unknown",
    severity: input.severity || "unknown",
    summary,
    redactedNotes,
    source: input.source || "manual_support_note",
    sanitized: input.sanitized ?? true,
    manualOnly: true,
    emergencyConcern: Boolean(input.emergencyConcern || CRISIS_PATTERN.test(rawText)),
    professionalAdviceRequested: Boolean(input.professionalAdviceRequested || PROFESSIONAL_PATTERN.test(rawText)),
    rawSensitiveTextStored: Boolean(input.rawSensitiveTextStored),
    usersContacted: Boolean(input.usersContacted),
    feedbackCollectedAutomatically: Boolean(input.feedbackCollectedAutomatically),
    publicUrlFetched: Boolean(input.publicUrlFetched),
    databaseWritten: Boolean(input.databaseWritten),
    analyticsSent: Boolean(input.analyticsSent),
    externalServicesCalled: Boolean(input.externalServicesCalled),
    liveAiOrchestrationEnabled: Boolean(input.liveAiOrchestrationEnabled),
    hiddenPersonalizationCreated: Boolean(input.hiddenPersonalizationCreated),
    noDivineCertaintyClaimed: true,
    generatedAt: new Date().toISOString()
  };
  const category = classifyBetaSupportRequest(base);
  return {
    ...base,
    category,
    severity: getBetaSupportSeverity({ ...base, category }),
    sanitized: true,
    rawSensitiveTextStored: false
  };
}

export function sanitizeBetaSupportRequest(request: TeoyubeBetaSupportRequest): TeoyubeBetaSupportRequest {
  return {
    ...request,
    summary: redactText(request.summary),
    redactedNotes: request.redactedNotes.map(redactText),
    sanitized: true,
    rawSensitiveTextStored: false
  };
}

export function getBetaSupportBoundaries(): TeoyubeBetaSupportBoundary[] {
  return [
    { id: "no_professional_advice", category: "all", label: "No professional advice", required: true, details: "Do not provide medical, legal, financial, emergency, or professional counseling advice." },
    { id: "emergency_manual_escalation", category: "emergency_or_crisis", label: "Emergency manual escalation", required: true, details: "Emergency or crisis concerns must be escalated manually to appropriate emergency or crisis resources." },
    { id: "no_divine_certainty", category: "all", label: "No divine certainty", required: true, details: "Do not claim divine certainty or treat Teoyube output as a direct command from God." },
    { id: "preserve_scripture_explanation", category: "all", label: "Preserve Scripture/explanation", required: true, details: "Preserve Scripture anchoring and explanation paths." },
    { id: "preserve_privacy_consent", category: "privacy_consent_question", label: "Preserve privacy/consent", required: true, details: "Preserve privacy and consent boundaries." },
    { id: "no_raw_sensitive_storage", category: "sensitive_information_submitted", label: "No raw sensitive storage", required: true, details: "Do not store raw sensitive text by default." },
    { id: "no_automatic_contact", category: "all", label: "No automatic contact", required: true, details: "Do not contact users automatically." }
  ];
}

export function getBetaSupportRecommendedResponse(request: TeoyubeBetaSupportRequest): TeoyubeBetaSupportRecommendedResponse {
  const sanitized = sanitizeBetaSupportRequest(request);
  const severity = getBetaSupportSeverity(sanitized);
  const category = classifyBetaSupportRequest(sanitized);
  const summary = severity === "critical"
    ? "Pause automated handling and route this item to immediate manual owner review. Do not provide professional advice."
    : severity === "high"
      ? "Route to manual owner review and preserve Scripture, explanation, fallback, confidence, privacy, and consent boundaries."
      : "Document for manual beta support review and triage if the issue repeats.";
  return { requestId: request.id, category, severity, summary, manualOnly: true, sendAutomatically: false, externalServiceRequired: false };
}

export function getBetaSupportWorkflowBlockers(requests: TeoyubeBetaSupportRequest[]): TeoyubeBetaSupportWorkflowBlocker[] {
  return requests.flatMap((request) => {
    const sanitized = sanitizeBetaSupportRequest(request);
    const category = classifyBetaSupportRequest(sanitized);
    const severity = getBetaSupportSeverity(sanitized);
    const blockers: TeoyubeBetaSupportWorkflowBlocker[] = [];
    if (request.rawSensitiveTextStored) blockers.push({ id: `${request.id}_raw_sensitive`, category, severity: "critical", message: "Raw sensitive support text must not be stored by default.", requiredAction: "Sanitize the support request." });
    if (request.usersContacted || request.feedbackCollectedAutomatically || request.publicUrlFetched || request.databaseWritten || request.analyticsSent || request.externalServicesCalled || request.liveAiOrchestrationEnabled) blockers.push({ id: `${request.id}_side_effect`, category, severity: "critical", message: "Support workflow attempted an external side effect.", requiredAction: "Keep support workflow manual, in memory, and service-disabled." });
    if (request.hiddenPersonalizationCreated) blockers.push({ id: `${request.id}_hidden_personalization`, category, severity: "critical", message: "Support workflow must not create hidden personalization.", requiredAction: "Keep personalization visible and consent-aware." });
    return blockers;
  });
}

export function getBetaSupportWorkflowWarnings(requests: TeoyubeBetaSupportRequest[]): TeoyubeBetaSupportWorkflowWarning[] {
  return requests.flatMap((request) => {
    const sanitized = sanitizeBetaSupportRequest(request);
    const category = classifyBetaSupportRequest(sanitized);
    const severity = getBetaSupportSeverity(sanitized);
    const warnings: TeoyubeBetaSupportWorkflowWarning[] = [];
    if (category === "unknown") warnings.push({ id: `${request.id}_unknown_category`, category, severity: "medium", message: "Support request needs a clearer manual category.", recommendedAction: "Review and assign a support category." });
    if (severity === "critical" || category === "emergency_or_crisis") warnings.push({ id: `${request.id}_critical_manual_escalation`, category, severity: "critical", message: "Emergency or crisis concern requires manual escalation.", recommendedAction: "Escalate manually to appropriate emergency or crisis resources without providing professional advice." });
    if (severity === "high" || category === "professional_advice_request") warnings.push({ id: `${request.id}_owner_review`, category, severity: "high", message: "Support request should be reviewed by the owner.", recommendedAction: "Route to manual owner review." });
    return warnings;
  });
}

function createDecision(requests: TeoyubeBetaSupportRequest[]): TeoyubeBetaSupportWorkflowDecision {
  const blockers = getBetaSupportWorkflowBlockers(requests);
  if (!requests.length) return "empty";
  if (blockers.length) return "blocked";
  if (requests.some((request) => getBetaSupportSeverity(request) === "critical")) return "pause_and_review";
  if (requests.some((request) => getBetaSupportSeverity(request) === "high")) return "escalate_to_owner_review";
  return "document_for_manual_review";
}

export function createBetaSupportWorkflowReport(requests: TeoyubeBetaSupportRequest[] = []): TeoyubeBetaSupportWorkflowReport {
  const sanitized = requests.map(sanitizeBetaSupportRequest);
  const blockers = getBetaSupportWorkflowBlockers(requests);
  const warnings = getBetaSupportWorkflowWarnings(sanitized);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : sanitized.length ? "ready" : "empty",
    decision: createDecision(sanitized),
    requests: sanitized,
    boundaries: getBetaSupportBoundaries(),
    recommendedResponses: sanitized.map(getBetaSupportRecommendedResponse),
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    sanitizedOnly: sanitized.every((request) => request.sanitized && !request.rawSensitiveTextStored),
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noExternalServicesRequired: true,
    noLiveAiOrchestrationEnabled: true,
    noProfessionalAdviceProvided: true,
    noDivineCertaintyClaimed: true,
    generatedAt: new Date().toISOString()
  };
}
