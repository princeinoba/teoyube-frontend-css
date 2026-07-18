import type { TeoyubePublicFixQueue } from "./public-fix-queue-contracts";
import type { TeoyubePublicFeedbackTriageCategory, TeoyubePublicFixQueueItem } from "./public-feedback-triage-contracts";
import type {
  TeoyubePublicSafeFixReleaseBlocker,
  TeoyubePublicSafeFixReleaseCandidate,
  TeoyubePublicSafeFixReleaseDecision,
  TeoyubePublicSafeFixReleasePlan,
  TeoyubePublicSafeFixReleaseReport,
  TeoyubePublicSafeFixReleaseRiskLevel,
  TeoyubePublicSafeFixReleaseType,
  TeoyubePublicSafeFixReleaseWarning
} from "./public-safe-fix-release-contracts";
import { validatePublicSafeFixReleaseCandidate } from "./public-safe-fix-release-safety";

const SAFE_PUBLIC_RELEASE_TYPES: TeoyubePublicSafeFixReleaseType[] = [
  "mobile_layout_patch",
  "accessibility_patch",
  "public_copy_patch",
  "content_clarity_patch",
  "privacy_notice_patch",
  "terms_notice_patch",
  "consent_visibility_patch",
  "fallback_display_patch",
  "offline_fallback_patch",
  "scripture_anchor_display_patch",
  "explanation_path_display_patch",
  "confidence_label_patch",
  "debug_visibility_patch",
  "export_fix",
  "type_error_fix",
  "test_fixture_fix",
  "documentation_fix"
];

const PUBLIC_SAFE_FIX_UNSAFE_PATTERN =
  /(remove\s+scripture|drop\s+scripture|remove\s+explanation|disable\s+fallback|hide\s+consent|remove\s+consent|remove\s+privacy|remove\s+terms|enable\s+analytics|send\s+analytics|database|persist|store\s+raw|raw\s+sensitive|secret|api\s*key|live\s+ai|external\s+service|fetch\s+public\s+url|contact\s+users|auto(?:matically)?\s+collect|service\s+worker|native\s+app|divine\s+certainty|guarantee(?:d)?\s+by\s+god|legal\s+approval)/i;

const PUBLIC_SAFE_FIX_MANUAL_PATTERN =
  /(provider|database|analytics|live\s+ai|native\s+app|service\s+worker|architecture|migration|public\s+url|rollback|deployment)/i;

function normalizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "public_safe_fix";
}

export function classifyPublicSafeFixReleaseType(item: TeoyubePublicFixQueueItem): TeoyubePublicSafeFixReleaseType {
  const proposedFix = item.proposedFix || "";
  if (PUBLIC_SAFE_FIX_UNSAFE_PATTERN.test(proposedFix)) return "blocked";
  if (/export/i.test(proposedFix)) return "export_fix";
  if (/type\s*error|typescript|tsc/i.test(proposedFix)) return "type_error_fix";
  if (/fixture|test data/i.test(proposedFix)) return "test_fixture_fix";
  if (/doc|documentation|runbook/i.test(proposedFix)) return "documentation_fix";

  const mapped: Record<TeoyubePublicFeedbackTriageCategory, TeoyubePublicSafeFixReleaseType> = {
    privacy: "privacy_notice_patch",
    terms: "terms_notice_patch",
    consent: "consent_visibility_patch",
    scripture_anchor: "scripture_anchor_display_patch",
    explanation_path: "explanation_path_display_patch",
    fallback: "fallback_display_patch",
    confidence: "confidence_label_patch",
    mobile_ui: "mobile_layout_patch",
    accessibility: "accessibility_patch",
    content_clarity: "content_clarity_patch",
    prayer_sequence: "manual_only",
    promise_cluster: "manual_only",
    ai_companion: "manual_only",
    personalization_preview: "manual_only",
    offline_fallback: "offline_fallback_patch",
    debug_safety: "debug_visibility_patch",
    performance: "manual_only",
    public_copy: "public_copy_patch",
    positive_feedback: "manual_only",
    feature_request: "manual_only",
    unknown: "manual_only"
  };

  return mapped[item.category] || "unknown";
}

function inferPublicSafeFixRiskLevel(item: TeoyubePublicFixQueueItem): TeoyubePublicSafeFixReleaseRiskLevel {
  if (item.priority === "public_launch_blocker" || item.severity === "critical") return "critical";
  if (item.priority === "high" || item.severity === "high") return "high";
  if (item.priority === "medium" || item.severity === "medium") return "medium";
  if (item.priority === "low" || item.severity === "low") return "low";
  return "unknown";
}

