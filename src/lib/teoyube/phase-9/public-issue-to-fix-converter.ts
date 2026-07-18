import type {
  TeoyubePublicIssue,
  TeoyubePublicIssueCategory
} from "./public-issue-triage-contracts";
import {
  createReleaseCandidateFixQueueItem
} from "./release-candidate-fix-queue-manager";
import type {
  TeoyubeReleaseCandidateFixCategory,
  TeoyubeReleaseCandidateFixPriority,
  TeoyubeReleaseCandidateFixQueueItem,
  TeoyubeReleaseCandidateFixVerificationRequirement
} from "./release-candidate-fix-queue-contracts";

export type TeoyubePublicIssueToFixConversionReport = {
  valid: boolean;
  issues: TeoyubePublicIssue[];
  fixItems: TeoyubeReleaseCandidateFixQueueItem[];
  skippedIssueIds: string[];
  blockers: string[];
  warnings: string[];
  manualOnly: true;
  noExternalWrite: true;
  noExternalServicesRequired: true;
  inMemoryOnly: true;
  generatedAt: string;
};

const CATEGORY_MAP: Record<TeoyubePublicIssueCategory, TeoyubeReleaseCandidateFixCategory> = {
  app_not_loading: "performance_manual",
  real_data_failure: "unknown",
  user_journey_failure: "unknown",
  scripture_anchor_missing: "scripture_anchor",
  explanation_trace_missing: "explanation_trace",
  unsafe_fallback: "fallback",
  confidence_label_missing: "confidence_label",
  review_only_content_visible: "reviewed_content_gate",
  privacy_consent_issue: "privacy_consent",
  sensitive_information_exposure: "sensitive_data_warning",
  support_boundary_issue: "support_readiness",
  mobile_issue: "mobile",
  accessibility_issue: "accessibility",
  performance_issue: "performance_manual",
  disabled_service_issue: "service_disabled_state",
  debug_payload_visible: "unknown",
  divine_certainty_language: "public_copy",
  professional_advice_language: "public_copy",
  content_clarity: "public_copy",
  unknown: "unknown"
};

function verification(id: string, label: string, details: string): TeoyubeReleaseCandidateFixVerificationRequirement {
  return { id, label, required: true, details };
}

export function shouldCreateReleaseCandidateFixItem(issue: TeoyubePublicIssue): boolean {
  return issue.status !== "closed";
}

export function getReleaseCandidateFixCategoryFromIssue(issue: TeoyubePublicIssue): TeoyubeReleaseCandidateFixCategory {
  return CATEGORY_MAP[issue.category] || "unknown";
}

export function getReleaseCandidateFixPriorityFromIssue(issue: TeoyubePublicIssue): TeoyubeReleaseCandidateFixPriority {
  if (issue.severity === "critical") return "public_release_blocker";
  if (issue.severity === "high") return "high";
  if (issue.severity === "low") return "low";
  return "medium";
}

export function getReleaseCandidateFixVerificationRequirements(issue: TeoyubePublicIssue): TeoyubeReleaseCandidateFixVerificationRequirement[] {
  const category = getReleaseCandidateFixCategoryFromIssue(issue);
  const requirements = [
    verification(`${issue.id}_final_regression`, "Final regression QA", "Run final regression QA after remediation."),
    verification(`${issue.id}_service_disabled`, "Service-disabled regression", "Confirm remediation does not enable disabled services."),
    verification(`${issue.id}_privacy_safety`, "Privacy and safety regression", "Confirm privacy, Scripture, explanation, fallback, confidence, and content gate boundaries remain intact.")
  ];
  if (category === "scripture_anchor") requirements.push(verification(`${issue.id}_scripture_anchor`, "Scripture anchor visible", "Confirm Scripture anchors remain visible where available."));
  if (category === "explanation_trace") requirements.push(verification(`${issue.id}_explanation_trace`, "Explanation trace visible", "Confirm explanation traces remain visible where required."));
  if (category === "fallback") requirements.push(verification(`${issue.id}_fallback`, "Fallback safe", "Confirm fallback state is safe and non-empty."));
  return requirements;
}

export function createReleaseCandidateFixItemFromPublicIssue(issue: TeoyubePublicIssue): TeoyubeReleaseCandidateFixQueueItem {
  const category = getReleaseCandidateFixCategoryFromIssue(issue);
  const priority = getReleaseCandidateFixPriorityFromIssue(issue);
  return createReleaseCandidateFixQueueItem({
    id: `fix_from_${issue.id}`,
    title: issue.title,
    category,
    priority,
    source: "public_issue_triage",
    status: priority === "public_release_blocker" ? "owner_review_required" : "queued",
    riskLevel: priority === "public_release_blocker" ? "owner_review" : "safe_local",
    details: issue.details,
    ownerReviewRequired: priority === "public_release_blocker" || issue.containsSensitiveInformation,
    safeLocalFixAllowed: priority !== "public_release_blocker" && !issue.containsSensitiveInformation,
    verificationRequirements: getReleaseCandidateFixVerificationRequirements(issue)
  });
}

export function convertPublicIssuesToReleaseCandidateFixItems(issues: TeoyubePublicIssue[]): TeoyubeReleaseCandidateFixQueueItem[] {
  return issues.filter(shouldCreateReleaseCandidateFixItem).map(createReleaseCandidateFixItemFromPublicIssue);
}

export function createPublicIssueToFixConversionReport(issues: TeoyubePublicIssue[]): TeoyubePublicIssueToFixConversionReport {
  const fixItems = convertPublicIssuesToReleaseCandidateFixItems(issues);
  const skippedIssueIds = issues.filter((issue) => !shouldCreateReleaseCandidateFixItem(issue)).map((issue) => issue.id);
  return {
    valid: true,
    issues,
    fixItems,
    skippedIssueIds,
    blockers: [],
    warnings: [
      "Public issue-to-fix conversion is manual and in-memory; it does not write to a queue database, contact users, publish content, or connect services.",
      ...(skippedIssueIds.length ? [`${skippedIssueIds.length} closed issue(s) skipped.`] : [])
    ],
    manualOnly: true,
    noExternalWrite: true,
    noExternalServicesRequired: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
