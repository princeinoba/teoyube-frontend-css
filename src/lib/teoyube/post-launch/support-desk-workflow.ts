import type {
  TeoyubeSupportDeskBlocker,
  TeoyubeSupportDeskReport,
  TeoyubeSupportDeskStatus,
  TeoyubeSupportDeskWarning,
  TeoyubeSupportTicket,
  TeoyubeSupportTicketCategory,
  TeoyubeSupportTicketDecision,
  TeoyubeSupportTicketSeverity
} from "./support-desk-contracts";

export type TeoyubeSupportTicketInput = Partial<Omit<TeoyubeSupportTicket, "manuallyEntered" | "manualOnly">> & {
  rawUserText?: string;
};

const CATEGORY_PATTERNS: Array<[TeoyubeSupportTicketCategory, RegExp]> = [
  ["app_not_loading", /app not loading|blank screen|crash|cannot open|white screen/i],
  ["mobile_layout", /mobile|layout|small screen|responsive|viewport/i],
  ["accessibility", /accessibility|screen reader|keyboard|contrast|focus|aria/i],
  ["privacy_terms_consent", /privacy|terms|consent|notice|tracking/i],
  ["scripture_anchor", /scripture|verse|anchor|biblical/i],
  ["explanation_path", /explanation|why this|reasoning|path/i],
  ["fallback", /fallback|offline|empty response|could not answer/i],
  ["confidence_label", /confidence|certainty|certain|guarantee/i],
  ["ai_companion", /ai companion|companion|chat/i],
  ["prayer_companion", /prayer|pray/i],
  ["calling_compass", /calling compass|calling|vocation|purpose/i],
  ["promise_cluster", /promise cluster|promise|cluster/i],
  ["personalization", /personalization|personalized|memory|preference/i],
  ["feedback", /feedback|suggestion|request/i],
  ["sensitive_information", /sensitive|secret|password|api key|token|ssn|medical|legal|financial|crisis|emergency/i],
  ["spiritual_content", /spiritual|divine|god told me|certainty from god/i]
];

const CRISIS_PATTERNS = /self harm|suicide|crisis|danger|abuse|emergency|urgent harm/i;
const MEDICAL_PATTERNS = /medical|diagnosis|doctor|prescription|therapy|clinical/i;
const LEGAL_PATTERNS = /legal|lawyer|lawsuit|court|attorney/i;
const FINANCIAL_PATTERNS = /financial|investment|loan|debt|tax|bankruptcy/i;
const PROFESSIONAL_ADVICE_PATTERNS = /medical advice|legal advice|financial advice|diagnose|prescribe|guaranteed outcome/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
const SECRET_PATTERN = /\b(?:api[_-]?key|token|password|secret)\s*[:=]\s*\S+/gi;

function normalizeText(value: string): string {
  return value.replace(EMAIL_PATTERN, "[redacted-email]").replace(PHONE_PATTERN, "[redacted-phone]").replace(SECRET_PATTERN, "[redacted-secret]");
}

function ticketText(ticket: Pick<TeoyubeSupportTicket, "category" | "summary" | "redactedNotes">): string {
  return `${ticket.category} ${ticket.summary} ${ticket.redactedNotes.join(" ")}`;
}

export function createSupportDeskWorkflow() {
  return {
    id: "post_launch_7_2_support_desk_workflow",
    label: "Post-Launch Operations 7.2 Support Desk Workflow",
    steps: [
      "manual_ticket_entry",
      "sanitize_ticket_text",
      "classify_support_category",
      "assign_manual_review_severity",
      "flag_crisis_medical_legal_financial_concerns",
      "preserve_scripture_explanation_fallback_guardrails",
      "route_privacy_terms_consent_items_to_owner_review",
      "create_weekly_improvement_candidates",
      "complete_weekly_owner_review"
    ],
    manualOnly: true,
    inMemoryOnly: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noAnalyticsSent: true,
    noDatabaseWrites: true,
    noLiveAiOrchestrationEnabled: true,
    noProfessionalAdviceProvided: true
  };
}

export function classifySupportTicket(ticket: Pick<TeoyubeSupportTicket, "category" | "summary" | "redactedNotes">): TeoyubeSupportTicketCategory {
  const value = ticketText(ticket);
  const match = CATEGORY_PATTERNS.find((entry) => entry[1].test(value));
  return match ? match[0] : ticket.category || "unknown";
}

