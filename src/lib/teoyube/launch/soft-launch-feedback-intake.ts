import type {
  TeoyubeSoftLaunchFeedbackCategory,
  TeoyubeSoftLaunchFeedbackIntakeResult,
  TeoyubeSoftLaunchFeedbackItem,
  TeoyubeSoftLaunchFeedbackLog,
  TeoyubeSoftLaunchFeedbackSeverity,
  TeoyubeSoftLaunchFeedbackSource,
  TeoyubeSoftLaunchFeedbackStatus,
  TeoyubeSoftLaunchFeedbackSummary,
  TeoyubeSoftLaunchFeedbackType
} from "./soft-launch-feedback-contracts";
import {
  redactSensitiveFeedbackFields,
  sanitizeSoftLaunchFeedbackText,
  shouldBlockSoftLaunchFeedbackStorage,
  validateSoftLaunchFeedbackPrivacy
} from "./soft-launch-feedback-safety";

export type TeoyubeSoftLaunchFeedbackInput = {
  id?: string;
  type?: TeoyubeSoftLaunchFeedbackType;
  category?: TeoyubeSoftLaunchFeedbackCategory;
  severity?: TeoyubeSoftLaunchFeedbackSeverity;
  source?: TeoyubeSoftLaunchFeedbackSource;
  status?: TeoyubeSoftLaunchFeedbackStatus;
  surface?: string;
  summary: string;
  notes?: string;
  containsSensitivePrivateText?: boolean;
  requiresManualReview?: boolean;
};

