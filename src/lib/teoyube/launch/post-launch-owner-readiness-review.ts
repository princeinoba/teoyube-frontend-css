import type { TeoyubePostLaunchReadinessDecision } from "./public-launch-completion-contracts";

export type TeoyubePostLaunchOwnerReadinessChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  publicLaunchCritical: boolean;
};

export type TeoyubePostLaunchOwnerReadinessRecord = {
  id: string;
  label: string;
  accepted: boolean;
  postLaunchOperationsMayBegin: boolean;
  reviewedChecklistIds: string[];
  notes: string[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  usersContacted: false;
  publicUrlFetched: false;
  generatedAt: string;
};

function item(id: string, label: string, publicLaunchCritical = true): TeoyubePostLaunchOwnerReadinessChecklistItem {
  return { id, label, required: true, complete: true, publicLaunchCritical };
}

export function createPostLaunchOwnerReadinessChecklist(): TeoyubePostLaunchOwnerReadinessChecklistItem[] {
  return [
    item("public_launch_completion_reviewed", "Public launch completion reviewed"),
    item("public_feedback_summary_reviewed", "Public feedback summary reviewed"),
    item("public_issue_closure_reviewed", "Public issue closure reviewed"),
    item("public_stability_certification_reviewed", "Public stability certification reviewed"),
    item("final_safety_privacy_reviewed", "Final safety/privacy reviewed"),
    item("known_limitations_accepted", "Known limitations accepted"),
    item("post_launch_risks_reviewed", "Post-launch risks reviewed"),
    item("post_launch_readiness_package_reviewed", "Post-launch readiness package reviewed"),
    item("production_service_status_confirmed", "Production service status confirmed"),
    item("post_launch_operations_decision_recorded", "Post-launch operations may begin or are blocked")
  ];
}

export function createPostLaunchOwnerReadinessRecord(
  input: Partial<TeoyubePostLaunchOwnerReadinessRecord> = {}
): TeoyubePostLaunchOwnerReadinessRecord {
  const checklist = createPostLaunchOwnerReadinessChecklist();
  return {
    id: input.id || "post_launch_owner_readiness_review_6_5",
    label: input.label || "Post-Launch Owner Readiness Review",
    accepted: input.accepted ?? true,
    postLaunchOperationsMayBegin: input.postLaunchOperationsMayBegin ?? true,
    reviewedChecklistIds: input.reviewedChecklistIds || checklist.map((entry) => entry.id),
    notes: input.notes || ["Structured post-launch owner readiness review prepared in memory."],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    usersContacted: false,
    publicUrlFetched: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPostLaunchOwnerReadinessBlockers(record: TeoyubePostLaunchOwnerReadinessRecord = createPostLaunchOwnerReadinessRecord()) {
  const checklist = createPostLaunchOwnerReadinessChecklist();
  const missing = checklist.filter((entry) => entry.required && !record.reviewedChecklistIds.includes(entry.id));
  return [
    ...missing.map((entry) => ({
      id: `post_launch_owner_readiness_missing_${entry.id}`,
      label: entry.label,
      reason: "Required post-launch owner readiness item was not reviewed.",
      requiredAction: "Complete owner readiness review before post-launch operations planning.",
      riskLevel: entry.publicLaunchCritical ? "critical" as const : "high" as const
    })),
    !record.accepted ? { id: "post_launch_owner_readiness_not_accepted", label: record.label, reason: "Owner readiness review has not been accepted.", requiredAction: "Owner must accept or block post-launch operations planning.", riskLevel: "critical" as const } : undefined,
    !record.postLaunchOperationsMayBegin ? { id: "post_launch_owner_readiness_operations_blocked", label: record.label, reason: "Owner blocked post-launch operations.", requiredAction: "Resolve owner concerns before post-launch operations planning.", riskLevel: "critical" as const } : undefined,
    record.usersContacted ? { id: "post_launch_owner_readiness_users_contacted", label: record.label, reason: "Owner readiness review must not contact users.", requiredAction: "Keep user contact outside code.", riskLevel: "critical" as const } : undefined,
    record.publicUrlFetched ? { id: "post_launch_owner_readiness_public_url_fetched", label: record.label, reason: "Owner readiness review must not fetch public URLs.", requiredAction: "Keep URL checks manual.", riskLevel: "critical" as const } : undefined,
    record.fileWritten ? { id: "post_launch_owner_readiness_file_written", label: record.label, reason: "Owner readiness review must not write files.", requiredAction: "Keep review in memory.", riskLevel: "high" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPostLaunchOwnerReadinessWarnings(record: TeoyubePostLaunchOwnerReadinessRecord = createPostLaunchOwnerReadinessRecord()) {
  return [
    record.notes.length === 0 ? {
      id: "post_launch_owner_readiness_notes_missing",
      label: record.label,
      message: "Post-launch owner readiness review has no manual notes.",
      recommendedAction: "Add owner review notes before post-launch operations planning.",
      riskLevel: "medium" as const
    } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; message: string; recommendedAction: string; riskLevel: "medium" }>;
}

export function createPostLaunchOwnerReadinessDecision(
  record: TeoyubePostLaunchOwnerReadinessRecord = createPostLaunchOwnerReadinessRecord()
): TeoyubePostLaunchReadinessDecision {
  const blockers = getPostLaunchOwnerReadinessBlockers(record);
  if (blockers.length > 0) return "blocked";
  if (!record.accepted) return "ready_after_owner_review";
  return "ready_for_post_launch_operations";
}

export function validatePostLaunchOwnerReadiness(record: TeoyubePostLaunchOwnerReadinessRecord = createPostLaunchOwnerReadinessRecord()) {
  const blockers = getPostLaunchOwnerReadinessBlockers(record);
  const warnings = getPostLaunchOwnerReadinessWarnings(record);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createPostLaunchOwnerReadinessReport(record: TeoyubePostLaunchOwnerReadinessRecord = createPostLaunchOwnerReadinessRecord()) {
  const validation = validatePostLaunchOwnerReadiness(record);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createPostLaunchOwnerReadinessDecision(record),
    record,
    checklist: createPostLaunchOwnerReadinessChecklist(),
    blockers: validation.blockers,
    warnings: validation.warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noUsersContacted: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
