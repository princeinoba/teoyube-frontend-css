import type { TeoyubePublicLaunchReadinessDecision } from "./soft-launch-completion-contracts";

export type TeoyubePublicLaunchOwnerReadinessChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  launchCritical: boolean;
};

export type TeoyubePublicLaunchOwnerReadinessRecord = {
  id: string;
  label: string;
  accepted: boolean;
  publicLaunchPreparationMayBegin: boolean;
  reviewedChecklistIds: string[];
  notes: string[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  usersContacted: false;
  publicLaunchPerformed: false;
  generatedAt: string;
};

function item(id: string, label: string, launchCritical = true): TeoyubePublicLaunchOwnerReadinessChecklistItem {
  return { id, label, required: true, complete: true, launchCritical };
}

export function createPublicLaunchOwnerReadinessChecklist(): TeoyubePublicLaunchOwnerReadinessChecklistItem[] {
  return [
    item("soft_launch_completion_reviewed", "Soft launch completion reviewed"),
    item("feedback_summary_reviewed", "Feedback summary reviewed"),
    item("issue_closure_reviewed", "Issue closure reviewed"),
    item("stability_certification_reviewed", "Stability certification reviewed"),
    item("final_safety_privacy_reviewed", "Final safety/privacy reviewed"),
    item("known_limitations_accepted", "Known limitations accepted"),
    item("public_launch_risks_reviewed", "Public launch risks reviewed"),
    item("readiness_package_reviewed", "Public launch readiness package reviewed"),
    item("external_analytics_confirmed_disabled", "No external analytics confirmed unless intentionally planned later"),
    item("production_persistence_confirmed_disabled", "No production persistence confirmed unless intentionally planned later"),
    item("live_ai_confirmed_disabled", "No live AI orchestration confirmed unless intentionally planned later"),
    item("public_launch_preparation_decision_recorded", "Public launch preparation may begin or is blocked")
  ];
}

export function createPublicLaunchOwnerReadinessRecord(
  input: Partial<TeoyubePublicLaunchOwnerReadinessRecord> = {}
): TeoyubePublicLaunchOwnerReadinessRecord {
  const checklist = createPublicLaunchOwnerReadinessChecklist();
  return {
    id: input.id || "public_launch_owner_readiness_review_4_5",
    label: input.label || "Public Launch Owner Readiness Review",
    accepted: input.accepted ?? true,
    publicLaunchPreparationMayBegin: input.publicLaunchPreparationMayBegin ?? true,
    reviewedChecklistIds: input.reviewedChecklistIds || checklist.map((entry) => entry.id),
    notes: input.notes || ["Structured owner readiness review prepared in memory."],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    usersContacted: false,
    publicLaunchPerformed: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPublicLaunchOwnerReadinessBlockers(record: TeoyubePublicLaunchOwnerReadinessRecord = createPublicLaunchOwnerReadinessRecord()) {
  const checklist = createPublicLaunchOwnerReadinessChecklist();
  const missing = checklist.filter((entry) => entry.required && !record.reviewedChecklistIds.includes(entry.id));
  return [
    ...missing.map((entry) => ({
      id: `public_launch_owner_readiness_missing_${entry.id}`,
      label: entry.label,
      reason: "Required owner readiness item was not reviewed.",
      requiredAction: "Complete owner readiness review before public launch preparation.",
      riskLevel: entry.launchCritical ? "critical" as const : "high" as const
    })),
    !record.accepted ? { id: "public_launch_owner_readiness_not_accepted", label: record.label, reason: "Owner readiness review has not been accepted.", requiredAction: "Owner must accept or block public launch preparation.", riskLevel: "critical" as const } : undefined,
    !record.publicLaunchPreparationMayBegin ? { id: "public_launch_owner_readiness_preparation_blocked", label: record.label, reason: "Owner blocked public launch preparation.", requiredAction: "Resolve owner concerns before public launch preparation.", riskLevel: "critical" as const } : undefined,
    record.usersContacted ? { id: "public_launch_owner_readiness_users_contacted", label: record.label, reason: "Owner readiness review must not contact users.", requiredAction: "Keep user contact outside code.", riskLevel: "critical" as const } : undefined,
    record.publicLaunchPerformed ? { id: "public_launch_owner_readiness_launch_performed", label: record.label, reason: "Owner readiness review must not perform public launch.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    record.fileWritten ? { id: "public_launch_owner_readiness_file_written", label: record.label, reason: "Owner readiness review must not write files.", requiredAction: "Keep review in memory.", riskLevel: "high" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPublicLaunchOwnerReadinessWarnings(record: TeoyubePublicLaunchOwnerReadinessRecord = createPublicLaunchOwnerReadinessRecord()) {
  return [
    record.notes.length === 0 ? {
      id: "public_launch_owner_readiness_notes_missing",
      label: record.label,
      message: "Owner readiness review has no manual notes.",
      recommendedAction: "Add owner review notes before public launch preparation.",
      riskLevel: "medium" as const
    } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; message: string; recommendedAction: string; riskLevel: "medium" }>;
}

export function createPublicLaunchOwnerReadinessDecision(
  record: TeoyubePublicLaunchOwnerReadinessRecord = createPublicLaunchOwnerReadinessRecord()
): TeoyubePublicLaunchReadinessDecision {
  const blockers = getPublicLaunchOwnerReadinessBlockers(record);
  if (blockers.length > 0) return "blocked";
  if (!record.accepted) return "ready_after_owner_review";
  return "ready_for_public_launch_preparation";
}

export function validatePublicLaunchOwnerReadiness(record: TeoyubePublicLaunchOwnerReadinessRecord = createPublicLaunchOwnerReadinessRecord()) {
  const blockers = getPublicLaunchOwnerReadinessBlockers(record);
  const warnings = getPublicLaunchOwnerReadinessWarnings(record);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createPublicLaunchOwnerReadinessReport(record: TeoyubePublicLaunchOwnerReadinessRecord = createPublicLaunchOwnerReadinessRecord()) {
  const validation = validatePublicLaunchOwnerReadiness(record);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createPublicLaunchOwnerReadinessDecision(record),
    record,
    checklist: createPublicLaunchOwnerReadinessChecklist(),
    blockers: validation.blockers,
    warnings: validation.warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
