import type { TeoyubePublicLaunchDecision } from "./public-launch-preparation-contracts";

export type TeoyubePublicLaunchOwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  launchCritical: boolean;
};

export type TeoyubePublicLaunchOwnerReviewRecord = {
  id: string;
  label: string;
  accepted: boolean;
  publicLaunchPreparationMayContinue: boolean;
  reviewedChecklistIds: string[];
  notes: string[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  publicLaunchPerformed: false;
  productionPersistenceConnected: false;
  externalAnalyticsConnected: false;
  liveAiOrchestrationConnected: false;
  generatedAt: string;
};

function checklistItem(id: string, label: string): TeoyubePublicLaunchOwnerReviewChecklistItem {
  return { id, label, required: true, complete: true, launchCritical: true };
}

export function createPublicLaunchOwnerReviewChecklist(): TeoyubePublicLaunchOwnerReviewChecklistItem[] {
  return [
    checklistItem("readiness_audit_reviewed", "5.1 public launch readiness audit reviewed"),
    checklistItem("production_service_plan_reviewed", "Production service connection plan reviewed"),
    checklistItem("database_persistence_deferred", "Database persistence remains deferred until privacy/consent review"),
    checklistItem("external_analytics_deferred", "External analytics remain deferred until consent and payload review"),
    checklistItem("live_ai_deferred", "Live AI orchestration remains deferred until safety/cost review"),
    checklistItem("privacy_consent_boundaries_reviewed", "Privacy and consent boundaries reviewed"),
    checklistItem("scripture_explanation_fallback_preserved", "Scripture, explanation, fallback, and confidence guardrails preserved"),
    checklistItem("surface_readiness_reviewed", "Public launch surface readiness reviewed"),
    checklistItem("known_limitations_accepted", "Known limitations accepted"),
    checklistItem("no_public_launch_confirmed", "No public launch, user contact, or automatic feedback collection performed"),
    checklistItem("no_providers_connected_confirmed", "No production persistence, analytics, or live AI provider connection performed"),
    checklistItem("next_step_5_2_confirmed", "Next step confirmed as Privacy, Terms, Consent Copy & Public QA Checklist")
  ];
}

export function createPublicLaunchOwnerReviewRecord(
  input: Partial<TeoyubePublicLaunchOwnerReviewRecord> = {}
): TeoyubePublicLaunchOwnerReviewRecord {
  const checklist = createPublicLaunchOwnerReviewChecklist();
  return {
    id: input.id || "public_launch_owner_review_5_1",
    label: input.label || "Public Launch Preparation 5.1 Owner Review",
    accepted: input.accepted ?? true,
    publicLaunchPreparationMayContinue: input.publicLaunchPreparationMayContinue ?? true,
    reviewedChecklistIds: input.reviewedChecklistIds || checklist.map((entry) => entry.id),
    notes: input.notes || ["Owner-review record prepared in memory for Public Launch Preparation 5.1."],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    publicLaunchPerformed: false,
    productionPersistenceConnected: false,
    externalAnalyticsConnected: false,
    liveAiOrchestrationConnected: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPublicLaunchOwnerReviewBlockers(
  record: TeoyubePublicLaunchOwnerReviewRecord = createPublicLaunchOwnerReviewRecord()
) {
  const checklist = createPublicLaunchOwnerReviewChecklist();
  const missing = checklist.filter((entry) => entry.required && !record.reviewedChecklistIds.includes(entry.id));
  return [
    ...missing.map((entry) => ({
      id: `public_launch_owner_review_missing_${entry.id}`,
      label: entry.label,
      reason: "Required owner review item was not reviewed.",
      requiredAction: "Complete the 5.1 owner review before advancing.",
      riskLevel: "critical" as const
    })),
    !record.accepted ? { id: "public_launch_owner_review_not_accepted", label: record.label, reason: "Owner has not accepted the 5.1 preparation record.", requiredAction: "Owner must accept or block the 5.1 record.", riskLevel: "critical" as const } : undefined,
    !record.publicLaunchPreparationMayContinue ? { id: "public_launch_owner_review_continuation_blocked", label: record.label, reason: "Owner blocked continuing public launch preparation.", requiredAction: "Resolve owner concerns before 5.2.", riskLevel: "critical" as const } : undefined,
    record.fileWritten ? { id: "public_launch_owner_review_file_written", label: record.label, reason: "Owner review must not write files.", requiredAction: "Keep owner review in memory.", riskLevel: "high" as const } : undefined,
    record.usersContacted ? { id: "public_launch_owner_review_users_contacted", label: record.label, reason: "Owner review must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined,
    record.feedbackCollectedAutomatically ? { id: "public_launch_owner_review_feedback_collected", label: record.label, reason: "Owner review must not collect feedback automatically.", requiredAction: "Use manual owner notes only.", riskLevel: "critical" as const } : undefined,
    record.publicLaunchPerformed ? { id: "public_launch_owner_review_launch_performed", label: record.label, reason: "Owner review must not perform public launch.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    record.productionPersistenceConnected ? { id: "public_launch_owner_review_persistence_connected", label: record.label, reason: "Owner review must not connect production persistence.", requiredAction: "Keep persistence disconnected.", riskLevel: "critical" as const } : undefined,
    record.externalAnalyticsConnected ? { id: "public_launch_owner_review_analytics_connected", label: record.label, reason: "Owner review must not connect analytics.", requiredAction: "Keep analytics disconnected.", riskLevel: "critical" as const } : undefined,
    record.liveAiOrchestrationConnected ? { id: "public_launch_owner_review_live_ai_connected", label: record.label, reason: "Owner review must not connect live AI.", requiredAction: "Keep live AI disconnected.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPublicLaunchOwnerReviewWarnings(record: TeoyubePublicLaunchOwnerReviewRecord = createPublicLaunchOwnerReviewRecord()) {
  return [
    record.notes.length === 0 ? {
      id: "public_launch_owner_review_notes_missing",
      label: record.label,
      message: "Owner review has no manual notes.",
      recommendedAction: "Add owner notes before advancing to 5.2.",
      riskLevel: "medium" as const
    } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; message: string; recommendedAction: string; riskLevel: "medium" }>;
}

export function createPublicLaunchOwnerReviewDecision(
  record: TeoyubePublicLaunchOwnerReviewRecord = createPublicLaunchOwnerReviewRecord()
): TeoyubePublicLaunchDecision {
  const blockers = getPublicLaunchOwnerReviewBlockers(record);
  if (blockers.length > 0) return "blocked";
  return "ready_after_owner_review";
}

export function createPublicLaunchOwnerReviewReport(
  record: TeoyubePublicLaunchOwnerReviewRecord = createPublicLaunchOwnerReviewRecord()
) {
  const blockers = getPublicLaunchOwnerReviewBlockers(record);
  const warnings = getPublicLaunchOwnerReviewWarnings(record);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: createPublicLaunchOwnerReviewDecision(record),
    record,
    checklist: createPublicLaunchOwnerReviewChecklist(),
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noProductionPersistenceConnected: true,
    noExternalAnalyticsConnected: true,
    noLiveAiOrchestrationConnected: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
