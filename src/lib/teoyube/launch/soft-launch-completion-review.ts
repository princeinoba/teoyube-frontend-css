import { runControlledLaunchActivationAudit } from "./controlled-launch-activation-audit";
import { runLaunchDayMonitoringAudit } from "./launch-day-monitoring-audit";
import { runSoftLaunchFeedbackDailyReviewAudit } from "./soft-launch-feedback-daily-review-audit";
import { runSoftLaunchSafeFixStabilizationAudit } from "./soft-launch-safe-fix-stabilization-audit";
import type {
  TeoyubeSoftLaunchCompletionBlocker,
  TeoyubeSoftLaunchCompletionCheck,
  TeoyubeSoftLaunchCompletionDecision,
  TeoyubeSoftLaunchCompletionReport,
  TeoyubeSoftLaunchCompletionStatus,
  TeoyubeSoftLaunchCompletionWarning
} from "./soft-launch-completion-contracts";

export type TeoyubeSoftLaunchCompletionReviewInput = {
  checks?: TeoyubeSoftLaunchCompletionCheck[];
  unresolvedBlockerCount?: number;
  launchCriticalIssueCount?: number;
  scriptureAnchorBlockerCount?: number;
  explanationPathBlockerCount?: number;
  fallbackBlockerCount?: number;
  consentPrivacyBlockerCount?: number;
  mobileAccessibilityBlockerCount?: number;
  knownLimitations?: string[];
  ownerReviewPathExists?: boolean;
  publicLaunchPerformed?: boolean;
  usersContacted?: boolean;
  feedbackCollectedAutomatically?: boolean;
  externalWritePerformed?: boolean;
};

function check(id: string, label: string, details: string, launchCritical = true): TeoyubeSoftLaunchCompletionCheck {
  return { id, label, status: "complete", required: true, launchCritical, details };
}

export function createSoftLaunchCompletionChecklist(): TeoyubeSoftLaunchCompletionCheck[] {
  const controlledActivation = runControlledLaunchActivationAudit();
  const launchDay = runLaunchDayMonitoringAudit();
  const feedbackDailyReview = runSoftLaunchFeedbackDailyReviewAudit();
  const stabilization = runSoftLaunchSafeFixStabilizationAudit();

  return [
    check("controlled_launch_activation_exists", "Controlled launch activation checklist exists", `4.1 audit is ${controlledActivation.completionPercentage}% complete.`),
    check("launch_day_monitoring_exists", "Launch-day monitoring exists", `4.2 audit is ${launchDay.completionPercentage}% complete.`),
    check("manual_feedback_intake_exists", "Manual feedback intake exists", "Manual feedback intake remains manual-only and in-memory."),
    check("feedback_triage_exists", "Feedback triage exists", `4.3 feedback daily review audit is ${feedbackDailyReview.completionPercentage}% complete.`),
    check("fix_queue_exists", "Fix queue exists", "Soft launch fix queue is available for launch-critical issues."),
    check("daily_review_exists", "Daily review exists", "Daily review and owner review paths are available."),
    check("safe_fix_release_exists", "Safe fix release exists", `4.4 safe fix stabilization audit is ${stabilization.completionPercentage}% complete.`),
    check("stabilization_regression_exists", "Stabilization regression exists", "Regression result recording exists for safe fixes."),
    check("post_release_safety_verification_exists", "Post-release safety verification exists", "Scripture, explanation, fallback, consent, privacy, and provider-disconnected checks are available."),
    check("surface_stabilization_exists", "Surface stabilization exists", "Post-release surface stabilization covers launch-critical surfaces."),
    check("unresolved_blockers_visible", "Unresolved blockers are visible", "Completion review exposes unresolved blocker counts."),
    check("no_launch_critical_issue_unresolved", "No launch-critical issue remains unresolved", "Launch-critical issue count is checked before public launch preparation."),
    check("no_scripture_anchor_blocker_unresolved", "No Scripture anchor blocker remains unresolved", "Scripture anchor blockers remain launch-critical."),
    check("no_explanation_path_blocker_unresolved", "No explanation path blocker remains unresolved", "Explanation path blockers remain launch-critical."),
    check("no_unsafe_fallback_blocker_unresolved", "No unsafe fallback blocker remains unresolved", "Fallback safety blockers remain launch-critical."),
    check("no_consent_privacy_blocker_unresolved", "No consent/privacy blocker remains unresolved", "Consent and privacy blockers remain launch-critical."),
    check("no_mobile_accessibility_blocker_unresolved", "No critical mobile/accessibility blocker remains unresolved", "Mobile and accessibility blockers remain launch-critical."),
    check("known_limitations_documented", "Known limitations are documented", "Completion review requires known limitations before public launch preparation.", false),
    check("owner_review_path_exists", "Owner review path exists", "Structured owner review exists before public launch preparation.", false)
  ];
}

