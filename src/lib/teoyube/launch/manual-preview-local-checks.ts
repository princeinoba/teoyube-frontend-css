import type {
  TeoyubeManualPreviewDeploymentCommandResult,
  TeoyubeManualPreviewDeploymentStatus
} from "./manual-preview-deployment-contracts";

export type TeoyubeManualPreviewLocalCheckId =
  | "package_install"
  | "typecheck"
  | "lint"
  | "build"
  | "test"
  | "launch_smoke_checks"
  | "final_launch_preparation_audit"
  | "final_safety_certification"
  | "manual_preview_deployment_audit";

export type TeoyubeManualPreviewLocalCheckPlanItem = {
  id: TeoyubeManualPreviewLocalCheckId;
  label: string;
  required: boolean;
  command?: string;
  manualAllowed: boolean;
  details: string;
};

export type TeoyubeManualPreviewLocalCheckReport = {
  status: TeoyubeManualPreviewDeploymentStatus;
  ready: boolean;
  resultCount: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  blockers: string[];
  warnings: string[];
  results: TeoyubeManualPreviewDeploymentCommandResult[];
  generatedAt: string;
};

function resultStatus(result: TeoyubeManualPreviewDeploymentCommandResult): TeoyubeManualPreviewDeploymentStatus {
  return result.status || (result.exitCode === 0 ? "complete" : "failed");
}

export function getManualPreviewLocalCheckPlan(): TeoyubeManualPreviewLocalCheckPlanItem[] {
  return [
    {
      id: "package_install",
      label: "Package install verified manually",
      required: true,
      command: "npm install",
      manualAllowed: true,
      details: "Confirm dependencies are installed before preview deployment."
    },
    {
      id: "typecheck",
      label: "TypeScript check",
      required: false,
      command: "npm run typecheck",
      manualAllowed: true,
      details: "Run if the script exists; document if missing."
    },
    {
      id: "lint",
      label: "Lint",
      required: false,
      command: "npm run lint",
      manualAllowed: true,
      details: "Run if the script exists; document if missing."
    },
    {
      id: "build",
      label: "Production build",
      required: true,
      command: "npm run build",
      manualAllowed: true,
      details: "Build must pass before manual provider deployment."
    },
    {
      id: "test",
      label: "Tests",
      required: false,
      command: "npm run test",
      manualAllowed: true,
      details: "Run if the script exists; document if missing."
    },
    {
      id: "launch_smoke_checks",
      label: "Launch smoke checks",
      required: true,
      manualAllowed: true,
      details: "Run existing launch smoke checks, including 1.1 through 2.1."
    },
    {
      id: "final_launch_preparation_audit",
      label: "Final launch preparation audit",
      required: true,
      manualAllowed: true,
      details: "Confirm Production Launch Preparation remains 100% complete."
    },
    {
      id: "final_safety_certification",
      label: "Final safety certification",
      required: true,
      manualAllowed: true,
      details: "Confirm Scripture, explanation, fallback, consent, privacy, and provider boundaries."
    },
    {
      id: "manual_preview_deployment_audit",
      label: "Manual Preview Deployment 2.1 audit",
      required: true,
      manualAllowed: true,
      details: "Confirm the 2.1 launch modules, documentation, example, and smoke check exist."
    }
  ];
}

export function recordManualPreviewLocalCheckResult(
  plan: TeoyubeManualPreviewLocalCheckPlanItem,
  result: Partial<TeoyubeManualPreviewDeploymentCommandResult>
): TeoyubeManualPreviewDeploymentCommandResult {
  return {
    commandId: plan.id,
    status: result.status || (result.exitCode === 0 ? "complete" : "needs_review"),
    exitCode: result.exitCode,
    summary: result.summary || `${plan.label} result recorded manually.`,
    checkedAt: result.checkedAt || new Date().toISOString()
  };
}

export function getManualPreviewLocalCheckBlockers(
  results: TeoyubeManualPreviewDeploymentCommandResult[]
): string[] {
  const plan = getManualPreviewLocalCheckPlan();
  const resultMap = new Map(results.map((result) => [result.commandId, result]));

  return plan
    .filter((item) => item.required)
    .map((item) => {
      const result = resultMap.get(item.id);
      if (!result) return `${item.label} has not been recorded.`;
      return resultStatus(result) === "failed" || resultStatus(result) === "blocked"
        ? `${item.label} failed: ${result.summary}`
        : "";
    })
    .filter(Boolean);
}

export function getManualPreviewLocalCheckWarnings(
  results: TeoyubeManualPreviewDeploymentCommandResult[]
): string[] {
  const plan = getManualPreviewLocalCheckPlan();
  const resultMap = new Map(results.map((result) => [result.commandId, result]));

  return plan
    .filter((item) => !item.required)
    .map((item) => {
      const result = resultMap.get(item.id);
      if (!result) return `${item.label} was not recorded; document if the script is missing.`;
      return resultStatus(result) === "failed" || resultStatus(result) === "blocked"
        ? `${item.label} needs review: ${result.summary}`
        : "";
    })
    .filter(Boolean);
}

export function summarizeManualPreviewLocalChecks(
  results: TeoyubeManualPreviewDeploymentCommandResult[]
) {
  const statuses = results.map(resultStatus);

  return {
    resultCount: results.length,
    passedCount: statuses.filter((status) => status === "complete" || status === "ready").length,
    failedCount: statuses.filter((status) => status === "failed" || status === "blocked").length,
    skippedCount: statuses.filter((status) => status === "not_started" || status === "unknown").length
  };
}

export function createManualPreviewLocalCheckReport(
  results: TeoyubeManualPreviewDeploymentCommandResult[] = []
): TeoyubeManualPreviewLocalCheckReport {
  const summary = summarizeManualPreviewLocalChecks(results);
  const blockers = getManualPreviewLocalCheckBlockers(results);
  const warnings = getManualPreviewLocalCheckWarnings(results);

  return {
    status: blockers.length ? "blocked" : warnings.length ? "ready_with_warnings" : "ready",
    ready: blockers.length === 0,
    ...summary,
    blockers,
    warnings,
    results,
    generatedAt: new Date().toISOString()
  };
}
