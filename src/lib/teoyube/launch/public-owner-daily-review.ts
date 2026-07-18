import type { TeoyubePublicDailyReviewDecision } from "./public-feedback-triage-contracts";
import { createPublicPauseContinueReport } from "./public-pause-continue-decision";

export type TeoyubePublicOwnerDailyReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  publicLaunchCritical: boolean;
};

export type TeoyubePublicOwnerDailyReviewRecord = {
  id: string;
  label: string;
  ownerDecision: TeoyubePublicDailyReviewDecision;
  accepted: boolean;
  reviewedChecklistIds: string[];
  notes: string[];
  manualOnly: true;
  inMemoryOnly: true;
  signatureRequired: false;
  fileWritten: false;
  usersContacted: false;
  generatedAt: string;
};

function item(id: string, label: string, publicLaunchCritical = true): TeoyubePublicOwnerDailyReviewChecklistItem {
  return { id, label, required: true, complete: true, publicLaunchCritical };
}

export function createPublicOwnerDailyReviewChecklist(): TeoyubePublicOwnerDailyReviewChecklistItem[] {
  return [
    item("public_feedback_triage_reviewed", "Public feedback triage reviewed"),
    item("public_fix_queue_reviewed", "Public fix queue reviewed"),
    item("privacy_terms_consent_issues_reviewed", "Privacy, terms, and consent issues reviewed"),
    item("scripture_anchor_issues_reviewed", "Scripture anchor issues reviewed"),
    item("explanation_path_issues_reviewed", "Explanation path issues reviewed"),
    item("fallback_issues_reviewed", "Fallback issues reviewed"),
    item("consent_privacy_issues_reviewed", "Consent/privacy issues reviewed"),
    item("mobile_accessibility_issues_reviewed", "Mobile/accessibility issues reviewed"),
    item("pause_rollback_watch_reviewed", "Pause/rollback watch reviewed"),
    item("continue_pause_decision_accepted", "Continue/pause decision accepted"),
    item("next_day_action_items_accepted", "Next-day action items accepted", false),
    item("no_users_contacted_by_code_confirmed", "No users contacted by code confirmed"),
    item("no_feedback_auto_collection_confirmed", "No automatic feedback collection confirmed"),
    item("no_external_analytics_confirmed", "No external analytics confirmed"),
    item("no_database_write_confirmed", "No production database write confirmed"),
    item("no_live_ai_orchestration_confirmed", "No live AI orchestration confirmed")
  ];
}

export function createPublicOwnerDailyReviewRecord(input: Partial<TeoyubePublicOwnerDailyReviewRecord> = {}): TeoyubePublicOwnerDailyReviewRecord {
  const checklist = createPublicOwnerDailyReviewChecklist();
  return {
    id: input.id || "public_owner_daily_review_6_3",
    label: input.label || "Public Owner Daily Review",
    ownerDecision: input.ownerDecision || "continue_public_launch",
    accepted: input.accepted ?? true,
    reviewedChecklistIds: input.reviewedChecklistIds || checklist.map((entry) => entry.id),
    notes: input.notes || ["Structured manual owner daily review prepared in memory."],
    manualOnly: true,
    inMemoryOnly: true,
    signatureRequired: false,
    fileWritten: false,
    usersContacted: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

function getMissingRequiredPublicOwnerDailyReviewItems(record: TeoyubePublicOwnerDailyReviewRecord) {
  return createPublicOwnerDailyReviewChecklist().filter((entry) => entry.required && !record.reviewedChecklistIds.includes(entry.id));
}

export function getPublicOwnerDailyReviewBlockers(record: TeoyubePublicOwnerDailyReviewRecord = createPublicOwnerDailyReviewRecord()) {
  const missing = getMissingRequiredPublicOwnerDailyReviewItems(record);
  return [
    ...missing.map((entry) => ({
      id: `public_owner_daily_review_missing_${entry.id}`,
      label: entry.label,
      reason: "Required public owner daily review checklist item was not reviewed.",
      requiredAction: "Complete owner review before continuing public launch."
    })),
    !record.accepted ? { id: "public_owner_daily_review_not_accepted", label: record.label, reason: "Owner daily review has not been accepted.", requiredAction: "Pause public promotion until the owner accepts the daily review." } : undefined,
    record.fileWritten ? { id: "public_owner_daily_review_file_written", label: record.label, reason: "Owner daily review must not write files.", requiredAction: "Keep the review in memory." } : undefined,
    record.usersContacted ? { id: "public_owner_daily_review_users_contacted", label: record.label, reason: "Owner daily review must not contact users.", requiredAction: "Remove user contact from this helper." } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string }>;
}

export function getPublicOwnerDailyReviewWarnings(record: TeoyubePublicOwnerDailyReviewRecord = createPublicOwnerDailyReviewRecord()): string[] {
  const decision = createPublicPauseContinueReport();
  return [
    record.notes.length === 0 ? "Public owner daily review has no manual notes attached." : undefined,
    decision.warningCount > 0 ? "Public pause/continue decision has warnings that should remain in owner review." : undefined
  ].filter(Boolean) as string[];
}

export function validatePublicOwnerDailyReview(record: TeoyubePublicOwnerDailyReviewRecord = createPublicOwnerDailyReviewRecord()) {
  const blockers = getPublicOwnerDailyReviewBlockers(record);
  const warnings = getPublicOwnerDailyReviewWarnings(record);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && record.accepted,
    blockers,
    warnings,
    noUsersContacted: true,
    noExternalWrite: true
  };
}

export function createPublicOwnerDailyReviewReport(record: TeoyubePublicOwnerDailyReviewRecord = createPublicOwnerDailyReviewRecord()) {
  const checklist = createPublicOwnerDailyReviewChecklist();
  const blockers = getPublicOwnerDailyReviewBlockers(record);
  const warnings = getPublicOwnerDailyReviewWarnings(record);
  return {
    valid: blockers.length === 0,
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
