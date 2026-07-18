import { createPublicCopyUiAdapterReport } from "./public-copy-ui-adapter";
import { createPublicLaunchCopyPackage, createPublicLaunchCopyPackageReport } from "./public-launch-copy-package";
import { createPublicSurfaceCopyRegistryReport, getPublicSurfaceCopyIntegrations } from "./public-surface-copy-registry";

export function validatePublicSurfaceCopyIntegration() {
  const registryReport = createPublicSurfaceCopyRegistryReport(getPublicSurfaceCopyIntegrations());
  const uiAdapterReport = createPublicCopyUiAdapterReport();
  const copyPackageReport = createPublicLaunchCopyPackageReport(createPublicLaunchCopyPackage());
  const blockers = [
    ...registryReport.blockers,
    ...copyPackageReport.blockers,
    uiAdapterReport.ready ? undefined : {
      id: "public_surface_copy_ui_adapter_incomplete",
      surface: "all" as const,
      noticeType: "unknown" as const,
      label: "Public copy UI adapter",
      reason: "UI adapter does not expose the expected public notice types.",
      requiredAction: "Complete the notice adapter before final QA dry run.",
      riskLevel: "critical" as const
    }
  ].filter(Boolean) as typeof registryReport.blockers;
  const warnings = [...registryReport.warnings, ...copyPackageReport.warnings];

  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: blockers.length === 0 ? "ready_for_final_qa_dry_run" as const : "blocked" as const,
    registryReport,
    uiAdapterReport,
    copyPackageReport,
    blockers,
    warnings,
    draftOnly: true,
    notLegalAdvice: true,
    manualOnly: true,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}

export function createPublicSurfaceCopyIntegrationValidationReport() {
  return validatePublicSurfaceCopyIntegration();
}
