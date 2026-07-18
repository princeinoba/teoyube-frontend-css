import {
  createSafeFixCandidateEvaluationReport,
  createSafeFixCandidateFromIssue,
  evaluateManualPreviewSafeFixCandidate
} from "../manual-preview-safe-fix-candidate-evaluator";
import { createManualPreviewFixPlan, createManualPreviewFixPlans } from "../manual-preview-fix-plan-generator";
import {
  createManualPreviewSafeFixPlan,
  createManualPreviewSafeFixPlanReport
} from "../manual-preview-safe-fix-planner";
import {
  createManualPreviewSafeFixRun,
  createManualPreviewSafeFixRunReport,
  recordManualPreviewSafeFixResult,
  recordManualPreviewSafeFixSkipped
} from "../manual-preview-safe-fix-result-recorder";
import {
  createManualPreviewRegressionReport,
  createManualPreviewRegressionRun,
  recordManualPreviewRegressionResult
} from "../manual-preview-regression-verification-runner";
import { createPostFixSafetyVerificationReport, getPostFixSafetyVerificationChecklist } from "../manual-preview-post-fix-safety-verification";
import { createPostFixSurfaceRegressionReport, getPostFixSurfaceRegressionChecklist } from "../manual-preview-post-fix-surface-regression";
import { verifyManualPreviewIssueResolutions } from "../manual-preview-issue-resolution-verification";
import { runManualPreviewSafeFixImplementationAudit } from "../manual-preview-safe-fix-implementation-audit";
import type {
  TeoyubeManualPreviewIssue,
  TeoyubeManualPreviewIssueFixPlan
} from "../manual-preview-issue-triage-contracts";

export function createManualPreviewDeployment24SampleIssues(): TeoyubeManualPreviewIssue[] {
  return [
    {
      id: "sample_reflection_copy_clarity",
      title: "Reflection copy needs clearer wording",
      details: "The reflection prompt is safe but should be clearer for a preview reviewer.",
      category: "content_clarity",
      severity: "low",
      source: "manual_owner_review",
      surface: "tig_response_panel",
      deferrable: false
    },
    {
      id: "sample_missing_scripture_anchor_manual_review",
      title: "Scripture anchor needs owner review before fix",
      details: "A launch-critical Scripture anchor issue must be reviewed before any code fix is applied.",
      category: "scripture_anchor",
      severity: "critical",
      source: "postdeployment_qa",
      surface: "tig_response_panel",
      launchCritical: true,
      safetyCritical: true,
      softLaunchBlocking: true
    }
  ];
}

function createUnsafeFixPlan(): TeoyubeManualPreviewIssueFixPlan {
  const issue: TeoyubeManualPreviewIssue = {
    id: "sample_unsafe_provider_fix",
    title: "Unsafe provider fix must be blocked",
    details: "Sample issue used to prove unsafe provider changes are blocked.",
    category: "privacy",
    severity: "high",
    source: "manual_owner_review",
    surface: "personalization_preview_panel",
    safetyCritical: true
  };
  const base = createManualPreviewFixPlan(issue);

  return {
    ...base,
    id: "sample_unsafe_provider_fix_plan",
    recommendedFixSummary: "Enable external analytics, connect database writes, and remove consent controls to simplify preview tracking.",
    safeImplementationNotes: [
      "This sample intentionally violates safe-fix rules.",
      "It should be blocked and never applied automatically."
    ],
    ownerReviewRequired: false,
    softLaunchBlocker: false,
    status: "ready_for_safe_fix"
  };
}

function passResult(checkId: string, type: string, summary: string, relatedFixResultId?: string, relatedIssueId?: string) {
  return {
    checkId,
    type: type as never,
    status: "pass" as const,
    summary,
    required: true,
    launchCritical: true,
    relatedFixResultId,
    relatedIssueId
  };
}

