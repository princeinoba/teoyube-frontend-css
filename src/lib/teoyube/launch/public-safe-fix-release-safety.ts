import type {
  TeoyubePublicSafeFixReleaseBlocker,
  TeoyubePublicSafeFixReleaseCandidate,
  TeoyubePublicSafeFixReleasePlan,
  TeoyubePublicSafeFixReleaseWarning
} from "./public-safe-fix-release-contracts";

const PUBLIC_SAFE_FIX_UNSAFE_TEXT_PATTERN =
  /(remove\s+scripture|drop\s+scripture|remove\s+explanation|disable\s+fallback|hide\s+consent|remove\s+consent|remove\s+privacy|remove\s+terms|enable\s+analytics|send\s+analytics|database|persist|store\s+raw|raw\s+sensitive|secret|api\s*key|live\s+ai|external\s+service|fetch\s+public\s+url|contact\s+users|auto(?:matically)?\s+collect|service\s+worker|native\s+app|divine\s+certainty|guarantee(?:d)?\s+by\s+god|legal\s+approval)/i;

function candidateBlocker(
  candidate: TeoyubePublicSafeFixReleaseCandidate,
  suffix: string,
  reason: string,
  requiredAction: string
): TeoyubePublicSafeFixReleaseBlocker {
  return {
    id: `public_safe_fix_safety_${suffix}_${candidate.id}`,
    candidateId: candidate.id,
    label: candidate.title,
    reason,
    requiredAction,
    riskLevel: "critical"
  };
}

export function getPublicSafeFixReleaseCandidateBlockers(candidate: TeoyubePublicSafeFixReleaseCandidate): TeoyubePublicSafeFixReleaseBlocker[] {
  return [
    candidate.status === "blocked" ? candidateBlocker(candidate, "blocked", candidate.blockedReason || "Candidate is blocked.", "Do not release this candidate without redesign and owner review.") : undefined,
    candidate.releaseType === "blocked" ? candidateBlocker(candidate, "blocked_type", "Candidate release type is blocked.", "Defer to manual owner review and redesign the fix.") : undefined,
    !candidate.localOnly ? candidateBlocker(candidate, "not_local", "Candidate is not local-only.", "Keep public safe fixes local, small, and reversible.") : undefined,
    !candidate.smallScope ? candidateBlocker(candidate, "not_small_scope", "Candidate is too broad for a public safe-fix release.", "Split or defer broad changes to a later owner-reviewed release.") : undefined,
    !candidate.reversible ? candidateBlocker(candidate, "not_reversible", "Candidate is not marked reversible.", "Do not release until rollback/reversal can be manually verified.") : undefined,
    !candidate.regressionTestable ? candidateBlocker(candidate, "not_regression_testable", "Candidate is not regression-testable.", "Add manual regression checks before release review.") : undefined,
    !candidate.preservesScriptureAnchors ? candidateBlocker(candidate, "scripture_anchor", "Candidate may remove or weaken Scripture anchors.", "Preserve Scripture anchors and re-run Scripture anchor regression.") : undefined,
    !candidate.preservesExplanationPaths ? candidateBlocker(candidate, "explanation_path", "Candidate may remove explanation paths.", "Preserve explanation paths and re-run explanation regression.") : undefined,
    !candidate.preservesFallbackSafety ? candidateBlocker(candidate, "fallback_safety", "Candidate may weaken fallback safety.", "Preserve fallback safety and re-run fallback regression.") : undefined,
    !candidate.preservesConfidenceLabels ? candidateBlocker(candidate, "confidence_labels", "Candidate may remove confidence labels.", "Preserve confidence labels and re-run confidence label regression.") : undefined,
    !candidate.preservesConsentControls ? candidateBlocker(candidate, "consent_controls", "Candidate may weaken consent controls.", "Preserve visible consent controls.") : undefined,
    !candidate.preservesPrivacyTermsConsentNotices ? candidateBlocker(candidate, "privacy_terms_consent", "Candidate may remove public privacy, terms, or consent notices.", "Preserve public privacy, terms, and consent notices.") : undefined,
    !candidate.hiddenPersonalizationDisabled ? candidateBlocker(candidate, "hidden_personalization", "Candidate may create hidden personalization.", "Keep personalization visible, consented, and owner-reviewed.") : undefined,
    !candidate.externalAnalyticsDisabled ? candidateBlocker(candidate, "analytics", "Candidate may enable external analytics.", "Keep analytics disabled until explicit provider approval.") : undefined,
    !candidate.productionPersistenceDisabled ? candidateBlocker(candidate, "persistence", "Candidate may enable production persistence.", "Keep database persistence out of public safe-fix release code.") : undefined,
    !candidate.liveAiOrchestrationDisabled ? candidateBlocker(candidate, "live_ai", "Candidate may enable live AI orchestration.", "Keep live AI orchestration disabled.") : undefined,
    !candidate.noSecretsExposed ? candidateBlocker(candidate, "secrets", "Candidate may expose secrets.", "Remove secret handling and keep secret values out of code.") : undefined,
    !candidate.noRawSensitiveTextStorage ? candidateBlocker(candidate, "raw_sensitive_text", "Candidate may store raw sensitive personalization text.", "Keep feedback and personalization data redacted/manual only.") : undefined,
    !candidate.noDivineCertaintyClaims ? candidateBlocker(candidate, "divine_certainty", "Candidate may introduce divine certainty claims.", "Preserve humility, confidence labels, and explanation paths.") : undefined,
    !candidate.noLegalApprovalClaimedWithoutRecord ? candidateBlocker(candidate, "legal_approval", "Candidate may claim legal approval without a record.", "Keep legal readiness as manual owner-reviewed evidence.") : undefined,
    !candidate.noExternalProductionServices ? candidateBlocker(candidate, "external_services", "Candidate may require external production services.", "Keep public safe fixes provider-free and manual.") : undefined,
    PUBLIC_SAFE_FIX_UNSAFE_TEXT_PATTERN.test(candidate.proposedFix) ? candidateBlocker(candidate, "unsafe_text", "Candidate text describes an unsafe or out-of-scope public launch change.", "Rewrite or defer the change before release review.") : undefined
  ].filter(Boolean) as TeoyubePublicSafeFixReleaseBlocker[];
}

