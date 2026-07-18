import type {
  TeoyubeManualFeedbackReviewSimulation,
  TeoyubeManualFeedbackReviewSimulationBlocker,
  TeoyubeManualFeedbackReviewSimulationCategory,
  TeoyubeManualFeedbackReviewSimulationDecision,
  TeoyubeManualFeedbackReviewSimulationItem,
  TeoyubeManualFeedbackReviewSimulationPrivacyFlag,
  TeoyubeManualFeedbackReviewSimulationReport,
  TeoyubeManualFeedbackReviewSimulationResult,
  TeoyubeManualFeedbackReviewSimulationWarning
} from "./manual-feedback-review-simulation-contracts";

export type TeoyubeManualFeedbackReviewSimulationInput = Partial<Omit<TeoyubeManualFeedbackReviewSimulationItem, "manualOnly" | "simulatedOnly" | "generatedAt">> & {
  rawText?: string;
  notes?: string[];
};

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
const SECRET_PATTERN = /\b(?:api[_-]?key|token|password|secret)\s*[:=]\s*\S+/gi;
const CRISIS_PATTERN = /self harm|suicide|crisis|danger|abuse|emergency|urgent harm/i;
const PROFESSIONAL_PATTERN = /medical|legal|financial|diagnosis|therapy|doctor|lawyer|investment|tax|prescribe|professional advice/i;
const SPIRITUAL_SAFETY_PATTERN = /god told me|divine certainty|guaranteed calling|command from god/i;

function now(): string {
  return new Date().toISOString();
}