export function getSupportTicketSeverity(ticket: Pick<TeoyubeSupportTicket, "category" | "summary" | "redactedNotes" | "severity"> & Partial<TeoyubeSupportTicket>): TeoyubeSupportTicketSeverity {
  const category = classifySupportTicket(ticket as TeoyubeSupportTicket);
  const value = ticketText({ ...ticket, category } as TeoyubeSupportTicket);
  if (ticket.emergencyConcern || ticket.crisisConcern || CRISIS_PATTERNS.test(value)) return "critical";
  if (ticket.rawSensitiveTextStored || ticket.usersContacted || ticket.publicUrlFetched || ticket.databaseWritten || ticket.analyticsSent || ticket.liveAiOrchestrationEnabled) return "critical";
  if (ticket.medicalConcern || ticket.legalConcern || ticket.financialConcern || MEDICAL_PATTERNS.test(value) || LEGAL_PATTERNS.test(value) || FINANCIAL_PATTERNS.test(value)) return "high";
  if (["app_not_loading", "privacy_terms_consent", "scripture_anchor", "explanation_path", "fallback", "sensitive_information", "spiritual_content"].includes(category)) return "high";
  if (ticket.severity && ticket.severity !== "unknown") return ticket.severity;
  if (["mobile_layout", "accessibility", "confidence_label", "personalization"].includes(category)) return "medium";
  return "low";
}

export function createSupportTicket(input: TeoyubeSupportTicketInput = {}): TeoyubeSupportTicket {
  const rawText = input.rawUserText || input.summary || "";
  const redactedSummary = normalizeText(input.summary || rawText || "Manual support item pending summary.");
  const redactedNotes = (input.redactedNotes || (rawText ? [rawText] : [])).map(normalizeText);
  const baseCategory = input.category || "unknown";
  const detectedCategory = classifySupportTicket({ category: baseCategory, summary: redactedSummary, redactedNotes });
  const value = `${redactedSummary} ${redactedNotes.join(" ")}`;
  const emergencyConcern = Boolean(input.emergencyConcern || CRISIS_PATTERNS.test(value));
  const medicalConcern = Boolean(input.medicalConcern || MEDICAL_PATTERNS.test(value));
  const legalConcern = Boolean(input.legalConcern || LEGAL_PATTERNS.test(value));
  const financialConcern = Boolean(input.financialConcern || FINANCIAL_PATTERNS.test(value));
  const professionalAdviceRequested = Boolean(input.professionalAdviceRequested || PROFESSIONAL_ADVICE_PATTERNS.test(value));
  const ticket: TeoyubeSupportTicket = {
    id: input.id || `support_ticket_${Date.now()}`,
    source: input.source || "manual_support",
    category: detectedCategory,
    summary: redactedSummary,
    redactedNotes,
    severity: input.severity || "unknown",
    decision: input.decision || "unknown",
    manuallyEntered: true,
    manualOnly: true,
    sanitized: input.sanitized ?? true,
    emergencyConcern,
    medicalConcern,
    legalConcern,
    financialConcern,
    crisisConcern: Boolean(input.crisisConcern || emergencyConcern),
    professionalAdviceRequested,
    scriptureAnchoringRequired: true,
    explanationPathsRequired: true,
    fallbackSafetyRequired: true,
    consentControlsRequired: true,
    privacyTermsConsentNoticesRequired: true,
    noDivineCertaintyClaimed: true,
    rawSensitiveTextStored: Boolean(input.rawSensitiveTextStored),
    usersContacted: Boolean(input.usersContacted),
    feedbackCollectedAutomatically: Boolean(input.feedbackCollectedAutomatically),
    publicUrlFetched: Boolean(input.publicUrlFetched),
    databaseWritten: Boolean(input.databaseWritten),
    analyticsSent: Boolean(input.analyticsSent),
    externalServicesCalled: Boolean(input.externalServicesCalled),
    liveAiOrchestrationEnabled: Boolean(input.liveAiOrchestrationEnabled),
    hiddenPersonalizationCreated: Boolean(input.hiddenPersonalizationCreated),
    generatedAt: input.generatedAt || new Date().toISOString()
  };
  const severity = getSupportTicketSeverity(ticket);
  return {
    ...ticket,
    severity,
    decision: input.decision || (severity === "critical" ? "pause_and_review" : severity === "high" ? "escalate_to_owner_review" : "document_for_weekly_review")
  };
}

export function sanitizeSupportTicket(ticket: TeoyubeSupportTicket): TeoyubeSupportTicket {
  return {
    ...ticket,
    summary: normalizeText(ticket.summary),
    redactedNotes: ticket.redactedNotes.map(normalizeText),
    sanitized: true,
    rawSensitiveTextStored: false
  };
}

