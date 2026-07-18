import type {
  TeoyubeManualPreviewIssue,
  TeoyubeManualPreviewIssueFixPlan
} from "./manual-preview-issue-triage-contracts";
import type {
  TeoyubeManualPreviewSafeFixBlocker,
  TeoyubeManualPreviewSafeFixCandidate,
  TeoyubeManualPreviewSafeFixDecision,
  TeoyubeManualPreviewSafeFixType,
  TeoyubeManualPreviewSafeFixWarning
} from "./manual-preview-safe-fix-contracts";

function textFromCandidate(candidate: TeoyubeManualPreviewSafeFixCandidate): string {
  return [
    candidate.summary,
    candidate.fixPlan.recommendedFixSummary,
    ...candidate.fixPlan.safeImplementationNotes,
    ...candidate.fixPlan.steps.map((step) => `${step.label} ${step.details}`)
  ].join(" ").toLowerCase();
}

function fixTypeFromIssue(issue: TeoyubeManualPreviewIssue, fixPlan: TeoyubeManualPreviewIssueFixPlan): TeoyubeManualPreviewSafeFixType {
  if (fixPlan.issueCategory === "mobile_ui") return "ui_layout_patch";
  if (fixPlan.issueCategory === "accessibility") return "accessibility_patch";
  if (fixPlan.issueCategory === "content_clarity") return "copy_clarity_patch";
  if (fixPlan.issueCategory === "fallback") return "fallback_display_patch";
  if (fixPlan.issueCategory === "debug_safety") return "debug_visibility_patch";
  if (fixPlan.issueCategory === "build" || fixPlan.issueCategory === "tig_response") return "type_error_fix";
  if (fixPlan.issueCategory === "unknown") return "manual_only";
  if (issue.deferrable) return "documentation_fix";
  return fixPlan.ownerReviewRequired ? "manual_only" : "documentation_fix";
}

function defaultFiles(issue: TeoyubeManualPreviewIssue, fixType: TeoyubeManualPreviewSafeFixType): string[] {
  if (fixType === "documentation_fix") return ["docs/teoyube"];
  if (fixType === "ui_layout_patch" || fixType === "accessibility_patch") return issue.surface ? [`src/components/${issue.surface}`] : ["src/components"];
  if (fixType === "export_fix" || fixType === "type_error_fix") return ["src/lib/teoyube/launch"];
  return issue.surface ? [issue.surface] : [];
}

export function createSafeFixCandidateFromIssue(
  issue: TeoyubeManualPreviewIssue,
  fixPlan: TeoyubeManualPreviewIssueFixPlan
): TeoyubeManualPreviewSafeFixCandidate {
  const fixType = fixTypeFromIssue(issue, fixPlan);
  const localOnly = !["manual_only", "blocked", "unknown"].includes(fixType);
  const smallScope = fixPlan.riskLevel === "low" || fixPlan.riskLevel === "medium";
  const ownerReviewBlocksAutomation = fixPlan.ownerReviewRequired || fixPlan.softLaunchBlocker;

  return {
    id: `safe_fix_candidate_${issue.id}`.replace(/[^a-zA-Z0-9_-]/g, "_"),
    issue,
    fixPlan,
    fixType,
    riskLevel: fixPlan.riskLevel,
    summary: fixPlan.recommendedFixSummary,
    filesToChange: defaultFiles(issue, fixType),
    localOnly,
    smallScope,
    reversible: true,
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
    regressionChecks: fixPlan.regressionChecks,
    status: ownerReviewBlocksAutomation ? "planned" : "candidate",
    createdAt: new Date().toISOString()
  };
}

function blocker(
  candidate: TeoyubeManualPreviewSafeFixCandidate,
  id: string,
  message: string,
  requiredAction: string
): TeoyubeManualPreviewSafeFixBlocker {
  return {
    id,
    candidateId: candidate.id,
    message,
    requiredAction,
    riskLevel: "critical"
  };
}

function warning(
  candidate: TeoyubeManualPreviewSafeFixCandidate,
  id: string,
  message: string,
  recommendedAction: string
): TeoyubeManualPreviewSafeFixWarning {
  return {
    id,
    candidateId: candidate.id,
    message,
    recommendedAction
  };
}