function feedbackId(): string {
  return `soft_launch_feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function categoryForType(type: TeoyubeSoftLaunchFeedbackType): TeoyubeSoftLaunchFeedbackCategory {
  if (type === "scripture_anchor_issue") return "scripture";
  if (type === "explanation_path_issue") return "explanation";
  if (type === "fallback_issue") return "fallback";
  if (type === "consent_issue") return "consent";
  if (type === "mobile_layout_issue") return "mobile";
  if (type === "accessibility_issue") return "accessibility";
  if (type === "personalization_preview_issue") return "personalization";
  if (type === "spiritual_content_feedback" || type === "content_clarity" || type === "confusion") return "content";
  return "unknown";
}

export function createSoftLaunchFeedbackLog(): TeoyubeSoftLaunchFeedbackLog {
  const now = new Date().toISOString();

  return {
    id: "soft_launch_feedback_log",
    items: [],
    inMemoryOnly: true,
    analyticsSent: false,
    databaseWritten: false,
    fileWritten: false,
    createdAt: now,
    updatedAt: now
  };
}

export function createSoftLaunchFeedbackItem(input: TeoyubeSoftLaunchFeedbackInput): TeoyubeSoftLaunchFeedbackItem {
  const now = new Date().toISOString();
  const type = input.type || "unknown";
  const item: TeoyubeSoftLaunchFeedbackItem = {
    id: input.id || feedbackId(),
    type,
    category: input.category || categoryForType(type),
    severity: input.severity || "low",
    source: input.source || "manual_reviewer_note",
    status: input.status || "open",
    surface: input.surface,
    summary: sanitizeSoftLaunchFeedbackText(input.summary),
    redactedNotes: input.notes ? sanitizeSoftLaunchFeedbackText(input.notes) : undefined,
    rawNotesStored: false,
    containsSensitivePrivateText: input.containsSensitivePrivateText === true,
    hiddenPersonalizationCreated: false,
    analyticsSent: false,
    databaseWritten: false,
    requiresManualReview: input.requiresManualReview === true,
    createdAt: now,
    updatedAt: now
  };

  return redactSensitiveFeedbackFields(item);
}

export function sanitizeSoftLaunchFeedbackItem(item: TeoyubeSoftLaunchFeedbackItem): TeoyubeSoftLaunchFeedbackItem {
  return redactSensitiveFeedbackFields(item);
}

export function validateSoftLaunchFeedbackItem(item: TeoyubeSoftLaunchFeedbackItem): TeoyubeSoftLaunchFeedbackIntakeResult {
  const sanitized = sanitizeSoftLaunchFeedbackItem(item);
  const errors = [
    sanitized.summary ? "" : "Feedback summary is required.",
    shouldBlockSoftLaunchFeedbackStorage(sanitized) ? "Feedback violates privacy-safe storage rules." : "",
    sanitized.rawNotesStored ? "Raw feedback text must not be stored by default." : "",
    sanitized.analyticsSent ? "Feedback must not be sent to analytics." : "",
    sanitized.databaseWritten ? "Feedback must not be written to a database in this step." : ""
  ].filter(Boolean);
  const privacyStatus = validateSoftLaunchFeedbackPrivacy(sanitized);
  const warnings = [
    privacyStatus === "needs_manual_privacy_review" ? "Feedback needs manual privacy or safety review." : "",
    sanitized.severity === "unknown" ? "Feedback severity should be reviewed." : ""
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    item: sanitized,
    errors,
    warnings
  };
}

export function addSoftLaunchFeedbackItem(
  log: TeoyubeSoftLaunchFeedbackLog,
  item: TeoyubeSoftLaunchFeedbackItem
): TeoyubeSoftLaunchFeedbackLog {
  const validation = validateSoftLaunchFeedbackItem(item);

  return {
    ...log,
    items: validation.valid ? [...log.items, validation.item] : log.items,
    updatedAt: new Date().toISOString()
  };
}

export function getSoftLaunchFeedbackBlockers(log: TeoyubeSoftLaunchFeedbackLog): TeoyubeSoftLaunchFeedbackItem[] {
  return log.items.filter((item) =>
    item.severity === "critical" ||
    item.type === "scripture_anchor_issue" ||
    item.type === "explanation_path_issue" ||
    item.type === "fallback_issue" ||
    item.type === "consent_issue"
  );
}

export function getSoftLaunchFeedbackWarnings(log: TeoyubeSoftLaunchFeedbackLog): TeoyubeSoftLaunchFeedbackItem[] {
  return log.items.filter((item) =>
    item.severity === "high" ||
    item.requiresManualReview ||
    validateSoftLaunchFeedbackPrivacy(item) === "needs_manual_privacy_review"
  );
}

export function summarizeSoftLaunchFeedback(log: TeoyubeSoftLaunchFeedbackLog): TeoyubeSoftLaunchFeedbackSummary {
  const blockers = getSoftLaunchFeedbackBlockers(log);
  const warnings = getSoftLaunchFeedbackWarnings(log);

  return {
    itemCount: log.items.length,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    criticalCount: log.items.filter((item) => item.severity === "critical").length,
    highCount: log.items.filter((item) => item.severity === "high").length,
    scriptureIssueCount: log.items.filter((item) => item.type === "scripture_anchor_issue").length,
    explanationIssueCount: log.items.filter((item) => item.type === "explanation_path_issue").length,
    fallbackIssueCount: log.items.filter((item) => item.type === "fallback_issue").length,
    consentIssueCount: log.items.filter((item) => item.type === "consent_issue").length,
    privacyReviewCount: log.items.filter((item) => validateSoftLaunchFeedbackPrivacy(item) === "needs_manual_privacy_review").length,
    generatedAt: new Date().toISOString()
  };
}

export function createSoftLaunchFeedbackIntakeReport(log: TeoyubeSoftLaunchFeedbackLog = createSoftLaunchFeedbackLog()) {
  const summary = summarizeSoftLaunchFeedback(log);

  return {
    valid: !log.analyticsSent && !log.databaseWritten && !log.fileWritten,
    log,
    summary,
    blockers: getSoftLaunchFeedbackBlockers(log),
    warnings: getSoftLaunchFeedbackWarnings(log),
    inMemoryOnly: log.inMemoryOnly,
    analyticsSent: log.analyticsSent,
    databaseWritten: log.databaseWritten,
    fileWritten: log.fileWritten,
    generatedAt: new Date().toISOString()
  };
}
