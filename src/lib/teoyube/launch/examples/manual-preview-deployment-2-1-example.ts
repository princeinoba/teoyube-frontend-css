import { createManualPreviewDeploymentExecutionRecord } from "../manual-preview-deployment-execution-record";
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
import type { TeoyubeManualPreviewDeploymentProvider } from "../manual-preview-deployment-contracts";

export function createManualPreviewDeployment21Example(
  provider: TeoyubeManualPreviewDeploymentProvider = "vercel"
) {
  const providerSetup = createProviderSetupReport(provider);
  const environment = createManualPreviewEnvironmentReport({ provider });
  const localCheckResults = getManualPreviewLocalCheckPlan()
    .filter((item) => item.required)
    .map((item) =>
      recordManualPreviewLocalCheckResult(item, {
        status: "complete",
        exitCode: 0,
        summary: `${item.label} completed or verified for the example.`
      })
    );
  const localChecks = createManualPreviewLocalCheckReport(localCheckResults);
  const executionRecord = createManualPreviewDeploymentExecutionRecord({
    provider,
    environmentProfile: environment.environmentProfile,
    localChecksCompleted: localChecks.ready,
    manualDeploymentCommandPrepared: true,
    warnings: [
      "Preview URL has not been recorded because this example does not deploy."
    ]
  });
  const goNoGo = createManualPreviewDeploymentGoNoGoReport({
    provider,
    environmentConfig: { provider },
    localCheckResults,
    ownerApproved: false
  });
  const runbook = createManualPreviewDeploymentRunbookReport(provider);
  const postdeployment = createManualPreviewPostDeploymentReport();
  const audit = runManualPreviewDeploymentAudit();

  return {
    provider,
    providerSetup,
    environment,
    localChecks,
    executionRecord,
    goNoGo,
    runbook,
    postdeployment,
    audit,
    noActualDeploymentPerformed: true,
    generatedAt: new Date().toISOString()
  };
}
