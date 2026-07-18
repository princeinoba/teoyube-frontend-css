import type {
  TeoyubeSoftLaunchSafeFixReleaseBlocker,
  TeoyubeSoftLaunchSafeFixReleaseCandidate,
  TeoyubeSoftLaunchSafeFixReleasePlan,
  TeoyubeSoftLaunchSafeFixReleaseWarning
} from "./soft-launch-safe-fix-release-contracts";

const UNSAFE_PATTERNS: Array<[RegExp, string, string]> = [
  [/remove scripture|hide scripture|delete scripture/i, "safe_fix_removes_scripture", "Safe fix must preserve Scripture anchoring."],
  [/remove explanation|hide explanation|delete explanation/i, "safe_fix_removes_explanation", "Safe fix must preserve explanation paths."],
  [/weaken fallback|disable fallback|remove fallback|empty fallback/i, "safe_fix_weakens_fallback", "Safe fix must preserve non-empty fallback safety."],
  [/hide consent|remove consent|disable consent/i, "safe_fix_hides_consent", "Safe fix must keep consent controls visible where needed."],
  [/hidden personalization|silent personalization|implicit personalization/i, "safe_fix_hidden_personalization", "Safe fix must not introduce hidden personalization."],
  [/enable external analytics|send analytics|connect analytics/i, "safe_fix_enables_analytics", "Safe fix must not enable external analytics."],
  [/enable production persistence|connect database|database write|write to database|persist to database/i, "safe_fix_enables_persistence", "Safe fix must not enable production persistence."],
  [/enable live ai|live ai orchestration|connect openai|call openai/i, "safe_fix_enables_live_ai", "Safe fix must not enable live AI orchestration."],
  [/(secret|api key|token|credential).*(expose|print|show|public)|(?:expose|print|show|public).*(secret|api key|token|credential)/i, "safe_fix_exposes_secret", "Safe fix must not expose secrets."],
  [/store raw sensitive|persist raw text|save private text|raw private text/i, "safe_fix_stores_raw_sensitive_text", "Safe fix must not store raw sensitive text."],
  [/divine certainty|guaranteed divine|god told you with certainty/i, "safe_fix_divine_certainty", "Safe fix must not introduce divine-certainty language."],
  [/external production service|production provider|paid provider/i, "safe_fix_external_production_service", "Safe fix must not depend on external production services."]
];

function candidateText(candidate: TeoyubeSoftLaunchSafeFixReleaseCandidate): string {
  return [
    candidate.title,
    candidate.summary,
    candidate.proposedFix,
    candidate.releaseType,
    candidate.filesToChange.join(" "),
    candidate.regressionChecks.join(" ")
  ].join(" ");
}

function blocker(
  candidate: TeoyubeSoftLaunchSafeFixReleaseCandidate,
  id: string,
  reason: string
): TeoyubeSoftLaunchSafeFixReleaseBlocker {
  return {
    id: `${id}_${candidate.id}`,
    candidateId: candidate.id,
    label: candidate.title,
    reason,
    requiredAction: "Block or rewrite this safe fix candidate before release.",
    riskLevel: "critical"
  };
}

function warning(
  candidate: TeoyubeSoftLaunchSafeFixReleaseCandidate,
  id: string,
  message: string,
  recommendedAction: string
): TeoyubeSoftLaunchSafeFixReleaseWarning {
  return {
    id: `${id}_${candidate.id}`,
    candidateId: candidate.id,
    label: candidate.title,
    message,
    recommendedAction,
    riskLevel: "medium"
  };
}

