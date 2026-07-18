import type {
  TeoyubeControlledLaunchActivationBlocker,
  TeoyubeControlledLaunchActivationCheck,
  TeoyubeControlledLaunchActivationDecision,
  TeoyubeControlledLaunchActivationWarning,
  TeoyubeControlledLaunchOwnerApproval
} from "./controlled-launch-activation-contracts";

function item(id: string, label: string, details: string, complete = true): TeoyubeControlledLaunchActivationCheck {
  return { id, label, phase: "owner_approval", required: true, complete, launchCritical: true, details };
}

function blocker(id: string, reason: string): TeoyubeControlledLaunchActivationBlocker {
  return {
    id,
    label: id.replace(/_/g, " "),
    phase: "owner_approval",
    severity: "critical",
    reason,
    requiredAction: "Complete structured owner approval before manual controlled activation."
  };
}

export function createControlledLaunchOwnerApprovalChecklist(): TeoyubeControlledLaunchActivationCheck[] {
  return [
    item("soft_launch_readiness_package_reviewed", "Soft launch readiness package reviewed", "Owner reviewed the readiness package."),
    item("final_go_no_go_reviewed", "Final go/no-go reviewed", "Owner reviewed the final soft launch go/no-go."),
    item("launch_scope_accepted", "Launch scope accepted", "Owner accepted the limited launch scope."),
    item("participant_scope_accepted", "Participant scope accepted", "Owner accepted participant boundaries."),
    item("known_limitations_accepted", "Known limitations accepted", "Owner accepted known limitations."),
    item("feedback_workflow_accepted", "Feedback workflow accepted", "Owner accepted manual feedback workflow."),
    item("pause_rollback_criteria_accepted", "Pause/rollback criteria accepted", "Owner accepted pause and rollback criteria."),
    item("scripture_anchoring_reviewed", "Scripture anchoring reviewed", "Owner reviewed Scripture anchoring."),
    item("explanation_paths_reviewed", "Explanation paths reviewed", "Owner reviewed explanation paths."),
    item("fallback_safety_reviewed", "Fallback safety reviewed", "Owner reviewed fallback behavior."),
    item("consent_privacy_reviewed", "Consent/privacy reviewed", "Owner reviewed consent and privacy controls."),
    item("mobile_accessibility_reviewed", "Mobile/accessibility readiness reviewed", "Owner reviewed mobile and accessibility readiness."),
    item("no_external_analytics_confirmed", "No external analytics confirmed", "Owner confirmed analytics remain disconnected."),
    item("no_production_persistence_confirmed", "No production persistence confirmed", "Owner confirmed production persistence remains disconnected."),
    item("no_live_ai_orchestration_confirmed", "No live AI orchestration confirmed", "Owner confirmed live AI orchestration remains disabled."),
    item("manual_activation_decision_recorded", "Manual activation decision recorded", "Owner recorded whether controlled activation may proceed manually.")
  ];
}

export function createControlledLaunchOwnerApprovalRecord(
  input: Partial<TeoyubeControlledLaunchOwnerApproval> = {}
): TeoyubeControlledLaunchOwnerApproval {
  return {
    id: input.id || "controlled_launch_owner_approval_4_1",
    label: input.label || "Controlled Launch Owner Approval",
    status: input.status || "approved",
    checklist: input.checklist || createControlledLaunchOwnerApprovalChecklist(),
    controlledActivationAccepted: input.controlledActivationAccepted ?? true,
    controlledActivationBlocked: input.controlledActivationBlocked ?? false,
    ownerNotes: input.ownerNotes || ["Structured manual owner approval is ready for controlled activation."],
    manualApprovalOnly: true,
    signatureRequired: false,
    messagesSent: false,
    usersContacted: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getControlledLaunchOwnerApprovalBlockers(
  record: TeoyubeControlledLaunchOwnerApproval
): TeoyubeControlledLaunchActivationBlocker[] {
  return [
    record.status === "blocked" ? blocker("controlled_launch_owner_blocked", "Owner blocked controlled activation.") : undefined,
    record.controlledActivationBlocked ? blocker("controlled_launch_activation_blocked", "Controlled activation is blocked in the owner record.") : undefined,
    !record.controlledActivationAccepted ? blocker("controlled_launch_activation_not_accepted", "Owner must accept manual controlled activation or explicitly block it.") : undefined,
    record.messagesSent ? blocker("controlled_launch_owner_messages_sent", "Owner approval must not send messages.") : undefined,
    record.usersContacted ? blocker("controlled_launch_owner_users_contacted", "Owner approval must not contact users.") : undefined,
    ...record.checklist.filter((entry) => entry.required && !entry.complete).map((entry) => blocker(`controlled_launch_owner_${entry.id}`, entry.details))
  ].filter(Boolean) as TeoyubeControlledLaunchActivationBlocker[];
}

export function getControlledLaunchOwnerApprovalWarnings(
  record: TeoyubeControlledLaunchOwnerApproval
): TeoyubeControlledLaunchActivationWarning[] {
  return [
    {
      id: "controlled_launch_owner_manual_only",
      label: "Owner approval is manual only",
      phase: "owner_approval",
      severity: "medium",
      message: "This is a structured manual approval record and does not replace actual owner judgment.",
      recommendedAction: "Owner should review all launch evidence before activation."
    },
    record.status === "needs_review"
      ? {
          id: "controlled_launch_owner_review_needed",
          label: "Owner review needed",
          phase: "owner_approval",
          severity: "high",
          message: "Owner approval status is needs_review.",
          recommendedAction: "Complete owner review before manual activation."
        }
      : undefined
  ].filter(Boolean) as TeoyubeControlledLaunchActivationWarning[];
}

export function createControlledLaunchOwnerApprovalDecision(
  record: TeoyubeControlledLaunchOwnerApproval
): TeoyubeControlledLaunchActivationDecision {
  const blockers = getControlledLaunchOwnerApprovalBlockers(record);
  if (blockers.length > 0) return "blocked";
  if (record.status !== "approved") return "ready_after_owner_review";
  return "ready_for_manual_controlled_activation";
}

export function validateControlledLaunchOwnerApproval(record: TeoyubeControlledLaunchOwnerApproval) {
  const blockers = getControlledLaunchOwnerApprovalBlockers(record);
  return { valid: blockers.length === 0, blockers, warnings: getControlledLaunchOwnerApprovalWarnings(record) };
}

export function createControlledLaunchOwnerApprovalReport(
  record: TeoyubeControlledLaunchOwnerApproval = createControlledLaunchOwnerApprovalRecord()
) {
  const validation = validateControlledLaunchOwnerApproval(record);
  return {
    valid: validation.valid,
    ready: validation.valid && record.status === "approved",
    decision: createControlledLaunchOwnerApprovalDecision(record),
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
