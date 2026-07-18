import type { TeoyubePublicStabilizationDecision } from "./public-safe-fix-release-contracts";

export type TeoyubePublicStabilizationOwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  publicLaunchCritical: boolean;
};

export type TeoyubePublicStabilizationOwnerReviewRecord = {
  id: string;
  label: string;
  checklistItemIds: string[];
  accepted: boolean;
  ownerDecision: TeoyubePublicStabilizationDecision;
  notes: string[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  databaseWritten: false;
  analyticsSent: false;
  externalServicesCalled: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  publicUrlFetched: false;
  liveAiOrchestrationEnabled: false;
  generatedAt: string;
};

export type TeoyubePublicStabilizationOwnerReviewBlocker = {
  id: string;
  label: string;
  reason: string;
  requiredAction: string;
};

export type TeoyubePublicStabilizationOwnerReviewWarning = {
  id: string;
  label: string;
  message: string;
  recommendedAction: string;
};

export function createPublicStabilizationOwnerReviewChecklist(): TeoyubePublicStabilizationOwnerReviewChecklistItem[] {
  return [
    { id: "review_safe_fixes_applied", label: "Review every actual public safe fix applied", required: true, publicLaunchCritical: true },
    { id: "confirm_no_unsafe_changes", label: "Confirm no unsafe safety, privacy, provider, persistence, analytics, or personalization changes were introduced", required: true, publicLaunchCritical: true },
    { id: "confirm_regression_results", label: "Confirm stabilization regression results are recorded", required: true, publicLaunchCritical: true },
    { id: "confirm_post_release_safety", label: "Confirm post-release safety checks passed", required: true, publicLaunchCritical: true },
    { id: "confirm_surface_stabilization", label: "Confirm public surfaces remain stable", required: true, publicLaunchCritical: true },
    { id: "confirm_pause_continue_decision", label: "Confirm continue, warning, pause, or rollback decision", required: true, publicLaunchCritical: true },
    { id: "confirm_no_side_effects", label: "Confirm no users were contacted and no feedback, analytics, database, public URL, live AI, deployment, or rollback action was performed by code", required: true, publicLaunchCritical: true }
  ];
}

export function createPublicStabilizationOwnerReviewRecord(
  input: Partial<TeoyubePublicStabilizationOwnerReviewRecord> = {}
): TeoyubePublicStabilizationOwnerReviewRecord {
  return {
    id: input.id || "public_stabilization_owner_review_6_4",
    label: input.label || "Public Stabilization Owner Review",
    checklistItemIds: input.checklistItemIds || createPublicStabilizationOwnerReviewChecklist().map((item) => item.id),
    accepted: input.accepted ?? true,
    ownerDecision: input.ownerDecision || "continue_public_launch",
    notes: input.notes || ["Manual owner review accepted for the sample public stabilization package."],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    publicUrlFetched: false,
    liveAiOrchestrationEnabled: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPublicStabilizationOwnerReviewBlockers(
  record: TeoyubePublicStabilizationOwnerReviewRecord,
  checklist: TeoyubePublicStabilizationOwnerReviewChecklistItem[] = createPublicStabilizationOwnerReviewChecklist()
): TeoyubePublicStabilizationOwnerReviewBlocker[] {
  return [
    ...checklist
      .filter((item) => item.required && !record.checklistItemIds.includes(item.id))
      .map((item) => ({
        id: `public_stabilization_owner_missing_${item.id}`,
        label: item.label,
        reason: "Required owner stabilization review checklist item is missing.",
        requiredAction: "Complete this checklist item before continuing public launch stabilization."
      })),
    !record.accepted ? { id: "public_stabilization_owner_not_accepted", label: record.label, reason: "Owner stabilization review has not been accepted.", requiredAction: "Complete owner acceptance before continuing." } : undefined,
    record.ownerDecision === "blocked" ? { id: "public_stabilization_owner_blocked", label: record.label, reason: "Owner decision is blocked.", requiredAction: "Resolve owner-blocking items before continuing." } : undefined,
    record.ownerDecision === "prepare_rollback" ? { id: "public_stabilization_owner_rollback", label: record.label, reason: "Owner decision recommends rollback preparation.", requiredAction: "Prepare rollback manually and pause public launch expansion." } : undefined,
    record.fileWritten ? { id: "public_stabilization_owner_file_written", label: record.label, reason: "Owner review must not write files.", requiredAction: "Keep review evidence in memory." } : undefined,
    record.databaseWritten ? { id: "public_stabilization_owner_database_written", label: record.label, reason: "Owner review must not write a database.", requiredAction: "Remove persistence." } : undefined,
    record.analyticsSent ? { id: "public_stabilization_owner_analytics_sent", label: record.label, reason: "Owner review must not send analytics.", requiredAction: "Remove analytics sending." } : undefined,
    record.externalServicesCalled ? { id: "public_stabilization_owner_external_service", label: record.label, reason: "Owner review must not call external services.", requiredAction: "Keep review manual." } : undefined,
    record.usersContacted ? { id: "public_stabilization_owner_users_contacted", label: record.label, reason: "Owner review must not contact users.", requiredAction: "Keep user contact outside code." } : undefined,
    record.feedbackCollectedAutomatically ? { id: "public_stabilization_owner_feedback_auto", label: record.label, reason: "Owner review must not collect feedback automatically.", requiredAction: "Use manual feedback intake only." } : undefined,
    record.publicUrlFetched ? { id: "public_stabilization_owner_url_fetched", label: record.label, reason: "Owner review must not fetch public URLs.", requiredAction: "Keep URL checks manual." } : undefined,
    record.liveAiOrchestrationEnabled ? { id: "public_stabilization_owner_live_ai", label: record.label, reason: "Owner review must not enable live AI orchestration.", requiredAction: "Keep live AI orchestration disabled." } : undefined
  ].filter(Boolean) as TeoyubePublicStabilizationOwnerReviewBlocker[];
}

export function getPublicStabilizationOwnerReviewWarnings(record: TeoyubePublicStabilizationOwnerReviewRecord): TeoyubePublicStabilizationOwnerReviewWarning[] {
  return [
    record.notes.length === 0 ? {
      id: "public_stabilization_owner_notes_missing",
      label: record.label,
      message: "Owner stabilization review has no notes.",
      recommendedAction: "Add manual review notes before closing stabilization."
    } : undefined,
    record.ownerDecision === "continue_with_warnings" ? {
      id: "public_stabilization_owner_continue_with_warnings",
      label: record.label,
      message: "Owner accepted continuation with warnings.",
      recommendedAction: "Keep warning details visible in the next public daily review."
    } : undefined
  ].filter(Boolean) as TeoyubePublicStabilizationOwnerReviewWarning[];
}

export function createPublicStabilizationOwnerReviewReport(
  record: TeoyubePublicStabilizationOwnerReviewRecord = createPublicStabilizationOwnerReviewRecord()
) {
  const checklist = createPublicStabilizationOwnerReviewChecklist();
  const blockers = getPublicStabilizationOwnerReviewBlockers(record, checklist);
  const warnings = getPublicStabilizationOwnerReviewWarnings(record);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && record.accepted,
    decision: record.ownerDecision,
    record,
    checklist,
    blockers,
    warnings,
    checklistComplete: checklist.every((item) => !item.required || record.checklistItemIds.includes(item.id)),
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
