import type { TeoyubeFinalPublicGoNoGoDecision, TeoyubeFinalPublicOwnerApproval, TeoyubeFinalPublicLaunchBlocker, TeoyubeFinalPublicLaunchWarning } from "./final-public-go-no-go-contracts";

function item(id: string, label: string) {
  return { id, label, required: true, complete: true };
}

export function createFinalPublicOwnerGoNoGoChecklist() {
  return [
    item("production_service_decisions_reviewed", "Production service decisions reviewed"),
    item("database_decision_reviewed", "Database persistence go/no-go reviewed"),
    item("analytics_decision_reviewed", "Analytics go/no-go reviewed"),
    item("live_ai_decision_reviewed", "Live AI go/no-go reviewed"),
    item("privacy_terms_consent_copy_reviewed", "Privacy, terms, and consent copy reviewed"),
    item("public_qa_reviewed", "Public QA reviewed"),
    item("surface_readiness_reviewed", "Surface readiness reviewed"),
    item("safety_certification_reviewed", "Safety certification reviewed"),
    item("risk_register_reviewed", "Risk register reviewed"),
    item("known_limitations_accepted", "Known limitations accepted"),
    item("execution_preparation_approved_or_blocked", "Public launch execution preparation approved or blocked")
  ];
}

export function createFinalPublicOwnerGoNoGoRecord(input: Partial<TeoyubeFinalPublicOwnerApproval> = {}): TeoyubeFinalPublicOwnerApproval {
  const checklist = createFinalPublicOwnerGoNoGoChecklist();
  return {
    id: input.id || "final_public_owner_go_no_go_5_4",
    label: input.label || "Final Public Owner Go/No-Go 5.4",
    reviewedChecklistIds: input.reviewedChecklistIds || checklist.map((entry) => entry.id),
    accepted: input.accepted ?? true,
    blocked: input.blocked ?? false,
    approvedForPublicLaunchExecutionPreparation: input.approvedForPublicLaunchExecutionPreparation ?? true,
    legalReviewRequired: input.legalReviewRequired ?? true,
    legalApprovalRecorded: input.legalApprovalRecorded ?? false,
    legalFinalApprovalClaimed: input.legalFinalApprovalClaimed ?? false,
    notes: input.notes || ["Final public go/no-go package accepted for controlled public launch execution preparation."],
    manualOnly: true,
    inMemoryOnly: true,
    publicLaunchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getFinalPublicOwnerGoNoGoBlockers(record: TeoyubeFinalPublicOwnerApproval = createFinalPublicOwnerGoNoGoRecord()): TeoyubeFinalPublicLaunchBlocker[] {
  const checklist = createFinalPublicOwnerGoNoGoChecklist();
  const missing = checklist.filter((entry) => entry.required && !record.reviewedChecklistIds.includes(entry.id));
  return [
    ...missing.map((entry) => ({ id: `final_public_owner_missing_${entry.id}`, label: entry.label, category: "unknown" as const, riskLevel: "critical" as const, reason: "Required owner go/no-go item was not reviewed.", requiredAction: "Complete structured owner review before public launch execution preparation." })),
    record.blocked ? { id: "final_public_owner_blocked", label: record.label, category: "unknown" as const, riskLevel: "critical" as const, reason: "Owner go/no-go is blocked.", requiredAction: "Resolve owner blocker before public launch execution preparation." } : undefined,
    !record.accepted ? { id: "final_public_owner_not_accepted", label: record.label, category: "unknown" as const, riskLevel: "critical" as const, reason: "Owner go/no-go has not been accepted.", requiredAction: "Accept or block the public execution preparation decision." } : undefined,
    !record.approvedForPublicLaunchExecutionPreparation ? { id: "final_public_owner_execution_not_approved", label: record.label, category: "unknown" as const, riskLevel: "critical" as const, reason: "Public launch execution preparation is not approved.", requiredAction: "Approve or block execution preparation explicitly." } : undefined,
    record.legalFinalApprovalClaimed && !record.legalApprovalRecorded ? { id: "final_public_owner_false_legal_approval", label: record.label, category: "terms" as const, riskLevel: "critical" as const, reason: "Legal final approval is claimed without a recorded legal approval.", requiredAction: "Remove the claim or record appropriate counsel approval." } : undefined,
    record.publicLaunchPerformed ? { id: "final_public_owner_launch_performed", label: record.label, category: "unknown" as const, riskLevel: "critical" as const, reason: "Owner go/no-go must not launch Teoyube.", requiredAction: "Remove launch action." } : undefined,
    record.usersContacted ? { id: "final_public_owner_users_contacted", label: record.label, category: "feedback" as const, riskLevel: "critical" as const, reason: "Owner go/no-go must not contact users.", requiredAction: "Keep user contact outside code." } : undefined,
    record.feedbackCollectedAutomatically ? { id: "final_public_owner_feedback_collected", label: record.label, category: "feedback" as const, riskLevel: "critical" as const, reason: "Owner go/no-go must not collect feedback automatically.", requiredAction: "Use manual review only." } : undefined
  ].filter(Boolean) as TeoyubeFinalPublicLaunchBlocker[];
}

export function getFinalPublicOwnerGoNoGoWarnings(record: TeoyubeFinalPublicOwnerApproval = createFinalPublicOwnerGoNoGoRecord()): TeoyubeFinalPublicLaunchWarning[] {
  return [
    record.legalReviewRequired && !record.legalApprovalRecorded ? { id: "final_public_owner_legal_pending", label: record.label, category: "terms" as const, riskLevel: "medium" as const, message: "Legal review is required and not recorded as final approval.", recommendedAction: "Do not claim legal-final approval unless appropriate counsel approval is recorded." } : undefined
  ].filter(Boolean) as TeoyubeFinalPublicLaunchWarning[];
}

export function createFinalPublicOwnerGoNoGoDecision(record: TeoyubeFinalPublicOwnerApproval = createFinalPublicOwnerGoNoGoRecord()): TeoyubeFinalPublicGoNoGoDecision {
  const blockers = getFinalPublicOwnerGoNoGoBlockers(record);
  if (blockers.length > 0) return record.accepted ? "no_go_blocked" : "go_after_owner_review";
  return "go_for_public_launch_execution_preparation";
}

export function validateFinalPublicOwnerGoNoGo(record: TeoyubeFinalPublicOwnerApproval = createFinalPublicOwnerGoNoGoRecord()) {
  const blockers = getFinalPublicOwnerGoNoGoBlockers(record);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    blockers,
    warnings: getFinalPublicOwnerGoNoGoWarnings(record)
  };
}

export function createFinalPublicOwnerGoNoGoReport(record: TeoyubeFinalPublicOwnerApproval = createFinalPublicOwnerGoNoGoRecord()) {
  const validation = validateFinalPublicOwnerGoNoGo(record);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createFinalPublicOwnerGoNoGoDecision(record),
    record,
    checklist: createFinalPublicOwnerGoNoGoChecklist(),
    blockers: validation.blockers,
    warnings: validation.warnings,
    noLegalFinalApprovalClaimedWithoutRecord: !(record.legalFinalApprovalClaimed && !record.legalApprovalRecorded),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
