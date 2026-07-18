import type {
  TeoyubeFinalSoftLaunchGoNoGoDecision,
  TeoyubeFinalSoftLaunchOwnerApprovalStatus,
  TeoyubeFinalSoftLaunchReadinessBlocker,
  TeoyubeFinalSoftLaunchReadinessWarning
} from "./final-soft-launch-readiness-contracts";

export type TeoyubeFinalSoftLaunchOwnerGoNoGoChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  complete: boolean;
  details: string;
};

export type TeoyubeFinalSoftLaunchOwnerGoNoGoRecord = {
  id: string;
  label: string;
  status: TeoyubeFinalSoftLaunchOwnerApprovalStatus;
  checklist: TeoyubeFinalSoftLaunchOwnerGoNoGoChecklistItem[];
  limitedSoftLaunchExecutionAccepted: boolean;
  limitedSoftLaunchExecutionBlocked: boolean;
  ownerNotes: string[];
  manualApprovalOnly: true;
  signatureRequired: false;
  messagesSent: false;
  usersContacted: false;
  generatedAt: string;
};

export type TeoyubeFinalSoftLaunchOwnerGoNoGoReport = {
  valid: boolean;
  ready: boolean;
  decision: TeoyubeFinalSoftLaunchGoNoGoDecision;
  status: TeoyubeFinalSoftLaunchOwnerApprovalStatus;
  record: TeoyubeFinalSoftLaunchOwnerGoNoGoRecord;
  checklistCount: number;
  completedChecklistCount: number;
  blockers: TeoyubeFinalSoftLaunchReadinessBlocker[];
  warnings: TeoyubeFinalSoftLaunchReadinessWarning[];
  noMessagesSent: true;
  noUsersContacted: true;
  generatedAt: string;
};

function item(id: string, label: string, details: string, complete = true): TeoyubeFinalSoftLaunchOwnerGoNoGoChecklistItem {
  return { id, label, required: true, complete, details };
}

function blocker(id: string, reason: string): TeoyubeFinalSoftLaunchReadinessBlocker {
  return {
    id,
    label: id.replace(/_/g, " "),
    category: "owner_go_no_go",
    severity: "critical",
    reason,
    requiredAction: "Resolve this owner go/no-go item before limited soft launch execution."
  };
}

export function createFinalSoftLaunchOwnerGoNoGoChecklist(): TeoyubeFinalSoftLaunchOwnerGoNoGoChecklistItem[] {
  return [
    item("final_readiness_package_reviewed", "Final readiness package reviewed", "Owner reviews the full final readiness package."),
    item("final_safety_certification_reviewed", "Final safety certification reviewed", "Owner reviews safety certification and theology boundaries."),
    item("surface_certification_reviewed", "Surface certification reviewed", "Owner reviews surface readiness and known manual QA needs."),
    item("quality_gates_reviewed", "Quality gates reviewed", "Owner reviews final quality gates."),
    item("known_limitations_accepted", "Known limitations accepted", "Owner accepts known limitations and participant guidance."),
    item("risk_register_reviewed", "Risk register reviewed", "Owner reviews risk register and mitigations."),
    item("participant_scope_accepted", "Participant scope accepted", "Owner accepts limited participant scope."),
    item("feedback_workflow_accepted", "Feedback workflow accepted", "Owner accepts manual redacted feedback workflow."),
    item("rollback_criteria_accepted", "Rollback criteria accepted", "Owner accepts pause and rollback criteria."),
    item("no_external_analytics_confirmed", "No external analytics confirmed", "Owner confirms analytics remain disconnected."),
    item("no_production_persistence_confirmed", "No production persistence confirmed", "Owner confirms production persistence remains disconnected."),
    item("no_live_ai_confirmed", "No live AI orchestration confirmed", "Owner confirms live AI orchestration remains disabled."),
    item("limited_soft_launch_execution_decision_accepted", "Limited soft launch execution decision accepted", "Owner accepts or blocks the controlled launch activation decision.")
  ];
}

