import { createBuildArtifactReadinessReport } from "../build-artifact-readiness";
import { createBuildCommandVerificationPlan } from "../build-command-registry";
import { createBuildVerificationPlan, recordBuildVerificationResult, createBuildVerificationReport } from "../build-verification-runner";
import { createDeploymentDryRunPlan, createDeploymentDryRunReport } from "../deployment-dry-run-planner";
import { createLaunchDecision } from "../launch-decision-helper";
import { createPredeploymentSafetyGateReport } from "../predeployment-safety-gates";
import { runProductionLaunchReadinessAudit } from "../production-launch-readiness-audit";
import { createReleaseCandidateReport } from "../release-candidate-report";
import { createRouteBuildReadinessReport } from "../route-build-readiness";

export function createProductionLaunchBuildDryRunExample() {
  const packageLike = { scripts: { build: "next build", start: "next start" } };
  const commandPlan = createBuildCommandVerificationPlan(packageLike);
  const resultPlan = recordBuildVerificationResult(
    recordBuildVerificationResult(createBuildVerificationPlan(packageLike), {
      commandId: "build",
      scriptName: "build",
      status: "warning",
      summary: "Simulated build result recorded; actual local build should be run separately before preview deployment."
    }),
    {
      commandId: "test",
      scriptName: "test",
      status: "not_run",
      summary: "No test script is defined yet."
    }
  );
  const buildReport = createBuildVerificationReport(resultPlan.results);
  const routeReadiness = createRouteBuildReadinessReport();
  const artifactReadiness = createBuildArtifactReadinessReport({ productionBuildGenerated: true });
  const dryRunPlan = createDeploymentDryRunPlan("vercel");
  const dryRunReport = createDeploymentDryRunReport(dryRunPlan);
  const predeploymentSafety = createPredeploymentSafetyGateReport();
  const releaseCandidate = createReleaseCandidateReport({ buildResults: resultPlan.results });
  const readiness = runProductionLaunchReadinessAudit();

  return {
    commandPlan,
    buildReport,
    routeReadiness,
    artifactReadiness,
    dryRunPlan,
    dryRunReport,
    predeploymentSafety,
    releaseCandidate,
    launchDecision: createLaunchDecision(readiness)
  };
}

