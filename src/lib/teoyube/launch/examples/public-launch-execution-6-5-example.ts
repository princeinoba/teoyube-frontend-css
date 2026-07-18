import { createPostLaunchKnownLimitationsReport } from "../post-launch-known-limitations";
import { createPostLaunchOwnerReadinessRecord, createPostLaunchOwnerReadinessReport } from "../post-launch-owner-readiness-review";
import { createPostLaunchReadinessCriteriaReport } from "../post-launch-readiness-criteria";
import { createPostLaunchReadinessHandoffReport } from "../post-launch-readiness-handoff";
import { createPostLaunchReadinessPackage, createPostLaunchReadinessPackageReport } from "../post-launch-readiness-package";
import { createPostLaunchRiskRegister, createPostLaunchRiskRegisterReport } from "../post-launch-risk-register";
import { runPublicLaunchCompletionAudit } from "../public-launch-completion-audit";
import { createPublicLaunchCompletionReport, runPublicLaunchCompletionReview } from "../public-launch-completion-review";
import { createPublicLaunchFeedbackSummaryReport } from "../public-launch-feedback-summary";
import { createPublicLaunchFinalSafetyPrivacyReport, runPublicLaunchFinalSafetyPrivacyReview } from "../public-launch-final-safety-privacy-review";
import { createPublicLaunchIssueClosureReport } from "../public-launch-issue-closure";
import { createPublicLaunchStabilityCertificationReport, runPublicLaunchStabilityCertification } from "../public-launch-stability-certification";

export function runPublicLaunchExecution65Example() {
  const completionReport = runPublicLaunchCompletionReview();
  const feedbackSummaryReport = createPublicLaunchFeedbackSummaryReport();
  const issueClosureReport = createPublicLaunchIssueClosureReport();
  const stabilityCertificationReport = runPublicLaunchStabilityCertification({
    feedbackSummaryReport,
    issueClosureReport
  });
  const finalSafetyPrivacyReport = runPublicLaunchFinalSafetyPrivacyReview();
  const readinessCriteriaReport = createPostLaunchReadinessCriteriaReport({
    completionReport: completionReport as ReturnType<typeof createPublicLaunchCompletionReport>,
    feedbackSummaryReport,
    issueClosureReport,
    stabilityCertificationReport: stabilityCertificationReport as ReturnType<typeof createPublicLaunchStabilityCertificationReport>,
    finalSafetyPrivacyReport: finalSafetyPrivacyReport as ReturnType<typeof createPublicLaunchFinalSafetyPrivacyReport>
  });
  const riskRegister = createPostLaunchRiskRegister();
  const riskRegisterReport = createPostLaunchRiskRegisterReport(riskRegister);
  const knownLimitationsReport = createPostLaunchKnownLimitationsReport();
  const ownerReadinessReport = createPostLaunchOwnerReadinessReport(createPostLaunchOwnerReadinessRecord());
  const readinessPackage = createPostLaunchReadinessPackage({
    completionReport,
    feedbackSummaryReport,
    issueClosureReport,
    stabilityCertificationReport,
    finalSafetyPrivacyReport,
    readinessCriteriaReport,
    risks: riskRegisterReport.risks,
    ownerReview: ownerReadinessReport
  });
  const readinessPackageReport = createPostLaunchReadinessPackageReport(readinessPackage);
  const readinessHandoffReport = createPostLaunchReadinessHandoffReport();
  const audit = runPublicLaunchCompletionAudit();

  return {
    completionReport,
    feedbackSummaryReport,
    issueClosureReport,
    stabilityCertificationReport,
    finalSafetyPrivacyReport,
    readinessCriteriaReport,
    readinessPackage,
    readinessPackageReport,
    riskRegister,
    riskRegisterReport,
    knownLimitationsReport,
    ownerReadinessReport,
    readinessHandoffReport,
    audit
  };
}
