import type { TeoyubeLaunchDayMonitoringBlocker, TeoyubeLaunchDayMonitoringStatus, TeoyubeLaunchDayMonitoringWarning } from "./launch-day-monitoring-contracts";

export type TeoyubeLaunchDayDailyReviewRecord = {
  id: string;
  label: string;
  appAvailability: TeoyubeLaunchDayMonitoringStatus;
  surfaceStatus: TeoyubeLaunchDayMonitoringStatus;
  mobileStatus: TeoyubeLaunchDayMonitoringStatus;
  accessibilityStatus: TeoyubeLaunchDayMonitoringStatus;
  scriptureAnchorStatus: TeoyubeLaunchDayMonitoringStatus;
  explanationPathStatus: TeoyubeLaunchDayMonitoringStatus;
  fallbackStatus: TeoyubeLaunchDayMonitoringStatus;
  consentPrivacyStatus: TeoyubeLaunchDayMonitoringStatus;
  feedbackSummary: string[];
  issueEscalationSummary: string[];
  pauseRollbackConsideration: string;
  nextDayActionItems: string[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  generatedAt: string;
};

export function createLaunchDayDailyReviewTemplate(): string[] {
  return ["App availability", "Surface status", "Mobile status", "Accessibility status", "Scripture anchor status", "Explanation path status", "Fallback status", "Consent/privacy status", "Feedback summary", "Issue escalation summary", "Pause/rollback consideration", "Next-day action items"];
}

export function createLaunchDayDailyReviewRecord(input: Partial<TeoyubeLaunchDayDailyReviewRecord> = {}): TeoyubeLaunchDayDailyReviewRecord {
  return {
    id: input.id || "launch_day_daily_review_4_2",
    label: input.label || "Launch Day Daily Review Record",
    appAvailability: input.appAvailability || "ready",
    surfaceStatus: input.surfaceStatus || "ready",
    mobileStatus: input.mobileStatus || "ready",
    accessibilityStatus: input.accessibilityStatus || "ready",
    scriptureAnchorStatus: input.scriptureAnchorStatus || "ready",
    explanationPathStatus: input.explanationPathStatus || "ready",
    fallbackStatus: input.fallbackStatus || "ready",
    consentPrivacyStatus: input.consentPrivacyStatus || "ready",
    feedbackSummary: input.feedbackSummary || [],
    issueEscalationSummary: input.issueEscalationSummary || [],
    pauseRollbackConsideration: input.pauseRollbackConsideration || "No pause or rollback recommended from manual review.",
    nextDayActionItems: input.nextDayActionItems || ["Continue manual monitoring and feedback triage."],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function summarizeLaunchDayDailyReview(records: TeoyubeLaunchDayDailyReviewRecord[] = []) {
  return {
    recordCount: records.length,
    blockerStatusCount: records.filter((record) => [record.appAvailability, record.surfaceStatus, record.scriptureAnchorStatus, record.explanationPathStatus, record.fallbackStatus, record.consentPrivacyStatus].some((status) => status === "blocked")).length,
    nextDayActionItemCount: records.flatMap((record) => record.nextDayActionItems).length,
    manualOnly: records.every((record) => record.manualOnly),
    inMemoryOnly: records.every((record) => record.inMemoryOnly)
  };
}

export function getLaunchDayDailyReviewBlockers(records: TeoyubeLaunchDayDailyReviewRecord[] = []): TeoyubeLaunchDayMonitoringBlocker[] {
  return records
    .filter((record) => [record.appAvailability, record.surfaceStatus, record.scriptureAnchorStatus, record.explanationPathStatus, record.fallbackStatus, record.consentPrivacyStatus].some((status) => status === "blocked"))
    .map((record) => ({
      id: `daily_review_${record.id}`,
      label: record.label,
      phase: "daily_summary",
      severity: "critical",
      reason: "Daily review contains a blocked launch-critical status.",
      requiredAction: "Pause for owner review and move issue into the fix queue."
    }));
}

export function getLaunchDayDailyReviewWarnings(records: TeoyubeLaunchDayDailyReviewRecord[] = []): TeoyubeLaunchDayMonitoringWarning[] {
  return records
    .filter((record) => record.fileWritten || record.nextDayActionItems.length === 0)
    .map((record) => ({
      id: `daily_review_warning_${record.id}`,
      label: record.label,
      phase: "daily_summary",
      severity: "medium",
      message: record.fileWritten ? "Daily review must remain in memory for this module." : "Daily review should include next-day action items.",
      recommendedAction: "Keep daily review manual and complete before the next launch day."
    }));
}

export function createLaunchDayDailyReviewReport(records: TeoyubeLaunchDayDailyReviewRecord[] = [createLaunchDayDailyReviewRecord()]) {
  const blockers = getLaunchDayDailyReviewBlockers(records);
  const warnings = getLaunchDayDailyReviewWarnings(records);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    records,
    summary: summarizeLaunchDayDailyReview(records),
    blockers,
    warnings,
    template: createLaunchDayDailyReviewTemplate(),
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
