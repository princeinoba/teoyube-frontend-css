import type { TeoyubePublicLaunchQaDecision } from "./public-launch-qa-contracts";

export type TeoyubePublicCopyOwnerReviewRecord = {
  id: string;
  label: string;
  reviewedChecklistIds: string[];
  accepted: boolean;
  blocked: boolean;
  legalReviewRequired: boolean;
  legalApprovalRecorded: boolean;
  legalFinalApprovalClaimed: boolean;
  notes: string[];
  manualOnly: true;
  inMemoryOnly: true;
  publicLaunchPerformed: false;
  usersContacted: false;
  generatedAt: string;
};

function item(id: string, label: string) {
  return { id, label, required: true, complete: true };
}

export function createPublicCopyOwnerReviewChecklist() {
  return [
    item("privacy_notice_reviewed", "Privacy notice draft reviewed"),
    item("terms_draft_reviewed", "Terms draft reviewed"),
    item("consent_copy_reviewed", "Consent copy reviewed"),
    item("sensitive_information_warning_reviewed", "Sensitive information warning reviewed"),
    item("ai_tig_transparency_reviewed", "AI/TIG transparency copy reviewed"),
    item("feedback_notice_reviewed", "Feedback notice reviewed"),
    item("no_legal_final_claim_without_counsel", "No legal-final status claimed unless reviewed by appropriate counsel"),
    item("copy_accept_block_or_legal_review", "Public launch copy accepted, blocked, or marked for legal review")
  ];
}

export function createPublicCopyOwnerReviewRecord(input: Partial<TeoyubePublicCopyOwnerReviewRecord> = {}): TeoyubePublicCopyOwnerReviewRecord {
  const checklist = createPublicCopyOwnerReviewChecklist();
  return {
    id: input.id || "public_copy_owner_review_5_2",
    label: input.label || "Public Launch Copy Owner/Legal Review",
    reviewedChecklistIds: input.reviewedChecklistIds || checklist.map((entry) => entry.id),
    accepted: input.accepted ?? true,
    blocked: input.blocked ?? false,
    legalReviewRequired: input.legalReviewRequired ?? true,
    legalApprovalRecorded: input.legalApprovalRecorded ?? false,
    legalFinalApprovalClaimed: input.legalFinalApprovalClaimed ?? false,
    notes: input.notes || ["Draft public launch copy prepared for owner/legal review."],
    manualOnly: true,
    inMemoryOnly: true,
    publicLaunchPerformed: false,
    usersContacted: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPublicCopyOwnerReviewBlockers(record: TeoyubePublicCopyOwnerReviewRecord = createPublicCopyOwnerReviewRecord()) {
  const checklist = createPublicCopyOwnerReviewChecklist();
  const missing = checklist.filter((entry) => entry.required && !record.reviewedChecklistIds.includes(entry.id));
  return [
    ...missing.map((entry) => ({ id: `copy_owner_review_missing_${entry.id}`, label: entry.label, reason: "Required owner/legal review item was not reviewed.", requiredAction: "Complete copy review before public launch.", riskLevel: "critical" as const })),
    record.blocked ? { id: "copy_owner_review_blocked", label: record.label, reason: "Owner/legal review is blocked.", requiredAction: "Resolve blocked copy review before public launch.", riskLevel: "critical" as const } : undefined,
    record.legalFinalApprovalClaimed && !record.legalApprovalRecorded ? { id: "copy_owner_review_false_legal_approval", label: record.label, reason: "Legal final approval is claimed without recorded legal approval.", requiredAction: "Remove claim or record appropriate counsel approval.", riskLevel: "critical" as const } : undefined,
    record.publicLaunchPerformed ? { id: "copy_owner_review_public_launch", label: record.label, reason: "Owner/legal review must not launch Teoyube.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    record.usersContacted ? { id: "copy_owner_review_users_contacted", label: record.label, reason: "Owner/legal review must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
}

export function getPublicCopyOwnerReviewWarnings(record: TeoyubePublicCopyOwnerReviewRecord = createPublicCopyOwnerReviewRecord()) {
  return [
    record.legalReviewRequired && !record.legalApprovalRecorded ? { id: "copy_owner_review_legal_pending", label: record.label, message: "Legal review is required and has not been recorded as approved.", recommendedAction: "Treat copy as draft until legal review is complete.", riskLevel: "medium" as const } : undefined,
    record.notes.length === 0 ? { id: "copy_owner_review_notes_missing", label: record.label, message: "Owner/legal review has no notes.", recommendedAction: "Add review notes before public launch.", riskLevel: "medium" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; message: string; recommendedAction: string; riskLevel: "medium" }>;
}

export function validatePublicCopyOwnerReview(record: TeoyubePublicCopyOwnerReviewRecord = createPublicCopyOwnerReviewRecord()) {
  const blockers = getPublicCopyOwnerReviewBlockers(record);
  const warnings = getPublicCopyOwnerReviewWarnings(record);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createPublicCopyOwnerReviewDecision(record: TeoyubePublicCopyOwnerReviewRecord = createPublicCopyOwnerReviewRecord()): TeoyubePublicLaunchQaDecision {
  const validation = validatePublicCopyOwnerReview(record);
  if (!validation.valid) return "blocked";
  if (record.legalReviewRequired && !record.legalApprovalRecorded) return "ready_after_owner_review";
  return "ready_for_public_qa";
}

export function createPublicCopyOwnerReviewReport(record: TeoyubePublicCopyOwnerReviewRecord = createPublicCopyOwnerReviewRecord()) {
  const validation = validatePublicCopyOwnerReview(record);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createPublicCopyOwnerReviewDecision(record),
    record,
    checklist: createPublicCopyOwnerReviewChecklist(),
    blockers: validation.blockers,
    warnings: validation.warnings,
    noLegalFinalApprovalClaimedWithoutRecord: !(record.legalFinalApprovalClaimed && !record.legalApprovalRecorded),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
