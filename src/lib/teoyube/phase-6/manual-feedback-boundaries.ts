import type {
  TeoyubeManualFeedbackBoundaryBlocker,
  TeoyubeManualFeedbackBoundaryDecision,
  TeoyubeManualFeedbackBoundaryReport,
  TeoyubeManualFeedbackBoundaryRule,
  TeoyubeManualFeedbackBoundaryStatus,
  TeoyubeManualFeedbackBoundaryWarning,
  TeoyubeManualFeedbackItem,
  TeoyubeManualFeedbackPrivacyFlag
} from "./manual-feedback-boundary-contracts";

export type TeoyubeManualFeedbackBoundaryInput = Partial<{
  feedback: TeoyubeManualFeedbackItem[];
  automaticCollectionEnabled: boolean;
  databaseStorageEnabled: boolean;
  analyticsEnabled: boolean;
  hiddenPersonalizationEnabled: boolean;
  rawSensitiveTextStorageEnabled: boolean;
}>;

function now(): string {
  return new Date().toISOString();
}

function rule(id: string, label: string, satisfied: boolean, details: string): TeoyubeManualFeedbackBoundaryRule {
  return { id, label, required: true, satisfied, details };
}

export function createManualFeedbackBoundaryRules(input: TeoyubeManualFeedbackBoundaryInput = {}): TeoyubeManualFeedbackBoundaryRule[] {
  return [
    rule("manual_only", "Feedback is manual only", !input.automaticCollectionEnabled, "No automatic feedback intake is enabled."),
    rule("no_database_storage", "No database storage", !input.databaseStorageEnabled, "Feedback is not stored in a database."),
    rule("no_analytics", "No analytics", !input.analyticsEnabled, "Feedback is not sent to analytics."),
    rule("no_hidden_personalization", "No hidden personalization", !input.hiddenPersonalizationEnabled, "Feedback must not become hidden personalization."),
    rule("no_raw_sensitive_text_storage", "No raw sensitive text storage by default", !input.rawSensitiveTextStorageEnabled, "Sensitive feedback must be redacted manually before any future storage.")
  ];
}

export function sanitizeManualFeedbackNote(note: string): string {
  return note
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[redacted-phone]")
    .replace(/\b(?:ssn|social security|credit card|password|diagnose|suicidal|self harm)\b/gi, "[sensitive-term]")
    .trim();
}

function flagsForNote(note: string): TeoyubeManualFeedbackPrivacyFlag[] {
  const flags: TeoyubeManualFeedbackPrivacyFlag[] = [];
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(note) || /\+?\d[\d\s().-]{7,}\d/.test(note)) flags.push("contains_contact_information");
  if (/\b(address|birthday|diagnosis|therapy|trauma|abuse|family|workplace)\b/i.test(note)) flags.push("contains_sensitive_personal_text");
  if (/\b(suicide|suicidal|self harm|emergency|crisis|danger)\b/i.test(note)) flags.push("contains_crisis_or_emergency_content");
  if (/\b(medical|legal|financial|diagnose|treatment|attorney|investment)\b/i.test(note)) flags.push("contains_professional_advice_request");
  if (/\b(prayer request|confession|spiritual|calling|sin|grief)\b/i.test(note)) flags.push("contains_prayer_or_spiritual_disclosure");
  return flags.length ? flags : ["safe_to_track_manually"];
}

export function redactManualFeedbackSensitiveFields(feedback: TeoyubeManualFeedbackItem): TeoyubeManualFeedbackItem {
  const privacyFlags = flagsForNote(feedback.note);
  return {
    ...feedback,
    redactedNote: sanitizeManualFeedbackNote(feedback.redactedNote || feedback.note),
    privacyFlags,
    storeRawText: false
  };
}

export function shouldBlockManualFeedbackStorage(feedback: TeoyubeManualFeedbackItem): boolean {
  return feedback.storeRawText || feedback.privacyFlags.some((flag) => flag !== "safe_to_track_manually");
}

export function validateManualFeedbackBoundary(feedback: TeoyubeManualFeedbackItem): TeoyubeManualFeedbackBoundaryBlocker[] {
  const redacted = redactManualFeedbackSensitiveFields(feedback);
  return [
    ...(!redacted.manuallySubmitted ? [{
      id: `${feedback.id}_not_manual`,
      message: "Feedback must be manually submitted.",
      requiredAction: "Reject automatic feedback intake."
    }] : []),
    ...(shouldBlockManualFeedbackStorage(redacted) ? [{
      id: `${feedback.id}_storage_blocked`,
      message: "Feedback contains sensitive content or raw text storage was requested.",
      requiredAction: "Use manual redaction and do not store raw sensitive text."
    }] : [])
  ];
}

export function createManualFeedbackBoundaryDecision(input: TeoyubeManualFeedbackBoundaryInput = {}): TeoyubeManualFeedbackBoundaryDecision {
  const feedback = (input.feedback || []).map(redactManualFeedbackSensitiveFields);
  const ruleBlockers = createManualFeedbackBoundaryRules(input).filter((entry) => !entry.satisfied);
  const itemBlockers = feedback.flatMap(validateManualFeedbackBoundary);
  if (ruleBlockers.length) return "blocked";
  if (itemBlockers.length) return feedback.some((entry) => entry.privacyFlags.includes("contains_crisis_or_emergency_content") || entry.privacyFlags.includes("contains_professional_advice_request")) ? "manual_handling_required" : "needs_manual_redaction";
  return "manual_feedback_allowed_for_redacted_review";
}

function statusFromDecision(decision: TeoyubeManualFeedbackBoundaryDecision): TeoyubeManualFeedbackBoundaryStatus {
  if (decision === "manual_feedback_allowed_for_redacted_review") return "manual_ready";
  if (decision === "needs_manual_redaction" || decision === "manual_handling_required") return "needs_redaction";
  if (decision === "blocked") return "blocked";
  return "unknown";
}

export function createManualFeedbackBoundaryReport(input: TeoyubeManualFeedbackBoundaryInput = {}): TeoyubeManualFeedbackBoundaryReport {
  const rules = createManualFeedbackBoundaryRules(input);
  const feedback = (input.feedback || []).map(redactManualFeedbackSensitiveFields);
  const ruleBlockers: TeoyubeManualFeedbackBoundaryBlocker[] = rules
    .filter((entry) => !entry.satisfied)
    .map((entry) => ({ id: `${entry.id}_blocker`, message: `${entry.label} boundary failed.`, requiredAction: entry.details }));
  const feedbackBlockers = feedback.flatMap(validateManualFeedbackBoundary);
  const blockers = [...ruleBlockers, ...feedbackBlockers];
  const warnings: TeoyubeManualFeedbackBoundaryWarning[] = feedback
    .filter((entry) => entry.privacyFlags.some((flag) => flag !== "safe_to_track_manually"))
    .map((entry) => ({
      id: `${entry.id}_privacy_warning`,
      message: "Feedback contains sensitive or manually handled content.",
      recommendedAction: "Redact manually and do not use it for persistent personalization."
    }));
  const decision = createManualFeedbackBoundaryDecision(input);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    rules,
    feedback,
    blockers,
    warnings,
    noAutomaticCollection: true,
    noDatabaseStorage: true,
    noAnalytics: true,
    noHiddenPersonalization: true,
    noRawSensitiveTextStorageByDefault: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}

