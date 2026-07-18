import type {
  TeoyubeControlledBetaOwnerApprovalBlocker,
  TeoyubeControlledBetaOwnerApprovalCheck,
  TeoyubeControlledBetaOwnerApprovalDecision,
  TeoyubeControlledBetaOwnerApprovalRecord,
  TeoyubeControlledBetaOwnerApprovalReport,
  TeoyubeControlledBetaOwnerApprovalStatus,
  TeoyubeControlledBetaOwnerApprovalWarning
} from "./controlled-beta-owner-approval-contracts";

function item(id: string, label: string, details: string, accepted = false): TeoyubeControlledBetaOwnerApprovalCheck {
  return { id, label, required: true, accepted, details };
}

export function createControlledBetaOwnerApprovalChecklist(accepted = false): TeoyubeControlledBetaOwnerApprovalCheck[] {
  return [
    item("beta_scope_reviewed", "Beta scope reviewed", "Owner confirms controlled beta scope remains limited and manual.", accepted),
    item("manual_qa_results_reviewed", "Manual QA results reviewed", "Owner reviews Phase 5.2 manual QA evidence.", accepted),
    item("readiness_scores_reviewed", "Readiness scores reviewed", "Owner reviews pre-remediation and post-remediation readiness scores.", accepted),
    item("remediation_results_reviewed", "Remediation results reviewed", "Owner reviews Phase 5.3 fix queue, remediation, and safe patch summary.", accepted),
    item("regression_qa_reviewed", "Regression QA reviewed", "Owner reviews Phase 5.3 regression QA results.", accepted),
    item("remaining_blockers_reviewed", "Remaining blockers reviewed", "Owner confirms no unresolved critical beta blockers are accepted into execution planning.", accepted),
    item("remaining_warnings_reviewed", "Remaining warnings reviewed", "Owner reviews warnings and accepts or defers them manually.", accepted),
    item("disabled_service_state_accepted", "Disabled service state accepted", "Owner accepts that services remain disabled unless future approval exists.", accepted),
    item("reviewed_content_gates_accepted", "Reviewed content gates accepted", "Owner accepts reviewed content gates and no automatic publishing.", accepted),
    item("controlled_admin_boundaries_accepted", "Controlled admin prototype boundaries accepted", "Owner accepts prototype-only admin boundaries with no auth, CMS, or persistence.", accepted),
    item("privacy_security_boundaries_accepted", "Privacy/security boundaries accepted", "Owner accepts consent/privacy boundaries and no hidden sensitive personalization.", accepted),
    item("scripture_anchoring_reviewed", "Scripture anchoring reviewed", "Owner reviews Scripture anchor preservation.", accepted),
    item("explanation_traces_reviewed", "Explanation traces reviewed", "Owner reviews explanation path preservation.", accepted),
    item("fallback_safety_reviewed", "Fallback safety reviewed", "Owner reviews safe fallback boundaries.", accepted),
    item("confidence_labels_reviewed", "Confidence labels reviewed", "Owner reviews confidence label visibility.", accepted),
    item("mobile_accessibility_reviewed", "Mobile/accessibility readiness reviewed", "Owner reviews mobile and accessibility readiness.", accepted),
    item("operational_handoff_reviewed", "Operational handoff reviewed", "Owner reviews issue intake, feedback boundaries, pause criteria, rollback criteria, and next actions.", accepted),
    item("execution_planning_gate", "Controlled beta execution planning gate accepted or blocked", "Owner manually accepts or blocks proceeding to controlled beta execution planning.", accepted)
  ];
}

