import type { TeoyubeSoftLaunchStabilizationDecision } from "./soft-launch-safe-fix-release-contracts";

export type TeoyubeSoftLaunchStabilizationOwnerReviewChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  launchCritical: boolean;
};

export type TeoyubeSoftLaunchStabilizationOwnerReviewRecord = {
  id: string;
  label: string;
  accepted: boolean;
  ownerDecision: TeoyubeSoftLaunchStabilizationDecision;
  reviewedChecklistIds: string[];
  notes: string[];
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  usersContacted: false;
  generatedAt: string;
};

function item(id: string, label: string, launchCritical = true): TeoyubeSoftLaunchStabilizationOwnerReviewChecklistItem {
  return { id, label, required: true, complete: true, launchCritical };
}

export function createSoftLaunchStabilizationOwnerReviewChecklist(): TeoyubeSoftLaunchStabilizationOwnerReviewChecklistItem[] {
  return [
    item("safe_fixes_reviewed", "Safe fixes reviewed"),
    item("skipped_fixes_reviewed", "Skipped fixes reviewed", false),
    item("blocked_fixes_reviewed", "Blocked fixes reviewed"),
    item("deferred_fixes_reviewed", "Deferred fixes reviewed", false),
    item("regression_results_reviewed", "Regression results reviewed"),
    item("scripture_anchoring_reviewed", "Scripture anchoring reviewed"),
    item("explanation_paths_reviewed", "Explanation paths reviewed"),
    item("fallback_safety_reviewed", "Fallback safety reviewed"),
    item("consent_privacy_reviewed", "Consent/privacy reviewed"),
    item("mobile_accessibility_reviewed", "Mobile/accessibility reviewed"),
    item("external_analytics_disabled_reviewed", "External analytics still disabled"),
    item("production_persistence_disabled_reviewed", "Production persistence still disabled"),
    item("live_ai_orchestration_disabled_reviewed", "Live AI orchestration still disabled"),
    item("continue_pause_decision_accepted", "Continue/pause decision accepted")
  ];
}

export function createSoftLaunchStabilizationOwnerReviewRecord(
  input: Partial<TeoyubeSoftLaunchStabilizationOwnerReviewRecord> = {}
): TeoyubeSoftLaunchStabilizationOwnerReviewRecord {
  const checklist = createSoftLaunchStabilizationOwnerReviewChecklist();
  return {
    id: input.id || "soft_launch_stabilization_owner_review_4_4",
    label: input.label || "Soft Launch Stabilization Owner Review",
    accepted: input.accepted ?? true,
    ownerDecision: input.ownerDecision || "continue_soft_launch",
    reviewedChecklistIds: input.reviewedChecklistIds || checklist.map((entry) => entry.id),
    notes: input.notes || ["Manual owner review record prepared in memory."],
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    usersContacted: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getSoftLaunchStabilizationOwnerReviewBlockers(
  record: TeoyubeSoftLaunchStabilizationOwnerReviewRecord
) {
  const checklist = createSoftLaunchStabilizationOwnerReviewChecklist();
  const missing = checklist.filter((entry) => entry.required && !record.reviewedChecklistIds.includes(entry.id));
  return [
    ...missing.map((entry) => ({
      id: `stabilization_owner_missing_${entry.id}`,
      label: entry.label,
      reason: "Required owner stabilization review checklist item is missing.",
      requiredAction: "Complete owner review before continuing.",
      riskLevel: entry.launchCritical ? "critical" as const : "high" as const
    })),
    !record.accepted
      ? {
          id: "stabilization_owner_not_accepted",
          label: record.label,
          reason: "Owner stabilization review has not been accepted.",
          requiredAction: "Pause until owner review is accepted.",
          riskLevel: "critical" as const
        }
      : undefined,
    record.usersContacted
      ? {
          id: "stabilization_owner_users_contacted",
          label: record.label,
          reason: "Owner review helper must not contact users.",
          requiredAction: "Remove user contact from this helper.",
          riskLevel: "critical" as const
        }
      : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getSoftLaunchStabilizationOwnerReviewWarnings(
  record: TeoyubeSoftLaunchStabilizationOwnerReviewRecord
) {
  return record.notes.length === 0
    ? [{
        id: "stabilization_owner_notes_missing",
        label: record.label,
        message: "Owner stabilization review has no notes.",
        recommendedAction: "Add manual review notes before closing stabilization."
      }]
    : [];
}

export function createSoftLaunchStabilizationOwnerReviewDecision(
  record: TeoyubeSoftLaunchStabilizationOwnerReviewRecord
): TeoyubeSoftLaunchStabilizationDecision {
  if (getSoftLaunchStabilizationOwnerReviewBlockers(record).length > 0) return "blocked";
  if (record.ownerDecision === "prepare_rollback") return "prepare_rollback";
  if (record.ownerDecision === "pause_for_review") return "pause_for_review";
  if (getSoftLaunchStabilizationOwnerReviewWarnings(record).length > 0) return "continue_with_warnings";
  return record.ownerDecision;
}

export function validateSoftLaunchStabilizationOwnerReview(record: TeoyubeSoftLaunchStabilizationOwnerReviewRecord) {
  const blockers = getSoftLaunchStabilizationOwnerReviewBlockers(record);
  return { valid: blockers.length === 0, blockers, warnings: getSoftLaunchStabilizationOwnerReviewWarnings(record) };
}

export function createSoftLaunchStabilizationOwnerReviewReport(
  record: TeoyubeSoftLaunchStabilizationOwnerReviewRecord = createSoftLaunchStabilizationOwnerReviewRecord()
) {
  const validation = validateSoftLaunchStabilizationOwnerReview(record);
  return {
    valid: validation.valid,
    ready: validation.valid && record.accepted,
    decision: createSoftLaunchStabilizationOwnerReviewDecision(record),
    record,
    checklist: createSoftLaunchStabilizationOwnerReviewChecklist(),
    blockers: validation.blockers,
    warnings: validation.warnings,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
