import { runControlledPublicLaunchActivationAudit } from "./controlled-public-launch-activation-audit";
import { runPublicFeedbackDailyReviewAudit } from "./public-feedback-daily-review-audit";
import { runPublicLaunchDayMonitoringFeedbackAudit } from "./public-launch-day-monitoring-feedback-audit";
import { runPublicSafeFixStabilizationAudit } from "./public-safe-fix-stabilization-audit";
import type {
  TeoyubePublicLaunchCompletionBlocker,
  TeoyubePublicLaunchCompletionCheck,
  TeoyubePublicLaunchCompletionDecision,
  TeoyubePublicLaunchCompletionReport,
  TeoyubePublicLaunchCompletionStatus,
  TeoyubePublicLaunchCompletionWarning
} from "./public-launch-completion-contracts";

export type TeoyubePublicLaunchCompletionReviewInput = {
  checks?: TeoyubePublicLaunchCompletionCheck[];
  publicLaunchRecorded?: boolean;
  unresolvedBlockerCount?: number;
  publicLaunchCriticalIssueCount?: number;
  privacyTermsConsentBlockerCount?: number;
  scriptureAnchorBlockerCount?: number;
  explanationPathBlockerCount?: number;
  fallbackBlockerCount?: number;
  consentPrivacyBlockerCount?: number;
  mobileAccessibilityBlockerCount?: number;
  knownLimitations?: string[];
  ownerReviewPathExists?: boolean;
  publicLaunchPerformedByCode?: boolean;
  usersContacted?: boolean;
  feedbackCollectedAutomatically?: boolean;
  publicUrlFetched?: boolean;
  externalWritePerformed?: boolean;
};

function check(id: string, label: string, details: string, publicLaunchCritical = true): TeoyubePublicLaunchCompletionCheck {
  return { id, label, status: "complete", required: true, publicLaunchCritical, details };
}

export function createPublicLaunchCompletionChecklist(): TeoyubePublicLaunchCompletionCheck[] {
  const controlledActivation = runControlledPublicLaunchActivationAudit();
  const launchDay = runPublicLaunchDayMonitoringFeedbackAudit();
  const feedbackDailyReview = runPublicFeedbackDailyReviewAudit();
  const stabilization = runPublicSafeFixStabilizationAudit();

  return [
    check("controlled_public_activation_exists", "Controlled public activation checklist exists", `6.1 audit is ${controlledActivation.completionPercentage}% complete.`),
    check("public_launch_day_monitoring_exists", "Public launch-day monitoring exists", `6.2 audit is ${launchDay.completionPercentage}% complete.`),
    check("public_manual_feedback_intake_exists", "Public manual feedback intake exists", "Manual public feedback intake remains manual-only and in-memory."),
    check("public_feedback_triage_exists", "Public feedback triage exists", `6.3 feedback daily review audit is ${feedbackDailyReview.completionPercentage}% complete.`),
    check("public_fix_queue_exists", "Public fix queue exists", "Public fix queue is available for public-launch-critical issues."),
    check("public_daily_review_exists", "Public daily review exists", "Public daily review and owner review paths are available."),
    check("public_safe_fix_release_exists", "Public safe-fix release exists", `6.4 public safe-fix stabilization audit is ${stabilization.completionPercentage}% complete.`),
    check("public_stabilization_regression_exists", "Public stabilization regression exists", "Regression result recording exists for public safe fixes."),
    check("post_release_public_safety_exists", "Post-release public safety verification exists", "Scripture, explanation, fallback, consent, privacy, public notices, and provider-disconnected checks are available."),
    check("public_surface_stabilization_exists", "Public surface stabilization exists", "Public post-release surface stabilization covers launch-critical surfaces."),
    check("unresolved_blockers_visible", "Unresolved blockers are visible", "Completion review exposes unresolved blocker counts."),
    check("no_public_launch_critical_issue_unresolved", "No public-launch-critical issue remains unresolved", "Public-launch-critical issue count is checked before post-launch operations planning."),
    check("no_privacy_terms_consent_blocker_unresolved", "No privacy/terms/consent blocker remains unresolved", "Public privacy, terms, and consent blockers remain public-launch-critical."),
    check("no_scripture_anchor_blocker_unresolved", "No Scripture anchor blocker remains unresolved", "Scripture anchor blockers remain public-launch-critical."),
    check("no_explanation_path_blocker_unresolved", "No explanation path blocker remains unresolved", "Explanation path blockers remain public-launch-critical."),
    check("no_unsafe_fallback_blocker_unresolved", "No unsafe fallback blocker remains unresolved", "Fallback safety blockers remain public-launch-critical."),
    check("no_consent_privacy_blocker_unresolved", "No consent/privacy blocker remains unresolved", "Consent and privacy blockers remain public-launch-critical."),
    check("no_mobile_accessibility_blocker_unresolved", "No critical mobile/accessibility blocker remains unresolved", "Mobile and accessibility blockers remain public-launch-critical."),
    check("known_limitations_documented", "Known limitations are documented", "Completion review requires known limitations before post-launch operations planning.", false),
    check("owner_review_path_exists", "Owner review path exists", "Structured owner review exists before post-launch operations planning.", false)
  ];
}

