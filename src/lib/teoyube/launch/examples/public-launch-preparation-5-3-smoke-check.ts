import { createPublicCopyAccessibilityQaReport } from "../public-copy-accessibility-qa";
import { createPublicCopyIntegrationPackage, createPublicCopyIntegrationPackageReport } from "../public-copy-integration-package";
import { createPublicCopyUiAdapterReport, createPublicNoticeCardProps, getPublicNoticeCardPropsForSurface } from "../public-copy-ui-adapter";
import { createPublicQaDryRun, createPublicQaDryRunReport } from "../public-qa-dry-run-runner";
import { runPublicSurfaceCopyIntegrationAudit } from "../public-surface-copy-integration-audit";
import { createPublicSurfaceCopyOwnerReviewRecord, createPublicSurfaceCopyOwnerReviewReport } from "../public-surface-copy-owner-review";
import { createPublicSurfaceCopyRegistryReport, getPublicSurfaceCopyIntegrations, getPublicSurfaceCopyRequirements } from "../public-surface-copy-registry";
import { createPublicSurfaceFinalQaChecklistReport } from "../public-surface-final-qa-checklist";
import { validatePublicSurfaceCopyIntegration } from "../public-surface-copy-integration-validator";

export function runPublicLaunchPreparation53SmokeCheck() {
  const integrations = getPublicSurfaceCopyIntegrations();
  const requirements = getPublicSurfaceCopyRequirements();
  const registryReport = createPublicSurfaceCopyRegistryReport(integrations);
  const privacyNotice = createPublicNoticeCardProps("privacy_notice");
  const termsNotice = createPublicNoticeCardProps("terms_of_use");
  const consentNotice = createPublicNoticeCardProps("consent_notice");
  const aiNotice = createPublicNoticeCardProps("ai_notice");
  const sensitiveNotice = createPublicNoticeCardProps("sensitive_information_warning");
  const feedbackNotice = createPublicNoticeCardProps("feedback_notice");
  const limitationsNotice = createPublicNoticeCardProps("public_launch_limitation_notice");
  const tigNotices = getPublicNoticeCardPropsForSurface("ai_companion");
  const uiAdapterReport = createPublicCopyUiAdapterReport();
  const validation = validatePublicSurfaceCopyIntegration();
  const finalQaChecklist = createPublicSurfaceFinalQaChecklistReport();
  const dryRun = createPublicQaDryRun();
  const dryRunReport = createPublicQaDryRunReport(dryRun);
  const accessibility = createPublicCopyAccessibilityQaReport();
  const falseLegalApproval = createPublicSurfaceCopyOwnerReviewReport(createPublicSurfaceCopyOwnerReviewRecord({
    legalApprovalRecorded: false,
    legalFinalApprovalClaimed: true
  }));
  const ownerReview = createPublicSurfaceCopyOwnerReviewReport(createPublicSurfaceCopyOwnerReviewRecord());
  const pkg = createPublicCopyIntegrationPackage({
    registryReport,
    uiAdapterReport,
    validationReport: validation,
    finalQaChecklistReport: finalQaChecklist,
    dryRunReport,
    accessibilityQaReport: accessibility,
    ownerReviewReport: ownerReview
  });
  const packageReport = createPublicCopyIntegrationPackageReport(pkg);
  const audit = runPublicSurfaceCopyIntegrationAudit();

  const checks = [
    integrations.length >= 10,
    requirements.length >= 20 && requirements.every((entry) => entry.visibility === "visible" && entry.status === "ready"),
    registryReport.ready && registryReport.visibleNoticeCount === registryReport.requirementCount,
    privacyNotice.notLegalAdvice && privacyNotice.sections.length >= 8,
    termsNotice.notLegalAdvice && termsNotice.sections.some((entry) => entry.toLowerCase().includes("not claim divine certainty")),
    consentNotice.sections.some((entry) => entry.toLowerCase().includes("session-only")),
    aiNotice.sections.some((entry) => entry.toLowerCase().includes("not divine certainty")),
    sensitiveNotice.sections.some((entry) => entry.toLowerCase().includes("emergency")),
    feedbackNotice.sections.some((entry) => entry.toLowerCase().includes("not automatically used for hidden personalization")),
    limitationsNotice.sections.some((entry) => entry.toLowerCase().includes("not public launch execution")),
    tigNotices.length >= 3 && tigNotices.some((entry) => entry.noticeType === "sensitive_information_warning"),
    uiAdapterReport.ready && uiAdapterReport.adaptedNoticeTypes.length >= 8,
    validation.ready && validation.noPublicLaunchPerformed && validation.noExternalWrite,
    finalQaChecklist.ready && finalQaChecklist.checkCount >= 14,
    dryRunReport.ready && dryRun.inMemoryOnly && dryRunReport.noExternalWrite,
    accessibility.ready && accessibility.passCount === accessibility.checklist.length,
    !falseLegalApproval.ready && falseLegalApproval.blockers.some((entry) => entry.id === "public_surface_copy_owner_review_false_legal_approval"),
    ownerReview.ready && ownerReview.noLegalFinalApprovalClaimedWithoutRecord,
    packageReport.ready && packageReport.nextActionRecommendation.includes("5.4"),
    audit.complete && audit.completionPercentage === 100 && audit.nextStep.includes("5.4"),
    packageReport.noPublicLaunchPerformed && packageReport.noUsersContacted && packageReport.noFeedbackCollectedAutomatically,
    packageReport.noExternalAnalyticsSent && packageReport.noProductionPersistenceEnabled && packageReport.noLiveAiOrchestrationEnabled
  ];

  return {
    valid: checks.every(Boolean),
    checkCount: checks.length,
    passedCheckCount: checks.filter(Boolean).length,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noDatabaseExternalApisAnalyticsProviderServiceWorkerLocalStorageCookiesIndexedDbOrFileWritesRequired: true,
    publicSurfaceCopyDecision: registryReport.decision,
    finalQaDryRunDecision: dryRunReport.decision,
    packageDecision: packageReport.decision,
    audit,
    generatedAt: new Date().toISOString()
  };
}
