import { createPublicLaunchPrivacyNoticeDraft, createPrivacyNoticeCopyReport } from "./public-launch-privacy-notice-copy";
import { createPublicLaunchTermsDraft, createTermsCopyReport } from "./public-launch-terms-copy";
import { createPublicLaunchConsentCopy, createConsentCopyReport } from "./public-launch-consent-copy";
import { createAiTigTransparencyCopy, createAiTigTransparencyCopyReport } from "./public-launch-ai-tig-transparency-copy";
import { createSensitiveInformationWarningCopy, createSensitiveInfoCopyReport } from "./public-launch-sensitive-info-copy";
import { createPublicFeedbackNoticeCopy, createFeedbackNoticeCopyReport } from "./public-launch-feedback-notice-copy";
import { createPublicLaunchKnownLimitationsReport } from "./public-launch-known-limitations";

export type TeoyubePublicLaunchCopyPackage = {
  id: string;
  label: string;
  privacyNoticeReport: ReturnType<typeof createPrivacyNoticeCopyReport>;
  termsCopyReport: ReturnType<typeof createTermsCopyReport>;
  consentCopyReport: ReturnType<typeof createConsentCopyReport>;
  aiTigTransparencyReport: ReturnType<typeof createAiTigTransparencyCopyReport>;
  sensitiveInfoReport: ReturnType<typeof createSensitiveInfoCopyReport>;
  feedbackNoticeReport: ReturnType<typeof createFeedbackNoticeCopyReport>;
  knownLimitationsReport: ReturnType<typeof createPublicLaunchKnownLimitationsReport>;
  ownerReviewStatus: "not_reviewed" | "ready_for_review" | "accepted" | "blocked";
  legalReviewStatus: "not_reviewed" | "ready_for_review" | "accepted" | "blocked";
  draftOnly: true;
  notLegalAdvice: true;
  legalFinalApprovalClaimed: false;
  manualOnly: true;
  inMemoryOnly: true;
  fileWritten: false;
  publicLaunchPerformed: false;
  usersContacted: false;
  feedbackCollectedAutomatically: false;
  generatedAt: string;
};

export function createPublicLaunchCopyPackage(): TeoyubePublicLaunchCopyPackage {
  return {
    id: "public_launch_copy_package_5_2",
    label: "Public Launch Copy Package 5.2",
    privacyNoticeReport: createPrivacyNoticeCopyReport(createPublicLaunchPrivacyNoticeDraft()),
    termsCopyReport: createTermsCopyReport(createPublicLaunchTermsDraft()),
    consentCopyReport: createConsentCopyReport(createPublicLaunchConsentCopy()),
    aiTigTransparencyReport: createAiTigTransparencyCopyReport(createAiTigTransparencyCopy()),
    sensitiveInfoReport: createSensitiveInfoCopyReport(createSensitiveInformationWarningCopy()),
    feedbackNoticeReport: createFeedbackNoticeCopyReport(createPublicFeedbackNoticeCopy()),
    knownLimitationsReport: createPublicLaunchKnownLimitationsReport(),
    ownerReviewStatus: "ready_for_review",
    legalReviewStatus: "ready_for_review",
    draftOnly: true,
    notLegalAdvice: true,
    legalFinalApprovalClaimed: false,
    manualOnly: true,
    inMemoryOnly: true,
    fileWritten: false,
    publicLaunchPerformed: false,
    usersContacted: false,
    feedbackCollectedAutomatically: false,
    generatedAt: new Date().toISOString()
  };
}

export function getPublicLaunchCopyPackageBlockers(pkg: TeoyubePublicLaunchCopyPackage = createPublicLaunchCopyPackage()) {
  return [
    ...pkg.privacyNoticeReport.blockers,
    ...pkg.termsCopyReport.blockers,
    ...pkg.consentCopyReport.blockers,
    ...pkg.aiTigTransparencyReport.blockers,
    ...pkg.sensitiveInfoReport.blockers,
    ...pkg.feedbackNoticeReport.blockers,
    pkg.legalFinalApprovalClaimed ? { id: "copy_package_legal_final_claimed", label: pkg.label, reason: "5.2 must not claim final legal approval unless explicitly recorded by appropriate counsel.", requiredAction: "Remove legal-final approval claim.", riskLevel: "critical" as const } : undefined,
    pkg.fileWritten ? { id: "copy_package_file_written", label: pkg.label, reason: "Copy package must remain in memory.", requiredAction: "Do not write copy package output automatically.", riskLevel: "high" as const } : undefined,
    pkg.publicLaunchPerformed ? { id: "copy_package_public_launch", label: pkg.label, reason: "Copy package must not publish or launch Teoyube.", requiredAction: "Remove launch action.", riskLevel: "critical" as const } : undefined,
    pkg.usersContacted ? { id: "copy_package_users_contacted", label: pkg.label, reason: "Copy package must not contact users.", requiredAction: "Keep user contact outside code.", riskLevel: "critical" as const } : undefined,
    pkg.feedbackCollectedAutomatically ? { id: "copy_package_feedback_collected", label: pkg.label, reason: "Copy package must not collect feedback automatically.", requiredAction: "Use manual review only.", riskLevel: "critical" as const } : undefined
  ].filter(Boolean) as Array<{ id: string; label: string; reason: string; requiredAction: string; riskLevel: "high" | "critical" }>;
}

export function getPublicLaunchCopyPackageWarnings(pkg: TeoyubePublicLaunchCopyPackage = createPublicLaunchCopyPackage()) {
  return [
    ...pkg.privacyNoticeReport.warnings,
    ...pkg.termsCopyReport.warnings,
    ...pkg.consentCopyReport.warnings,
    ...pkg.aiTigTransparencyReport.warnings,
    ...pkg.sensitiveInfoReport.warnings,
    ...pkg.feedbackNoticeReport.warnings,
    { id: "copy_package_owner_legal_review_pending", label: pkg.label, message: "Copy is draft-ready and still requires owner/legal review before public launch.", recommendedAction: "Complete owner/legal review before publishing copy.", riskLevel: "medium" as const }
  ];
}

export function validatePublicLaunchCopyPackage(pkg: TeoyubePublicLaunchCopyPackage = createPublicLaunchCopyPackage()) {
  const blockers = getPublicLaunchCopyPackageBlockers(pkg);
  const warnings = getPublicLaunchCopyPackageWarnings(pkg);
  return { valid: blockers.length === 0, ready: blockers.length === 0, blockers, warnings };
}

export function createPublicLaunchCopyPackageDecision(pkg: TeoyubePublicLaunchCopyPackage = createPublicLaunchCopyPackage()) {
  const validation = validatePublicLaunchCopyPackage(pkg);
  if (!validation.valid) return "blocked" as const;
  if (validation.warnings.length > 0) return "ready_after_owner_review" as const;
  return "ready_for_public_qa" as const;
}

export function createPublicLaunchCopyPackageReport(pkg: TeoyubePublicLaunchCopyPackage = createPublicLaunchCopyPackage()) {
  const validation = validatePublicLaunchCopyPackage(pkg);
  return {
    valid: validation.valid,
    ready: validation.ready,
    decision: createPublicLaunchCopyPackageDecision(pkg),
    package: pkg,
    blockers: validation.blockers,
    warnings: validation.warnings,
    draftOnly: true,
    notLegalAdvice: true,
    noLegalFinalApprovalClaimed: true,
    inMemoryOnly: true,
    noPublicLaunchPerformed: true,
    noUsersContacted: true,
    noFeedbackCollectedAutomatically: true,
    noExternalWrite: true,
    generatedAt: new Date().toISOString()
  };
}
