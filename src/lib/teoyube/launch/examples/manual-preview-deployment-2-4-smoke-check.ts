import {
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
import { verifyManualPreviewIssueResolution, verifyManualPreviewIssueResolutions } from "../manual-preview-issue-resolution-verification";
import { runManualPreviewSafeFixImplementationAudit } from "../manual-preview-safe-fix-implementation-audit";
import type {
  TeoyubeManualPreviewIssue,
  TeoyubeManualPreviewIssueFixPlan
} from "../manual-preview-issue-triage-contracts";

export type ManualPreviewDeployment24SmokeCheckReport = {
  valid: boolean;
  errors: string[];
  noActualDeploymentPerformed: true;
  noPreviewUrlFetched: true;
  noFixesAppliedAutomatically: true;
  noDatabaseRequired: true;
  noExternalApisRequired: true;
  noAnalyticsProviderRequired: true;
  noServiceWorkerRequired: true;
  noBrowserStorageRequired: true;
  noFileWritesRequired: true;
  generatedAt: string;
};

function assert(condition: boolean, message: string): string {
  return condition ? "" : message;
}

function sampleIssues(): TeoyubeManualPreviewIssue[] {
  return [
    {
      id: "smoke_copy_clarity_safe_fix",
      title: "Reflection copy needs clearer wording",
      details: "A small copy clarity fix is safe and local.",
      category: "content_clarity",
      severity: "low",
      source: "manual_owner_review",
      surface: "tig_response_panel"
    },
    {
      id: "smoke_scripture_anchor_manual_review",
      title: "Scripture anchor missing",
      details: "A launch-critical Scripture anchor issue requires owner review before implementation.",
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
  const base = createManualPreviewFixPlan({
    id: "smoke_unsafe_fix",
    title: "Unsafe provider change",
    details: "Unsafe sample used by smoke check.",
    category: "privacy",
    severity: "medium"
  });

  return {
    ...base,
    recommendedFixSummary: "Remove Scripture anchor, hide explanation path, enable external analytics, connect database writes, and enable live AI orchestration.",
    safeImplementationNotes: ["Hide consent controls and persist raw sensitive text."],
    ownerReviewRequired: false,
    softLaunchBlocker: false,
    status: "ready_for_safe_fix"
  };
}

function resultFor(checkId: string, type: string, summary: string, relatedFixResultId?: string, relatedIssueId?: string) {
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

export function runManualPreviewDeployment24SmokeCheck(): ManualPreviewDeployment24SmokeCheckReport {
  const issues = sampleIssues();
  const fixPlans = createManualPreviewFixPlans(issues);
  const safePlan = createManualPreviewSafeFixPlan(issues, fixPlans);
  const safePlanReport = createManualPreviewSafeFixPlanReport(safePlan);
  const unsafeCandidate = createSafeFixCandidateFromIssue(
    {
      id: "smoke_unsafe_fix",
      title: "Unsafe provider change",
      details: "Unsafe sample used by smoke check.",
      category: "privacy",
      severity: "medium"
    },
    createUnsafeFixPlan()
  );
  const unsafeEvaluation = evaluateManualPreviewSafeFixCandidate(unsafeCandidate);
  const safeCandidate = safePlan.safeLocalFixes[0];
  const manualCandidate = safePlan.manualReviewFixes[0];
  let fixRun = createManualPreviewSafeFixRun();

  if (safeCandidate) {
    fixRun = recordManualPreviewSafeFixResult(fixRun, {
      candidateId: safeCandidate.id,
      issueId: safeCandidate.issue.id,
      status: "applied",
      filesChanged: ["docs/teoyube/manual-preview-deployment-2-4-safe-fix-implementation-regression-verification.md"],
      fixSummary: "Smoke check sample safe documentation fix.",
      riskLevel: safeCandidate.riskLevel,
      regressionChecksRequired: safeCandidate.regressionChecks,
      verificationStatus: "passed",
      appliedAt: new Date().toISOString()
    });
  }

  if (manualCandidate) {
    fixRun = recordManualPreviewSafeFixSkipped(fixRun, manualCandidate, "Manual review required for launch-critical issue.");
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

  if (safeCandidate && appliedFix) {
    safeCandidate.regressionChecks.forEach((check) => {
      regressionRun = recordManualPreviewRegressionResult(regressionRun, {
        checkId: check.id,
        type: "surface_qa",
        status: "pass",
        summary: `${check.label} passed in smoke check.`,
        required: check.required,
        launchCritical: check.launchCritical,
        relatedIssueId: safeCandidate.issue.id,
        relatedFixResultId: appliedFix.id
      });
    });
  }
  safetyChecks.forEach((check) => {
    regressionRun = recordManualPreviewRegressionResult(regressionRun, resultFor(check.id, check.type, `${check.label} passed.`));
  });
  surfaceChecks.forEach((check) => {
    regressionRun = recordManualPreviewRegressionResult(regressionRun, resultFor(check.id, check.type, `${check.label} passed.`));
  });

  const regressionReport = createManualPreviewRegressionReport(regressionRun);
  const safetyReport = createPostFixSafetyVerificationReport(regressionRun.results);
  const surfaceReport = createPostFixSurfaceRegressionReport(regressionRun.results);
  const resolution = verifyManualPreviewIssueResolutions(issues, fixRun.results, regressionRun);
  const unresolvedCritical = verifyManualPreviewIssueResolution(issues[1], undefined, []);
  const audit = runManualPreviewSafeFixImplementationAudit();
  const errors = [
    assert(safePlan.candidates.length === issues.length, "Safe fix planner should create one candidate per issue with a fix plan."),
    assert(safePlan.safeLocalFixes.length >= 1, "Safe fix planner should identify at least one safe local fix."),
    assert(safePlan.manualReviewFixes.length >= 1, "Safe fix planner should identify launch-critical manual review fixes."),
    assert(["safe_to_apply", "manual_review_required"].includes(safePlanReport.decision), "Safe fix plan report should return a structured decision."),
    assert(unsafeEvaluation.decision === "blocked" && unsafeEvaluation.blockers.length >= 4, "Unsafe fix candidate should be blocked."),
    assert(fixRun.inMemoryOnly && !fixRun.databaseWritten && !fixRun.analyticsSent && !fixRun.filesWritten && !fixRun.externalServicesCalled, "Safe fix recorder should remain in-memory only."),
    assert(fixRunReport.resultCount >= 2 && fixRunReport.noExternalWrite, "Safe fix run report should summarize applied and skipped sample fixes."),
    assert(regressionRun.inMemoryOnly && !regressionRun.databaseWritten && !regressionRun.analyticsSent && !regressionRun.filesWritten && !regressionRun.externalServicesCalled && !regressionRun.previewUrlFetched, "Regression runner should remain in-memory only."),
    assert(regressionReport.valid && regressionReport.decision === "verified", "Regression report should verify all recorded checks."),
    assert(safetyReport.valid && safetyReport.scriptureAnchoringRequired && safetyReport.explanationPathRequired && safetyReport.fallbackPathEnabled && safetyReport.consentControlsEnabled, "Post-fix safety verification should preserve Scripture, explanation, fallback, and consent."),
    assert(surfaceReport.valid && surfaceReport.surfaceCount >= 15 && surfaceReport.checkCount >= 100, "Post-fix surface regression should cover required surfaces."),
    assert(!unresolvedCritical.verified && unresolvedCritical.blockers.length > 0, "Critical issue should not be resolved without a fix and regression results."),
    assert(resolution.issueCount === issues.length && resolution.resolvedCount >= 1 && resolution.unresolvedCount >= 1, "Issue resolution verification should distinguish resolved and unresolved issues."),
    assert(audit.complete && audit.completionPercentage === 100, "Manual Preview Deployment 2.4 audit should be complete.")
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    errors,
    noActualDeploymentPerformed: true,
    noPreviewUrlFetched: true,
    noFixesAppliedAutomatically: true,
    noDatabaseRequired: true,
    noExternalApisRequired: true,
    noAnalyticsProviderRequired: true,
    noServiceWorkerRequired: true,
    noBrowserStorageRequired: true,
    noFileWritesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
