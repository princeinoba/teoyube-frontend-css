import type {
  TeoyubeLaunchQaBlocker,
  TeoyubeLaunchQaCheckResult,
  TeoyubeLaunchQaStatus,
  TeoyubeLaunchQaSurface,
  TeoyubeLaunchQaWarning
} from "./launch-qa-contracts";

export type TeoyubeManualQaRun = {
  id: string;
  label: string;
  createdAt: string;
  results: TeoyubeLaunchQaCheckResult[];
};

function createId(): string {
  return `manual_qa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createManualQaRun(label = "Production Launch Preparation 1.3 Manual QA"): TeoyubeManualQaRun {
  return {
    id: createId(),
    label,
    createdAt: new Date().toISOString(),
    results: []
  };
}

export function recordManualQaResult(
  run: TeoyubeManualQaRun,
  result: {
    checkId: string;
    surface: TeoyubeLaunchQaSurface | "all";
    status: TeoyubeLaunchQaStatus;
    notes?: string;
  }
): TeoyubeManualQaRun {
  return {
    ...run,
    results: [
      ...run.results,
      {
        ...result,
        testedAt: new Date().toISOString()
      }
    ]
  };
}

export function getManualQaLaunchBlockers(run: TeoyubeManualQaRun): TeoyubeLaunchQaBlocker[] {
  return run.results
    .filter((entry) => entry.status === "fail" || entry.status === "blocked")
    .map((entry) => ({
      id: entry.checkId,
      surface: entry.surface,
      title: "Manual QA blocker",
      riskLevel: "high",
      reason: entry.notes || "Manual QA failed.",
      requiredAction: "Resolve manual QA blocker before launch."
    }));
}

export function getManualQaWarnings(run: TeoyubeManualQaRun): TeoyubeLaunchQaWarning[] {
  return run.results
    .filter((entry) => entry.status === "warning" || entry.status === "not_tested")
    .map((entry) => ({
      id: entry.checkId,
      surface: entry.surface,
      title: "Manual QA warning",
      riskLevel: "medium",
      message: entry.notes || "Manual QA warning.",
      recommendedAction: "Review warning before deployment."
    }));
}

export function summarizeManualQaRun(run: TeoyubeManualQaRun) {
  const blockers = getManualQaLaunchBlockers(run);
  const warnings = getManualQaWarnings(run);
  return {
    runId: run.id,
    label: run.label,
    resultCount: run.results.length,
    passedCount: run.results.filter((entry) => entry.status === "pass").length,
    warningCount: warnings.length,
    blockerCount: blockers.length,
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function createManualQaReport(run: TeoyubeManualQaRun) {
  return {
    ...summarizeManualQaRun(run),
    results: run.results,
    generatedAt: new Date().toISOString()
  };
}

