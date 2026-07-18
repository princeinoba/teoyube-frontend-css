import type { TeoyubeManualPreviewIssueOwnerReview } from "./manual-preview-issue-triage-contracts";

export type TeoyubeManualPreviewIssueOwnerReviewChecklistItem = {
  id: keyof Omit<TeoyubeManualPreviewIssueOwnerReview, "id" | "reviewerName" | "notes" | "createdAt">;
  label: string;
  required: boolean;
};

export function createManualPreviewIssueOwnerReviewChecklist(): TeoyubeManualPreviewIssueOwnerReviewChecklistItem[] {
  return [
    { id: "criticalBlockersReviewed", label: "Critical blockers reviewed", required: true },
    { id: "scriptureAnchorIssuesReviewed", label: "Scripture anchor issues reviewed", required: true },
    { id: "explanationPathIssuesReviewed", label: "Explanation path issues reviewed", required: true },
    { id: "fallbackSafetyIssuesReviewed", label: "Fallback safety issues reviewed", required: true },
    { id: "consentPrivacyIssuesReviewed", label: "Consent/privacy issues reviewed", required: true },
    { id: "mobileAccessibilityIssuesReviewed", label: "Mobile/accessibility issues reviewed", required: true },
    { id: "fixPrioritiesAccepted", label: "Fix priorities accepted", required: true },
    { id: "deferredIssuesAccepted", label: "Deferred issues accepted", required: true },
    { id: "softLaunchBlockerListAccepted", label: "Soft launch blocker list accepted", required: true },
    { id: "nextFixStepApproved", label: "Next fix step approved", required: true }
  ];
}

export function createManualPreviewIssueOwnerReviewRecord(
  input: Partial<Omit<TeoyubeManualPreviewIssueOwnerReview, "id" | "createdAt">> = {}
): TeoyubeManualPreviewIssueOwnerReview {
  return {
    id: "manual_preview_issue_owner_review",
    reviewerName: input.reviewerName,
    criticalBlockersReviewed: input.criticalBlockersReviewed ?? false,
    scriptureAnchorIssuesReviewed: input.scriptureAnchorIssuesReviewed ?? false,
    explanationPathIssuesReviewed: input.explanationPathIssuesReviewed ?? false,
    fallbackSafetyIssuesReviewed: input.fallbackSafetyIssuesReviewed ?? false,
    consentPrivacyIssuesReviewed: input.consentPrivacyIssuesReviewed ?? false,
    mobileAccessibilityIssuesReviewed: input.mobileAccessibilityIssuesReviewed ?? false,
    fixPrioritiesAccepted: input.fixPrioritiesAccepted ?? false,
    deferredIssuesAccepted: input.deferredIssuesAccepted ?? false,
    softLaunchBlockerListAccepted: input.softLaunchBlockerListAccepted ?? false,
    nextFixStepApproved: input.nextFixStepApproved ?? false,
    notes: input.notes,
    createdAt: new Date().toISOString()
  };
}

export function getManualPreviewIssueOwnerReviewWarnings(record: TeoyubeManualPreviewIssueOwnerReview): string[] {
  return createManualPreviewIssueOwnerReviewChecklist()
    .filter((entry) => entry.required && !record[entry.id])
    .map((entry) => `${entry.label} has not been accepted.`);
}

export function validateManualPreviewIssueOwnerReview(record: TeoyubeManualPreviewIssueOwnerReview) {
  const warnings = getManualPreviewIssueOwnerReviewWarnings(record);

  return {
    valid: warnings.length === 0,
    warnings,
    checklist: createManualPreviewIssueOwnerReviewChecklist(),
    reviewedAt: record.createdAt
  };
}

export function createManualPreviewIssueOwnerReviewReport(record: TeoyubeManualPreviewIssueOwnerReview) {
  const validation = validateManualPreviewIssueOwnerReview(record);

  return {
    valid: validation.valid,
    record,
    checklist: validation.checklist,
    warnings: validation.warnings,
    ownerReviewRequired: true,
    signaturesRequired: false,
    structuredManualApprovalOnly: true,
    generatedAt: new Date().toISOString()
  };
}
