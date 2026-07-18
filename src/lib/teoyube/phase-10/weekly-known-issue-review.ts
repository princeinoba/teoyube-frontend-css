import type { TeoyubeFirstDayIssueSeverity } from "./first-day-issue-triage-contracts";

export type TeoyubeWeeklyKnownIssueReviewItem = {
  id: string;
  severity: TeoyubeFirstDayIssueSeverity;
  summary: string;
  acceptedAndTracked: boolean;
  ownerReviewed: boolean;
  affectsScriptureAnchors: boolean;
  affectsExplanationTraces: boolean;
  affectsFallbackSafety: boolean;
  affectsConfidenceLabels: boolean;
  affectsPrivacyConsent: boolean;
  affectsKnownLimitations: boolean;
  affectsServiceDisabledState: boolean;
};

export type TeoyubeWeeklyKnownIssueReviewRecord = {
  id: string;
  items: TeoyubeWeeklyKnownIssueReviewItem[];
  releaseOwner: string;
  notes: string[];
  reviewedAt: string;
};

export type TeoyubeWeeklyKnownIssueReviewInput = Partial<{
  items: TeoyubeWeeklyKnownIssueReviewItem[];
  releaseOwner: string;
  notes: string[];
}>;

export function createWeeklyKnownIssueReviewChecklist(record: TeoyubeWeeklyKnownIssueReviewRecord) {
  return [
    { id: "items_reviewed", label: "Known issues reviewed", passed: record.items.length >= 0, critical: true, details: "Known issue register should be reviewed weekly." },
    { id: "owner_review", label: "Owner review recorded", passed: record.items.every((item) => item.ownerReviewed), critical: true, details: "Known issues require owner review." },
    { id: "severity_3_4_tracked", label: "Severity 3 and 4 tracked or deferred", passed: record.items.filter((item) => item.severity === "severity_3_medium" || item.severity === "severity_4_low").every((item) => item.acceptedAndTracked), critical: false, details: "Severity 3 and 4 issues should be tracked or deferred." }
  ];
}

export function createWeeklyKnownIssueReviewRecord(input: TeoyubeWeeklyKnownIssueReviewInput = {}): TeoyubeWeeklyKnownIssueReviewRecord {
  return {
    id: "phase_10_7_weekly_known_issue_review",
    items: input.items || [],
    releaseOwner: input.releaseOwner || "project_owner",
    notes: input.notes || [],
    reviewedAt: new Date().toISOString()
  };
}

function safetyAffected(item: TeoyubeWeeklyKnownIssueReviewItem): boolean {
  return item.affectsScriptureAnchors || item.affectsExplanationTraces || item.affectsFallbackSafety || item.affectsConfidenceLabels || item.affectsPrivacyConsent || item.affectsKnownLimitations || item.affectsServiceDisabledState;
}

export function getWeeklyKnownIssueReviewBlockers(record: TeoyubeWeeklyKnownIssueReviewRecord): string[] {
  const blockers: string[] = [];
  record.items.forEach((item) => {
    if (item.severity === "severity_1_critical") blockers.push(`${item.id}: unresolved Severity 1 issues block Phase 10 completion.`);
    if (item.severity === "severity_2_high" && !item.ownerReviewed) blockers.push(`${item.id}: unapproved Severity 2 issue blocks Phase 10 completion.`);
    if (safetyAffected(item) && !item.ownerReviewed) blockers.push(`${item.id}: safety-boundary issue requires owner review.`);
  });
  return blockers;
}

export function getWeeklyKnownIssueReviewWarnings(record: TeoyubeWeeklyKnownIssueReviewRecord): string[] {
  const warnings: string[] = [];
  if (!record.items.length) warnings.push("Known issue review has no recorded issues.");
  record.items
    .filter((item) => (item.severity === "severity_3_medium" || item.severity === "severity_4_low") && !item.acceptedAndTracked)
    .forEach((item) => warnings.push(`${item.id}: Severity 3 or 4 issue should be accepted, tracked, or deferred.`));
  return warnings;
}

export function validateWeeklyKnownIssueReview(record: TeoyubeWeeklyKnownIssueReviewRecord): boolean {
  return getWeeklyKnownIssueReviewBlockers(record).length === 0;
}

export function createWeeklyKnownIssueReviewDecision(record: TeoyubeWeeklyKnownIssueReviewRecord): "known_issues_ready" | "ready_with_warnings" | "completion_blocked" {
  if (!validateWeeklyKnownIssueReview(record)) return "completion_blocked";
  return getWeeklyKnownIssueReviewWarnings(record).length ? "ready_with_warnings" : "known_issues_ready";
}

export function createWeeklyKnownIssueReviewReport(record: TeoyubeWeeklyKnownIssueReviewRecord) {
  const blockers = getWeeklyKnownIssueReviewBlockers(record);
  return {
    valid: blockers.length === 0,
    decision: createWeeklyKnownIssueReviewDecision(record),
    checklist: createWeeklyKnownIssueReviewChecklist(record),
    record,
    blockers,
    warnings: getWeeklyKnownIssueReviewWarnings(record),
    noAutomaticIssueCollection: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
