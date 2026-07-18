import type {
  TeoyubeSoftLaunchDailyReviewActionItem,
  TeoyubeSoftLaunchDailyReviewBlocker,
  TeoyubeSoftLaunchDailyReviewRecord,
  TeoyubeSoftLaunchDailyReviewReport,
  TeoyubeSoftLaunchDailyReviewStatus,
  TeoyubeSoftLaunchDailyReviewSummary,
  TeoyubeSoftLaunchDailyReviewWarning
} from "./soft-launch-daily-review-contracts";
import type { TeoyubeSoftLaunchDailyReviewDecision } from "./soft-launch-feedback-triage-contracts";

const LAUNCH_CRITICAL_STATUS_FIELDS: Array<keyof Pick<
  TeoyubeSoftLaunchDailyReviewRecord,
  "appAvailability" | "surfaceHealth" | "pauseRollbackWatchStatus"
>> = ["appAvailability", "surfaceHealth", "pauseRollbackWatchStatus"];

const SAFETY_ISSUE_FIELDS: Array<keyof Pick<
  TeoyubeSoftLaunchDailyReviewRecord,
  "scriptureAnchorIssues" | "explanationPathIssues" | "fallbackIssues" | "consentPrivacyIssues"
>> = ["scriptureAnchorIssues", "explanationPathIssues", "fallbackIssues", "consentPrivacyIssues"];

export function createSoftLaunchDailyReviewActionItem(
  input: Partial<TeoyubeSoftLaunchDailyReviewActionItem> = {}
): TeoyubeSoftLaunchDailyReviewActionItem {
  return {
    id: input.id || "manual_triage_follow_up",
    label: input.label || "Continue manual feedback triage before the next launch day.",
    owner: input.owner || "owner",
    requiredBeforeNextDay: input.requiredBeforeNextDay ?? true,
    launchCritical: input.launchCritical ?? false
  };
}

