import type { TeoyubeSoftLaunchManualApproval } from "./preview-deployment-review-contracts";

export type TeoyubeSoftLaunchManualApprovalInput = {
  approved?: boolean;
  approvedBy?: string;
  completedItemIds?: string[];
  notes?: string[];
};

export function createSoftLaunchManualApprovalChecklist() {
  return [
    "founder_owner_review",
    "scripture_anchoring_reviewed",
    "safety_fallback_reviewed",
    "consent_controls_reviewed",
    "mobile_qa_reviewed",
    "accessibility_basics_reviewed",
    "preview_issue_log_reviewed",
    "rollback_plan_reviewed",
    "no_external_analytics_confirmed",
    "no_production_persistence_confirmed",
    "no_live_ai_confirmed",
    "soft_launch_scope_accepted"
  ].map((id) => ({
    id,
    label: id.replace(/_/g, " "),
    required: true
  }));
}

export function createSoftLaunchManualApprovalRecord(
  input: TeoyubeSoftLaunchManualApprovalInput = {}
): TeoyubeSoftLaunchManualApproval {
  return {
    id: "soft_launch_manual_approval",
    approved: input.approved === true,
    approvedBy: input.approvedBy,
    checklistItemIds: input.completedItemIds || [],
    notes: input.notes || ["Manual approval record is structured only; no signature is required."],
    createdAt: new Date().toISOString()
  };
}

export function getSoftLaunchManualApprovalWarnings(record: TeoyubeSoftLaunchManualApproval): string[] {
  const checklist = createSoftLaunchManualApprovalChecklist();
  const missing = checklist.filter((item) => !record.checklistItemIds.includes(item.id));

  return [
    record.approved ? "" : "Soft launch manual approval has not been marked approved.",
    ...missing.map((item) => `Manual approval item pending: ${item.label}.`)
  ].filter(Boolean);
}

export function validateSoftLaunchManualApproval(record: TeoyubeSoftLaunchManualApproval) {
  const warnings = getSoftLaunchManualApprovalWarnings(record);

  return {
    valid: record.approved && warnings.length === 0,
    warnings
  };
}

export function createSoftLaunchManualApprovalReport(record: TeoyubeSoftLaunchManualApproval = createSoftLaunchManualApprovalRecord()) {
  const validation = validateSoftLaunchManualApproval(record);

  return {
    ...validation,
    record,
    checklist: createSoftLaunchManualApprovalChecklist(),
    generatedAt: new Date().toISOString()
  };
}

