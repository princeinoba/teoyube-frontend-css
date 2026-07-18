import { createLaunchDayFeedbackPrivacyReport, sanitizeLaunchDayFeedbackText, validateLaunchDayFeedbackPrivacy } from "./launch-day-feedback-privacy-guard";
import type { TeoyubeLaunchDayMonitoringBlocker, TeoyubeLaunchDayMonitoringWarning } from "./launch-day-monitoring-contracts";

export type TeoyubeLaunchDayFeedbackCategory =
  | "surface"
  | "scripture_anchor"
  | "explanation_path"
  | "fallback"
  | "consent_privacy"
  | "mobile_accessibility"
  | "content_clarity"
  | "positive"
  | "feature_request"
  | "spiritual_content"
  | "unknown";

export type TeoyubeLaunchDayFeedbackItem = {
  id: string;
  surface: string;
  category: TeoyubeLaunchDayFeedbackCategory;
  summary: string;
  redactedNotes: string[];
  severity: "low" | "medium" | "high" | "critical";
  launchCritical: boolean;
  manuallyEntered: true;
  rawSensitiveTextStored: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  hiddenPersonalizationCreated: false;
  generatedAt: string;
};

export type TeoyubeLaunchDayFeedbackLog = {
  id: string;
  label: string;
  items: TeoyubeLaunchDayFeedbackItem[];
  manualFeedbackOnly: true;
  automatedCollectionDisabled: true;
  databaseWritesDisabled: true;
  analyticsSendingDisabled: true;
  rawSensitiveTextStorageDisabled: true;
  fileWritten: false;
  generatedAt: string;
};

export function createLaunchDayFeedbackLog(): TeoyubeLaunchDayFeedbackLog {
  return {
    id: "launch_day_feedback_log_4_2",
    label: "Launch Day Manual Feedback Log",
    items: [],
    manualFeedbackOnly: true,
    automatedCollectionDisabled: true,
    databaseWritesDisabled: true,
    analyticsSendingDisabled: true,
    rawSensitiveTextStorageDisabled: true,
    fileWritten: false,
    generatedAt: new Date().toISOString()
  };
}

export function createLaunchDayFeedbackItem(input: Partial<TeoyubeLaunchDayFeedbackItem> = {}): TeoyubeLaunchDayFeedbackItem {
  const category = input.category || "unknown";
  const launchCritical =
    input.launchCritical ??
    ["scripture_anchor", "explanation_path", "fallback", "consent_privacy", "mobile_accessibility"].includes(category);

  return {
    id: input.id || "launch_day_feedback_item",
    surface: input.surface || "General",
    category,
    summary: sanitizeLaunchDayFeedbackText(input.summary || "Manual launch-day feedback item."),
    redactedNotes: (input.redactedNotes || []).map(sanitizeLaunchDayFeedbackText),
    severity: input.severity || (launchCritical ? "high" : "medium"),
    launchCritical,
    manuallyEntered: true,
    rawSensitiveTextStored: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    hiddenPersonalizationCreated: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function sanitizeLaunchDayFeedbackItem(item: TeoyubeLaunchDayFeedbackItem): TeoyubeLaunchDayFeedbackItem {
  return {
    ...item,
    summary: sanitizeLaunchDayFeedbackText(item.summary),
    redactedNotes: item.redactedNotes.map(sanitizeLaunchDayFeedbackText),
    rawSensitiveTextStored: false,
    hiddenPersonalizationCreated: false
  };
}

export function validateLaunchDayFeedbackItem(item: TeoyubeLaunchDayFeedbackItem) {
  const privacy = validateLaunchDayFeedbackPrivacy(item);
  const blockers = [
    item.rawSensitiveTextStored ? "Raw sensitive text storage is disabled." : undefined,
    item.databaseWritten ? "Launch-day feedback must not write to a database." : undefined,
    item.analyticsSent ? "Launch-day feedback must not send analytics." : undefined,
    item.externalServicesCalled ? "Launch-day feedback must not call external services." : undefined,
    item.hiddenPersonalizationCreated ? "Launch-day feedback must not create hidden personalization." : undefined,
    privacy.blocked ? "Feedback privacy guard blocked storage." : undefined
  ].filter(Boolean) as string[];

  return {
    valid: blockers.length === 0,
    blockers,
    warnings: privacy.warnings
  };
}

export function addLaunchDayFeedbackItem(
  log: TeoyubeLaunchDayFeedbackLog,
  item: TeoyubeLaunchDayFeedbackItem
): TeoyubeLaunchDayFeedbackLog {
  return {
    ...log,
    items: [...log.items, sanitizeLaunchDayFeedbackItem(item)]
  };
}

export function summarizeLaunchDayFeedback(log: TeoyubeLaunchDayFeedbackLog) {
  return {
    itemCount: log.items.length,
    launchCriticalCount: log.items.filter((item) => item.launchCritical).length,
    positiveCount: log.items.filter((item) => item.category === "positive").length,
    featureRequestCount: log.items.filter((item) => item.category === "feature_request").length,
    manualFeedbackOnly: log.manualFeedbackOnly,
    noDatabaseWrites: log.databaseWritesDisabled,
    noAnalyticsSending: log.analyticsSendingDisabled
  };
}

export function getLaunchDayFeedbackBlockers(log: TeoyubeLaunchDayFeedbackLog): TeoyubeLaunchDayMonitoringBlocker[] {
  return log.items
    .flatMap((item) => validateLaunchDayFeedbackItem(item).blockers.map((reason) => ({ item, reason })))
    .map(({ item, reason }) => ({
      id: `launch_day_feedback_${item.id}`,
      label: item.summary,
      phase: "feedback_intake_review",
      severity: "critical",
      reason,
      requiredAction: "Keep launch-day feedback manual, redacted, and in memory only."
    }));
}

export function getLaunchDayFeedbackWarnings(log: TeoyubeLaunchDayFeedbackLog): TeoyubeLaunchDayMonitoringWarning[] {
  return [
    {
      id: "launch_day_feedback_manual_only",
      label: "Feedback intake is manual only",
      phase: "feedback_intake_review",
      severity: "medium",
      message: "Feedback intake creates in-memory redacted records only.",
      recommendedAction: "Do not connect automatic collection, database writes, or analytics."
    },
    ...log.items.flatMap((item) =>
      createLaunchDayFeedbackPrivacyReport(item).warnings.map((message) => ({
        id: `launch_day_feedback_privacy_${item.id}`,
        label: item.summary,
        phase: "feedback_intake_review" as const,
        severity: "medium" as const,
        message,
        recommendedAction: "Review feedback manually before retaining notes."
      }))
    )
  ];
}

export function createLaunchDayFeedbackIntakeReport(log: TeoyubeLaunchDayFeedbackLog = createLaunchDayFeedbackLog()) {
  const blockers = getLaunchDayFeedbackBlockers(log);
  const warnings = getLaunchDayFeedbackWarnings(log);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    log,
    summary: summarizeLaunchDayFeedback(log),
    blockers,
    warnings,
    manualOnly: true,
    noFeedbackCollectedAutomatically: true,
    noDatabaseWrites: true,
    noAnalyticsSending: true,
    noExternalServicesCalled: true,
    noFileWrites: true,
    generatedAt: new Date().toISOString()
  };
}
