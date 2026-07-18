import type {
  TeoyubeControlledPublicLaunchActivationBlocker,
  TeoyubeControlledPublicLaunchActivationCheck,
  TeoyubeControlledPublicLaunchActivationDecision,
  TeoyubeControlledPublicLaunchActivationWarning,
  TeoyubeControlledPublicLaunchOwnerApproval
} from "./controlled-public-launch-activation-contracts";

function item(id: string, label: string, details: string, complete = true): TeoyubeControlledPublicLaunchActivationCheck {
  return { id, label, phase: "owner_approval", required: true, complete, launchCritical: true, details };
}

function blocker(id: string, reason: string): TeoyubeControlledPublicLaunchActivationBlocker {
  return {
    id,
    label: id.replace(/_/g, " "),
    phase: "owner_approval",
    severity: "critical",
    reason,
    requiredAction: "Complete structured owner approval before manual public activation."
  };
}

export function createControlledPublicOwnerApprovalChecklist(): TeoyubeControlledPublicLaunchActivationCheck[] {
  return [
    item("final_public_launch_package_reviewed", "Final public launch package reviewed", "Owner reviewed the final public launch package."),
    item("final_public_go_no_go_reviewed", "Final public go/no-go reviewed", "Owner reviewed the final public go/no-go."),
    item("public_launch_scope_accepted", "Public launch scope accepted", "Owner accepted public launch scope."),
    item("known_limitations_accepted", "Known limitations accepted", "Owner accepted known limitations."),
    item("production_service_decisions_accepted", "Production service decisions accepted", "Owner accepted service decisions."),
    item("database_decision_accepted", "Database decision accepted", "Owner accepted database persistence status."),
    item("analytics_decision_accepted", "Analytics decision accepted", "Owner accepted analytics status."),
    item("live_ai_decision_accepted", "Live AI decision accepted", "Owner accepted live AI status."),
    item("privacy_terms_consent_reviewed", "Privacy, terms, and consent copy reviewed", "Owner reviewed privacy, terms, and consent copy."),
    item("public_safety_certification_reviewed", "Public safety certification reviewed", "Owner reviewed public safety certification."),
    item("public_surface_qa_reviewed", "Public surface QA reviewed", "Owner reviewed public surface QA."),
    item("public_communication_readiness_reviewed", "Public communication readiness reviewed", "Owner reviewed public communication readiness."),
    item("public_feedback_intake_reviewed", "Public feedback intake readiness reviewed", "Owner reviewed feedback intake readiness."),
    item("pause_rollback_criteria_accepted", "Pause/rollback criteria accepted", "Owner accepted pause and rollback criteria."),
    item("scripture_anchoring_reviewed", "Scripture anchoring reviewed", "Owner reviewed Scripture anchoring."),
    item("explanation_paths_reviewed", "Explanation paths reviewed", "Owner reviewed explanation paths."),
    item("fallback_safety_reviewed", "Fallback safety reviewed", "Owner reviewed fallback safety."),
    item("consent_privacy_reviewed", "Consent/privacy reviewed", "Owner reviewed consent and privacy."),
    item("mobile_accessibility_reviewed", "Mobile/accessibility readiness reviewed", "Owner reviewed mobile and accessibility readiness."),
    item("manual_activation_decision_recorded", "Manual public activation decision recorded", "Owner recorded whether controlled public activation may proceed manually.")
  ];
}