function getPublicSafeFixRegressionChecks(item: TeoyubePublicFixQueueItem, releaseType: TeoyubePublicSafeFixReleaseType): string[] {
  return Array.from(new Set([
    ...item.verificationRequired,
    "public_scripture_anchor_regression",
    "public_explanation_path_regression",
    "public_fallback_safety_regression",
    "public_confidence_label_regression",
    "public_privacy_terms_consent_regression",
    releaseType === "mobile_layout_patch" ? "public_mobile_layout_regression" : "",
    releaseType === "accessibility_patch" ? "public_accessibility_regression" : "",
    releaseType === "offline_fallback_patch" ? "public_offline_fallback_regression" : "",
    "owner_review"
  ].filter(Boolean)));
}

export function createPublicSafeFixReleaseCandidateFromFixQueueItem(
  item: TeoyubePublicFixQueueItem,
  input: Partial<TeoyubePublicSafeFixReleaseCandidate> = {}
): TeoyubePublicSafeFixReleaseCandidate {
  const releaseType = input.releaseType || classifyPublicSafeFixReleaseType(item);
  const unsafe = releaseType === "blocked" || PUBLIC_SAFE_FIX_UNSAFE_PATTERN.test(item.proposedFix || "");
  const manualOnly = releaseType === "manual_only" || PUBLIC_SAFE_FIX_MANUAL_PATTERN.test(item.proposedFix || "");
  const riskLevel = input.riskLevel || inferPublicSafeFixRiskLevel(item);
  const ownerReviewRequired = input.ownerReviewRequired ?? (manualOnly || riskLevel === "high" || riskLevel === "critical" || item.publicLaunchCritical || item.publicSafetyCritical);
  const deferred = input.deferred ?? item.priority === "defer" || item.status === "deferred";

  return {
    id: input.id || normalizeId(`public_safe_fix_${item.id}`),
    sourceFixQueueItemId: item.id,
    sourceFixQueueItem: item,
    title: input.title || item.title,
    releaseType,
    riskLevel,
    summary: input.summary || `Prepare a public safe-fix release candidate for ${item.title}.`,
    proposedFix: input.proposedFix || item.proposedFix,
    filesToChange: input.filesToChange || [],
    localOnly: input.localOnly ?? true,
    smallScope: input.smallScope ?? !manualOnly,
    reversible: input.reversible ?? true,
    regressionTestable: input.regressionTestable ?? item.verificationRequired.length > 0,
    manualOnly: true,
    preservesScriptureAnchors: input.preservesScriptureAnchors ?? !/remove\s+scripture|drop\s+scripture/i.test(item.proposedFix || ""),
    preservesExplanationPaths: input.preservesExplanationPaths ?? !/remove\s+explanation/i.test(item.proposedFix || ""),
    preservesFallbackSafety: input.preservesFallbackSafety ?? !/disable\s+fallback/i.test(item.proposedFix || ""),
    preservesConfidenceLabels: input.preservesConfidenceLabels ?? !/remove\s+confidence|hide\s+confidence/i.test(item.proposedFix || ""),
    preservesConsentControls: input.preservesConsentControls ?? !/hide\s+consent|remove\s+consent/i.test(item.proposedFix || ""),
    preservesPrivacyTermsConsentNotices: input.preservesPrivacyTermsConsentNotices ?? !/remove\s+privacy|remove\s+terms|remove\s+consent/i.test(item.proposedFix || ""),
    hiddenPersonalizationDisabled: input.hiddenPersonalizationDisabled ?? !/hidden\s+personalization/i.test(item.proposedFix || ""),
    externalAnalyticsDisabled: input.externalAnalyticsDisabled ?? !/enable\s+analytics|send\s+analytics/i.test(item.proposedFix || ""),
    productionPersistenceDisabled: input.productionPersistenceDisabled ?? !/database|persist|storage/i.test(item.proposedFix || ""),
    liveAiOrchestrationDisabled: input.liveAiOrchestrationDisabled ?? !/live\s+ai|orchestration/i.test(item.proposedFix || ""),
    noSecretsExposed: input.noSecretsExposed ?? !/secret|api\s*key|token/i.test(item.proposedFix || ""),
    noRawSensitiveTextStorage: input.noRawSensitiveTextStorage ?? !/store\s+raw|raw\s+sensitive/i.test(item.proposedFix || ""),
    noDivineCertaintyClaims: input.noDivineCertaintyClaims ?? !/divine\s+certainty|guarantee(?:d)?\s+by\s+god/i.test(item.proposedFix || ""),
    noLegalApprovalClaimedWithoutRecord: input.noLegalApprovalClaimedWithoutRecord ?? !/legal\s+approval/i.test(item.proposedFix || ""),
    noExternalProductionServices: input.noExternalProductionServices ?? !/external\s+service|provider|fetch\s+public\s+url/i.test(item.proposedFix || ""),
    ownerReviewRequired,
    deferred,
    blockedReason: input.blockedReason || (unsafe ? "Public safe-fix candidate proposes an unsafe or out-of-scope production change." : undefined),
    regressionChecks: input.regressionChecks || getPublicSafeFixRegressionChecks(item, releaseType),
    status: input.status || (unsafe ? "blocked" : deferred ? "deferred" : item.status === "blocked" ? "blocked" : "candidate"),
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function getPublicSafeFixReleaseCandidates(plan: TeoyubePublicSafeFixReleasePlan): TeoyubePublicSafeFixReleaseCandidate[] {
  return plan.candidates.filter((candidate) =>
    SAFE_PUBLIC_RELEASE_TYPES.includes(candidate.releaseType) &&
    !candidate.ownerReviewRequired &&
    !candidate.deferred &&
    candidate.status !== "blocked" &&
    validatePublicSafeFixReleaseCandidate(candidate).valid
  );
}

export function getPublicSafeFixManualReviewCandidates(plan: TeoyubePublicSafeFixReleasePlan): TeoyubePublicSafeFixReleaseCandidate[] {
  return plan.candidates.filter((candidate) =>
    candidate.ownerReviewRequired ||
    candidate.releaseType === "manual_only" ||
    candidate.riskLevel === "high" ||
    candidate.riskLevel === "critical"
  );
}

export function getPublicSafeFixBlockedCandidates(plan: TeoyubePublicSafeFixReleasePlan): TeoyubePublicSafeFixReleaseCandidate[] {
  return plan.candidates.filter((candidate) => candidate.status === "blocked" || !validatePublicSafeFixReleaseCandidate(candidate).valid);
}

export function getPublicSafeFixDeferredCandidates(plan: TeoyubePublicSafeFixReleasePlan): TeoyubePublicSafeFixReleaseCandidate[] {
  return plan.candidates.filter((candidate) => candidate.deferred || candidate.status === "deferred");
}

export function createPublicSafeFixReleasePlan(
  fixQueue?: TeoyubePublicFixQueue,
  input: Partial<TeoyubePublicSafeFixReleasePlan> = {}
): TeoyubePublicSafeFixReleasePlan {
  const candidates = input.candidates || (fixQueue?.items || []).map((item) => createPublicSafeFixReleaseCandidateFromFixQueueItem(item));
  const basePlan: TeoyubePublicSafeFixReleasePlan = {
    id: input.id || "public_safe_fix_release_plan_6_4",
    label: input.label || "Public Safe Fix Release Plan",
    sourceFixQueueId: input.sourceFixQueueId || fixQueue?.id,
    sourceFixQueue: input.sourceFixQueue || fixQueue,
    candidates,
    safeLocalFixes: [],
    manualReviewFixes: [],
    blockedFixes: [],
    deferredFixes: [],
    manualOnly: true,
    inMemoryOnly: true,
    noAutoApply: true,
    fileWritten: false,
    databaseWritten: false,
    analyticsSent: false,
    externalServicesCalled: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    publicUrlFetched: false,
    liveAiOrchestrationEnabled: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };

  return {
    ...basePlan,
    safeLocalFixes: input.safeLocalFixes || getPublicSafeFixReleaseCandidates(basePlan),
    manualReviewFixes: input.manualReviewFixes || getPublicSafeFixManualReviewCandidates(basePlan),
    blockedFixes: input.blockedFixes || getPublicSafeFixBlockedCandidates(basePlan),
    deferredFixes: input.deferredFixes || getPublicSafeFixDeferredCandidates(basePlan)
  };
}

export function getPublicSafeFixReleasePlanBlockers(plan: TeoyubePublicSafeFixReleasePlan): TeoyubePublicSafeFixReleaseBlocker[] {
  return [
    ...plan.blockedFixes.map((candidate) => ({
      id: `public_safe_fix_blocked_${candidate.id}`,
      candidateId: candidate.id,
      label: candidate.title,
      reason: candidate.blockedReason || "Public safe-fix candidate is blocked by safety validation.",
      requiredAction: "Defer this fix to manual owner review or redesign it to preserve all public launch safety controls.",
      riskLevel: "critical" as const
    })),
    plan.fileWritten ? { id: "public_safe_fix_plan_file_written", label: plan.label, reason: "Public safe-fix planning must not write files.", requiredAction: "Keep the release plan in memory.", riskLevel: "critical" as const } : undefined,
    plan.databaseWritten ? { id: "public_safe_fix_plan_database_written", label: plan.label, reason: "Public safe-fix planning must not write a database.", requiredAction: "Remove database writes.", riskLevel: "critical" as const } : undefined,
    plan.analyticsSent ? { id: "public_safe_fix_plan_analytics_sent", label: plan.label, reason: "Public safe-fix planning must not send analytics.", requiredAction: "Remove analytics sending.", riskLevel: "critical" as const } : undefined,
    plan.externalServicesCalled ? { id: "public_safe_fix_plan_external_service", label: plan.label, reason: "Public safe-fix planning must not call external services.", requiredAction: "Keep release planning local and manual.", riskLevel: "critical" as const } : undefined,
    plan.usersContacted ? { id: "public_safe_fix_plan_users_contacted", label: plan.label, reason: "Public safe-fix planning must not contact users.", requiredAction: "Keep user contact outside code.", riskLevel: "critical" as const } : undefined,
    plan.feedbackCollectedAutomatically ? { id: "public_safe_fix_plan_feedback_auto_collected", label: plan.label, reason: "Public safe-fix planning must not collect feedback automatically.", requiredAction: "Use manual feedback intake only.", riskLevel: "critical" as const } : undefined,
    plan.publicUrlFetched ? { id: "public_safe_fix_plan_url_fetched", label: plan.label, reason: "Public safe-fix planning must not fetch public URLs.", requiredAction: "Keep URL checks manual.", riskLevel: "critical" as const } : undefined,
    plan.liveAiOrchestrationEnabled ? { id: "public_safe_fix_plan_live_ai", label: plan.label, reason: "Public safe-fix planning must not enable live AI orchestration.", requiredAction: "Keep live AI orchestration disabled.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as TeoyubePublicSafeFixReleaseBlocker[];
}

export function getPublicSafeFixReleasePlanWarnings(plan: TeoyubePublicSafeFixReleasePlan): TeoyubePublicSafeFixReleaseWarning[] {
  return [
    ...plan.manualReviewFixes.map((candidate) => ({
      id: `public_safe_fix_manual_review_${candidate.id}`,
      candidateId: candidate.id,
      label: candidate.title,
      message: "Public safe-fix candidate requires manual owner review before release.",
      recommendedAction: "Review the candidate manually and keep all safety/privacy guardrails unchanged.",
      riskLevel: candidate.riskLevel === "critical" ? "high" as const : "medium" as const
    })),
    ...plan.deferredFixes.map((candidate) => ({
      id: `public_safe_fix_deferred_${candidate.id}`,
      candidateId: candidate.id,
      label: candidate.title,
      message: "Public safe-fix candidate is deferred.",
      recommendedAction: "Keep the deferred reason visible in the public launch daily review.",
      riskLevel: "low" as const
    }))
  ];
}

export function createPublicSafeFixReleaseDecision(plan: TeoyubePublicSafeFixReleasePlan): TeoyubePublicSafeFixReleaseDecision {
  const blockers = getPublicSafeFixReleasePlanBlockers(plan);
  if (blockers.length > 0) return "blocked";
  if (plan.safeLocalFixes.length > 0) return plan.manualReviewFixes.length > 0 ? "ready_after_owner_review" : "ready_for_safe_release";
  if (plan.manualReviewFixes.length > 0) return "manual_review_required";
  if (plan.deferredFixes.length > 0) return "defer";
  return "unknown";
}

export function createPublicSafeFixReleasePlanReport(plan: TeoyubePublicSafeFixReleasePlan = createPublicSafeFixReleasePlan()): TeoyubePublicSafeFixReleaseReport {
  const blockers = getPublicSafeFixReleasePlanBlockers(plan);
  const warnings = getPublicSafeFixReleasePlanWarnings(plan);
  const decision = createPublicSafeFixReleaseDecision(plan);
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
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
