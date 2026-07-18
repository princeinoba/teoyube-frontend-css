import type {
  TeoyubePublicDailyReviewActionItem,
  TeoyubePublicDailyReviewBlocker,
  TeoyubePublicDailyReviewRecord,
  TeoyubePublicDailyReviewReport,
  TeoyubePublicDailyReviewStatus,
  TeoyubePublicDailyReviewSummary,
  TeoyubePublicDailyReviewWarning
} from "./public-daily-review-contracts";
import type { TeoyubePublicDailyReviewDecision } from "./public-feedback-triage-contracts";

const PUBLIC_LAUNCH_STATUS_FIELDS: Array<keyof Pick<
  TeoyubePublicDailyReviewRecord,
  "publicAppAvailability" | "publicSurfaceHealth" | "privacyTermsConsentStatus" | "pauseRollbackWatchStatus"
>> = ["publicAppAvailability", "publicSurfaceHealth", "privacyTermsConsentStatus", "pauseRollbackWatchStatus"];

const PUBLIC_SAFETY_ISSUE_FIELDS: Array<keyof Pick<
  TeoyubePublicDailyReviewRecord,
  "scriptureAnchorIssues" | "explanationPathIssues" | "fallbackIssues" | "confidenceLabelIssues" | "consentPrivacyIssues"
>> = ["scriptureAnchorIssues", "explanationPathIssues", "fallbackIssues", "confidenceLabelIssues", "consentPrivacyIssues"];

export function createPublicDailyReviewActionItem(input: Partial<TeoyubePublicDailyReviewActionItem> = {}): TeoyubePublicDailyReviewActionItem {
  return {
    id: input.id || "public_manual_triage_follow_up",
    label: input.label || "Continue public feedback triage before the next public daily review.",
    owner: input.owner || "owner",
    requiredBeforeNextDay: input.requiredBeforeNextDay ?? true,
    publicLaunchCritical: input.publicLaunchCritical ?? false
  };
}

