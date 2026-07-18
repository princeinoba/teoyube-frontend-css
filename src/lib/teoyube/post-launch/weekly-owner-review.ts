import type {
  TeoyubeSupportDeskBlocker,
  TeoyubeSupportDeskStatus,
  TeoyubeSupportDeskWarning,
  TeoyubeWeeklyOwnerReviewChecklistItem,
  TeoyubeWeeklyOwnerReviewDecision,
  TeoyubeWeeklyOwnerReviewRecord,
  TeoyubeWeeklyOwnerReviewReport
} from "./support-desk-contracts";

export function createWeeklyOwnerReviewChecklist(): TeoyubeWeeklyOwnerReviewChecklistItem[] {
  return [
    { id: "support_tickets_reviewed", label: "Support tickets reviewed", required: true, complete: false },
    { id: "feedback_themes_reviewed", label: "Feedback themes reviewed", required: true, complete: false },
    { id: "scripture_explanation_issues_reviewed", label: "Scripture/explanation issues reviewed", required: true, complete: false },
    { id: "fallback_issues_reviewed", label: "Fallback issues reviewed", required: true, complete: false },
    { id: "privacy_consent_issues_reviewed", label: "Privacy/consent issues reviewed", required: true, complete: false },
    { id: "mobile_accessibility_issues_reviewed", label: "Mobile/accessibility issues reviewed", required: true, complete: false },
    { id: "weekly_fix_candidates_reviewed", label: "Weekly fix candidates reviewed", required: true, complete: false },
    { id: "deferred_improvements_accepted", label: "Deferred improvements accepted", required: true, complete: false },
    { id: "next_week_priorities_accepted", label: "Next-week priorities accepted", required: true, complete: false }
  ];
}

export function createWeeklyOwnerReviewRecord(input: Partial<TeoyubeWeeklyOwnerReviewRecord> = {}): TeoyubeWeeklyOwnerReviewRecord {
  return {
    id: input.id || "post_launch_7_2_weekly_owner_review",
    supportTicketsReviewed: input.supportTicketsReviewed ?? true,
    feedbackThemesReviewed: input.feedbackThemesReviewed ?? true,
    scriptureExplanationIssuesReviewed: input.scriptureExplanationIssuesReviewed ?? true,
    fallbackIssuesReviewed: input.fallbackIssuesReviewed ?? true,
    privacyConsentIssuesReviewed: input.privacyConsentIssuesReviewed ?? true,
    mobileAccessibilityIssuesReviewed: input.mobileAccessibilityIssuesReviewed ?? true,
    weeklyFixCandidatesReviewed: input.weeklyFixCandidatesReviewed ?? true,
    deferredImprovementsAccepted: input.deferredImprovementsAccepted ?? true,
    nextWeekPrioritiesAccepted: input.nextWeekPrioritiesAccepted ?? true,
    notes: input.notes || ["Manual weekly owner review record."],
    manualOnly: true,
    usersContacted: Boolean(input.usersContacted),
    analyticsSent: Boolean(input.analyticsSent),
    databaseWritten: Boolean(input.databaseWritten),
    liveAiOrchestrationEnabled: Boolean(input.liveAiOrchestrationEnabled),
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

function checklistForRecord(record: TeoyubeWeeklyOwnerReviewRecord): TeoyubeWeeklyOwnerReviewChecklistItem[] {
  return createWeeklyOwnerReviewChecklist().map((entry) => ({
    ...entry,
    complete:
      entry.id === "support_tickets_reviewed" ? record.supportTicketsReviewed :
      entry.id === "feedback_themes_reviewed" ? record.feedbackThemesReviewed :
      entry.id === "scripture_explanation_issues_reviewed" ? record.scriptureExplanationIssuesReviewed :
      entry.id === "fallback_issues_reviewed" ? record.fallbackIssuesReviewed :
      entry.id === "privacy_consent_issues_reviewed" ? record.privacyConsentIssuesReviewed :
      entry.id === "mobile_accessibility_issues_reviewed" ? record.mobileAccessibilityIssuesReviewed :
      entry.id === "weekly_fix_candidates_reviewed" ? record.weeklyFixCandidatesReviewed :
      entry.id === "deferred_improvements_accepted" ? record.deferredImprovementsAccepted :
      record.nextWeekPrioritiesAccepted
  }));
}

export function getWeeklyOwnerReviewBlockers(record: TeoyubeWeeklyOwnerReviewRecord): TeoyubeSupportDeskBlocker[] {
  const blockers = checklistForRecord(record)
    .filter((entry) => entry.required && !entry.complete)
    .map((entry): TeoyubeSupportDeskBlocker => ({
      id: `owner_review_${entry.id}`,
      label: entry.label,
      category: "feedback",
      severity: "high",
      reason: "Required weekly owner review item is incomplete.",
      requiredAction: "Complete owner review before accepting next-week priorities."
    }));
  if (record.usersContacted || record.analyticsSent || record.databaseWritten || record.liveAiOrchestrationEnabled) {
    blockers.push({
      id: "owner_review_external_side_effect",
      label: "Owner review external side effect",
      category: "privacy_terms_consent",
      severity: "critical",
      reason: "Owner review must not contact users, send analytics, write databases, or enable live AI.",
      requiredAction: "Keep owner review manual and in memory."
    });
  }
  return blockers;
}

export function getWeeklyOwnerReviewWarnings(record: TeoyubeWeeklyOwnerReviewRecord): TeoyubeSupportDeskWarning[] {
  return record.notes.length === 0
    ? [{
      id: "owner_review_missing_notes",
      label: "Owner review notes",
      category: "feedback",
      severity: "medium",
      message: "Owner review has no notes.",
      recommendedAction: "Add a short sanitized owner-review note."
    }]
    : [];
}

export function createWeeklyOwnerReviewDecision(record: TeoyubeWeeklyOwnerReviewRecord): TeoyubeWeeklyOwnerReviewDecision {
  if (getWeeklyOwnerReviewBlockers(record).some((entry) => entry.severity === "critical")) return "blocked";
  if (getWeeklyOwnerReviewBlockers(record).length > 0) return "needs_owner_review";
  if (getWeeklyOwnerReviewWarnings(record).length > 0) return "accepted_with_warnings";
  return "accepted";
}

export function validateWeeklyOwnerReview(record: TeoyubeWeeklyOwnerReviewRecord) {
  const blockers = getWeeklyOwnerReviewBlockers(record);
  const warnings = getWeeklyOwnerReviewWarnings(record);
  return { valid: blockers.length === 0, blockers, warnings };
}

export function createWeeklyOwnerReviewReport(record: TeoyubeWeeklyOwnerReviewRecord = createWeeklyOwnerReviewRecord()): TeoyubeWeeklyOwnerReviewReport {
  const blockers = getWeeklyOwnerReviewBlockers(record);
  const warnings = getWeeklyOwnerReviewWarnings(record);
  const status: TeoyubeSupportDeskStatus = blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready";
  return {
    status,
    ready: blockers.length === 0,
    decision: createWeeklyOwnerReviewDecision(record),
    checklist: checklistForRecord(record),
    record,
    blockers,
    warnings,
    noUsersContacted: true,
    noAnalyticsSent: true,
    noDatabaseWrites: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
