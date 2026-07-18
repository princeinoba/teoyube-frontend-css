import type { TeoyubeFeedbackIntakeSimulationItem } from "./feedback-intake-simulation-contracts";
import { createDryRunIssue } from "./dry-run-issue-triage";
import type {
  TeoyubeDryRunIssue,
  TeoyubeDryRunIssueCategory,
  TeoyubeDryRunIssueSeverity
} from "./dry-run-issue-triage-contracts";

export type TeoyubeFeedbackToIssueSimulationReport = {
  valid: boolean;
  feedbackItemCount: number;
  issueCount: number;
  issues: TeoyubeDryRunIssue[];
  warnings: string[];
  simulatedOnly: true;
  noAutomaticCollection: true;
  noExternalSend: true;
  inMemoryOnly: true;
  generatedAt: string;
};

function now(): string {
  return new Date().toISOString();
}

export function getDryRunIssueCategoryFromFeedback(item: TeoyubeFeedbackIntakeSimulationItem): TeoyubeDryRunIssueCategory {
  if (item.category === "scripture_anchor") return "scripture_anchor_missing";
  if (item.category === "explanation_trace") return "explanation_trace_missing";
  if (item.category === "fallback") return "unsafe_fallback";
  if (item.category === "confidence_label") return "confidence_label_missing";
  if (item.category === "mobile") return "mobile_issue";
  if (item.category === "accessibility") return "accessibility_issue";
  if (item.category === "privacy_consent") return "privacy_consent_issue";
  if (item.redactedNote.toLowerCase().includes("review-only") || item.redactedNote.toLowerCase().includes("draft")) return "review_only_content_visible";
  if (item.redactedNote.toLowerCase().includes("admin")) return "controlled_admin_issue";
  if (item.redactedNote.toLowerCase().includes("database") || item.redactedNote.toLowerCase().includes("analytics") || item.redactedNote.toLowerCase().includes("service")) return "disabled_service_issue";
  if (item.category === "content_clarity") return "content_clarity";
  return "unknown";
}

export function getDryRunIssueSeverityFromFeedback(item: TeoyubeFeedbackIntakeSimulationItem): TeoyubeDryRunIssueSeverity {
  const category = getDryRunIssueCategoryFromFeedback(item);
  if (["scripture_anchor_missing", "explanation_trace_missing", "unsafe_fallback", "confidence_label_missing", "privacy_consent_issue", "review_only_content_visible", "disabled_service_issue", "controlled_admin_issue"].includes(category)) return "high";
  if (["mobile_issue", "accessibility_issue"].includes(category)) return "medium";
  return category === "content_clarity" ? "medium" : "low";
}

export function shouldConvertSimulatedFeedbackToIssue(item: TeoyubeFeedbackIntakeSimulationItem): boolean {
  const category = getDryRunIssueCategoryFromFeedback(item);
  return category !== "unknown" || item.privacyFlags.some((flag) => flag !== "safe_simulated_feedback");
}

export function createDryRunIssueFromSimulatedFeedback(item: TeoyubeFeedbackIntakeSimulationItem): TeoyubeDryRunIssue {
  const category = getDryRunIssueCategoryFromFeedback(item);
  return createDryRunIssue({
    id: `dry_run_issue_from_${item.id}`,
    title: `Simulated feedback issue: ${item.category}`,
    description: item.redactedNote,
    category,
    severity: getDryRunIssueSeverityFromFeedback(item),
    source: "simulated_feedback"
  });
}

export function convertSimulatedFeedbackToDryRunIssues(feedbackItems: TeoyubeFeedbackIntakeSimulationItem[]): TeoyubeDryRunIssue[] {
  return feedbackItems.filter(shouldConvertSimulatedFeedbackToIssue).map(createDryRunIssueFromSimulatedFeedback);
}

export function createFeedbackToIssueSimulationReport(feedbackItems: TeoyubeFeedbackIntakeSimulationItem[]): TeoyubeFeedbackToIssueSimulationReport {
  const issues = convertSimulatedFeedbackToDryRunIssues(feedbackItems);
  return {
    valid: true,
    feedbackItemCount: feedbackItems.length,
    issueCount: issues.length,
    issues,
    warnings: issues.length ? ["Simulated feedback created dry-run issues for manual triage."] : [],
    simulatedOnly: true,
    noAutomaticCollection: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: now()
  };
}