export function createPublicDailyReviewRecord(input: Partial<TeoyubePublicDailyReviewRecord> = {}): TeoyubePublicDailyReviewRecord {
  return {
    id: input.id || "public_daily_review_6_3",
    label: input.label || "Public Feedback Triage Daily Review",
    status: input.status || "healthy",
    publicAppAvailability: input.publicAppAvailability || "healthy",
    publicSurfaceHealth: input.publicSurfaceHealth || "healthy",
    privacyTermsConsentStatus: input.privacyTermsConsentStatus || "healthy",
    mobileAccessibilityIssues: input.mobileAccessibilityIssues ?? 0,
    scriptureAnchorIssues: input.scriptureAnchorIssues ?? 0,
    explanationPathIssues: input.explanationPathIssues ?? 0,
    fallbackIssues: input.fallbackIssues ?? 0,
    confidenceLabelIssues: input.confidenceLabelIssues ?? 0,
    consentPrivacyIssues: input.consentPrivacyIssues ?? 0,
    feedbackVolume: input.feedbackVolume ?? 0,
    criticalFeedbackCount: input.criticalFeedbackCount ?? 0,
    publicFixQueueBlockerCount: input.publicFixQueueBlockerCount ?? 0,
    pauseRollbackWatchStatus: input.pauseRollbackWatchStatus || "healthy",
    actionItems: input.actionItems || [createPublicDailyReviewActionItem()],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function summarizePublicDailyReviewRecords(records: TeoyubePublicDailyReviewRecord[] = []): TeoyubePublicDailyReviewSummary {
  return {
    recordCount: records.length,
    feedbackVolume: records.reduce((total, record) => total + record.feedbackVolume, 0),
    criticalFeedbackCount: records.reduce((total, record) => total + record.criticalFeedbackCount, 0),
    publicLaunchBlockerCount: records.reduce((total, record) => total + record.publicFixQueueBlockerCount, 0),
    actionItemCount: records.reduce((total, record) => total + record.actionItems.length, 0)
  };
}

export function getPublicDailyReviewActionItems(records: TeoyubePublicDailyReviewRecord[] = []): TeoyubePublicDailyReviewActionItem[] {
  return records.flatMap((record) => record.actionItems);
}

function hasStatus(record: TeoyubePublicDailyReviewRecord, statuses: TeoyubePublicDailyReviewStatus[]): boolean {
  return [
    record.status,
    record.publicAppAvailability,
    record.publicSurfaceHealth,
    record.privacyTermsConsentStatus,
    record.pauseRollbackWatchStatus
  ].some((status) => statuses.includes(status));
}

function hasPublicSafetyIssue(record: TeoyubePublicDailyReviewRecord): boolean {
  return PUBLIC_SAFETY_ISSUE_FIELDS.some((field) => record[field] > 0);
}

export function getPublicDailyReviewBlockers(records: TeoyubePublicDailyReviewRecord[] = []): TeoyubePublicDailyReviewBlocker[] {
  return records.flatMap((record) => {
    const blockers: TeoyubePublicDailyReviewBlocker[] = [];

    if (hasStatus(record, ["blocked", "pause_recommended", "rollback_recommended"])) {
      blockers.push({
        id: `public_daily_review_status_${record.id}`,
        label: record.label,
        reason: "Public daily review contains a blocked, pause-recommended, or rollback-recommended status.",
        requiredAction: "Pause public launch expansion and complete owner review before continuing."
      });
    }

    if (PUBLIC_LAUNCH_STATUS_FIELDS.some((field) => record[field] === "needs_review")) {
      blockers.push({
        id: `public_daily_review_launch_status_${record.id}`,
        label: record.label,
        reason: "A public-launch-critical surface needs review.",
        requiredAction: "Move the issue into the public fix queue and verify before the next public daily review."
      });
    }

    if (record.criticalFeedbackCount > 0 || record.publicFixQueueBlockerCount > 0 || hasPublicSafetyIssue(record)) {
      blockers.push({
        id: `public_daily_review_launch_blocker_${record.id}`,
        label: record.label,
        reason: "Critical feedback, public-launch-blocking fixes, or public safety issues remain open.",
        requiredAction: "Pause for owner review and keep the item in the public-launch-critical fix queue."
      });
    }

    if (record.fileWritten || record.databaseWritten || record.analyticsSent || record.usersContacted || record.feedbackCollectedAutomatically) {
      blockers.push({
        id: `public_daily_review_side_effect_${record.id}`,
        label: record.label,
        reason: "Public daily review must remain manual, in-memory, and side-effect free.",
        requiredAction: "Remove file, database, analytics, user-contact, or automatic feedback behavior."
      });
    }

    return blockers;
  });
}

export function getPublicDailyReviewWarnings(records: TeoyubePublicDailyReviewRecord[] = []): TeoyubePublicDailyReviewWarning[] {
  return records.flatMap((record) => {
    const warnings: TeoyubePublicDailyReviewWarning[] = [];

    if (hasStatus(record, ["healthy_with_warnings", "needs_review"])) {
      warnings.push({
        id: `public_daily_review_warning_status_${record.id}`,
        label: record.label,
        message: "Public daily review contains warnings or non-critical review needs.",
        recommendedAction: "Keep the item visible in manual public review notes."
      });
    }

    if (record.mobileAccessibilityIssues > 0) {
      warnings.push({
        id: `public_daily_review_mobile_accessibility_${record.id}`,
        label: record.label,
        message: "Mobile or accessibility issues were noted during public daily review.",
        recommendedAction: "Verify mobile and accessibility surfaces before expansion."
      });
    }

    if (record.actionItems.length === 0) {
      warnings.push({
        id: `public_daily_review_action_items_${record.id}`,
        label: record.label,
        message: "Public daily review has no next-day action items.",
        recommendedAction: "Add owner-reviewed action items before closing the public review day."
      });
    }

    return warnings;
  });
}

export function createPublicDailyReviewDecision(records: TeoyubePublicDailyReviewRecord[] = []): TeoyubePublicDailyReviewDecision {
  if (records.some((record) => hasStatus(record, ["rollback_recommended"]))) return "prepare_rollback";
  if (records.some((record) => hasStatus(record, ["blocked"]))) return "blocked";
  if (getPublicDailyReviewBlockers(records).length > 0) return "pause_for_review";
  if (records.some((record) => record.actionItems.some((item) => item.publicLaunchCritical || item.requiredBeforeNextDay))) return "needs_owner_review";
  if (getPublicDailyReviewWarnings(records).length > 0) return "continue_with_warnings";
  return "continue_public_launch";
}

export function createPublicDailyReviewReport(records: TeoyubePublicDailyReviewRecord[] = [createPublicDailyReviewRecord()]): TeoyubePublicDailyReviewReport {
  const blockers = getPublicDailyReviewBlockers(records);
  const warnings = getPublicDailyReviewWarnings(records);
  const decision = createPublicDailyReviewDecision(records);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && decision !== "blocked" && decision !== "prepare_rollback",
    decision,
    records,
    summary: summarizePublicDailyReviewRecords(records),
    blockers,
    warnings,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
