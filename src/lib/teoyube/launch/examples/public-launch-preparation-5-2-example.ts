import { createPublicLaunchPrivacyNoticeDraft } from "../public-launch-privacy-notice-copy";
import { createPublicLaunchTermsDraft } from "../public-launch-terms-copy";
import { createPublicLaunchConsentCopy } from "../public-launch-consent-copy";
import { createAiTigTransparencyCopy } from "../public-launch-ai-tig-transparency-copy";
import { createSensitiveInformationWarningCopy } from "../public-launch-sensitive-info-copy";
import { createPublicFeedbackNoticeCopy } from "../public-launch-feedback-notice-copy";
import { createPublicLaunchCopyPackage, createPublicLaunchCopyPackageReport } from "../public-launch-copy-package";
import { createPublicLaunchQaChecklistReport } from "../public-launch-qa-checklist";
import { createPublicLaunchQaRun, createPublicLaunchQaReport, recordPublicLaunchQaResult } from "../public-launch-qa-runner";
import { createPublicPrivacyConsentQaReport } from "../public-launch-privacy-consent-qa";
import { createPublicCopyOwnerReviewRecord, createPublicCopyOwnerReviewReport } from "../public-launch-copy-owner-review";
import { createPublicLaunchCopyQaPackage, createPublicLaunchCopyQaPackageReport } from "../public-launch-copy-qa-package";
import { runPublicLaunchPrivacyQaAudit } from "../public-launch-privacy-qa-audit";

export function runPublicLaunchPreparation52Example() {
  const privacyNotice = createPublicLaunchPrivacyNoticeDraft();
  const termsDraft = createPublicLaunchTermsDraft();
  const consentCopy = createPublicLaunchConsentCopy();
  const aiTigTransparency = createAiTigTransparencyCopy();
  const sensitiveInfoWarning = createSensitiveInformationWarningCopy();
  const feedbackNotice = createPublicFeedbackNoticeCopy();
  const copyPackage = createPublicLaunchCopyPackage();
  const copyPackageReport = createPublicLaunchCopyPackageReport(copyPackage);
  const qaChecklistReport = createPublicLaunchQaChecklistReport();
  const qaRun = recordPublicLaunchQaResult(createPublicLaunchQaRun(), {
    checkId: "privacy_terms_privacy_notice_available",
    surface: "privacy_terms",
    status: "pass",
    notes: "Draft privacy notice is available for owner/legal review."
  });
  const qaRunReport = createPublicLaunchQaReport(qaRun);
  const privacyConsentQaReport = createPublicPrivacyConsentQaReport();
  const ownerLegalReview = createPublicCopyOwnerReviewReport(createPublicCopyOwnerReviewRecord());
  const copyQaPackage = createPublicLaunchCopyQaPackage({
    copyPackageReport,
    qaChecklistReport,
    qaRunReport,
    privacyConsentQaReport,
    ownerLegalReviewReport: ownerLegalReview
  });
  const copyQaPackageReport = createPublicLaunchCopyQaPackageReport(copyQaPackage);
  const audit = runPublicLaunchPrivacyQaAudit();

  return {
    privacyNotice,
    termsDraft,
    consentCopy,
    aiTigTransparency,
    sensitiveInfoWarning,
    feedbackNotice,
    copyPackageReport,
    qaChecklistReport,
    qaRun,
    qaRunReport,
    privacyConsentQaReport,
    ownerLegalReview,
    copyQaPackageReport,
    audit
  };
}