export function createFinalSoftLaunchOwnerGoNoGoRecord(
  input: Partial<TeoyubeFinalSoftLaunchOwnerGoNoGoRecord> = {}
): TeoyubeFinalSoftLaunchOwnerGoNoGoRecord {
  return {
    id: input.id || "final_soft_launch_owner_go_no_go_record_3_3",
    label: input.label || "Final Soft Launch Owner Go/No-Go Record",
    status: input.status || "approved",
    checklist: input.checklist || createFinalSoftLaunchOwnerGoNoGoChecklist(),
    limitedSoftLaunchExecutionAccepted: input.limitedSoftLaunchExecutionAccepted ?? true,
    limitedSoftLaunchExecutionBlocked: input.limitedSoftLaunchExecutionBlocked ?? false,
    ownerNotes: input.ownerNotes || [
      "Structured owner approval record is ready for limited soft launch execution handoff."
    ],
    manualApprovalOnly: true,
    signatureRequired: false,
    messagesSent: false,
    usersContacted: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getFinalSoftLaunchOwnerGoNoGoBlockers(
  record: TeoyubeFinalSoftLaunchOwnerGoNoGoRecord
): TeoyubeFinalSoftLaunchReadinessBlocker[] {
  return [
    record.status === "blocked" ? blocker("final_soft_launch_owner_blocked", "Owner blocked limited soft launch execution.") : undefined,
    record.limitedSoftLaunchExecutionBlocked ? blocker("final_soft_launch_execution_blocked", "Limited soft launch execution is blocked by owner record.") : undefined,
    !record.limitedSoftLaunchExecutionAccepted ? blocker("final_soft_launch_execution_not_accepted", "Owner must accept or explicitly block limited soft launch execution.") : undefined,
    record.messagesSent ? blocker("final_soft_launch_owner_messages_sent", "Owner go/no-go module must not send messages.") : undefined,
    record.usersContacted ? blocker("final_soft_launch_owner_users_contacted", "Owner go/no-go module must not contact users.") : undefined,
    ...record.checklist
      .filter((entry) => entry.required && !entry.complete)
      .map((entry) => blocker(`final_soft_launch_owner_${entry.id}`, entry.details))
  ].filter(Boolean) as TeoyubeFinalSoftLaunchReadinessBlocker[];
}

export function getFinalSoftLaunchOwnerGoNoGoWarnings(
  record: TeoyubeFinalSoftLaunchOwnerGoNoGoRecord
): TeoyubeFinalSoftLaunchReadinessWarning[] {
  return [
    {
      id: "final_soft_launch_owner_manual_only",
      label: "Owner go/no-go is manual only",
      category: "owner_go_no_go",
      severity: "medium",
      message: "This record is structured owner review only and does not replace human review.",
      recommendedAction: "Owner should review final package before controlled activation."
    },
    record.status === "needs_review"
      ? {
          id: "final_soft_launch_owner_needs_review",
          label: "Owner review still needed",
          category: "owner_go_no_go",
          severity: "high",
          message: "Owner status is needs_review.",
          recommendedAction: "Complete owner go/no-go before limited soft launch execution."
        }
      : undefined
  ].filter(Boolean) as TeoyubeFinalSoftLaunchReadinessWarning[];
}

export function createFinalSoftLaunchOwnerGoNoGoDecision(
  record: TeoyubeFinalSoftLaunchOwnerGoNoGoRecord
): TeoyubeFinalSoftLaunchGoNoGoDecision {
  const blockers = getFinalSoftLaunchOwnerGoNoGoBlockers(record);

  if (blockers.length > 0) return "no_go_blocked";
  if (record.status !== "approved") return "go_after_owner_review";
  return "go_for_limited_soft_launch_execution";
}

export function validateFinalSoftLaunchOwnerGoNoGo(record: TeoyubeFinalSoftLaunchOwnerGoNoGoRecord) {
  const blockers = getFinalSoftLaunchOwnerGoNoGoBlockers(record);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings: getFinalSoftLaunchOwnerGoNoGoWarnings(record)
  };
}

export function createFinalSoftLaunchOwnerGoNoGoReport(
  record: TeoyubeFinalSoftLaunchOwnerGoNoGoRecord = createFinalSoftLaunchOwnerGoNoGoRecord()
): TeoyubeFinalSoftLaunchOwnerGoNoGoReport {
  const validation = validateFinalSoftLaunchOwnerGoNoGo(record);

  return {
    valid: validation.valid,
    ready: validation.valid && record.status === "approved",
    decision: createFinalSoftLaunchOwnerGoNoGoDecision(record),
    status: record.status,
    record,
    checklistCount: record.checklist.length,
    completedChecklistCount: record.checklist.filter((entry) => entry.complete).length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noMessagesSent: true,
    noUsersContacted: true,
    generatedAt: new Date().toISOString()
  };
}