function simulationItemId(): string {
  return `manual_feedback_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function redactText(value: string): string {
  return value
    .replace(EMAIL_PATTERN, "[redacted-email]")
    .replace(PHONE_PATTERN, "[redacted-phone]")
    .replace(SECRET_PATTERN, "[redacted-secret]");
}

function detectFlags(value: string, explicit: TeoyubeManualFeedbackReviewSimulationPrivacyFlag[] = []): TeoyubeManualFeedbackReviewSimulationPrivacyFlag[] {
  const flags = new Set<TeoyubeManualFeedbackReviewSimulationPrivacyFlag>(explicit.filter((flag) => flag !== "none"));
  if (EMAIL_PATTERN.test(value) || PHONE_PATTERN.test(value)) flags.add("contains_contact_info");
  EMAIL_PATTERN.lastIndex = 0;
  PHONE_PATTERN.lastIndex = 0;
  if (SECRET_PATTERN.test(value)) flags.add("contains_secret");
  SECRET_PATTERN.lastIndex = 0;
  if (/sensitive|private|personal|secret|medical|legal|financial/i.test(value)) flags.add("contains_sensitive_text");
  if (CRISIS_PATTERN.test(value)) flags.add("emergency_or_crisis");
  if (PROFESSIONAL_PATTERN.test(value)) flags.add("medical_legal_financial");
  if (/professional advice|diagnose|prescribe|legal advice|financial advice/i.test(value)) flags.add("professional_advice");
  if (SPIRITUAL_SAFETY_PATTERN.test(value)) flags.add("spiritual_safety_review");
  return flags.size ? Array.from(flags) : ["none"];
}

function categoryFromText(value: string, fallback: TeoyubeManualFeedbackReviewSimulationCategory = "unknown"): TeoyubeManualFeedbackReviewSimulationCategory {
  if (/scripture|verse|anchor/i.test(value)) return "scripture_anchor";
  if (/explanation|reason|trace|why/i.test(value)) return "explanation_trace";
  if (/fallback|empty|safe response/i.test(value)) return "fallback";
  if (/confidence|certainty|label/i.test(value)) return "confidence_label";
  if (/word card/i.test(value)) return "word_card";
  if (/promise table|promise cluster/i.test(value)) return "promise_table";
  if (/prayer/i.test(value)) return "prayer_companion";
  if (/calling|compass/i.test(value)) return "compass_experience";
  if (/response panel/i.test(value)) return "tig_response_panel";
  if (/graph/i.test(value)) return "tig_graph_explorer";
  if (/mobile|small screen|responsive/i.test(value)) return "mobile";
  if (/accessibility|screen reader|keyboard|focus|contrast|aria/i.test(value)) return "accessibility";
  if (/privacy|consent|terms|tracking/i.test(value)) return "privacy_consent";
  if (/clear|confusing|clarity/i.test(value)) return "content_clarity";
  if (/thank|helpful|positive|love/i.test(value)) return "positive_feedback";
  if (/feature|request|could you/i.test(value)) return "feature_request";
  if (/support|help|issue/i.test(value)) return "support_request";
  if (/sensitive|secret|emergency|medical|legal|financial/i.test(value)) return "sensitive_content";
  return fallback;
}

function severityFromFlags(
  flags: TeoyubeManualFeedbackReviewSimulationPrivacyFlag[],
  category: TeoyubeManualFeedbackReviewSimulationCategory,
  requested?: TeoyubeManualFeedbackReviewSimulationItem["severity"]
): TeoyubeManualFeedbackReviewSimulationItem["severity"] {
  if (flags.includes("emergency_or_crisis") || flags.includes("contains_secret")) return "critical";
  if (flags.includes("medical_legal_financial") || flags.includes("professional_advice") || category === "privacy_consent") return "high";
  if (["scripture_anchor", "explanation_trace", "fallback", "confidence_label", "accessibility", "mobile"].includes(category)) return requested && requested !== "low" ? requested : "medium";
  return requested || "low";
}

export function createManualFeedbackReviewSimulation(input: { id?: string; items?: TeoyubeManualFeedbackReviewSimulationItem[] } = {}): TeoyubeManualFeedbackReviewSimulation {
  return {
    id: input.id || "phase_7_2_manual_feedback_review_simulation",
    items: (input.items || []).map(sanitizeSimulatedManualFeedbackReviewItem),
    simulatedOnly: true,
    manualOnly: true,
    inMemoryOnly: true,
    noFeedbackCollectedAutomatically: true,
    noUsersContacted: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalWrite: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noHiddenPersonalizationCreated: true,
    generatedAt: now()
  };
}

export function createSimulatedManualFeedbackReviewItem(input: TeoyubeManualFeedbackReviewSimulationInput = {}): TeoyubeManualFeedbackReviewSimulationItem {
  const rawText = input.rawText || input.summary || "Simulated manual feedback pending summary.";
  const notes = input.notes || input.redactedNotes || (input.rawText ? [input.rawText] : []);
  const combined = `${rawText} ${notes.join(" ")}`;
  const category = categoryFromText(combined, input.category || "unknown");
  const privacyFlags = detectFlags(combined, input.privacyFlags);
  return sanitizeSimulatedManualFeedbackReviewItem({
    id: input.id || simulationItemId(),
    category,
    summary: input.summary || rawText,
    redactedNotes: notes,
    privacyFlags,
    severity: severityFromFlags(privacyFlags, category, input.severity),
    status: input.status || "open",
    source: input.source || "simulated_note",
    simulatedOnly: true,
    manualOnly: true,
    sanitized: input.sanitized ?? false,
    rawSensitiveTextStored: Boolean(input.rawSensitiveTextStored),
    feedbackCollectedAutomatically: Boolean(input.feedbackCollectedAutomatically),
    usersContacted: Boolean(input.usersContacted),
    publicUrlFetched: Boolean(input.publicUrlFetched),
    externalServicesCalled: Boolean(input.externalServicesCalled),
    databaseWritten: Boolean(input.databaseWritten),
    analyticsSent: Boolean(input.analyticsSent),
    monitoringProviderConnected: Boolean(input.monitoringProviderConnected),
    liveAiOrchestrationEnabled: Boolean(input.liveAiOrchestrationEnabled),
    hiddenPersonalizationCreated: Boolean(input.hiddenPersonalizationCreated),
    generatedAt: now()
  });
}

export function redactSimulatedManualFeedbackSensitiveFields(item: TeoyubeManualFeedbackReviewSimulationItem): TeoyubeManualFeedbackReviewSimulationItem {
  const combined = `${item.summary} ${item.redactedNotes.join(" ")}`;
  return {
    ...item,
    summary: redactText(item.summary),
    redactedNotes: item.redactedNotes.map(redactText),
    privacyFlags: detectFlags(combined, item.privacyFlags),
    sanitized: true,
    rawSensitiveTextStored: false
  };
}

export function sanitizeSimulatedManualFeedbackReviewItem(item: TeoyubeManualFeedbackReviewSimulationItem): TeoyubeManualFeedbackReviewSimulationItem {
  return redactSimulatedManualFeedbackSensitiveFields(item);
}

export function validateSimulatedManualFeedbackReviewItem(item: TeoyubeManualFeedbackReviewSimulationItem): TeoyubeManualFeedbackReviewSimulationResult {
  const sanitized = sanitizeSimulatedManualFeedbackReviewItem(item);
  const blockers: TeoyubeManualFeedbackReviewSimulationBlocker[] = [];
  const warnings: TeoyubeManualFeedbackReviewSimulationWarning[] = [];
  if (!sanitized.summary.trim()) blockers.push({ id: `${item.id}_summary_missing`, itemId: item.id, category: sanitized.category, message: "Simulated feedback summary is required.", requiredAction: "Add a redacted simulated summary before review." });
  if (item.rawSensitiveTextStored) blockers.push({ id: `${item.id}_raw_sensitive_text`, itemId: item.id, category: sanitized.category, message: "Raw sensitive simulated feedback text must not be stored by default.", requiredAction: "Redact the item and store only sanitized simulation notes." });
  if (item.feedbackCollectedAutomatically || item.usersContacted || item.publicUrlFetched || item.externalServicesCalled || item.databaseWritten || item.analyticsSent || item.monitoringProviderConnected || item.liveAiOrchestrationEnabled) {
    blockers.push({ id: `${item.id}_side_effect`, itemId: item.id, category: sanitized.category, message: "Manual feedback review simulation must not contact users, collect automatically, fetch URLs, connect services, persist, monitor, send analytics, or run live AI.", requiredAction: "Keep Phase 7.2 feedback simulation manual, in memory, and service-disabled." });
  }
  if (item.hiddenPersonalizationCreated) blockers.push({ id: `${item.id}_hidden_personalization`, itemId: item.id, category: sanitized.category, message: "Feedback simulation must not create hidden personalization.", requiredAction: "Keep all personalization visible, consent-aware, and simulated only." });
  if (sanitized.privacyFlags.some((flag) => flag !== "none")) warnings.push({ id: `${item.id}_privacy_review`, itemId: item.id, category: sanitized.category, message: `Manual privacy/safety review flags: ${sanitized.privacyFlags.join(", ")}.`, recommendedAction: "Review manually, redact more if needed, and do not provide professional advice." });
  if (sanitized.severity === "critical" || sanitized.severity === "high") warnings.push({ id: `${item.id}_owner_review`, itemId: item.id, category: sanitized.category, message: "Simulated feedback should be reviewed by the owner before issue conversion.", recommendedAction: "Route to manual owner review." });
  if (["scripture_anchor", "explanation_trace", "fallback", "confidence_label", "mobile", "accessibility", "privacy_consent", "support_request", "content_clarity"].includes(sanitized.category)) {
    warnings.push({ id: `${item.id}_issue_triage_candidate`, itemId: item.id, category: sanitized.category, message: "Simulated feedback may need support issue triage.", recommendedAction: "Convert to an in-memory support issue if confirmed by owner review." });
  }
  return { valid: blockers.length === 0, item: sanitized, blockers, warnings };
}

export function addSimulatedManualFeedbackReviewItem(
  simulation: TeoyubeManualFeedbackReviewSimulation,
  item: TeoyubeManualFeedbackReviewSimulationItem
): TeoyubeManualFeedbackReviewSimulation {
  const validation = validateSimulatedManualFeedbackReviewItem(item);
  return {
    ...simulation,
    items: validation.valid ? [...simulation.items, validation.item] : simulation.items,
    generatedAt: now()
  };
}

export function getManualFeedbackReviewSimulationBlockers(simulation: TeoyubeManualFeedbackReviewSimulation): TeoyubeManualFeedbackReviewSimulationBlocker[] {
  const boundaryBlocker = !simulation.manualOnly || !simulation.inMemoryOnly || !simulation.noFeedbackCollectedAutomatically || !simulation.noUsersContacted || !simulation.noPublicUrlsFetchedAutomatically || !simulation.noExternalWrite || !simulation.noDatabasePersistenceEnabled || !simulation.noAnalyticsEnabled || !simulation.noMonitoringProviderConnected || !simulation.noLiveAiOrchestrationEnabled || !simulation.noHiddenPersonalizationCreated
    ? [{
        id: "manual_feedback_simulation_boundary_broken",
        category: "unknown" as const,
        message: "Manual feedback review simulation must remain simulated, manual, in-memory, no-contact, no-auto-collection, no-URL-fetch, no-service, no-persistence, no-analytics, no-monitoring-provider, no-live-AI, and no-hidden-personalization.",
        requiredAction: "Restore Phase 7.2 simulation boundaries before continuing."
      }]
    : [];
  return [
    ...boundaryBlocker,
    ...simulation.items.flatMap((item) => validateSimulatedManualFeedbackReviewItem(item).blockers)
  ];
}

export function getManualFeedbackReviewSimulationWarnings(simulation: TeoyubeManualFeedbackReviewSimulation): TeoyubeManualFeedbackReviewSimulationWarning[] {
  return simulation.items.flatMap((item) => validateSimulatedManualFeedbackReviewItem(item).warnings);
}

export function summarizeManualFeedbackReviewSimulation(simulation: TeoyubeManualFeedbackReviewSimulation) {
  const blockers = getManualFeedbackReviewSimulationBlockers(simulation);
  const warnings = getManualFeedbackReviewSimulationWarnings(simulation);
  return {
    itemCount: simulation.items.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    privacyReviewCount: simulation.items.filter((item) => item.privacyFlags.some((flag) => flag !== "none")).length,
    issueTriageCandidateCount: warnings.filter((entry) => entry.id.endsWith("_issue_triage_candidate")).length,
    criticalCount: simulation.items.filter((item) => item.severity === "critical").length,
    highCount: simulation.items.filter((item) => item.severity === "high").length
  };
}

export function createManualFeedbackReviewSimulationDecision(simulation: TeoyubeManualFeedbackReviewSimulation): TeoyubeManualFeedbackReviewSimulationDecision {
  const blockers = getManualFeedbackReviewSimulationBlockers(simulation);
  const warnings = getManualFeedbackReviewSimulationWarnings(simulation);
  if (!simulation.items.length) return "unknown";
  if (blockers.length) return "simulation_blocked";
  if (warnings.some((entry) => entry.id.endsWith("_owner_review") || entry.id.endsWith("_privacy_review"))) return "needs_owner_review";
  if (warnings.some((entry) => entry.id.endsWith("_issue_triage_candidate"))) return "needs_issue_triage";
  return warnings.length ? "simulation_passed_with_warnings" : "simulation_passed";
}

export function createManualFeedbackReviewSimulationReport(
  simulation: TeoyubeManualFeedbackReviewSimulation = createManualFeedbackReviewSimulation()
): TeoyubeManualFeedbackReviewSimulationReport {
  const blockers = getManualFeedbackReviewSimulationBlockers(simulation);
  const warnings = getManualFeedbackReviewSimulationWarnings(simulation);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : simulation.items.length ? "ready" : "empty",
    decision: createManualFeedbackReviewSimulationDecision(simulation),
    simulation,
    summary: summarizeManualFeedbackReviewSimulation(simulation),
    blockers,
    warnings,
    simulatedOnly: true,
    manualOnly: true,
    inMemoryOnly: true,
    sanitizedOnly: simulation.items.every((item) => item.sanitized && !item.rawSensitiveTextStored),
    noFeedbackCollectedAutomatically: true,
    noUsersContacted: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalWrite: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noHiddenPersonalizationCreated: true,
    generatedAt: now()
  };
}
