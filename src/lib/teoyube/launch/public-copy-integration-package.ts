import { createPublicCopyAccessibilityQaReport } from "./public-copy-accessibility-qa";
import { createPublicCopyUiAdapterReport } from "./public-copy-ui-adapter";
import { createPublicQaDryRun, createPublicQaDryRunReport } from "./public-qa-dry-run-runner";
import { createPublicSurfaceCopyOwnerReviewRecord, createPublicSurfaceCopyOwnerReviewReport } from "./public-surface-copy-owner-review";
import { createPublicSurfaceCopyRegistryReport } from "./public-surface-copy-registry";
import { createPublicSurfaceFinalQaChecklistReport } from "./public-surface-final-qa-checklist";
import { validatePublicSurfaceCopyIntegration } from "./public-surface-copy-integration-validator";

export type TeoyubePublicCopyIntegrationPackage = {
  id: string;
  label: string;
  registryReport: ReturnType<typeof createPublicSurfaceCopyRegistryReport>;
  uiAdapterReport: ReturnType<typeof createPublicCopyUiAdapterReport>;
  validationReport: ReturnType<typeof validatePublicSurfaceCopyIntegration>;
  finalQaChecklistReport: ReturnType<typeof createPublicSurfaceFinalQaChecklistReport>;
  dryRunReport: ReturnType<typeof createPublicQaDryRunReport>;
  accessibilityQaReport: ReturnType<typeof createPublicCopyAccessibilityQaReport>;
  ownerReviewReport: ReturnType<typeof createPublicSurfaceCopyOwnerReviewReport>;
  nextActionRecommendation: "Public Launch Preparation 5.4 - Public Launch Go/No-Go Package";
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  publicLaunchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  analyticsSent: false;
  databaseWritten: false;
  externalServicesCalled: false;
  generatedAt: string;
};

export function createPublicCopyIntegrationPackage(
  input: Partial<TeoyubePublicCopyIntegrationPackage> = {}
): TeoyubePublicCopyIntegrationPackage {
  return {
    id: input.id || "public_copy_integration_package_5_3",
    label: input.label || "Public Surface Copy Integration Package 5.3",
    registryReport: input.registryReport || createPublicSurfaceCopyRegistryReport(),
    uiAdapterReport: input.uiAdapterReport || createPublicCopyUiAdapterReport(),
    validationReport: input.validationReport || validatePublicSurfaceCopyIntegration(),
    finalQaChecklistReport: input.finalQaChecklistReport || createPublicSurfaceFinalQaChecklistReport(),
    dryRunReport: input.dryRunReport || createPublicQaDryRunReport(createPublicQaDryRun()),
    accessibilityQaReport: input.accessibilityQaReport || createPublicCopyAccessibilityQaReport(),
    ownerReviewReport: input.ownerReviewReport || createPublicSurfaceCopyOwnerReviewReport(createPublicSurfaceCopyOwnerReviewRecord()),
    nextActionRecommendation: "Public Launch Preparation 5.4 - Public Launch Go/No-Go Package",
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    publicLaunchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    analyticsSent: false,
    databaseWritten: false,
    externalServicesCalled: false,
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function getPublicCopyIntegrationPackageBlockers(
  pkg: TeoyubePublicCopyIntegrationPackage = createPublicCopyIntegrationPackage()
) {
  return [
    ...pkg.registryReport.blockers,
    ...pkg.validationReport.blockers,
    ...pkg.dryRunReport.blockers,
    ...pkg.accessibilityQaReport.blockers,
    ...pkg.ownerReviewReport.blockers,
    pkg.fileWritten ? { id: "public_copy_integration_package_file_written", surface: "all" as const, noticeType: "unknown" as const, label: pkg.label, reason: "Integration package must not write files.", requiredAction: "Keep package in memory.", riskLevel: "high" as const } : undefined,
    pkg.publicLaunchPerformed ? { id: "public_copy_integration_package_launch", surface: "all" as const, noticeType: "unknown" as const, label: pkg.label, reason: "Integration package must not launch Teoyube.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    pkg.usersContacted ? { id: "public_copy_integration_package_users_contacted", surface: "all" as const, noticeType: "unknown" as const, label: pkg.label, reason: "Integration package must not contact users.", requiredAction: "Keep user contact outside code.", riskLevel: "critical" as const } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "public_copy_integration_package_feedback_collected", surface: "all" as const, noticeType: "unknown" as const, label: pkg.label, reason: "Integration package must not collect feedback automatically.", requiredAction: "Use manual QA only.", riskLevel: "critical" as const } : undefined,
    pkg.analyticsSent ? { id: "public_copy_integration_package_analytics_sent", surface: "all" as const, noticeType: "unknown" as const, label: pkg.label, reason: "Integration package must not send analytics.", requiredAction: "Keep analytics disconnected.", riskLevel: "critical" as const } : undefined,
    pkg.databaseWritten ? { id: "public_copy_integration_package_database_written", surface: "all" as const, noticeType: "unknown" as const, label: pkg.label, reason: "Integration package must not write databases.", requiredAction: "Keep persistence disconnected.", riskLevel: "critical" as const } : undefined,
    pkg.externalServicesCalled ? { id: "public_copy_integration_package_external_services", surface: "all" as const, noticeType: "unknown" as const, label: pkg.label, reason: "Integration package must not call external services.", requiredAction: "Keep providers disconnected.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as typeof pkg.registryReport.blockers;
}

export function getPublicCopyIntegrationPackageWarnings(
  pkg: TeoyubePublicCopyIntegrationPackage = createPublicCopyIntegrationPackage()
) {
  return [
    ...pkg.registryReport.warnings,
    ...pkg.validationReport.warnings,
    ...pkg.dryRunReport.warnings,
    ...pkg.accessibilityQaReport.warnings,
    ...pkg.ownerReviewReport.warnings
  ];
}

export function createPublicCopyIntegrationPackageReport(
  pkg: TeoyubePublicCopyIntegrationPackage = createPublicCopyIntegrationPackage()
) {
  const blockers = getPublicCopyIntegrationPackageBlockers(pkg);
  const warnings = getPublicCopyIntegrationPackageWarnings(pkg);
  return {
    valid: blockers.length === 0,
    ready: blockers.length === 0,
    decision: blockers.length > 0 ? "blocked" as const : "ready_for_final_qa_dry_run" as const,
    package: pkg,
    blockers,
    warnings,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalAnalyticsSent: true,
    noProductionPersistenceEnabled: true,
    noLiveAiOrchestrationEnabled: true,
    noExternalWrite: true,
    nextActionRecommendation: pkg.nextActionRecommendation,
    generatedAt: new Date().toISOString()
  };
}