export function runManualPreviewDeployment24Example() {
  const issues = createManualPreviewDeployment24SampleIssues();
  const fixPlans = createManualPreviewFixPlans(issues);
  const safePlan = createManualPreviewSafeFixPlan(issues, fixPlans);
  const planReport = createManualPreviewSafeFixPlanReport(safePlan);
  const unsafeCandidate = createSafeFixCandidateFromIssue(
    {
      id: "sample_unsafe_provider_fix",
      title: "Unsafe provider fix must be blocked",
      details: "This sample fix would enable restricted services.",
      category: "privacy",
      severity: "high"
    },
    createUnsafeFixPlan()
  );
  const candidateEvaluation = createSafeFixCandidateEvaluationReport([...safePlan.candidates, unsafeCandidate]);
  const unsafeEvaluation = evaluateManualPreviewSafeFixCandidate(unsafeCandidate);
  const safeCandidate = safePlan.safeLocalFixes[0];
  const manualReviewCandidate = safePlan.manualReviewFixes[0];
  let fixRun = createManualPreviewSafeFixRun();

  if (safeCandidate) {
    fixRun = recordManualPreviewSafeFixResult(fixRun, {
      candidateId: safeCandidate.id,
      issueId: safeCandidate.issue.id,
      status: "applied",
      filesChanged: ["docs/teoyube/manual-preview-deployment-2-4-safe-fix-implementation-regression-verification.md"],
      fixSummary: "Documented the safe-fix and regression verification layer.",
      riskLevel: safeCandidate.riskLevel,
      regressionChecksRequired: safeCandidate.regressionChecks,
      verificationStatus: "passed",
      appliedAt: new Date().toISOString()
    });
  }

  if (manualReviewCandidate) {
    fixRun = recordManualPreviewSafeFixSkipped(
      fixRun,
      manualReviewCandidate,
      "Launch-critical Scripture anchor issue remains manual-review-only before implementation."
    );
  }

  const fixRunReport = createManualPreviewSafeFixRunReport(fixRun);
  const appliedFix = fixRun.results.find((result) => result.status === "applied");
  const safetyChecks = getPostFixSafetyVerificationChecklist();
  const surfaceChecks = getPostFixSurfaceRegressionChecklist();
  let regressionRun = createManualPreviewRegressionRun({
    checks: [
      ...(safeCandidate?.regressionChecks.map((check) => ({
        id: check.id,
        label: check.label,
        type: "surface_qa" as const,
        required: check.required,
        launchCritical: check.launchCritical,
        verificationModule: check.verificationModule,
        details: check.details,
        relatedIssueId: safeCandidate.issue.id,
        relatedFixResultId: appliedFix?.id,
        mappedIssueRegressionCheck: check
      })) || []),
      ...safetyChecks,
      ...surfaceChecks
    ],
    fixResults: fixRun.results
  });

  if (appliedFix && safeCandidate) {
    safeCandidate.regressionChecks.forEach((check) => {
      regressionRun = recordManualPreviewRegressionResult(regressionRun, {
        checkId: check.id,
        type: "surface_qa",
        status: "pass",
        summary: `${check.label} passed for the sample safe fix.`,
        required: check.required,
        launchCritical: check.launchCritical,
        relatedIssueId: safeCandidate.issue.id,
        relatedFixResultId: appliedFix.id
      });
    });
  }

  safetyChecks.forEach((check) => {
    regressionRun = recordManualPreviewRegressionResult(regressionRun, passResult(check.id, check.type, `${check.label} verified after sample safe fix.`));
  });
  surfaceChecks.forEach((check) => {
    regressionRun = recordManualPreviewRegressionResult(regressionRun, passResult(check.id, check.type, `${check.label} verified after sample safe fix.`));
  });

  const regressionReport = createManualPreviewRegressionReport(regressionRun);
  const safetyReport = createPostFixSafetyVerificationReport(regressionRun.results);
  const surfaceRegressionReport = createPostFixSurfaceRegressionReport(regressionRun.results);
  const issueResolution = verifyManualPreviewIssueResolutions(issues, fixRun.results, regressionRun);
  const audit = runManualPreviewSafeFixImplementationAudit();

  return {
    issues,
    fixPlans,
    safePlan,
    planReport,
    candidateEvaluation,
    unsafeEvaluation,
    fixRun,
    fixRunReport,
    regressionRun,
    regressionReport,
    safetyReport,
    surfaceRegressionReport,
    issueResolution,
    audit,
    noActualDeploymentPerformed: true,
    noPreviewUrlFetched: true,
    noExternalServicesCalled: true,
    noDatabaseWritten: true,
    noAnalyticsSent: true,
    generatedAt: new Date().toISOString()
  };
}