export function getPublicSafeFixReleaseCandidateWarnings(candidate: TeoyubePublicSafeFixReleaseCandidate): TeoyubePublicSafeFixReleaseWarning[] {
  return [
    candidate.ownerReviewRequired ? {
      id: `public_safe_fix_safety_owner_review_${candidate.id}`,
      candidateId: candidate.id,
      label: candidate.title,
      message: "Candidate requires owner review before release.",
      recommendedAction: "Keep the candidate in manual review until the owner accepts it.",
      riskLevel: candidate.riskLevel === "critical" ? "high" : "medium"
    } : undefined,
    candidate.filesToChange.length === 0 ? {
      id: `public_safe_fix_safety_files_missing_${candidate.id}`,
      candidateId: candidate.id,
      label: candidate.title,
      message: "Candidate does not list changed files.",
      recommendedAction: "Record files changed once a real fix is applied; leave empty for documentation-only planning.",
      riskLevel: "low"
    } : undefined,
    candidate.regressionChecks.length === 0 ? {
      id: `public_safe_fix_safety_regression_missing_${candidate.id}`,
      candidateId: candidate.id,
      label: candidate.title,
      message: "Candidate has no regression checks.",
      recommendedAction: "Add public launch regression checks before release review.",
      riskLevel: "medium"
    } : undefined
  ].filter(Boolean) as TeoyubePublicSafeFixReleaseWarning[];
}

