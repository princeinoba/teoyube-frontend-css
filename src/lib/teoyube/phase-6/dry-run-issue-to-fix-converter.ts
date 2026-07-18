import type { TeoyubeDryRunIssue } from "./dry-run-issue-triage-contracts";
import type {
  TeoyubeDryRunFixQueueCategory,
  TeoyubeDryRunFixQueueItem,
  TeoyubeDryRunFixQueuePriority,
  TeoyubeDryRunFixVerificationRequirement
} from "./dry-run-fix-queue-contracts";
import { createDryRunFixQueueItem } from "./dry-run-fix-queue-manager";

export type TeoyubeDryRunIssueToFixConversionReport = {
  valid: boolean;
  issues: TeoyubeDryRunIssue[];
  fixItems: TeoyubeDryRunFixQueueItem[];
  skippedIssueIds: string[];
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noExternalSend: true;
  noUsersContacted: true;
  noFeedbackCollectedAutomatically: true;
  noAutomaticPublishing: true;
  generatedAt: string;
};

function requirement(id: string, label: string, details: string): TeoyubeDryRunFixVerificationRequirement {
  return { id, label, required: true, details };
}

export function getDryRunFixCategoryFromIssue(issue: TeoyubeDryRunIssue): TeoyubeDryRunFixQueueCategory {
  if (issue.category === "participant_instruction_gap") return "participant_workflow";
  if (issue.category === "feedback_boundary_gap") return "feedback_boundary";
  if (issue.category === "privacy_consent_issue") return "privacy_consent";
  if (issue.category === "scripture_anchor_missing") return "scripture_anchor";
  if (issue.category === "explanation_trace_missing") return "explanation_trace";
  if (issue.category === "unsafe_fallback") return "fallback";
  if (issue.category === "confidence_label_missing") return "confidence_label";
  if (issue.category === "review_only_content_visible") return "reviewed_content_gate";
  if (issue.category === "disabled_service_issue") return "service_disabled_state";
  if (issue.category === "controlled_admin_issue") return "controlled_admin";
  if (issue.category === "mobile_issue") return "mobile";
  if (issue.category === "accessibility_issue") return "accessibility";
  if (issue.category === "debug_payload_visible") return "operations_checklist";
  if (issue.category === "divine_certainty_language") return "fallback";
  if (issue.category === "professional_advice_language") return "fallback";
  if (issue.category === "content_clarity") return "documentation";
  if (issue.category === "app_not_loading") return "operations_checklist";
  return "unknown";
}

export function getDryRunFixPriorityFromIssue(issue: TeoyubeDryRunIssue): TeoyubeDryRunFixQueuePriority {
  if (issue.severity === "critical") return "dry_run_blocker";
  if (issue.severity === "high") return "high";
  if (issue.severity === "medium") return "medium";
  if (issue.severity === "low" || issue.severity === "informational") return "low";
  return "unknown";
}

export function getDryRunFixVerificationRequirements(issue: TeoyubeDryRunIssue): TeoyubeDryRunFixVerificationRequirement[] {
  const category = getDryRunFixCategoryFromIssue(issue);
  const base = [
    requirement("no_service_regression", "No service regression", "Verify the fix did not enable persistence, analytics, monitoring, admin auth, CMS, live AI, notifications, automatic contact, automatic feedback collection, or external service requirements."),
    requirement("privacy_regression", "Privacy boundary preserved", "Verify no sensitive text is stored and no browser persistence is required.")
  ];
  if (["scripture_anchor", "explanation_trace", "fallback", "confidence_label", "tig_response_panel"].includes(category)) {
    return [
      ...base,
      requirement("scripture_anchor_regression", "Scripture anchors preserved", "Verify available anchors remain visible and no unsupported references are invented."),
      requirement("explanation_trace_regression", "Explanation traces preserved", "Verify explanation paths and fallback reasons remain visible."),
      requirement("fallback_confidence_regression", "Fallback/confidence preserved", "Verify fallback copy remains safe and confidence labels remain visible.")
    ];
  }
  if (["mobile", "accessibility", "promise_table", "tig_graph_explorer"].includes(category)) {
    return [...base, requirement("mobile_accessibility_regression", "Mobile/accessibility preserved", "Verify wrapping, labels, keyboard basics, and list fallback are not worse.")];
  }
  if (category === "reviewed_content_gate") {
    return [...base, requirement("reviewed_content_gate_regression", "Reviewed content gate preserved", "Verify review-only content remains excluded and no automatic publishing exists.")];
  }
  return base;
}

export function shouldCreateDryRunFixItem(issue: TeoyubeDryRunIssue): boolean {
  return issue.status !== "resolved" && issue.category !== "unknown";
}

export function createDryRunFixItemFromIssue(issue: TeoyubeDryRunIssue): TeoyubeDryRunFixQueueItem {
  const category = getDryRunFixCategoryFromIssue(issue);
  const priority = getDryRunFixPriorityFromIssue(issue);
  const ownerReviewRequired = ["scripture_anchor", "explanation_trace", "fallback", "reviewed_content_gate", "service_disabled_state", "privacy_consent", "controlled_admin"].includes(category);
  const safeLocalFixAllowed = ["documentation", "confidence_label", "mobile", "accessibility", "promise_table", "tig_graph_explorer", "tig_response_panel", "word_card", "prayer_companion", "compass_experience", "participant_workflow", "communication_boundary", "feedback_boundary", "operations_checklist"].includes(category) && priority !== "dry_run_blocker";
  return createDryRunFixQueueItem({
    id: `dry_run_fix_${issue.id}`,
    title: issue.title,
    description: issue.description,
    source: "phase_6_2_dry_run_issue",
    sourceId: issue.id,
    category,
    priority,
    riskLevel: priority === "dry_run_blocker" ? "high" : safeLocalFixAllowed ? "low" : "medium",
    status: priority === "dry_run_blocker" ? "owner_review_required" : safeLocalFixAllowed ? "safe_to_fix" : "owner_review_required",
    safeLocalFixAllowed,
    ownerReviewRequired,
    proposedFix: `Stabilize ${issue.category.replace(/_/g, " ")} without weakening Scripture anchors, explanation paths, fallback safety, confidence labels, privacy, disabled services, reviewed content gates, or manual-only beta boundaries.`,
    verificationRequirements: getDryRunFixVerificationRequirements(issue)
  });
}

export function convertDryRunIssuesToFixQueueItems(issues: TeoyubeDryRunIssue[]): TeoyubeDryRunFixQueueItem[] {
  return issues.filter(shouldCreateDryRunFixItem).map(createDryRunFixItemFromIssue);
}

export function createDryRunIssueToFixConversionReport(issues: TeoyubeDryRunIssue[] = []): TeoyubeDryRunIssueToFixConversionReport {
  const fixItems = convertDryRunIssuesToFixQueueItems(issues);
  const skippedIssueIds = issues.filter((issue) => !shouldCreateDryRunFixItem(issue)).map((issue) => issue.id);
  return {
    valid: true,
    issues,
    fixItems,
    skippedIssueIds,
    blockers: [],
    warnings: skippedIssueIds.length ? [`${skippedIssueIds.length} issue(s) were skipped because they are resolved or unknown.`] : [],
    manualOnly: true,
    inMemoryOnly: true,
    noExternalSend: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noAutomaticPublishing: true,
    generatedAt: new Date().toISOString()
  };
}
