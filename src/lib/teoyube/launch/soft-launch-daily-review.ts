export type TeoyubeSoftLaunchDailyReviewRecord = {
  id: string;
  reviewedAt: string;
  appAvailable: boolean;
  surfaceIssueCount: number;
  mobileIssueCount: number;
  accessibilityIssueCount: number;
  scriptureAnchorIssueCount: number;
  explanationPathIssueCount: number;
  fallbackIssueCount: number;
  consentIssueCount: number;
  feedbackVolume: number;
  criticalIssueCount: number;
  rollbackConsidered: boolean;
  nextDayActionItems: string[];
  inMemoryOnly: true;
};

export type TeoyubeSoftLaunchDailyReviewInput = Partial<Omit<TeoyubeSoftLaunchDailyReviewRecord, "id" | "reviewedAt" | "inMemoryOnly">>;

export function createSoftLaunchDailyReviewTemplate() {
  return {
    id: "soft_launch_daily_review_template",
    fields: [
      "app availability",
      "surface issues",
      "mobile issues",
      "accessibility issues",
      "Scripture anchor issues",
      "explanation path issues",
      "fallback issues",
      "consent issues",
      "feedback volume",
      "critical issues",
      "rollback consideration",
      "next-day action items"
    ],
    inMemoryOnly: true
  };
}

export function createSoftLaunchDailyReviewRecord(
  input: TeoyubeSoftLaunchDailyReviewInput = {}
): TeoyubeSoftLaunchDailyReviewRecord {
  return {
    id: `soft_launch_daily_review_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    reviewedAt: new Date().toISOString(),
    appAvailable: input.appAvailable ?? true,
    surfaceIssueCount: input.surfaceIssueCount ?? 0,
    mobileIssueCount: input.mobileIssueCount ?? 0,
    accessibilityIssueCount: input.accessibilityIssueCount ?? 0,
    scriptureAnchorIssueCount: input.scriptureAnchorIssueCount ?? 0,
    explanationPathIssueCount: input.explanationPathIssueCount ?? 0,
    fallbackIssueCount: input.fallbackIssueCount ?? 0,
    consentIssueCount: input.consentIssueCount ?? 0,
    feedbackVolume: input.feedbackVolume ?? 0,
    criticalIssueCount: input.criticalIssueCount ?? 0,
    rollbackConsidered: input.rollbackConsidered ?? false,
    nextDayActionItems: input.nextDayActionItems ?? ["Continue manual review."],
    inMemoryOnly: true
  };
}

export function getDailyReviewBlockers(records: TeoyubeSoftLaunchDailyReviewRecord[]): string[] {
  return records.flatMap((record) => [
    !record.appAvailable ? "App availability failed during daily review." : "",
    record.criticalIssueCount > 0 ? `${record.criticalIssueCount} critical issue(s) found during daily review.` : "",
    record.scriptureAnchorIssueCount > 0 ? "Scripture anchor issues found during daily review." : "",
    record.explanationPathIssueCount > 0 ? "Explanation path issues found during daily review." : "",
    record.fallbackIssueCount > 0 ? "Fallback issues found during daily review." : "",
    record.consentIssueCount > 0 ? "Consent issues found during daily review." : ""
  ].filter(Boolean));
}

export function getDailyReviewWarnings(records: TeoyubeSoftLaunchDailyReviewRecord[]): string[] {
  return records.flatMap((record) => [
    record.mobileIssueCount > 0 ? "Mobile issues need review." : "",
    record.accessibilityIssueCount > 0 ? "Accessibility issues need review." : "",
    record.surfaceIssueCount > 0 ? "Surface issues need review." : "",
    record.rollbackConsidered ? "Rollback was considered and should be documented." : ""
  ].filter(Boolean));
}

export function summarizeSoftLaunchDailyReview(records: TeoyubeSoftLaunchDailyReviewRecord[]) {
  return {
    recordCount: records.length,
    feedbackVolume: records.reduce((sum, record) => sum + record.feedbackVolume, 0),
    criticalIssueCount: records.reduce((sum, record) => sum + record.criticalIssueCount, 0),
    rollbackConsideredCount: records.filter((record) => record.rollbackConsidered).length,
    blockers: getDailyReviewBlockers(records),
    warnings: getDailyReviewWarnings(records),
    generatedAt: new Date().toISOString()
  };
}

export function createSoftLaunchDailyReviewReport(records: TeoyubeSoftLaunchDailyReviewRecord[] = []) {
  const summary = summarizeSoftLaunchDailyReview(records);

  return {
    valid: summary.blockers.length === 0,
    template: createSoftLaunchDailyReviewTemplate(),
    records,
    summary,
    blockers: summary.blockers,
    warnings: summary.warnings,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
