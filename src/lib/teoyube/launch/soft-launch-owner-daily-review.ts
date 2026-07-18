import type { TeoyubeSoftLaunchDailyReviewDecision } from "./soft-launch-feedback-triage-contracts";
import { createSoftLaunchPauseContinueDecision } from "./soft-launch-pause-continue-decision";

export type TeoyubeSoftLaunchOwnerDailyReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  launchCritical: boolean;
};

export type TeoyubeSoftLaunchOwnerDailyReviewRecord = {
  id: string;
  label: string;
  ownerDecision: TeoyubeSoftLaunchDailyReviewDecision;
  accepted: boolean;
  reviewedChecklistIds: string[];
  notes: string[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  usersContacted: false;
  generatedAt: string;
};

function checklistItem(id: string, label: string, launchCritical = true): TeoyubeSoftLaunchOwnerDailyReviewChecklistItem {
  return { id, label, required: true, complete: true, launchCritical };
}

export function createSoftLaunchOwnerDailyReviewChecklist(): TeoyubeSoftLaunchOwnerDailyReviewChecklistItem[] {
  return [
    checklistItem("feedback_triage_reviewed", "Manual feedback triage reviewed"),
    checklistItem("launch_critical_feedback_reviewed", "Launch-critical feedback reviewed"),
    checklistItem("fix_queue_reviewed", "Fix queue reviewed"),
    checklistItem("regression_plan_reviewed", "Regression plan reviewed"),
    checklistItem("scripture_anchor_issues_reviewed", "Scripture anchor issues reviewed"),
    checklistItem("explanation_path_issues_reviewed", "Explanation path issues reviewed"),
    checklistItem("fallback_issues_reviewed", "Fallback and offline issues reviewed"),
    checklistItem("consent_privacy_issues_reviewed", "Consent and privacy issues reviewed"),
    checklistItem("mobile_accessibility_issues_reviewed", "Mobile and accessibility issues reviewed"),
    checklistItem("pause_continue_decision_reviewed", "Pause/continue decision reviewed"),
    checklistItem("no_users_contacted_by_code_confirmed", "No users contacted by code confirmed"),
    checklistItem("no_feedback_auto_collection_confirmed", "No automatic feedback collection confirmed"),
    checklistItem("no_external_analytics_confirmed", "No external analytics confirmed"),
    checklistItem("no_database_write_confirmed", "No production database write confirmed"),
    checklistItem("next_day_action_items_confirmed", "Next-day action items confirmed", false)
  ];
}

export function createSoftLaunchOwnerDailyReviewRecord(
  input: Partial<TeoyubeSoftLaunchOwnerDailyReviewRecord> = {}
): TeoyubeSoftLaunchOwnerDailyReviewRecord {
  const checklist = createSoftLaunchOwnerDailyReviewChecklist();
  return {
    id: input.id || "owner_daily_review_4_3",
    label: input.label || "Owner Daily Review",
    ownerDecision: input.ownerDecision || "continue_soft_launch",
    accepted: input.accepted ?? true,
    reviewedChecklistIds: input.reviewedChecklistIds || checklist.map((entry) => entry.id),
    notes: input.notes || ["Manual owner review record prepared in memory."],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    usersContacted: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

function getMissingRequiredOwnerDailyReviewItems(record: TeoyubeSoftLaunchOwnerDailyReviewRecord) {
  return createSoftLaunchOwnerDailyReviewChecklist().filter(
    (entry) => entry.required && !record.reviewedChecklistIds.includes(entry.id)
  );
}

export function getSoftLaunchOwnerDailyReviewBlockers(
  record: TeoyubeSoftLaunchOwnerDailyReviewRecord = createSoftLaunchOwnerDailyReviewRecord()
) {
  const missingRequired = getMissingRequiredOwnerDailyReviewItems(record);
  return [
    ...missingRequired.map((entry) => ({
      id: `owner_daily_review_missing_${entry.id}`,
      label: entry.label,
      reason: "Required owner daily review checklist item was not reviewed.",
      requiredAction: "Complete owner review before continuing the next launch day."
    })),
    !record.accepted
      ? {
          id: "owner_daily_review_not_accepted",
          label: record.label,
          reason: "Owner daily review has not been accepted.",
          requiredAction: "Pause expansion until the owner accepts the daily review."
        }
      : undefined,
    record.usersContacted
      ? {
          id: "owner_daily_review_users_contacted",
          label: record.label,
          reason: "Owner daily review must not contact users.",
          requiredAction: "Remove user contact from this in-memory review helper."
        }
      : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string }>;
}

export function getSoftLaunchOwnerDailyReviewWarnings(
  record: TeoyubeSoftLaunchOwnerDailyReviewRecord = createSoftLaunchOwnerDailyReviewRecord()
): string[] {
  const decision = createSoftLaunchPauseContinueDecision();
  return [
    record.notes.length === 0 ? "Owner daily review has no manual notes attached." : undefined,
    decision.warningCount > 0 ? "Pause/continue decision has warnings that should remain in owner review." : undefined
  ].filter(Boolean) as string[];
}

export function validateSoftLaunchOwnerDailyReview(
  record: TeoyubeSoftLaunchOwnerDailyReviewRecord = createSoftLaunchOwnerDailyReviewRecord()
) {
  const blockers = getSoftLaunchOwnerDailyReviewBlockers(record);
  const warnings = getSoftLaunchOwnerDailyReviewWarnings(record);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && record.accepted,
    blockers,
    warnings,
    noUsersContacted: true,
    noExternalWrite: true
  };
}

export function createSoftLaunchOwnerDailyReviewReport(
  record: TeoyubeSoftLaunchOwnerDailyReviewRecord = createSoftLaunchOwnerDailyReviewRecord()
) {
  const checklist = createSoftLaunchOwnerDailyReviewChecklist();
  const decision = createSoftLaunchPauseContinueDecision();
  const blockers = getSoftLaunchOwnerDailyReviewBlockers(record);
  const warnings = getSoftLaunchOwnerDailyReviewWarnings(record);

  return {
    valid: blockers.length === 0 && decision.valid,
    ready: blockers.length === 0 && record.accepted,
    ownerDecision: record.ownerDecision,
    record,
    checklist,
    blockers,
    warnings,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