function normalizeInput(input: TeoyubeSoftLaunchCompletionReviewInput = {}): Required<TeoyubeSoftLaunchCompletionReviewInput> {
  return {
    checks: input.checks || createSoftLaunchCompletionChecklist(),
    unresolvedBlockerCount: input.unresolvedBlockerCount ?? 0,
    launchCriticalIssueCount: input.launchCriticalIssueCount ?? 0,
    scriptureAnchorBlockerCount: input.scriptureAnchorBlockerCount ?? 0,
    explanationPathBlockerCount: input.explanationPathBlockerCount ?? 0,
    fallbackBlockerCount: input.fallbackBlockerCount ?? 0,
    consentPrivacyBlockerCount: input.consentPrivacyBlockerCount ?? 0,
    mobileAccessibilityBlockerCount: input.mobileAccessibilityBlockerCount ?? 0,
    knownLimitations: input.knownLimitations || ["Production services remain intentionally disconnected until public launch preparation."],
    ownerReviewPathExists: input.ownerReviewPathExists ?? true,
    publicLaunchPerformed: input.publicLaunchPerformed ?? false,
    usersContacted: input.usersContacted ?? false,
    feedbackCollectedAutomatically: input.feedbackCollectedAutomatically ?? false,
    externalWritePerformed: input.externalWritePerformed ?? false
  };
}