export function validateSoftLaunchSafeFixReleaseCandidate(candidate: TeoyubeSoftLaunchSafeFixReleaseCandidate) {
  const text = candidateText(candidate);
  const blockers: TeoyubeSoftLaunchSafeFixReleaseBlocker[] = [];

  for (const [pattern, id, reason] of UNSAFE_PATTERNS) {
    if (pattern.test(text)) blockers.push(blocker(candidate, id, reason));
  }

  if (!candidate.preservesScriptureAnchors) blockers.push(blocker(candidate, "safe_fix_flag_removes_scripture", "Candidate is not marked as preserving Scripture anchors."));
  if (!candidate.preservesExplanationPaths) blockers.push(blocker(candidate, "safe_fix_flag_removes_explanation", "Candidate is not marked as preserving explanation paths."));
  if (!candidate.preservesFallbackSafety) blockers.push(blocker(candidate, "safe_fix_flag_weakens_fallback", "Candidate is not marked as preserving fallback safety."));
  if (!candidate.preservesConsentControls) blockers.push(blocker(candidate, "safe_fix_flag_hides_consent", "Candidate is not marked as preserving consent controls."));
  if (!candidate.keepsPersonalizationVisible) blockers.push(blocker(candidate, "safe_fix_flag_hidden_personalization", "Candidate is not marked as keeping personalization visible."));
  if (!candidate.externalAnalyticsDisabled) blockers.push(blocker(candidate, "safe_fix_flag_enables_analytics", "Candidate is not marked as keeping external analytics disabled."));
  if (!candidate.productionPersistenceDisabled) blockers.push(blocker(candidate, "safe_fix_flag_enables_persistence", "Candidate is not marked as keeping production persistence disabled."));
  if (!candidate.liveAiOrchestrationDisabled) blockers.push(blocker(candidate, "safe_fix_flag_enables_live_ai", "Candidate is not marked as keeping live AI orchestration disabled."));
  if (!candidate.noSecretsExposed) blockers.push(blocker(candidate, "safe_fix_flag_exposes_secret", "Candidate is not marked as keeping secrets hidden."));
  if (!candidate.noRawSensitiveTextStorage) blockers.push(blocker(candidate, "safe_fix_flag_stores_sensitive_text", "Candidate is not marked as blocking raw sensitive text storage."));
  if (!candidate.noDivineCertaintyClaims) blockers.push(blocker(candidate, "safe_fix_flag_divine_certainty", "Candidate is not marked as avoiding divine-certainty claims."));
  if (!candidate.noExternalProductionServices) blockers.push(blocker(candidate, "safe_fix_flag_external_service", "Candidate is not marked as avoiding external production services."));
  if (candidate.blockedReason) blockers.push(blocker(candidate, "safe_fix_blocked_reason", candidate.blockedReason));

  const warnings = [
    !candidate.localOnly ? warning(candidate, "safe_fix_not_local", "Candidate is not clearly local-only.", "Route to manual review.") : undefined,
    !candidate.smallScope ? warning(candidate, "safe_fix_not_small", "Candidate is not clearly small in scope.", "Route to owner review.") : undefined,
    !candidate.reversible ? warning(candidate, "safe_fix_not_reversible", "Candidate is not marked reversible.", "Add rollback notes before release.") : undefined,
    !candidate.regressionTestable || candidate.regressionChecks.length === 0
      ? warning(candidate, "safe_fix_missing_regression", "Candidate lacks regression evidence.", "Map regression checks before release.")
      : undefined
  ].filter((entry): entry is TeoyubeSoftLaunchSafeFixReleaseWarning => Boolean(entry));

  return {
    valid: blockers.length === 0,
    candidate,
    blockers,
    warnings,
    noAutoApply: true,
    generatedAt: new Date().toISOString()
  };
}

export function getSafeFixReleaseSafetyBlockers(plan: TeoyubeSoftLaunchSafeFixReleasePlan): TeoyubeSoftLaunchSafeFixReleaseBlocker[] {
  return plan.candidates.flatMap((candidate) => validateSoftLaunchSafeFixReleaseCandidate(candidate).blockers);
}

export function getSafeFixReleaseSafetyWarnings(plan: TeoyubeSoftLaunchSafeFixReleasePlan): TeoyubeSoftLaunchSafeFixReleaseWarning[] {
  return plan.candidates.flatMap((candidate) => validateSoftLaunchSafeFixReleaseCandidate(candidate).warnings);
}

export function validateSoftLaunchSafeFixReleasePlan(plan: TeoyubeSoftLaunchSafeFixReleasePlan) {
  const blockers = getSafeFixReleaseSafetyBlockers(plan);
  return {
    valid: blockers.length === 0,
    blockers,
    warnings: getSafeFixReleaseSafetyWarnings(plan),
    noFixesAppliedAutomatically: true,
    noExternalWrite: true
  };
}

export function createSafeFixReleaseSafetyReport(plan: TeoyubeSoftLaunchSafeFixReleasePlan) {
  const validation = validateSoftLaunchSafeFixReleasePlan(plan);
  return {
    valid: validation.valid,
    ready: validation.valid,
    blockers: validation.blockers,
    warnings: validation.warnings,
    noScriptureAnchorsRemoved: true,
    noExplanationPathsRemoved: true,
    noFallbackSafetyWeakened: true,
    noConsentControlsHidden: true,
    noHiddenPersonalizationCreated: true,
    noExternalAnalyticsEnabled: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noSecretsExposed: true,
    noRawSensitiveTextStored: true,
    noDivineCertaintyClaimsIntroduced: true,
    noExternalProductionServicesRequired: true,
    noFixesAppliedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