export function getSafeFixCandidateBlockers(candidate: TeoyubeManualPreviewSafeFixCandidate): TeoyubeManualPreviewSafeFixBlocker[] {
  const text = textFromCandidate(candidate);
  const blockers: TeoyubeManualPreviewSafeFixBlocker[] = [];

  if (!candidate.preservesScriptureAnchors || /remove scripture|hide scripture|delete scripture/.test(text)) {
    blockers.push(blocker(candidate, "safe_fix_removes_scripture_anchor", "Candidate may remove Scripture anchors.", "Revise the fix to preserve Scripture anchors."));
  }
  if (!candidate.preservesExplanationPaths || /remove explanation|hide explanation|delete explanation/.test(text)) {
    blockers.push(blocker(candidate, "safe_fix_removes_explanation_path", "Candidate may remove explanation paths.", "Revise the fix to preserve explanation paths."));
  }
  if (!candidate.preservesFallbackSafety || /disable fallback|remove fallback|empty fallback|weaken fallback/.test(text)) {
    blockers.push(blocker(candidate, "safe_fix_weakens_fallback", "Candidate may weaken fallback safety.", "Keep fallbacks Scripture-anchored and non-empty."));
  }
  if (!candidate.preservesConsentControls || /hide consent|remove consent|disable consent/.test(text)) {
    blockers.push(blocker(candidate, "safe_fix_hides_consent", "Candidate may hide consent controls.", "Keep consent controls visible or disable personalization on that surface."));
  }
  if (!candidate.keepsPersonalizationVisible || /hidden personalization|silent personalization|implicit personalization/.test(text)) {
    blockers.push(blocker(candidate, "safe_fix_hidden_personalization", "Candidate may introduce hidden personalization.", "Keep personalization visible and reversible."));
  }
  if (!candidate.externalAnalyticsDisabled || /enable external analytics|send analytics|connect analytics/.test(text)) {
    blockers.push(blocker(candidate, "safe_fix_enables_analytics", "Candidate may enable external analytics.", "Keep analytics disconnected in this step."));
  }
  if (!candidate.productionPersistenceDisabled || /enable production persistence|connect database|database write|write to database/.test(text)) {
    blockers.push(blocker(candidate, "safe_fix_enables_persistence", "Candidate may enable production persistence.", "Keep database persistence disconnected in this step."));
  }
  if (!candidate.liveAiOrchestrationDisabled || /enable live ai|live ai orchestration|connect openai/.test(text)) {
    blockers.push(blocker(candidate, "safe_fix_enables_live_ai", "Candidate may enable live AI orchestration.", "Keep live AI orchestration disabled in this step."));
  }
  if (!candidate.noSecretsExposed || /secret|token|api key|credential/.test(text) && /expose|print|show|public/.test(text)) {
    blockers.push(blocker(candidate, "safe_fix_exposes_secret", "Candidate may expose secret-like data.", "Use placeholders and keep secrets out of source files."));
  }
  if (!candidate.noRawSensitiveTextStorage || /store raw sensitive|persist raw text|save private text/.test(text)) {
    blockers.push(blocker(candidate, "safe_fix_stores_sensitive_text", "Candidate may store raw sensitive text.", "Store only privacy-safe summaries."));
  }
  if (!candidate.noDivineCertaintyClaims || /divine certainty|god told you with certainty|guaranteed divine/.test(text)) {
    blockers.push(blocker(candidate, "safe_fix_claims_divine_certainty", "Candidate may claim divine certainty.", "Keep language bounded and Scripture-grounded."));
  }

  return blockers;
}

export function getSafeFixCandidateWarnings(candidate: TeoyubeManualPreviewSafeFixCandidate): TeoyubeManualPreviewSafeFixWarning[] {
  return [
    !candidate.localOnly
      ? warning(candidate, "safe_fix_not_local", "Candidate is not clearly local-only.", "Require manual review before implementation.")
      : undefined,
    !candidate.smallScope
      ? warning(candidate, "safe_fix_not_small_scope", "Candidate is not clearly small in scope.", "Require manual review before implementation.")
      : undefined,
    !candidate.reversible
      ? warning(candidate, "safe_fix_not_reversible", "Candidate is not marked reversible.", "Create a rollback note before implementation.")
      : undefined,
    candidate.regressionChecks.length === 0
      ? warning(candidate, "safe_fix_missing_regression_checks", "Candidate has no regression checks.", "Map regression checks before implementation.")
      : undefined
  ].filter((entry): entry is TeoyubeManualPreviewSafeFixWarning => Boolean(entry));
}

export function requiresManualReviewForFix(candidate: TeoyubeManualPreviewSafeFixCandidate): boolean {
  return candidate.fixPlan.ownerReviewRequired || candidate.fixPlan.softLaunchBlocker || getSafeFixCandidateWarnings(candidate).length > 0;
}

export function isSafeToApplyManualPreviewFix(candidate: TeoyubeManualPreviewSafeFixCandidate): boolean {
  return getSafeFixCandidateBlockers(candidate).length === 0 &&
    !requiresManualReviewForFix(candidate) &&
    candidate.localOnly &&
    candidate.smallScope &&
    candidate.reversible;
}

export function evaluateManualPreviewSafeFixCandidate(candidate: TeoyubeManualPreviewSafeFixCandidate) {
  const blockers = getSafeFixCandidateBlockers(candidate);
  const warnings = getSafeFixCandidateWarnings(candidate);
  const decision: TeoyubeManualPreviewSafeFixDecision =
    blockers.length > 0
      ? "blocked"
      : isSafeToApplyManualPreviewFix(candidate)
        ? "safe_to_apply"
        : candidate.issue.deferrable
          ? "defer"
          : warnings.length > 0 || requiresManualReviewForFix(candidate)
            ? "manual_review_required"
            : "unknown";

  return {
    valid: blockers.length === 0,
    candidate,
    decision,
    blockers,
    warnings,
    generatedAt: new Date().toISOString()
  };
}

export function createSafeFixCandidateEvaluationReport(candidates: TeoyubeManualPreviewSafeFixCandidate[]) {
  const evaluations = candidates.map(evaluateManualPreviewSafeFixCandidate);
  const blockers = evaluations.flatMap((entry) => entry.blockers);
  const warnings = evaluations.flatMap((entry) => entry.warnings);

  return {
    valid: blockers.length === 0,
    candidateCount: candidates.length,
    safeToApplyCount: evaluations.filter((entry) => entry.decision === "safe_to_apply").length,
    manualReviewCount: evaluations.filter((entry) => entry.decision === "manual_review_required").length,
    blockedCount: evaluations.filter((entry) => entry.decision === "blocked").length,
    deferredCount: evaluations.filter((entry) => entry.decision === "defer").length,
    evaluations,
    blockers,
    warnings,
    noFixesAppliedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