function normalizeInput(input: TeoyubePublicLaunchCompletionReviewInput = {}): Required<TeoyubePublicLaunchCompletionReviewInput> {
  return {
    checks: input.checks || createPublicLaunchCompletionChecklist(),
    publicLaunchRecorded: input.publicLaunchRecorded ?? false,
    unresolvedBlockerCount: input.unresolvedBlockerCount ?? 0,
    publicLaunchCriticalIssueCount: input.publicLaunchCriticalIssueCount ?? 0,
    privacyTermsConsentBlockerCount: input.privacyTermsConsentBlockerCount ?? 0,
    scriptureAnchorBlockerCount: input.scriptureAnchorBlockerCount ?? 0,
    explanationPathBlockerCount: input.explanationPathBlockerCount ?? 0,
    fallbackBlockerCount: input.fallbackBlockerCount ?? 0,
    consentPrivacyBlockerCount: input.consentPrivacyBlockerCount ?? 0,
    mobileAccessibilityBlockerCount: input.mobileAccessibilityBlockerCount ?? 0,
    knownLimitations: input.knownLimitations || ["No real public launch record was provided to this in-memory review layer."],
    ownerReviewPathExists: input.ownerReviewPathExists ?? true,
    publicLaunchPerformedByCode: input.publicLaunchPerformedByCode ?? false,
    usersContacted: input.usersContacted ?? false,
    feedbackCollectedAutomatically: input.feedbackCollectedAutomatically ?? false,
    publicUrlFetched: input.publicUrlFetched ?? false,
    externalWritePerformed: input.externalWritePerformed ?? false
  };
}

