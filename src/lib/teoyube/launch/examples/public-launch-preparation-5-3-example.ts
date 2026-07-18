import { createPublicCopyIntegrationPackage, createPublicCopyIntegrationPackageReport } from "../public-copy-integration-package";
import { createPublicNoticeCardProps, getPublicNoticeCardPropsForSurface } from "../public-copy-ui-adapter";
import { createPublicQaDryRun, createPublicQaDryRunReport } from "../public-qa-dry-run-runner";
import { runPublicSurfaceCopyIntegrationAudit } from "../public-surface-copy-integration-audit";
import { createPublicSurfaceCopyRegistryReport } from "../public-surface-copy-registry";

export function runPublicLaunchPreparation53Example() {
  const registryReport = createPublicSurfaceCopyRegistryReport();
  const tigNotices = getPublicNoticeCardPropsForSurface("ai_companion");
  const privacyNotice = createPublicNoticeCardProps("privacy_notice");
  const dryRunReport = createPublicQaDryRunReport(createPublicQaDryRun());
  const packageReport = createPublicCopyIntegrationPackageReport(createPublicCopyIntegrationPackage());
  const audit = runPublicSurfaceCopyIntegrationAudit();

  return {
    registryReady: registryReport.ready,
    publicSurfaceRequirementCount: registryReport.requirementCount,
    tigNoticeTitles: tigNotices.map((notice) => notice.title),
    privacyNoticeTitle: privacyNotice.title,
    dryRunDecision: dryRunReport.decision,
    packageDecision: packageReport.decision,
    auditComplete: audit.complete,
    nextStep: audit.nextStep,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