export function getSupportDeskBlockers(tickets: TeoyubeSupportTicket[]): TeoyubeSupportDeskBlocker[] {
  return tickets.flatMap((ticket) => {
    const blockers: TeoyubeSupportDeskBlocker[] = [];
    const severity = getSupportTicketSeverity(ticket);
    const category = classifySupportTicket(ticket);
    const label = ticket.summary || ticket.id;
    if (ticket.rawSensitiveTextStored) {
      blockers.push({ id: `${ticket.id}_raw_sensitive_text`, label, category, severity: "critical", reason: "Raw sensitive support text must not be stored by default.", requiredAction: "Sanitize or redact the support ticket before review." });
    }
    if (ticket.usersContacted || ticket.feedbackCollectedAutomatically || ticket.publicUrlFetched || ticket.databaseWritten || ticket.analyticsSent || ticket.externalServicesCalled || ticket.liveAiOrchestrationEnabled) {
      blockers.push({ id: `${ticket.id}_external_side_effect`, label, category, severity: "critical", reason: "Support workflow attempted an external side effect.", requiredAction: "Keep support desk actions manual, in-memory, and owner-controlled." });
    }
    if (ticket.hiddenPersonalizationCreated) {
      blockers.push({ id: `${ticket.id}_hidden_personalization`, label, category, severity: "critical", reason: "Support workflow must not create hidden personalization.", requiredAction: "Keep personalization visible, consent-aware, and separately reviewed." });
    }
    if (severity === "critical" || ticket.emergencyConcern || ticket.crisisConcern) {
      blockers.push({ id: `${ticket.id}_critical_manual_review`, label, category, severity: "critical", reason: "Emergency, crisis, or critical support concern requires immediate manual owner review.", requiredAction: "Pause automated handling and route to human review without providing professional advice." });
    }
    return blockers;
  });
}

export function getSupportDeskWarnings(tickets: TeoyubeSupportTicket[]): TeoyubeSupportDeskWarning[] {
  return tickets.flatMap((ticket) => {
    const warnings: TeoyubeSupportDeskWarning[] = [];
    const category = classifySupportTicket(ticket);
    const severity = getSupportTicketSeverity(ticket);
    const label = ticket.summary || ticket.id;
    if (category === "unknown") warnings.push({ id: `${ticket.id}_unknown_category`, label, category, severity: "medium", message: "Support ticket needs a clearer manual category.", recommendedAction: "Review the redacted ticket and assign the closest support category." });
    if (severity === "high" || ticket.medicalConcern || ticket.legalConcern || ticket.financialConcern || ticket.professionalAdviceRequested) {
      warnings.push({ id: `${ticket.id}_professional_manual_review`, label, category, severity: "high", message: "Support ticket references medical, legal, financial, or professional-advice territory.", recommendedAction: "Route to owner review and do not provide professional advice." });
    }
    if (!ticket.sanitized) warnings.push({ id: `${ticket.id}_not_sanitized`, label, category, severity: "medium", message: "Support ticket should be sanitized before weekly review.", recommendedAction: "Run sanitizeSupportTicket before including this item in reports." });
    return warnings;
  });
}

export function validateSupportTicket(ticket: TeoyubeSupportTicket) {
  const blockers = getSupportDeskBlockers([ticket]);
  const warnings = getSupportDeskWarnings([ticket]);
  return { valid: blockers.length === 0, blockers, warnings };
}

function createDecision(tickets: TeoyubeSupportTicket[]): TeoyubeSupportTicketDecision {
  const blockers = getSupportDeskBlockers(tickets);
  if (blockers.some((entry) => entry.severity === "critical")) return "blocked";
  if (tickets.some((ticket) => getSupportTicketSeverity(ticket) === "high")) return "escalate_to_owner_review";
  if (tickets.some((ticket) => shouldTicketBecomeFixCandidate(ticket))) return "create_fix_candidate";
  return "document_for_weekly_review";
}

function shouldTicketBecomeFixCandidate(ticket: TeoyubeSupportTicket): boolean {
  return ["app_not_loading", "mobile_layout", "accessibility", "scripture_anchor", "explanation_path", "fallback", "confidence_label", "ai_companion", "prayer_companion", "calling_compass", "promise_cluster", "personalization"].includes(classifySupportTicket(ticket));
}

export function createSupportDeskReport(tickets: TeoyubeSupportTicket[] = []): TeoyubeSupportDeskReport {
  const inputBlockers = getSupportDeskBlockers(tickets);
  const sanitizedTickets = tickets.map(sanitizeSupportTicket);
  const blockers = [...inputBlockers, ...getSupportDeskBlockers(sanitizedTickets)];
  const warnings = getSupportDeskWarnings(sanitizedTickets);
  const status: TeoyubeSupportDeskStatus = blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : sanitizedTickets.length ? "ready" : "empty";
  return {
    status,
    ready: blockers.length === 0,
    decision: createDecision(sanitizedTickets),
    ticketCount: sanitizedTickets.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    tickets: sanitizedTickets,
    blockers,
    warnings,
    manualOnly: true,
    sanitizedOnly: sanitizedTickets.every((ticket) => ticket.sanitized && !ticket.rawSensitiveTextStored),
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noAnalyticsSent: true,
    noDatabaseWrites: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    noProfessionalAdviceProvided: true,
    noDivineCertaintyClaimed: true,
    generatedAt: new Date().toISOString()
  };
}