export function getPublicLaunchCompletionBlockers(input: TeoyubePublicLaunchCompletionReviewInput = {}): TeoyubePublicLaunchCompletionBlocker[] {
  const normalized = normalizeInput(input);
  const incomplete = normalized.checks
    .filter((entry) => entry.required)
    .filter((entry) => entry.status === "blocked" || entry.status === "needs_fix" || entry.status === "incomplete" || entry.status === "unknown")
    .map((entry) => ({
      id: `public_launch_completion_${entry.id}`,
      label: entry.label,
      reason: entry.details,
      requiredAction: "Complete this public launch completion item before post-launch operations planning.",
      riskLevel: entry.publicLaunchCritical ? "critical" as const : "high" as const
    }));

  return [
    ...incomplete,
    normalized.unresolvedBlockerCount > 0 ? { id: "public_launch_completion_unresolved_blockers", label: "Unresolved blockers", reason: "Unresolved blockers remain visible in completion review.", requiredAction: "Resolve or document blockers before post-launch readiness.", riskLevel: "critical" as const } : undefined,
    normalized.publicLaunchCriticalIssueCount > 0 ? { id: "public_launch_completion_critical_issues", label: "Public-launch-critical issues", reason: "Public-launch-critical issues remain unresolved.", requiredAction: "Resolve or defer with owner acceptance before post-launch readiness.", riskLevel: "critical" as const } : undefined,
    normalized.privacyTermsConsentBlockerCount > 0 ? { id: "public_launch_completion_privacy_terms_consent", label: "Privacy/terms/consent blockers", reason: "Privacy, terms, or consent blockers remain unresolved.", requiredAction: "Restore public privacy, terms, and consent readiness.", riskLevel: "critical" as const } : undefined,
    normalized.scriptureAnchorBlockerCount > 0 ? { id: "public_launch_completion_scripture_anchor", label: "Scripture anchor blockers", reason: "Scripture anchor blockers remain unresolved.", requiredAction: "Restore required Scripture anchoring.", riskLevel: "critical" as const } : undefined,
    normalized.explanationPathBlockerCount > 0 ? { id: "public_launch_completion_explanation_path", label: "Explanation path blockers", reason: "Explanation path blockers remain unresolved.", requiredAction: "Restore required explanation paths.", riskLevel: "critical" as const } : undefined,
    normalized.fallbackBlockerCount > 0 ? { id: "public_launch_completion_fallback", label: "Fallback blockers", reason: "Unsafe fallback blockers remain unresolved.", requiredAction: "Restore safe fallback behavior.", riskLevel: "critical" as const } : undefined,
    normalized.consentPrivacyBlockerCount > 0 ? { id: "public_launch_completion_consent_privacy", label: "Consent/privacy blockers", reason: "Consent or privacy blockers remain unresolved.", requiredAction: "Resolve consent/privacy blockers before post-launch readiness.", riskLevel: "critical" as const } : undefined,
    normalized.mobileAccessibilityBlockerCount > 0 ? { id: "public_launch_completion_mobile_accessibility", label: "Mobile/accessibility blockers", reason: "Critical mobile or accessibility blockers remain unresolved.", requiredAction: "Resolve critical mobile/accessibility blockers.", riskLevel: "critical" as const } : undefined,
    !normalized.ownerReviewPathExists ? { id: "public_launch_completion_owner_review_missing", label: "Owner review path missing", reason: "Owner review path is required before post-launch readiness.", requiredAction: "Create or complete owner review.", riskLevel: "high" as const } : undefined,
    normalized.publicLaunchPerformedByCode ? { id: "public_launch_completion_launch_performed_by_code", label: "Public launch performed by code", reason: "6.5 must not perform public launch from code.", requiredAction: "Remove launch action from this review layer.", riskLevel: "critical" as const } : undefined,
    normalized.usersContacted ? { id: "public_launch_completion_users_contacted", label: "Users contacted", reason: "6.5 must not contact users from code.", requiredAction: "Keep user contact manual and outside code.", riskLevel: "critical" as const } : undefined,
    normalized.feedbackCollectedAutomatically ? { id: "public_launch_completion_feedback_collected", label: "Feedback collected automatically", reason: "6.5 must not collect feedback automatically.", requiredAction: "Use manual feedback summaries only.", riskLevel: "critical" as const } : undefined,
    normalized.publicUrlFetched ? { id: "public_launch_completion_public_url_fetched", label: "Public URL fetched", reason: "6.5 must not fetch public URLs from code.", requiredAction: "Keep URL checks manual.", riskLevel: "critical" as const } : undefined,
    normalized.externalWritePerformed ? { id: "public_launch_completion_external_write", label: "External write performed", reason: "6.5 must not write externally.", requiredAction: "Keep the review in memory.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as TeoyubePublicLaunchCompletionBlocker[];
}

export function getPublicLaunchCompletionWarnings(input: TeoyubePublicLaunchCompletionReviewInput = {}): TeoyubePublicLaunchCompletionWarning[] {
  const normalized = normalizeInput(input);
  const checkWarnings = normalized.checks
    .filter((entry) => entry.status === "complete_with_warnings" || entry.status === "needs_review" || entry.status === "not_launched")
    .map((entry) => ({
      id: `public_launch_completion_warning_${entry.id}`,
      label: entry.label,
      message: entry.details,
      recommendedAction: "Document owner acceptance before post-launch operations planning.",
      riskLevel: entry.publicLaunchCritical ? "high" as const : "medium" as const
    }));

  return [
    ...checkWarnings,
    !normalized.publicLaunchRecorded ? { id: "public_launch_completion_no_launch_record", label: "No public launch record", message: "No real public launch was recorded in this codebase; completion remains structural/readiness-only.", recommendedAction: "If a real public launch happened manually, record it in owner-reviewed notes outside automated code.", riskLevel: "medium" as const } : undefined,
    normalized.knownLimitations.length === 0 ? { id: "public_launch_completion_known_limitations_missing", label: "Known limitations", message: "Known limitations should be documented before post-launch operations planning.", recommendedAction: "Add post-launch known limitations.", riskLevel: "medium" as const } : undefined
  ].filter(Boolean) as TeoyubePublicLaunchCompletionWarning[];
}

export function createPublicLaunchCompletionDecision(input: TeoyubePublicLaunchCompletionReviewInput = {}): TeoyubePublicLaunchCompletionDecision {
  const normalized = normalizeInput(input);
  const blockers = getPublicLaunchCompletionBlockers(normalized);
  const warnings = getPublicLaunchCompletionWarnings(normalized);
  if (blockers.some((entry) => entry.riskLevel === "critical")) return "blocked";
  if (blockers.length > 0) return "needs_fix";
  if (!normalized.publicLaunchRecorded) return "not_applicable_no_public_launch_recorded";
  if (warnings.length > 0) return "complete_with_warnings";
  return "complete";
}

export function createPublicLaunchCompletionReport(input: TeoyubePublicLaunchCompletionReviewInput = {}): TeoyubePublicLaunchCompletionReport {
  const normalized = normalizeInput(input);
  const blockers = getPublicLaunchCompletionBlockers(normalized);
  const warnings = getPublicLaunchCompletionWarnings(normalized);
  const decision = createPublicLaunchCompletionDecision(normalized);
  const status: TeoyubePublicLaunchCompletionStatus = blockers.length > 0 ? "blocked" : !normalized.publicLaunchRecorded ? "not_launched" : warnings.length > 0 ? "complete_with_warnings" : "complete";

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision,
    status,
    checks: normalized.checks,
    summary: {
      checkCount: normalized.checks.length,
      completeCount: normalized.checks.filter((entry) => entry.status === "complete" || entry.status === "complete_with_warnings").length,
      warningCount: warnings.length,
      blockerCount: blockers.length,
      publicLaunchCriticalIssueCount: normalized.publicLaunchCriticalIssueCount,
      unresolvedIssueCount: normalized.unresolvedBlockerCount,
      knownLimitationCount: normalized.knownLimitations.length,
      publicLaunchRecorded: normalized.publicLaunchRecorded
    },
    blockers,
    warnings,
    noPublicLaunchPerformedByCode: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function runPublicLaunchCompletionReview(input: TeoyubePublicLaunchCompletionReviewInput = {}): TeoyubePublicLaunchCompletionReport {
  return createPublicLaunchCompletionReport(input);
}