export function validatePublicSafeFixReleaseCandidate(candidate: TeoyubePublicSafeFixReleaseCandidate) {
  const blockers = getPublicSafeFixReleaseCandidateBlockers(candidate);
  const warnings = getPublicSafeFixReleaseCandidateWarnings(candidate);
  return { valid: blockers.length === 0, ready: blockers.length === 0 && !candidate.deferred, blockers, warnings };
}

function createEmptyPublicSafeFixReleasePlan(): TeoyubePublicSafeFixReleasePlan {
  return {
    id: "public_safe_fix_release_plan_empty_6_4",
    label: "Public Safe Fix Release Plan",
    candidates: [],
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
    generatedAt: new Date().toISOString()
  };
}

export function createPublicSafeFixReleaseSafetyReport(plan: TeoyubePublicSafeFixReleasePlan = createEmptyPublicSafeFixReleasePlan()) {
  const validation = plan.candidates.map(validatePublicSafeFixReleaseCandidate);
  const blockers = validation.flatMap((entry) => entry.blockers);
  const warnings = validation.flatMap((entry) => entry.warnings);
  const requiredSafeBooleans = plan.candidates.every((candidate) =>
    candidate.preservesScriptureAnchors &&
    candidate.preservesExplanationPaths &&
    candidate.preservesFallbackSafety &&
    candidate.preservesConfidenceLabels &&
    candidate.preservesConsentControls &&
    candidate.preservesPrivacyTermsConsentNotices &&
    candidate.hiddenPersonalizationDisabled &&
    candidate.externalAnalyticsDisabled &&
    candidate.productionPersistenceDisabled &&
    candidate.liveAiOrchestrationDisabled &&
    candidate.noSecretsExposed &&
    candidate.noRawSensitiveTextStorage &&
    candidate.noDivineCertaintyClaims &&
    candidate.noLegalApprovalClaimedWithoutRecord &&
    candidate.noExternalProductionServices
  );

  return {
    valid: blockers.length === 0 && requiredSafeBooleans,
    ready: blockers.length === 0 && requiredSafeBooleans,
    plan,
    candidateCount: plan.candidates.length,
    blockers,
    warnings,
    noScriptureAnchorsRemoved: plan.candidates.every((candidate) => candidate.preservesScriptureAnchors),
    noExplanationPathsRemoved: plan.candidates.every((candidate) => candidate.preservesExplanationPaths),
    noFallbackSafetyRemoved: plan.candidates.every((candidate) => candidate.preservesFallbackSafety),
    noConfidenceLabelsRemoved: plan.candidates.every((candidate) => candidate.preservesConfidenceLabels),
    noConsentControlsRemoved: plan.candidates.every((candidate) => candidate.preservesConsentControls),
    noPrivacyTermsConsentNoticesRemoved: plan.candidates.every((candidate) => candidate.preservesPrivacyTermsConsentNotices),
    noHiddenPersonalizationCreated: plan.candidates.every((candidate) => candidate.hiddenPersonalizationDisabled),
    noExternalAnalyticsEnabled: plan.candidates.every((candidate) => candidate.externalAnalyticsDisabled),
    noProductionPersistenceEnabled: plan.candidates.every((candidate) => candidate.productionPersistenceDisabled),
    noLiveAiOrchestrationEnabled: plan.candidates.every((candidate) => candidate.liveAiOrchestrationDisabled),
    noSecretsExposed: plan.candidates.every((candidate) => candidate.noSecretsExposed),
    noRawSensitiveTextStored: plan.candidates.every((candidate) => candidate.noRawSensitiveTextStorage),
    noDivineCertaintyClaims: plan.candidates.every((candidate) => candidate.noDivineCertaintyClaims),
    noLegalApprovalClaimedWithoutRecord: plan.candidates.every((candidate) => candidate.noLegalApprovalClaimedWithoutRecord),
    noExternalProductionServicesRequired: plan.candidates.every((candidate) => candidate.noExternalProductionServices),
    noFixesAppliedAutomatically: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noPublicUrlFetched: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
