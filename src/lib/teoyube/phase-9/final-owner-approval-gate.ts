import type {
  TeoyubeFinalOwnerApprovalGateBlocker,
  TeoyubeFinalOwnerApprovalGateCheck,
  TeoyubeFinalOwnerApprovalGateDecision,
  TeoyubeFinalOwnerApprovalGateRecord,
  TeoyubeFinalOwnerApprovalGateReport,
  TeoyubeFinalOwnerApprovalGateWarning
} from "./final-owner-approval-gate-contracts";

function item(id: string, label: string, details: string, accepted = false): TeoyubeFinalOwnerApprovalGateCheck {
  return { id, label, required: true, accepted, details };
}

export function createFinalOwnerApprovalGateChecklist(accepted = false): TeoyubeFinalOwnerApprovalGateCheck[] {
  return [
    item("controlled_public_release_preparation_reviewed", "Controlled public release preparation reviewed", "Owner reviews controlled release scope and no-launch boundaries.", accepted),
    item("final_public_copy_reviewed", "Final public copy reviewed", "Owner reviews final public copy, privacy, consent, limitations, and safety boundaries.", accepted),
    item("known_limitations_reviewed", "Known limitations reviewed", "Owner reviews known limitations for public release candidate QA.", accepted),
    item("service_lock_confirmation_reviewed", "Service lock confirmation reviewed", "Owner reviews service-disabled and future-review-only locks.", accepted),
    item("privacy_security_confirmation_reviewed", "Privacy/security confirmation reviewed", "Owner reviews privacy, consent, sensitive-data, and no-hidden-personalization boundaries.", accepted),
    item("safety_confirmation_reviewed", "Safety confirmation reviewed", "Owner reviews Scripture, explanation, fallback, confidence, content gate, and no-advice boundaries.", accepted),
    item("support_feedback_readiness_reviewed", "Support/feedback readiness reviewed", "Owner reviews manual support and feedback readiness.", accepted),
    item("operational_readiness_reviewed", "Operational readiness reviewed", "Owner reviews manual monitoring, issue triage, pause/rollback, and limitations readiness.", accepted),
    item("public_release_boundary_understood", "Public release boundary understood", "Owner confirms no public launch occurs from this code.", accepted),
    item("phase_9_2_acceptance_reviewed", "Phase 9.2 acceptance reviewed", "Owner accepts or blocks public release candidate QA as the next step.", accepted)
  ];
}

export function createFinalOwnerApprovalGateRecord(input: {
  reviewed?: boolean;
  checklist?: TeoyubeFinalOwnerApprovalGateCheck[];
  nextPhaseAccepted?: boolean;
  notes?: string[];
} = {}): TeoyubeFinalOwnerApprovalGateRecord {
  const reviewed = input.reviewed ?? false;
  return {
    id: "phase_9_1_final_owner_approval_gate",
    reviewed,
    checklist: input.checklist || createFinalOwnerApprovalGateChecklist(reviewed),
    nextPhaseAccepted: input.nextPhaseAccepted ?? reviewed,
    notes: input.notes || [],
    noPublicLaunchPerformed: true,
    noBetaLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    createdAt: new Date().toISOString()
  };
}

export function getFinalOwnerApprovalGateBlockers(record: TeoyubeFinalOwnerApprovalGateRecord): TeoyubeFinalOwnerApprovalGateBlocker[] {
  return record.noPublicLaunchPerformed && record.noBetaLaunchPerformed && record.noUsersContacted && record.noFeedbackCollectedAutomatically && record.noExternalServicesRequired && record.inMemoryOnly
    ? []
    : [{ id: "owner_gate_boundary_blocker", message: "Owner approval gate must remain in-memory and must not launch, contact users, collect feedback automatically, or require external services.", requiredAction: "Restore manual owner approval boundaries." }];
}

export function getFinalOwnerApprovalGateWarnings(record: TeoyubeFinalOwnerApprovalGateRecord): TeoyubeFinalOwnerApprovalGateWarning[] {
  return [
    ...(!record.reviewed ? [{ id: "owner_gate_pending", message: "Final owner approval gate has not been manually completed.", recommendedAction: "Complete manual owner review before Phase 9.2." }] : []),
    ...record.checklist.filter((entry) => entry.required && !entry.accepted).map((entry) => ({ id: `${entry.id}_pending`, message: `${entry.label} remains pending.`, recommendedAction: "Review and accept or block before Phase 9.2." })),
    ...(!record.nextPhaseAccepted ? [{ id: "phase_9_2_pending", message: "Phase 9.2 has not been accepted by owner review.", recommendedAction: "Accept or block the next step manually." }] : [])
  ];
}

export function createFinalOwnerApprovalGateDecision(record: TeoyubeFinalOwnerApprovalGateRecord): TeoyubeFinalOwnerApprovalGateDecision {
  const blockers = getFinalOwnerApprovalGateBlockers(record);
  if (blockers.length) return "not_approved";
  if (record.checklist.some((entry) => entry.id.includes("copy") && !entry.accepted)) return "needs_copy_review";
  if (record.checklist.some((entry) => entry.id.includes("privacy") && !entry.accepted)) return "needs_privacy_security_review";
  if (record.checklist.some((entry) => entry.id.includes("service") && !entry.accepted)) return "needs_service_lock_review";
  if (record.checklist.some((entry) => entry.id.includes("operational") && !entry.accepted)) return "needs_operational_readiness_review";
  if (!record.reviewed || !record.nextPhaseAccepted) return "not_approved";
  return getFinalOwnerApprovalGateWarnings(record).length ? "approved_with_warnings" : "approved_for_public_release_candidate_qa";
}

export function validateFinalOwnerApprovalGate(record: TeoyubeFinalOwnerApprovalGateRecord): TeoyubeFinalOwnerApprovalGateReport {
  return createFinalOwnerApprovalGateReport(record);
}

export function createFinalOwnerApprovalGateReport(record: TeoyubeFinalOwnerApprovalGateRecord): TeoyubeFinalOwnerApprovalGateReport {
  const blockers = getFinalOwnerApprovalGateBlockers(record);
  const warnings = getFinalOwnerApprovalGateWarnings(record);
  const decision = createFinalOwnerApprovalGateDecision(record);
  return {
    valid: blockers.length === 0,
    status: blockers.length ? "blocked" : decision === "approved_for_public_release_candidate_qa" ? "approved" : warnings.length ? "approved_with_warnings" : "not_approved",
    decision,
    record,
    blockers,
    warnings,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
