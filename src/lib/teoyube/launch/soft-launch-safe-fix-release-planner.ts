import type { TeoyubeSoftLaunchFixQueue } from "./soft-launch-fix-queue-contracts";
import type { TeoyubeSoftLaunchFixQueueItem } from "./soft-launch-feedback-triage-contracts";
import type {
  TeoyubeSoftLaunchSafeFixReleaseCandidate,
  TeoyubeSoftLaunchSafeFixReleaseDecision,
  TeoyubeSoftLaunchSafeFixReleasePlan,
  TeoyubeSoftLaunchSafeFixReleaseReport,
  TeoyubeSoftLaunchSafeFixReleaseType
} from "./soft-launch-safe-fix-release-contracts";
import { validateSoftLaunchSafeFixReleaseCandidate } from "./soft-launch-safe-fix-release-safety";

const SAFE_TYPES: TeoyubeSoftLaunchSafeFixReleaseType[] = [
  "ui_layout_patch",
  "accessibility_patch",
  "copy_clarity_patch",
  "fallback_display_patch",
  "scripture_anchor_display_patch",
  "explanation_path_display_patch",
  "consent_visibility_patch",
  "debug_visibility_patch",
  "export_fix",
  "type_error_fix",
  "test_fixture_fix",
  "documentation_fix"
];

function normalizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function textFor(item: TeoyubeSoftLaunchFixQueueItem): string {
  return `${item.title} ${item.category} ${item.proposedFix} ${item.verificationRequired.join(" ")}`.toLowerCase();
}

function releaseTypeForFix(item: TeoyubeSoftLaunchFixQueueItem): TeoyubeSoftLaunchSafeFixReleaseType {
  const value = textFor(item);
  if (item.status === "blocked") return "blocked";
  if (/export/.test(value)) return "export_fix";
  if (/type|typescript|mismatch/.test(value)) return "type_error_fix";
  if (/test|fixture|smoke/.test(value)) return "test_fixture_fix";
  if (/documentation|docs|wording|copy clarity/.test(value)) return "documentation_fix";
  if (item.category === "scripture_anchor") return "scripture_anchor_display_patch";
  if (item.category === "explanation_path") return "explanation_path_display_patch";
  if (item.category === "fallback" || item.category === "offline_fallback") return "fallback_display_patch";
  if (item.category === "consent" || item.category === "privacy") return "consent_visibility_patch";
  if (item.category === "mobile_ui") return "ui_layout_patch";
  if (item.category === "accessibility") return "accessibility_patch";
  if (item.category === "debug_safety") return "debug_visibility_patch";
  if (item.category === "content_clarity" || item.category === "positive_feedback") return "copy_clarity_patch";
  if (item.priority === "defer") return "manual_only";
  return item.safetyCritical || item.launchCritical ? "manual_only" : "documentation_fix";
}

function filesForFix(item: TeoyubeSoftLaunchFixQueueItem, releaseType: TeoyubeSoftLaunchSafeFixReleaseType): string[] {
  if (releaseType === "documentation_fix") return ["docs/teoyube"];
  if (releaseType === "export_fix" || releaseType === "type_error_fix" || releaseType === "test_fixture_fix") return ["src/lib/teoyube/launch"];
  if (releaseType === "ui_layout_patch" || releaseType === "accessibility_patch") return ["teoyube-app/src/components", "teoyube-app/src/app"];
  if (releaseType === "scripture_anchor_display_patch" || releaseType === "explanation_path_display_patch") return ["teoyube-app/src/components/tig", "src/lib/tig"];
  if (releaseType === "fallback_display_patch" || releaseType === "consent_visibility_patch") return ["teoyube-app/src/components/tig", "src/lib/tig"];
  if (releaseType === "debug_visibility_patch") return ["teoyube-app/src/components/tig", "teoyube-app/src/app/tig/debug"];
  return item.category ? [`manual review: ${item.category}`] : ["manual review"];
}

function regressionChecksForFix(item: TeoyubeSoftLaunchFixQueueItem, releaseType: TeoyubeSoftLaunchSafeFixReleaseType): string[] {
  const checks = new Set<string>(item.verificationRequired.length ? item.verificationRequired : ["owner_review"]);
  checks.add("typecheck");
  checks.add("smoke_check");
  if (["scripture_anchor_display_patch", "explanation_path_display_patch"].includes(releaseType)) checks.add("Scripture/explanation verification");
  if (releaseType === "fallback_display_patch") checks.add("Fallback/offline verification");
  if (releaseType === "consent_visibility_patch") checks.add("Consent/privacy verification");
  if (["ui_layout_patch", "accessibility_patch"].includes(releaseType)) checks.add("Mobile/accessibility verification");
  if (releaseType === "debug_visibility_patch") checks.add("Debug safety verification");
  return Array.from(checks);
}