export function createControlledBetaOwnerApprovalRecord(input: {
  reviewed?: boolean;
  approved?: boolean;
  acceptedAll?: boolean;
  checklist?: TeoyubeControlledBetaOwnerApprovalCheck[];
  notes?: string[];
} = {}): TeoyubeControlledBetaOwnerApprovalRecord {
  const reviewed = input.reviewed ?? false;
  const approved = input.approved ?? false;
  const acceptedAll = input.acceptedAll ?? (reviewed && approved);
  return {
    id: "phase_5_4_controlled_beta_owner_approval",
    reviewed,
    approved,
    checklist: input.checklist || createControlledBetaOwnerApprovalChecklist(acceptedAll),
    notes: input.notes || [],
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getControlledBetaOwnerApprovalBlockers(record: TeoyubeControlledBetaOwnerApprovalRecord): TeoyubeControlledBetaOwnerApprovalBlocker[] {
  return record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : [{
        id: "owner_approval_boundary_violation",
        message: "Controlled beta owner approval must remain in-memory and must not launch beta, contact users, collect feedback automatically, or require external services.",
        requiredAction: "Restore the owner approval record to a manual, in-memory gate."
      }];
}

export function getControlledBetaOwnerApprovalWarnings(record: TeoyubeControlledBetaOwnerApprovalRecord): TeoyubeControlledBetaOwnerApprovalWarning[] {
  return [
    ...(!record.reviewed ? [{
      id: "owner_approval_not_reviewed",
      message: "Controlled beta owner approval has not been manually reviewed.",
      recommendedAction: "Complete owner review before controlled beta execution planning."
    }] : []),
    ...(!record.approved ? [{
      id: "owner_approval_not_approved",
      message: "Controlled beta owner approval has not been approved.",
      recommendedAction: "Approve or block controlled beta execution planning manually."
    }] : []),
    ...record.checklist
      .filter((entry) => entry.required && !entry.accepted)
      .map((entry) => ({
        id: `${entry.id}_pending`,
        message: `${entry.label} remains pending.`,
        recommendedAction: entry.details
      }))
  ];
}

export function createControlledBetaOwnerApprovalDecision(record: TeoyubeControlledBetaOwnerApprovalRecord): TeoyubeControlledBetaOwnerApprovalDecision {
  const blockers = getControlledBetaOwnerApprovalBlockers(record);
  if (blockers.length) return "not_approved";
  if (!record.reviewed || !record.approved) return "not_approved";
  const pending = record.checklist.filter((entry) => entry.required && !entry.accepted);
  if (pending.some((entry) => entry.id.includes("remediation") || entry.id.includes("blockers"))) return "needs_more_remediation";
  if (pending.some((entry) => entry.id.includes("disabled_service"))) return "needs_service_gate_review";
  if (pending.some((entry) => entry.id.includes("privacy_security"))) return "needs_privacy_security_review";
  return pending.length ? "approved_with_warnings" : "approved_for_controlled_beta_execution_planning";
}

function statusFromDecision(decision: TeoyubeControlledBetaOwnerApprovalDecision): TeoyubeControlledBetaOwnerApprovalStatus {
  if (decision === "approved_for_controlled_beta_execution_planning") return "approved";
  if (decision === "approved_with_warnings") return "approved_with_warnings";
  if (decision === "needs_more_remediation" || decision === "needs_service_gate_review" || decision === "needs_privacy_security_review") return "blocked";
  if (decision === "not_approved") return "not_approved";
  return "unknown";
}

export function validateControlledBetaOwnerApproval(record: TeoyubeControlledBetaOwnerApprovalRecord): TeoyubeControlledBetaOwnerApprovalReport {
  return createControlledBetaOwnerApprovalReport(record);
}

export function createControlledBetaOwnerApprovalReport(record: TeoyubeControlledBetaOwnerApprovalRecord): TeoyubeControlledBetaOwnerApprovalReport {
  const blockers = getControlledBetaOwnerApprovalBlockers(record);
  const warnings = getControlledBetaOwnerApprovalWarnings(record);
  const decision = createControlledBetaOwnerApprovalDecision(record);
  return {
    valid: blockers.length === 0,
    status: statusFromDecision(decision),
    decision,
    record,
    blockers,
    warnings,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
