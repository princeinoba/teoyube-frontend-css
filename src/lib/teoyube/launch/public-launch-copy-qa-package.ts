import { createPublicLaunchCopyPackage, createPublicLaunchCopyPackageReport } from "./public-launch-copy-package";
import { createPublicLaunchQaChecklistReport } from "./public-launch-qa-checklist";
import { createPublicLaunchQaRun, createPublicLaunchQaReport } from "./public-launch-qa-runner";
import { createPublicPrivacyConsentQaReport } from "./public-launch-privacy-consent-qa";
import { createPublicCopyOwnerReviewRecord, createPublicCopyOwnerReviewReport } from "./public-launch-copy-owner-review";
import { createPublicLaunchKnownLimitationsReport } from "./public-launch-known-limitations";
import type { TeoyubePublicLaunchQaDecision } from "./public-launch-qa-contracts";

export type TeoyubePublicLaunchCopyQaPackage = {
  id: string;
  label: string;
  copyPackageReport: ReturnType<typeof createPublicLaunchCopyPackageReport>;
  qaChecklistReport: ReturnType<typeof createPublicLaunchQaChecklistReport>;
  qaRunReport: ReturnType<typeof createPublicLaunchQaReport>;
  privacyConsentQaReport: ReturnType<typeof createPublicPrivacyConsentQaReport>;
  ownerLegalReviewReport: ReturnType<typeof createPublicCopyOwnerReviewReport>;
  knownLimitationsReport: ReturnType<typeof createPublicLaunchKnownLimitationsReport>;
  nextActionRecommendation: "Public Launch Preparation 5.3 - Public Surface Copy Integration & Final QA Dry Run";
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

export function createPublicLaunchCopyQaPackage(input: Partial<TeoyubePublicLaunchCopyQaPackage> = {}): TeoyubePublicLaunchCopyQaPackage {
  return {
    id: input.id || "public_launch_copy_qa_package_5_2",
    label: input.label || "Public Launch Copy & QA Package 5.2",
    copyPackageReport: input.copyPackageReport || createPublicLaunchCopyPackageReport(createPublicLaunchCopyPackage()),
    qaChecklistReport: input.qaChecklistReport || createPublicLaunchQaChecklistReport(),
    qaRunReport: input.qaRunReport || createPublicLaunchQaReport(createPublicLaunchQaRun()),
    privacyConsentQaReport: input.privacyConsentQaReport || createPublicPrivacyConsentQaReport(),
    ownerLegalReviewReport: input.ownerLegalReviewReport || createPublicCopyOwnerReviewReport(createPublicCopyOwnerReviewRecord()),
    knownLimitationsReport: input.knownLimitationsReport || createPublicLaunchKnownLimitationsReport(),
    nextActionRecommendation: "Public Launch Preparation 5.3 - Public Surface Copy Integration & Final QA Dry Run",
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

export function getPublicLaunchCopyQaPackageBlockers(pkg: TeoyubePublicLaunchCopyQaPackage = createPublicLaunchCopyQaPackage()) {
  return [
    ...pkg.copyPackageReport.blockers,
    ...pkg.qaChecklistReport.blockers,
    ...pkg.qaRunReport.blockers,
    ...pkg.privacyConsentQaReport.blockers,
    ...pkg.ownerLegalReviewReport.blockers,
    pkg.fileWritten ? { id: "copy_qa_package_file_written", label: pkg.label, reason: "Copy/QA package must not write files.", requiredAction: "Keep package in memory.", riskLevel: "high" as const } : undefined,
    pkg.publicLaunchPerformed ? { id: "copy_qa_package_public_launch", label: pkg.label, reason: "Copy/QA package must not launch Teoyube.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    pkg.usersContacted ? { id: "copy_qa_package_users_contacted", label: pkg.label, reason: "Copy/QA package must not contact users.", requiredAction: "Keep user contact outside code.", riskLevel: "critical" as const } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "copy_qa_package_feedback_collected", label: pkg.label, reason: "Copy/QA package must not collect feedback automatically.", requiredAction: "Use manual QA only.", riskLevel: "critical" as const } : undefined,
    pkg.analyticsSent ? { id: "copy_qa_package_analytics_sent", label: pkg.label, reason: "Copy/QA package must not send analytics.", requiredAction: "Keep analytics disconnected.", riskLevel: "critical" as const } : undefined,
    pkg.databaseWritten ? { id: "copy_qa_package_database_written", label: pkg.label, reason: "Copy/QA package must not write databases.", requiredAction: "Keep persistence disconnected.", riskLevel: "critical" as const } : undefined,
    pkg.externalServicesCalled ? { id: "copy_qa_package_external_services", label: pkg.label, reason: "Copy/QA package must not call external services.", requiredAction: "Keep external services disabled.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPublicLaunchCopyQaPackageWarnings(pkg: TeoyubePublicLaunchCopyQaPackage = createPublicLaunchCopyQaPackage()) {
  return [
    ...pkg.copyPackageReport.warnings,
    ...pkg.qaChecklistReport.warnings,
    ...pkg.qaRunReport.warnings,
    ...pkg.privacyConsentQaReport.warnings,
    ...pkg.ownerLegalReviewReport.warnings
  ];
}

export function validatePublicLaunchCopyQaPackage(pkg: TeoyubePublicLaunchCopyQaPackage = createPublicLaunchCopyQaPackage()) {
  const blockers = getPublicLaunchCopyQaPackageBlockers(pkg);
  const warnings = getPublicLaunchCopyQaPackageWarnings(pkg);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createPublicLaunchCopyQaPackageDecision(pkg: TeoyubePublicLaunchCopyQaPackage = createPublicLaunchCopyQaPackage()): TeoyubePublicLaunchQaDecision {
  const validation = validatePublicLaunchCopyQaPackage(pkg);
  if (!validation.valid) return "blocked";
  if (pkg.privacyConsentQaReport.blockers.length > 0) return "needs_privacy_copy_review";
  if (validation.warnings.length > 0) return "ready_after_owner_review";
  return "ready_for_public_qa";
}

export function createPublicLaunchCopyQaPackageReport(pkg: TeoyubePublicLaunchCopyQaPackage = createPublicLaunchCopyQaPackage()) {
  const validation = validatePublicLaunchCopyQaPackage(pkg);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createPublicLaunchCopyQaPackageDecision(pkg),
    package: pkg,
    blockers: validation.blockers,
    warnings: validation.warnings,
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
