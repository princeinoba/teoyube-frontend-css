import type { TeoyubeBetaIssue, TeoyubeBetaIssueTriageReport } from "./beta-issue-triage-execution-contracts";
import type {
  TeoyubeBetaFixQueueCategory,
  TeoyubeBetaFixQueueItem,
  TeoyubeBetaFixQueuePriority,
  TeoyubeBetaFixVerificationRequirement
} from "./beta-fix-queue-contracts";
import { createBetaFixQueueItem } from "./beta-fix-queue-manager";

export type TeoyubeBetaIssueToFixConversionReport = {
  valid: boolean;
  issues: TeoyubeBetaIssue[];
  fixItems: TeoyubeBetaFixQueueItem[];
  skippedIssueIds: string[];
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  inMemoryOnly: true;
  noExternalSend: true;
  noUsersContacted: true;
  noAutomaticPublishing: true;
  generatedAt: string;
};

function requirement(id: string, label: string, details: string): TeoyubeBetaFixVerificationRequirement {
  return { id, label, required: true, details };
}

export function getBetaFixCategoryFromIssue(issue: TeoyubeBetaIssue): TeoyubeBetaFixQueueCategory {
  if (issue.category === "real_data_failure") return "real_data";
  if (issue.category === "user_journey_failure") return "user_journey";
  if (issue.category === "scripture_anchor_missing") return "scripture_anchor";
  if (issue.category === "explanation_trace_missing") return "explanation_trace";
  if (issue.category === "unsafe_fallback") return "fallback";
  if (issue.category === "confidence_label_missing") return "confidence_label";
  if (issue.category === "review_only_content_visible") return "reviewed_content_gate";
  if (issue.category === "privacy_consent_issue") return "privacy_consent";
  if (issue.category === "mobile_issue") return "mobile";
  if (issue.category === "accessibility_issue") return "accessibility";
  if (issue.category === "admin_prototype_issue") return "controlled_admin";
  if (issue.category === "disabled_service_issue") return "disabled_service";
  if (issue.category === "debug_payload_visible") return "fallback";
  if (issue.category === "divine_certainty_language") return "fallback";
  if (issue.category === "professional_advice_language") return "fallback";
  if (issue.category === "performance_issue") return "mobile";
  if (issue.category === "content_clarity") return "documentation";
  return "unknown";
}

export function getBetaFixPriorityFromIssue(issue: TeoyubeBetaIssue): TeoyubeBetaFixQueuePriority {
  if (issue.severity === "critical") return "beta_blocker";
  if (issue.severity === "high") return "high";
  if (issue.severity === "medium") return "medium";
  if (issue.severity === "low" || issue.severity === "informational") return "low";
  return "unknown";
}

export function getBetaFixVerificationRequirements(issue: TeoyubeBetaIssue): TeoyubeBetaFixVerificationRequirement[] {
  const category = getBetaFixCategoryFromIssue(issue);
  const base = [
    requirement("no_service_regression", "No service regression", "Verify the fix did not enable persistence, analytics, monitoring, admin auth, CMS, live AI, notifications, or external service requirements."),
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

export function shouldCreateBetaFixItem(issue: TeoyubeBetaIssue): boolean {
  return issue.status !== "resolved" && issue.category !== "unknown";
}

export function createBetaFixItemFromIssue(issue: TeoyubeBetaIssue): TeoyubeBetaFixQueueItem {
  const category = getBetaFixCategoryFromIssue(issue);
  const priority = getBetaFixPriorityFromIssue(issue);
  const ownerReviewRequired = ["scripture_anchor", "explanation_trace", "reviewed_content_gate", "disabled_service", "privacy_consent", "controlled_admin", "real_data"].includes(category);
  const safeLocalFixAllowed = ["documentation", "confidence_label", "mobile", "accessibility", "promise_table", "tig_graph_explorer", "tig_response_panel", "word_card", "prayer_companion", "compass_experience"].includes(category) && priority !== "beta_blocker";
  return createBetaFixQueueItem({
    id: `fix_${issue.id}`,
    title: issue.title,
    description: issue.description,
    source: "phase_5_2_issue_triage",
    sourceId: issue.id,
    category,
    priority,
    riskLevel: priority === "beta_blocker" ? "high" : safeLocalFixAllowed ? "low" : "medium",
    status: priority === "beta_blocker" ? "owner_review_required" : safeLocalFixAllowed ? "safe_to_fix" : "owner_review_required",
    safeLocalFixAllowed,
    ownerReviewRequired,
    proposedFix: `Remediate ${issue.category.replace(/_/g, " ")} without weakening Scripture anchors, explanation paths, fallback safety, confidence labels, privacy, disabled services, or reviewed content gates.`,
    verificationRequirements: getBetaFixVerificationRequirements(issue)
  });
}

export function convertBetaIssuesToFixQueueItems(issues: TeoyubeBetaIssue[]): TeoyubeBetaFixQueueItem[] {
  return issues.filter(shouldCreateBetaFixItem).map(createBetaFixItemFromIssue);
}

export function createBetaIssueToFixConversionReport(issuesOrReport: TeoyubeBetaIssue[] | TeoyubeBetaIssueTriageReport = []): TeoyubeBetaIssueToFixConversionReport {
  const issues = Array.isArray(issuesOrReport) ? issuesOrReport : issuesOrReport.issues;
  const fixItems = convertBetaIssuesToFixQueueItems(issues);
  const skippedIssueIds = issues.filter((issue) => !shouldCreateBetaFixItem(issue)).map((issue) => issue.id);
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
    noAutomaticPublishing: true,
    generatedAt: new Date().toISOString()
  };
}
