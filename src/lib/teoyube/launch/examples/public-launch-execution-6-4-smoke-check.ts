import { createPublicLaunchExecution64ExampleFixQueue, runPublicLaunchExecution64Example } from "./public-launch-execution-6-4-example";
import { createPublicSafeFixReleasePlan, createPublicSafeFixReleasePlanReport } from "../public-safe-fix-release-planner";
import { createPublicSafeFixReleaseSafetyReport } from "../public-safe-fix-release-safety";
import { createPublicSafeFixReleaseRun, createPublicSafeFixReleaseRunReport, recordPublicSafeFixReleased } from "../public-safe-fix-release-recorder";
import { createPublicPostReleaseSafetyReport } from "../public-post-release-safety-verification";
import { createPublicPostReleaseSurfaceStabilizationReport, PUBLIC_POST_RELEASE_SURFACES } from "../public-post-release-surface-stabilization";
import { createPublicLaunchStabilizationPackage, createPublicLaunchStabilizationPackageReport } from "../public-launch-stabilization-package";
import { createPublicStabilizationOwnerReviewChecklist, createPublicStabilizationOwnerReviewReport } from "../public-stabilization-owner-review";
import { createPublicStabilizationContinuePauseReport } from "../public-stabilization-continue-pause";
import { createPublicStabilizationRegressionReport, createPublicStabilizationRegressionRun, recordPublicStabilizationRegressionResult } from "../public-stabilization-regression-runner";
import { runPublicSafeFixStabilizationAudit } from "../public-safe-fix-stabilization-audit";

export type TeoyubePublicLaunchExecution64SmokeCheck = {
  valid: boolean;
  checks: Array<{ id: string; passed: boolean; details: string }>;
  generatedAt: string;
};

function createPassingRegressionReport() {
  let run = createPublicStabilizationRegressionRun();
  for (const check of run.checks) {
    run = recordPublicStabilizationRegressionResult(run, {
      checkId: check.id,
      type: check.type,
      status: "pass",
      summary: `${check.label} passed for the smoke check.`,
      required: check.required,
      publicLaunchCritical: check.publicLaunchCritical
    });
  }
  return createPublicStabilizationRegressionReport(run);
}

function check(id: string, passed: boolean, details: string) {
  return { id, passed, details };
}