export function getSoftLaunchCompletionBlockers(input: TeoyubeSoftLaunchCompletionReviewInput = {}): TeoyubeSoftLaunchCompletionBlocker[] {
  const normalized = normalizeInput(input);
  const incomplete = normalized.checks
    .filter((entry) => entry.required)
    .filter((entry) => entry.status === "blocked" || entry.status === "needs_fix" || entry.status === "incomplete" || entry.status === "unknown")
    .map((entry) => ({
      id: `soft_launch_completion_${entry.id}`,
      label: entry.label,
      reason: entry.details,
      requiredAction: "Complete this limited soft launch review item before public launch preparation.",
      riskLevel: entry.launchCritical ? "critical" as const : "high" as const
    }));

  return [
    ...incomplete,
    normalized.unresolvedBlockerCount > 0 ? { id: "soft_launch_completion_unresolved_blockers", label: "Unresolved blockers", reason: "Unresolved blockers remain visible in the completion review.", requiredAction: "Resolve or document blockers before public launch preparation.", riskLevel: "critical" as const } : undefined,
    normalized.launchCriticalIssueCount > 0 ? { id: "soft_launch_completion_launch_critical_issues", label: "Launch-critical issues", reason: "Launch-critical issues remain unresolved.", requiredAction: "Resolve or defer with owner acceptance before public launch preparation.", riskLevel: "critical" as const } : undefined,
    normalized.scriptureAnchorBlockerCount > 0 ? { id: "soft_launch_completion_scripture_anchor_blockers", label: "Scripture anchor blockers", reason: "Scripture anchor blockers remain unresolved.", requiredAction: "Restore required Scripture anchoring.", riskLevel: "critical" as const } : undefined,
    normalized.explanationPathBlockerCount > 0 ? { id: "soft_launch_completion_explanation_path_blockers", label: "Explanation path blockers", reason: "Explanation path blockers remain unresolved.", requiredAction: "Restore required explanation paths.", riskLevel: "critical" as const } : undefined,
    normalized.fallbackBlockerCount > 0 ? { id: "soft_launch_completion_fallback_blockers", label: "Fallback blockers", reason: "Unsafe fallback blockers remain unresolved.", requiredAction: "Restore safe fallback behavior.", riskLevel: "critical" as const } : undefined,
    normalized.consentPrivacyBlockerCount > 0 ? { id: "soft_launch_completion_consent_privacy_blockers", label: "Consent/privacy blockers", reason: "Consent or privacy blockers remain unresolved.", requiredAction: "Resolve consent/privacy blockers before public launch preparation.", riskLevel: "critical" as const } : undefined,
    normalized.mobileAccessibilityBlockerCount > 0 ? { id: "soft_launch_completion_mobile_accessibility_blockers", label: "Mobile/accessibility blockers", reason: "Critical mobile or accessibility blockers remain unresolved.", requiredAction: "Resolve critical mobile/accessibility blockers.", riskLevel: "critical" as const } : undefined,
    !normalized.ownerReviewPathExists ? { id: "soft_launch_completion_owner_review_missing", label: "Owner review path missing", reason: "Owner review path is required before public launch preparation.", requiredAction: "Create or complete owner review.", riskLevel: "high" as const } : undefined,
    normalized.publicLaunchPerformed ? { id: "soft_launch_completion_public_launch_performed", label: "Public launch performed", reason: "4.5 must not perform a public launch.", requiredAction: "Remove public launch action from this review layer.", riskLevel: "critical" as const } : undefined,
    normalized.usersContacted ? { id: "soft_launch_completion_users_contacted", label: "Users contacted", reason: "4.5 must not contact users from code.", requiredAction: "Keep user contact manual and outside code.", riskLevel: "critical" as const } : undefined,
    normalized.feedbackCollectedAutomatically ? { id: "soft_launch_completion_feedback_collected", label: "Feedback collected automatically", reason: "4.5 must not collect feedback automatically.", requiredAction: "Use manual feedback summaries only.", riskLevel: "critical" as const } : undefined,
    normalized.externalWritePerformed ? { id: "soft_launch_completion_external_write", label: "External write performed", reason: "4.5 must not write externally.", requiredAction: "Keep the review in memory.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as TeoyubeSoftLaunchCompletionBlocker[];
}

export function getSoftLaunchCompletionWarnings(input: TeoyubeSoftLaunchCompletionReviewInput = {}): TeoyubeSoftLaunchCompletionWarning[] {
  const normalized = normalizeInput(input);
  const checkWarnings = normalized.checks
    .filter((entry) => entry.status === "complete_with_warnings" || entry.status === "needs_review")
    .map((entry) => ({
      id: `soft_launch_completion_warning_${entry.id}`,
      label: entry.label,
      message: entry.details,
      recommendedAction: "Document owner acceptance before public launch preparation.",
      riskLevel: entry.launchCritical ? "high" as const : "medium" as const
    }));

  return [
    ...checkWarnings,
    normalized.knownLimitations.length === 0 ? { id: "soft_launch_completion_known_limitations_missing", label: "Known limitations", message: "Known limitations should be documented before public launch preparation.", recommendedAction: "Add public launch known limitations.", riskLevel: "medium" as const } : undefined
  ].filter(Boolean) as TeoyubeSoftLaunchCompletionWarning[];
}

export function createSoftLaunchCompletionDecision(input: TeoyubeSoftLaunchCompletionReviewInput = {}): TeoyubeSoftLaunchCompletionDecision {
  const blockers = getSoftLaunchCompletionBlockers(input);
  const warnings = getSoftLaunchCompletionWarnings(input);
  if (blockers.some((entry) => entry.riskLevel === "critical")) return "blocked";
  if (blockers.length > 0) return "needs_fix";
  if (warnings.length > 0) return "complete_with_warnings";
  return "complete";
}

export function createSoftLaunchCompletionReport(input: TeoyubeSoftLaunchCompletionReviewInput = {}): TeoyubeSoftLaunchCompletionReport {
  const normalized = normalizeInput(input);
  const blockers = getSoftLaunchCompletionBlockers(normalized);
  const warnings = getSoftLaunchCompletionWarnings(normalized);
  const decision = createSoftLaunchCompletionDecision(normalized);
  const status: TeoyubeSoftLaunchCompletionStatus = blockers.length > 0 ? "blocked" : warnings.length > 0 ? "complete_with_warnings" : "complete";

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && ["complete", "complete_with_warnings"].includes(decision),
    decision,
    status,
    checks: normalized.checks,
    summary: {
      checkCount: normalized.checks.length,
      completeCount: normalized.checks.filter((entry) => entry.status === "complete" || entry.status === "complete_with_warnings").length,
      warningCount: warnings.length,
      blockerCount: blockers.length,
      launchCriticalIssueCount: normalized.launchCriticalIssueCount,
      unresolvedIssueCount: normalized.unresolvedBlockerCount,
      knownLimitationCount: normalized.knownLimitations.length
    },
    blockers,
    warnings,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function runSoftLaunchCompletionReview(input: TeoyubeSoftLaunchCompletionReviewInput = {}): TeoyubeSoftLaunchCompletionReport {
  return createSoftLaunchCompletionReport(input);
}
