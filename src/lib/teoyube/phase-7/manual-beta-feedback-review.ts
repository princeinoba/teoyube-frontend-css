import type {
  TeoyubeManualBetaFeedbackCategory,
  TeoyubeManualBetaFeedbackItem,
  TeoyubeManualBetaFeedbackPrivacyFlag,
  TeoyubeManualBetaFeedbackReview,
  TeoyubeManualBetaFeedbackReviewBlocker,
  TeoyubeManualBetaFeedbackReviewDecision,
  TeoyubeManualBetaFeedbackReviewReport,
  TeoyubeManualBetaFeedbackReviewResult,
  TeoyubeManualBetaFeedbackReviewWarning
} from "./manual-beta-feedback-review-contracts";

export type TeoyubeManualBetaFeedbackInput = Partial<Omit<TeoyubeManualBetaFeedbackItem, "manualOnly" | "generatedAt">> & {
  rawText?: string;
  notes?: string[];
};

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
const SECRET_PATTERN = /\b(?:api[_-]?key|token|password|secret)\s*[:=]\s*\S+/gi;
const CRISIS_PATTERN = /self harm|suicide|crisis|danger|abuse|emergency|urgent harm/i;
const PROFESSIONAL_PATTERN = /medical|legal|financial|diagnosis|therapy|doctor|lawyer|investment|tax|prescribe|professional advice/i;
const SPIRITUAL_SAFETY_PATTERN = /god told me|divine certainty|guaranteed calling|command from god/i;

