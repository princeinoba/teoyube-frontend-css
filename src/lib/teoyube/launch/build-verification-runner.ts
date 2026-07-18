import type {
  TeoyubeBuildCommandResult,
  TeoyubeBuildVerificationReport,
  TeoyubeBuildVerificationResult
} from "./build-verification-contracts";
import { createBuildCommandVerificationPlan, type TeoyubePackageJsonLike } from "./build-command-registry";

export function createBuildVerificationPlan(packageJsonLike: TeoyubePackageJsonLike = {}) {
  return {
    ...createBuildCommandVerificationPlan(packageJsonLike),
    results: [] as TeoyubeBuildCommandResult[]
  };
}

export function recordBuildVerificationResult<TPlan extends { results: TeoyubeBuildCommandResult[] }>(
  plan: TPlan,
  result: TeoyubeBuildCommandResult
): TPlan {
  return {
    ...plan,
    results: [
      ...plan.results,
      {
        ...result,
        ranAt: result.ranAt || new Date().toISOString()
      }
    ]
  };
}

export function getBuildVerificationBlockers(results: TeoyubeBuildCommandResult[]): string[] {
  return results
    .filter((entry) => entry.status === "fail" || entry.status === "blocked")
    .map((entry) => `${entry.scriptName}: ${entry.summary}`);
}

export function getBuildVerificationWarnings(results: TeoyubeBuildCommandResult[]): string[] {
  return results
    .filter((entry) => entry.status === "warning" || entry.status === "not_run")
    .map((entry) => `${entry.scriptName}: ${entry.summary}`);
}

export function summarizeBuildVerificationResults(results: TeoyubeBuildCommandResult[]) {
  const blockers = getBuildVerificationBlockers(results);
  const warnings = getBuildVerificationWarnings(results);

  return {
    valid: blockers.length === 0,
    resultCount: results.length,
    passCount: results.filter((entry) => entry.status === "pass").length,
    warningCount: warnings.length,
    blockerCount: blockers.length,
    blockers,
    warnings
  };
}

export function createBuildVerificationReport(results: TeoyubeBuildCommandResult[] = []): TeoyubeBuildVerificationReport {
  const summary = summarizeBuildVerificationResults(results);
  const mappedResults: TeoyubeBuildVerificationResult[] = results.map((entry) => ({
    id: entry.commandId,
    label: entry.scriptName,
    status: entry.status,
    required: entry.commandId === "build",
    riskLevel: entry.status === "fail" || entry.status === "blocked" ? "critical" : "low",
    details: entry.summary,
    commandResult: entry
  }));

  return {
    status: summary.blockerCount ? "blocked" : summary.warningCount ? "warning" : "pass",
    valid: summary.valid,
    checkCount: mappedResults.length,
    passCount: summary.passCount,
    warningCount: summary.warningCount,
    blockerCount: summary.blockerCount,
    results: mappedResults,
    warnings: summary.warnings,
    blockers: summary.blockers,
    generatedAt: new Date().toISOString()
  };
}