export function createControlledPublicOwnerApprovalRecord(
  input: Partial<TeoyubeControlledPublicLaunchOwnerApproval> = {}
): TeoyubeControlledPublicLaunchOwnerApproval {
  return {
    id: input.id || "controlled_public_owner_approval_6_1",
    label: input.label || "Controlled Public Launch Owner Approval",
    status: input.status || "approved",
    checklist: input.checklist || createControlledPublicOwnerApprovalChecklist(),
    controlledPublicActivationAccepted: input.controlledPublicActivationAccepted ?? true,
    controlledPublicActivationBlocked: input.controlledPublicActivationBlocked ?? false,
    ownerNotes: input.ownerNotes || ["Structured manual owner approval is ready for controlled public activation."],
    manualApprovalOnly: true,
    signatureRequired: false,
    publicLaunchPerformed: false,
    messagesSent: false,
    usersContacted: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getControlledPublicOwnerApprovalBlockers(
  record: TeoyubeControlledPublicLaunchOwnerApproval
): TeoyubeControlledPublicLaunchActivationBlocker[] {
  return [
    record.status === "blocked" ? blocker("controlled_public_owner_blocked", "Owner blocked controlled public activation.") : undefined,
    record.controlledPublicActivationBlocked ? blocker("controlled_public_activation_blocked", "Controlled public activation is blocked in the owner record.") : undefined,
    !record.controlledPublicActivationAccepted ? blocker("controlled_public_activation_not_accepted", "Owner must accept manual controlled public activation or explicitly block it.") : undefined,
    record.publicLaunchPerformed ? blocker("controlled_public_owner_launched", "Owner approval module must not launch Teoyube.") : undefined,
    record.messagesSent ? blocker("controlled_public_owner_messages_sent", "Owner approval must not send messages.") : undefined,
    record.usersContacted ? blocker("controlled_public_owner_users_contacted", "Owner approval must not contact users.") : undefined,
    ...record.checklist.filter((entry) => entry.required && !entry.complete).map((entry) => blocker(`controlled_public_owner_${entry.id}`, entry.details))
  ].filter(Boolean) as TeoyubeControlledPublicLaunchActivationBlocker[];
}

export function getControlledPublicOwnerApprovalWarnings(
  record: TeoyubeControlledPublicLaunchOwnerApproval
): TeoyubeControlledPublicLaunchActivationWarning[] {
  return [
    {
      id: "controlled_public_owner_manual_only",
      label: "Owner approval is manual only",
      phase: "owner_approval",
      severity: "medium",
      message: "This is a structured manual approval record and does not replace actual owner judgment.",
      recommendedAction: "Owner should review all public launch evidence before activation."
    },
    record.status === "needs_review"
      ? {
          id: "controlled_public_owner_review_needed",
          label: "Owner review needed",
          phase: "owner_approval",
          severity: "high",
          message: "Owner approval status is needs_review.",
          recommendedAction: "Complete owner review before manual public activation."
        }
      : undefined
  ].filter(Boolean) as TeoyubeControlledPublicLaunchActivationWarning[];
}

export function createControlledPublicOwnerApprovalDecision(
  record: TeoyubeControlledPublicLaunchOwnerApproval
): TeoyubeControlledPublicLaunchActivationDecision {
  const blockers = getControlledPublicOwnerApprovalBlockers(record);
  if (blockers.length > 0) return "blocked";
  if (record.status !== "approved") return "ready_after_owner_review";
  return "ready_for_manual_public_activation";
}

export function validateControlledPublicOwnerApproval(record: TeoyubeControlledPublicLaunchOwnerApproval) {
  const blockers = getControlledPublicOwnerApprovalBlockers(record);
  return { valid: blockers.length === 0, blockers, warnings: getControlledPublicOwnerApprovalWarnings(record) };
}

export function createControlledPublicOwnerApprovalReport(
  record: TeoyubeControlledPublicLaunchOwnerApproval = createControlledPublicOwnerApprovalRecord()
) {
  const validation = validateControlledPublicOwnerApproval(record);
  return {
    valid: validation.valid,
    ready: validation.valid && record.status === "approved",
    decision: createControlledPublicOwnerApprovalDecision(record),
    record,
    checklistCount: record.checklist.length,
    completedChecklistCount: record.checklist.filter((entry) => entry.complete).length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noPublicLaunchPerformed: true,
    noMessagesSent: true,
    noUsersContacted: true,
    generatedAt: new Date().toISOString()
  };
}