function feedbackId(): string {
  return `manual_beta_feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function redactText(value: string): string {
  return value
    .replace(EMAIL_PATTERN, "[redacted-email]")
    .replace(PHONE_PATTERN, "[redacted-phone]")
    .replace(SECRET_PATTERN, "[redacted-secret]");
}

function detectFlags(value: string, explicit: TeoyubeManualBetaFeedbackPrivacyFlag[] = []): TeoyubeManualBetaFeedbackPrivacyFlag[] {
  const flags = new Set<TeoyubeManualBetaFeedbackPrivacyFlag>(explicit.filter((flag) => flag !== "none"));
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

function categoryFromText(value: string, fallback: TeoyubeManualBetaFeedbackCategory = "unknown"): TeoyubeManualBetaFeedbackCategory {
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

function severityFromFlags(flags: TeoyubeManualBetaFeedbackPrivacyFlag[], category: TeoyubeManualBetaFeedbackCategory, requested?: TeoyubeManualBetaFeedbackItem["severity"]): TeoyubeManualBetaFeedbackItem["severity"] {
  if (flags.includes("emergency_or_crisis") || flags.includes("contains_secret")) return "critical";
  if (flags.includes("medical_legal_financial") || flags.includes("professional_advice") || category === "privacy_consent") return "high";
  if (["scripture_anchor", "explanation_trace", "fallback", "confidence_label", "accessibility", "mobile"].includes(category)) return requested && requested !== "low" ? requested : "medium";
  return requested || "low";
}

export function createManualBetaFeedbackReview(input: { items?: TeoyubeManualBetaFeedbackItem[] } = {}): TeoyubeManualBetaFeedbackReview {
  return {
    id: "phase_7_1_manual_beta_feedback_review",
    items: (input.items || []).map(sanitizeManualBetaFeedbackItem),
    manualOnly: true,
    inMemoryOnly: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    noUsersContacted: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noHiddenPersonalizationCreated: true,
    generatedAt: new Date().toISOString()
  };
}

export function createManualBetaFeedbackItem(input: TeoyubeManualBetaFeedbackInput = {}): TeoyubeManualBetaFeedbackItem {
  const rawText = input.rawText || input.summary || "Manual beta feedback pending summary.";
  const notes = input.notes || input.redactedNotes || (input.rawText ? [input.rawText] : []);
  const combined = `${rawText} ${notes.join(" ")}`;
  const category = categoryFromText(combined, input.category || "unknown");
  const privacyFlags = detectFlags(combined, input.privacyFlags);
  return sanitizeManualBetaFeedbackItem({
    id: input.id || feedbackId(),
    category,
    summary: input.summary || rawText,
    redactedNotes: notes,
    privacyFlags,
    severity: severityFromFlags(privacyFlags, category, input.severity),
    status: input.status || "open",
    source: input.source || "manual_owner_note",
    sanitized: input.sanitized ?? false,
    manualOnly: true,
    rawSensitiveTextStored: Boolean(input.rawSensitiveTextStored),
    feedbackCollectedAutomatically: Boolean(input.feedbackCollectedAutomatically),
    externalServicesCalled: Boolean(input.externalServicesCalled),
    databaseWritten: Boolean(input.databaseWritten),
    analyticsSent: Boolean(input.analyticsSent),
    hiddenPersonalizationCreated: Boolean(input.hiddenPersonalizationCreated),
    generatedAt: new Date().toISOString()
  });
}

export function redactManualBetaFeedbackSensitiveFields(item: TeoyubeManualBetaFeedbackItem): TeoyubeManualBetaFeedbackItem {
  const redactedSummary = redactText(item.summary);
  const redactedNotes = item.redactedNotes.map(redactText);
  const privacyFlags = detectFlags(`${item.summary} ${item.redactedNotes.join(" ")}`, item.privacyFlags);
  return {
    ...item,
    summary: redactedSummary,
    redactedNotes,
    privacyFlags,
    sanitized: true,
    rawSensitiveTextStored: false
  };
}

export function sanitizeManualBetaFeedbackItem(item: TeoyubeManualBetaFeedbackItem): TeoyubeManualBetaFeedbackItem {
  return redactManualBetaFeedbackSensitiveFields(item);
}

export function validateManualBetaFeedbackReviewItem(item: TeoyubeManualBetaFeedbackItem): TeoyubeManualBetaFeedbackReviewResult {
  const sanitized = sanitizeManualBetaFeedbackItem(item);
  const blockers: TeoyubeManualBetaFeedbackReviewBlocker[] = [];
  const warnings: TeoyubeManualBetaFeedbackReviewWarning[] = [];
  if (!sanitized.summary) blockers.push({ id: `${item.id}_summary_missing`, category: sanitized.category, message: "Manual feedback summary is required.", requiredAction: "Add a redacted summary before review." });
  if (item.rawSensitiveTextStored) blockers.push({ id: `${item.id}_raw_sensitive_text`, category: sanitized.category, message: "Raw sensitive feedback text must not be stored by default.", requiredAction: "Redact the feedback item and store only sanitized notes." });
  if (item.feedbackCollectedAutomatically || item.externalServicesCalled || item.databaseWritten || item.analyticsSent) blockers.push({ id: `${item.id}_external_side_effect`, category: sanitized.category, message: "Manual feedback review must not collect automatically, send externally, write a database, or send analytics.", requiredAction: "Keep feedback review manual and in memory." });
  if (item.hiddenPersonalizationCreated) blockers.push({ id: `${item.id}_hidden_personalization`, category: sanitized.category, message: "Feedback review must not create hidden personalization.", requiredAction: "Keep personalization visible and consent-aware." });
  if (sanitized.privacyFlags.some((flag) => flag !== "none")) warnings.push({ id: `${item.id}_privacy_review`, category: sanitized.category, message: `Manual privacy/safety review flags: ${sanitized.privacyFlags.join(", ")}.`, recommendedAction: "Review manually, redact more if needed, and do not provide professional advice." });
  if (sanitized.severity === "critical" || sanitized.severity === "high") warnings.push({ id: `${item.id}_high_severity`, category: sanitized.category, message: "Feedback item should be reviewed by the owner before triage.", recommendedAction: "Route to manual owner review." });
  return { valid: blockers.length === 0, item: sanitized, blockers, warnings };
}

export function addManualBetaFeedbackItem(review: TeoyubeManualBetaFeedbackReview, item: TeoyubeManualBetaFeedbackItem): TeoyubeManualBetaFeedbackReview {
  const validation = validateManualBetaFeedbackReviewItem(item);
  return {
    ...review,
    items: validation.valid ? [...review.items, validation.item] : review.items,
    generatedAt: new Date().toISOString()
  };
}

export function summarizeManualBetaFeedbackReview(review: TeoyubeManualBetaFeedbackReview) {
  const blockers = getManualBetaFeedbackReviewBlockers(review);
  const warnings = getManualBetaFeedbackReviewWarnings(review);
  return {
    itemCount: review.items.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    privacyReviewCount: review.items.filter((item) => item.privacyFlags.some((flag) => flag !== "none")).length,
    criticalCount: review.items.filter((item) => item.severity === "critical").length,
    highCount: review.items.filter((item) => item.severity === "high").length
  };
}

export function getManualBetaFeedbackReviewBlockers(review: TeoyubeManualBetaFeedbackReview): TeoyubeManualBetaFeedbackReviewBlocker[] {
  return review.items.flatMap((item) => validateManualBetaFeedbackReviewItem(item).blockers);
}

export function getManualBetaFeedbackReviewWarnings(review: TeoyubeManualBetaFeedbackReview): TeoyubeManualBetaFeedbackReviewWarning[] {
  return review.items.flatMap((item) => validateManualBetaFeedbackReviewItem(item).warnings);
}

export function createManualBetaFeedbackReviewDecision(review: TeoyubeManualBetaFeedbackReview): TeoyubeManualBetaFeedbackReviewDecision {
  const blockers = getManualBetaFeedbackReviewBlockers(review);
  const warnings = getManualBetaFeedbackReviewWarnings(review);
  if (!review.items.length) return "empty";
  if (blockers.length) return "blocked";
  if (warnings.some((entry) => entry.id.includes("privacy_review"))) return "needs_manual_privacy_review";
  return warnings.length ? "ready_with_warnings" : "ready_for_manual_issue_triage";
}

export function createManualBetaFeedbackReviewReport(review: TeoyubeManualBetaFeedbackReview = createManualBetaFeedbackReview()): TeoyubeManualBetaFeedbackReviewReport {
  const blockers = getManualBetaFeedbackReviewBlockers(review);
  const warnings = getManualBetaFeedbackReviewWarnings(review);
  const decision = createManualBetaFeedbackReviewDecision(review);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : review.items.length ? "ready" : "empty",
    decision,
    review,
    summary: summarizeManualBetaFeedbackReview(review),
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    sanitizedOnly: review.items.every((item) => item.sanitized && !item.rawSensitiveTextStored),
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    noUsersContacted: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noHiddenPersonalizationCreated: true,
    generatedAt: new Date().toISOString()
  };
}
