import { createBuildArtifactReadinessReport } from "../build-artifact-readiness";
import { createBuildCommandRegistryReport } from "../build-command-registry";
import { createBuildVerificationPlan, recordBuildVerificationResult, summarizeBuildVerificationResults } from "../build-verification-runner";
import { createDeploymentDryRunPlan, createDeploymentDryRunReport } from "../deployment-dry-run-planner";
import { getDryRunProfileForTarget } from "../deployment-target-dry-run-profiles";
import { createLaunchQualityGateReport } from "../launch-quality-gates";
import { createPredeploymentSafetyGateReport } from "../predeployment-safety-gates";
import { createReleaseCandidateReport } from "../release-candidate-report";
import { createRouteBuildReadinessReport } from "../route-build-readiness";

export function runProductionLaunchBuildDryRunSmokeCheck() {
  const packageLike = { scripts: { build: "next build", start: "next start" } };
  const registry = createBuildCommandRegistryReport(packageLike);
  const plan = recordBuildVerificationResult(createBuildVerificationPlan(packageLike), {
    commandId: "build",
    scriptName: "build",
    status: "pass",
    summary: "Simulated build pass for dry-run smoke check."
  });
  const summary = summarizeBuildVerificationResults(plan.results);
  const routeReadiness = createRouteBuildReadinessReport();
  const artifactReadiness = createBuildArtifactReadinessReport({ productionBuildGenerated: true });
  const dryRunReport = createDeploymentDryRunReport(createDeploymentDryRunPlan("vercel"));
  const dryRunProfile = getDryRunProfileForTarget("vercel");
  const releaseCandidate = createReleaseCandidateReport({ buildResults: plan.results });
  const predeployment = createPredeploymentSafetyGateReport();
  const qualityGates = createLaunchQualityGateReport();
  const errors = [
    registry.commandCount > 0 && registry.availableCommands.some((entry) => entry.scriptName === "build") ? "" : "Build command registry should find build script.",
    summary.valid && summary.resultCount === 1 ? "" : "Build verification runner should summarize results.",
    routeReadiness.valid && routeReadiness.routeCount >= 12 ? "" : "Route build readiness should cover launch surfaces.",
    artifactReadiness.valid ? "" : "Build artifact readiness should be valid for safe state.",
    dryRunReport.valid && dryRunReport.decision === "ready_for_preview_deployment" ? "" : "Dry-run planner should be ready for preview deployment.",
    Boolean(dryRunProfile.expectedBuildCommand) ? "" : "Dry-run profile should exist.",
    Boolean(releaseCandidate.status) ? "" : "Release candidate report should exist.",
    predeployment.valid ? "" : "Predeployment safety gates should pass.",
    qualityGates.gates.some((gate) => gate.id === "deployment_dry_run_plan_available") ? "" : "Quality gates should include dry-run checks."
  ].filter(Boolean);

  return {
    valid: errors.length === 0,
    errors,
    noActualDeploymentPerformed: true,
    noExternalSystemsRequired: true,
    notes: [
      "No database, external APIs, analytics provider, service worker, localStorage, cookies, IndexedDB, or file writes are required."
    ],
    generatedAt: new Date().toISOString()
  };
}

