import type {
  TeoyubeFinalPublicOwnerApprovalBlocker,
  TeoyubeFinalPublicOwnerApprovalCheck,
  TeoyubeFinalPublicOwnerApprovalDecision,
  TeoyubeFinalPublicOwnerApprovalRecord,
  TeoyubeFinalPublicOwnerApprovalReport,
  TeoyubeFinalPublicOwnerApprovalWarning
} from "./final-public-owner-approval-contracts";

function item(id: string, label: string, details: string, accepted = false): TeoyubeFinalPublicOwnerApprovalCheck {
  return { id, label, required: true, accepted, details };
}

export function createFinalPublicOwnerApprovalChecklist(accepted = false): TeoyubeFinalPublicOwnerApprovalCheck[] {
  return [
    item("controlled_public_release_preparation_reviewed", "Controlled public release preparation reviewed", "Owner reviews Phase 9.1 preparation evidence.", accepted),
    item("final_public_copy_reviewed", "Final public copy reviewed", "Owner reviews public copy, confidence wording, and known limitations.", accepted),
    item("known_limitations_reviewed", "Known limitations reviewed", "Owner confirms known limitations remain visible.", accepted),
    item("public_release_candidate_qa_reviewed", "Public release candidate QA reviewed", "Owner reviews Phase 9.2 QA package.", accepted),
    item("release_candidate_remediation_reviewed", "Release candidate remediation reviewed", "Owner reviews Phase 9.3 remediation package.", accepted),
    item("final_regression_qa_reviewed", "Final regression QA reviewed", "Owner reviews final regression QA results.", accepted),
    item("public_go_no_go_score_reviewed", "Public go/no-go readiness score reviewed", "Owner reviews readiness score and score band.", accepted),
    item("service_disabled_state_accepted", "Service-disabled state accepted", "Owner confirms disabled services remain disabled.", accepted),
    item("privacy_security_boundaries_accepted", "Privacy/security boundaries accepted", "Owner confirms privacy, consent, and sensitive data warnings remain intact.", accepted),
    item("scripture_anchoring_reviewed", "Scripture anchoring reviewed", "Owner confirms Scripture anchors remain present.", accepted),
    item("explanation_traces_reviewed", "Explanation traces reviewed", "Owner confirms explanation traces remain visible.", accepted),
    item("fallback_safety_reviewed", "Fallback safety reviewed", "Owner confirms fallback states remain safe.", accepted),
    item("confidence_labels_reviewed", "Confidence labels reviewed", "Owner confirms confidence labels remain visible and humble.", accepted),
    item("reviewed_content_gate_reviewed", "Reviewed content gate reviewed", "Owner confirms review-only content is not published automatically.", accepted),
    item("support_feedback_readiness_reviewed", "Support/feedback readiness reviewed", "Owner confirms support and feedback remain manual.", accepted),
    item("manual_monitoring_readiness_reviewed", "Manual monitoring readiness reviewed", "Owner confirms manual monitoring plan readiness.", accepted),
    item("operational_handoff_reviewed", "Operational handoff reviewed", "Owner reviews operational handoff package.", accepted),
    item("no_public_launch_from_code", "No public launch occurs from this code", "Owner confirms Phase 9.4 is not a launch action.", accepted),
    item("next_phase_accepted", "Next Phase 9 step may proceed or is blocked", "Owner accepts or blocks Phase 9.5 completion review.", accepted)
  ];
}

export function createFinalPublicOwnerApprovalRecord(input: {
  reviewed?: boolean;
  checklist?: TeoyubeFinalPublicOwnerApprovalCheck[];
  nextPhaseAccepted?: boolean;
  notes?: string[];
} = {}): TeoyubeFinalPublicOwnerApprovalRecord {
  const reviewed = input.reviewed ?? false;
  const checklist = input.checklist || createFinalPublicOwnerApprovalChecklist(reviewed);
  const pending = checklist.some((entry) => entry.required && !entry.accepted);
  return {
    id: "final_public_owner_approval",
    reviewed,
    status: reviewed && !pending ? "approved" : reviewed ? "approved_with_warnings" : "needs_review",
    checklist,
    nextPhaseAccepted: input.nextPhaseAccepted ?? reviewed,
    notes: input.notes || [],
    noSignatureRequired: true,
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlsFetchedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getFinalPublicOwnerApprovalBlockers(record: TeoyubeFinalPublicOwnerApprovalRecord): TeoyubeFinalPublicOwnerApprovalBlocker[] {
  return record.noPublicLaunchPerformed && record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noPublicUrlsFetchedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : [{ id: "owner_approval_boundary_blocker", message: "Final public owner approval must stay manual and must not launch, contact users, collect feedback automatically, fetch public URLs, or require external services." }];
}

export function getFinalPublicOwnerApprovalWarnings(record: TeoyubeFinalPublicOwnerApprovalRecord): TeoyubeFinalPublicOwnerApprovalWarning[] {
  return [
    ...(!record.reviewed ? [{ id: "owner_review_pending", message: "Final public owner approval has not been manually completed." }] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => ({ id: `${entry.id}_pending`, message: `${entry.label} remains pending.` })),
    ...(!record.nextPhaseAccepted ? [{ id: "phase_9_5_not_accepted", message: "Phase 9.5 has not been accepted by owner review." }] : [])
  ];
}

export function createFinalPublicOwnerApprovalDecision(record: TeoyubeFinalPublicOwnerApprovalRecord): TeoyubeFinalPublicOwnerApprovalDecision {
  const blockers = getFinalPublicOwnerApprovalBlockers(record);
  const warnings = getFinalPublicOwnerApprovalWarnings(record);
  if (blockers.length) return "not_approved";
  if (!record.reviewed || !record.nextPhaseAccepted) return "not_approved";
  return warnings.length ? "approved_with_warnings" : "approved_for_controlled_public_release_execution_planning";
}

export function validateFinalPublicOwnerApproval(record: TeoyubeFinalPublicOwnerApprovalRecord): TeoyubeFinalPublicOwnerApprovalReport {
  return createFinalPublicOwnerApprovalReport(record);
}

export function createFinalPublicOwnerApprovalReport(record: TeoyubeFinalPublicOwnerApprovalRecord): TeoyubeFinalPublicOwnerApprovalReport {
  const blockers = getFinalPublicOwnerApprovalBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createFinalPublicOwnerApprovalDecision(record),
    record,
    blockers,
    warnings: getFinalPublicOwnerApprovalWarnings(record),
    noSignatureRequired: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
