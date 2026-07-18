import { createPublicLaunchPrivacyNoticeDraft, createPrivacyNoticeCopyReport } from "../public-launch-privacy-notice-copy";
import { createPublicLaunchTermsDraft, createTermsCopyReport } from "../public-launch-terms-copy";
import { createPublicLaunchConsentCopy, createConsentCopyReport } from "../public-launch-consent-copy";
import { createAiTigTransparencyCopy, createAiTigTransparencyCopyReport } from "../public-launch-ai-tig-transparency-copy";
import { createSensitiveInformationWarningCopy, createSensitiveInfoCopyReport } from "../public-launch-sensitive-info-copy";
import { createPublicFeedbackNoticeCopy, createFeedbackNoticeCopyReport } from "../public-launch-feedback-notice-copy";
import { createPublicLaunchCopyPackage, createPublicLaunchCopyPackageReport } from "../public-launch-copy-package";
import { createPublicLaunchQaChecklistReport, PUBLIC_LAUNCH_QA_SURFACES } from "../public-launch-qa-checklist";
import { createPublicLaunchQaRun, createPublicLaunchQaReport, recordPublicLaunchQaResult } from "../public-launch-qa-runner";
import { createPublicPrivacyConsentQaReport, validatePublicConsentCopyQa } from "../public-launch-privacy-consent-qa";
import { createPublicCopyOwnerReviewRecord, createPublicCopyOwnerReviewReport } from "../public-launch-copy-owner-review";
import { createPublicLaunchCopyQaPackage, createPublicLaunchCopyQaPackageReport } from "../public-launch-copy-qa-package";
import { runPublicLaunchPrivacyQaAudit } from "../public-launch-privacy-qa-audit";

export function runPublicLaunchPreparation52SmokeCheck() {
  const privacyDraft = createPublicLaunchPrivacyNoticeDraft();
  const privacyReport = createPrivacyNoticeCopyReport(privacyDraft);
  const termsDraft = createPublicLaunchTermsDraft();
  const termsReport = createTermsCopyReport(termsDraft);
  const consentCopy = createPublicLaunchConsentCopy();
  const consentReport = createConsentCopyReport(consentCopy);
  const aiTigCopy = createAiTigTransparencyCopy();
  const aiTigReport = createAiTigTransparencyCopyReport(aiTigCopy);
  const sensitiveCopy = createSensitiveInformationWarningCopy();
  const sensitiveReport = createSensitiveInfoCopyReport(sensitiveCopy);
  const feedbackCopy = createPublicFeedbackNoticeCopy();
  const feedbackReport = createFeedbackNoticeCopyReport(feedbackCopy);
  const copyPackage = createPublicLaunchCopyPackage();
  const copyPackageReport = createPublicLaunchCopyPackageReport(copyPackage);
  const qaChecklistReport = createPublicLaunchQaChecklistReport();
  const qaRun = recordPublicLaunchQaResult(createPublicLaunchQaRun(), {
    checkId: "consent_controls_personalization_consent",
    surface: "consent_controls",
    status: "pass",
    notes: "Consent copy is available where personalization appears."
  });
  const qaRunReport = createPublicLaunchQaReport(qaRun);
  const missingConsentQa = createPublicPrivacyConsentQaReport({ consentCopyPresentWherePersonalizationAppears: false });
  const privacyConsentQa = createPublicPrivacyConsentQaReport();
  const unrecordedLegalClaim = createPublicCopyOwnerReviewReport(createPublicCopyOwnerReviewRecord({
    legalApprovalRecorded: false,
    legalFinalApprovalClaimed: true
  }));
  const ownerLegalReview = createPublicCopyOwnerReviewReport(createPublicCopyOwnerReviewRecord());
  const copyQaPackage = createPublicLaunchCopyQaPackage({
    copyPackageReport,
    qaChecklistReport,
    qaRunReport,
    privacyConsentQaReport: privacyConsentQa,
    ownerLegalReviewReport: ownerLegalReview
  });
  const copyQaPackageReport = createPublicLaunchCopyQaPackageReport(copyQaPackage);
  const audit = runPublicLaunchPrivacyQaAudit();

  const checks = [
    privacyReport.ready && privacyDraft.sections.length >= 8,
    termsReport.ready && termsDraft.draftOnly && !termsDraft.legalFinalApprovalClaimed && !termsDraft.claimsDivineCertainty,
    consentReport.ready && consentCopy.productionPersistenceConnected === false && consentCopy.externalAnalyticsConnected === false,
    aiTigReport.ready && aiTigCopy.confidenceLabel.toLowerCase().includes("not divine certainty"),
    sensitiveReport.ready && sensitiveCopy.emergencyDisclaimer.toLowerCase().includes("emergency"),
    feedbackReport.ready && feedbackCopy.notPersonalizationByDefault.toLowerCase().includes("not automatically used for hidden personalization"),
    copyPackageReport.ready && copyPackage.inMemoryOnly && copyPackageReport.noLegalFinalApprovalClaimed,
    qaChecklistReport.ready && qaChecklistReport.surfaceCount === PUBLIC_LAUNCH_QA_SURFACES.length && qaChecklistReport.checkCount >= PUBLIC_LAUNCH_QA_SURFACES.length * 10,
    qaRunReport.ready && qaRun.inMemoryOnly && qaRunReport.noExternalWrite,
    !validatePublicConsentCopyQa({ consentCopyPresentWherePersonalizationAppears: false }) && !missingConsentQa.ready && missingConsentQa.blockers.length >= 1,
    !unrecordedLegalClaim.ready && unrecordedLegalClaim.blockers.some((entry) => entry.id === "copy_owner_review_false_legal_approval"),
    ownerLegalReview.ready && ownerLegalReview.noLegalFinalApprovalClaimedWithoutRecord,
    copyQaPackageReport.ready && copyQaPackageReport.noPublicLaunchPerformed && copyQaPackageReport.noExternalWrite,
    audit.complete && audit.completionPercentage === 100 && audit.nextStep.includes("5.3"),
    !copyPackage.publicLaunchPerformed && !copyPackage.usersContacted && !copyPackage.feedbackCollectedAutomatically,
    copyQaPackageReport.noExternalAnalyticsSent && copyQaPackageReport.noProductionPersistenceEnabled && copyQaPackageReport.noLiveAiOrchestrationEnabled,
    copyQaPackageReport.noPublicLaunchPerformed && copyQaPackageReport.noUsersContacted && copyQaPackageReport.noFeedbackCollectedAutomatically
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
    privacyTermsConsentReadinessDecision: copyPackageReport.decision,
    publicQaReadinessDecision: copyQaPackageReport.decision,
    audit,
    generatedAt: new Date().toISOString()
  };
}