export function createSoftLaunchSafeFixReleaseCandidate(
  item: TeoyubeSoftLaunchFixQueueItem
): TeoyubeSoftLaunchSafeFixReleaseCandidate {
  const releaseType = releaseTypeForFix(item);
  const ownerReviewRequired = item.launchCritical || item.safetyCritical || item.priority === "launch_blocker" || item.severity === "critical" || item.severity === "high";
  const deferred = item.priority === "defer" || item.status === "deferred";
  const blockedReason = item.status === "blocked" ? "Fix queue item is already blocked." : undefined;

  return {
    id: normalizeId(`safe_fix_release_${item.id || item.title}`),
    sourceFixQueueItemId: item.id,
    sourceFixQueueItem: item,
    title: item.title,
    releaseType,
    riskLevel: item.severity === "critical" ? "critical" : item.severity === "high" ? "high" : item.severity === "low" ? "low" : "medium",
    summary: item.title,
    proposedFix: item.proposedFix,
    filesToChange: filesForFix(item, releaseType),
    localOnly: SAFE_TYPES.includes(releaseType),
    smallScope: !["critical", "unknown"].includes(item.severity),
    reversible: true,
    regressionTestable: true,
    preservesScriptureAnchors: true,
    preservesExplanationPaths: true,
    preservesFallbackSafety: true,
    preservesConsentControls: true,
    keepsPersonalizationVisible: true,
    externalAnalyticsDisabled: true,
    productionPersistenceDisabled: true,
    liveAiOrchestrationDisabled: true,
    noSecretsExposed: true,
    noRawSensitiveTextStorage: true,
    noDivineCertaintyClaims: true,
    noExternalProductionServices: true,
    ownerReviewRequired,
    deferred,
    blockedReason,
    regressionChecks: regressionChecksForFix(item, releaseType),
    status: blockedReason ? "blocked" : deferred ? "deferred" : ownerReviewRequired ? "planned" : "candidate",
    createdAt: new Date().toISOString()
  };
}

function isSafeLocalCandidate(candidate: TeoyubeSoftLaunchSafeFixReleaseCandidate): boolean {
  const validation = validateSoftLaunchSafeFixReleaseCandidate(candidate);
  return validation.valid &&
    candidate.localOnly &&
    candidate.smallScope &&
    candidate.reversible &&
    candidate.regressionTestable &&
    !candidate.ownerReviewRequired &&
    !candidate.deferred &&
    candidate.status !== "blocked";
}

export function createSoftLaunchSafeFixReleasePlan(
  fixQueue: TeoyubeSoftLaunchFixQueue
): TeoyubeSoftLaunchSafeFixReleasePlan {
  const candidates = fixQueue.items.map(createSoftLaunchSafeFixReleaseCandidate);
  const blockedFixes = candidates.filter((candidate) => !validateSoftLaunchSafeFixReleaseCandidate(candidate).valid || candidate.status === "blocked");
  const deferredFixes = candidates.filter((candidate) => candidate.deferred && !blockedFixes.some((blocked) => blocked.id === candidate.id));
  const safeLocalFixes = candidates.filter(isSafeLocalCandidate);
  const manualReviewFixes = candidates.filter((candidate) =>
    !safeLocalFixes.some((safe) => safe.id === candidate.id) &&
    !blockedFixes.some((blocked) => blocked.id === candidate.id) &&
    !deferredFixes.some((deferred) => deferred.id === candidate.id)
  );

  return {
    id: "soft_launch_safe_fix_release_plan_4_4",
    label: "Soft Launch Safe Fix Release Plan",
    sourceFixQueueId: fixQueue.id,
    sourceFixQueue: fixQueue,
    candidates,
    safeLocalFixes,
    manualReviewFixes,
    blockedFixes,
    deferredFixes,
    manualOnly: true,
    inMemoryOnly: true,
    noAutoApply: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    generatedAt: new Date().toISOString()
  };
}

export function getSafeFixReleaseCandidates(plan: TeoyubeSoftLaunchSafeFixReleasePlan): TeoyubeSoftLaunchSafeFixReleaseCandidate[] {
  return plan.safeLocalFixes;
}

export function getManualReviewFixReleaseCandidates(plan: TeoyubeSoftLaunchSafeFixReleasePlan): TeoyubeSoftLaunchSafeFixReleaseCandidate[] {
  return plan.manualReviewFixes;
}

export function getBlockedFixReleaseCandidates(plan: TeoyubeSoftLaunchSafeFixReleasePlan): TeoyubeSoftLaunchSafeFixReleaseCandidate[] {
  return plan.blockedFixes;
}

export function getDeferredFixReleaseCandidates(plan: TeoyubeSoftLaunchSafeFixReleasePlan): TeoyubeSoftLaunchSafeFixReleaseCandidate[] {
  return plan.deferredFixes;
}

export function createSoftLaunchSafeFixReleaseDecision(
  plan: TeoyubeSoftLaunchSafeFixReleasePlan
): TeoyubeSoftLaunchSafeFixReleaseDecision {
  if (plan.blockedFixes.length > 0) return "blocked";
  if (plan.safeLocalFixes.length > 0) return "ready_for_safe_release";
  if (plan.manualReviewFixes.length > 0) return "manual_review_required";
  if (plan.deferredFixes.length > 0) return "defer";
  return "unknown";
}

export function createSoftLaunchSafeFixReleasePlanReport(
  plan: TeoyubeSoftLaunchSafeFixReleasePlan
): TeoyubeSoftLaunchSafeFixReleaseReport {
  const validations = plan.candidates.map(validateSoftLaunchSafeFixReleaseCandidate);
  const blockers = validations.flatMap((entry) => entry.blockers);
  const warnings = validations.flatMap((entry) => entry.warnings);
  const decision = createSoftLaunchSafeFixReleaseDecision(plan);

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0 && ["ready_for_safe_release", "ready_after_owner_review", "manual_review_required", "defer"].includes(decision),
    decision,
    plan,
    candidateCount: plan.candidates.length,
    safeReleaseCount: plan.safeLocalFixes.length,
    manualReviewCount: plan.manualReviewFixes.length,
    blockedCount: plan.blockedFixes.length,
    deferredCount: plan.deferredFixes.length,
    blockers,
    warnings,
    noFixesAppliedAutomatically: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