export function createSoftLaunchDailyReviewRecord(
  input: Partial<TeoyubeSoftLaunchDailyReviewRecord> = {}
): TeoyubeSoftLaunchDailyReviewRecord {
  return {
    id: input.id || "soft_launch_daily_review_4_3",
    label: input.label || "Soft Launch Feedback Triage Daily Review",
    status: input.status || "healthy",
    appAvailability: input.appAvailability || "healthy",
    surfaceHealth: input.surfaceHealth || "healthy",
    mobileAccessibilityIssues: input.mobileAccessibilityIssues ?? 0,
    scriptureAnchorIssues: input.scriptureAnchorIssues ?? 0,
    explanationPathIssues: input.explanationPathIssues ?? 0,
    fallbackIssues: input.fallbackIssues ?? 0,
    consentPrivacyIssues: input.consentPrivacyIssues ?? 0,
    feedbackVolume: input.feedbackVolume ?? 0,
    criticalFeedbackCount: input.criticalFeedbackCount ?? 0,
    fixQueueLaunchBlockerCount: input.fixQueueLaunchBlockerCount ?? 0,
    pauseRollbackWatchStatus: input.pauseRollbackWatchStatus || "healthy",
    actionItems: input.actionItems || [createSoftLaunchDailyReviewActionItem()],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function summarizeSoftLaunchDailyReview(
  records: TeoyubeSoftLaunchDailyReviewRecord[] = []
): TeoyubeSoftLaunchDailyReviewSummary {
  return {
    recordCount: records.length,
    feedbackVolume: records.reduce((total, record) => total + record.feedbackVolume, 0),
    criticalFeedbackCount: records.reduce((total, record) => total + record.criticalFeedbackCount, 0),
    launchBlockerCount: records.reduce((total, record) => total + record.fixQueueLaunchBlockerCount, 0),
    actionItemCount: records.reduce((total, record) => total + record.actionItems.length, 0)
  };
}

export function summarizeSoftLaunchDailyReviewRecords(
  records: TeoyubeSoftLaunchDailyReviewRecord[] = []
): TeoyubeSoftLaunchDailyReviewSummary {
  return summarizeSoftLaunchDailyReview(records);
}

export function getSoftLaunchDailyReviewActionItems(
  records: TeoyubeSoftLaunchDailyReviewRecord[] = []
): TeoyubeSoftLaunchDailyReviewActionItem[] {
  return records.flatMap((record) => record.actionItems);
}

function hasStatus(record: TeoyubeSoftLaunchDailyReviewRecord, statuses: TeoyubeSoftLaunchDailyReviewStatus[]): boolean {
  return [
    record.status,
    record.appAvailability,
    record.surfaceHealth,
    record.pauseRollbackWatchStatus
  ].some((status) => statuses.includes(status));
}

function hasSafetyIssue(record: TeoyubeSoftLaunchDailyReviewRecord): boolean {
  return SAFETY_ISSUE_FIELDS.some((field) => record[field] > 0);
}

export function getSoftLaunchDailyReviewBlockers(
  records: TeoyubeSoftLaunchDailyReviewRecord[] = []
): TeoyubeSoftLaunchDailyReviewBlocker[] {
  return records.flatMap((record) => {
    const blockers: TeoyubeSoftLaunchDailyReviewBlocker[] = [];

    if (hasStatus(record, ["blocked", "pause_recommended", "rollback_recommended"])) {
      blockers.push({
        id: `daily_review_status_${record.id}`,
        label: record.label,
        reason: "Daily review contains a blocked, pause-recommended, or rollback-recommended status.",
        requiredAction: "Pause expansion and complete owner review before continuing."
      });
    }

    if (LAUNCH_CRITICAL_STATUS_FIELDS.some((field) => record[field] === "needs_review")) {
      blockers.push({
        id: `daily_review_launch_status_${record.id}`,
        label: record.label,
        reason: "A launch-critical surface needs review.",
        requiredAction: "Move the issue into the fix queue and verify before the next launch day."
      });
    }

    if (record.criticalFeedbackCount > 0 || record.fixQueueLaunchBlockerCount > 0 || hasSafetyIssue(record)) {
      blockers.push({
        id: `daily_review_launch_blocker_${record.id}`,
        label: record.label,
        reason: "Critical feedback, launch-blocking fixes, or safety issues remain open.",
        requiredAction: "Pause for owner review and keep the issue in the launch-critical fix queue."
      });
    }

    return blockers;
  });
}

export function getSoftLaunchDailyReviewWarnings(
  records: TeoyubeSoftLaunchDailyReviewRecord[] = []
): TeoyubeSoftLaunchDailyReviewWarning[] {
  return records.flatMap((record) => {
    const warnings: TeoyubeSoftLaunchDailyReviewWarning[] = [];

    if (hasStatus(record, ["healthy_with_warnings", "needs_review"])) {
      warnings.push({
        id: `daily_review_warning_status_${record.id}`,
        label: record.label,
        message: "Daily review contains warnings or non-critical review needs.",
        recommendedAction: "Keep the issue in the manual review notes and verify before expansion."
      });
    }

    if (record.mobileAccessibilityIssues > 0) {
      warnings.push({
        id: `daily_review_mobile_accessibility_${record.id}`,
        label: record.label,
        message: "Mobile or accessibility issues were noted during the daily review.",
        recommendedAction: "Verify mobile and accessibility surfaces before the next launch-day review."
      });
    }

    if (record.actionItems.length === 0) {
      warnings.push({
        id: `daily_review_action_items_${record.id}`,
        label: record.label,
        message: "Daily review has no next-day action items.",
        recommendedAction: "Add owner-reviewed action items before closing the day."
      });
    }

    return warnings;
  });
}

export function createSoftLaunchDailyReviewDecision(
  records: TeoyubeSoftLaunchDailyReviewRecord[] = []
): TeoyubeSoftLaunchDailyReviewDecision {
  if (records.some((record) => hasStatus(record, ["rollback_recommended"]))) return "prepare_rollback";
  if (records.some((record) => hasStatus(record, ["blocked"]))) return "blocked";
  if (getSoftLaunchDailyReviewBlockers(records).length > 0) return "pause_for_review";
  if (records.some((record) => record.actionItems.some((item) => item.launchCritical || item.requiredBeforeNextDay))) {
    return "needs_owner_review";
  }
  if (getSoftLaunchDailyReviewWarnings(records).length > 0) return "continue_with_warnings";
  return "continue_soft_launch";
}

export function createSoftLaunchDailyReviewReport(
  records: TeoyubeSoftLaunchDailyReviewRecord[] = [createSoftLaunchDailyReviewRecord()]
): TeoyubeSoftLaunchDailyReviewReport {
  const blockers = getSoftLaunchDailyReviewBlockers(records);
  const warnings = getSoftLaunchDailyReviewWarnings(records);
  const decision = createSoftLaunchDailyReviewDecision(records);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && decision !== "blocked" && decision !== "prepare_rollback",
    decision,
    records,
    summary: summarizeSoftLaunchDailyReview(records),
    blockers,
    warnings,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