export function runPublicLaunchExecution64SmokeCheck(): TeoyubePublicLaunchExecution64SmokeCheck {
  const example = runPublicLaunchExecution64Example();
  const queue = createPublicLaunchExecution64ExampleFixQueue();
  const plan = createPublicSafeFixReleasePlan(queue);
  const planReport = createPublicSafeFixReleasePlanReport(plan);
  const safetyReport = createPublicSafeFixReleaseSafetyReport(plan);
  let releaseRun = createPublicSafeFixReleaseRun();
  const safeCandidate = plan.safeLocalFixes[0];
  if (safeCandidate) {
    releaseRun = recordPublicSafeFixReleased(releaseRun, {
      candidateId: safeCandidate.id,
      sourceFixQueueItemId: safeCandidate.sourceFixQueueItemId,
      filesChanged: [],
      fixSummary: "Smoke-check safe public fix recorded in memory.",
      safetyStatus: "passed",
      regressionChecksRequired: safeCandidate.regressionChecks,
      verificationStatus: "passed"
    });
  }
  const releaseRunReport = createPublicSafeFixReleaseRunReport(releaseRun);
  const regressionReport = createPassingRegressionReport();
  const postReleaseSafetyReport = createPublicPostReleaseSafetyReport();
  const surfaceReport = createPublicPostReleaseSurfaceStabilizationReport();
  const pkg = createPublicLaunchStabilizationPackage();
  const packageReport = createPublicLaunchStabilizationPackageReport(pkg);
  const ownerReviewChecklist = createPublicStabilizationOwnerReviewChecklist();
  const ownerReviewReport = createPublicStabilizationOwnerReviewReport();
  const continuePauseReport = createPublicStabilizationContinuePauseReport({
    publicFixQueueBlockers: 0,
    releasePlanBlockers: 0,
    releaseSafetyBlockers: 0,
    releaseRunBlockers: 0,
    regressionBlockers: 0,
    postReleaseSafetyBlockers: 0,
    surfaceStabilizationBlockers: 0,
    ownerReviewDecision: ownerReviewReport.decision,
    ownerReviewAccepted: ownerReviewReport.ready,
    pauseRollbackWatchStatus: "healthy"
  });
  const audit = runPublicSafeFixStabilizationAudit();

  const checks = [
    check(
      "public_safe_fix_planner_separates_candidates",
      planReport.safeReleaseCount >= 1 && planReport.manualReviewCount >= 1 && planReport.blockedCount >= 1,
      "Planner separates safe local, manual review/deferred, and blocked public fixes."
    ),
    check(
      "public_safe_fix_safety_blocks_unsafe_changes",
      !safetyReport.valid && safetyReport.blockers.some((entry) => /analytics|raw|unsafe|blocked/i.test(`${entry.label} ${entry.reason}`)),
      "Safety validation blocks analytics/raw sensitive feedback proposals."
    ),
    check(
      "public_safe_fix_release_recorder_is_in_memory",
      releaseRunReport.inMemoryOnly && releaseRunReport.noLaunchPerformed && releaseRunReport.noRollbackPerformed && releaseRunReport.noPublicUrlFetched && releaseRunReport.noExternalWrite,
      "Release recorder remains manual, in-memory, and side-effect free."
    ),
    check(
      "public_stabilization_regression_passes_sample",
      regressionReport.ready && regressionReport.checkCount >= 10 && regressionReport.noExternalWrite,
      "Regression runner records public stabilization checks in memory."
    ),
    check(
      "public_post_release_safety_preserves_guardrails",
      postReleaseSafetyReport.ready &&
        postReleaseSafetyReport.scriptureAnchoringRequired &&
        postReleaseSafetyReport.explanationPathsRequired &&
        postReleaseSafetyReport.fallbackSafetyRequired &&
        postReleaseSafetyReport.privacyTermsConsentRequired &&
        postReleaseSafetyReport.noExternalAnalyticsEnabled &&
        postReleaseSafetyReport.noProductionPersistenceEnabled &&
        postReleaseSafetyReport.noLiveAiOrchestrationEnabled,
      "Post-release safety report preserves public safety, privacy, provider, and consent guardrails."
    ),
    check(
      "public_post_release_surface_stabilization_covers_surfaces",
      surfaceReport.ready && surfaceReport.requiredSurfaceCount === PUBLIC_POST_RELEASE_SURFACES.length && surfaceReport.requiredSurfaceCount >= 15 && surfaceReport.noExternalServiceRequired,
      "Surface stabilization covers required public launch surfaces."
    ),
    check(
      "public_launch_stabilization_package_is_safe",
      packageReport.ready && packageReport.inMemoryOnly && packageReport.noFixesAppliedAutomatically && packageReport.noLaunchPerformed && packageReport.noRollbackPerformed && packageReport.noUsersContacted && packageReport.noPublicUrlFetched && packageReport.noExternalWrite,
      "Public launch stabilization package is in-memory and does not perform launch, rollback, URL fetch, user contact, or external writes."
    ),
    check(
      "public_stabilization_owner_review_exists",
      ownerReviewChecklist.length >= 7 && ownerReviewReport.ready && ownerReviewReport.noUsersContacted,
      "Owner review checklist and report exist."
    ),
    check(
      "public_stabilization_continue_pause_exists",
      continuePauseReport.ready && continuePauseReport.noRollbackPerformed && continuePauseReport.noUsersContacted && continuePauseReport.noPublicUrlFetched,
      "Continue/pause report exists and performs no rollback or user contact."
    ),
    check(
      "public_safe_fix_stabilization_audit_complete",
      audit.complete && audit.completionPercentage === 100,
      "Public Launch Execution 6.4 audit is complete."
    ),
    check(
      "public_launch_execution_6_4_example_runs",
      Boolean(example.stabilizationPackageReport.ready && example.audit.complete),
      "Public Launch Execution 6.4 example returns a ready default stabilization package."
    ),
    check(
      "public_launch_execution_6_4_side_effects_absent",
      !pkg.usersContacted &&
        !pkg.feedbackCollectedAutomatically &&
        !pkg.analyticsSent &&
        !pkg.databaseWritten &&
        !pkg.externalServicesCalled &&
        !pkg.publicUrlFetched &&
        !pkg.liveAiOrchestrationEnabled &&
        packageReport.noLaunchPerformed &&
        packageReport.noRollbackPerformed,
      "No prohibited side-effect flags are enabled."
    )
  ];

  return {
    valid: checks.every((entry) => entry.passed),
    checks,
    generatedAt: new Date().toISOString()
  };
}
