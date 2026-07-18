export type TeoyubePublicSurfaceCopyOwnerReviewRecord = {
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
  feedbackCollectedAutomatically: false;
  generatedAt: string;
};

function item(id: string, label: string) {
  return { id, label, required: true, complete: true };
}

export function createPublicSurfaceCopyOwnerReviewChecklist() {
  return [
    item("public_routes_reviewed", "Public /privacy, /terms, and /consent routes reviewed"),
    item("tig_surface_notices_reviewed", "TIG search and response notices reviewed"),
    item("onboarding_consent_notices_reviewed", "Onboarding consent notices reviewed"),
    item("feedback_notice_reviewed", "Feedback and sensitive information notices reviewed"),
    item("accessibility_copy_reviewed", "Public notice accessibility reviewed"),
    item("no_legal_final_claim_without_record", "No legal-final approval claimed unless recorded"),
    item("no_public_launch_or_user_contact", "No public launch, user contact, or automatic feedback collection performed")
  ];
}

export function createPublicSurfaceCopyOwnerReviewRecord(
  input: Partial<TeoyubePublicSurfaceCopyOwnerReviewRecord> = {}
): TeoyubePublicSurfaceCopyOwnerReviewRecord {
  const checklist = createPublicSurfaceCopyOwnerReviewChecklist();
  return {
    id: input.id || "public_surface_copy_owner_review_5_3",
    label: input.label || "Public Surface Copy Owner Review 5.3",
    reviewedChecklistIds: input.reviewedChecklistIds || checklist.map((entry) => entry.id),
    accepted: input.accepted ?? true,
    blocked: input.blocked ?? false,
    legalReviewRequired: input.legalReviewRequired ?? true,
    legalApprovalRecorded: input.legalApprovalRecorded ?? false,
    legalFinalApprovalClaimed: input.legalFinalApprovalClaimed ?? false,
    notes: input.notes || ["Public surface copy integration is ready for final QA dry run and legal review where required."],
    manualOnly: true,
    inMemoryOnly: true,
    publicLaunchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPublicSurfaceCopyOwnerReviewBlockers(
  record: TeoyubePublicSurfaceCopyOwnerReviewRecord = createPublicSurfaceCopyOwnerReviewRecord()
) {
  const checklist = createPublicSurfaceCopyOwnerReviewChecklist();
  const missing = checklist.filter((entry) => entry.required && !record.reviewedChecklistIds.includes(entry.id));
  return [
    ...missing.map((entry) => ({
      id: `public_surface_copy_owner_review_missing_${entry.id}`,
      surface: "all" as const,
      noticeType: "unknown" as const,
      label: entry.label,
      reason: "Required public surface copy owner review item was not reviewed.",
      requiredAction: "Complete owner review before public launch.",
      riskLevel: "critical" as const
    })),
    record.blocked ? { id: "public_surface_copy_owner_review_blocked", surface: "all" as const, noticeType: "unknown" as const, label: record.label, reason: "Owner review is blocked.", requiredAction: "Resolve owner review before public launch.", riskLevel: "critical" as const } : undefined,
    record.legalFinalApprovalClaimed && !record.legalApprovalRecorded ? { id: "public_surface_copy_owner_review_false_legal_approval", surface: "privacy_terms" as const, noticeType: "terms_of_use" as const, label: record.label, reason: "Legal final approval is claimed without a recorded legal approval.", requiredAction: "Remove the claim or record appropriate counsel approval.", riskLevel: "critical" as const } : undefined,
    record.publicLaunchPerformed ? { id: "public_surface_copy_owner_review_launch", surface: "all" as const, noticeType: "unknown" as const, label: record.label, reason: "Owner review must not launch Teoyube.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    record.usersContacted ? { id: "public_surface_copy_owner_review_users_contacted", surface: "all" as const, noticeType: "unknown" as const, label: record.label, reason: "Owner review must not contact users.", requiredAction: "Keep contact outside code.", riskLevel: "critical" as const } : undefined,
    record.feedbackCollectedAutomatically ? { id: "public_surface_copy_owner_review_feedback_collected", surface: "all" as const, noticeType: "unknown" as const, label: record.label, reason: "Owner review must not collect feedback automatically.", requiredAction: "Use manual review only.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; surface: "all" | "privacy_terms"; noticeType: "unknown" | "terms_of_use"; label: string; reason: string; requiredAction: string; riskLevel: "critical" }>;
}

export function getPublicSurfaceCopyOwnerReviewWarnings(
  record: TeoyubePublicSurfaceCopyOwnerReviewRecord = createPublicSurfaceCopyOwnerReviewRecord()
) {
  return [
    record.legalReviewRequired && !record.legalApprovalRecorded ? {
      id: "public_surface_copy_owner_review_legal_pending",
      surface: "privacy_terms" as const,
      noticeType: "terms_of_use" as const,
      label: record.label,
      message: "Legal review is required and has not been recorded as approved.",
      recommendedAction: "Treat privacy and terms copy as draft until legal review is complete.",
      riskLevel: "medium" as const
    } : undefined
  ].filter(Boolean) as Array<{ id: string; surface: "privacy_terms"; noticeType: "terms_of_use"; label: string; message: string; recommendedAction: string; riskLevel: "medium" }>;
}

export function createPublicSurfaceCopyOwnerReviewReport(
  record: TeoyubePublicSurfaceCopyOwnerReviewRecord = createPublicSurfaceCopyOwnerReviewRecord()
) {
  const blockers = getPublicSurfaceCopyOwnerReviewBlockers(record);
  const warnings = getPublicSurfaceCopyOwnerReviewWarnings(record);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: blockers.length > 0 ? "blocked" as const : "ready_for_final_qa_dry_run" as const,
    record,
    checklist: createPublicSurfaceCopyOwnerReviewChecklist(),
    blockers,
    warnings,
    noLegalFinalApprovalClaimedWithoutRecord: !(record.legalFinalApprovalClaimed && !record.legalApprovalRecorded),
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
