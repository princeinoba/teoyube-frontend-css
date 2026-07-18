import type {
  TeoyubeSoftLaunchFeedbackItem,
  TeoyubeSoftLaunchFeedbackPrivacyStatus
} from "./soft-launch-feedback-contracts";

const sensitivePatterns = [
  /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
];

const reviewTerms = [
  "suicide",
  "self harm",
  "emergency",
  "medical",
  "diagnosis",
  "lawyer",
  "legal",
  "financial",
  "bank",
  "abuse"
];

export function sanitizeSoftLaunchFeedbackText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const redacted = sensitivePatterns.reduce(
    (current, pattern) => current.replace(pattern, "[redacted]"),
    trimmed
  );

  return redacted.length > 500 ? `${redacted.slice(0, 500)}...` : redacted;
}

export function getSoftLaunchFeedbackSafetyWarnings(feedback: TeoyubeSoftLaunchFeedbackItem): string[] {
  const text = `${feedback.summary} ${feedback.redactedNotes || ""}`.toLowerCase();

  return [
    feedback.containsSensitivePrivateText ? "Feedback appears to contain sensitive private text and needs manual review." : "",
    feedback.rawNotesStored ? "Raw private feedback text must not be stored by default." : "",
    feedback.hiddenPersonalizationCreated ? "Feedback must not create hidden personalization." : "",
    feedback.analyticsSent ? "Feedback must not be sent to analytics." : "",
    feedback.databaseWritten ? "Feedback must not be written to a database in this step." : "",
    reviewTerms.some((term) => text.includes(term)) ? "Feedback includes emergency, medical, legal, financial, or safety-sensitive language and needs manual review." : "",
    feedback.type === "spiritual_content_feedback" ? "Spiritual content feedback should be reviewed carefully and respectfully." : ""
  ].filter(Boolean);
}

export function validateSoftLaunchFeedbackPrivacy(
  feedback: TeoyubeSoftLaunchFeedbackItem
): TeoyubeSoftLaunchFeedbackPrivacyStatus {
  if (feedback.rawNotesStored || feedback.analyticsSent || feedback.databaseWritten || feedback.hiddenPersonalizationCreated) {
    return "blocked_raw_sensitive_text";
  }

  return getSoftLaunchFeedbackSafetyWarnings(feedback).length > 0
    ? "needs_manual_privacy_review"
    : "safe_redacted";
}

export function shouldBlockSoftLaunchFeedbackStorage(feedback: TeoyubeSoftLaunchFeedbackItem): boolean {
  return validateSoftLaunchFeedbackPrivacy(feedback) === "blocked_raw_sensitive_text";
}

export function redactSensitiveFeedbackFields(feedback: TeoyubeSoftLaunchFeedbackItem): TeoyubeSoftLaunchFeedbackItem {
  return {
    ...feedback,
    summary: sanitizeSoftLaunchFeedbackText(feedback.summary),
    redactedNotes: feedback.redactedNotes ? sanitizeSoftLaunchFeedbackText(feedback.redactedNotes) : undefined,
    rawNotesStored: false,
    hiddenPersonalizationCreated: false,
    analyticsSent: false,
    databaseWritten: false,
    requiresManualReview:
      feedback.requiresManualReview ||
      feedback.containsSensitivePrivateText ||
      getSoftLaunchFeedbackSafetyWarnings(feedback).length > 0,
    updatedAt: new Date().toISOString()
  };
}

export function createSoftLaunchFeedbackSafetyReport(feedback: TeoyubeSoftLaunchFeedbackItem) {
  const sanitized = redactSensitiveFeedbackFields(feedback);
  const privacyStatus = validateSoftLaunchFeedbackPrivacy(sanitized);
  const warnings = getSoftLaunchFeedbackSafetyWarnings(sanitized);

  return {
    valid: privacyStatus !== "blocked_raw_sensitive_text",
    privacyStatus,
    sanitized,
    warnings,
    blocked: shouldBlockSoftLaunchFeedbackStorage(sanitized),
    inMemoryOnly: true,
    externalSendingPerformed: false,
    hiddenPersonalizationCreated: false,
    generatedAt: new Date().toISOString()
  };
}
