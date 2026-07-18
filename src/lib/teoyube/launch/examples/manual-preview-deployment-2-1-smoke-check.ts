import {
  addManualPreviewDeploymentStep,
  createManualPreviewDeploymentExecutionRecord,
  createManualPreviewDeploymentExecutionReport,
  recordManualPreviewDeploymentResult
} from "../manual-preview-deployment-execution-record";
import { createManualPreviewDeploymentGoNoGoReport } from "../manual-preview-deployment-go-no-go";
import { runManualPreviewDeploymentAudit } from "../manual-preview-deployment-audit";
import { createManualPreviewDeploymentRunbookReport } from "../manual-preview-deployment-runbook";
import { createManualPreviewEnvironmentReport } from "../manual-preview-environment-verification";
import {
  createManualPreviewLocalCheckReport,
  getManualPreviewLocalCheckPlan,
  recordManualPreviewLocalCheckResult
} from "../manual-preview-local-checks";
import { createManualPreviewPostDeploymentReport } from "../manual-preview-postdeployment-checklist";
import { createProviderSetupReport } from "../manual-preview-provider-setup";

export type ManualPreviewDeployment21SmokeCheckResult = {
  valid: boolean;
  errors: string[];
  noActualDeploymentPerformed: boolean;
  noDatabaseRequired: boolean;
  noExternalApisRequired: boolean;
  noAnalyticsProviderRequired: boolean;
  noServiceWorkerRequired: boolean;
  noBrowserStorageRequired: boolean;
  noFileWritesRequired: boolean;
  generatedAt: string;
};

function clean(errors: string[]): string[] {
  return errors.filter(Boolean);
}

export function runManualPreviewDeployment21SmokeCheck(): ManualPreviewDeployment21SmokeCheckResult {
  const provider = createProviderSetupReport("vercel");
  const environment = createManualPreviewEnvironmentReport({
    provider: "vercel",
    publicEnvironmentVariables: {
      NEXT_PUBLIC_TEOYUBE_ENABLE_DEBUG_UI: "false"
    }
  });
  const localCheckPlan = getManualPreviewLocalCheckPlan();
  const localCheckResults = localCheckPlan
    .filter((item) => item.required)
    .map((item) =>
      recordManualPreviewLocalCheckResult(item, {
        status: "complete",
        exitCode: 0,
        summary: `${item.label} recorded successfully in smoke check.`
      })
    );
  const localChecks = createManualPreviewLocalCheckReport(localCheckResults);
  const record = createManualPreviewDeploymentExecutionRecord({
    provider: "vercel",
    localChecksCompleted: true,
    manualDeploymentCommandPrepared: true
  });
  const withStep = addManualPreviewDeploymentStep(record, {
    id: "prepare_manual_provider_deployment",
    label: "Prepare manual provider deployment",
    phase: "manual_deployment",
    required: true,
    status: "ready",
    manualOnly: true,
    details: "Human-only deployment command is prepared but not executed."
  });
  const withResult = recordManualPreviewDeploymentResult(withStep, {
    commandId: "build",
    status: "complete",
    exitCode: 0,
    summary: "Build result recorded in memory.",
    checkedAt: new Date().toISOString()
  });
  const executionReport = createManualPreviewDeploymentExecutionReport(withResult);
  const goNoGo = createManualPreviewDeploymentGoNoGoReport({
    provider: "vercel",
    environmentConfig: { provider: "vercel" },
    localCheckResults,
    ownerApproved: true
  });
  const runbook = createManualPreviewDeploymentRunbookReport("vercel");
  const postdeployment = createManualPreviewPostDeploymentReport();
  const audit = runManualPreviewDeploymentAudit();

  const errors = clean([
    provider.selected && provider.setupChecklist.length > 0 ? "" : "Provider setup helper should return structured instructions.",
    provider.buildCommand === "npm run build" ? "" : "Provider setup should include expected build command.",
    environment.valid ? "" : "Environment verification should pass with safe defaults.",
    environment.externalAnalyticsSendingDisabled ? "" : "External analytics must remain disabled.",
    environment.productionPersistenceDisabled ? "" : "Production persistence must remain disabled.",
    environment.liveAiOrchestrationDisabled ? "" : "Live AI orchestration must remain disabled.",
    localChecks.ready && localChecks.results.length > 0 ? "" : "Local check runner should record results in memory.",
    executionReport.noActualDeploymentPerformed && executionReport.noExternalSending && executionReport.noFileWrites
      ? ""
      : "Execution record must remain in-memory and side-effect free.",
    goNoGo.decision === "ready_for_manual_provider_deployment" || goNoGo.decision === "ready_after_environment_review"
      ? ""
      : "Go/no-go should return a structured ready decision.",
    runbook.valid && runbook.deploymentCommandsExecuted === false
      ? ""
      : "Runbook must not execute deployment commands.",
    postdeployment.checkCount > 0 ? "" : "Postdeployment checklist should exist.",
    audit.complete && audit.completionPercentage === 100 ? "" : "Manual preview deployment audit should be complete.",
    audit.nextStep === "Manual Preview Deployment Execution 2.2 - Preview URL Verification & Post-Deployment QA"
      ? ""
      : "Audit should point to step 2.2."
  ]);

  return {
    valid: errors.length === 0,
    errors,
    noActualDeploymentPerformed: true,
    noDatabaseRequired: true,
    noExternalApisRequired: true,
    noAnalyticsProviderRequired: true,
    noServiceWorkerRequired: true,
    noBrowserStorageRequired: true,
    noFileWritesRequired: true,
    generatedAt: new Date().toISOString()
  };
}
