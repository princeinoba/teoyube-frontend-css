import {
  createSafeFixCandidateEvaluationReport,
  createSafeFixCandidateFromIssue,
  evaluateManualPreviewSafeFixCandidate
} from "./manual-preview-safe-fix-candidate-evaluator";
import type {
  TeoyubeManualPreviewIssue,
  TeoyubeManualPreviewIssueFixPlan
} from "./manual-preview-issue-triage-contracts";
import type {
  TeoyubeManualPreviewSafeFixCandidate,
  TeoyubeManualPreviewSafeFixDecision,
  TeoyubeManualPreviewSafeFixReport
} from "./manual-preview-safe-fix-contracts";

export type TeoyubeManualPreviewSafeFixPlan = {
  id: string;
  candidates: TeoyubeManualPreviewSafeFixCandidate[];
  safeLocalFixes: TeoyubeManualPreviewSafeFixCandidate[];
  manualReviewFixes: TeoyubeManualPreviewSafeFixCandidate[];
  blockedFixes: TeoyubeManualPreviewSafeFixCandidate[];
  deferredFixes: TeoyubeManualPreviewSafeFixCandidate[];
  noAutoApply: true;
  noExternalWrite: true;
  createdAt: string;
};

function decisionFor(candidate: TeoyubeManualPreviewSafeFixCandidate): TeoyubeManualPreviewSafeFixDecision {
  return evaluateManualPreviewSafeFixCandidate(candidate).decision;
}

export function createManualPreviewSafeFixPlan(
  issues: TeoyubeManualPreviewIssue[],
  fixPlans: TeoyubeManualPreviewIssueFixPlan[]
): TeoyubeManualPreviewSafeFixPlan {
  const candidates = issues
    .map((issue) => {
      const fixPlan = fixPlans.find((plan) => plan.issueId === issue.id);
      return fixPlan ? createSafeFixCandidateFromIssue(issue, fixPlan) : undefined;
    })
    .filter((candidate): candidate is TeoyubeManualPreviewSafeFixCandidate => Boolean(candidate));

  return {
    id: "manual_preview_safe_fix_plan",
    candidates,
    safeLocalFixes: candidates.filter((candidate) => decisionFor(candidate) === "safe_to_apply"),
    manualReviewFixes: candidates.filter((candidate) => decisionFor(candidate) === "manual_review_required"),
    blockedFixes: candidates.filter((candidate) => decisionFor(candidate) === "blocked"),
    deferredFixes: candidates.filter((candidate) => decisionFor(candidate) === "defer"),
    noAutoApply: true,
    noExternalWrite: true,
    createdAt: new Date().toISOString()
  };
}

export function getSafeFixesReadyToApply(plan: TeoyubeManualPreviewSafeFixPlan): TeoyubeManualPreviewSafeFixCandidate[] {
  return plan.safeLocalFixes;
}

export function getSafeFixesRequiringManualReview(plan: TeoyubeManualPreviewSafeFixPlan): TeoyubeManualPreviewSafeFixCandidate[] {
  return plan.manualReviewFixes;
}

export function getBlockedSafeFixes(plan: TeoyubeManualPreviewSafeFixPlan): TeoyubeManualPreviewSafeFixCandidate[] {
  return plan.blockedFixes;
}

export function getDeferredSafeFixes(plan: TeoyubeManualPreviewSafeFixPlan): TeoyubeManualPreviewSafeFixCandidate[] {
  return plan.deferredFixes;
}

export function createManualPreviewSafeFixPlanReport(plan: TeoyubeManualPreviewSafeFixPlan): TeoyubeManualPreviewSafeFixReport {
  const evaluation = createSafeFixCandidateEvaluationReport(plan.candidates);

  return {
    valid: evaluation.blockers.length === 0,
    decision:
      plan.blockedFixes.length > 0
        ? "blocked"
        : plan.safeLocalFixes.length > 0
          ? "safe_to_apply"
          : plan.manualReviewFixes.length > 0
            ? "manual_review_required"
            : plan.deferredFixes.length > 0
              ? "defer"
              : "unknown",
    candidateCount: plan.candidates.length,
    safeToApplyCount: plan.safeLocalFixes.length,
    manualReviewCount: plan.manualReviewFixes.length,
    blockedCount: plan.blockedFixes.length,
    deferredCount: plan.deferredFixes.length,
    candidates: plan.candidates,
    blockers: evaluation.blockers,
    warnings: evaluation.warnings,
    noFixesAppliedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
